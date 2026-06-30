# Main FastAPI application entry point with Firebase and asyncpg lifecycles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from db.database import get_pool, close_pool
from db.migrations import run_migrations
from routes import profile, generate, send_email, applications, bulk, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run DB migrations on startup
    await run_migrations()
    # Initialize connection pool
    await get_pool()
    print("DB pool ready")
    yield
    # Close connection pool on shutdown
    await close_pool()
    print("DB pool closed")

app = FastAPI(title="Job Mail AI Backend", version="1.0.0", lifespan=lifespan)

allowed_origins = [
    "http://localhost:5173",
    *[u.strip() for u in os.getenv("FRONTEND_URL", "").split(",") if u.strip()]
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized prefix for all routes
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(generate.router, prefix="/api", tags=["Generate"])
app.include_router(send_email.router, prefix="/api", tags=["Send Email"])
app.include_router(applications.router, prefix="/api", tags=["Applications"])
app.include_router(bulk.router, prefix="/api", tags=["Bulk"])
app.include_router(stats.router, prefix="/api", tags=["Stats"])

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
