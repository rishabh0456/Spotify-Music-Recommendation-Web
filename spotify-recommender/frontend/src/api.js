import axios from 'axios'

const BASE_URL = import.meta.env.PROD
  ? '/api'                        // Docker/production — uses nginx proxy
  : 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// ─── Request interceptor ────────────────────────────
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

// ─── Response interceptor ───────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    return Promise.reject({ message })
  }
)

export const searchTracks = async (query) => {
  const res = await api.get(`/search/?q=${encodeURIComponent(query)}`)
  return res.data.data
}

export const getRecommendations = async (track, artist, n = 10, prompt = null) => {
  const params = { track, artist, n, spotify: true }
  if (prompt) params.prompt = prompt
  const res = await api.get('/recommend/', { params })
  return res.data.data
}

export const getTrackDetails = async (track, artist) => {
  const res = await api.get('/track/', {
    params: { track, artist }
  })
  return res.data.data
}

export default api

export const getRecommendationsByMood = async (mood, n = 10) => {
  const res = await api.get('/recommend/mood/', {
    params: { mood, n, spotify: true }
  })
  return res.data.data
}