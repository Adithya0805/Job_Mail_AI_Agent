from fastapi import APIRouter
from models.profile_model import Profile

router = APIRouter()

# POST route to validate profile
@router.post("/")
async def validate_profile(profile: Profile):
    # This route just accepts the profile, validates it automatically via Pydantic,
    # and returns a confirmation message. DB logic will come in Phase 3.
    return {
        "status": "ok",
        "message": "Profile saved"
    }
