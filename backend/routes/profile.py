# User Profile routes storing and retrieving from PostgreSQL JSONB
from fastapi import APIRouter, Depends, HTTPException
from models.profile_model import Profile
from middleware.auth import verify_token
from db.database import get_db
import json

router = APIRouter()

@router.post("/profile")
async def save_profile(profile: Profile, user: dict = Depends(verify_token)):
    user_id = user['uid']
    # Serialize profile Pydantic model to JSON string for Postgres JSONB storage
    profile_json = profile.model_dump_json()
    
    async with get_db() as db:
        await db.execute("""
            INSERT INTO profiles (user_id, profile_data, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id) DO UPDATE
            SET profile_data = $2, updated_at = NOW()
        """, user_id, profile_json)
        
    return {"status": "ok", "message": "Profile saved successfully"}

@router.get("/profile")
async def get_profile(user: dict = Depends(verify_token)):
    user_id = user['uid']
    
    async with get_db() as db:
        row = await db.fetchrow("SELECT profile_data FROM profiles WHERE user_id = $1", user_id)
        
    if not row:
        return {}
        
    profile_data = row['profile_data']
    # asyncpg automatically decodes JSONB columns into Python dict/list.
    # We fallback to json.loads if it was loaded as a string.
    if isinstance(profile_data, str):
        profile_data = json.loads(profile_data)
        
    return profile_data
