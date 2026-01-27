from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
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
    user_email: EmailStr
    user_first_name: str
    user_last_name: str
    company_name: str
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
    user_email: str
    user_first_name: str
    user_last_name: str
    company_name: str
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
    device_type: Optional[str] = None
    utm_source: Optional[str] = None
    utm_campaign: Optional[str] = None


class EmailOutput(BaseModel):
    """Model for email outputs"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    submission_id: str
    
    # Generated content
    email_user_markdown: Optional[str] = None
    email_user_subject: Optional[str] = None
    email_sales_markdown: Optional[str] = None
    email_sales_subject: Optional[str] = None
    
    # Send status
    user_email_sent: bool = False
    user_email_sent_at: Optional[datetime] = None
    sales_email_sent: bool = False
    sales_email_sent_at: Optional[datetime] = None
    
    # Errors
    error_message: Optional[str] = None


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


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
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = submission_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        if doc.get('consent_timestamp'):
            doc['consent_timestamp'] = doc['consent_timestamp'].isoformat()
        
        # Insert into MongoDB
        await db.form_submissions.insert_one(doc)
        
        logging.info(f"New submission created: {submission_obj.id} for {submission_obj.user_email}")
        
        return submission_obj
        
    except Exception as e:
        logging.error(f"Error creating submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/submissions", response_model=List[FormSubmission])
async def get_submissions(limit: int = 100, skip: int = 0):
    """Get all form submissions"""
    try:
        submissions = await db.form_submissions.find(
            {}, 
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        # Convert ISO string timestamps back to datetime objects
        for submission in submissions:
            if isinstance(submission.get('created_at'), str):
                submission['created_at'] = datetime.fromisoformat(submission['created_at'])
            if isinstance(submission.get('consent_timestamp'), str):
                submission['consent_timestamp'] = datetime.fromisoformat(submission['consent_timestamp'])
        
        return submissions
        
    except Exception as e:
        logging.error(f"Error fetching submissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/submissions/{submission_id}", response_model=FormSubmission)
async def get_submission(submission_id: str):
    """Get a specific form submission by ID"""
    try:
        submission = await db.form_submissions.find_one(
            {"id": submission_id},
            {"_id": 0}
        )
        
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Convert ISO string timestamps back to datetime objects
        if isinstance(submission.get('created_at'), str):
            submission['created_at'] = datetime.fromisoformat(submission['created_at'])
        if isinstance(submission.get('consent_timestamp'), str):
            submission['consent_timestamp'] = datetime.fromisoformat(submission['consent_timestamp'])
        
        return submission
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching submission {submission_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.patch("/submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status: str, teaser_text: Optional[str] = None):
    """Update the status of a submission"""
    try:
        update_data = {"status": status}
        if teaser_text:
            update_data["teaser_text"] = teaser_text
            
        result = await db.form_submissions.update_one(
            {"id": submission_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {"message": "Status updated successfully", "id": submission_id, "status": status}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating submission status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Email Outputs
@api_router.post("/emails", response_model=EmailOutput)
async def create_email_output(submission_id: str, email_user_markdown: str, email_user_subject: str, 
                              email_sales_markdown: str, email_sales_subject: str):
    """Create email output records for a submission"""
    try:
        email_output = EmailOutput(
            submission_id=submission_id,
            email_user_markdown=email_user_markdown,
            email_user_subject=email_user_subject,
            email_sales_markdown=email_sales_markdown,
            email_sales_subject=email_sales_subject
        )
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = email_output.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        # Insert into MongoDB
        await db.email_outputs.insert_one(doc)
        
        logging.info(f"Email output created for submission: {submission_id}")
        
        return email_output
        
    except Exception as e:
        logging.error(f"Error creating email output: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/emails/{submission_id}", response_model=EmailOutput)
async def get_email_output(submission_id: str):
    """Get email output for a specific submission"""
    try:
        email_output = await db.email_outputs.find_one(
            {"submission_id": submission_id},
            {"_id": 0}
        )
        
        if not email_output:
            raise HTTPException(status_code=404, detail="Email output not found")
        
        # Convert ISO string timestamps back to datetime objects
        if isinstance(email_output.get('created_at'), str):
            email_output['created_at'] = datetime.fromisoformat(email_output['created_at'])
        
        return email_output
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching email output: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Statistics
@api_router.get("/stats")
async def get_statistics():
    """Get submission statistics"""
    try:
        total_submissions = await db.form_submissions.count_documents({})
        
        # Count by risk level
        risk_levels = await db.form_submissions.aggregate([
            {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
        ]).to_list(100)
        
        # Count by industry
        industries = await db.form_submissions.aggregate([
            {"$match": {"industry": {"$ne": None}}},
            {"$group": {"_id": "$industry", "count": {"$sum": 1}}}
        ]).to_list(100)
        
        # Average score
        avg_score = await db.form_submissions.aggregate([
            {"$group": {"_id": None, "avg_score": {"$avg": "$score_normalized"}}}
        ]).to_list(1)
        
        return {
            "total_submissions": total_submissions,
            "risk_levels": {r["_id"]: r["count"] for r in risk_levels if r["_id"]},
            "industries": {i["_id"]: i["count"] for i in industries if i["_id"]},
            "average_score": round(avg_score[0]["avg_score"], 2) if avg_score and avg_score[0].get("avg_score") else 0
        }
        
    except Exception as e:
        logging.error(f"Error fetching statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Legacy routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_event():
    logger.info("nLPD Ypsys Form API started")
    
    # Create indexes for better query performance
    await db.form_submissions.create_index("id", unique=True)
    await db.form_submissions.create_index("user_email")
    await db.form_submissions.create_index("status")
    await db.form_submissions.create_index("created_at")
    await db.email_outputs.create_index("submission_id")
    
    logger.info("Database indexes created")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Database connection closed")
