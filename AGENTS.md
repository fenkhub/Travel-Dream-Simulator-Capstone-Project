# AGENTS.md

## Build, Lint, Test Commands

### Backend (Python/FastAPI)
```bash
# Run backend server
cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run all tests
cd backend && pytest

# Run single test file
cd backend && pytest tests/test_interpret_normalization.py

# Run single test function
cd backend && pytest tests/test_interpret_normalization.py::test_interpret_normalizes_destination_and_budget_and_duration

# Run tests with verbose output
cd backend && pytest -v

# Install dependencies
cd backend && uv sync
```

### Frontend (Next.js/TypeScript)
```bash
# Start dev server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Start production server
cd frontend && npm run start

# Lint code
cd frontend && npm run lint

# Install dependencies
cd frontend && npm install
```

## Code Style Guidelines

### Python (Backend)
- Use **async/await** for API endpoints and agent operations
- **Type hints** required for all function parameters and return values
- **Pydantic models** in `app/models/` using `Field(default_factory=...)` for mutable defaults
- **Agents** inherit from `BaseAgent` in `app/agents/base.py`, implement `process()` async method
- **API endpoints** in `app/api/` using FastAPI router, raise `HTTPException(status_code=500, detail=str(e))` for errors
- **Configuration** via `pydantic-settings.BaseSettings` in `app/core/config.py`, load from `.env`
- **Error handling**: wrap in try/except, log errors, provide meaningful error messages
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Imports**: standard library, third-party, local (alphabetical within each group)
- **Logging**: use `logging` module, configure level via `settings.LOG_LEVEL`

### TypeScript/React (Frontend)
- **'use client'** directive at top of components using hooks/interactivity
- **Functional components** with hooks, no class components
- **TypeScript strict mode** enabled, proper typing for props and state
- **Tailwind CSS** for styling with `cn()` utility from `lib/utils.ts` for className merging
- **Imports**: React imports first, then third-party (grouped), then local relative imports
- **Component files**: use PascalCase, export default
- **API calls**: use axios or fetch within React Query hooks for caching/mutations
- **Icons**: from lucide-react
- **Animations**: framer-motion `<motion.div>` with `animate`, `transition` props
- **Color theme**: deep ocean/dreamscape palette, use custom CSS variables defined in `app/globals.css`
- **Glass panels**: use `.glass-panel` utility class for translucent UI elements
- **Gradients**: use `.text-gradient` or `.text-gradient-gold` utility classes
- **Path aliases**: `@/*` points to frontend root (e.g., `@/components/Hero`)

### Project Structure
```
backend/
├── app/
│   ├── api/          # FastAPI endpoints
│   ├── agents/       # AI agents (BaseAgent inheritance)
│   ├── core/         # Configuration, utilities
│   ├── models/       # Pydantic models
│   └── integrations/ # External API wrappers
└── tests/            # Pytest test files

frontend/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utilities (cn function, API clients)
└── public/           # Static assets
```

### General Rules
- **No comments** unless explicitly requested
- Follow existing patterns in codebase
- All agents must implement `async process()` method
- API endpoints must use appropriate HTTP status codes
- Components should be reusable and properly typed
- Use environment variables for secrets/API keys
- CORS configured for `http://localhost:3000` on backend
