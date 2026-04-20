import React from 'react'
import { Card, Badge } from '../ui/index.jsx'
import {
  SunIcon, BoltIcon, BatteryIcon, TrendingUpIcon,
  CurrencyIcon, TargetIcon, ActivityIcon, ChartBarIcon
} from '../ui/icons.jsx'

export function MetricCard({ icon: Icon, label, value, subtitle }) {
  return (
    <Card hover className="text-center">
      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20
        flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-amber-500
        bg-clip-text text-transparent mb-1">
        {value}
      </div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
    </Card>
  )
}

export function MetricGrid({ children }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {children}
    </div>
  )
}

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 p-8
      bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-emerald-500/5
      border border-amber-500/20">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600
          flex items-center justify-center shadow-xl shadow-amber-500/30 flex-shrink-0">
          <SunIcon className="w-9 h-9 text-slate-900" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500
            bg-clip-text text-transparent">
            SolarVista Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-powered solar energy forecasting and grid optimization platform
          </p>
          <div className="flex gap-2 mt-3">
            <Badge color="amber">ML Forecasting</Badge>
            <Badge color="blue">LangGraph Agent</Badge>
            <Badge color="green">RAG Enabled</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ModelHealthPanel({ metadata }) {
  if (!metadata) return null
  const { metrics, model, top_features } = metadata
  const r2Pct = Math.round(metrics.r2 * 100)
  const color = metrics.r2 >= 0.9 ? '#10B981' : metrics.r2 >= 0.75 ? '#F59E0B' : '#EF4444'
  const rating = metrics.r2 >= 0.9 ? 'Excellent' : metrics.r2 >= 0.75 ? 'Good' : 'Fair'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (r2Pct / 100) * circumference

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <TargetIcon className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-slate-300">Model Performance</span>
      </div>

      <div className="flex items-center gap-6">
        <svg width="140" height="140" viewBox="0 0 160 160" className="flex-shrink-0">
          <circle cx="80" cy="80" r="54" fill="none" stroke="#1E293B" strokeWidth="14" />
          <circle cx="80" cy="80" r="54" fill="none"
            stroke={color} strokeWidth="14"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
          <text x="80" y="74" textAnchor="middle" fill="#F8FAFC" fontSize="26" fontWeight="800">{r2Pct}%</text>
          <text x="80" y="94" textAnchor="middle" fill="#94A3B8" fontSize="11">{rating}</text>
        </svg>

        <div className="space-y-3 flex-1">
          <div>
            <div className="text-xs text-slate-500 mb-1">Model</div>
            <div className="text-sm font-semibold text-slate-200">{model}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">MAE</div>
              <div className="text-lg font-bold text-amber-400">±{metrics.mae.toFixed(0)}</div>
              <div className="text-xs text-slate-600">kW</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">RMSE</div>
              <div className="text-lg font-bold text-blue-400">±{metrics.rmse.toFixed(0)}</div>
              <div className="text-xs text-slate-600">kW</div>
            </div>
          </div>
        </div>
      </div>

      {top_features && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Top Features</div>
          <div className="space-y-2">
            {top_features.slice(0, 5).map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-xs text-slate-400 w-36 truncate">{f.feature.replace(/_/g, ' ')}</div>
                <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full"
                    style={{ width: `${(f.importance / top_features[0].importance) * 100}%` }} />
                </div>
                <div className="text-xs text-slate-500 w-10 text-right">
                  {(f.importance * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// Export icon refs for pages to use
export { BoltIcon, BatteryIcon, TrendingUpIcon, CurrencyIcon, ActivityIcon, ChartBarIcon }
