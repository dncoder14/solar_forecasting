import { create } from 'zustand'
import { optimize } from '../api/agentApi'

export const useAgentStore = create((set, get) => ({
  forecastData: null,
  report: null,
  chatHistory: [],
  status: 'idle',
  error: null,
  apiKey: '',

  setApiKey: (apiKey) => set({ apiKey }),
  setForecastData: (forecastData) => set({ forecastData }),
  addMessage: (html) =>
    set(state => ({ chatHistory: [...state.chatHistory, html] })),

  runAgent: async () => {
    const { forecastData, apiKey } = get()
    if (!forecastData) return
    set({ status: 'loading', error: null })
    try {
      const res = await optimize(forecastData, apiKey)
      set({ report: res.report, status: 'success' })
    } catch (err) {
      set({ error: String(err), status: 'error' })
    }
  },

  reset: () => set({ report: null, status: 'idle', error: null, chatHistory: [] }),
}))
