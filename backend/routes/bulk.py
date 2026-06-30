# Bulk routes updated to use anonymous auth context and generate emails (no Gmail send logic)
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from middleware.auth import verify_token
from services.bulk_generator import BulkGeneratorService

router = APIRouter()
bulk_generator = BulkGeneratorService()

class BulkGenerateRequest(BaseModel):
    jobs: List[dict]
    profile: dict
    mode_override: Optional[str] = None

@router.post("/bulk/validate")
async def validate_csv(file: UploadFile = File(...)):
    # Server side validation placeholder, client validation is primary
    return {"status": "ok", "message": "File received"}

@router.post("/bulk/generate")
async def generate_bulk(request: BulkGenerateRequest, user: dict = Depends(verify_token)):
    user_id = user['uid']
    
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
