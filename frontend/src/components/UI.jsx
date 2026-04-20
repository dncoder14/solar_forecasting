import React from 'react'

export function MetricCard({ icon, label, value, subtitle }) {
  return (
    <div className="metric-card">
      <div style={{ fontSize: '2rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{
        fontSize: '2rem', fontWeight: 800, margin: '8px 0',
        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>
        {value}
      </div>
      {subtitle && <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{subtitle}</div>}
    </div>
  )
}

export function SectionHeader({ children }) {
  return <div className="section-header">{children}</div>
}

export function HeroBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(59,130,246,0.08) 50%, rgba(16,185,129,0.06) 100%)',
      border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: 20, padding: 32, marginBottom: 24
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }} className="gradient-text">
        ☀️ SolarVista Dashboard
      </h1>
      <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
        AI-powered solar energy forecasting and optimization platform.
        Enter weather conditions, get instant power predictions, and explore 24-hour simulations.
      </p>
    </div>
  )
}

export function PredictionResult({ value }) {
  return (
    <div className="prediction-result">
      <div style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
        Predicted Solar Power
      </div>
      <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10B981' }}>
        {value.toFixed(2)} kW
      </div>
    </div>
  )
}

export function WarningBox({ message }) {
  return <div className="warning-box">⚠️ {message}</div>
}

export function TipBox({ children }) {
  return <div className="tip-box">💡 {children}</div>
}

export function ChatMessage({ html }) {
  return <div className="chat-message" dangerouslySetInnerHTML={{ __html: html }} />
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div className="spinner" />
    </div>
  )
}

export function GlassCard({ children, style }) {
  return <div className="glass-card" style={style}>{children}</div>
}
