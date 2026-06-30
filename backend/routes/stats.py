# Public stats route with simple 60-second caching for landing page counters
import time
from fastapi import APIRouter
from db.database import get_db

router = APIRouter()

_cache = {
    "data": None,
    "last_fetched": 0
}
CACHE_DURATION = 60  # seconds

@router.get("/stats/total-generated")
async def get_total_generated():
    now = time.time()
    # Check if cache is still valid
    if _cache["data"] is not None and (now - _cache["last_fetched"]) < CACHE_DURATION:
        return _cache["data"]

    try:
        async with get_db() as db:
            total_count = await db.fetchval("SELECT COUNT(*) FROM applications")
            this_week_count = await db.fetchval("SELECT COUNT(*) FROM applications WHERE created_at >= NOW() - INTERVAL '7 days'")
    except Exception as e:
        # Fallback to zero count if DB isn't initialized or crashes
        print(f"Error fetching stats: {str(e)}")
        return {"total": 0, "this_week": 0}

    _cache["data"] = {
        "total": total_count or 0,
        "this_week": this_week_count or 0
    }
    _cache["last_fetched"] = now

    return _cache["data"]
