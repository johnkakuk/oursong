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
    people: [{ // Associated people
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }],
}, { timestamps: true })

module.exports = mongoose.model('Memory', memorySchema)
