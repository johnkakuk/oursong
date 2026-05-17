const User = require('../models/User')
const jwt = require('jwt-simple')
const config = require('../config')

const tokenForUser = user => {
    const timestamp = new Date().getTime()
    return jwt.encode({
        sub: user._id,
        iat: timestamp
    }, config.secret)
}

// Called after successful Spotify OAuth — issues JWT and redirects to React app
exports.spotifyCallback = (req, res) => {
    const token = tokenForUser(req.user)
    res.redirect(`${process.env.SPOTIFY_FRONTEND_REDIRECT}?token=${token}`)
}

// Returns the current authenticated user's profile
exports.getMe = (req, res) => {
    res.json({
        id: req.user._id,
        displayName: req.user.displayName,
        spotifyId: req.user.spotifyId,
    })
}

// Deprecated email-based signin/signup stuff
// exports.signin = async (req, res, next) => {
//     const user = req.user
//     res.send({ token: tokenForUser(user), user_id: user._id })
// }

// exports.signup = async (req, res, next) => {
//     const { email, password } = req.body
//
//     if(!email || !password) {
//         return res.status(422).json({ error: "Please provide your email and password" })
//     }
//
//     try {
//         const userExists = await User.findOne({ email: email })
//
//         if(userExists) {
//             return res.status(422).json({ error: "Email already in use" })
//         }
//
//         const user = new User({
//             email: email,
//             password: password
//         })
//
//         await user.save()
//
//         res.status(201).json({ user_id: user._id, token: tokenForUser(user) })
//     } catch(error) {
//         return next(error)
//     }
// }
