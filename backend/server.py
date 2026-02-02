from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="nLPD Ypsys Form API",
    description="Backend API for the nLPD compliance assessment form",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ MODELS ============

class FormSubmissionCreate(BaseModel):
    """Model for creating a new form submission"""
    user_email: Optional[EmailStr] = None
    user_first_name: str
    user_last_name: Optional[str] = ""
    company_name: Optional[str] = "Non renseigné"
    company_size: Optional[str] = None
    industry: Optional[str] = None
    canton: Optional[str] = None
    answers: Dict[str, str]
    score_raw: int
    score_normalized: float
    risk_level: str
    consent_marketing: bool = False


class FormSubmission(BaseModel):
    """Model for form submission response"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Identity
    user_email: Optional[str] = None
    user_first_name: str
    user_last_name: Optional[str] = ""
    company_name: Optional[str] = "Non renseigné"
    company_size: Optional[str] = None
    industry: Optional[str] = None
    canton: Optional[str] = None
    
    # Answers
    answers: Dict[str, str]
    
    # Scoring
    score_raw: int
    score_normalized: float
    risk_level: str
    
    # Processing status
    status: str = "pending"
    teaser_text: Optional[str] = None
    
    # Consent
    consent_marketing: bool = False
    consent_timestamp: Optional[datetime] = None
    
    # Metadata
    session_id: Optional[str] = None


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class AnalyzePayload(BaseModel):
    """Payload for OpenAI analysis (matches frontend buildAnswerTexts + score)"""
    user: Dict[str, Any]
    answers: Dict[str, str]
    score: Dict[str, Any]
    has_email: bool = False


class AnalyzeRequest(BaseModel):
    payload: AnalyzePayload


# ============ IN-MEMORY STORAGE (for Railway without MongoDB) ============
# Note: In production, data is stored in Supabase from the frontend
# This is just for API compatibility

submissions_store = []
status_checks_store = []


# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "nLPD Ypsys Form API is running"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Form Submissions
@api_router.post("/submissions", response_model=FormSubmission)
async def create_submission(input: FormSubmissionCreate):
    """Create a new form submission"""
    try:
        submission_dict = input.model_dump()
        submission_obj = FormSubmission(
            **submission_dict,
            consent_timestamp=datetime.now(timezone.utc) if input.consent_marketing else None,
            session_id=str(uuid.uuid4())
        )
        
        # Store in memory (data is also stored in Supabase from frontend)
        submissions_store.append(submission_obj.model_dump())
        
        logging.info(f"New submission created: {submission_obj.id}")
        
        return submission_obj
        
    except Exception as e:
        logging.error(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/submissions", response_model=List[FormSubmission])
async def get_submissions(limit: int = 100, skip: int = 0):
    """Get all form submissions"""
    try:
        return submissions_store[skip:skip+limit]
    except Exception as e:
        logging.error(f"Error fetching submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/submissions/{submission_id}", response_model=FormSubmission)
async def get_submission(submission_id: str):
    """Get a specific form submission by ID"""
    try:
        for submission in submissions_store:
            if submission.get('id') == submission_id:
                return submission
        raise HTTPException(status_code=404, detail="Submission not found")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching submission {submission_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Statistics
@api_router.get("/stats")
async def get_statistics():
    """Get submission statistics"""
    try:
        total = len(submissions_store)
        
        risk_levels = {}
        industries = {}
        total_score = 0
        
        for sub in submissions_store:
            level = sub.get('risk_level')
            if level:
                risk_levels[level] = risk_levels.get(level, 0) + 1
            
            ind = sub.get('industry')
            if ind:
                industries[ind] = industries.get(ind, 0) + 1
            
            total_score += sub.get('score_normalized', 0)
        
        return {
            "total_submissions": total,
            "risk_levels": risk_levels,
            "industries": industries,
            "average_score": round(total_score / total, 2) if total > 0 else 0
        }
        
    except Exception as e:
        logging.error(f"Error fetching statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Legacy routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    status_checks_store.append(status_obj.model_dump())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    return status_checks_store


# ============ OPENAI ANALYSIS PROXY (avoids CORS / browser API key) ============

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_ASSISTANT_ID = os.environ.get("OPENAI_ASSISTANT_ID")


def _classify_lead(risk_level: str) -> str:
    mapping = {"red": "HOT", "orange": "WARM", "green": "COLD"}
    return mapping.get(risk_level, "WARM")


def _fallback_response(payload: dict) -> dict:
    user = payload.get("user", {})
    score = payload.get("score", {})
    company = user.get("company", "Votre organisation")
    first_name = user.get("first_name", "Utilisateur")
    normalized = score.get("normalized", 0)
    level = score.get("level", "orange")
    teasers = {
        "green": f"Bravo {first_name}! Votre organisation {company} obtient un score de {normalized}/10...",
        "orange": f"{first_name}, votre organisation {company} obtient un score de {normalized}/10...",
        "red": f"Attention {first_name}! Votre organisation {company} présente un score de {normalized}/10...",
    }
    return {
        "teaser": teasers.get(level, teasers["orange"]),
        "lead_temperature": _classify_lead(level),
        "email_user": None,
        "email_sales": None,
    }


@api_router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """Proxy OpenAI Assistant API so the frontend does not call OpenAI from the browser (CORS / key exposure)."""
    if not OPENAI_API_KEY or not OPENAI_ASSISTANT_ID:
        logger.warning("OpenAI not configured, returning fallback response")
        return _fallback_response(request.payload.model_dump())

    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    payload_dict = request.payload.model_dump()
    payload_str = __import__("json").dumps(payload_dict, indent=2)

    try:
        thread = client.beta.threads.create()
        client.beta.threads.messages.create(thread.id, role="user", content=payload_str)
        run = client.beta.threads.runs.create(thread.id, assistant_id=OPENAI_ASSISTANT_ID)

        max_wait = 45
        start = __import__("time").time()
        while run.status in ("queued", "in_progress"):
            if __import__("time").time() - start > max_wait:
                raise HTTPException(status_code=504, detail="OpenAI analysis timeout")
            __import__("time").sleep(1.5)
            run = client.beta.threads.runs.retrieve(thread.id, run.id)

        if run.status != "completed":
            raise HTTPException(
                status_code=502,
                detail=f"OpenAI run failed with status: {run.status}",
            )

        messages = client.beta.threads.messages.list(thread.id)
        assistant_msg = next((m for m in messages.data if m.role == "assistant"), None)
        if not assistant_msg or not assistant_msg.content or not assistant_msg.content[0]:
            raise HTTPException(status_code=502, detail="No response from OpenAI assistant")

        text = assistant_msg.content[0].text.value
        json_str = text
        if "```" in text:
            import re
            m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
            if m:
                json_str = m.group(1).strip()
        try:
            response = __import__("json").loads(json_str)
        except Exception as e:
            logger.warning("OpenAI response not valid JSON, using raw teaser: %s", e)
            return {
                "teaser": text[:800],
                "lead_temperature": _classify_lead(payload_dict.get("score", {}).get("level", "orange")),
                "email_user": None,
                "email_sales": None,
            }

        return {
            "teaser": response.get("teaser") or response.get("summary") or _fallback_response(payload_dict)["teaser"],
            "lead_temperature": response.get("lead_temperature") or _classify_lead(payload_dict.get("score", {}).get("level", "orange")),
            "email_user": response.get("email_user"),
            "email_sales": response.get("email_sales"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("OpenAI analysis error: %s", e)
        raise HTTPException(status_code=502, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (React build) in production
STATIC_DIR = ROOT_DIR / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR / "static")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA for all non-API routes"""
        # Check if it's an API route
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Check if file exists in static directory
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        
        # Otherwise serve index.html (SPA routing)
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        
        raise HTTPException(status_code=404, detail="Not found")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    logger.info("nLPD Ypsys Form API started")
    logger.info(f"Static directory exists: {STATIC_DIR.exists()}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("nLPD Ypsys Form API shutting down")
