import api from './api'

const getAll = () => api.get('/tags')

const getOne = (id) => api.get(`/tags/${id}`)

const create = (payload) => {
    const isFormData = payload instanceof FormData
    return api.post('/tags', payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    )
}

const update = (id, payload) => {
    const isFormData = payload instanceof FormData
    return api.put(`/tags/${id}`, payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    )
}

const remove = (id) => api.delete(`/tags/${id}`)

const TagsService = { getAll, getOne, create, update, remove }

export default TagsService
