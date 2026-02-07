import json
import re
from typing import Any, List
import google.generativeai as genai
from app.agents.base import BaseAgent
from app.models.trip import TripParameters, TripPreferences
from app.core.config import settings
from app.integrations.external import search_places_text

class DreamInterpreterAgent(BaseAgent):
    def __init__(self, api_key: str):
        super().__init__(name="Dream Interpreter")
        genai.configure(api_key=api_key)
        self.model_instance = genai.GenerativeModel('gemini-pro')

    async def process(self, input_data: str) -> TripParameters:
        """
        Parses natural language input into structured trip parameters.
        """
        prompt = f"""
        You are a Dream Interpreter Agent for a travel application.
        Your goal is to extract structured travel parameters from the user's natural language description.
        
        User Input: "{input_data}"
        
        Please extract the following information and return it as a JSON object:
        - destination (string, required). Capitalize properly (e.g., "bali" -> "Bali", "new york" -> "New York"). If the input is vague (e.g., "beach trip"), infer a popular destination or set to "Unknown".
        - origin (string, optional). Where the trip starts from (e.g., "from London").
        - duration_days (integer, default to 7 if not specified). Handle terms like "1-week" (7), "2 weeks" (14), "weekend" (3), "10 days" (10).
        - budget_total (float, optional). CRITICAL: If user says "under $500", "max 1000", etc., extract the number here.
        - currency (string, default "USD")
        - travelers (integer, default 1)
        - start_date (string, YYYY-MM-DD, optional)
        - preferences:
            - interests (list of strings). Infer from keywords (e.g., "relaxing" -> ["Relaxation"], "hiking" -> ["Nature", "Adventure"]).
            - budget_range (string, e.g., "budget", "moderate", "luxury"). Infer from context if not explicit.
            - travel_style (string, e.g., "relaxed", "adventurous", "balanced").
            - dietary_restrictions (list of strings)
            
        CRITICAL:
        - If the destination is missing or ambiguous, try to infer it. If absolutely impossible, set it to "Unknown".
        - Ensure all strings are properly capitalized.
        - Return ONLY the JSON object.
        """
        
        try:
            response = self.model_instance.generate_content(prompt)
            
            # Clean up response if it contains markdown code blocks
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            
            data = json.loads(text)
            
            # Construct TripParameters
            prefs_data = data.get("preferences", {})
            preferences = TripPreferences(
                interests=prefs_data.get("interests", []),
                budget_range=prefs_data.get("budget_range"),
                travel_style=prefs_data.get("travel_style"),
                dietary_restrictions=prefs_data.get("dietary_restrictions", [])
            )
            
            tp = TripParameters(
                destination=data.get("destination", "Unknown"),
                duration_days=data.get("duration_days", 7),
                budget_total=data.get("budget_total"),
                currency=data.get("currency", "USD"),
                travelers=data.get("travelers", 1),
                start_date=data.get("start_date"),
                origin=data.get("origin"),
                preferences=preferences,
                original_request=input_data
            )
            return self._normalize(input_data, tp)
            
        except Exception as e:
            print(f"Error in DreamInterpreterAgent: {e}")
            print("Falling back to heuristic parsing.")
            tp = self._fallback_process(input_data)
            return self._normalize(input_data, tp)

    def _fallback_process(self, input_data: str) -> TripParameters:
        """
        Fallback method to extract basic parameters when AI fails.
        """
        import re
        
        # Simple heuristic to find destination
        words = input_data.split()
        destination = "Unknown Destination"
        
        # Try to find "in [Destination]" or "to [Destination]"
        for i, word in enumerate(words):
            if word.lower() in ["in", "to"] and i + 1 < len(words):
                potential_dest = words[i+1]
                # Look ahead for multi-word destinations (e.g. New York), allow lowercase too
                j = i + 2
                while j < len(words) and (words[j][0].isupper() or words[j].lower() not in ["for", "with", "and", "days", "weeks", "day", "week", "under", "below", "max"]):
                    potential_dest += " " + words[j]
                    j += 1
                
                if potential_dest:
                    destination = potential_dest.strip(",.!?").title()
                    break
        
        if destination == "Unknown Destination":
            cap_words = [w.strip(",.!?") for w in words if w[0].isupper() and len(w) > 2]
            if cap_words:
                destination = max(cap_words, key=len)

        # Extract budget using regex
        budget_total = None
        budget_match = re.search(r'\$\s?(\d+(?:,\d{3})*)', input_data)
        if budget_match:
            budget_total = float(budget_match.group(1).replace(',', ''))

        return TripParameters(
            destination=destination,
            duration_days=7, 
            budget_total=budget_total,
            currency="USD",
            travelers=1,
            preferences=TripPreferences(
                interests=["General Exploration"],
                budget_range="budget" if budget_total and budget_total < 1000 else "moderate",
                travel_style="relaxed"
            ),
            original_request=input_data
        )

    def _normalize(self, original_text: str, params: TripParameters) -> TripParameters:
        warnings: List[str] = []

        dest = params.destination or "Unknown"
        cleaned = re.sub(r"\$\s?\d+(?:,\d{3})*(?:\.\d+)?", "", dest, flags=re.I)
        cleaned = re.sub(r"\b(under|below|max|upto|up to|budget|cheap|affordable|usd|eur|gbp|dollars)\b", "", cleaned, flags=re.I)
        cleaned = cleaned.strip()
        if not cleaned:
            cleaned = "Unknown"
        if cleaned != dest:
            warnings.append("destination_normalized")
        if cleaned.lower() == "unknown":
            m = re.search(r"\bto\s+([A-Za-z ]+?)(?:\s+(under|for|with|on|in|by|from)|\s+\d|$)", original_text, flags=re.I)
            if m:
                cleaned = m.group(1).strip().title()
        try:
            res = search_places_text(cleaned)
            if res:
                name = res[0].get("name") or cleaned
                if name and name != cleaned:
                    cleaned = name
                    warnings.append("destination_validated")
        except Exception:
            pass
        params.destination = cleaned

        if params.budget_total is None:
            m = re.search(r"(?:under|below|max|upto|up to)\s*\$?\s*(\d+(?:,\d{3})*)", original_text, flags=re.I)
            if not m:
                m = re.search(r"\$\s*(\d+(?:,\d{3})*)", original_text, flags=re.I)
            if m:
                params.budget_total = float(m.group(1).replace(',', ''))
                params.currency = "USD"
                warnings.append("budget_extracted")

        m = re.search(r"(\d+)\s*(day|days)", original_text, flags=re.I)
        dur = params.duration_days
        if m:
            dur = int(m.group(1))
        else:
            m = re.search(r"(\d+)\s*(week|weeks)", original_text, flags=re.I)
            if m:
                dur = int(m.group(1)) * 7
            elif re.search(r"weekend", original_text, flags=re.I):
                dur = 3
        params.duration_days = dur or 7

        params.validation_warnings = list(set(params.validation_warnings + warnings))
        return params
