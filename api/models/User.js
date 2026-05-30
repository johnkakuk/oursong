const mongoose = require('mongoose')
// const bcrypt = require('bcryptjs')

// function validateEmail(email) {
//     if (!email) return true
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
// }

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        sparse: true,
        lowercase: true,
        // validate: [validateEmail, 'Please fill a valid email address']
    },
    // password: {
    //     type: String,
    // },
    spotifyId: {
        type: String,
        unique: true,
        sparse: true // Since two null values would collide on unique index
    },
    displayName: {
        type: String,
        default: null
    },
    spotifyAccessToken:  { type: String },
    spotifyRefreshToken: { type: String },
    spotifyTokenExpiry:  { type: Date   },
    isPremiumUser:       { type: Boolean, default: false },
}, { timestamps: true })

// userSchema.pre('save', function(next) {
//     const user = this;
//
//     // Skip hashing if no password (e.g. Spotify OAuth users)
//     if(user.password && (user.isNew || user.isModified('password'))) {
//         bcrypt.genSalt(10, (error, salt) => {
//             if(error) { return next(error) }
//
//             bcrypt.hash(user.password, salt, null, (error, hash) => {
//                 if(error) { return next(error) }
//
//                 user.password = hash
//                 next()
//             })
//         })
//     } else {
//         next()
//     }
// })

// userSchema.methods.comparePassword = function(candidatePassword, callback) {
//     bcrypt.compare(candidatePassword, this.password, function(error, isMatch) {
//         if(error) { return callback(error) }
//         callback(null, isMatch)
//     })
// }

module.exports = mongoose.model('User', userSchema)
