const path = require('path')
const fs = require('fs/promises')

const uploadMedia = async (req, res, next) => {
    try {
        if (!req.files) return next()

        const file = req.files.image || req.files.video
        if (!file) return next()

        // AI generated
        const isVideo = !!req.files.video
        const subdir  = isVideo ? 'videos' : 'images'
        const prefix  = isVideo ? 'video'  : 'image'

        const extension = path.extname(file.name)
        const fileName  = `${prefix}-${Date.now()}${extension}`
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', subdir)
        const uploadPath = path.join(uploadDir, fileName)

        await fs.mkdir(uploadDir, { recursive: true })
        await file.mv(uploadPath)

        req.uploadedMediaPath = `/uploads/${subdir}/${fileName}`
        return next()
    } catch (error) {
        return next(error)
    }
}

// All local song functionality AI assisted. Not part of the class specs tho
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac']

const uploadLocalSong = async (req, res, next) => {
    try {
        if (!req.files || !req.files.audio) {
            return res.status(400).json({ error: 'Audio file is required' })
        }

        const audioFile = req.files.audio
        const audioExt  = path.extname(audioFile.name).toLowerCase()

        if (!AUDIO_EXTENSIONS.includes(audioExt)) {
            return res.status(400).json({ error: `Unsupported format. Accepted: ${AUDIO_EXTENSIONS.join(', ')}` })
        }

        const audioName = `audio-${Date.now()}${audioExt}`
        const audioDir  = path.join(__dirname, '..', 'public', 'uploads', 'audio')
        await fs.mkdir(audioDir, { recursive: true })
        await audioFile.mv(path.join(audioDir, audioName))
        req.uploadedTrackPath = `/uploads/audio/${audioName}`

        // Optional album art
        if (req.files.albumArt) {
            const artFile = req.files.albumArt
            const artExt  = path.extname(artFile.name)
            const artName = `art-${Date.now()}${artExt}`
            const artDir  = path.join(__dirname, '..', 'public', 'uploads', 'images')
            await fs.mkdir(artDir, { recursive: true })
            await artFile.mv(path.join(artDir, artName))
            req.uploadedAlbumArtPath = `/uploads/images/${artName}`
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

module.exports = { uploadMedia, uploadLocalSong }
