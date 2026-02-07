from typing import Any, Dict, List, Optional, Tuple
from app.core.config import settings
import requests
import random

def get_weather_forecast(city: str) -> Dict[str, Any]:
    key = getattr(settings, "OPENWEATHERMAP_API_KEY", "")
    if not key:
        return {"status": "unavailable"}
    try:
        r = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={"q": city, "appid": key, "units": "metric"},
            timeout=20,
        )
        if r.ok:
            data = r.json()
            days: Dict[str, Dict[str, float]] = {}
            for item in data.get("list", []):
                dt_txt = item.get("dt_txt", "")
                day = dt_txt.split(" ")[0] if dt_txt else ""
                main = item.get("main", {})
                t = main.get("temp")
                if day:
                    d = days.setdefault(day, {"count": 0, "sum": 0.0})
                    if t is not None:
                        d["count"] += 1
                        d["sum"] += float(t)
            out = []
            for day, v in days.items():
                avg = v["sum"] / max(v["count"], 1)
                out.append({"date": day, "avg_temp_c": round(avg, 1)})
            return {"status": "ok", "daily": out[:7]}
    except Exception:
        pass
    return {"status": "error"}


def get_currency_rate(target: str) -> Optional[float]:
    key = getattr(settings, "CURRENCYLAYER_API_KEY", "")
    if not key:
        return None
    try:
        r = requests.get(
            "http://api.currencylayer.com/live",
            params={"access_key": key, "currencies": target, "source": "USD", "format": 1},
            timeout=20,
        )
        if r.ok:
            data = r.json()
            quotes = data.get("quotes", {})
            rate = quotes.get(f"USD{target.upper()}")
            if isinstance(rate, (int, float)):
                return float(rate)
    except Exception:
        pass
    return None


def search_places_text(query: str) -> List[Dict[str, Any]]:
    key = getattr(settings, "GOOGLE_PLACES_API_KEY", "") or getattr(settings, "GOOGLE_API_KEY", "")
    if not key:
        return []
    try:
        r = requests.get(
            "https://maps.googleapis.com/maps/api/place/textsearch/json",
            params={"query": query, "key": key},
            timeout=20,
        )
        if r.ok:
            data = r.json()
            out = []
            for it in data.get("results", []):
                loc = it.get("geometry", {}).get("location", {})
                out.append({
                    "name": it.get("name"),
                    "address": it.get("formatted_address"),
                    "rating": it.get("rating"),
                    "lat": loc.get("lat"),
                    "lng": loc.get("lng"),
                })
            return out
    except Exception:
        pass
    return []


def route_duration_seconds(start: Tuple[float, float], end: Tuple[float, float]) -> Optional[float]:
    key = getattr(settings, "OPENROUTESERVICE_API_KEY", "")
    if not key:
        return None
    try:
        r = requests.get(
            "https://api.openrouteservice.org/v2/directions/driving-car",
            params={"api_key": key, "start": f"{start[1]},{start[0]}", "end": f"{end[1]},{end[0]}"},
            timeout=20,
        )
        if r.ok:
            data = r.json()
            segs = data.get("features", [{}])[0].get("properties", {}).get("segments", [])
            if segs:
                return float(segs[0].get("duration", 0.0))
    except Exception:
        pass
    return None

def get_flight_prices(origin: str, destination: str, date: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Mock function to return realistic flight options.
    """
    if not origin or not destination:
        return []
        
    # Seed random for consistent results for same inputs
    seed_str = f"{origin}-{destination}"
    random.seed(seed_str)
    
    # Base price calculation based on string length difference (arbitrary but consistent)
    base_price = 300 + (len(origin) + len(destination)) * 20
    
    airlines = ["SkyHigh Air", "Oceanic Airlines", "Global Wings", "BudgetFly"]
    options = []
    
    for i in range(3):
        airline = airlines[i]
        price_variance = random.randint(-50, 150)
        price = base_price + price_variance
        
        # Outbound Leg
        out_duration_h = random.randint(3, 15)
        out_duration_m = random.randint(0, 59)
        out_stops = random.choice([0, 1, 2])
        
        # Return Leg
        ret_duration_h = random.randint(3, 15)
        ret_duration_m = random.randint(0, 59)
        ret_stops = random.choice([0, 1, 2])
        
        options.append({
            "airline": airline,
            "price": price,
            "currency": "USD",
            "type": "Round Trip",
            "outbound": {
                "duration": f"{out_duration_h}h {out_duration_m}m",
                "stops": out_stops,
                "departure_time": f"{random.randint(6, 20):02d}:{random.randint(0, 59):02d}",
                "arrival_time": f"{random.randint(6, 20):02d}:{random.randint(0, 59):02d}" # Simplified, ignores timezones
            },
            "return": {
                "duration": f"{ret_duration_h}h {ret_duration_m}m",
                "stops": ret_stops,
                "departure_time": f"{random.randint(6, 20):02d}:{random.randint(0, 59):02d}",
                "arrival_time": f"{random.randint(6, 20):02d}:{random.randint(0, 59):02d}"
            }
        })
        
    return sorted(options, key=lambda x: x["price"])