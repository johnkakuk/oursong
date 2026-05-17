import api from './api'

const getAll = () => api.get('/songs')

const getOne = (id) => api.get(`/songs/${id}`)

const create = (songData) => api.post('/songs', songData)

const update = (id, data) => api.put(`/songs/${id}`, data)

const remove = (id) => api.delete(`/songs/${id}`)

const SongsService = { getAll, getOne, create, update, remove }

export default SongsService
