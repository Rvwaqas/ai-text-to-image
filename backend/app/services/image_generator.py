import time
import base64
import logging
from typing import Optional
import requests

try:
    from app.config import settings
except ImportError:
    from ..config import settings

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
    """
    Generate an image using AI Horde (aihorde.net) free distributed GPU inference API.
    Returns the generated image as a base64 Data URL.
    """
    api_key = settings.ai_horde_api_key or "0000000000"
    base_url = settings.ai_horde_base_url.rstrip("/")

    headers = {
        "apikey": api_key,
        "Client-Agent": settings.client_agent,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Ensure dimensions are multiples of 64, clamped between 64 and 1024
    w = max(64, min(1024, (width // 64) * 64))
    h = max(64, min(1024, (height // 64) * 64))
    steps = max(10, min(50, num_inference_steps))
    cfg = max(1.0, min(20.0, float(guidance_scale)))

    # In AI Horde, negative prompt is appended with ### delimiter
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

    # If specific model requested (and not auto/default), add to payload
    if model and model.strip() and model.lower() not in ("auto", "any", "default"):
        payload["models"] = [model.strip()]

    logger.info(f"Submitting AI Horde async generation request for prompt: {prompt[:50]}...")

    # 1. Submit async job
    submit_resp = requests.post(
        f"{base_url}/generate/async",
        headers=headers,
        json=payload,
        timeout=30,
    )

    if not submit_resp.ok:
        try:
            err_msg = submit_resp.json().get("message", submit_resp.text)
        except Exception:
            err_msg = submit_resp.text
        raise RuntimeError(f"AI Horde submission failed ({submit_resp.status_code}): {err_msg}")

    job_data = submit_resp.json()
    job_id = job_data.get("id")
    if not job_id:
        raise RuntimeError("AI Horde did not return a valid job ID.")

    logger.info(f"AI Horde job queued with ID: {job_id}")

    # 2. Poll for job completion
    start_time = time.time()
    poll_interval = 3

    while True:
        elapsed = time.time() - start_time
        if elapsed > max_wait_seconds:
            raise TimeoutError(
                f"Generation timed out after {int(elapsed)} seconds in AI Horde queue. Please try again."
            )

        time.sleep(poll_interval)

        check_resp = requests.get(
            f"{base_url}/generate/check/{job_id}",
            headers=headers,
            timeout=30,
        )

        if not check_resp.ok:
            continue

        check_data = check_resp.json()

        if check_data.get("faulted"):
            raise RuntimeError("Image generation was marked as faulted by AI Horde worker.")

        if check_data.get("is_possible") is False:
            raise RuntimeError("No available AI Horde workers can service this model or parameters right now.")

        if check_data.get("done"):
            logger.info(f"AI Horde job {job_id} completed in {elapsed:.1f}s")
            break

    # 3. Retrieve final generated image
    status_resp = requests.get(
        f"{base_url}/generate/status/{job_id}",
        headers=headers,
        timeout=30,
    )
    status_resp.raise_for_status()
    result_data = status_resp.json()

    generations = result_data.get("generations", [])
    if not generations or not generations[0].get("img"):
        raise RuntimeError("No image returned from AI Horde.")

    img_data = generations[0]["img"]

    # AI Horde either returns a direct web URL (e.g. R2 storage) or raw base64 string
    if img_data.startswith("http://") or img_data.startswith("https://"):
        img_dl = requests.get(img_data, timeout=60)
        img_dl.raise_for_status()
        content_type = img_dl.headers.get("content-type", "image/webp")
        b64_str = base64.b64encode(img_dl.content).decode("utf-8")
        return f"data:{content_type};base64,{b64_str}"
    elif img_data.startswith("data:"):
        return img_data
    else:
        # Raw base64 string (usually WebP or PNG)
        return f"data:image/webp;base64,{img_data}"
