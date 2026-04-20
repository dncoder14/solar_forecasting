import { create } from 'zustand'
import { predict } from '../api/forecastApi'

export const useForecastStore = create((set, get) => ({
  inputs: {},
  result: null,
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error: null,

  setInputs: (inputs) => set({ inputs }),
  updateInput: (key, value) =>
    set(state => ({ inputs: { ...state.inputs, [key]: value } })),

  runForecast: async () => {
    set({ status: 'loading', error: null })
    try {
      const result = await predict(get().inputs)
      set({ result, status: 'success' })
    } catch (err) {
      set({ error: String(err), status: 'error' })
    }
  },

  reset: () => set({ result: null, status: 'idle', error: null }),
}))
