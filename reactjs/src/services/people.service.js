import api from './api'

const getAll = () => api.get('/people')

const getOne = (id) => api.get(`/people/${id}`)

const create = (payload) => {
    const isFormData = payload instanceof FormData
    return api.post('/people', payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    )
}

const update = (id, payload) => {
    const isFormData = payload instanceof FormData
    return api.put(`/people/${id}`, payload, isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {}
    )
}

const remove = (id) => api.delete(`/people/${id}`)

const PeopleService = { getAll, getOne, create, update, remove }

export default PeopleService
