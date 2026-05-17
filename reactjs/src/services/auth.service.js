import api from './api'

const STORAGE_KEY = 'oursong_user'

// Called from AuthCallback after Spotify redirect — stores the JWT
const handleCallback = (token) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }))
}

// Fetches current user's profile from the API
const getMe = async () => {
    const response = await api.get('/auth/me')
    return response.data
}

const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
}

const getToken = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored).token || null
}

const isAuthenticated = () => Boolean(getToken())

const AuthService = { handleCallback, getMe, logout, getToken, isAuthenticated }

export default AuthService
