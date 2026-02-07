import json
from typing import List, Dict, Any
import google.generativeai as genai
from googleapiclient.discovery import build
from app.agents.base import BaseAgent
from app.models.trip import TripParameters
from app.integrations.external import get_weather_forecast, search_places_text

class ResearchAgent(BaseAgent):
    def __init__(self, api_key: str, google_api_key: str, google_cse_id: str):
        super().__init__(name="Research Agent")
        genai.configure(api_key=api_key)
        self.model_instance = genai.GenerativeModel('gemini-1.5-flash')
        self.google_api_key = google_api_key
        self.google_cse_id = google_cse_id
        self.search_service = build("customsearch", "v1", developerKey=self.google_api_key)
        self._cache: Dict[str, List[Dict[str, str]]] = {}

    async def process(self, parameters: TripParameters) -> Dict[str, Any]:
        """
        Conducts research based on trip parameters.
        """
        # 1. Formulate search queries
        queries = self._generate_search_queries(parameters)
        
        # 2. Execute searches (mocked if no key)
        search_results = self._execute_searches(queries)
        
        w = get_weather_forecast(parameters.destination)
        top_places = []
        for interest in parameters.preferences.interests[:3]:
            q = f"{interest} in {parameters.destination}"
            top_places.extend(search_places_text(q)[:3])
        findings = self._synthesize_findings(parameters, search_results)
        findings["weather"] = w
        findings["top_places"] = top_places[:10]
        
        return findings

    def _generate_search_queries(self, parameters: TripParameters) -> List[str]:
        prompt = f"""
        Generate 5 specific Google search queries to plan a trip to {parameters.destination} 
        for {parameters.duration_days} days.
        Interests: {', '.join(parameters.preferences.interests)}
        Travel Style: {parameters.preferences.travel_style}
        Budget: {parameters.preferences.budget_range}
        
        Return only the queries as a JSON list of strings.
        """
        try:
            response = self.model_instance.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text)
        except Exception as e:
            print(f"ResearchAgent query generation failed: {e}")
            return [f"things to do in {parameters.destination}", f"hotels in {parameters.destination}", f"restaurants in {parameters.destination}"]

    def _execute_searches(self, queries: List[str]) -> List[Dict]:
        results = []
        if self.google_api_key and self.google_cse_id:
            for query in queries:
                try:
                    if query in self._cache:
                        results.append({"query": query, "organic_results": self._cache[query]})
                        continue
                    response = self.search_service.cse().list(
                        q=query,
                        cx=self.google_cse_id,
                        num=3
                    ).execute()
                    
                    formatted_results = []
                    for item in response.get("items", []):
                        formatted_results.append({
                            "title": item.get("title"),
                            "link": item.get("link"),
                            "snippet": item.get("snippet")
                        })

                    results.append({"query": query, "organic_results": formatted_results})
                    self._cache[query] = formatted_results
                except Exception as e:
                    print(f"Google Custom Search error: {e}")
        else:
            # Mock results if no key
            results = [{"query": q, "organic_results": [{"title": f"Result for {q}", "snippet": f"Mock description for {q} in {queries[0].split()[-1]}"}]} for q in queries]
        return results

    def _synthesize_findings(self, parameters: TripParameters, search_results: List[Dict]) -> Dict[str, Any]:
        prompt = f"""
        Synthesize the following search results into a structured list of potential activities, 
        accommodations, and dining options for a trip to {parameters.destination}.
        
        Search Results:
        {json.dumps(search_results)}
        
        Return a JSON object with keys: 'activities', 'accommodations', 'dining'.
        Each should be a list of items with 'name', 'description', 'estimated_cost'.
        """
        try:
            response = self.model_instance.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text)
        except Exception as e:
            print(f"ResearchAgent synthesis failed: {e}")
            return {
                "activities": [{"name": "City Tour", "description": f"Explore the highlights of {parameters.destination}", "estimated_cost": "$50"}], 
                "accommodations": [{"name": "Central Hotel", "description": "Comfortable stay in the city center", "estimated_cost": "$150/night"}], 
                "dining": [{"name": "Local Cuisine", "description": "Traditional dishes", "estimated_cost": "$30"}]
            }
