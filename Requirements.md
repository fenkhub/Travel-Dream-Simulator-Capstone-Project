# Travel Dream Simulator – Quick Overview

## Problem
A fragmented travel‑planning experience forces users to juggle multiple sites for flights, hotels, activities, and research, leading to decision fatigue.

## Solution
An AI‑driven platform that turns a user’s dream description into a realistic, budget‑aware itinerary, offering smart alternatives when constraints are exceeded.

## Core Architecture
- **Frontend**: Next.js 14 (App Router) • Tailwind CSS • Framer Motion • React Query • Mapbox GL JS
- **Backend**: FastAPI • Google ADK (agent orchestration) • Pydantic • SQLModel
- **Agents**:
  - Dream Interpreter – parses natural‑language travel wishes
  - Research Agent – fetches real‑time data (flights, hotels, weather, etc.)
  - Logistics Agent – optimizes routing and scheduling
  - Budget Agent – computes realistic costs and suggests alternatives
  - Memory Agent – preserves context across sessions
- **Integrations**: Google Search & Places, Amadeus/Skyscanner, OpenWeatherMap, CurrencyLayer, OpenRouteService

## Quick‑Start Guide
```bash
# Clone the repo
git clone <repo-url>
cd caps3

# Backend setup
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # set GOOGLE_API_KEY, etc.
uvicorn backend.main:app --reload

# Frontend setup (in a new terminal)
npm install
npm run dev   # http://localhost:3000
```

## Implementation Tips
- Keep `backend/.env` secure; never commit real keys.
- Use `npm run dev` for hot‑reloading during UI work.
- Agents communicate via the ADK; adjust prompts in `backend/app/agents/*` for custom behavior.
- For production, build the Next.js app (`npm run build`) and deploy FastAPI with a WSGI server.

---
*This concise document replaces the original detailed proposal and serves as a README‑ready summary.*
