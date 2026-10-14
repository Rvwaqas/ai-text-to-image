import logging
from fastapi import APIRouter

try:
    from app.schemas import GenerateRequest, GenerateResponse
    from app.services.image_generator import generate_image
except ImportError:
    from ..schemas import GenerateRequest, GenerateResponse
    from ..services.image_generator import generate_image

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """
    Generate an AI image from a text prompt using AI Horde distributed API.
    Handles queue timeouts, worker faults, and network errors.
    """
    try:
        image_data = generate_image(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            model=request.model,
            width=request.width,
            height=request.height,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
        )
        return GenerateResponse(success=True, image=image_data)
    except TimeoutError as te:
        logger.warning(f"AI Horde timeout: {te}")
        return GenerateResponse(
            success=False,
            error="Request timed out in AI Horde queue. High queue traffic, please retry in a moment."
        )
    except Exception as e:
        msg = str(e)
        logger.error(f"Image generation error: {msg}")

        if "401" in msg or "invalid api key" in msg.lower():
            error = "AI Horde authentication failed. Please check AI_HORDE_API_KEY in .env."
        elif "faulted" in msg.lower():
            error = "Worker error on AI Horde. Please retry your generation."
        elif "no available" in msg.lower():
            error = "No worker currently supports this model. Please select 'Auto / Any Model' and retry."
        elif "429" in msg or "too many" in msg.lower():
            error = "AI Horde rate limit reached. Please wait a minute and try again."
        else:
            error = f"Generation failed: {msg}"

        return GenerateResponse(success=False, error=error)
