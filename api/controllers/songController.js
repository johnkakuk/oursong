const { Song, Memory } = require('../models')

const create = async (req, res) => {
    try {
        // Return existing song if already saved (idempotent save)
        const existing = await Song.findOne({ spotifyTrackId: req.body.spotifyTrackId })
        if (existing) return res.status(200).json(existing)

        const song = await Song.create(req.body)
        res.status(201).json(song)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const read = async (req, res) => {
    try {
        const [songs, counts] = await Promise.all([
            Song.find().sort({ createdAt: -1 }),
            Memory.aggregate([
                { $group: { _id: '$songId', count: { $sum: 1 } } }
            ])
        ])
        const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))
        const result = songs.map(s => ({
            ...s.toObject(),
            memoryCount: countMap[s._id.toString()] || 0
        }))
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Returns song with all its memories and their people populated
const readOne = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id)
        if (!song) return res.status(404).json({ error: 'Song not found' })

        const memories = await Memory.find({ songId: req.params.id }).populate('people')
        res.status(200).json({ ...song.toObject(), memories })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const song = await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!song) return res.status(404).json({ error: 'Song not found' })
        res.status(200).json(song)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Cascade-deletes all memories belonging to this song
const remove = async (req, res) => {
    try {
        const song = await Song.findByIdAndDelete(req.params.id)
        if (!song) return res.status(404).json({ error: 'Song not found' })

        await Memory.deleteMany({ songId: req.params.id })
        res.status(200).json({ message: 'Song and its memories deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { create, read, readOne, update, remove }
