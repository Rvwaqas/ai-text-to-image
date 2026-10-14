---
name: nextjs-aihorde-text-to-image
description: Build a professional AI Text-to-Image Generator with Next.js frontend and FastAPI (Python) backend using AI Horde (aihorde.net) free distributed GPU inference API.
---

# Next.js Frontend + FastAPI Backend — AI Horde Text-to-Image Generator

## 1. Project Scope (Complete)

**Project Name:** AI Text-to-Image Generator  
**Architecture:** Separated Frontend + Backend  
**Inference Provider:** AI Horde (https://aihorde.net) — Free crowdsourced distributed GPU network  
**Primary Goal:** User types prompt in Next.js UI → request goes to FastAPI backend → FastAPI calls AI Horde async endpoint → polls for completion → image returns as base64 → Next.js displays it.

### What this project MUST do
- Next.js handles only UI (prompt form, loading, image display, download)
- FastAPI handles all business logic + AI Horde API polling
- Secure token handling (`AI_HORDE_API_KEY` only on Python side in `.env`)
- CORS properly configured so Next.js can call FastAPI
- Return image as base64 data URL
- Clear loading, queue polling, and error states
- Deployable: Next.js on Vercel, FastAPI on Railway / Render / Fly.io

---

## 2. API Contract (FastAPI)

**Endpoint:** `POST /api/generate`

**Request Body:**
```json
{
  "prompt": "a majestic lion in cyberpunk city",
  "negative_prompt": "blurry, low quality",
  "model": "stable_diffusion",
  "width": 512,
  "height": 512,
  "num_inference_steps": 25,
  "guidance_scale": 7.5
}
```

**Success Response:**
```json
{
  "success": true,
  "image": "data:image/webp;base64,UklGRv..."
}
```

---

## 3. Environment Variables

### Backend (`backend/.env`)
```
AI_HORDE_API_KEY=your_ai_horde_api_key_here
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
