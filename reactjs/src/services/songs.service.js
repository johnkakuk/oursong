import api from './api'
import axios from 'axios'

const STATIC_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''

const getAll = () => api.get('/songs')

const getOne = (id) => api.get(`/songs/${id}`)

const create = (songData) => api.post('/songs', songData)

const update = (id, data) => api.put(`/songs/${id}`, data)

const remove = (id) => api.delete(`/songs/${id}`)

const publish = (id) => api.put(`/songs/${id}/publish`)

const getPublic = (token) => axios.get(`${STATIC_BASE}/api/v1/songs/public/${token}`)

const SongsService = { getAll, getOne, create, update, remove, publish, getPublic }

export default SongsService
