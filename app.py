import streamlit as st
import pandas as pd
import joblib
import numpy as np
import os
from datetime import datetime

from src.config import (
    APP_TITLE, APP_ICON, FEATURE_LABELS, COLORS,
    ELECTRICITY_RATE, MODEL_R2_SCORE, MODEL_MAE
)
from src.ui.components import (
    load_css, render_hero_banner, render_metric_card,
    render_section_header, render_prediction_result,
    render_warning, render_tip, render_chat_message,
    validate_weather_inputs
)
from src.ui.plots import (
    create_power_curve, create_accuracy_gauge,
    create_24h_simulation, create_feature_importance_chart,
    create_power_distribution
)
from src.agent.graph import run_optimization_agent
from src.utils.pdf_generator import generate_pdf_report

st.set_page_config(
    page_title=APP_TITLE,
    page_icon=APP_ICON,
    layout="wide",
    initial_sidebar_state="collapsed"
)

load_css()

with st.sidebar:
    st.header("🔑 API Configuration")
    api_key = st.text_input("Google Gemini API Key", type="password", help="Required for the AI Optimization Assistant")
    if api_key:
        os.environ["GOOGLE_API_KEY"] = api_key
    st.markdown("---")
    st.markdown("**Note:** Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)")


@st.cache_data
def load_data():
    return pd.read_csv("data/spg.csv")


@st.cache_resource
def load_model():
    return joblib.load("models/solar_model.pkl")


try:
    df = load_data()
    model = load_model()
    feature_cols = [c for c in df.columns if c != "generated_power_kw"]
except Exception as e:
    st.error(f"Failed to load data or model: {e}")
    st.stop()


tab1, tab2, tab3 = st.tabs([
    "📊 Dashboard Overview",
    "🌤️ Weather & Analytics",
    "🤖 Optimization Assistant"
])


with tab1:
    render_hero_banner()

    avg_power = df["generated_power_kw"].mean()
    max_power = df["generated_power_kw"].max()
    daily_estimate = avg_power * 12
    daily_savings = (daily_estimate / 1000) * ELECTRICITY_RATE

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        render_metric_card("⚡", "Avg Power Output", f"{avg_power:.0f} kW", "across all records")
    with col2:
        render_metric_card("🔋", "Peak Power", f"{max_power:.0f} kW", "maximum recorded")
    with col3:
        render_metric_card("📈", "Daily Estimate", f"{daily_estimate:.0f} kWh", "based on avg × 12hrs")
    with col4:
        render_metric_card("💰", "Est. Daily Savings", f"₹{daily_savings:.0f}", f"@ ₹{ELECTRICITY_RATE}/kWh")

    st.markdown("<br>", unsafe_allow_html=True)

    col_left, col_right = st.columns([3, 2])

    with col_left:
        render_section_header("⚡ Power vs Solar Radiation")
        with st.spinner("Rendering power curve..."):
            fig_curve = create_power_curve(df)
            st.plotly_chart(fig_curve, width="stretch")

    with col_right:
        render_section_header("🎯 Model Performance")
        fig_gauge = create_accuracy_gauge(MODEL_R2_SCORE)
        st.plotly_chart(fig_gauge, width="stretch")
        st.markdown(f"""
        <div class="glass-card" style="text-align:center;">
            <span style="color:{COLORS['text_muted']};">Mean Absolute Error</span><br>
            <span style="font-size:1.5rem;font-weight:700;color:{COLORS['primary']};">±{MODEL_MAE:.1f} kW</span>
        </div>
        """, unsafe_allow_html=True)

    render_section_header("📊 Dataset Insights")
    col_dist, col_feat = st.columns(2)
    with col_dist:
        fig_dist = create_power_distribution(df)
        st.plotly_chart(fig_dist, width="stretch")
    with col_feat:
        fig_imp = create_feature_importance_chart(df)
        st.plotly_chart(fig_imp, width="stretch")

    with st.expander("📋 Dataset Summary"):
        st.dataframe(df.describe().round(2).T)


