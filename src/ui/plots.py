import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
import math

from src.config import COLORS, SUNRISE_HOUR, SUNSET_HOUR


def _base_layout(**overrides):
    base = dict(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(15,23,42,0.6)",
        font=dict(family="Inter, sans-serif", color=COLORS["text"], size=13),
        margin=dict(l=50, r=30, t=50, b=40),
        legend=dict(
            bgcolor="rgba(30,41,59,0.8)",
            bordercolor=COLORS["surface_light"],
            borderwidth=1,
            font=dict(size=11),
        ),
        xaxis=dict(
            gridcolor="rgba(148,163,184,0.1)",
            zerolinecolor="rgba(148,163,184,0.15)",
        ),
        yaxis=dict(
            gridcolor="rgba(148,163,184,0.1)",
            zerolinecolor="rgba(148,163,184,0.15)",
        ),
    )
    base.update(overrides)
    return base


def create_power_curve(df, predicted_col="generated_power_kw", radiation_col="shortwave_radiation_backwards_sfc"):
    sample = df.sample(min(500, len(df)), random_state=42).sort_values(radiation_col)

    fig = make_subplots(specs=[[{"secondary_y": True}]])

    fig.add_trace(
        go.Scatter(
            x=sample.index,
            y=sample[predicted_col],
            name="Generated Power (kW)",
            line=dict(color=COLORS["primary"], width=2.5),
            fill="tozeroy",
            fillcolor="rgba(245,158,11,0.12)",
            hovertemplate="<b>Power</b>: %{y:.1f} kW<extra></extra>",
        ),
        secondary_y=False,
    )

    fig.add_trace(
        go.Scatter(
            x=sample.index,
            y=sample[radiation_col],
            name="Solar Radiation (W/m²)",
            line=dict(color=COLORS["secondary"], width=2, dash="dot"),
            hovertemplate="<b>Radiation</b>: %{y:.1f} W/m²<extra></extra>",
        ),
        secondary_y=True,
    )

    fig.update_layout(
        **_base_layout(
            title=dict(text="⚡ Power Generation vs Solar Radiation", font=dict(size=18)),
            height=420,
            hovermode="x unified",
        )
    )
    fig.update_yaxes(title_text="Power (kW)", secondary_y=False, color=COLORS["primary"])
    fig.update_yaxes(title_text="Radiation (W/m²)", secondary_y=True, color=COLORS["secondary"])

    return fig


def create_accuracy_gauge(score, label="Model Accuracy (R²)"):
    score_pct = score * 100

    if score >= 0.90:
        bar_color = COLORS["accent"]
        rating = "Excellent"
    elif score >= 0.75:
        bar_color = COLORS["primary"]
        rating = "Good"
    elif score >= 0.50:
        bar_color = "#F97316"
        rating = "Fair"
    else:
        bar_color = COLORS["danger"]
        rating = "Poor"

    fig = go.Figure(
        go.Indicator(
            mode="gauge+number+delta",
            value=score_pct,
            number=dict(suffix="%", font=dict(size=42, color=COLORS["text"])),
            title=dict(
                text=f"{label}<br><span style='font-size:14px;color:{COLORS['text_muted']}'>{rating}</span>",
                font=dict(size=16),
            ),
            delta=dict(reference=75, increasing=dict(color=COLORS["accent"]), decreasing=dict(color=COLORS["danger"])),
            gauge=dict(
                axis=dict(range=[0, 100], tickwidth=1, tickcolor=COLORS["text_muted"], dtick=20),
                bar=dict(color=bar_color, thickness=0.3),
                bgcolor=COLORS["surface"],
                borderwidth=2,
                bordercolor=COLORS["surface_light"],
                steps=[
                    dict(range=[0, 50], color="rgba(239,68,68,0.15)"),
                    dict(range=[50, 75], color="rgba(249,115,22,0.15)"),
                    dict(range=[75, 90], color="rgba(245,158,11,0.15)"),
                    dict(range=[90, 100], color="rgba(16,185,129,0.15)"),
                ],
                threshold=dict(line=dict(color=COLORS["text"], width=3), thickness=0.8, value=score_pct),
            ),
        )
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter, sans-serif", color=COLORS["text"]),
        height=300,
        margin=dict(l=30, r=30, t=60, b=20),
    )
    return fig


