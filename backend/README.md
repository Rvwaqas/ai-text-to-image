# FastAPI Backend — AI Text-to-Image Generator

FastAPI backend service that interfaces with Hugging Face Inference API to generate images from text prompts and return base64 encoded images.

## Setup Instructions

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # Linux / macOS:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Hugging Face API Token in `.env`:
   ```env
   HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **API Documentation:**
   - Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Alternative ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
