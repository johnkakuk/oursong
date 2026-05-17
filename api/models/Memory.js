const mongoose = require('mongoose')

const memorySchema = new mongoose.Schema({
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'photo', 'video'],
        required: true
    },
    content: { // For text posts
        type: String,
    },
    mediaUrl: { // For photo/video posts
        type: String,
    },
    thumbnailUrl: { // Pre-generated poster for uploaded videos
        type: String,
        default: null
    },
    people: [{ // Associated people
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }],
    bgColor: { // Hex color for text-type memory backgrounds
        type: String,
        default: null
    },
    backgroundImageUrl: { // Optional photo behind text-type memories
        type: String,
        default: null
    },
}, { timestamps: true })

module.exports = mongoose.model('Memory', memorySchema)
