const express = require('express')
const router = express.Router()
const passport = require('passport')
const spotifyCtlr = require('../controllers/spotifyController')

const protectedRoute = passport.authenticate('jwt', { session: false })

router.get('/search', protectedRoute, spotifyCtlr.search)
router.get('/recent', protectedRoute, spotifyCtlr.recentlyPlayed)

module.exports = router
