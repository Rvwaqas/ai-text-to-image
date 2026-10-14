# Code Templates — Next.js + FastAPI + AI Horde

## Backend

### requirements.txt
```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
python-dotenv>=1.0.1
requests>=2.31.0
Pillow>=10.4.0
pydantic>=2.9.0
pydantic-settings>=2.5.0
```

### backend/app/config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ai_horde_api_key: str = "0000000000"
    ai_horde_base_url: str = "https://aihorde.net/api/v2"
    client_agent: str = "ai-image-studio:1.0:user@example.com"
    default_model: str = "stable_diffusion"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
```

### backend/app/schemas.py
```python
from pydantic import BaseModel, Field
from typing import Optional

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1500)
    negative_prompt: Optional[str] = None
    model: Optional[str] = None
    width: int = 512
    height: int = 512
    num_inference_steps: int = 25
    guidance_scale: float = 7.5

class GenerateResponse(BaseModel):
    success: bool
    image: Optional[str] = None
    error: Optional[str] = None
```

### backend/app/services/image_generator.py
```python
import time
import base64
import logging
from typing import Optional
import requests
from app.config import settings

logger = logging.getLogger(__name__)

def generate_image(
    prompt: str,
    negative_prompt: Optional[str] = None,
    model: Optional[str] = None,
    width: int = 512,
    height: int = 512,
    num_inference_steps: int = 25,
    guidance_scale: float = 7.5,
    max_wait_seconds: int = 150,
) -> str:
    api_key = settings.ai_horde_api_key or "0000000000"
    base_url = settings.ai_horde_base_url.rstrip("/")

    headers = {
        "apikey": api_key,
        "Client-Agent": settings.client_agent,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    w = max(64, min(1024, (width // 64) * 64))
    h = max(64, min(1024, (height // 64) * 64))
    steps = max(10, min(50, num_inference_steps))
    cfg = max(1.0, min(20.0, float(guidance_scale)))

    full_prompt = prompt.strip()
    if negative_prompt and negative_prompt.strip():
        full_prompt = f"{full_prompt} ### {negative_prompt.strip()}"

    payload = {
        "prompt": full_prompt,
        "params": {
            "sampler_name": "k_euler_a",
            "cfg_scale": cfg,
            "steps": steps,
            "width": w,
            "height": h,
            "n": 1,
        },
        "nsfw": False,
        "censor_nsfw": True,
    }

    if model and model.strip() and model.lower() not in ("auto", "any", "default"):
        payload["models"] = [model.strip()]

    submit_resp = requests.post(f"{base_url}/generate/async", headers=headers, json=payload, timeout=30)
    submit_resp.raise_for_status()
    job_id = submit_resp.json()["id"]

    start_time = time.time()
    while True:
        elapsed = time.time() - start_time
        if elapsed > max_wait_seconds:
            raise TimeoutError("Generation timed out in AI Horde queue.")

        time.sleep(3)
        check_resp = requests.get(f"{base_url}/generate/check/{job_id}", headers=headers, timeout=30)
        if not check_resp.ok:
            continue
        data = check_resp.json()
        if data.get("faulted"):
            raise RuntimeError("Image generation was marked as faulted by worker.")
        if data.get("done"):
            break

    status_resp = requests.get(f"{base_url}/generate/status/{job_id}", headers=headers, timeout=30)
    status_resp.raise_for_status()
    img_data = status_resp.json()["generations"][0]["img"]

    if img_data.startswith("http://") or img_data.startswith("https://"):
        img_dl = requests.get(img_data, timeout=60)
        img_dl.raise_for_status()
        content_type = img_dl.headers.get("content-type", "image/webp")
        b64_str = base64.b64encode(img_dl.content).decode("utf-8")
        return f"data:{content_type};base64,{b64_str}"
    elif img_data.startswith("data:"):
        return img_data
    else:
        return f"data:image/webp;base64,{img_data}"
```

### backend/main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate

app = FastAPI(title="AI Horde Text-to-Image API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Horde Text-to-Image API is running"}
```
