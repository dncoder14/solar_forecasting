import streamlit as st
from src.config import COLORS


def render_metric_card(icon, label, value, subtitle=""):
    subtitle_html = f'<div style="font-size:0.75rem;color:{COLORS["text_muted"]};margin-top:4px;">{subtitle}</div>' if subtitle else ""
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-icon">{icon}</div>
        <div class="metric-label">{label}</div>
        <div class="metric-value">{value}</div>
        {subtitle_html}
    </div>
    """, unsafe_allow_html=True)


def render_hero_banner():
    st.markdown("""
    <div class="hero-banner">
        <h1>☀️ SolarVista Dashboard</h1>
        <p>AI-powered solar energy forecasting and optimization platform. 
        Enter weather conditions, get instant power predictions, and explore 24-hour simulations.</p>
    </div>
    """, unsafe_allow_html=True)


def render_section_header(text):
    st.markdown(f'<div class="section-header">{text}</div>', unsafe_allow_html=True)


def render_prediction_result(value):
    st.markdown(f"""
    <div class="prediction-result">
        <div class="pred-label">Predicted Solar Power</div>
        <div class="pred-value">{value:.2f} kW</div>
    </div>
    """, unsafe_allow_html=True)


def render_warning(message):
    st.markdown(f"""
    <div class="warning-box">
        ⚠️ {message}
    </div>
    """, unsafe_allow_html=True)


def render_tip(message):
    st.markdown(f"""
    <div class="tip-box">
        💡 {message}
    </div>
    """, unsafe_allow_html=True)


def render_chat_message(message):
    st.markdown(f"""
    <div class="chat-message">
        {message}
    </div>
    """, unsafe_allow_html=True)


def load_css():
    with open("assets/style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


def validate_weather_inputs(inputs, feature_names, feature_labels):
    warnings = []
    for i, col in enumerate(feature_names):
        if col in feature_labels:
            label, desc, min_val, max_val, default = feature_labels[col]
            if inputs[i] < min_val or inputs[i] > max_val:
                warnings.append(f"{label}: value {inputs[i]} is outside expected range ({min_val} – {max_val})")
    return warnings
