const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    spotifyTrackId: {
        type: String,
        required: true,
        unique: true
    },
    spotifyUri: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artists: {
        type: [String],
        required: true
    },
    albumName: {
        type: String,
        required: true
    },
    albumArtUrl: {
        type: String,
        required: true
    },
    previewUrl: {
        type: String,
        default: null
    },
    duration: {
        type: Number, // in milliseconds
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model('Song', songSchema)
