import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import AuthService from '../services/auth.service'

function AuthCallback({ onAuthSuccess }) {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const token = searchParams.get('token')
        alert('AuthCallback reached. Token present: ' + Boolean(token))

        if (!token) {
            navigate('/login', { replace: true })
            return
        }

        AuthService.handleCallback(token)
        alert('Token stored in localStorage.')

        AuthService.getMe()
            .then(user => {
                alert('getMe() succeeded. User: ' + JSON.stringify(user))
                onAuthSuccess(user)
                navigate('/', { replace: true })
            })
            .catch((err) => {
                alert('getMe() failed. Error: ' + (err?.response?.status || err?.message || 'unknown'))
                navigate('/', { replace: true })
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return <StatusMsg>Connecting…</StatusMsg>
}

export default AuthCallback

const StatusMsg = styled.p`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    font-size: 14px;
`
