"""
train.py
--------
Trains and tunes a Random Forest and an XGBoost regressor on the solar
power dataset, selects the best model, and exports:
  - models/solar_model.pkl        — best fitted model
  - models/scaler.pkl             — fitted StandardScaler for inference
  - models/feature_importance.png — high-res feature importance bar chart
  - models/metadata.json          — metrics + top features for downstream use

Run from the project root:
    python3 src/train.py
"""

import json
import os
import sys

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import RandomizedSearchCV

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from src.data_preprocessing import load_and_preprocess

DATA_PATH   = os.path.join(PROJECT_ROOT, "data", "spg.csv")
MODELS_DIR  = os.path.join(PROJECT_ROOT, "models")
MODEL_PATH  = os.path.join(MODELS_DIR, "solar_model.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")
FIG_PATH    = os.path.join(MODELS_DIR, "feature_importance.png")
META_PATH   = os.path.join(MODELS_DIR, "metadata.json")
TOP_N       = 10


def evaluate(y_true, y_pred):
    """Compute MAE, RMSE, and R² and return as a dict."""
    return {
        "mae":  round(float(mean_absolute_error(y_true, y_pred)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 4),
        "r2":   round(float(r2_score(y_true, y_pred)), 4),
    }


def tune_random_forest(X_train, y_train, random_state=42):
    """Run RandomizedSearchCV over a Random Forest regressor."""
    param_dist = {
        "n_estimators":      [100, 200, 300, 500],
        "max_depth":         [None, 10, 20, 30],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf":  [1, 2, 4],
        "max_features":      ["sqrt", "log2", 0.5],
    }
    search = RandomizedSearchCV(
        RandomForestRegressor(random_state=random_state, n_jobs=-1),
        param_distributions=param_dist,
        n_iter=20, cv=3,
        scoring="neg_mean_absolute_error",
        random_state=random_state, n_jobs=-1, verbose=1,
    )
    search.fit(X_train, y_train)
    print(f"  Best RF params : {search.best_params_}")
    return search.best_estimator_


def tune_xgboost(X_train, y_train, random_state=42):
    """Run RandomizedSearchCV over an XGBoost regressor."""
    try:
        from xgboost import XGBRegressor
    except Exception:
        print("  [WARN] xgboost could not be loaded — skipping. Fix: brew install libomp")
        return None

    param_dist = {
        "n_estimators":     [100, 200, 300, 500],
        "max_depth":        [3, 5, 7, 9],
        "learning_rate":    [0.01, 0.05, 0.1, 0.2],
        "subsample":        [0.6, 0.8, 1.0],
        "colsample_bytree": [0.6, 0.8, 1.0],
        "reg_alpha":        [0, 0.1, 0.5],
        "reg_lambda":       [1, 1.5, 2],
    }
    search = RandomizedSearchCV(
        XGBRegressor(random_state=random_state, n_jobs=-1, verbosity=0, eval_metric="mae"),
        param_distributions=param_dist,
        n_iter=20, cv=3,
        scoring="neg_mean_absolute_error",
        random_state=random_state, n_jobs=-1, verbose=1,
    )
    search.fit(X_train, y_train)
    print(f"  Best XGB params: {search.best_params_}")
    return search.best_estimator_


def save_feature_importance_plot(model, feature_names, out_path, top_n=20):
    """Save a high-resolution horizontal bar chart of feature importances."""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]
    top_features    = [feature_names[i] for i in indices]
    top_importances = importances[indices]

    fig, ax = plt.subplots(figsize=(12, 8))
    ax.barh(top_features[::-1], top_importances[::-1], color="steelblue")
    ax.set_xlabel("Importance Score", fontsize=12)
    ax.set_title("Feature Importance — Best Model", fontsize=14, fontweight="bold")
    ax.tick_params(axis="y", labelsize=10)
    plt.tight_layout()
    fig.savefig(out_path, dpi=150)
    plt.close(fig)
    print(f"  Feature importance plot saved → {out_path}")


def save_metadata(best_name, metrics, feature_names, importances, out_path, top_n=10):
    """Write model metrics and top features to a JSON file."""
    indices = np.argsort(importances)[::-1][:top_n]
    top_features = [
        {"feature": feature_names[i], "importance": round(float(importances[i]), 6)}
        for i in indices
    ]
    with open(out_path, "w") as f:
        json.dump({"model": best_name, "metrics": metrics, "top_features": top_features}, f, indent=2)
    print(f"  Metadata saved          → {out_path}")


def main():
    """End-to-end training pipeline."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    print("Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, scaler, feature_names = load_and_preprocess(DATA_PATH)
    print(f"  Train: {len(X_train)} rows | Test: {len(X_test)} rows | Features: {len(feature_names)}")

    print("\nTuning Random Forest...")
    rf_model = tune_random_forest(X_train, y_train)

    print("\nTuning XGBoost...")
    xgb_model = tune_xgboost(X_train, y_train)

    print("\nEvaluating on test set...")
    rf_metrics = evaluate(y_test, rf_model.predict(X_test))
    print(f"  Random Forest → MAE: {rf_metrics['mae']:.2f} | RMSE: {rf_metrics['rmse']:.2f} | R²: {rf_metrics['r2']:.4f}")

    candidates = [("Random Forest", rf_model, rf_metrics)]
    if xgb_model is not None:
        xgb_metrics = evaluate(y_test, xgb_model.predict(X_test))
        print(f"  XGBoost       → MAE: {xgb_metrics['mae']:.2f} | RMSE: {xgb_metrics['rmse']:.2f} | R²: {xgb_metrics['r2']:.4f}")
        candidates.append(("XGBoost", xgb_model, xgb_metrics))

    best_name, best_model, best_metrics = min(candidates, key=lambda c: c[2]["mae"])
    print(f"\n✓ Best model: {best_name} (MAE {best_metrics['mae']:.2f})")

    print("\nSaving artefacts...")
    joblib.dump(best_model, MODEL_PATH)
    print(f"  Model saved             → {MODEL_PATH}")
    joblib.dump(scaler, SCALER_PATH)
    print(f"  Scaler saved            → {SCALER_PATH}")
    save_feature_importance_plot(best_model, feature_names, FIG_PATH)
    save_metadata(best_name, best_metrics, feature_names, best_model.feature_importances_, META_PATH, TOP_N)
    print("\nDone.")


if __name__ == "__main__":
    main()
