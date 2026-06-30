# Email generation route using Firebase Auth and Gemini AI
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from services.gemini_service import GeminiService
from models.profile_model import Profile
from middleware.auth import verify_token

router = APIRouter()
gemini_service = GeminiService()

@router.post("/generate")
async def generate_email_endpoint(payload: Dict[str, Any], user: dict = Depends(verify_token)):
    try:
        user_id = user.get("uid")
        print(f"[AUTH] Email generation triggered by user: {user_id}")

        # Validate profile using Pydantic model
        profile_data = payload.get("profile", {})
        Profile(**profile_data)

        # Call Gemini service
        response = gemini_service.generate_email(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Generation failed", "detail": str(e)})
