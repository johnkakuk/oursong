const { searchTracks } = require('../services/spotify')

const search = async (req, res) => {
    try {
        const { q, limit } = req.query
        if (!q) return res.status(400).json({ error: 'Query parameter q is required' })

        const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 10) // Spotify has very specific limit requirements I guess
        const results = await searchTracks(req.user, q, parsedLimit)
        res.status(200).json(results)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { search }
