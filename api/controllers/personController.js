const { Person, Memory } = require('../models')

const create = async (req, res) => {
    try {
        const person = await Person.create(req.body)
        res.status(201).json(person)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const read = async (req, res) => {
    try {
        const people = await Person.find()
        res.status(200).json(people)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Returns person with all their memories across all songs
const readOne = async (req, res) => {
    try {
        const person = await Person.findById(req.params.id)
        if (!person) return res.status(404).json({ error: 'Person not found' })

        const memories = await Memory.find({ people: req.params.id }).populate('songId')
        res.status(200).json({ ...person.toObject(), memories })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const update = async (req, res) => {
    try {
        const person = await Person.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!person) return res.status(404).json({ error: 'Person not found' })
        res.status(200).json(person)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Untags this person from all memories without deleting the memories
const remove = async (req, res) => {
    try {
        const person = await Person.findByIdAndDelete(req.params.id)
        if (!person) return res.status(404).json({ error: 'Person not found' })

        await Memory.updateMany({ people: req.params.id }, { $pull: { people: req.params.id } })
        res.status(200).json({ message: 'Person deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { create, read, readOne, update, remove }
