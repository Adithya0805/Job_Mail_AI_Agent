# Email send route using Firebase user context and client-passed Gmail tokens
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from middleware.auth import verify_token
from services.gmail_service import GmailService, GmailSendError
from db.database import get_db
import re

router = APIRouter()
gmail_service = GmailService()

class SendEmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    sign_off: str
    mode_used: Optional[str] = "unknown"
    matched_skills: Optional[List[str]] = []
    word_count: Optional[int] = 0
    job_description: Optional[str] = ""

def extract_company_name(email: str) -> str:
    try:
        domain = email.split('@')[1]
        parts = domain.split('.')
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
    if not jd: return "Unknown Role"
    first_line = jd.split('\n')[0].strip()
    role = first_line[:60]
    role = re.sub(r'[^\w\s]+$', '', role)
    return role if role else "Unknown Role"

@router.post("/send-email")
async def send_email_endpoint(
    payload: SendEmailRequest, 
    user: dict = Depends(verify_token),
    x_gmail_token: Optional[str] = Header(None, alias="X-Gmail-Token")
):
    if not x_gmail_token:
        raise HTTPException(status_code=400, detail="Gmail token missing. Please sign in again.")

    user_id = user['uid']
    user_email = user['email']
    user_name = user.get('name') or "Candidate"

    full_body = payload.body + "\n\n" + payload.sign_off

    try:
        # Send via Gmail using the token passed in the request header
        send_result = await gmail_service.send_email(
            gmail_access_token=x_gmail_token,
            to=payload.to,
            subject=payload.subject,
            body=full_body,
            from_name=user_name,
            from_email=user_email
        )

        # Insert to applications table
        try:
            company_name = extract_company_name(payload.to)
            role = extract_role(payload.job_description)
            
            async with get_db() as db:
                await db.execute("""
                    INSERT INTO applications 
                    (user_id, company_name, role, hr_email, subject,
                     mode_used, matched_skills, word_count, 
                     gmail_message_id, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'sent')
                """, user_id, company_name, role, payload.to, payload.subject,
                     payload.mode_used, payload.matched_skills, payload.word_count,
                     send_result['message_id'])
        except Exception as db_ex:
            print(f"Warning: Failed to insert application record: {str(db_ex)}")

        return send_result

    except GmailSendError as e:
        raise HTTPException(status_code=500, detail={"error": "Send failed", "detail": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Send failed", "detail": str(e)})
