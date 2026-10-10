# Climate Shelter AI — Website Starter

A premium React + Vite frontend with a FastAPI backend for climate-responsive shelter concepts.

## Requirements
- Node.js 20+ (LTS recommended)
- Python 3.10+
- VS Code

## 1. Start the backend
Open a terminal in this folder:

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Then:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend API docs: http://127.0.0.1:8000/docs

The backend uses illustrative demo climate values for now. Replace the demo provider with a real climate API before using the results for real construction decisions.

## 2. Start the website
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## What works
- Premium responsive landing/dashboard UI
- Location and shelter requirements form
- Calls the FastAPI `/api/design` endpoint
- Demo mode fallback when backend is unavailable
- Three design priorities: Balanced, Comfort, Low Carbon
- Climate summary, recommendation cards, score bars and design explanation
- Demo output is labelled as illustrative

## API connection
Frontend API base URL defaults to `http://127.0.0.1:8000`.
Set `VITE_API_BASE_URL` in `frontend/.env` if needed.

## Next upgrades
1. Connect a real geocoding service and climate/weather API.
2. Store users and saved designs in PostgreSQL/PostGIS.
3. Replace rule-based recommendations with calibrated multi-objective optimization.
4. Add an actual interactive 3D model and validated energy/building simulation.
5. Add authentication, rate limits, server-side validation, and restricted CORS before deployment.

This is a concept-design prototype, not a certified architectural or structural design.