def create_24h_simulation(model, base_features, feature_names, radiation_idx=None):
    rad_col = "shortwave_radiation_backwards_sfc"
    zen_col = "zenith"
    temp_col = "temperature_2_m_above_gnd"

    if radiation_idx is None:
        radiation_idx = feature_names.index(rad_col) if rad_col in feature_names else None
    zenith_idx = feature_names.index(zen_col) if zen_col in feature_names else None
    temp_idx = feature_names.index(temp_col) if temp_col in feature_names else None

    hours = list(range(24))
    powers = []
    radiations = []

    for h in hours:
        features = list(base_features)

        if SUNRISE_HOUR <= h <= SUNSET_HOUR and radiation_idx is not None:
            noon = (SUNRISE_HOUR + SUNSET_HOUR) / 2
            spread = (SUNSET_HOUR - SUNRISE_HOUR) / 2
            factor = max(0, math.cos(math.pi * (h - noon) / spread))
            rad_value = base_features[radiation_idx] * factor
            features[radiation_idx] = rad_value
            radiations.append(rad_value)
        else:
            if radiation_idx is not None:
                features[radiation_idx] = 0.0
            radiations.append(0.0)

        if zenith_idx is not None:
            if SUNRISE_HOUR <= h <= SUNSET_HOUR:
                noon = (SUNRISE_HOUR + SUNSET_HOUR) / 2
                features[zenith_idx] = 90 - 45 * max(0, math.cos(math.pi * (h - noon) / 6))
            else:
                features[zenith_idx] = 90.0

        if temp_idx is not None:
            if 6 <= h <= 18:
                features[temp_idx] = base_features[temp_idx] + 3 * math.sin(math.pi * (h - 6) / 12)
            else:
                features[temp_idx] = base_features[temp_idx] - 2

        pred = model.predict([features])[0]
        powers.append(max(0, pred))

    fig = make_subplots(specs=[[{"secondary_y": True}]])

    fig.add_vrect(
        x0=SUNRISE_HOUR, x1=SUNSET_HOUR,
        fillcolor="rgba(245,158,11,0.07)",
        line_width=0,
        annotation_text="☀️ Daylight Hours",
        annotation_position="top left",
        annotation_font_color=COLORS["text_muted"],
    )

    fig.add_trace(
        go.Scatter(
            x=hours, y=powers,
            name="Predicted Power (kW)",
            mode="lines+markers",
            line=dict(color=COLORS["primary"], width=3, shape="spline"),
            marker=dict(size=6, color=COLORS["primary_light"]),
            fill="tozeroy",
            fillcolor="rgba(245,158,11,0.15)",
            hovertemplate="<b>%{x}:00</b><br>Power: %{y:.1f} kW<extra></extra>",
        ),
        secondary_y=False,
    )

    fig.add_trace(
        go.Scatter(
            x=hours, y=radiations,
            name="Simulated Radiation (W/m²)",
            mode="lines",
            line=dict(color=COLORS["secondary"], width=2, dash="dash", shape="spline"),
            hovertemplate="<b>%{x}:00</b><br>Radiation: %{y:.0f} W/m²<extra></extra>",
        ),
        secondary_y=True,
    )

    fig.add_vline(x=SUNRISE_HOUR, line_dash="dot", line_color=COLORS["primary_light"],
                  annotation_text="🌅 Sunrise", annotation_position="top right",
                  annotation_font_color=COLORS["primary_light"])
    fig.add_vline(x=SUNSET_HOUR, line_dash="dot", line_color="#F97316",
                  annotation_text="🌇 Sunset", annotation_position="top left",
                  annotation_font_color="#F97316")

    fig.update_layout(
        **_base_layout(
            title=dict(text="🕐 24-Hour Solar Power Simulation", font=dict(size=18)),
            height=440,
            hovermode="x unified",
            xaxis=dict(
                title="Hour of Day",
                tickvals=list(range(0, 24, 2)),
                ticktext=[f"{h:02d}:00" for h in range(0, 24, 2)],
                gridcolor="rgba(148,163,184,0.1)",
            ),
        )
    )
    fig.update_yaxes(title_text="Power (kW)", secondary_y=False, color=COLORS["primary"])
    fig.update_yaxes(title_text="Radiation (W/m²)", secondary_y=True, color=COLORS["secondary"])

    return fig, powers, radiations


def create_feature_importance_chart(df, target_col="generated_power_kw", top_n=8):
    correlations = df.corr(numeric_only=True)[target_col].drop(target_col).abs().sort_values(ascending=True).tail(top_n)

    colors = [
        f"rgba(245,158,11,{0.4 + 0.6 * i / len(correlations)})"
        for i in range(len(correlations))
    ]

    fig = go.Figure(
        go.Bar(
            x=correlations.values,
            y=[name.replace("_", " ").title()[:30] for name in correlations.index],
            orientation="h",
            marker=dict(color=colors, line=dict(color=COLORS["primary"], width=1)),
            hovertemplate="<b>%{y}</b><br>Correlation: %{x:.3f}<extra></extra>",
        )
    )
    fig.update_layout(
        **_base_layout(
            title=dict(text="📊 Top Feature Correlations with Power Output", font=dict(size=16)),
            height=380,
            xaxis=dict(title="Absolute Correlation", gridcolor="rgba(148,163,184,0.1)"),
            yaxis=dict(gridcolor="rgba(148,163,184,0.08)"),
        )
    )
    return fig


def create_power_distribution(df, col="generated_power_kw"):
    fig = go.Figure(
        go.Histogram(
            x=df[col],
            nbinsx=50,
            marker=dict(
                color=COLORS["primary"],
                line=dict(color=COLORS["primary_light"], width=0.5),
                opacity=0.75,
            ),
            hovertemplate="<b>%{x:.0f} kW</b><br>Count: %{y}<extra></extra>",
        )
    )
    fig.add_vline(
        x=df[col].mean(),
        line_dash="dash",
        line_color=COLORS["accent"],
        annotation_text=f"Mean: {df[col].mean():.0f} kW",
        annotation_font_color=COLORS["accent"],
    )
    fig.update_layout(
        **_base_layout(
            title=dict(text="📈 Power Generation Distribution", font=dict(size=16)),
            height=350,
            xaxis=dict(title="Generated Power (kW)"),
            yaxis=dict(title="Frequency"),
        )
    )
    return fig
