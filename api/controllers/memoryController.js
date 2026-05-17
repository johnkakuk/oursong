const { Memory } = require('../models')

const create = async (req, res) => {
    try {
        const payload = { ...req.body }
        if (req.uploadedMediaPath) payload.mediaUrl = req.uploadedMediaPath
        if (req.uploadedThumbnailPath) payload.thumbnailUrl = req.uploadedThumbnailPath
        if (req.uploadedBgImagePath) payload.backgroundImageUrl = req.uploadedBgImagePath

        // FormData sends people as a string (1 person) or array (2+) — normalize to array
        if (payload.people && !Array.isArray(payload.people)) {
            payload.people = [payload.people]
        }

        const memory = await Memory.create(payload)
        res.status(201).json(memory)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Accepts optional ?songId= query param to filter by song
const read = async (req, res) => {
    try {
        const filter = req.query.songId ? { songId: req.query.songId } : {}
        const memories = await Memory.find(filter).populate('people').populate('songId')
        res.status(200).json(memories)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const readOne = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id).populate('people')
        if (!memory) return res.status(404).json({ error: 'Memory not found' })
        res.status(200).json(memory)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const updates = { ...req.body }
        if (req.uploadedMediaPath) updates.mediaUrl = req.uploadedMediaPath
        if (req.uploadedThumbnailPath) updates.thumbnailUrl = req.uploadedThumbnailPath
        if (req.uploadedBgImagePath) updates.backgroundImageUrl = req.uploadedBgImagePath

        const memory = await Memory.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
        if (!memory) return res.status(404).json({ error: 'Memory not found' })
        res.status(200).json(memory)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const remove = async (req, res) => {
    try {
        const memory = await Memory.findByIdAndDelete(req.params.id)
        if (!memory) return res.status(404).json({ error: 'Memory not found' })
        res.status(200).json({ message: 'Memory deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { create, read, readOne, update, remove }
