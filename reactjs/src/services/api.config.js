const API_BASE = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/v1'
    : '/api/v1'

export default API_BASE
