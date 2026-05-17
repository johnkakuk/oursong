import api from './api'

const getAll = (songId) => {
    const params = songId ? { songId } : {}
    return api.get('/memories', { params })
}

const getOne = (id) => api.get(`/memories/${id}`)

const create = (payload) => {
    const isFormData = payload instanceof FormData
    return api.post('/memories', payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    )
}

const update = (id, payload) => {
    const isFormData = payload instanceof FormData
    return api.put(`/memories/${id}`, payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    )
}

const remove = (id) => api.delete(`/memories/${id}`)

const MemoriesService = { getAll, getOne, create, update, remove }

export default MemoriesService
