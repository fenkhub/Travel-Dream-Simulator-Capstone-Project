# Product Requirements Document (PRD)

Title: Travel Dream Simulator (TDS)
Owner: Product & Engineering
Document Status: Draft for Engineering Review
Last Updated: {{auto-generated}}


## 1. Purpose and Vision

Travel Dream Simulator (TDS) converts a user’s free-form trip “dream” into a concrete travel plan by:
- Interpreting natural language into structured trip parameters
- Researching relevant activities, accommodations, dining, and weather
- Generating a realistic, day-by-day itinerary
- Estimating total trip costs and offering budget-conscious alternatives
- Exporting a shareable PDF

Primary goal: Make high-quality trip planning accessible in minutes from a single prompt.


## 2. Success Metrics

- Time-to-first-plan: < 10s for typical prompt (with API keys configured)
- Plan completeness rate: > 95% (itinerary + budget present)
- PDF export success rate: > 99%
- Error rate (5xx across API): < 1% (with valid configuration)
- User satisfaction (qualitative): “The plan is realistic” and “Costs seem plausible”


## 3. Target Users and Personas

- Casual Traveler: Wants a weekend or 1-2 week plan with minimal effort
- Budget-Conscious Traveler: Needs realistic pricing and cost-saving alternatives
- Adventure/Interest-driven Traveler: Wants itinerary aligned with specific interests
- Travel Agent/Assistant: Rapidly prototypes itineraries for clients


## 4. Scope

In Scope
- Single-destination trip planning from a natural language description
- Research synthesis for activities, food, accommodation
- Itinerary generation reflecting interests, travel style, and budget range
- Budget estimation with currency handling and flight cost inclusion (mock)
- PDF export of the final plan

Out of Scope (for now)
- Multi-city routing and optimization
- Real-time booking or inventory
- Authentication/multi-user accounts
- Offline mode


## 5. High-Level Architecture

- Frontend: Next.js (App Router), TypeScript, components to capture dream input and display plan
- Backend: FastAPI service exposing trip endpoints and orchestrating 4 agents
  - Agents:
    - DreamInterpreterAgent (Gemini Pro): parse description -> TripParameters
    - ResearchAgent (Gemini 1.5 Flash + Google CSE): queries + synthesize results, weather, top places
    - LogisticsAgent (Gemini 1.5 Flash): day-by-day itinerary enriched with place coordinates and travel time
    - BudgetAgent (Gemini 1.5 Flash): cost breakdown, suggestions, alternative scenarios, optional flight prices
  - Integrations: Google Generative AI, Google Custom Search, Google Places Text Search, OpenWeatherMap, CurrencyLayer, OpenRouteService
- Data Models: Pydantic models for parameters and plan
- Export: ReportLab-generated PDF


## 6. User Experience (UX) Flow

1) Landing page: Prompt input describing the trip (e.g., “2 weeks in Japan under $3,000, nature, food”).
2) Click “Plan My Trip”:
   - Frontend calls POST /api/v1/trip/interpret to parse parameters
   - Then POST /api/v1/trip/generate with TripParameters
3) Plan page displays:
   - Parameters summary
   - Itinerary list (by day, morning/afternoon/evening)
   - Budget breakdown, total cost, suggestions, optional flight options
   - Research info (activities/accommodations/dining, weather, top places)
4) Export: Calls POST /api/v1/trip/export/pdf with TripPlan, triggers file download


## 7. Functional Requirements

FR-1 Prompt Interpretation
- Input: Raw text describing a trip
- Output: Structured TripParameters with normalized destination, extracted budget, duration, and preferences
- If the model fails, use heuristic fallback, then normalization logic

FR-2 Research
- Generate search queries from parameters
- Fetch Google Custom Search results (or mock if keys absent)
- Fetch weather forecast (if key provided)
- Fetch top places via Google Places Text Search per top interests
- Synthesize findings into activities, accommodations, dining

FR-3 Logistics / Itinerary Generation
- Generate a realistic day-by-day plan matching interests, travel style, and budget range
- Enrich activities with lat/lng via Places search when available
- Estimate travel time between successive activities using OpenRouteService (if key provided)
- Fallback to a generic but coherent itinerary if model fails

