import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'
import ForecastPage   from './pages/ForecastPage.jsx'
import AnalyticsPage  from './pages/AnalyticsPage.jsx'
import AssistantPage  from './pages/AssistantPage.jsx'

function AppRoutes() {
  const { pathname } = useLocation()
  return (
    <AppShell path={pathname}>
      <Routes>
        <Route path="/"          element={<DashboardPage />} />
        <Route path="/forecast"  element={<ForecastPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="*"          element={<DashboardPage />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
