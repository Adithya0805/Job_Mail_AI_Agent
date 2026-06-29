# Auth middleware verifying Firebase ID token
from fastapi import Header, HTTPException
from firebase_admin_setup import verify_firebase_token

async def verify_token(authorization: str = Header()) -> dict:
    if not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Missing Bearer token')
    id_token = authorization.split(' ')[1]
    try:
        user = verify_firebase_token(id_token)
        return user
    except Exception as e:
        raise HTTPException(401, f'Invalid token: {str(e)}')