FR-4 Budget Estimation
- Estimate total cost and a breakdown by accommodation, food, activities, transport
- Respect “budget range” as quality level, not a hard limit
- If realistic cost significantly exceeds stated budget_total, propose alternative scenarios (e.g., reduce days or switch to budget-friendly)
- If origin present, include mock flight options and add flight costs to total and breakdown
- Currency conversion is supported when a CurrencyLayer API key is configured

FR-5 Export PDF
- Produce a readable PDF summarizing parameters and the day-by-day itinerary
- Pagination-safe (new pages when space runs out)

FR-6 Observability
- Log incoming request method and URL, and response status codes
- Error messages returned with HTTP 500 include safe, concise reason text


## 8. Non-Functional Requirements (NFR)

NFR-1 Performance
- End-to-end plan generation < 10-15s for typical queries (depends on external APIs)

NFR-2 Reliability
- Fallback logic in agents produces usable results when external services fail
- Mock data paths enabled when keys are missing for weather, search, currency, routing

NFR-3 Security
- No PII required; do not log user-provided secrets
- API keys loaded from environment (.env) and never embedded in frontend
- CORS restricted to http://localhost:3000 by default

NFR-4 Maintainability
- Agents implement a common BaseAgent for consistent logging and naming
- Pydantic models define clear contracts between services and UI

NFR-5 Compatibility
- Backend: Python 3.11+, FastAPI
- Frontend: Next.js 14+, Node 18+


## 9. API Specifications

Base URL: /api/v1/trip
Content-Type: application/json

9.1 POST /interpret
- Request Body: TripRequest
  - description: string (required)
- Responses:
  - 200 OK: TripParameters
  - 500 Internal Server Error: { detail: string }

9.2 POST /generate
- Request Body: TripParameters (as returned by /interpret)
- Responses:
  - 200 OK: TripPlan
  - 500 Internal Server Error: { detail: string }

9.3 POST /export/pdf
- Request Body: TripPlan
- Response:
  - 200 OK: application/pdf
  - 500 Internal Server Error: { detail: string }


## 10. Data Contracts (Backend Models)

TripPreferences
- interests: string[]
- budget_range: string | null (e.g., “Budget Friendly”, “Moderate”, “Luxury”)
- travel_style: string | null (e.g., “relaxed”, “adventurous”)
- dietary_restrictions: string[]

TripParameters
- destination: string (normalized by DreamInterpreterAgent._normalize)
- duration_days: number
- budget_total: number | null (extracted from text when available)
- currency: string (default “USD”)
- travelers: number (default 1)
- start_date: string | null (YYYY-MM-DD)
- origin: string | null (optional; used to include flights)
- preferences: TripPreferences
- original_request: string
- validation_warnings: string[] (e.g., ["budget_extracted", "destination_validated", "destination_normalized"])

TripPlan
- parameters: TripParameters
- itinerary: Array<DayPlan>
- budget_info: object | null
  - total_estimated_cost: number
  - breakdown: { accommodation: number, food: number, activities: number, transport: number, flights?: number }
  - suggestions: string[]
  - flight_options?: Array<{ airline, price, currency, type, outbound{...}, return{...} }>
  - currency?: string (if converted)
  - alternative_scenarios?: Array<{ title, description, new_duration_days, new_budget_range, estimated_cost }>
- research_info: object | null
  - activities: Array<{ name, description, estimated_cost }>
  - accommodations: Array<{ name, description, estimated_cost }>
  - dining: Array<{ name, description, estimated_cost }>
  - weather?: { status: "ok" | "error" | "unavailable", daily?: Array<{ date, avg_temp_c }> }
  - top_places?: Array<{ name, address, rating, lat, lng }>
- status: string ("draft" | "generated")

DayPlan
- day_number: number
- morning: { activity, description, location, lat?, lng? }
- afternoon: { activity, description, location, lat?, lng? }
- evening: { activity, description, location, lat?, lng? }
- travel_times_seconds?: number[] (pairwise travel times between morning->afternoon->evening)


## 11. Agents: Responsibilities and Behaviors

DreamInterpreterAgent
- Model: Gemini Pro
- Inputs: user description string
- Outputs: TripParameters
- Behavior:
  - Parse description to JSON
  - Normalize fields: title-case destination; infer durations (e.g., weekend=3, weeks*7); extract currency and budget from natural mentions
  - Validate destination via Google Places when possible
  - Heuristic fallback when model fails

