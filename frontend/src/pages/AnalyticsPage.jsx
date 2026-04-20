import React from 'react'
import { ModelHealthPanel } from '../components/dashboard/index.jsx'
import { DistributionChart, CorrelationChart } from '../components/charts/index.jsx'
import { SectionHeader, PageSpinner, ErrorMessage, Card, Skeleton } from '../components/ui/index.jsx'
import { useDatasetStats, useMetadata } from '../hooks/index.js'

export default function AnalyticsPage() {
  const { data: stats, loading: statsLoading, error } = useDatasetStats()
  const { data: meta,  loading: metaLoading }          = useMetadata()

  if (statsLoading) return <PageSpinner />
  if (error)        return <ErrorMessage message={`Failed to load analytics: ${error}`} />

  const { distribution, correlations, total_records } = stats

  return (
    <div>
      <SectionHeader>Model Analytics & Insights</SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          {metaLoading
            ? <Skeleton className="h-80" />
            : <ModelHealthPanel metadata={meta} />
          }
        </div>

        <Card className="lg:col-span-2">
          <div className="text-sm font-semibold text-slate-300 mb-4">Dataset Summary</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Records',   value: total_records?.toLocaleString() },
              { label: 'Features',        value: '20' },
              { label: 'Target Variable', value: 'Power (kW)' },
              { label: 'Train Split',     value: '80%' },
              { label: 'Test Split',      value: '20%' },
              { label: 'CV Folds',        value: '3-fold' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-900/50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">{label}</div>
                <div className="text-base font-bold text-amber-400">{value}</div>
              </div>
            ))}
          </div>

          {meta?.top_features && (
            <div className="mt-6">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
                Top 10 Predictive Features
              </div>
              <div className="space-y-2">
                {meta.top_features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs text-slate-500 w-4">{i + 1}</div>
                    <div className="text-xs text-slate-300 w-52 truncate">
                      {f.feature.replace(/_/g, ' ')}
                    </div>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full"
                        style={{ width: `${(f.importance / meta.top_features[0].importance) * 100}%` }} />
                    </div>
                    <div className="text-xs text-slate-400 w-12 text-right">
                      {(f.importance * 100).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold text-slate-300 mb-3">Power Generation Distribution</div>
          <DistributionChart data={distribution} />
        </Card>
        <Card>
          <div className="text-sm font-semibold text-slate-300 mb-3">Feature Correlations with Power Output</div>
          <CorrelationChart data={correlations} />
        </Card>
      </div>
    </div>
  )
}
