export const ELECTRICITY_RATE = 7.50
export const SUNRISE_HOUR    = 6
export const SUNSET_HOUR     = 18

export const COLORS = {
  primary:      '#F59E0B',
  primaryLight: '#FBBF24',
  secondary:    '#3B82F6',
  accent:       '#10B981',
  danger:       '#EF4444',
  warning:      '#F97316',
  bg:           '#0F172A',
  surface:      '#1E293B',
  surfaceLight: '#334155',
  text:         '#F8FAFC',
  textMuted:    '#94A3B8',
}

export const WEATHER_GROUPS = {
  '🌡️ Temperature & Atmosphere': [
    'temperature_2_m_above_gnd', 'relative_humidity_2_m_above_gnd',
    'mean_sea_level_pressure_MSL', 'total_precipitation_sfc', 'snowfall_amount_sfc',
  ],
  '☁️ Cloud Cover': [
    'total_cloud_cover_sfc', 'high_cloud_cover_high_cld_lay',
    'medium_cloud_cover_mid_cld_lay', 'low_cloud_cover_low_cld_lay',
  ],
  '☀️ Solar Radiation': ['shortwave_radiation_backwards_sfc'],
  '💨 Wind Conditions': [
    'wind_speed_10_m_above_gnd', 'wind_direction_10_m_above_gnd',
    'wind_speed_80_m_above_gnd', 'wind_direction_80_m_above_gnd',
    'wind_speed_900_mb', 'wind_direction_900_mb', 'wind_gust_10_m_above_gnd',
  ],
  '📐 Sun Geometry': ['angle_of_incidence', 'zenith', 'azimuth'],
}
