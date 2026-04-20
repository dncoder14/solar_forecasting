import React from 'react'
import { AlertTriangleIcon, InfoIcon, XCircleIcon } from './icons.jsx'

export function Button({ children, variant = 'primary', disabled, onClick, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 hover:shadow-amber-500/40 px-6 py-3 text-sm',
    secondary: 'bg-slate-800 border border-amber-500/30 text-slate-200 hover:border-amber-500 hover:bg-amber-500/10 px-5 py-2.5 text-sm',
    ghost:     'text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-4 py-2 text-sm',
    danger:    'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-5 py-2.5 text-sm',
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5
      ${hover ? 'transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10' : ''}
      ${className}`}>
      {children}
    </div>
  )
}

export function Badge({ children, color = 'amber' }) {
  const colors = {
    amber:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
    green:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    red:    'bg-red-500/15 text-red-400 border-red-500/30',
    blue:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  )
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin`} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`bg-slate-700/50 rounded-xl animate-pulse ${className}`} />
}

export function SectionHeader({ children }) {
  return (
    <h2 className="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-amber-500/30">
      {children}
    </h2>
  )
}

export function TipBox({ children }) {
  return (
    <div className="flex gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-blue-300 text-sm mb-4">
      <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
      <span dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  )
}

export function WarningBox({ message }) {
  return (
    <div className="flex gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm my-2">
      <AlertTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
      <span>{message}</span>
    </div>
  )
}

export function ErrorMessage({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
      <XCircleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-red-300 text-sm">{message}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-slate-600 mb-3" />}
      <h3 className="text-slate-300 font-semibold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs">{description}</p>
    </div>
  )
}

export function Divider() {
  return <hr className="border-slate-700/50 my-6" />
}
