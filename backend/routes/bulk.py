# Bulk routes updated to use Firebase auth context and asyncpg database insertion
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from middleware.auth import verify_token
from services.bulk_generator import BulkGeneratorService
from services.gmail_service import GmailService, TokenExpiredError
from db.database import get_db
import json
import asyncio
import os

router = APIRouter()
bulk_generator = BulkGeneratorService()
gmail_service = GmailService()

class BulkGenerateRequest(BaseModel):
    jobs: List[dict]
    profile: dict
    mode_override: Optional[str] = None

class BulkSendEmail(BaseModel):
    to: str
    subject: str
    body: str
    sign_off: str
    company_name: str
    role: str
    matched_skills: list = []
    mode_used: str = ""
    word_count: int = 0

class BulkSendRequest(BaseModel):
    emails: List[BulkSendEmail]

@router.post("/bulk/validate")
async def validate_csv(file: UploadFile = File(...)):
    # Server side validation placeholder, client validation is primary
    return {"status": "ok", "message": "File received"}

@router.post("/bulk/generate")
async def generate_bulk(request: BulkGenerateRequest, user: dict = Depends(verify_token)):
    user_id = user['uid']
    
    if len(request.jobs) > 25:
        raise HTTPException(status_code=400, detail="Cannot process more than 25 jobs at once")

    jobs = request.jobs
    if request.mode_override:
        for j in jobs:
            j["mode"] = request.mode_override

    return StreamingResponse(
        bulk_generator.generate_bulk(jobs, request.profile, user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

async def send_bulk_generator(emails: List[BulkSendEmail], gmail_token: str, user_id: str, user_name: str, user_email: str):
    total_sent = 0
    total_failed = 0
    message_ids = []
    token_expired = False

    for i, email in enumerate(emails):
        if token_expired:
            total_failed += 1
            yield f"data: {json.dumps({'event': 'send_error', 'index': i, 'company': email.company_name, 'error': 'Gmail token expired — reconnect Gmail in settings'})}\n\n"
            continue

        full_body = email.body + "\n\n" + email.sign_off
        
        try:
            try:
                send_result = await gmail_service.send_email(
                    gmail_access_token=gmail_token,
                    to=email.to,
                    subject=email.subject,
                    body=full_body,
                    from_name=user_name,
                    from_email=user_email
                )
            except TokenExpiredError:
                # With Firebase auth, we don't store refresh tokens on the backend database.
                # So we mark as expired and fail the remaining emails.
                token_expired = True
                raise Exception("Gmail token expired — reconnect Gmail in settings")

            # Insert to applications table using asyncpg
            try:
                async with get_db() as db:
                    await db.execute("""
                        INSERT INTO applications 
                        (user_id, company_name, role, hr_email, subject,
                         mode_used, matched_skills, word_count, 
                         gmail_message_id, status)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'sent')
                    """, user_id, email.company_name, email.role, email.to, email.subject,
                         email.mode_used, email.matched_skills, email.word_count,
                         send_result["message_id"])
            except Exception as db_ex:
                print(f"Warning DB insert failed: {str(db_ex)}")
            
            message_ids.append(send_result["message_id"])
            total_sent += 1
            yield f"data: {json.dumps({'event': 'sent', 'index': i, 'company': email.company_name, 'message_id': send_result['message_id'], 'status': 'sent'})}\n\n"

        except Exception as e:
            total_failed += 1
            yield f"data: {json.dumps({'event': 'send_error', 'index': i, 'company': email.company_name, 'error': str(e)})}\n\n"

        if i < len(emails) - 1:
            await asyncio.sleep(2)

    yield f"data: {json.dumps({'event': 'send_complete', 'total_sent': total_sent, 'total_failed': total_failed, 'message_ids': message_ids})}\n\n"

@router.post("/bulk/send")
async def send_bulk(
    request: BulkSendRequest, 
    user: dict = Depends(verify_token),
    x_gmail_token: Optional[str] = Header(None, alias="X-Gmail-Token")
):
    if not x_gmail_token:
        raise HTTPException(status_code=400, detail="Gmail token missing. Please sign in again.")

    user_id = user['uid']
    user_email = user['email']
    user_name = user.get('name') or "Candidate"
    
    if len(request.emails) > 25:
        raise HTTPException(status_code=400, detail="Cannot send more than 25 emails at once")

    return StreamingResponse(
        send_bulk_generator(request.emails, x_gmail_token, user_id, user_name, user_email),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )
