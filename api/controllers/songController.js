const crypto = require('crypto')
const { Song, Memory } = require('../models')

const create = async (req, res) => {
    try {
        const userId = req.user._id
        const existing = await Song.findOne({ spotifyTrackId: req.body.spotifyTrackId, userId })
        if (existing) return res.status(200).json(existing)

        const song = await Song.create({ ...req.body, userId })
        res.status(201).json(song)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const read = async (req, res) => {
    try {
        const userId = req.user._id
        const [songs, counts] = await Promise.all([
            Song.find({ userId }).sort({ createdAt: -1 }),
            Memory.aggregate([
                { $match: { userId } },
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
        const userId = req.user._id
        const song = await Song.findOne({ _id: req.params.id, userId })
        if (!song) return res.status(404).json({ error: 'Song not found' })

        const memories = await Memory.find({ songId: req.params.id, userId }).populate('people')
        res.status(200).json({ ...song.toObject(), memories })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const song = await Song.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
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
        const userId = req.user._id
        const song = await Song.findOneAndDelete({ _id: req.params.id, userId })
        if (!song) return res.status(404).json({ error: 'Song not found' })

        await Memory.deleteMany({ songId: req.params.id, userId })
        res.status(200).json({ message: 'Song and its memories deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const publish = async (req, res) => {
    try {
        const song = await Song.findOne({ _id: req.params.id, userId: req.user._id })
        if (!song) return res.status(404).json({ error: 'Song not found' })

        song.isPublished = !song.isPublished
        if (song.isPublished && !song.shareToken) {
            song.shareToken = crypto.randomBytes(16).toString('hex')
        }
        await song.save()
        res.json({ isPublished: song.isPublished, shareToken: song.shareToken })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getPublic = async (req, res) => {
    try {
        const song = await Song.findOne({ shareToken: req.params.token, isPublished: true })
        if (!song) return res.status(404).json({ error: 'Not found' })

        const memories = await Memory.find({ songId: song._id }).sort({ createdAt: -1 })
        res.json({ ...song.toObject(), memories })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { create, read, readOne, update, remove, publish, getPublic }
