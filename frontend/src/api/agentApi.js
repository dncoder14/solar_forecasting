import api from './client'

export const optimize = (forecast_data, api_key) =>
  api.post('/optimize', { forecast_data, api_key })
