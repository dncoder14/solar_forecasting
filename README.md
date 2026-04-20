# ☀️ SolarVista — Intelligent Solar Management & Optimization

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**SolarVista** is an end-to-end AI-driven platform for solar energy forecasting and grid optimization. It combines a tuned Random Forest / XGBoost ML model with a LangGraph + Gemini AI agent, served through a FastAPI backend and a React + Tailwind frontend.

---

## 🏗️ Architecture

```
solar_forecasting/
├── backend/          # FastAPI REST API
├── frontend/         # React + Vite + Tailwind UI
├── src/
│   ├── agent/        # LangGraph AI optimization agent
│   ├── utils/        # PDF generator
│   ├── config.py     # Feature labels, constants
│   ├── data_preprocessing.py
│   └── train.py      # ML training pipeline
├── models/           # Trained model artefacts
├── data/             # Dataset + RAG guidelines
├── render.yaml       # Render deployment config
└── requirements.txt
```

---

## 🚀 Local Development

### 1. Backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Train the model first (generates models/)
python3 src/train.py

# Start the API
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## ☁️ Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set these values:
   - **Root Directory**: `.` (project root)
   - **Build Command**: `pip install -r requirements.txt && python3 src/train.py`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: `3.12.0`
4. Add **Environment Variables** in the Render dashboard:
   - `GOOGLE_API_KEY` → your Gemini API key
   - `ALLOWED_ORIGINS` → your Vercel frontend URL (e.g. `https://solarvista.vercel.app`)
5. Add a **Disk** (under Advanced):
   - Mount path: `/opt/render/project/src/models`
   - Size: 1 GB
6. Click **Deploy**

> The build command trains the model on first deploy and saves it to the persistent disk.

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add **Environment Variable**:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://solarvista-api.onrender.com`)
5. Click **Deploy**

> Vercel auto-detects Vite. The `vercel.json` handles SPA routing rewrites.

---

## 👥 Team 13
- **Dhiraj (TL)**: Deployment, PDF Extension & Documentation
- **Shorya**: ML Engine & Preprocessing Pipeline
- **Ved**: Agentic AI Workflow & RAG Logic
- **Himanshu**: UI/UX Design & Dashboard Integration
