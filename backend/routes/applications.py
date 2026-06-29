# Applications routes performing CRUD operations via PostgreSQL asyncpg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import verify_token
from db.database import get_db
import uuid

router = APIRouter()

class UpdateStatusRequest(BaseModel):
    status: str

@router.get("/applications")
async def get_applications(user: dict = Depends(verify_token)):
    async with get_db() as db:
        rows = await db.fetch("""
            SELECT id, user_id, company_name, role, hr_email, subject, 
                   mode_used, matched_skills, word_count, gmail_message_id, 
                   status, created_at, updated_at 
            FROM applications 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        """, user['uid'])
    
    # Convert Records to standard Python dictionaries.
    # UUIDs and datetimes are automatically serialized to JSON by FastAPI.
    return [dict(r) for r in rows]

@router.patch("/applications/{id}/status")
async def update_application_status(
    id: str, 
    payload: UpdateStatusRequest, 
    user: dict = Depends(verify_token)
):
    try:
        app_uuid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID format")

    async with get_db() as db:
        row = await db.fetchrow("""
            UPDATE applications 
            SET status=$1, updated_at=NOW()
            WHERE id=$2 AND user_id=$3
            RETURNING *
        """, payload.status, app_uuid, user['uid'])
        
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return dict(row)

@router.delete("/applications/{id}")
async def delete_application(id: str, user: dict = Depends(verify_token)):
    try:
        app_uuid = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID format")

    async with get_db() as db:
        await db.execute("""
            DELETE FROM applications 
            WHERE id=$1 AND user_id=$2
        """, app_uuid, user['uid'])
        
    return {"deleted": True}
