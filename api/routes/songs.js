const express = require('express')
const router = express.Router()
const passport = require('passport')
const songCtlr = require('../controllers/songController')

const protectedRoute = passport.authenticate('jwt', { session: false })

// Public routes
router.get('/public/:token', songCtlr.getPublic)

// Protected routes
router.get('/',       protectedRoute, songCtlr.read)
router.get('/:id',    protectedRoute, songCtlr.readOne)
router.post('/',      protectedRoute, songCtlr.create)
router.put('/:id/publish', protectedRoute, songCtlr.publish)
router.put('/:id',    protectedRoute, songCtlr.update)
router.delete('/:id', protectedRoute, songCtlr.remove)

module.exports = router
