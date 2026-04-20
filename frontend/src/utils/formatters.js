export const fmtKW    = (v) => `${Number(v).toFixed(1)} kW`
export const fmtKWh   = (v) => `${Number(v).toFixed(0)} kWh`
export const fmtINR   = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
export const fmtPct   = (v) => `${(Number(v) * 100).toFixed(1)}%`
export const fmtHour  = (h) => `${String(h).padStart(2, '0')}:00`
