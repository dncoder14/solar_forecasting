import React, { useState } from 'react'
import { Card, Badge, Button } from '../ui/index.jsx'
import {
  AlertTriangleIcon, BoltIcon, BatteryIcon, CheckCircleIcon,
  ClipboardIcon, LightbulbIcon, ActivityIcon, KeyIcon, PlayIcon, SendIcon
} from '../ui/icons.jsx'

const RISK_COLORS = { high: 'red', medium: 'orange', low: 'green' }

export function ReportCard({ report }) {
  const [showRaw, setShowRaw] = useState(false)
  if (!report) return null

  return (
    <div className="space-y-4 animate-fade-in">
      {report.summary && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardIcon className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200 text-sm">Forecast Summary</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{report.summary}</p>
        </Card>
      )}

      {report.risk_periods?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangleIcon className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-slate-200 text-sm">Risk Periods</span>
          </div>
          <div className="space-y-2">
            {report.risk_periods.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl">
                <Badge color={RISK_COLORS[r.level?.toLowerCase()] || 'orange'}>
                  {r.level || 'Medium'}
                </Badge>
                <div>
                  <div className="text-sm font-medium text-slate-200">{r.time || r.period}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{r.reason || r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.grid_recommendations?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <BoltIcon className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200 text-sm">Grid Balancing Recommendations</span>
          </div>
          <div className="space-y-2">
            {report.grid_recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40
                  flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.energy_strategies?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <BatteryIcon className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200 text-sm">Energy Utilization Strategies</span>
          </div>
          <div className="space-y-2">
            {report.energy_strategies.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {report.battery_management && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <BatteryIcon className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Battery Management</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{report.battery_management}</p>
        </Card>
      )}

      <div>
        <button onClick={() => setShowRaw(p => !p)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline">
          {showRaw ? 'Hide' : 'Show'} raw JSON
        </button>
        {showRaw && (
          <Card className="mt-2">
            <pre className="text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(report, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  )
}

export function ChatHistory({ messages }) {
  if (!messages?.length) return null
  return (
    <div className="space-y-3 mt-4">
      {messages.map((msg, i) => (
        <div key={i} className="bg-slate-800/60 border-l-4 border-amber-500
          rounded-r-2xl px-5 py-4 text-sm text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: msg }} />
      ))}
    </div>
  )
}

export function AgentTrigger({ onRun, loading, hasForecast, apiKey, onApiKeyChange }) {
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <KeyIcon className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-slate-200 text-sm">API Configuration</span>
      </div>
      <div className="flex gap-3 mb-4">
        <input
          type="password"
          placeholder="Enter Google Gemini API key (optional)..."
          value={apiKey}
          onChange={e => onApiKeyChange(e.target.value)}
          className="flex-1 bg-slate-900/80 border border-slate-600 rounded-lg
            text-slate-200 text-sm px-3 py-2
            focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
        />
      </div>
      {hasForecast ? (
        <Button onClick={onRun} disabled={loading} className="w-full py-3">
          {loading
            ? <><span className="animate-spin mr-1">⏳</span> AI is analyzing...</>
            : <><PlayIcon className="w-4 h-4" /> Run AI Optimization Analysis</>
          }
        </Button>
      ) : (
        <div className="flex gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-300 text-sm">
          <ActivityIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
          <span>Run a prediction in the <b>Forecast</b> tab first to enable AI analysis</span>
        </div>
      )}
    </Card>
  )
}

export function QuickPromptBar({ onPrompt }) {
  const prompts = [
    { id: 'analyze', Icon: ActivityIcon,  label: 'Analyze my setup' },
    { id: 'tips',    Icon: LightbulbIcon, label: 'Optimization tips' },
    { id: 'report',  Icon: ClipboardIcon, label: 'Generate report' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {prompts.map(({ id, Icon, label }) => (
        <button key={id} onClick={() => onPrompt(id)}
          className="flex items-center justify-center gap-2
            bg-slate-800 border border-amber-500/20 text-slate-300
            hover:border-amber-500 hover:bg-amber-500/10 hover:text-slate-100
            rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200">
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
