# Backend route to handle resume file upload, validation, and AI parsing
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
from middleware.auth import verify_token
from services.resume_parser import ResumeParserService, ScanDetectedError, ParsingError

router = APIRouter()
resume_service = ResumeParserService()

@router.post("/resume/parse")
async def parse_resume(
    file: UploadFile = File(...),
    user: dict = Depends(verify_token)
):
    # 1. Validate file extension
    filename = file.filename or ""
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    if extension not in ["pdf", "docx"]:
        return JSONResponse(
            status_code=400,
            content={
                "error": "invalid_file_type",
                "message": "Only PDF and DOCX files are allowed."
            }
        )

    # 2. Read content and validate file size (max 5MB)
    content = await file.read()
    max_size = 5 * 1024 * 1024  # 5MB
    if len(content) > max_size:
        return JSONResponse(
            status_code=400,
            content={
                "error": "file_too_large",
                "message": "File size exceeds the 5MB limit."
            }
        )

    # 3. Parse resume text and extract profile fields
    try:
        result = resume_service.parse_resume(content, extension)
        return result
    except ScanDetectedError as e:
        return JSONResponse(
            status_code=400,
            content={
                "error": "scan_detected",
                "message": str(e)
            }
        )
    except ParsingError as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "parsing_failed",
                "message": "Couldn't read this file — try a different PDF/DOCX, or fill in manually."
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "unexpected_error",
                "message": f"An unexpected error occurred: {str(e)}"
            }
        )
