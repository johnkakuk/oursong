const mongoose = require('mongoose')

const localSongSchema = new mongoose.Schema({
    trackUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    albumName: {
        type: String,
    },
    albumArtUrl: {
        type: String,
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
}, { timestamps: true })

module.exports = mongoose.model('LocalSong', localSongSchema)
