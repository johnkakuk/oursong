const { searchSpotify, getRecentlyPlayed } = require('../services/spotify')

const search = async (req, res) => {
    try {
        const { q, limit } = req.query
        if (!q) return res.status(400).json({ error: 'Query parameter q is required' })

        const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 10)
        const results = await searchSpotify(req.user, q, parsedLimit)
        res.status(200).json(results)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const recentlyPlayed = async (req, res) => {
    try {
        const { limit } = req.query
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50)
        const items = await getRecentlyPlayed(req.user, parsedLimit)
        res.status(200).json(items)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const topTracks = async (req, res) => {
    try {
        const items = await getTopTracks(req.user)
        res.status(200).json(items)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { search, recentlyPlayed }
