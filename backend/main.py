"""
backend/main.py
---------------
FastAPI backend — exposes the solar ML model and AI agent as REST endpoints.

Local:      uvicorn backend.main:app --reload --port 8000
Production: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
"""

import json
import math
import os
import sys

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from src.config import FEATURE_LABELS, ELECTRICITY_RATE, SUNRISE_HOUR, SUNSET_HOUR

app = FastAPI(title="SolarVista API", version="2.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow all origins in dev; lock down to Vercel domain in production.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "*"   # override this env var on Render with your Vercel URL
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load artefacts ────────────────────────────────────────────────────────────
MODELS_DIR    = os.path.join(PROJECT_ROOT, "models")
MODEL_PATH    = os.path.join(MODELS_DIR, "solar_model.pkl")
METADATA_PATH = os.path.join(MODELS_DIR, "metadata.json")
DATA_PATH     = os.path.join(PROJECT_ROOT, "data", "spg.csv")

model = joblib.load(MODEL_PATH)
with open(METADATA_PATH) as f:
    metadata = json.load(f)
df = pd.read_csv(DATA_PATH)
feature_cols = [c for c in df.columns if c != "generated_power_kw"]


# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    features: dict

class AgentRequest(BaseModel):
    forecast_data: dict
    api_key: str = ""


# ── Helpers ───────────────────────────────────────────────────────────────────
def build_feature_vector(features_dict: dict) -> list:
    return [float(features_dict.get(col, 0.0)) for col in feature_cols]


def simulate_24h(base_features: list) -> dict:
    rad_col  = "shortwave_radiation_backwards_sfc"
    zen_col  = "zenith"
    temp_col = "temperature_2_m_above_gnd"

    rad_idx  = feature_cols.index(rad_col)  if rad_col  in feature_cols else None
    zen_idx  = feature_cols.index(zen_col)  if zen_col  in feature_cols else None
    temp_idx = feature_cols.index(temp_col) if temp_col in feature_cols else None

    powers, radiations = [], []
    for h in range(24):
        feats = list(base_features)
        if SUNRISE_HOUR <= h <= SUNSET_HOUR and rad_idx is not None:
            noon   = (SUNRISE_HOUR + SUNSET_HOUR) / 2
            spread = (SUNSET_HOUR - SUNRISE_HOUR) / 2
            factor = max(0, math.cos(math.pi * (h - noon) / spread))
            feats[rad_idx] = base_features[rad_idx] * factor
            radiations.append(feats[rad_idx])
        else:
            if rad_idx is not None:
                feats[rad_idx] = 0.0
            radiations.append(0.0)

        if zen_idx is not None:
            if SUNRISE_HOUR <= h <= SUNSET_HOUR:
                noon = (SUNRISE_HOUR + SUNSET_HOUR) / 2
                feats[zen_idx] = 90 - 45 * max(0, math.cos(math.pi * (h - noon) / 6))
            else:
                feats[zen_idx] = 90.0

        if temp_idx is not None:
            feats[temp_idx] = (
                base_features[temp_idx] + 3 * math.sin(math.pi * (h - 6) / 12)
                if 6 <= h <= 18 else base_features[temp_idx] - 2
            )

        pred = float(model.predict([feats])[0])
        powers.append(max(0.0, pred))

    return {"powers": powers, "radiations": radiations}


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "model": metadata.get("model"), "r2": metadata.get("metrics", {}).get("r2")}


@app.get("/api/metadata")
def get_metadata():
    return metadata


@app.get("/api/dataset-stats")
def dataset_stats():
    avg_power     = float(df["generated_power_kw"].mean())
    max_power     = float(df["generated_power_kw"].max())
    daily_est     = avg_power * 12
    daily_savings = (daily_est / 1000) * ELECTRICITY_RATE

    counts, edges = np.histogram(df["generated_power_kw"], bins=50)
    distribution  = [
        {"x": round(float((edges[i] + edges[i+1]) / 2), 1), "count": int(counts[i])}
        for i in range(len(counts))
    ]

    corr = (
        df.corr(numeric_only=True)["generated_power_kw"]
        .drop("generated_power_kw").abs()
        .sort_values(ascending=False).head(8)
    )
    correlations = [
        {"feature": k.replace("_", " ").title()[:30], "value": round(float(v), 4)}
        for k, v in corr.items()
    ]

    sample = df.sample(min(500, len(df)), random_state=42).sort_values(
        "shortwave_radiation_backwards_sfc"
    )
    power_curve = [
        {"radiation": round(float(r), 1), "power": round(float(p), 1)}
        for r, p in zip(
            sample["shortwave_radiation_backwards_sfc"],
            sample["generated_power_kw"],
        )
    ]

    return {
        "avg_power":     round(avg_power, 1),
        "max_power":     round(max_power, 1),
        "daily_estimate": round(daily_est, 1),
        "daily_savings": round(daily_savings, 1),
        "total_records": len(df),
        "distribution":  distribution,
        "correlations":  correlations,
        "power_curve":   power_curve,
    }


@app.get("/api/feature-labels")
def feature_labels():
    return {
        key: {"label": v[0], "help": v[1], "min": v[2], "max": v[3], "default": v[4]}
        for key, v in FEATURE_LABELS.items()
    }


@app.post("/api/predict")
def predict(req: PredictRequest):
    try:
        vec        = build_feature_vector(req.features)
        prediction = max(0.0, float(model.predict([vec])[0]))
        daily_kwh  = prediction * 12
        monthly_kwh = daily_kwh * 30
        monthly_savings = (monthly_kwh / 1000) * ELECTRICITY_RATE

        sim        = simulate_24h(vec)
        peak_power = max(sim["powers"])
        peak_hour  = sim["powers"].index(peak_power)
        total_daily = sum(sim["powers"])

        return {
            "prediction":      round(prediction, 2),
            "daily_kwh":       round(daily_kwh, 1),
            "monthly_kwh":     round(monthly_kwh, 1),
            "monthly_savings": round(monthly_savings, 1),
            "simulation": {
                "hours":       list(range(24)),
                "powers":      [round(p, 1) for p in sim["powers"]],
                "radiations":  [round(r, 1) for r in sim["radiations"]],
                "peak_power":  round(peak_power, 1),
                "peak_hour":   peak_hour,
                "total_daily": round(total_daily, 1),
                "daily_savings": round((total_daily / 1000) * ELECTRICITY_RATE, 1),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize")
def optimize(req: AgentRequest):
    if req.api_key:
        os.environ["GOOGLE_API_KEY"] = req.api_key
    try:
        from src.agent.graph import run_optimization_agent
        report = run_optimization_agent(req.forecast_data, "medium")
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
