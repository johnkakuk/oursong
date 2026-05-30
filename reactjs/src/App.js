import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'

import Nav from './components/Nav'
import PlayerBar from './components/PlayerBar'
import { PlayerProvider } from './contexts/PlayerContext'
import Home from './pages/Home'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Search from './pages/Search'
import Songs from './pages/Songs'
import SongSingle from './pages/SongSingle'
import AddEditMemory from './pages/AddEditMemory'
import Memories from './pages/Memories'
import Tags from './pages/Tags'
import TagSingle from './pages/TagSingle'
import AddEditTag from './pages/AddEditTag'
import SharedSong from './pages/SharedSong'

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

                {/* Public shared song — no auth required */}
                <Route path="/share/:token" element={<SharedSong />} />

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
        <PlayerProvider isPremium={user.isPremiumUser}>
        <Layout>
            <Nav user={user} onLogout={onLogout} />
            <MainContent $withPlayer={user.isPremiumUser}>
            <Routes>
                <Route path="/"         element={<Home user={user} />} />
                <Route path="/search"      element={<Search user={user} />} />
                <Route path="/songs/:id/memories/new"              element={<AddEditMemory />} />
                <Route path="/songs/:id/memories/:memoryId/edit" element={<AddEditMemory />} />
                <Route path="/songs/:id"                         element={<SongSingle />} />
                <Route path="/songs"       element={<Songs />} />
                <Route path="/memories"          element={<Memories />} />
                <Route path="/tags/new"         element={<AddEditTag />} />
                <Route path="/tags/:id/edit"    element={<AddEditTag />} />
                <Route path="/tags/:id"         element={<TagSingle />} />
                <Route path="/tags"             element={<Tags />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
            </MainContent>
        </Layout>
        {user.isPremiumUser && <PlayerBar />}
        </PlayerProvider>
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

const MainContent = styled.div`
    flex: 1;
    min-width: 0;
    padding-bottom: ${p => p.$withPlayer ? '88px' : '0'};
`

const LoadingWrap = styled.div`
    min-height: 100vh;
    background: var(--color-background-primary);
`
