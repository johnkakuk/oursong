const path = require('path')
const fs = require('fs/promises')
const { LocalSong } = require('../models')

const create = async (req, res) => {
    try {
        const payload = { ...req.body }
        payload.trackUrl = req.uploadedTrackPath
        if (req.uploadedAlbumArtPath) payload.albumArtUrl = req.uploadedAlbumArtPath

        const localSong = await LocalSong.create(payload)
        res.status(201).json(localSong)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const read = async (req, res) => {
    try {
        const localSongs = await LocalSong.find()
        res.status(200).json(localSongs)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const readOne = async (req, res) => {
    try {
        const localSong = await LocalSong.findById(req.params.id)
        if (!localSong) return res.status(404).json({ error: 'Local song not found' })
        res.status(200).json(localSong)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const localSong = await LocalSong.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!localSong) return res.status(404).json({ error: 'Local song not found' })
        res.status(200).json(localSong)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Deletes the record and removes the audio file (and album art if local) from disk
const remove = async (req, res) => {
    try {
        const localSong = await LocalSong.findByIdAndDelete(req.params.id)
        if (!localSong) return res.status(404).json({ error: 'Local song not found' })

        const filesToDelete = [localSong.trackUrl, localSong.albumArtUrl].filter(Boolean)
        // AI generated
        await Promise.allSettled(
            filesToDelete.map(url =>
                fs.unlink(path.join(__dirname, '..', 'public', url))
            )
        )

        res.status(200).json({ message: 'Local song deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { create, read, readOne, update, remove }
