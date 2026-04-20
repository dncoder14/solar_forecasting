import React from 'react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore.js'
import {
  SunIcon, GridIcon, ActivityIcon, ChartBarIcon, BrainIcon, MenuIcon
} from '../ui/icons.jsx'

const NAV_ITEMS = [
  { to: '/',           Icon: GridIcon,      label: 'Dashboard'    },
  { to: '/forecast',   Icon: SunIcon,       label: 'Forecast'     },
  { to: '/analytics',  Icon: ActivityIcon,  label: 'Analytics'    },
  { to: '/assistant',  Icon: BrainIcon,     label: 'AI Assistant' },
]

const PAGE_TITLES = {
  '/':           'Dashboard Overview',
  '/forecast':   'Weather & Forecast',
  '/analytics':  'Analytics & Insights',
  '/assistant':  'AI Optimization Assistant',
}

function Sidebar() {
  const { sidebarOpen } = useUIStore()

  return (
    <aside className={`
      fixed left-0 top-0 h-full z-40 flex flex-col
      bg-gradient-to-b from-slate-900 to-slate-800
      border-r border-slate-700/50
      transition-all duration-300
      ${sidebarOpen ? 'w-56' : 'w-16'}
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600
          flex items-center justify-center shadow-lg shadow-amber-500/30">
          <SunIcon className="w-5 h-5 text-slate-900" />
        </div>
        {sidebarOpen && (
          <span className="font-extrabold text-transparent bg-clip-text
            bg-gradient-to-r from-amber-400 to-amber-600 text-lg whitespace-nowrap">
            SolarVista
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm
              transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">SolarVista v2.0</p>
          <p className="text-xs text-slate-600">AI-Powered Platform</p>
        </div>
      )}
    </aside>
  )
}

function TopBar({ title }) {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <header className={`
      fixed top-0 right-0 z-30 h-14 flex items-center justify-between px-6
      bg-slate-900/80 backdrop-blur border-b border-slate-700/50
      transition-all duration-300
      ${sidebarOpen ? 'left-56' : 'left-16'}
    `}>
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1.5
            rounded-lg hover:bg-slate-700/50">
          <MenuIcon className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-slate-100 text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30
          rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Model Active</span>
        </div>
      </div>
    </header>
  )
}

export function AppShell({ children, path }) {
  const { sidebarOpen } = useUIStore()
  const title = PAGE_TITLES[path] || 'SolarVista'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <TopBar title={title} />
      <main className={`transition-all duration-300 pt-14 ${sidebarOpen ? 'ml-56' : 'ml-16'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
