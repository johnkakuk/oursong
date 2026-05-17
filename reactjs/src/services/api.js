import axios from 'axios'

const API_BASE = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/v1'
    : process.env.REACT_APP_API_BASE_URL

const api = axios.create({ baseURL: API_BASE })

// Attach the JWT from localStorage to every request
api.interceptors.request.use(config => {
    const stored = localStorage.getItem('oursong_user')
    if (stored) {
        const { token } = JSON.parse(stored)
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
