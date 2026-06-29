from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from middleware.auth import verify_token
from services.gmail_service import GmailService, TokenExpiredError, GmailSendError
from services.supabase_admin import SupabaseAdmin
import httpx
import os
import re

router = APIRouter()
gmail_service = GmailService()
supabase_admin = SupabaseAdmin()

class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    sign_off: str
    # Fields needed for application tracking
    mode_used: Optional[str] = None
    matched_skills: Optional[list] = []
    word_count: Optional[int] = 0
    job_description: Optional[str] = ""

def extract_company_name(email: str) -> str:
    """hr@infosys.com -> Infosys, careers@hire.amazon.com -> Amazon"""
    try:
        domain = email.split('@')[1]
        parts = domain.split('.')
        # Ex: hire.amazon.com -> parts = ['hire', 'amazon', 'com']
        # Typically the company name is the second to last part if > 2 parts (like co.in or subdomains)
        # Simple heuristic: if len > 2 and last is short, pick the longest or just second to last
        if len(parts) > 2:
            if parts[-2] in ['co', 'com', 'org'] and len(parts) >= 3:
                name = parts[-3]
            else:
                name = parts[-2]
        else:
            name = parts[0]
        return name.title()
    except:
        return "Unknown Company"

def extract_role(jd: str) -> str:
    """Parse role from first line of job_description (take first 60 chars, clean punctuation)"""
    if not jd: return "Unknown Role"
    first_line = jd.split('\n')[0].strip()
    role = first_line[:60]
    # clean basic trailing punctuation
    role = re.sub(r'[^\w\s]+$', '', role)
    return role if role else "Unknown Role"

@router.post("/")
async def send_email_endpoint(payload: SendEmailRequest, user: dict = Depends(verify_token)):
    user_id = user.get("id")
    user_email = user.get("email")
    user_name = user.get("user_metadata", {}).get("full_name", "Candidate")
    
    try:
        # 1. Get tokens from Supabase
        tokens = await supabase_admin.get_gmail_token(user_id)
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
        
        # 2. Prepare message
        full_body = payload.body + "\n\n" + payload.sign_off
        
        # 3. Send via Gmail (with 1 retry for expired token)
        try:
            send_result = await gmail_service.send_email(
                gmail_access_token=access_token,
                to=payload.to,
                subject=payload.subject,
                body=full_body,
                from_name=user_name,
                from_email=user_email
            )
        except TokenExpiredError:
            if not refresh_token:
                raise Exception("Token expired and no refresh token available")
            
            # Refresh token
            new_access_token = await gmail_service.refresh_access_token(refresh_token)
            
            # Retry send
            send_result = await gmail_service.send_email(
                gmail_access_token=new_access_token,
                to=payload.to,
                subject=payload.subject,
                body=full_body,
                from_name=user_name,
                from_email=user_email
            )

        # --- Phase 3-C: Insert to Applications Table ---
        try:
            company_name = extract_company_name(payload.to)
            role = extract_role(payload.job_description)
            
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
                    "company_name": company_name,
                    "role": role,
                    "hr_email": payload.to,
                    "subject": payload.subject,
                    "mode_used": payload.mode_used or "unknown",
                    "matched_skills": payload.matched_skills or [],
                    "word_count": payload.word_count or 0,
                    "gmail_message_id": send_result["message_id"],
                    "status": "sent"
                }
                db_res = await client.post(db_url, headers=db_headers, json=db_payload)
                if db_res.status_code >= 400:
                    print(f"Warning: Failed to insert application record: {db_res.text}")
        except Exception as db_ex:
            # Do NOT fail the send response if DB insert fails
            print(f"Warning: DB Insert exception: {str(db_ex)}")
        # -----------------------------------------------

        return send_result
        
    except GmailSendError as e:
        raise HTTPException(status_code=500, detail={"error": "Send failed", "detail": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Send failed", "detail": str(e)})
