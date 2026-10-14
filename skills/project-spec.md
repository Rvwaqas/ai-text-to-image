# Project Specification — Next.js + FastAPI + AI Horde Text-to-Image

## Architecture
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind
- Backend: FastAPI (Python 3.11+)
- Provider: AI Horde (https://aihorde.net) — Free distributed GPU cluster
- Communication: REST API over HTTP
- Image delivery: Base64 data URL

## Backend Responsibilities
- Receive generation request
- Validate input with Pydantic
- Call AI Horde asynchronous API (`/generate/async` and poll `/generate/check/{id}`)
- Fetch and convert image bytes to base64 data URL
- Return structured JSON response
- Handle queue wait, timeouts, and worker faults

## Frontend Responsibilities
- Collect user input (prompt, negative prompt, dimensions, steps)
- Call backend API (`/api/generate`)
- Show loading / error / success states
- Display and allow download of generated image
- Completely decoupled from AI Horde credentials and logic

## Deployment
- Frontend → Vercel
- Backend → Railway / Render / Fly.io / any Python host
