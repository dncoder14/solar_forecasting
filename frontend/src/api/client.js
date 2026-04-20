import axios from 'axios'

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, Vite proxy forwards /api → localhost:8000.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({ baseURL, timeout: 60000 })

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data?.detail || err.message)
)

export default api
