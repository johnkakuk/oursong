const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profilePictureUrl: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('Tag', tagSchema)
