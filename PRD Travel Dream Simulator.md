# PRD — Travel Dream Simulator

## 1. Summary
A full-stack application that turns natural language travel ideas into a structured plan with expert guidance. Users describe a trip in plain English; the system interprets intent, normalizes parameters, researches destinations, generates a day-by-day itinerary, estimates budget, and exports a shareable PDF.

## 2. Goals
- Interpret messy travel prompts reliably and normalize into `TripParameters`.
- Generate comprehensive `TripPlan` including weather, places, logistics, and budget.
- Provide graceful fallbacks when external API keys are missing.
- Keep the conversation context and validation signals for user transparency.

## 3. Non‑Goals
- Real booking integrations (flights/hotels). 
- Realtime navigation or maps rendering.
- Identity management beyond basic CORS.

## 4. Success Metrics
- Interpret latency ≤ 800 ms p50 on local dev.
- Generate latency ≤ 1200 ms p50 (without external keys).
- Zero runtime errors for missing API keys; responses include safe defaults.
- Lint/typecheck clean for core modules.

## 5. User Flows
1) Landing → user types any prompt → click “Plan”.
2) Backend `/interpret` returns normalized `TripParameters` → Clarification UI shows fields for confirmation/edit.
3) User confirms → call `/generate` → display itinerary, weather, top places, travel times, and budget.
4) User exports → call `/export/pdf` → downloads PDF.

## 6. System Architecture
- Frontend: Next.js 16 (App Router), Tailwind v4, React 19.
- Backend: FastAPI, agents pattern (Interpreter/Research/Logistics/Budget), integrations layer.
- External services: Google Places/Text Search, OpenWeatherMap, CurrencyLayer, OpenRouteService.

Sequence (high level):
- UI → `/interpret` → `DreamInterpreterAgent` → `TripParameters`
- UI → `/generate` → `ResearchAgent` + `LogisticsAgent` + `BudgetAgent` → `TripPlan`
- UI → `/export/pdf` → PDF bytes

## 7. Data Contracts
### TripPreferences (backend/app/models/trip.py:4)
- `interests: string[]`
- `budget_range?: string`
- `travel_style?: string`
- `dietary_restrictions: string[]`

### TripParameters (backend/app/models/trip.py:10)
- `destination: string`
- `duration_days: number`
- `budget_total?: number`
- `currency: string` default `USD`
- `travelers: number` default `1`
- `start_date?: string`
- `origin?: string`
- `preferences: TripPreferences`
- `original_request: string`
- `validation_warnings: string[]` (normalization signals)

### TripPlan (backend/app/models/trip.py:21)
- `parameters: TripParameters`
- `itinerary: Day[]`
- `budget_info?: object`
- `research_info?: object` (weather, top_places, synthesized lists)
- `status: string` (`draft|generated`)

### Day (generated)
- `day_number: number`
- `morning|afternoon|evening: { activity, description, location, lat?, lng? }`
- `travel_times_seconds?: number[]`

## 8. HTTP API
Base: `http://localhost:8000/api/v1/trip`

- `POST /interpret` → `TripParameters`
  - Body: `{ description: string }`
  - Success: 200 + normalized parameters
  - Errors: 500 with message
  - Implementation: `backend/app/api/endpoints_trip.py:14`

- `POST /generate` → `TripPlan`
  - Body: `TripParameters`
  - Success: 200 + plan with research/logistics/budget
  - Errors: 500 with message
  - Implementation: `backend/app/api/endpoints_trip.py:26`

- `POST /export/pdf` → PDF
  - Body: `TripPlan`
  - Success: 200 `application/pdf`
  - Implementation: `backend/app/api/endpoints_trip.py:52`

## 9. Prompt Processing & Normalization
- Primary LLM: Gemini (`gemini-pro` for interpret; `gemini-1.5-flash` for research/logistics synthesis).
- Input integrity: preserve raw prompt in `original_request` for downstream agents and audit.
- Normalization rules (backend/app/agents/dream_interpreter.py:102):
  - Destination: strip budget/qualifier phrases (under/below/max/cheap/etc.), fallback to regex `to <place>` capture, validate via Places.
  - Budget: extract `under/max/$<num>` and set `currency` to `USD` when inferred.
  - Duration: parse `<n> days`, `<n> weeks`, `weekend`.
  - Warnings: push strings like `destination_normalized`, `budget_extracted`, `destination_validated` into `validation_warnings`.
- Heuristic fallback: regex-based extraction when the LLM fails (`dream_interpreter.py:86`).

## 10. Agents (Responsibilities)
- DreamInterpreterAgent (`backend/app/agents/dream_interpreter.py`)
  - Converts free text → `TripParameters` with normalization and warnings.
