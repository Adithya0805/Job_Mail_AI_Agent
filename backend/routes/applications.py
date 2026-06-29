from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
from middleware.auth import verify_token
import httpx
import os

router = APIRouter()

class StatusUpdateRequest(BaseModel):
    status: str # "sent | replied | interview | rejected | offer"

def get_supabase_client():
    supabase_url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_KEY")
    return supabase_url, service_key

@router.get("/")
async def get_applications(user: dict = Depends(verify_token)):
    user_id = user.get("id")
    supabase_url, service_key = get_supabase_client()
    
    url = f"{supabase_url}/rest/v1/applications?user_id=eq.{user_id}&order=created_at.desc"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch applications")
        return response.json()

@router.patch("/{app_id}/status")
async def update_status(app_id: str, payload: StatusUpdateRequest, user: dict = Depends(verify_token)):
    user_id = user.get("id")
    supabase_url, service_key = get_supabase_client()
    
    url = f"{supabase_url}/rest/v1/applications?id=eq.{app_id}&user_id=eq.{user_id}"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    # updated_at will be set implicitly by DB if using triggers, but doing explicitly just in case
    data = {
        "status": payload.status,
        "updated_at": "now()"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.patch(url, headers=headers, json=data)
        if response.status_code >= 400:
            raise HTTPException(status_code=500, detail="Failed to update application")
        
        result = response.json()
        if not result:
            raise HTTPException(status_code=404, detail="Application not found or unauthorized")
        return result[0]

@router.delete("/{app_id}")
async def delete_application(app_id: str, user: dict = Depends(verify_token)):
    user_id = user.get("id")
    supabase_url, service_key = get_supabase_client()
    
    url = f"{supabase_url}/rest/v1/applications?id=eq.{app_id}&user_id=eq.{user_id}"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.delete(url, headers=headers)
        if response.status_code >= 400:
            raise HTTPException(status_code=500, detail="Failed to delete application")
        
        return {"deleted": True}
