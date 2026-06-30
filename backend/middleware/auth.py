# Auth middleware verifying X-User-ID header for anonymous database-backed sessions
from fastapi import Header, HTTPException

async def verify_token(x_user_id: str = Header(None, alias="X-User-ID")) -> dict:
    if not x_user_id or len(x_user_id.strip()) < 5:
        raise HTTPException(401, 'Missing or invalid X-User-ID header')
    # Returns equivalent user dictionary mapping for backend database compatibility
    return {
        'uid': x_user_id,
        'email': 'anonymous@jobmailai.com',
        'name': 'Candidate'
    }
