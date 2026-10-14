from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.routers import generate
except ImportError:
    from .app.routers import generate

app = FastAPI(
    title="AI Text-to-Image API",
    description="FastAPI backend for AI Text-to-Image generation using Hugging Face Inference API",
    version="1.0.0",
)

# CORS configuration allowing Next.js frontend (localhost:3000) and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register /api/generate router
app.include_router(generate.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Text-to-Image API is running"}
