import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import Hero from '../components/Hero'
import SearchResult from '../components/SearchResult'
import SectionHeader from '../components/SectionHeader'

import SpotifyService from '../services/spotify.service'
import SongsService from '../services/songs.service'

function Search({ user }) {
    const [searchParams] = useSearchParams()
    const urlQuery = searchParams.get('q') || ''
    const [results, setResults] = useState({ tracks: [], albums: [], artists: [] })
    const [songs, setSongs] = useState([])
    const [savingTrackId, setSavingTrackId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch saved songs once for the "Saved" badge
    useEffect(() => {
        SongsService.getAll().then(r => setSongs(r.data)).catch(() => {})
    }, [])

    // Fetch search results whenever the URL query changes
    useEffect(() => {
        if (!urlQuery) { setResults({ tracks: [], albums: [], artists: [] }); return }
        setLoading(true)
        setError(null)
        SpotifyService.search(urlQuery)
            .then(r => setResults(r.data))
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false))
    }, [urlQuery])

    const handleSaveTrack = useCallback(async (track) => {
        setSavingTrackId(track.id)
        try {
            const songData = {
                spotifyTrackId: track.id,
                spotifyUri:     track.uri,
                title:          track.name,
                artists:        track.artists.map(a => a.name),
                albumName:      track.album.name,
                albumArtUrl:    track.album.images?.[0]?.url || '',
                previewUrl:     track.preview_url || null,
                duration:       track.duration_ms,
            }
            const response = await SongsService.create(songData)
            setSongs(current => {
                const exists = current.find(s => s.spotifyTrackId === track.id)
                return exists ? current : [response.data, ...current]
            })
        } catch (err) {
            console.error('Failed to save song:', err)
        } finally {
            setSavingTrackId(null)
        }
    }, [])

    const savedTrackIds = new Set(songs.map(s => s.spotifyTrackId))
    const hasResults = results.tracks.length > 0 || results.albums.length > 0 || results.artists.length > 0

    return (
        <Page>
            <Hero user={user} />
            <Divider />
            <ResultsArea>
            {loading && <StatusText>Searching…</StatusText>}
            {error && <ErrorText>{error}</ErrorText>}

            {!urlQuery && !loading && (
                <StatusText>Type something to search Spotify.</StatusText>
            )}

            {urlQuery && !loading && !error && !hasResults && (
                <StatusText>No results for "{urlQuery}".</StatusText>
            )}

            {!loading && hasResults && (
                <Results>
                    {results.tracks.length > 0 && (
                        <Section>
                            <SectionHeader title="Songs" />
                            <Grid>
                                {results.tracks.map(track => (
                                    <SearchResult
                                        key={track.id}
                                        type="track"
                                        result={track}
                                        isSaved={savedTrackIds.has(track.id)}
                                        onSave={() => handleSaveTrack(track)}
                                        saving={savingTrackId === track.id}
                                    />
                                ))}
                            </Grid>
                        </Section>
                    )}

                    {results.albums.length > 0 && (
                        <Section>
                            <SectionHeader title="Albums" />
                            <Grid>
                                {results.albums.map(album => (
                                    <SearchResult key={album.id} type="album" result={album} />
                                ))}
                            </Grid>
                        </Section>
                    )}

                    {results.artists.length > 0 && (
                        <Section>
                            <SectionHeader title="Artists" />
                            <Grid>
                                {results.artists.map(artist => (
                                    <SearchResult key={artist.id} type="artist" result={artist} />
                                ))}
                            </Grid>
                        </Section>
                    )}
                </Results>
            )}
            </ResultsArea>
        </Page>
    )
}

export default Search

const Page = styled.main`
    flex: 1;
    min-width: 0;
`

const Divider = styled.hr`
    height: 1px;
    background: var(--color-border-tertiary);
    border: none;
    margin: 0 2rem;
`

const ResultsArea = styled.div`
    padding: 2rem;
`

const Results = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`

const Section = styled.div``

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`

const StatusText = styled.p`
    font-size: 14px;
    color: var(--color-text-tertiary);
`

const ErrorText = styled.p`
    font-size: 14px;
    color: #e06c75;
`
