import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import styled from 'styled-components'

import SongCard, { NewSongCard } from '../components/SongCard'
import MemoryCard from '../components/MemoryCard'
import TagCard from '../components/TagCard'
import TrackRow from '../components/TrackRow'
import Hero from '../components/Hero'
import SectionHeader from '../components/SectionHeader'

import SongsService from '../services/songs.service'
import MemoriesService from '../services/memories.service'
import TagsService from '../services/tags.service'
import SpotifyService from '../services/spotify.service'

const MASONRY_BREAKPOINTS = { default: 3, 900: 2, 640: 1 }

function Home({ user }) {
    const navigate = useNavigate()

    const [songs, setSongs] = useState([])
    const [memories, setMemories] = useState([])
    const [people, setPeople] = useState([])
    const [recentTracks, setRecentTracks] = useState([])
    const [savingTrackId, setSavingTrackId] = useState(null)

    const [loading, setLoading] = useState({ songs: true, memories: true, people: true, tracks: true })
    const [error, setError] = useState({})

    // Derive memory counts per song from the flat memories list
    const memoriesBySong = memories.reduce((acc, m) => {
        const id = m.songId?._id || m.songId
        if (id) acc[id] = (acc[id] || 0) + 1
        return acc
    }, {})

    // Derive saved Spotify track IDs for the "Saved" badge
    const savedTrackIds = new Set(songs.map(s => s.spotifyTrackId))

    const fetchSongs = useCallback(async () => {
        try {
            const response = await SongsService.getAll()
            setSongs(response.data)
        } catch (err) {
            setError(e => ({ ...e, songs: err.message }))
        } finally {
            setLoading(l => ({ ...l, songs: false }))
        }
    }, [])

    const fetchMemories = useCallback(async () => {
        try {
            const response = await MemoriesService.getAll()
            setMemories(response.data)
        } catch (err) {
            setError(e => ({ ...e, memories: err.message }))
        } finally {
            setLoading(l => ({ ...l, memories: false }))
        }
    }, [])

    const fetchPeople = useCallback(async () => {
        try {
            const response = await TagsService.getAll()
            setPeople(response.data)
        } catch (err) {
            setError(e => ({ ...e, people: err.message }))
        } finally {
            setLoading(l => ({ ...l, people: false }))
        }
    }, [])

    const fetchRecentTracks = useCallback(async () => {
        try {
            const response = await SpotifyService.getRecentlyPlayed(20)
            // Deduplicate by track ID (Spotify can return the same track multiple times)
            const seen = new Set()
            const unique = response.data.filter(item => {
                if (seen.has(item.track.id)) return false
                seen.add(item.track.id)
                return true
            })
            setRecentTracks(unique.slice(0, 10))
        } catch (err) {
            setError(e => ({ ...e, tracks: err.message }))
        } finally {
            setLoading(l => ({ ...l, tracks: false }))
        }
    }, [])

    useEffect(() => {
        fetchSongs()
        fetchMemories()
        fetchPeople()
        fetchRecentTracks()
    }, [fetchSongs, fetchMemories, fetchPeople, fetchRecentTracks])

    const handleSaveTrack = async (track) => {
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
    }

    // Sort songs newest first, show up to 6
    const recentSongs = [...songs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)

    // Sort memories newest first, show up to 12
    const recentMemories = [...memories]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 12)

    // Sort people by memory count desc
    const sortedPeople = [...people]
        .map(p => ({
            ...p,
            memCount: memories.filter(m =>
                m.people?.some(person => (person._id || person) === p._id)
            ).length
        }))
        .sort((a, b) => b.memCount - a.memCount)

    return (
        <PageContent>
            <Hero user={user} />

            <Divider />

            {/* Recently saved songs */}
            <Section>
                <SectionHeader
                    title="Recently saved songs"
                    linkLabel="View all"
                    onLinkClick={() => navigate('/songs')}
                />
                {loading.songs && songs.length === 0 ? (
                    <StatusText>Loading songs…</StatusText>
                ) : error.songs ? (
                    <ErrorText>{error.songs}</ErrorText>
                ) : (
                    <SongsGrid>
                        {recentSongs.map(song => (
                            <SongCard
                                key={song._id}
                                song={song}
                                memoryCount={memoriesBySong[song._id] || 0}
                            />
                        ))}
                        <NewSongCard onClick={() => navigate('/search')} />
                    </SongsGrid>
                )}
            </Section>

            <Divider />

            {/* Recent memories */}
            <Section>
                <SectionHeader
                    title="Recent memories"
                    linkLabel="View all"
                    onLinkClick={() => navigate('/memories')}
                />
                {loading.memories && memories.length === 0 ? (
                    <StatusText>Loading memories…</StatusText>
                ) : error.memories ? (
                    <ErrorText>{error.memories}</ErrorText>
                ) : recentMemories.length === 0 ? (
                    <StatusText>No memories yet. Open a song to add your first one.</StatusText>
                ) : (
                    <Masonry
                        breakpointCols={MASONRY_BREAKPOINTS}
                        className="masonry-grid"
                        columnClassName="masonry-grid-col"
                    >
                        {recentMemories.map(memory => (
                            <MemoryCard key={memory._id} memory={memory} />
                        ))}
                    </Masonry>
                )}
            </Section>

            <Divider />

            {/* Your tags */}
            <Section>
                <SectionHeader
                    title="Your tags"
                    linkLabel="View all"
                    onLinkClick={() => navigate('/tags')}
                />
                {loading.people && people.length === 0 ? (
                    <StatusText>Loading…</StatusText>
                ) : error.people ? (
                    <ErrorText>{error.people}</ErrorText>
                ) : sortedPeople.length === 0 ? (
                    <StatusText>No tags yet. Tag someone in a memory to add them.</StatusText>
                ) : (
                    <PeopleGrid>
                        {sortedPeople.map(person => (
                            <TagCard
                                key={person._id}
                                person={person}
                                memoryCount={person.memCount}
                            />
                        ))}
                    </PeopleGrid>
                )}
            </Section>

            <Divider />

            {/* Recently played on Spotify */}
            <Section>
                <SectionHeader title="Recently played on Spotify" />
                {loading.tracks && recentTracks.length === 0 ? (
                    <StatusText>Loading…</StatusText>
                ) : error.tracks ? (
                    <ErrorText>
                        Couldn't load recently played. Re-connect Spotify to grant the required permission.
                    </ErrorText>
                ) : recentTracks.length === 0 ? (
                    <StatusText>No recent plays found.</StatusText>
                ) : (
                    <TracksList>
                        {recentTracks.map((item, i) => (
                            <TrackRow
                                key={`${item.track.id}-${i}`}
                                track={item.track}
                                index={i}
                                isSaved={savedTrackIds.has(item.track.id)}
                                onSave={() => handleSaveTrack(item.track)}
                                saving={savingTrackId === item.track.id}
                            />
                        ))}
                    </TracksList>
                )}
            </Section>

            {/* Scroll-end quote */}
            <ScrollEnd>
                <ScrollQuote>
                    "Music was my refuge. I could crawl into the space between the notes and curl my back to loneliness."
                </ScrollQuote>
                <ScrollAttribution>—Maya Angelou</ScrollAttribution>
            </ScrollEnd>
        </PageContent>
    )
}

export default Home

const PageContent = styled.main`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const Section = styled.div`
    padding: 2rem;
`

const Divider = styled.hr`
    height: 1px;
    background: var(--color-border-tertiary);
    border: none;
    margin: 0 2rem;
`

const SongsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
`

const PeopleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
`

const TracksList = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    min-width: 0;

    @media (max-width: 900px) {
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

const ScrollEnd = styled.div`
    padding-top: 5rem;
    padding-bottom: 8rem;
    text-align: center;
    padding-left: 2rem;
    padding-right: 2rem;
`

const ScrollQuote = styled.h2`
    font-size: 28px;
    font-weight: 600;
    font-style: italic;
    line-height: 1.45;
    letter-spacing: -0.2px;
    color: rgba(255, 255, 255, 0.16);
    max-width: 760px;
    margin: 0 auto;
`

const ScrollAttribution = styled.p`
    margin-top: 0.9rem;
    font-size: 12px;
    font-weight: 500;
    font-style: italic;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.16);
`
