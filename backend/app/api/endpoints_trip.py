from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.models.trip import TripParameters, TripPlan
from app.agents.dream_interpreter import DreamInterpreterAgent
from app.agents.research_agent import ResearchAgent
from app.agents.logistics_agent import LogisticsAgent
from app.agents.budget_agent import BudgetAgent
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

class TripRequest(BaseModel):
    description: str

@router.post("/interpret", response_model=TripParameters)
async def interpret_dream(request: TripRequest):
    try:
        dream_agent = DreamInterpreterAgent(api_key=settings.GOOGLE_API_KEY)
        params = await dream_agent.process(request.description)
        return params
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=TripPlan)
async def generate_trip(params: TripParameters):
    try:
        # Initialize Agents
        research_agent = ResearchAgent(api_key=settings.GOOGLE_API_KEY, google_api_key=settings.GOOGLE_API_KEY, google_cse_id=settings.GOOGLE_CSE_ID)
        logistics_agent = LogisticsAgent(api_key=settings.GOOGLE_API_KEY)
        budget_agent = BudgetAgent(api_key=settings.GOOGLE_API_KEY)

        # 2. Research
        findings = await research_agent.process(params)
        
        # 3. Logistics (Itinerary)
        itinerary = await logistics_agent.process(params, findings)
        
        # 4. Budget
        budget_info = await budget_agent.process(params, itinerary)
        
        return TripPlan(
            parameters=params,
            itinerary=itinerary,
            budget_info=budget_info,
            research_info=findings,
            status="generated"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/pdf")
async def export_pdf(plan: TripPlan):
    try:
        from io import BytesIO
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 50
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, f"Travel Plan: {plan.parameters.destination}")
        y -= 20
        c.setFont("Helvetica", 12)
        c.drawString(50, y, f"Duration: {plan.parameters.duration_days} days")
        y -= 20
        c.drawString(50, y, f"Travelers: {plan.parameters.travelers}")
        y -= 30
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Itinerary")
        y -= 20
        c.setFont("Helvetica", 10)
        for day in plan.itinerary:
            if y < 100:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 10)
            c.drawString(50, y, f"Day {day.get('day_number', '')}")
            y -= 15
            for slot in ["morning", "afternoon", "evening"]:
                s = day.get(slot, {})
                c.drawString(60, y, f"{slot.title()}: {s.get('activity', '')} - {s.get('description', '')}")
                y -= 15
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        return Response(content=pdf, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
