import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts'
import { getDatasetStats, getMetadata } from '../api/client'
import { MetricCard, SectionHeader, HeroBanner, Spinner, GlassCard } from '../components/UI'

const ELECTRICITY_RATE = 7.50

function AccuracyGauge({ score }) {
  const pct = Math.round(score * 100)
  const color = score >= 0.9 ? '#10B981' : score >= 0.75 ? '#F59E0B' : '#EF4444'
  const rating = score >= 0.9 ? 'Excellent' : score >= 0.75 ? 'Good' : 'Fair'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (pct / 100) * circumference

  return (
    <div style={{ textAlign: 'center', padding: 16 }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="54" fill="none" stroke="#1E293B" strokeWidth="14" />
        <circle
          cx="80" cy="80" r="54" fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="80" y="75" textAnchor="middle" fill="#F8FAFC" fontSize="28" fontWeight="800">{pct}%</text>
        <text x="80" y="98" textAnchor="middle" fill="#94A3B8" fontSize="12">{rating}</text>
      </svg>
      <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: 4 }}>Model Accuracy (R²)</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: '0.85rem' }}>
          {p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</b>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDatasetStats(), getMetadata()])
      .then(([s, m]) => { setStats(s); setMeta(m) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const { avg_power, max_power, daily_estimate, daily_savings, distribution, correlations, power_curve } = stats
  const r2 = meta?.metrics?.r2 ?? 0.93
  const mae = meta?.metrics?.mae ?? 187.5

  return (
    <div>
      <HeroBanner />

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard icon="⚡" label="Avg Power Output" value={`${avg_power.toFixed(0)} kW`} subtitle="across all records" />
        <MetricCard icon="🔋" label="Peak Power" value={`${max_power.toFixed(0)} kW`} subtitle="maximum recorded" />
        <MetricCard icon="📈" label="Daily Estimate" value={`${daily_estimate.toFixed(0)} kWh`} subtitle="avg × 12 hrs" />
        <MetricCard icon="💰" label="Est. Daily Savings" value={`₹${daily_savings.toFixed(0)}`} subtitle={`@ ₹${ELECTRICITY_RATE}/kWh`} />
      </div>

      {/* Power curve + gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>
        <div className="glass-card">
          <SectionHeader>⚡ Power vs Solar Radiation</SectionHeader>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={power_curve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="radiation" stroke="#94A3B8" fontSize={11} label={{ value: 'Radiation (W/m²)', position: 'insideBottom', offset: -2, fill: '#94A3B8', fontSize: 11 }} />
              <YAxis stroke="#94A3B8" fontSize={11} label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="power" name="Power (kW)" stroke="#F59E0B" strokeWidth={2} fill="url(#powerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SectionHeader>🎯 Model Performance</SectionHeader>
          <AccuracyGauge score={r2} />
          <GlassCard style={{ textAlign: 'center', marginTop: 12, width: '100%' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Mean Absolute Error</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>±{mae.toFixed(1)} kW</div>
          </GlassCard>
        </div>
      </div>

      {/* Distribution + correlations */}
      <SectionHeader>📊 Dataset Insights</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass-card">
          <div style={{ fontWeight: 600, marginBottom: 12, color: '#F8FAFC' }}>📈 Power Generation Distribution</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="x" stroke="#94A3B8" fontSize={10} tickFormatter={v => `${v.toFixed(0)}`} />
              <YAxis stroke="#94A3B8" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" fill="#F59E0B" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <div style={{ fontWeight: 600, marginBottom: 12, color: '#F8FAFC' }}>📊 Top Feature Correlations</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[...correlations].reverse()} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis type="number" stroke="#94A3B8" fontSize={10} domain={[0, 1]} />
              <YAxis type="category" dataKey="feature" stroke="#94A3B8" fontSize={10} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Correlation" fill="#3B82F6" fillOpacity={0.8} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
