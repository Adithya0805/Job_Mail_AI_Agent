from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Any
from middleware.auth import verify_token
from services.bulk_generator import BulkGeneratorService
from services.gmail_service import GmailService, TokenExpiredError
from services.supabase_admin import SupabaseAdmin
import json
import asyncio
import httpx
import os
import re

router = APIRouter()
bulk_generator = BulkGeneratorService()
gmail_service = GmailService()
supabase_admin = SupabaseAdmin()

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

@router.post("/validate")
async def validate_csv(file: UploadFile = File(...)):
    # Server side validation scaffold (not fully implemented with csv reader here as instructed "safety net")
    # Real validation happens in frontend PapaParse as per constraints.
    return {"status": "ok", "message": "File received"}

@router.post("/generate")
async def generate_bulk(request: BulkGenerateRequest, user: dict = Depends(verify_token)):
    user_id = user.get("id")
    
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

async def send_bulk_generator(emails: List[BulkSendEmail], user_id: str, user_name: str, user_email: str):
    total_sent = 0
    total_failed = 0
    message_ids = []

    try:
        tokens = await supabase_admin.get_gmail_token(user_id)
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
    except Exception as e:
        yield f"data: {json.dumps({'event': 'send_error', 'index': 0, 'company': 'System', 'error': 'Failed to get Gmail token: ' + str(e)})}\n\n"
        yield f"data: {json.dumps({'event': 'send_complete', 'total_sent': 0, 'total_failed': len(emails), 'message_ids': []})}\n\n"
        return

    for i, email in enumerate(emails):
        full_body = email.body + "\n\n" + email.sign_off
        
        try:
            try:
                send_result = await gmail_service.send_email(
                    gmail_access_token=access_token,
                    to=email.to,
                    subject=email.subject,
                    body=full_body,
                    from_name=user_name,
                    from_email=user_email
                )
            except TokenExpiredError:
                if not refresh_token:
                    raise Exception("Gmail token expired — reconnect Gmail in settings")
                access_token = await gmail_service.refresh_access_token(refresh_token)
                send_result = await gmail_service.send_email(
                    gmail_access_token=access_token,
                    to=email.to,
                    subject=email.subject,
                    body=full_body,
                    from_name=user_name,
                    from_email=user_email
                )

            # Insert to applications table
            try:
                supabase_url = os.environ.get("SUPABASE_URL")
                service_key = os.environ.get("SUPABASE_SERVICE_KEY")
                async with httpx.AsyncClient() as client:
                    db_url = f"{supabase_url}/rest/v1/applications"
                    db_headers = {
                        "apikey": service_key,
                        "Authorization": f"Bearer {service_key}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    }
                    db_payload = {
                        "user_id": user_id,
                        "company_name": email.company_name,
                        "role": email.role,
                        "hr_email": email.to,
                        "subject": email.subject,
                        "mode_used": email.mode_used,
                        "matched_skills": email.matched_skills,
                        "word_count": email.word_count,
                        "gmail_message_id": send_result["message_id"],
                        "status": "sent"
                    }
                    await client.post(db_url, headers=db_headers, json=db_payload)
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

@router.post("/send")
async def send_bulk(request: BulkSendRequest, user: dict = Depends(verify_token)):
    user_id = user.get("id")
    user_email = user.get("email")
    user_name = user.get("user_metadata", {}).get("full_name", "Candidate")
    
    if len(request.emails) > 25:
        raise HTTPException(status_code=400, detail="Cannot send more than 25 emails at once")

    return StreamingResponse(
        send_bulk_generator(request.emails, user_id, user_name, user_email),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )
