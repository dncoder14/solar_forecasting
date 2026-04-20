import React from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { COLORS } from '../../utils/constants.js'

const GRID   = { strokeDasharray: '3 3', stroke: 'rgba(148,163,184,0.08)' }
const AXIS   = { stroke: '#475569', fontSize: 11 }
const TT_STYLE = {
  contentStyle: { background: '#1E293B', border: '1px solid #334155', borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: '#94A3B8' },
  itemStyle:    { color: '#F8FAFC' },
}

// ── PowerCurveChart ───────────────────────────────────────────────────────────
export function PowerCurveChart({ data }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.35} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="radiation" {...AXIS}
          label={{ value: 'Solar Radiation (W/m²)', position: 'insideBottom', offset: -12, fill: '#64748B', fontSize: 11 }} />
        <YAxis {...AXIS}
          label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
        <Tooltip {...TT_STYLE} />
        <Area type="monotone" dataKey="power" name="Power (kW)"
          stroke={COLORS.primary} strokeWidth={2.5} fill="url(#powerGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── SimulationChart ───────────────────────────────────────────────────────────
export function SimulationChart({ hours, powers, radiations }) {
  const data = hours.map((h, i) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    power: powers[i],
    radiation: radiations[i],
  }))

  return (
    <ResponsiveContainer width="100%" height={360}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="radGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.secondary} stopOpacity={0.2} />
            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="hour" {...AXIS} />
        <YAxis yAxisId="left"  {...AXIS} label={{ value: 'Power (kW)',      angle: -90, position: 'insideLeft',  fill: '#64748B', fontSize: 11 }} />
        <YAxis yAxisId="right" {...AXIS} orientation="right"
          label={{ value: 'Radiation (W/m²)', angle: 90,  position: 'insideRight', fill: '#64748B', fontSize: 11 }} />
        <Tooltip {...TT_STYLE} />
        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '0.8rem', paddingTop: 8 }} />
        <Area yAxisId="left"  type="monotone" dataKey="power"     name="Power (kW)"
          stroke={COLORS.primary}   strokeWidth={3} fill="url(#simGrad)"
          dot={{ r: 3, fill: COLORS.primaryLight }} activeDot={{ r: 5 }} />
        <Area yAxisId="right" type="monotone" dataKey="radiation" name="Radiation (W/m²)"
          stroke={COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" fill="url(#radGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── DistributionChart ─────────────────────────────────────────────────────────
export function DistributionChart({ data }) {
  if (!data?.length) return null
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="x" {...AXIS} tickFormatter={v => v.toFixed(0)} />
        <YAxis {...AXIS} />
        <Tooltip {...TT_STYLE} />
        <Bar dataKey="count" name="Count" fill={COLORS.primary} fillOpacity={0.8} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── CorrelationChart ──────────────────────────────────────────────────────────
export function CorrelationChart({ data }) {
  if (!data?.length) return null
  const reversed = [...data].reverse()
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={reversed} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid {...GRID} />
        <XAxis type="number" {...AXIS} domain={[0, 1]} />
        <YAxis type="category" dataKey="feature" {...AXIS} width={150} />
        <Tooltip {...TT_STYLE} />
        <Bar dataKey="value" name="Correlation" fill={COLORS.secondary} fillOpacity={0.85} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
