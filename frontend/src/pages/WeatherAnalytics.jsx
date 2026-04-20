import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getFeatureLabels, predict } from '../api/client'
import {
  MetricCard, SectionHeader, PredictionResult,
  WarningBox, TipBox, Spinner
} from '../components/UI'

const GROUPS = {
  '🌡️ Temperature & Atmosphere': [
    'temperature_2_m_above_gnd', 'relative_humidity_2_m_above_gnd',
    'mean_sea_level_pressure_MSL', 'total_precipitation_sfc', 'snowfall_amount_sfc'
  ],
  '☁️ Cloud Cover': [
    'total_cloud_cover_sfc', 'high_cloud_cover_high_cld_lay',
    'medium_cloud_cover_mid_cld_lay', 'low_cloud_cover_low_cld_lay'
  ],
  '☀️ Solar Radiation': ['shortwave_radiation_backwards_sfc'],
  '💨 Wind Conditions': [
    'wind_speed_10_m_above_gnd', 'wind_direction_10_m_above_gnd',
    'wind_speed_80_m_above_gnd', 'wind_direction_80_m_above_gnd',
    'wind_speed_900_mb', 'wind_direction_900_mb', 'wind_gust_10_m_above_gnd'
  ],
  '📐 Sun Geometry': ['angle_of_incidence', 'zenith', 'azimuth']
}

const ELECTRICITY_RATE = 7.50

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: '0.85rem' }}>
          {p.name}: <b>{p.value?.toFixed(1)}</b>
        </div>
      ))}
    </div>
  )
}

export default function WeatherAnalytics({ onForecastReady }) {
  const [labels, setLabels] = useState({})
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [result, setResult] = useState(null)
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    getFeatureLabels().then(data => {
      setLabels(data)
      const defaults = {}
      Object.entries(data).forEach(([k, v]) => { defaults[k] = v.default })
      setValues(defaults)
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPredicting(true)
    setWarnings([])
    try {
      // client-side range validation
      const warns = []
      Object.entries(labels).forEach(([k, v]) => {
        const val = values[k] ?? 0
        if (val < v.min || val > v.max) {
          warns.push(`${v.label}: value ${val} is outside expected range (${v.min} – ${v.max})`)
        }
      })
      setWarnings(warns)

      const data = await predict(values)
      setResult(data)

      // pass forecast data up to parent for the AI tab
      onForecastReady?.({
        average_power: data.prediction,
        daily_output: data.daily_kwh,
        peak_power: data.simulation.peak_power,
        peak_hour: `${data.simulation.peak_hour}:00`,
        simulation: data.simulation.powers,
        summary: `Average ${data.prediction.toFixed(1)} kW, daily ${data.daily_kwh.toFixed(0)} kWh`,
        daily_savings: data.simulation.daily_savings,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setPredicting(false)
    }
  }

  if (loading) return <Spinner />

  const simData = result?.simulation
    ? result.simulation.hours.map((h, i) => ({
        hour: `${String(h).padStart(2, '0')}:00`,
        power: result.simulation.powers[i],
        radiation: result.simulation.radiations[i],
      }))
    : []

  return (
    <div>
      <SectionHeader>🌤️ Enter Weather Conditions</SectionHeader>
      <TipBox>
        Fill in the weather parameters below — they map directly to features used by the ML model. Hit <b>Predict</b> to get your result.
      </TipBox>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        {Object.entries(GROUPS).map(([groupName, cols]) => (
          <div key={groupName} style={{
            background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(245,158,11,0.12)',
            borderRadius: 16, padding: 20, marginBottom: 16
          }}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: '#F8FAFC' }}>{groupName}</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols.length, 4)}, 1fr)`, gap: 12 }}>
              {cols.map(col => {
                const meta = labels[col] || {}
                return (
                  <div key={col}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: 4, fontWeight: 500 }}>
                      {meta.label || col}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={values[col] ?? 0}
                      min={meta.min}
                      max={meta.max}
                      step="any"
                      title={meta.help}
                      onChange={e => handleChange(col, e.target.value)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <button type="submit" className="btn-primary" disabled={predicting}>
          {predicting ? '⏳ Predicting...' : '⚡ Predict Solar Power'}
        </button>
      </form>

      {warnings.map((w, i) => <WarningBox key={i} message={w} />)}

      {result && (
        <div style={{ marginTop: 24 }}>
          <PredictionResult value={result.prediction} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '16px 0' }}>
            <MetricCard icon="📈" label="Daily Output" value={`${result.daily_kwh.toFixed(0)} kWh`} subtitle="12 sunlight hours" />
            <MetricCard icon="📅" label="Monthly Output" value={`${result.monthly_kwh.toFixed(0)} kWh`} subtitle="30 days estimate" />
            <MetricCard icon="💰" label="Monthly Savings" value={`₹${result.monthly_savings.toFixed(0)}`} subtitle={`@ ₹${ELECTRICITY_RATE}/kWh`} />
          </div>

          <TipBox>
            This simulation shows how power generation would change throughout the day based on your weather inputs.
          </TipBox>

          <div className="glass-card" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#F8FAFC' }}>🕐 24-Hour Solar Power Simulation</div>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={simData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="simPowerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {/* daylight band */}
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#F59E0B" fontSize={11} label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: '#F59E0B', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" fontSize={11} label={{ value: 'Radiation (W/m²)', angle: 90, position: 'insideRight', fill: '#3B82F6', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '0.85rem' }} />
                <Area yAxisId="left" type="monotone" dataKey="power" name="Power (kW)" stroke="#F59E0B" strokeWidth={3} fill="url(#simPowerGrad)" dot={{ r: 3, fill: '#FBBF24' }} />
                <Area yAxisId="right" type="monotone" dataKey="radiation" name="Radiation (W/m²)" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
            <MetricCard icon="🏔️" label="Peak Hour" value={`${String(simData.reduce((a, b) => a.power > b.power ? a : b, simData[0])?.hour || '12:00')}`} subtitle={`${result.simulation.peak_power.toFixed(0)} kW`} />
            <MetricCard icon="⚡" label="Total Daily" value={`${result.simulation.total_daily.toFixed(0)} kWh`} subtitle="sum across 24hrs" />
            <MetricCard icon="💰" label="Daily Savings" value={`₹${result.simulation.daily_savings.toFixed(0)}`} subtitle="simulated estimate" />
          </div>
        </div>
      )}
    </div>
  )
}
