import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import SectionHeader from '../components/SectionHeader'
import { NewSongCard } from '../components/SongCard'
import SongsService from '../services/songs.service'

function Songs() {
    const [songs, setSongs]   = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]   = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        SongsService.getAll()
            .then(res => setSongs(res.data))
            .catch(err => setError(err.message || 'Failed to load songs'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <StatusMsg>Loading…</StatusMsg>
    if (error)   return <StatusMsg $error>{error}</StatusMsg>

    return (
        <Page>
            <Section>
                <PageTitle>All Songs</PageTitle>
                <SectionHeader title={`${songs.length} ${songs.length === 1 ? 'song' : 'songs'}`} />
                {songs.length === 0
                    ? <StatusMsg>No songs saved yet — search for one to get started.</StatusMsg>
                    : (
                        <Grid>
                            {songs.map(song => (
                                <SongCard key={song._id} onClick={() => navigate(`/songs/${song._id}`)}>
                                    <AlbumArt src={song.albumArtUrl} alt={song.albumName} />
                                    <CardBody>
                                        <SongTitle>{song.title}</SongTitle>
                                        <SongArtist>{song.artists?.join(', ')}</SongArtist>
                                        <MemoryCount>
                                            {song.memoryCount} {song.memoryCount === 1 ? 'memory' : 'memories'}
                                        </MemoryCount>
                                    </CardBody>
                                </SongCard>
                            ))}
                            <NewSongCard onClick={() => navigate('/search')} />
                        </Grid>
                    )
                }
            </Section>
        </Page>
    )
}

export default Songs

const Page = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const Section = styled.div`
    padding: 2rem;
`

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
`

const SongCard = styled.article`
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-border-tertiary);
    background: var(--color-background-secondary);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;

    &:hover {
        border-color: var(--color-border-secondary);
        transform: translateY(-2px);
    }
`

const AlbumArt = styled.img`
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
`

const CardBody = styled.div`
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
`

const SongTitle = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const SongArtist = styled.span`
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const MemoryCount = styled.span`
    font-size: 11px;
    color: var(--color-text-tertiary);
    margin-top: 4px;
`

const PageTitle = styled.h1`
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    margin: 0 0 1.5rem;
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: ${props => props.$error ? '#e06c75' : 'var(--color-text-tertiary)'};
`
