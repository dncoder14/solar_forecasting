import React from 'react'
import { HeroBanner, MetricGrid, MetricCard, ModelHealthPanel } from '../components/dashboard/index.jsx'
import { PowerCurveChart, DistributionChart, CorrelationChart } from '../components/charts/index.jsx'
import { SectionHeader, PageSpinner, ErrorMessage, Card, Skeleton } from '../components/ui/index.jsx'
import { BoltIcon, BatteryIcon, TrendingUpIcon, CurrencyIcon } from '../components/ui/icons.jsx'
import { useDatasetStats, useMetadata } from '../hooks/index.js'
import { fmtKW, fmtKWh, fmtINR } from '../utils/formatters.js'
import { ELECTRICITY_RATE } from '../utils/constants.js'

export default function DashboardPage() {
  const { data: stats, loading: statsLoading, error } = useDatasetStats()
  const { data: meta,  loading: metaLoading }          = useMetadata()

  if (statsLoading) return <PageSpinner />
  if (error)        return <ErrorMessage message={`Failed to load dashboard: ${error}`} />

  const { avg_power, max_power, daily_estimate, daily_savings,
          distribution, correlations, power_curve } = stats

  return (
    <div>
      <HeroBanner />

      <MetricGrid>
        <MetricCard icon={BoltIcon}       label="Avg Power Output"   value={fmtKW(avg_power)}       subtitle="across all records" />
        <MetricCard icon={BatteryIcon}    label="Peak Power"         value={fmtKW(max_power)}        subtitle="maximum recorded" />
        <MetricCard icon={TrendingUpIcon} label="Daily Estimate"     value={fmtKWh(daily_estimate)}  subtitle="avg × 12 hrs" />
        <MetricCard icon={CurrencyIcon}   label="Est. Daily Savings" value={fmtINR(daily_savings)}   subtitle={`@ ₹${ELECTRICITY_RATE}/kWh`} />
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <SectionHeader>Power Generation vs Solar Radiation</SectionHeader>
          <PowerCurveChart data={power_curve} />
        </Card>
        <div>
          {metaLoading
            ? <Skeleton className="h-full min-h-64" />
            : <ModelHealthPanel metadata={meta} />
          }
        </div>
      </div>

      <SectionHeader>Dataset Insights</SectionHeader>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold text-slate-300 mb-3">Power Generation Distribution</div>
          <DistributionChart data={distribution} />
        </Card>
        <Card>
          <div className="text-sm font-semibold text-slate-300 mb-3">Top Feature Correlations</div>
          <CorrelationChart data={correlations} />
        </Card>
      </div>
    </div>
  )
}
