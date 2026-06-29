import asyncio
import json
from services.gemini_service import GeminiService

class BulkGeneratorService:
    def __init__(self):
        self.gemini_service = GeminiService()

    async def generate_bulk(self, jobs: list, profile: dict, user_id: str):
        total = len(jobs)
        total_generated = 0
        total_failed = 0

        for i, job in enumerate(jobs):
            payload = {
                "profile": profile,
                "job_input": {
                    "hr_email": job.get("hr_email"),
                    "job_description": job.get("job_description")
                },
                "selected_mode": job.get("mode")
            }

            try:
                email_data = self.gemini_service.generate_email(payload)
                
                event = {
                    "event": "progress",
                    "index": i,
                    "total": total,
                    "company": job.get("company_name"),
                    "role": job.get("role"),
                    "status": "generated",
                    "email_data": email_data
                }
                yield f"data: {json.dumps(event)}\n\n"
                total_generated += 1
                
            except Exception as e:
                event = {
                    "event": "error",
                    "index": i,
                    "company": job.get("company_name"),
                    "error": str(e)
                }
                yield f"data: {json.dumps(event)}\n\n"
                total_failed += 1

            # Sleep 4 seconds between calls to respect Gemini free tier (15 RPM)
            if i < total - 1:
                await asyncio.sleep(4)
                
        complete_event = {
            "event": "complete",
            "total_generated": total_generated,
            "total_failed": total_failed
        }
        yield f"data: {json.dumps(complete_event)}\n\n"
