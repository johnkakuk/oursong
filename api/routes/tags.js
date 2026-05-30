const express = require('express')
const router = express.Router()
const passport = require('passport')
const tagCtlr = require('../controllers/tagController')
const { uploadProfilePicture } = require('../middlewares')

const protectedRoute = passport.authenticate('jwt', { session: false })

router.get('/',       protectedRoute, tagCtlr.read)
router.get('/:id',    protectedRoute, tagCtlr.readOne)
router.post('/',      protectedRoute, uploadProfilePicture, tagCtlr.create)
router.put('/:id',    protectedRoute, uploadProfilePicture, tagCtlr.update)
router.delete('/:id', protectedRoute, tagCtlr.remove)

module.exports = router
