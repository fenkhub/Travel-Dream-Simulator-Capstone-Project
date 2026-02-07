# Travel Dream Simulator

> **Transform your travel dreams into reality with AI-powered intelligent planning**

An AI-driven travel planning platform that converts natural language descriptions into comprehensive, realistic, budget-aware itineraries. Using specialized agents and real-time data integration, the system delivers personalized recommendations and smart alternatives when constraints are exceeded.

![Travel Dream Simulator](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Why This Exists

Travel planning is **fragmented and overwhelming**. Users juggle multiple platforms for flights, hotels, activities, and research, leading to:
- **Decision paralysis** from information overload
- **Wasted time** switching between apps and sites
- **Lack of personalization** in recommendations
- **No budget intelligence** - plans ignore realistic costs

**Travel Dream Simulator** solves this by providing a single intelligent interface that orchestrates all travel planning domains while respecting your constraints.

---

## 🤖 Why Agents?

This platform leverages autonomous AI agents because:

- **Multi-domain coordination** - Each agent specializes in one vertical (flights, hotels, activities, routing, budgeting)
- **Dynamic tool selection** - Agents invoke external APIs (Google Search, Amadeus, weather services) as needed
- **Conversational refinement** - Users can iteratively adjust plans using natural language
- **Constraint optimization** - The Budget Agent balances competing priorities (cost, time, preferences)
- **Memory persistence** - The Memory Agent maintains context across planning sessions

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│   Frontend (Next.js + Tailwind CSS)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    Backend API (FastAPI + Python)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Google ADK Orchestrator            │
└──┬───────┬───────┬───────┬─────────┬────┘
   │       │       │       │         │
┌──▼───┐┌─▼────┐┌─▼────┐┌─▼─────┐┌──▼───┐
│Dream ││Research││Logistics││Budget││Memory│
│Agent ││Agent   ││Agent    ││Agent ││Agent │
└──────┘└────┬───┘└─────┘└──────┘└──────┘
            │
    ┌───────▼────────┐
    │  MCP Tools     │
    │  Integration   │
    └───────┬────────┘
            │
    ┌───────▼────────────────────────┐
    │  External APIs                 │
    │  • Google Search & Places      │
    │  • Amadeus / Skyscanner        │
    │  • OpenWeatherMap             │
    │  • CurrencyLayer              │
    │  • OpenRouteService           │
    └───────────────────────────────┘
```

### Agent Network

| Agent | Responsibility |
|-------|---------------|
| **Dream Interpreter** | Parses natural language travel wishes into structured parameters (destination, duration, budget, interests) |
| **Research Agent** | Fetches real-time data from Google Search, travel APIs, and MCP tools |
| **Logistics Agent** | Optimizes routing, scheduling, and day-by-day itineraries |
| **Budget Agent** | Calculates realistic costs, manages constraints, and generates smart alternatives |
| **Memory Agent** | Maintains user context and preferences across sessions |

---

## ✨ Core Features

### 1️⃣ Dream Interpretation
- **Natural language parsing** - Just describe your dream trip
- **Automatic parameter extraction** - Destination, duration, budget, and interests
- **Interactive clarification** - Refine details through an intuitive UI

### 2️⃣ Comprehensive Research
- **Real-time data** - Latest flight prices, hotel availability, activity reviews
- **Multi-source integration** - Google Search, Amadeus, weather APIs
- **Local insights** - Hidden gems and authentic experiences

### 3️⃣ Smart Itinerary Generation
- **Day-by-day optimization** - Morning, afternoon, and evening blocks
- **Proximity awareness** - Activities clustered by location
- **Budget-aware selection** - Realistic cost calculations based on quality level (Budget, Moderate, Luxury)
- **Travel time consideration** - Routing optimized for minimal transit

### 4️⃣ Intelligent Budget Management
- **Realistic cost calculation** - Based on actual market rates
- **Budget vs. Reality comparison** - Clear alerts when plans exceed budget
- **Smart alternatives** - Multiple actionable scenarios:
  - Reduce trip duration
  - Adjust quality level (Luxury → Budget-Friendly)
  - Alternative destinations

### 5️⃣ Interactive Refinement
- **Natural language adjustments** - "Make day 3 more cultural"
- **Budget slider** - Real-time rebalancing
- **Alternative exploration** - Compare different options
- **Export options** - PDF, iCal, JSON

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Google API Key** (for Gemini AI)
- Optional: **SERPAPI Key** (for advanced search)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/travel-dream-simulator.git
cd travel-dream-simulator

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Run backend server
uvicorn app.main:app --reload
# Backend runs on http://localhost:8000

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Environment Variables

Create a `backend/.env` file:

```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
SERPAPI_API_KEY=your_serpapi_key_here  # Optional
DATABASE_URL=sqlite:///./travel_dream.db  # Or PostgreSQL URL
```

---

## 🎭 Demo Flow

**User Input:**
```
"10-day Japan trip for cherry blossoms, culture, and food under $5,000"
```

**Agent Processing:**
1. **Dream Interpreter** → Extracts: `destination=Japan`, `duration=10 days`, `budget=$5000`, `interests=[cherry blossoms, culture, food]`
2. **Research Agent** → Searches cherry blossom forecasts, cultural events, restaurant reviews
3. **Logistics Agent** → Builds optimized daily routes (Tokyo → Kyoto → Osaka)
4. **Budget Agent** → Calculates realistic cost (e.g., $6,200 for moderate quality)

**Output Display:**
- ✅ Visual timeline with activity blocks
- ✅ Interactive map with pinned locations
- ✅ Budget tracker: Requested $5,000 vs. Realistic $6,200
- ⚠️ **Budget Alert** with 3 smart alternatives:
  - Option 1: 7-day trip for $4,500
  - Option 2: 10-day budget-friendly for $3,800
  - Option 3: 10-day moderate quality in Thailand for $4,200

**Refinement:**
- Click "Apply Option 2" → Redirects to clarification view with new parameters
- Adjust and regenerate itinerary

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** (App Router) | React framework with built-in routing and optimization |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Framer Motion** | Smooth animations and transitions |
| **React Query** | Data fetching, caching, and state management |
| **Axios** | HTTP client for API requests |
| **Lucide React** | Beautiful icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async Python API |
| **Google Generative AI (Gemini)** | LLM for agent reasoning |
| **Pydantic** | Data validation and serialization |
| **SQLModel** | Database ORM (PostgreSQL/SQLite) |
| **Uvicorn** | ASGI server |

### Agent Infrastructure
- **Google ADK** (Agent Development Kit) - Agent orchestration and management
- **MCP** (Model Context Protocol) - Standardized tool calling
- **Custom tool registry** - API integration wrappers
- **Graceful fallbacks** - Error handling for reliable service

## ✅ Capstone & ADK Demonstration

- Rich Tool Ecosystem: Grounded research using Google Custom Search (`research_agent.py`).
- State & Memory Management: Persistent context/history using file-backed `MemoryAgent` (`memory_agent.py`).
- Artifact Management: PDF export endpoint (`/api/v1/trip/export/pdf`) producing a binary artifact.
- Reporting/Logging: Request logging middleware for method/URL/status in `main.py`.

## 📈 Benchmarking

- Start backend server: `uvicorn app.main:app --reload`
- Run benchmark script: `python backend/scripts/benchmark_endpoints.py`
- Configure base URL with `BASE_URL` env var (default `http://localhost:8000`).
- Outputs cold vs warm `/generate` times to validate search caching and PDF export performance.

### External Integrations
- 🔍 **Google Search API** - Real-time information
- ✈️ **Amadeus Travel APIs** - Flights and hotels (planned)
- 📍 **Google Places API** - Points of interest (planned)
- 🌤️ **OpenWeatherMap** - Weather forecasts (planned)
- 💱 **CurrencyLayer** - Exchange rates (planned)
- 🗺️ **OpenRouteService** - Route optimization (planned)

---

## 📋 Development Roadmap

### ✅ Phase 1: Core Framework (Complete)
- [x] Next.js frontend with premium UI components
- [x] FastAPI backend with agent integration
- [x] Dream Interpreter Agent with fallback logic
- [x] Basic itinerary generation

### ✅ Phase 2: Budget Intelligence (Complete)
- [x] Realistic cost calculation
- [x] Budget vs. reality comparison
- [x] Smart alternative scenarios
- [x] Interactive clarification view

### 🚧 Phase 3: Data Integration (In Progress)
- [x] Integrate Google Search API (Google Custom Search)
- [ ] Add Amadeus flight/hotel APIs
- [x] Implement caching layer (in-memory for search queries)
- [ ] Weather and currency integration

### 📅 Phase 4: Advanced Features (Planned)
- [ ] Drag-and-drop itinerary editing
- [ ] Interactive maps (Mapbox)
- [ ] Multi-user collaboration
- [x] Export to PDF

### 🔮 Phase 5: Production & Scaling (Future)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Cloud deployment (Vercel + AWS)
- [ ] Performance optimization

---

## 🌟 Future Vision

### Immediate Enhancements
- **Real booking integration** - Instant flight/hotel confirmation
- **ML-powered routing** - Predictive travel time based on historical data
- **Voice interface** - Hands-free planning
- **Collaborative planning** - Voting systems for group trips

### Advanced Features
- **AI-generated destination previews** - Visual simulations of travel experiences
- **Predictive pricing** - Optimal booking timing recommendations
- **Local guide integration** - Hyper-personalized recommendations from locals
- **AR navigation** - In-destination augmented reality guidance

### Platform Expansion
- **Mobile apps** - iOS and Android with offline capabilities
- **Enterprise version** - Tools for travel agencies
- **Social features** - Traveler communities and reviews
- **Crisis management** - Real-time alerts and rebooking support

**Vision**: A comprehensive travel companion that handles everything from dream conception to return-home memories, making personalized, stress-free travel accessible to everyone through intelligent agent technology.

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Contact

For questions or feedback, please open an issue in this repository.

---

**Built with ❤️ using AI Agents**
