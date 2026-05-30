const User = require('../models/User')
const jwt = require('jwt-simple')
const config = require('../config')
const { getValidToken } = require('../services/spotify')

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
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
}

// Returns the current authenticated user's profile
exports.getMe = (req, res) => {
    res.json({
        id:            req.user._id,
        displayName:   req.user.displayName,
        spotifyId:     req.user.spotifyId,
        isPremiumUser: req.user.isPremiumUser,
    })
}

// Returns a fresh Spotify access token for the Web Playback SDK
exports.getSpotifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const token = await getValidToken(user)
        res.json({ accessToken: token })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
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