ResearchAgent
- Model: Gemini 1.5 Flash + Google CSE
- Inputs: TripParameters
- Outputs: research_info object
- Behavior:
  - Generate 5 queries (JSON list)
  - Execute searches via Google CSE or return mocked results without keys
  - Fetch weather forecast and top places (by interests)
  - Synthesize to activities/accommodations/dining via LLM

LogisticsAgent
- Model: Gemini 1.5 Flash
- Inputs: TripParameters, research_info
- Outputs: itinerary array (per day)
- Behavior:
  - Create realistic itinerary matching destination, interests, travel style, and budget range as quality
  - Enrich with lat/lng (Places) and travel time (OpenRouteService) when keys exist
  - Graceful fallback itinerary when model fails

BudgetAgent
- Model: Gemini 1.5 Flash
- Inputs: TripParameters, itinerary
- Outputs: budget_info
- Behavior:
  - Estimate total costs and breakdown per quality level and destination
  - If stated budget_total is set and plan exceeds it, propose 2-3 alternative_scenarios
  - Include flight_options and add flight costs if origin provided
  - Convert currency using CurrencyLayer when configured


## 12. Frontend Requirements

- Pages
  - / (Landing): Input prompt, CTA to generate plan
  - /plan: Renders plan details received from backend
- Components (non-exhaustive)
  - LandingInput: captures description and triggers API calls
  - ItineraryView: renders day-by-day plan
  - ClarificationView: shows extracted parameters and warnings
  - Navbar, Hero, Features, HowItWorks, Testimonials
- API Client
  - frontend/lib/api.ts implements POST to /interpret and /generate
- UX Notes
  - Show loading states while generating
  - Display warnings (validation_warnings) to help users refine prompts
  - Render budget alternatives when present
  - Provide “Export PDF” button that posts TripPlan to /export/pdf and triggers download


## 13. Configuration and Environment

Backend .env variables (see backend/app/core/config.py and backend/.env.example)
- GOOGLE_API_KEY (required for LLM)
- GOOGLE_CSE_ID (optional; improves search results)
- OPENWEATHERMAP_API_KEY (optional)
- CURRENCYLAYER_API_KEY (optional)
- OPENROUTESERVICE_API_KEY (optional)
- GOOGLE_PLACES_API_KEY (optional; falls back to GOOGLE_API_KEY if set)
- LOG_LEVEL (default: INFO)

CORS
- Allow origins: ["http://localhost:3000"] (adjust per deployment)


## 14. Error Handling and Edge Cases

