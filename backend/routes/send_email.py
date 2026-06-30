# Route for logging copied cover letter applications into the database
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from middleware.auth import verify_token
from db.database import get_db

router = APIRouter()

class LogApplicationRequest(BaseModel):
    to: str
    subject: str
    body: str
    sign_off: str
    company_name: str
    role: str
    mode_used: Optional[str] = "unknown"
    matched_skills: Optional[List[str]] = []
    word_count: Optional[int] = 0

@router.post("/applications/log")
async def log_application_endpoint(
    payload: LogApplicationRequest, 
    user: dict = Depends(verify_token)
):
    user_id = user['uid']

    try:
        async with get_db() as db:
            await db.execute("""
                INSERT INTO applications 
                (user_id, company_name, role, hr_email, subject,
                 mode_used, matched_skills, word_count, 
                 gmail_message_id, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'copied')
            """, user_id, payload.company_name, payload.role, payload.to, payload.subject,
                 payload.mode_used, payload.matched_skills, payload.word_count,
                 None) # No Gmail message ID for copied letters
        return {"status": "success", "message": "Application logged successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Log failed", "detail": str(e)})