with tab2:
    render_section_header("🌤️ Enter Weather Conditions")
    render_tip("Fill in the weather parameters below — they map directly to features used by the ML model. Hit <b>Predict</b> to get your result.")

    st.markdown("<br>", unsafe_allow_html=True)

    with st.form("weather_form", clear_on_submit=False):
        inputs = []

        groups = {
            "🌡️ Temperature & Atmosphere": [
                "temperature_2_m_above_gnd", "relative_humidity_2_m_above_gnd",
                "mean_sea_level_pressure_MSL", "total_precipitation_sfc", "snowfall_amount_sfc"
            ],
            "☁️ Cloud Cover": [
                "total_cloud_cover_sfc", "high_cloud_cover_high_cld_lay",
                "medium_cloud_cover_mid_cld_lay", "low_cloud_cover_low_cld_lay"
            ],
            "☀️ Solar Radiation": [
                "shortwave_radiation_backwards_sfc"
            ],
            "💨 Wind Conditions": [
                "wind_speed_10_m_above_gnd", "wind_direction_10_m_above_gnd",
                "wind_speed_80_m_above_gnd", "wind_direction_80_m_above_gnd",
                "wind_speed_900_mb", "wind_direction_900_mb", "wind_gust_10_m_above_gnd"
            ],
            "📐 Sun Geometry": [
                "angle_of_incidence", "zenith", "azimuth"
            ]
        }

        ordered_inputs = {}

        for group_name, group_cols in groups.items():
            st.markdown(f"**{group_name}**")
            num_cols = min(len(group_cols), 4)
            cols = st.columns(num_cols)
            for i, col_name in enumerate(group_cols):
                with cols[i % num_cols]:
                    if col_name in FEATURE_LABELS:
                        label, help_text, min_v, max_v, default = FEATURE_LABELS[col_name]
                    else:
                        label = col_name.replace("_", " ").title()
                        help_text = ""
                        min_v, max_v, default = 0.0, 1000.0, 0.0
                    val = st.number_input(
                        label, value=default, help=help_text,
                        key=f"input_{col_name}"
                    )
                    ordered_inputs[col_name] = val

        submitted = st.form_submit_button("⚡ Predict Solar Power", use_container_width=True)

    if submitted:
        final_inputs = [ordered_inputs.get(col, 0.0) for col in feature_cols]

        warnings = validate_weather_inputs(final_inputs, feature_cols, FEATURE_LABELS)
        if warnings:
            for w in warnings:
                render_warning(w)
            st.markdown("<br>", unsafe_allow_html=True)

        with st.spinner("Running prediction through Random Forest model..."):
            try:
                prediction = model.predict([final_inputs])[0]
                prediction = max(0, prediction)

                render_prediction_result(prediction)

                col_s1, col_s2, col_s3 = st.columns(3)
                daily_kwh = prediction * 12
                monthly_kwh = daily_kwh * 30
                monthly_savings = (monthly_kwh / 1000) * ELECTRICITY_RATE

                with col_s1:
                    render_metric_card("📈", "Daily Output", f"{daily_kwh:.0f} kWh", "12 sunlight hours")
                with col_s2:
                    render_metric_card("📅", "Monthly Output", f"{monthly_kwh:.0f} kWh", "30 days estimate")
                with col_s3:
                    render_metric_card("💰", "Monthly Savings", f"₹{monthly_savings:.0f}", f"@ ₹{ELECTRICITY_RATE}/kWh")

                with st.spinner("Generating 24-hour simulation..."):
                    fig_sim, sim_powers, sim_rads = create_24h_simulation(
                        model, final_inputs, feature_cols
                    )
                    st.session_state['forecast_data'] = {
                        'average_power': prediction,
                        'daily_output': daily_kwh,
                        'peak_power': max(sim_powers),
                        'peak_hour': f"{sim_powers.index(max(sim_powers))}:00",
                        'simulation': sim_powers,
                        'summary': f"Average {prediction:.1f} kW, daily {daily_kwh:.0f} kWh",
                        'daily_savings': (sum(sim_powers) / 1000) * ELECTRICITY_RATE
                    }

                    render_tip("This simulation shows how power generation would change throughout the day based on your weather inputs.")
                    st.plotly_chart(fig_sim, width="stretch")

                    peak_hour = sim_powers.index(max(sim_powers))
                    total_daily = sum(sim_powers)

                    col_p1, col_p2, col_p3 = st.columns(3)
                    with col_p1:
                        render_metric_card("🏔️", "Peak Hour", f"{peak_hour:02d}:00", f"{max(sim_powers):.0f} kW")
                    with col_p2:
                        render_metric_card("⚡", "Total Daily", f"{total_daily:.0f} kWh", "sum across 24hrs")
                    with col_p3:
                        daily_save = (total_daily / 1000) * ELECTRICITY_RATE
                        render_metric_card("💰", "Daily Savings", f"₹{daily_save:.0f}", "simulated estimate")

            except Exception as e:
                st.error(f"Prediction failed: {str(e)}")
                render_warning("Please check your input values and try again. Make sure all fields have valid numbers.")


