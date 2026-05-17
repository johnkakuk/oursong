const express = require('express');
const router = express.Router();
const passport = require('passport');
const passportService = require('../services/passport')

// const requireLogin = passport.authenticate('local', { session: false })

const authentication_controller = require('../controllers/authentication_controller')

// Deprecated email signin stuff
// router.post('/signup', authentication_controller.signup)
// router.post('/signin', requireLogin, authentication_controller.signin)

// Spotify OAuth — redirect user to Spotify's auth page
router.get('/spotify', passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'streaming', 'user-read-recently-played'],
    session: false
}))

// Spotify OAuth — Spotify redirects here after user approves
router.get(
    '/spotify/callback',
    passport.authenticate('spotify', { session: false, failureRedirect: '/' }),
    authentication_controller.spotifyCallback
)

// Returns current user's profile (used by frontend on load)
router.get('/me', passport.authenticate('jwt', { session: false }), authentication_controller.getMe)

module.exports = router;
