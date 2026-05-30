const express = require('express')
const router = express.Router()
const passport = require('passport')
const { uploadMedia } = require('../middlewares')

const protectedRoute = passport.authenticate('jwt', { session: false })

router.post('/image', protectedRoute, uploadMedia, (req, res) => {
    if (!req.uploadedMediaPath) {
        return res.status(400).json({ error: 'No image file provided' })
    }
    res.json({ url: req.uploadedMediaPath })
})

module.exports = router
