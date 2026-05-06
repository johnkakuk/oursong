const mongoose = require('mongoose')

const memorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    },
    people: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    },
})

module.exports = mongoose.model('Memory', memorySchema)
