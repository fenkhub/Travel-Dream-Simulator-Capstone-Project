from fastapi import FastAPI, Request
from app.core.config import settings
from app.api.endpoints_trip import router as trip_router

from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL, logging.INFO))
logger = logging.getLogger("travel_dream")
app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trip_router, prefix="/api/v1/trip", tags=["trip"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Travel Dream Simulator API"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"{response.status_code} {request.url}")
    return response