- If LLM returns markdown code blocks, strip ```json fences before JSON parse
- If destination is ambiguous/missing, infer or set to "Unknown"; attempt to validate with Places
- If duration not present, infer from terms (weekend, N weeks, N days)
- If budget not present, try regex extraction from text
- If no API keys available for an integration, use mocked behavior and fallback outputs
- If currency conversion not available, keep amounts as generated (assume USD)
- All endpoints return 500 with { detail } on unexpected errors


## 15. Logging, Telemetry, and Analytics

- Middleware logs request and response status
- Agents may print error context to stdout (engineering logs) — ensure no secrets
- Consider adding structured logs for:
  - timings per agent
  - external API error codes
  - cache hits in ResearchAgent


## 16. Security and Privacy

- No authentication by default; secure behind gateway when deployed publicly
- Do not log secrets or raw environment values
- Validate/sanitize user input to avoid prompt injection risks in future extensions


## 17. Acceptance Criteria

A1 Prompt -> Plan Flow
- Given a valid description, /interpret returns TripParameters with destination, duration_days, and preferences populated and validation_warnings possibly set
- /generate returns TripPlan with non-empty itinerary and budget_info.total_estimated_cost

A2 PDF Export
- Given a valid TripPlan, /export/pdf returns a binary PDF of at least 1 page with title and daily entries

A3 Fallbacks
- With missing API keys (all optional except GOOGLE_API_KEY), system still produces a coherent TripPlan with mocked segments

A4 Budget Alternatives
- If user budget_total is provided and plan exceeds budget by > 50%, budget_info includes alternative_scenarios

A5 Flight Inclusion
- If origin provided, budget_info includes flight_options and flights cost line item in breakdown


## 18. Test Plan (High-Level)

- Unit Tests
  - DreamInterpreter normalization and fallback extraction
  - ResearchAgent: query generation parsing; synthesis fallback
  - LogisticsAgent: itinerary structure; fallback itinerary length
  - BudgetAgent: cost breakdown, alternatives logic, flight cost inclusion
- API Tests
  - POST /interpret: basic inputs, edge cases (ambiguous destination, weekend wording)
  - POST /generate: ensures itinerary + budget_info returned
  - POST /export/pdf: valid PDF returned
- Integration Tests
  - With and without API keys to exercise fallback paths


## 19. Risks and Mitigations

- External API limits/unavailability -> Fallback logic and caching in ResearchAgent
- Unrealistic LLM outputs -> Clear prompts instruct realism; normalization and enrichment steps
- Cost estimates variability -> Clearly treated as estimates; provide ranges and alternatives
- Destination ambiguity -> Normalization + Places validation


## 20. Future Enhancements

- Multi-city and route optimization
- Live pricing for hotels/activities
- User accounts and saved plans
- Collaboration and sharing links
- Improved PDF design and branding


## 21. Glossary

- Budget Range (Quality Level): Describes the quality tier of experiences (Budget Friendly, Moderate, Luxury) — not a strict numeric limit
- TripParameters: Structured inputs derived from user prompt
- TripPlan: Complete plan including itinerary, research, and budget


## 22. Deliverables and Milestones

M1 MVP (this scope)
- Working endpoints: /interpret, /generate, /export/pdf
- Frontend landing + plan pages
- Docs: README, PRD

M2 Quality & Observability
- Structured logs for agent timings
- Improved error messaging in UI

M3 Enhancements
- UI for alternative scenarios comparison
- Destination disambiguation UX


## 23. Appendix: Example Payloads

POST /interpret request
{
  "description": "I want a 1-week trip to Bali under $1500, love beaches and food, traveling with 2 friends from Singapore"
}

200 OK TripParameters (example)
{
  "destination": "Bali",
  "duration_days": 7,
  "budget_total": 1500,
  "currency": "USD",
  "travelers": 3,
  "start_date": null,
  "origin": "Singapore",
  "preferences": {
    "interests": ["Beaches", "Food"],
    "budget_range": "Budget Friendly",
    "travel_style": "relaxed",
    "dietary_restrictions": []
  },
  "original_request": "I want a 1-week trip to Bali under $1500, love beaches and food, traveling with 2 friends from Singapore",
  "validation_warnings": ["budget_extracted", "destination_validated"]
}

POST /generate request
{
  "destination": "Bali",
  "duration_days": 7,
  "budget_total": 1500,
  "currency": "USD",
  "travelers": 3,
  "origin": "Singapore",
  "preferences": {"interests": ["Beaches", "Food"], "budget_range": "Budget Friendly", "travel_style": "relaxed"},
  "original_request": "..."
}

200 OK TripPlan (partial)
{
  "parameters": { ... },
  "itinerary": [
    {
      "day_number": 1,
      "morning": {"activity": "Beach Time", "description": "Relax at Nusa Dua", "location": "Nusa Dua", "lat": -8.8, "lng": 115.2},
      "afternoon": {"activity": "Uluwatu Temple", "description": "Clifftop views", "location": "Uluwatu"},
      "evening": {"activity": "Seafood Dinner", "description": "Jimbaran Bay", "location": "Jimbaran"},
      "travel_times_seconds": [1800, 2400]
    }
  ],
  "budget_info": {
    "total_estimated_cost": 2200,
    "breakdown": {"accommodation": 900, "food": 500, "activities": 300, "transport": 200, "flights": 300},
    "suggestions": ["Travel off-peak", "Use ride-hailing"],
    "flight_options": [{"airline": "BudgetFly", "price": 100, "currency": "USD", "type": "Round Trip", "outbound": {"duration": "4h 20m", "stops": 0}, "return": {"duration": "4h 10m", "stops": 1}}]
  },
  "research_info": { "activities": [...], "accommodations": [...], "dining": [...], "weather": {"status": "ok", "daily": [...] }, "top_places": [...] },
  "status": "generated"
}
