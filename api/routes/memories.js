const express = require('express')
const router = express.Router()
const passport = require('passport')
const memoryCtlr = require('../controllers/memoryController')
const { uploadMedia } = require('../middlewares')

const protectedRoute = passport.authenticate('jwt', { session: false })

// Public routes — shared board access (no auth required)
// router.get('/shared/:shareToken', memoryCtlr.readShared)

// Protected routes
router.get('/',       protectedRoute, memoryCtlr.read)
router.get('/:id',    protectedRoute, memoryCtlr.readOne)
router.post('/',      protectedRoute, uploadMedia, memoryCtlr.create)
router.put('/:id',    protectedRoute, memoryCtlr.update)
router.delete('/:id', protectedRoute, memoryCtlr.remove)

module.exports = router
