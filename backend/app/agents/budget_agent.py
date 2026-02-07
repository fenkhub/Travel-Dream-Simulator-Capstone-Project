import json
from typing import Dict, Any, List
import google.generativeai as genai
from app.agents.base import BaseAgent
from app.models.trip import TripParameters
from app.integrations.external import get_currency_rate, get_flight_prices

class BudgetAgent(BaseAgent):
    def __init__(self, api_key: str):
        super().__init__(name="Budget Agent")
        genai.configure(api_key=api_key)
        self.model_instance = genai.GenerativeModel('gemini-1.5-flash')

    async def process(self, parameters: TripParameters, itinerary: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Estimates costs and provides a budget breakdown.
        """
        prompt = f"""
        You are a travel budget expert. Estimate the REALISTIC total cost for this itinerary in {parameters.currency}.
        
        Destination: {parameters.destination}
        Duration: {parameters.duration_days} days
        Travelers: {parameters.travelers}
        Budget Range/Quality: {parameters.preferences.budget_range}
        User's Requested Budget Limit: {parameters.budget_total if parameters.budget_total else "No specific limit"}
        
        Itinerary:
        {json.dumps(itinerary)}
        
        CRITICAL INSTRUCTIONS:
        1. Calculate the REALISTIC cost based on actual market prices for {parameters.destination}.
        2. Base your estimate on the "Budget Range" quality level (Low Budget = hostels/street food, Luxury = 5-star hotels/fine dining).
        3. DO NOT artificially lower costs to match the user's budget limit - be honest about what this trip actually costs.
        4. If the realistic cost exceeds the user's budget limit, provide intelligent "alternative_scenarios" (see below).
        
        Return a JSON object with:
        - total_estimated_cost (number): The REALISTIC total cost
        - breakdown (object): {{accommodation, food, activities, transport}} with realistic amounts
        - suggestions (list of strings): General money-saving tips
        - alternative_scenarios (optional, array): ONLY include if total_estimated_cost significantly exceeds the user's budget limit
        
        Structure for alternative_scenarios (provide 2-3 practical options):
        [
          {{
            "title": "Reduce Duration",
            "description": "Shorten trip to fit budget",
            "new_duration_days": <number>,
            "new_budget_range": "{parameters.preferences.budget_range}",
            "estimated_cost": <number>
          }},
          {{
            "title": "Change Quality Level",
            "description": "Keep duration but go budget-friendly",
            "new_duration_days": {parameters.duration_days},
            "new_budget_range": "Budget Friendly",
            "estimated_cost": <number>
          }}
        ]
        """
        try:
            response = self.model_instance.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            data = json.loads(text)
            if parameters.currency and parameters.currency.upper() != "USD":
                rate = get_currency_rate(parameters.currency)
                if rate:
                    def conv(x):
                        try:
                            return round(float(x) * rate, 2)
                        except Exception:
                            return x
                    if isinstance(data.get("total_estimated_cost"), (int, float)):
                        data["total_estimated_cost"] = conv(data["total_estimated_cost"])
                    br = data.get("breakdown", {})
                    for k in list(br.keys()):
                        if isinstance(br.get(k), (int, float)):
                            br[k] = conv(br[k])
                    data["currency"] = parameters.currency
            # Add flight costs if origin is provided (Main Success Path)
            if parameters.origin:
                flights = get_flight_prices(parameters.origin, parameters.destination)
                if flights:
                    cheapest_flight = flights[0]
                    flight_cost = cheapest_flight["price"] * parameters.travelers
                    
                    # Ensure total_estimated_cost exists and is a number
                    current_total = data.get("total_estimated_cost", 0)
                    if not isinstance(current_total, (int, float)):
                        current_total = 0
                        
                    data["total_estimated_cost"] = current_total + flight_cost
                    
                    # Ensure breakdown exists
                    if "breakdown" not in data or not isinstance(data["breakdown"], dict):
                        data["breakdown"] = {}
                        
                    data["breakdown"]["flights"] = flight_cost
                    data["flight_options"] = flights[:3]

            return data
        except Exception as e:
            print(f"BudgetAgent failed: {e}")
            # Realistic fallback estimation
            
            # Base daily costs by destination and quality (very rough estimates)
            daily_base = {
                "Low Budget": 30,
                "Budget Friendly": 50,
                "Budget": 50,
                "Moderate": 120,
                "Luxury": 300,
                "Ultra Luxury": 600
            }
            
            daily_cost = daily_base.get(parameters.preferences.budget_range, 100)
            estimated_cost = daily_cost * parameters.duration_days * parameters.travelers
            
            breakdown = {
                "accommodation": estimated_cost * 0.4,
                "food": estimated_cost * 0.3,
                "activities": estimated_cost * 0.15,
                "transport": estimated_cost * 0.15
            }
            
            result = {
                "total_estimated_cost": estimated_cost,
                "breakdown": breakdown,
                "suggestions": ["Book accommodations in advance", "Use public transportation", "Look for combo tickets"]
            }
            
            # Generate alternative scenarios if significantly over budget
            if parameters.budget_total and estimated_cost > parameters.budget_total * 1.5:
                # Calculate how many days fit the budget at current quality
                days_for_budget = max(1, int(parameters.budget_total / (daily_cost * parameters.travelers)))
                
                # Calculate budget-friendly option for full duration
                budget_friendly_daily = daily_base.get("Budget Friendly", 50)
                budget_friendly_cost = budget_friendly_daily * parameters.duration_days * parameters.travelers
                
                result["alternative_scenarios"] = [
                    {
                        "title": f"Reduce to {days_for_budget} Days",
                        "description": f"Keep {parameters.preferences.budget_range} quality, shorter trip",
                        "new_duration_days": days_for_budget,
                        "new_budget_range": parameters.preferences.budget_range,
                        "estimated_cost": days_for_budget * daily_cost * parameters.travelers
                    },
                    {
                        "title": "Switch to Budget-Friendly",
                        "description": f"Keep {parameters.duration_days} days, lower quality",
                        "new_duration_days": parameters.duration_days,
                        "new_budget_range": "Budget Friendly",
                        "estimated_cost": budget_friendly_cost
                    }
                ]

            # Add flight costs if origin is provided (Fallback Path)
            if parameters.origin:
                flights = get_flight_prices(parameters.origin, parameters.destination)
                if flights:
                    # Assume the user picks the cheapest option for the estimate
                    cheapest_flight = flights[0]
                    flight_cost = cheapest_flight["price"] * parameters.travelers
                    
                    result["total_estimated_cost"] += flight_cost
                    result["breakdown"]["flights"] = flight_cost
                    result["flight_options"] = flights[:3] # Return top 3 options
            
            return result
