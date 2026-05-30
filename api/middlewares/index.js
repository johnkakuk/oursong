const path = require('path')
const fs = require('fs/promises')
const { Readable } = require('stream')
const cloudinary = require('cloudinary').v2

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

// Upload a file buffer to Cloudinary, returns the secure URL
const cloudinaryUpload = (buffer, options) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
        if (err) return reject(err)
        resolve(result.secure_url)
    })
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(stream)
})

// Save a file to local disk, returns the public path
const localSave = async (file, subdir, prefix) => {
    const extension = path.extname(file.name)
    const fileName  = `${prefix}-${Date.now()}${extension}`
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', subdir)
    await fs.mkdir(uploadDir, { recursive: true })
    await file.mv(path.join(uploadDir, fileName))
    return `/uploads/${subdir}/${fileName}`
}

const uploadMedia = async (req, res, next) => {
    try {
        if (!req.files) return next()

        const file = req.files.image || req.files.video
        if (file) {
            const isVideo = !!req.files.video
            if (isProd) {
                req.uploadedMediaPath = await cloudinaryUpload(file.data, {
                    resource_type: isVideo ? 'video' : 'image',
                    folder: `oursong/${isVideo ? 'videos' : 'images'}`,
                })
            } else {
                req.uploadedMediaPath = await localSave(
                    file,
                    isVideo ? 'videos' : 'images',
                    isVideo ? 'video' : 'image'
                )
            }
        }

        if (req.files.bgImage) {
            if (isProd) {
                req.uploadedBgImagePath = await cloudinaryUpload(req.files.bgImage.data, {
                    resource_type: 'image',
                    folder: 'oursong/images',
                })
            } else {
                req.uploadedBgImagePath = await localSave(req.files.bgImage, 'images', 'bg')
            }
        }

        if (req.files.thumbnail) {
            if (isProd) {
                req.uploadedThumbnailPath = await cloudinaryUpload(req.files.thumbnail.data, {
                    resource_type: 'image',
                    folder: 'oursong/images',
                })
            } else {
                req.uploadedThumbnailPath = await localSave(req.files.thumbnail, 'images', 'thumb')
            }
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

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

        if (isProd) {
            req.uploadedTrackPath = await cloudinaryUpload(audioFile.data, {
                resource_type: 'video', // Cloudinary uses 'video' for audio
                folder: 'oursong/audio',
            })
        } else {
            req.uploadedTrackPath = await localSave(audioFile, 'audio', 'audio')
        }

        if (req.files.albumArt) {
            if (isProd) {
                req.uploadedAlbumArtPath = await cloudinaryUpload(req.files.albumArt.data, {
                    resource_type: 'image',
                    folder: 'oursong/images',
                })
            } else {
                req.uploadedAlbumArtPath = await localSave(req.files.albumArt, 'images', 'art')
            }
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.files || !req.files.profilePicture) return next()

        if (isProd) {
            req.uploadedProfilePicturePath = await cloudinaryUpload(req.files.profilePicture.data, {
                resource_type: 'image',
                folder: 'oursong/images',
            })
        } else {
            req.uploadedProfilePicturePath = await localSave(req.files.profilePicture, 'images', 'pfp')
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

module.exports = { uploadMedia, uploadLocalSong, uploadProfilePicture }