- ResearchAgent (`backend/app/agents/research_agent.py`)
  - Generates queries, runs Google Custom Search if keys exist; synthesizes activities/accommodations/dining; adds weather and top places.
- LogisticsAgent (`backend/app/agents/logistics_agent.py`)
  - Produces day plan; enriches with coordinates via Places; calculates segment durations via OpenRouteService.
- BudgetAgent (`backend/app/agents/budget_agent.py`)
  - Estimates budget, converts currency when non-USD; optionally adds flight price estimates if `origin` is provided.

## 11. External Integrations (backend/app/integrations/external.py)
- Weather: OpenWeatherMap (`get_weather_forecast`) → daily averages.
- Places: Google Places Text Search (`search_places_text`) → name/address/rating/lat/lng.
- Routing: OpenRouteService (`route_duration_seconds`) → driving-car durations.
- Currency: CurrencyLayer (`get_currency_rate`) → USD↔other conversions.
- Flights: `get_flight_prices` mock generator (deterministic) to provide realistic options when `origin` is set.
- Fallback behavior:
  - Missing key → safe default (empty list or `{"status":"unavailable"}`) without throwing.

## 12. Frontend Requirements
- Framework: Next.js 16 (App Router) + Tailwind v4.
- Pages:
  - `app/plan/page.tsx`: handles prompt entry, interpretation, confirmation, and plan view navigation.
- Components:
  - `LandingInput.tsx`: prompt input with interest chips.
  - `ClarificationView.tsx`: displays `TripParameters` for edit/confirm.
  - `ItineraryView.tsx`: renders budget panel, alternative scenarios, weather, top places, and per-day travel time chips.
- UI tokens: Tailwind `@theme` in `app/globals.css` defines CSS variables used by utility classes.

## 13. Validation & Error Handling
- Validation warnings surfaced in payload (`TripParameters.validation_warnings`).
- Unknown destination → attempt inference; if impossible, set `Unknown` and proceed.
- External API failures/timeouts → log and degrade gracefully; no user-facing crash.
- Endpoint errors → 500 with message; frontend shows retry alert.

## 14. Security & Privacy
- Do not log secrets; read from `.env` via `pydantic-settings`.
- CORS allows `http://localhost:3000` by default (`backend/app/main.py:11`).
- No PII persistence.

## 15. Configuration
Environment variables (backend/.env):
- `GOOGLE_API_KEY`
- `GOOGLE_CSE_ID`
- `SERPAPI_API_KEY` (not required)
- `OPENWEATHERMAP_API_KEY`
- `CURRENCYLAYER_API_KEY`
- `OPENROUTESERVICE_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `LOG_LEVEL` (default `INFO`)

## 16. Performance & Observability
- Benchmark script `backend/scripts/benchmark_endpoints.py` runs `/interpret`, `/generate` (cold/warm), and `/export/pdf` to report latencies and PDF size.
- Console logging via `logging` in `app/main.py` middleware for request/response status.

## 17. Testing Strategy
- Unit: agents fallbacks and normalization.
  - `tests/test_interpret_fallback.py` — destination & budget extraction.
  - `tests/test_interpret_normalization.py` — Bali prompt normalization.
  - `tests/test_interpret_endpoint_normalization.py` — API contract check.
  - `tests/test_research_mock.py` — synthesized structure when keys absent.
  - `tests/test_generate_includes_research_info.py` — research info in plan.
  - `tests/test_export_pdf.py` — PDF bytes returned.
- Run: `source .venv/bin/activate && pytest -q`.

## 18. Acceptance Criteria
- Given prompt “10 day trip to bali under $1000”, `/interpret` returns `{ destination: "Bali", duration_days: 10, budget_total: 1000 }`.
- `/generate` returns `TripPlan` containing `research_info.weather` and `top_places` keys.
- Itinerary includes `travel_times_seconds` when coordinates are available.
- Exported PDF has > 100 bytes and correct content type.
- No unhandled exceptions when all external keys are empty.

## 19. Deployment & Dev Setup
- Backend: `uvicorn app.main:app --reload` (Python ≥ 3.13).
- Frontend: `npm install && npm run dev` (Next.js 16, port 3000/3001).
- Env: add keys to `backend/.env`.

## 20. Risks & Mitigations
- External API rate limits → cache in `ResearchAgent`, degrade gracefully.
- LLM variability → normalization layer enforced; tests cover common phrases.
- Tailwind v4 editor warnings → use IntelliSense; build unaffected.

## 21. Future Work
- Real flight/hotel search providers with authenticated keys.
- User account and saved plans.
- Map visualization and routing options (walk/transit).

---
This PRD maps directly to the current repository implementation and codifies API contracts, data models, flows, and acceptance criteria developers must follow to avoid ambiguity.
