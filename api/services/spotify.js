const axios = require('axios')

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_BASE  = 'https://api.spotify.com/v1'

const basicAuthHeader = () => 'Basic ' + Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString('base64')

// Refreshes the access token and persists the new one to the user document
const refreshAccessToken = async (user) => {
    const response = await axios.post(SPOTIFY_TOKEN_URL,
        new URLSearchParams({
            grant_type:    'refresh_token',
            refresh_token: user.spotifyRefreshToken,
        }),
        { headers: { Authorization: basicAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const { access_token, expires_in } = response.data
    user.spotifyAccessToken = access_token
    user.spotifyTokenExpiry = new Date(Date.now() + expires_in * 1000)
    await user.save()

    return access_token
}

// Returns a valid access token, refreshing first if it has expired
const getValidToken = async (user) => {
    if (user.spotifyTokenExpiry && new Date() < user.spotifyTokenExpiry) {
        return user.spotifyAccessToken
    }
    return refreshAccessToken(user)
}

// Searches Spotify, returns objects from Spotify's response
const searchSpotify = async (user, query, limit = 10) => {
    const token = await getValidToken(user)

    const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
        params: { q: query, type: 'artist,album,track', limit: String(limit) },
        headers: { Authorization: `Bearer ${token}` }
    })

    const { tracks, albums, artists } = response.data
    return {
        tracks: tracks.items,
        albums: albums.items,
        artists: artists.items,
    }
}

// Returns the user's recently played tracks from Spotify
const getRecentlyPlayed = async (user, limit = 20) => {
    const token = await getValidToken(user)

    const response = await axios.get(`${SPOTIFY_API_BASE}/me/player/recently-played`, {
        params: { limit: Math.min(limit, 50) },
        headers: { Authorization: `Bearer ${token}` }
    })

    return response.data.items
}

// Returns top 10 tracks
const getTopTracks = async (user, limit = 10) => {
    const token = await getValidToken(user)

    const response = await axios.get(`${SPOTIFY_API_BASE}/me/top/tracks`, {
        params: { limit: 10, time_range: "long_term" },
        headers: { Authorization: `Bearer ${token}` }
    })
}

module.exports = { searchSpotify, getRecentlyPlayed, getValidToken, refreshAccessToken }
