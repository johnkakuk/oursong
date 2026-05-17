import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'

import Nav from './components/Nav'
import Home from './pages/Home'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Search from './pages/Search'
import Songs from './pages/Songs'
import SongSingle from './pages/SongSingle'
import AddEditMemory from './pages/AddEditMemory'
import Memories from './pages/Memories'
import People from './pages/People'
import PersonSingle from './pages/PersonSingle'
import AddEditPerson from './pages/AddEditPerson'

import AuthService from './services/auth.service'

function App() {
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(AuthService.isAuthenticated())

    // On mount, hydrate user from the API if a token exists
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            setAuthLoading(false)
            return
        }

        AuthService.getMe()
            .then(setUser)
            .catch(() => {
                // Token is stale — clear it and show login
                AuthService.logout()
            })
            .finally(() => setAuthLoading(false))
    }, [])

    const handleAuthSuccess = (userData) => {
        setUser(userData)
    }

    const handleLogout = () => {
        AuthService.logout()
        setUser(null)
    }

    if (authLoading) return <LoadingScreen />

    return (
        <>
            <GlobalStyle />
            <Routes>
                {/* Spotify OAuth callback — no nav wrapper needed */}
                <Route
                    path="/auth/callback"
                    element={<AuthCallback onAuthSuccess={handleAuthSuccess} />}
                />

                {/* Login page — no nav wrapper */}
                <Route
                    path="/login"
                    element={user ? <Navigate to="/" replace /> : <Login />}
                />

                {/* All authenticated routes share the sidebar layout */}
                <Route
                    path="/*"
                    element={
                        user
                            ? <AppLayout user={user} onLogout={handleLogout} />
                            : <Navigate to="/login" replace />
                    }
                />
            </Routes>
        </>
    )
}

function AppLayout({ user, onLogout }) {
    return (
        <Layout>
            <Nav user={user} onLogout={onLogout} />
            <Routes>
                <Route path="/"         element={<Home user={user} />} />
                <Route path="/search"      element={<Search />} />
                <Route path="/songs/:id/memories/new"              element={<AddEditMemory />} />
                <Route path="/songs/:id/memories/:memoryId/edit" element={<AddEditMemory />} />
                <Route path="/songs/:id"                         element={<SongSingle />} />
                <Route path="/songs"       element={<Songs />} />
                <Route path="/memories"          element={<Memories />} />
                <Route path="/people/new"       element={<AddEditPerson />} />
                <Route path="/people/:id/edit"  element={<AddEditPerson />} />
                <Route path="/people/:id"       element={<PersonSingle />} />
                <Route path="/people"           element={<People />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    )
}

function LoadingScreen() {
    return <LoadingWrap />
}

export default App

const GlobalStyle = createGlobalStyle`
    body {
        background: var(--color-background-primary);
        color: var(--color-text-primary);
    }
`

const Layout = styled.div`
    display: flex;
    min-height: 100vh;
    max-width: 1440px;
    margin: 0 auto;
`

const LoadingWrap = styled.div`
    min-height: 100vh;
    background: var(--color-background-primary);
`
