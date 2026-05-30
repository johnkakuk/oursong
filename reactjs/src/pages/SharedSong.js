import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import styled, { createGlobalStyle } from 'styled-components'

import MemoryCard from '../components/MemoryCard'
import SongsService from '../services/songs.service'

const MASONRY_BREAKPOINTS = { default: 3, 900: 2, 640: 1 }

function SharedSong() {
    const { token } = useParams()
    const [song, setSong] = useState(null)
    const [memories, setMemories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        SongsService.getPublic(token)
            .then(({ data }) => {
                const { memories: mems, ...songData } = data
                setSong(songData)
                setMemories(mems || [])
            })
            .catch(() => setError('This page is not available.'))
            .finally(() => setLoading(false))
    }, [token])

    const spotifyWebUrl = song?.spotifyUri
        ? `https://open.spotify.com/track/${song.spotifyUri.split(':')[2]}`
        : null

    if (loading) return <FullPage><StatusMsg>Loading…</StatusMsg></FullPage>
    if (error)   return <FullPage><StatusMsg $error>{error}</StatusMsg></FullPage>
    if (!song)   return null

    return (
        <FullPage>
            <SharedGlobalStyle />
            <TopBar>
                <AppName>OurSong</AppName>
            </TopBar>

            <Hero>
                <AlbumArt src={song.albumArtUrl} alt={song.albumName} />
                <SongInfo>
                    <SongTitle>{song.title}</SongTitle>
                    <SongArtists>{song.artists?.join(', ')}</SongArtists>
                    <SongAlbum>{song.albumName}</SongAlbum>
                    {spotifyWebUrl && (
                        <SpotifyLink href={spotifyWebUrl} target="_blank" rel="noopener noreferrer">
                            <SpotifyIcon viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.495 17.316a.75.75 0 0 1-1.032.25c-2.822-1.727-6.376-2.117-10.563-1.16a.75.75 0 1 1-.334-1.463c4.579-1.046 8.507-.596 11.68 1.341a.75.75 0 0 1 .249 1.032zm1.466-3.26a.937.937 0 0 1-1.288.308c-3.228-1.983-8.148-2.558-11.967-1.4a.938.938 0 0 1-.52-1.8c4.363-1.327 9.786-.684 13.466 1.605a.937.937 0 0 1 .309 1.287zm.126-3.395c-3.868-2.298-10.248-2.51-13.942-1.389a1.124 1.124 0 1 1-.653-2.154c4.244-1.29 11.298-1.04 15.753 1.608a1.125 1.125 0 0 1-1.158 1.935z" />
                            </SpotifyIcon>
                            Open in Spotify
                        </SpotifyLink>
                    )}
                </SongInfo>
            </Hero>

            <Divider />

            <Section>
                <MemoryCount>
                    {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
                </MemoryCount>
                <Masonry
                    breakpointCols={MASONRY_BREAKPOINTS}
                    className="masonry-grid"
                    columnClassName="masonry-grid-col"
                >
                    {memories.map(memory => (
                        <MemoryCard key={memory._id} memory={memory} hideSong />
                    ))}
                </Masonry>
            </Section>
        </FullPage>
    )
}

export default SharedSong

const SharedGlobalStyle = createGlobalStyle`
    body { background: var(--color-background-primary); }
`

const FullPage = styled.div`
    min-height: 100vh;
    background: var(--color-background-primary);
`

const TopBar = styled.header`
    display: flex;
    align-items: center;
    padding: 16px 2rem;
    border-bottom: 1px solid var(--color-border-tertiary);
`

const AppName = styled.span`
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
`

const Hero = styled.div`
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 3rem 2rem 2.5rem;
    max-width: 900px;

    @media (max-width: 640px) {
        flex-direction: column;
        gap: 1.25rem;
        padding: 2rem 1.5rem;
    }
`

const AlbumArt = styled.img`
    width: 160px;
    height: 160px;
    border-radius: var(--border-radius-lg);
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--color-border-tertiary);

    @media (max-width: 640px) {
        width: 120px;
        height: 120px;
    }
`

const SongInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const SongTitle = styled.h1`
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin: 0 0 2px;
`

const SongArtists = styled.p`
    font-size: 16px;
    color: var(--color-text-secondary);
    margin: 0;
`

const SongAlbum = styled.p`
    font-size: 13px;
    color: var(--color-text-tertiary);
    margin: 0;
`

const SpotifyLink = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-top: 14px;
    padding: 8px 16px;
    border-radius: 20px;
    background: #1DB954;
    color: #000;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    width: fit-content;
    transition: opacity 0.15s;

    &:hover { opacity: 0.88; }
`

const SpotifyIcon = styled.svg`
    width: 16px;
    height: 16px;
    flex-shrink: 0;
`

const Divider = styled.hr`
    height: 1px;
    background: var(--color-border-tertiary);
    border: none;
    margin: 0 2rem;
`

const Section = styled.div`
    padding: 2rem;
`

const MemoryCount = styled.p`
    font-size: 13px;
    color: var(--color-text-tertiary);
    margin: 0 0 1rem;
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: ${p => p.$error ? '#e06c75' : 'var(--color-text-tertiary)'};
`
