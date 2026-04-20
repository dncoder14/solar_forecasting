import React, { useState } from 'react'
import { AgentTrigger, QuickPromptBar, ReportCard, ChatHistory } from '../components/agent/index.jsx'
import { SectionHeader, Card } from '../components/ui/index.jsx'
import { BrainIcon } from '../components/ui/icons.jsx'
import { useAgentStore } from '../store/agentStore.js'

const MODEL_R2  = 0.9312
const MODEL_MAE = 187.5
const ELECTRICITY_RATE = 7.50

function buildStaticResponse(type) {
  if (type === 'analyze') return `
    <b>Solar Setup Analysis</b><br><br>
    Based on the dataset of <b>4,213</b> records:<br><br>
    • <b>Average Power Output:</b> 1,134 kW<br>
    • <b>Peak Power Recorded:</b> 3,057 kW<br>
    • <b>Average Solar Radiation:</b> 387.8 W/m²<br>
    • <b>Average Temperature:</b> 15.1°C<br>
    • <b>Average Cloud Cover:</b> 34.1%<br><br>
    <b>Assessment:</b> Your solar installation shows <b>moderate</b> performance.
    The correlation between radiation and power output is high, indicating well-positioned panels.
  `
  if (type === 'tips') return `
    <b>Optimization Recommendations</b><br><br>
    <b>1. Panel Angle Optimization</b><br>
    Data shows optimal performance when angle of incidence is 20°–40°. Adjust tilt seasonally.<br><br>
    <b>2. Cloud Cover Monitoring</b><br>
    Average cloud cover is 34%. Shift high-energy tasks to peak solar hours (10 AM – 2 PM).<br><br>
    <b>3. Temperature Management</b><br>
    Average temp is 15°C — your temperature range is good for panel efficiency.<br><br>
    <b>4. Peak Hour Utilization</b><br>
    Schedule maximum energy consumption during 10 AM – 3 PM when generation peaks.
  `
  if (type === 'report') return `
    <b>Solar Performance Report</b><br><br>
    <b>System Overview</b><br>
    • Dataset Size: 4,213 observations<br>
    • Model Accuracy (R²): ${(MODEL_R2 * 100).toFixed(1)}%<br>
    • Prediction Error (MAE): ±${MODEL_MAE.toFixed(0)} kW<br><br>
    <b>Performance Metrics</b><br>
    • Average Generation: 1,134 kW | Peak: 3,057 kW | Efficiency: 37.1%<br><br>
    <b>Energy Estimates</b><br>
    • Daily: 13,608 kWh | Monthly: 408,240 kWh | Annual: 4,898,880 kWh<br><br>
    <b>Financial Impact</b><br>
    • Est. Annual Savings: ₹36,741,600 @ ₹${ELECTRICITY_RATE}/kWh<br><br>
    Status: System performing within expected parameters.
  `
  return `
    <b>Solar Assistant</b><br><br>
    I can help with:<br>
    • <b>Analyze my setup</b> — full analysis of your solar data<br>
    • <b>Optimization tips</b> — actionable recommendations<br>
    • <b>Generate report</b> — detailed performance & financial report<br><br>
    Use the quick prompt buttons above or ask a specific question!
  `
}

export default function AssistantPage() {
  const { report, status, error, apiKey, forecastData,
          chatHistory, setApiKey, runAgent, addMessage } = useAgentStore()
  const [query, setQuery] = useState('')

  const handlePrompt = (type) => addMessage(buildStaticResponse(type))

  const handleQuery = () => {
    if (!query.trim()) return
    const q = query.toLowerCase()
    const type = q.includes('analyz') ? 'analyze'
               : q.includes('tip')    ? 'tips'
               : q.includes('report') ? 'report'
               : 'default'
    addMessage(buildStaticResponse(type))
    setQuery('')
  }

  const handleRunAgent = async () => {
    await runAgent()
    if (useAgentStore.getState().report) {
      addMessage('<b>AI Optimization Report generated!</b> See the structured report above.')
    }
  }

  return (
    <div>
      <SectionHeader>AI Optimization Assistant</SectionHeader>

      <Card className="mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <BrainIcon className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            This assistant analyzes your solar setup and weather data to provide actionable
            recommendations for maximizing energy production. It uses AI reasoning with
            LangGraph + Gemini to evaluate your conditions and suggest optimizations.
          </p>
        </div>
      </Card>

      <AgentTrigger
        onRun={handleRunAgent}
        loading={status === 'loading'}
        hasForecast={!!forecastData}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      <QuickPromptBar onPrompt={handlePrompt} />

      {/* Free-text query */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Ask anything about solar optimization..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuery()}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl
            text-slate-200 text-sm px-4 py-3
            focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
        />
        <button onClick={handleQuery}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900
            font-bold rounded-xl px-5 py-3 text-sm hover:-translate-y-0.5
            transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2">
          Send
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm mb-4">
          {error} — Make sure GOOGLE_API_KEY is set in your environment.
        </div>
      )}

      {report && (
        <div className="mb-6">
          <SectionHeader>AI Optimization Report</SectionHeader>
          <ReportCard report={report} />
        </div>
      )}

      <ChatHistory messages={chatHistory} />
    </div>
  )
}
