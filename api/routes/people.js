const express = require('express')
const router = express.Router()
const passport = require('passport')
const personCtlr = require('../controllers/personController')
const { uploadProfilePicture } = require('../middlewares')

const protectedRoute = passport.authenticate('jwt', { session: false })

router.get('/',       protectedRoute, personCtlr.read)
router.get('/:id',    protectedRoute, personCtlr.readOne)
router.post('/',      protectedRoute, uploadProfilePicture, personCtlr.create)
router.put('/:id',    protectedRoute, uploadProfilePicture, personCtlr.update)
router.delete('/:id', protectedRoute, personCtlr.remove)

module.exports = router
