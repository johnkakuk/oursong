import api from './api'

const search = (q, limit = 10) => api.get('/spotify/search', { params: { q, limit } })

const getRecentlyPlayed = (limit = 20) => api.get('/spotify/recent', { params: { limit } })

const SpotifyService = { search, getRecentlyPlayed }

export default SpotifyService
