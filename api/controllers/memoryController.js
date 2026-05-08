const { Memory } = require('../models')

const create = async (req, res) => {
    try {
        const payload = { ...req.body }
        if (req.uploadedMediaPath) payload.mediaUrl = req.uploadedMediaPath

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
        const memories = await Memory.find(filter).populate('people')
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
        const memory = await Memory.findByIdAndUpdate(
            req.params.id,
            req.body,
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
