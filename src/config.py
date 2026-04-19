APP_TITLE = "SolarVista — Intelligent Solar Management"
APP_ICON = "☀️"
APP_DESCRIPTION = "AI-Powered Solar Energy Forecasting & Optimization Platform"

COLORS = {
    "primary": "#F59E0B",
    "primary_light": "#FBBF24",
    "secondary": "#3B82F6",
    "accent": "#10B981",
    "danger": "#EF4444",
    "background": "#0F172A",
    "surface": "#1E293B",
    "surface_light": "#334155",
    "text": "#F8FAFC",
    "text_muted": "#94A3B8",
    "gradient_start": "#F59E0B",
    "gradient_end": "#EF4444",
}

FEATURE_LABELS = {
    "temperature_2_m_above_gnd": ("🌡️ Temperature (°C)", "Temperature at 2m above ground level", -20.0, 50.0, 25.0),
    "relative_humidity_2_m_above_gnd": ("💧 Relative Humidity (%)", "Humidity percentage at 2m", 0.0, 100.0, 50.0),
    "mean_sea_level_pressure_MSL": ("🌊 Sea Level Pressure (hPa)", "Mean sea level pressure", 950.0, 1060.0, 1013.0),
    "total_precipitation_sfc": ("🌧️ Precipitation (mm)", "Total surface precipitation", 0.0, 50.0, 0.0),
    "snowfall_amount_sfc": ("❄️ Snowfall (mm)", "Snowfall amount at surface", 0.0, 50.0, 0.0),
    "total_cloud_cover_sfc": ("☁️ Total Cloud Cover (%)", "Total cloud coverage percentage", 0.0, 100.0, 20.0),
    "high_cloud_cover_high_cld_lay": ("🌤️ High Cloud Cover (%)", "High altitude cloud coverage", 0.0, 100.0, 10.0),
    "medium_cloud_cover_mid_cld_lay": ("⛅ Medium Cloud Cover (%)", "Mid-level cloud coverage", 0.0, 100.0, 10.0),
    "low_cloud_cover_low_cld_lay": ("🌥️ Low Cloud Cover (%)", "Low altitude cloud coverage", 0.0, 100.0, 10.0),
    "shortwave_radiation_backwards_sfc": ("☀️ Solar Radiation (W/m²)", "Shortwave radiation at surface", 0.0, 1200.0, 500.0),
    "wind_speed_10_m_above_gnd": ("💨 Wind Speed 10m (m/s)", "Wind speed at 10m height", 0.0, 40.0, 5.0),
    "wind_direction_10_m_above_gnd": ("🧭 Wind Direction 10m (°)", "Wind direction at 10m", 0.0, 360.0, 180.0),
    "wind_speed_80_m_above_gnd": ("💨 Wind Speed 80m (m/s)", "Wind speed at 80m height", 0.0, 50.0, 7.0),
    "wind_direction_80_m_above_gnd": ("🧭 Wind Direction 80m (°)", "Wind direction at 80m", 0.0, 360.0, 180.0),
    "wind_speed_900_mb": ("💨 Wind Speed 900mb (m/s)", "Wind speed at 900mb pressure", 0.0, 50.0, 5.0),
    "wind_direction_900_mb": ("🧭 Wind Direction 900mb (°)", "Wind direction at 900mb", 0.0, 360.0, 180.0),
    "wind_gust_10_m_above_gnd": ("🌬️ Wind Gust 10m (m/s)", "Wind gust speed at 10m", 0.0, 60.0, 10.0),
    "angle_of_incidence": ("📐 Angle of Incidence (°)", "Sun ray angle to panel surface", 0.0, 90.0, 30.0),
    "zenith": ("🌅 Zenith Angle (°)", "Sun's zenith angle (0=overhead)", 0.0, 90.0, 45.0),
    "azimuth": ("🔄 Azimuth Angle (°)", "Sun's azimuth angle", 0.0, 360.0, 180.0),
}

SIMULATION_HOURS = list(range(0, 24))
SUNRISE_HOUR = 6
SUNSET_HOUR = 18

ELECTRICITY_RATE = 7.50

MODEL_R2_SCORE = 0.9312
MODEL_MAE = 187.5
