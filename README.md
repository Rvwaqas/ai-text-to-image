# AI Text-to-Image Generator (AI Horde + Next.js + FastAPI)

A modern, full-stack AI image generation platform built with **Next.js 15 (TypeScript + Tailwind CSS)** and a decoupled **FastAPI (Python)** backend utilizing the free crowdsourced GPU cluster **AI Horde (https://aihorde.net)**.

---

## 🏗️ Architecture

```
User (Browser)
      │  (Types prompt, chooses dimensions & model)
      ▼
Next.js 15 Frontend (App Router, Port 3000)
      │  (POST /api/generate via REST API)
      ▼
FastAPI Backend (Python, Port 8000)
      │  (Pydantic validation, secure AI_HORDE_API_KEY)
      ▼
AI Horde Distributed GPU Cluster (aihorde.net)
      │  (Async queuing, polling, generation)
      ▼
FastAPI Backend (Encodes to Base64 Data URL)
      │  (Returns JSON: { success: true, image: "data:image/webp;base64,..." })
      ▼
Next.js Frontend (Displays image & provides instant PNG/WebP download)
```

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)

```powershell
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/](http://localhost:8000/)

### 2. Frontend Setup (Next.js)

```powershell
cd frontend

# Start Next.js development server
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Free Tier
- `AI_HORDE_API_KEY` is kept safe in `backend/.env`.
- Frontend never has access to the API key.
- 100% Free distributed GPU cluster without credit card or paid subscription needed.
