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
