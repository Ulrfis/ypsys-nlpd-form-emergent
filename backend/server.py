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
