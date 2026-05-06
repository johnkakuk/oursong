const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    profilePictureUrl: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('Person', personSchema)
