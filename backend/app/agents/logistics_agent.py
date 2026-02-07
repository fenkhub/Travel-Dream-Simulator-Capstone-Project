import json
from typing import List, Dict, Any
import google.generativeai as genai
from app.agents.base import BaseAgent
from app.models.trip import TripParameters
from app.integrations.external import search_places_text, route_duration_seconds

class LogisticsAgent(BaseAgent):
    def __init__(self, api_key: str):
        super().__init__(name="Logistics Agent")
        genai.configure(api_key=api_key)
        self.model_instance = genai.GenerativeModel('gemini-1.5-flash')

    async def process(self, parameters: TripParameters, research_findings: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Creates a day-by-day itinerary based on research findings.
        """
        prompt = f"""
        Create a logical day-by-day itinerary for a {parameters.duration_days}-day trip to {parameters.destination}.
        
        Research Findings:
        {json.dumps(research_findings)}
        
        Constraints:
        - Travel Style: {parameters.preferences.travel_style}
        - Interests: {', '.join(parameters.preferences.interests)}
        - Budget Range: {parameters.preferences.budget_range}
        
        IMPORTANT INSTRUCTIONS:
        - Generate a REALISTIC itinerary appropriate for {parameters.destination}.
        - The "Budget Range" indicates the QUALITY LEVEL of experiences, NOT a strict dollar limit:
            - "Low Budget" or "Budget Friendly": Focus on affordable options (hostels, street food, free/cheap activities, public transit)
            - "Moderate": Mix of comfort and value (mid-range hotels, local restaurants, paid attractions)
            - "Luxury": Premium experiences (upscale hotels, fine dining, private tours, exclusive activities)
        - Activities should reflect what tourists ACTUALLY do in {parameters.destination} at this quality level.
        - Be honest about what's realistic - don't force impossibly cheap "luxury" or unrealistic "free" alternatives.
        
        Return a JSON list where each item represents a day (day_number, activities, morning, afternoon, evening).
        Each time slot (morning, afternoon, evening) should have 'activity', 'description', 'location'.
        """
        try:
            response = self.model_instance.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            plan = json.loads(text)
            for day in plan:
                coords = []
                for slot in ["morning", "afternoon", "evening"]:
                    s = day.get(slot, {})
                    name = s.get("location") or s.get("activity")
                    if name:
                        res = search_places_text(f"{name} in {parameters.destination}")
                        if res:
                            s["lat"] = res[0].get("lat")
                            s["lng"] = res[0].get("lng")
                            coords.append((s.get("lat"), s.get("lng")))
                times = []
                if len(coords) >= 2:
                    for i in range(len(coords)-1):
                        a = coords[i]
                        b = coords[i+1]
                        if a[0] and a[1] and b[0] and b[1]:
                            dur = route_duration_seconds(a, b)
                            if dur is not None:
                                times.append(dur)
                if times:
                    day["travel_times_seconds"] = times
            return plan
        except Exception as e:
            print(f"LogisticsAgent failed: {e}")
            # Fallback itinerary
            itinerary = []
            for i in range(1, parameters.duration_days + 1):
                itinerary.append({
                    "day_number": i,
                    "morning": {"activity": f"Explore {parameters.destination}", "description": "Visit local landmarks.", "location": "City Center"},
                    "afternoon": {"activity": "Local Culture", "description": "Immerse in the local atmosphere.", "location": "Old Town"},
                    "evening": {"activity": "Dinner & Relax", "description": "Enjoy local cuisine.", "location": "Restaurant District"}
                })
            return itinerary