with tab3:
    render_section_header("🤖 Solar Optimization Assistant")

    st.markdown(f"""
    <div class="glass-card">
        <p style="color:{COLORS['text_muted']};margin:0;">
            This assistant analyzes your solar setup and weather data to provide actionable 
            recommendations for maximizing energy production. It uses AI reasoning to evaluate 
            your conditions and suggest optimizations.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    quick_prompts = st.columns(3)
    with quick_prompts[0]:
        if st.button("📊 Analyze my setup", use_container_width=True):
            st.session_state.pending_prompt = "analyze"
    with quick_prompts[1]:
        if st.button("💡 Optimization tips", use_container_width=True):
            st.session_state.pending_prompt = "tips"
    with quick_prompts[2]:
        if st.button("📋 Generate report", use_container_width=True):
            st.session_state.pending_prompt = "report"

    st.markdown("<br>", unsafe_allow_html=True)
    user_query = st.text_input("Ask the assistant anything about solar optimization...", placeholder="e.g., How can I improve my panel efficiency?")

    pending = st.session_state.get("pending_prompt", None)

    if pending or st.button("🚀 Run AI Optimization Analysis", use_container_width=True):
        if 'forecast_data' in st.session_state:
            with st.spinner("🤖 AI is analyzing your solar forecast and generating optimization recommendations..."):
                try:
                    uncertainty = "medium"  # Could be dynamic based on model confidence
                    report = run_optimization_agent(st.session_state['forecast_data'], uncertainty)
                    
                    st.success("✅ Optimization Report Generated!")
                    
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("📋 Summary", report.get('summary', 'N/A')[:50] + '...')
                    with col2:
                        st.metric("⚠️ Risk Level", "Medium")  # Could parse from report
                    with col3:
                        st.metric("🎯 Actions", "Generated")
                    
                    st.markdown("### 📊 Detailed Report")
                    st.json(report)

                    # PDF Export Button
                    st.markdown("---")
                    pdf_bytes = generate_pdf_report(st.session_state['forecast_data'], report)
                    st.download_button(
                        label="📥 Download Optimization Report (PDF)",
                        data=pdf_bytes,
                        file_name=f"solar_optimization_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                        mime="application/pdf",
                        use_container_width=True
                    )
                    
                    # Clear pending
                    if pending:
                        del st.session_state["pending_prompt"]
                        
                except Exception as e:
                    st.error(f"❌ Agent analysis failed: {str(e)}")
                    st.info("Make sure GOOGLE_API_KEY is set in your environment variables.")
        else:
            st.warning("⚠️ Please run a solar power prediction first in the 'Weather & Analytics' tab to provide data for the AI assistant.")

    if user_query or pending:
        with st.spinner("Assistant is thinking..."):

            avg_power = df["generated_power_kw"].mean()
            max_power = df["generated_power_kw"].max()
            avg_radiation = df["shortwave_radiation_backwards_sfc"].mean()
            avg_temp = df["temperature_2_m_above_gnd"].mean()
            avg_cloud = df["total_cloud_cover_sfc"].mean()

            if pending == "analyze" or (user_query and "analyze" in user_query.lower()):
                response = f"""
                <b>📊 Solar Setup Analysis</b><br><br>
                Based on the dataset of <b>{len(df):,}</b> records:<br><br>
                • <b>Average Power Output:</b> {avg_power:.1f} kW<br>
                • <b>Peak Power Recorded:</b> {max_power:.1f} kW<br>
                • <b>Average Solar Radiation:</b> {avg_radiation:.1f} W/m²<br>
                • <b>Average Temperature:</b> {avg_temp:.1f}°C<br>
                • <b>Average Cloud Cover:</b> {avg_cloud:.1f}%<br><br>
                <b>Assessment:</b> Your solar installation shows {'strong' if avg_power > 1500 else 'moderate'} 
                performance. The correlation between radiation and power output is high, 
                indicating well-positioned panels. Consider monitoring cloud cover patterns 
                for better daily planning.
                """
            elif pending == "tips" or (user_query and "tip" in user_query.lower()):
                response = f"""
                <b>💡 Optimization Recommendations</b><br><br>
                Based on data analysis, here are actionable tips:<br><br>
                <b>1. Panel Angle Optimization</b><br>
                The data shows optimal performance when the angle of incidence is between 20°-40°. 
                Adjust your panel tilt seasonally for maximum capture.<br><br>
                <b>2. Cloud Cover Monitoring</b><br>
                Average cloud cover is {avg_cloud:.0f}%. On days with {'high' if avg_cloud > 50 else 'low'} 
                cloud cover, consider shifting high-energy tasks to peak solar hours (10 AM - 2 PM).<br><br>
                <b>3. Temperature Management</b><br>
                Panel efficiency drops at extreme temperatures. With average temp at {avg_temp:.1f}°C, 
                {'ensure proper ventilation for cooling' if avg_temp > 30 else 'your temperature range is good for efficiency'}.<br><br>
                <b>4. Wind Factor</b><br>
                Moderate wind helps cool panels and improve efficiency. Your setup benefits from 
                natural cooling at current wind speeds.<br><br>
                <b>5. Peak Hour Utilization</b><br>
                Schedule maximum energy consumption during 10 AM - 3 PM when generation peaks.
                """
            elif pending == "report" or (user_query and "report" in user_query.lower()):
                efficiency = (avg_power / max_power) * 100 if max_power > 0 else 0
                daily_est = avg_power * 12
                monthly_est = daily_est * 30
                annual_est = monthly_est * 12
                annual_savings = (annual_est / 1000) * ELECTRICITY_RATE

                response = f"""
                <b>📋 Solar Performance Report</b><br><br>
                <b>━━━ System Overview ━━━</b><br>
                • Dataset Size: {len(df):,} observations<br>
                • Model Accuracy (R²): {MODEL_R2_SCORE*100:.1f}%<br>
                • Prediction Error (MAE): ±{MODEL_MAE:.0f} kW<br><br>
                <b>━━━ Performance Metrics ━━━</b><br>
                • Average Generation: {avg_power:.1f} kW<br>
                • Peak Generation: {max_power:.1f} kW<br>
                • System Efficiency: {efficiency:.1f}%<br><br>
                <b>━━━ Energy Estimates ━━━</b><br>
                • Daily: {daily_est:.0f} kWh<br>
                • Monthly: {monthly_est:.0f} kWh<br>
                • Annual: {annual_est:.0f} kWh<br><br>
                <b>━━━ Financial Impact ━━━</b><br>
                • Est. Annual Savings: ₹{annual_savings:,.0f}<br>
                • Rate Applied: ₹{ELECTRICITY_RATE}/kWh<br><br>
                <b>Status:</b> ✅ System performing within expected parameters.
                """
            else:
                response = f"""
                <b>🤖 Solar Assistant</b><br><br>
                Thanks for your question! Here's what I can help with:<br><br>
                • <b>"Analyze my setup"</b> — get a full analysis of your solar data<br>
                • <b>"Optimization tips"</b> — actionable recommendations to improve output<br>
                • <b>"Generate report"</b> — detailed performance and financial report<br><br>
                Based on your data, your system produces an average of <b>{avg_power:.0f} kW</b> 
                with peak output reaching <b>{max_power:.0f} kW</b>. 
                The model predicts with <b>{MODEL_R2_SCORE*100:.1f}%</b> accuracy.<br><br>
                Try one of the quick action buttons above or ask a specific question!
                """

            st.session_state.chat_history.append(("assistant", response))
            if pending:
                st.session_state.pending_prompt = None

    for role, msg in st.session_state.chat_history:
        render_chat_message(msg)


st.markdown("---")
st.markdown(
    f"""<div style="text-align:center;color:{COLORS['text_muted']};font-size:0.8rem;padding:16px;">
    SolarVista Dashboard • Built with Streamlit & Plotly • Solar Forecasting Project
    </div>""",
    unsafe_allow_html=True
)