import React from 'react'
import { Button, Card, TipBox, WarningBox } from '../ui/index.jsx'
import {
  BoltIcon, BatteryIcon, TrendingUpIcon, CurrencyIcon,
  MountainIcon, CalendarIcon, PlayIcon
} from '../ui/icons.jsx'
import { WEATHER_GROUPS, ELECTRICITY_RATE } from '../../utils/constants.js'
import { useForecastStore } from '../../store/forecastStore.js'
import { useAgentStore } from '../../store/agentStore.js'
import { fmtKW, fmtKWh, fmtINR } from '../../utils/formatters.js'

export function WeatherForm({ labels }) {
  const { inputs, updateInput, runForecast, status } = useForecastStore()
  const setForecastData = useAgentStore(s => s.setForecastData)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await runForecast()
    const result = useForecastStore.getState().result
    if (result) {
      setForecastData({
        average_power: result.prediction,
        daily_output:  result.daily_kwh,
        peak_power:    result.simulation.peak_power,
        peak_hour:     `${result.simulation.peak_hour}:00`,
        simulation:    result.simulation.powers,
        summary:       `Average ${result.prediction.toFixed(1)} kW, daily ${result.daily_kwh.toFixed(0)} kWh`,
        daily_savings: result.simulation.daily_savings,
      })
    }
  }

  const isLoading = status === 'loading'

  return (
    <form onSubmit={handleSubmit}>
      <TipBox>
        Fill in the weather parameters below — they map directly to features used by the ML model.
        Hit <b>Predict</b> to get your result.
      </TipBox>

      <div className="space-y-4">
        {Object.entries(WEATHER_GROUPS).map(([groupName, cols]) => (
          <Card key={groupName}>
            <div className="font-semibold text-slate-200 mb-4 text-sm">{groupName}</div>
            <div className={`grid gap-3 grid-cols-2 md:grid-cols-${Math.min(cols.length, 4)}`}>
              {cols.map(col => {
                const meta = labels[col] || {}
                return (
                  <div key={col}>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                      {meta.label || col}
                    </label>
                    <input
                      type="number" step="any"
                      min={meta.min} max={meta.max}
                      value={inputs[col] ?? meta.default ?? 0}
                      onChange={e => updateInput(col, parseFloat(e.target.value) || 0)}
                      title={meta.help}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg
                        text-slate-200 text-sm px-3 py-2
                        focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30
                        transition-colors"
                    />
                    <div className="text-xs text-slate-600 mt-0.5">{meta.min} – {meta.max}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={isLoading} className="w-full py-4 text-base">
          {isLoading
            ? <><span className="animate-spin mr-1">⏳</span> Running prediction...</>
            : <><PlayIcon className="w-4 h-4" /> Predict Solar Power</>
          }
        </Button>
      </div>
    </form>
  )
}

export function PredictionResult({ result }) {
  if (!result) return null
  const { prediction, daily_kwh, monthly_kwh, monthly_savings } = result

  const metrics = [
    { Icon: TrendingUpIcon, label: 'Daily Output',    value: fmtKWh(daily_kwh),      sub: '12 sunlight hours' },
    { Icon: CalendarIcon,   label: 'Monthly Output',  value: fmtKWh(monthly_kwh),    sub: '30 days estimate' },
    { Icon: CurrencyIcon,   label: 'Monthly Savings', value: fmtINR(monthly_savings), sub: `@ ₹${ELECTRICITY_RATE}/kWh` },
  ]

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5
        border border-emerald-500/30 rounded-2xl p-6 text-center">
        <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Predicted Solar Power</div>
        <div className="text-5xl font-extrabold text-emerald-400 mb-1">{fmtKW(prediction)}</div>
        <div className="text-slate-500 text-sm">instantaneous output</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map(({ Icon, label, value, sub }) => (
          <Card key={label} className="text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-lg font-bold text-amber-400">{value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SimulationPanel({ simulation }) {
  if (!simulation) return null
  const { peak_power, peak_hour, total_daily, daily_savings } = simulation

  const metrics = [
    { Icon: MountainIcon,  label: 'Peak Hour',    value: `${String(peak_hour).padStart(2,'0')}:00`, sub: fmtKW(peak_power) },
    { Icon: BoltIcon,      label: 'Total Daily',  value: fmtKWh(total_daily),  sub: 'sum across 24hrs' },
    { Icon: CurrencyIcon,  label: 'Daily Savings', value: fmtINR(daily_savings), sub: 'simulated estimate' },
  ]

  return (
    <div className="mt-4 space-y-4">
      <TipBox>
        This simulation shows how power generation changes throughout the day based on your weather inputs.
      </TipBox>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map(({ Icon, label, value, sub }) => (
          <Card key={label} className="text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-lg font-bold text-amber-400">{value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
