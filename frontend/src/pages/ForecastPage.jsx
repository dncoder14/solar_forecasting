import React from 'react'
import { WeatherForm, PredictionResult, SimulationPanel } from '../components/forecast/index.jsx'
import { SimulationChart } from '../components/charts/index.jsx'
import { SectionHeader, PageSpinner, ErrorMessage, Card } from '../components/ui/index.jsx'
import { SunIcon } from '../components/ui/icons.jsx'
import { useForecastStore } from '../store/forecastStore.js'
import { useFeatureLabels } from '../hooks/index.js'

export default function ForecastPage() {
  const { data: labels, loading } = useFeatureLabels()
  const { result, status, error } = useForecastStore()

  if (loading) return <PageSpinner />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left — input form */}
      <div>
        <SectionHeader>Enter Weather Conditions</SectionHeader>
        <WeatherForm labels={labels} />
        {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
      </div>

      {/* Right — results */}
      <div>
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full min-h-96
            border-2 border-dashed border-slate-700 rounded-2xl text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20
              flex items-center justify-center mx-auto mb-4">
              <SunIcon className="w-8 h-8 text-amber-400/50" />
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Ready to Forecast</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Fill in the weather parameters on the left and click Predict to see your solar power forecast.
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-full min-h-96 gap-4">
            <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Running prediction through Random Forest model...</p>
          </div>
        )}

        {status === 'success' && result && (
          <div>
            <SectionHeader>Prediction Results</SectionHeader>
            <PredictionResult result={result} />

            <div className="mt-6">
              <SectionHeader>24-Hour Simulation</SectionHeader>
              <Card>
                <SimulationChart
                  hours={result.simulation.hours}
                  powers={result.simulation.powers}
                  radiations={result.simulation.radiations}
                />
              </Card>
              <SimulationPanel simulation={result.simulation} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
