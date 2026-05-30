const { Tag, Memory } = require('../models')

const create = async (req, res) => {
    try {
        const payload = { ...req.body, userId: req.user._id }
        if (req.uploadedProfilePicturePath) payload.profilePictureUrl = req.uploadedProfilePicturePath

        const tag = await Tag.create(payload)
        res.status(201).json(tag)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const read = async (req, res) => {
    try {
        const userId = req.user._id
        const [tags, counts] = await Promise.all([
            Tag.find({ userId }).sort({ name: 1 }),
            Memory.aggregate([
                { $match: { userId } },
                { $unwind: '$people' },
                { $group: { _id: '$people', count: { $sum: 1 } } }
            ])
        ])
        const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))
        const result = tags.map(t => ({
            ...t.toObject(),
            memoryCount: countMap[t._id.toString()] || 0
        }))
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Returns tag with all memories it appears in across all songs
const readOne = async (req, res) => {
    try {
        const userId = req.user._id
        const tag = await Tag.findOne({ _id: req.params.id, userId })
        if (!tag) return res.status(404).json({ error: 'Tag not found' })

        const memories = await Memory.find({ people: req.params.id, userId }).populate('songId').populate('people')
        res.status(200).json({ ...tag.toObject(), memories })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const payload = { ...req.body }
        if (req.uploadedProfilePicturePath) payload.profilePictureUrl = req.uploadedProfilePicturePath

        const tag = await Tag.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            payload,
            { new: true, runValidators: true }
        )
        if (!tag) return res.status(404).json({ error: 'Tag not found' })
        res.status(200).json(tag)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Removes this tag from all memories without deleting the memories
const remove = async (req, res) => {
    try {
        const userId = req.user._id
        const tag = await Tag.findOneAndDelete({ _id: req.params.id, userId })
        if (!tag) return res.status(404).json({ error: 'Tag not found' })

        await Memory.updateMany({ people: req.params.id, userId }, { $pull: { people: req.params.id } })
        res.status(200).json({ message: 'Tag deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { create, read, readOne, update, remove }
