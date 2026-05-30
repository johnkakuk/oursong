const passport = require('passport')
const ExtractJwt = require('passport-jwt').ExtractJwt
const JwtStrategy = require('passport-jwt').Strategy
// const LocalStrategy = require('passport-local').Strategy
const SpotifyStrategy = require('passport-spotify').Strategy

const User = require('../models/User')
const config = require('../config')

// Deprecated email signin stuff
// const localOptions = {
//     usernameField: 'email'
// }

// const localStrategy = new LocalStrategy(localOptions, async (email, password, done) => {
//     try {
//         const user = await User.findOne({ email: email })
//         if(!user) {
//             return done(null, false)
//         }
//
//         user.comparePassword(password, function(error, isMatch) {
//             if(error) {
//                 return done(error)
//             }
//             if(!isMatch) {
//                 return done(null, false)
//             }
//             return done(null, user)
//         })
//     } catch(error) {
//         return done(error, false)
//     }
// })

const jwtOptions = {
    secretOrKey: config.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.sub)
        if(user) {
            return done(null, user)
        }
        return done(null, false)
    } catch(error) {
        return done(error, false)
    }
})

// https://www.passportjs.org/packages/passport-spotify/
const spotifyStrategy = new SpotifyStrategy({
    clientID:     process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL:  '/api/v1/auth/spotify/callback',
}, async (accessToken, refreshToken, expires_in, profile, done) => {
    try {
        const tokenExpiry = new Date(Date.now() + expires_in * 1000)
        const isPremium = profile._json?.product === 'premium'
        // const spotifyEmail = profile.emails?.[0]?.value || profile._json?.email || null

        // If a user with this Spotify ID exists, refresh their tokens and return
        let user = await User.findOne({ spotifyId: profile.id })
        if (user) {
            user.spotifyAccessToken  = accessToken
            user.spotifyRefreshToken = refreshToken
            user.spotifyTokenExpiry  = tokenExpiry
            user.displayName         = profile.displayName || null
            user.isPremiumUser       = isPremium
            await user.save()
            return done(null, user)
        }

        // Deprecated email stuff. Keeping in case I want to add email support later, i.e. mailing lists etc
        // If a user with this email exists (signed up via email first), link the accounts
        // if (spotifyEmail) {
        //     user = await User.findOne({ email: spotifyEmail })
        //     if (user) {
        //         user.spotifyId           = profile.id
        //         user.spotifyAccessToken  = accessToken
        //         user.spotifyRefreshToken = refreshToken
        //         user.spotifyTokenExpiry  = tokenExpiry
        //         await user.save()
        //         return done(null, user)
        //     }
        // }

        // New user — create from Spotify profile
        user = await User.create({
            spotifyId:           profile.id,
            // email:               spotifyEmail,
            displayName:         profile.displayName || null,
            spotifyAccessToken:  accessToken,
            spotifyRefreshToken: refreshToken,
            spotifyTokenExpiry:  tokenExpiry,
            isPremiumUser:       isPremium,
        })
        return done(null, user)
    } catch (error) {
        return done(error, false)
    }
})

// passport.use(localStrategy)
passport.use(jwtStrategy)
passport.use(spotifyStrategy)
