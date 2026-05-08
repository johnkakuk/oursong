const express = require('express')
const router = express.Router()
const passport = require('passport')
const localSongCtlr = require('../controllers/localSongController')
const { uploadLocalSong } = require('../middlewares')

const protectedRoute = passport.authenticate('jwt', { session: false })

router.get('/',      protectedRoute, localSongCtlr.read)
router.get('/:id',   protectedRoute, localSongCtlr.readOne)
router.post('/',     protectedRoute, uploadLocalSong, localSongCtlr.create)
router.put('/:id',   protectedRoute, localSongCtlr.update)
router.delete('/:id', protectedRoute, localSongCtlr.remove)

module.exports = router
