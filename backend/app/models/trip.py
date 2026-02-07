from typing import List, Optional
from pydantic import BaseModel, Field

class TripPreferences(BaseModel):
    interests: List[str] = Field(default_factory=list)
    budget_range: Optional[str] = None
    travel_style: Optional[str] = None
    dietary_restrictions: List[str] = Field(default_factory=list)

class TripParameters(BaseModel):
    destination: str
    duration_days: int
    budget_total: Optional[float] = None
    currency: str = "USD"
    travelers: int = 1
    start_date: Optional[str] = None
    origin: Optional[str] = None
    preferences: TripPreferences = Field(default_factory=TripPreferences)
    original_request: str
    validation_warnings: List[str] = Field(default_factory=list)

class TripPlan(BaseModel):
    parameters: TripParameters
    itinerary: List[dict] = Field(default_factory=list)
    budget_info: Optional[dict] = None
    research_info: Optional[dict] = None
    status: str = "draft"
