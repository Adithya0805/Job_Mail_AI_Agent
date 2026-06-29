import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import profile
from routes import generate
from routes import send_email
from routes import applications
from routes import bulk

# Main FastAPI application — Production Ready (Phase 4 Complete)
app = FastAPI(title="Job Mail AI Backend", version="1.0.0")

# Build allowed origins from FRONTEND_URL env var (comma-separated for multiple URLs)
# Always include localhost for local development
allowed_origins = [
    "http://localhost:5173",
    *[url.strip() for url in os.getenv("FRONTEND_URL", "").split(",") if url.strip()]
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(generate.router, prefix="/api/generate", tags=["Generate"])
app.include_router(send_email.router, prefix="/api/send-email", tags=["Send Email"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(bulk.router, prefix="/api/bulk", tags=["Bulk"])

@app.get("/")
async def root():
    return {"message": "Welcome to Job Mail AI Backend"}

# Health check endpoint — no auth required. Used by Railway to verify deployment health.
@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
