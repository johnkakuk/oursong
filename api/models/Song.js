const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    spotifyTrackId: {
        type: String,
        required: true
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
    isPublished: {
        type: Boolean,
        default: false,
    },
    shareToken: {
        type: String,
        default: null,
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
