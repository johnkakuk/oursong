import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import styled from 'styled-components'

import MemoryCard, { NewMemoryCard } from '../components/MemoryCard'
import PlayButton from '../components/PlayButton'
import SectionHeader from '../components/SectionHeader'
import SongsService from '../services/songs.service'
import { ReactComponent as TrashIcon } from '../images/np_trash_1523231_000000.svg'

const MASONRY_BREAKPOINTS = { default: 3, 900: 2, 640: 1 }

function SongSingle() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [song, setSong] = useState(null)
    const [memories, setMemories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isPublished, setIsPublished] = useState(false)
    const [shareToken, setShareToken] = useState(null)
    const [copied, setCopied] = useState(false)
    const copyTimerRef = useRef(null)

    useEffect(() => {
        const fetchSong = async () => {
            try {
                const response = await SongsService.getOne(id)
                const { memories: songMemories, ...songData } = response.data
                setSong(songData)
                setMemories(songMemories || [])
                setIsPublished(songData.isPublished || false)
                setShareToken(songData.shareToken || null)
            } catch (err) {
                setError(err.message || 'Failed to load song')
            } finally {
                setLoading(false)
            }
        }
        fetchSong()
    }, [id])

    const handlePublish = async () => {
        try {
            const { data } = await SongsService.publish(id)
            setIsPublished(data.isPublished)
            setShareToken(data.shareToken)
        } catch {
            setError('Failed to update sharing')
        }
    }

    const handleCopy = () => {
        const url = `${window.location.origin}/share/${shareToken}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        clearTimeout(copyTimerRef.current)
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${song.title}"? This will also delete all its memories.`)) return
        try {
            await SongsService.remove(id)
            navigate('/songs', { replace: true })
        } catch {
            setError('Failed to delete song')
        }
    }

    if (loading) return <StatusMsg>Loading…</StatusMsg>
    if (error)   return <StatusMsg $error>{error}</StatusMsg>
    if (!song)   return null

    const memoryCount = memories.length

    return (
        <Page>
            <SongHero>
                <AlbumArt src={song.albumArtUrl} alt={`${song.albumName} album art`} />
                <SongInfo>
                    <SongTitle>{song.title}</SongTitle>
                    <SongArtists>{song.artists?.join(', ')}</SongArtists>
                    <SongAlbum>{song.albumName}</SongAlbum>
                    {song.duration && (
                        <SongDuration>{formatDuration(song.duration)}</SongDuration>
                    )}
                </SongInfo>
                <PlayButton song={song} size="lg" />
                <HeroActions>
                    <PublishBtn type="button" $active={isPublished} onClick={handlePublish}>
                        {isPublished ? 'Shared' : 'Share'}
                    </PublishBtn>
                    <TrashBtn type="button" onClick={handleDelete} title="Delete song">
                        <Trash />
                    </TrashBtn>
                </HeroActions>
            </SongHero>
            {isPublished && shareToken && (
                <ShareBar>
                    <ShareUrl>{`${window.location.origin}/share/${shareToken}`}</ShareUrl>
                    <CopyBtn type="button" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy link'}</CopyBtn>
                </ShareBar>
            )}

            <Divider />

            <Section>
                <SectionHeader
                    title={`${memoryCount} ${memoryCount === 1 ? 'memory' : 'memories'}`}
                />
                <Masonry
                    breakpointCols={MASONRY_BREAKPOINTS}
                    className="masonry-grid"
                    columnClassName="masonry-grid-col"
                >
                    {memories.map(memory => (
                        <MemoryCard
                            key={memory._id}
                            memory={memory}
                            hideSong
                            onEdit={memory => navigate(`/songs/${id}/memories/${memory._id}/edit`, { state: { memory, song, returnTo: location.pathname } })}
                        />
                    ))}
                    <NewMemoryCard onClick={() => navigate(`/songs/${id}/memories/new`, { state: { song, returnTo: location.pathname } })} />
                </Masonry>
            </Section>
        </Page>
    )
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default SongSingle

const Page = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const SongHero = styled.div`
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 3rem 2rem 2.5rem;

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
    padding-top: 4px;
`

const SongTitle = styled.h1`
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin: 0;
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

const SongDuration = styled.p`
    font-size: 12px;
    color: var(--color-text-tertiary);
    margin: 6px 0 0;
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

const HeroActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
`

const PublishBtn = styled.button`
    height: 34px;
    padding: 0 14px;
    border-radius: var(--border-radius-md);
    border: 1px solid ${p => p.$active ? 'var(--accent)' : 'var(--color-border-secondary)'};
    background: ${p => p.$active ? 'rgba(59,219,134,0.1)' : 'transparent'};
    color: ${p => p.$active ? 'var(--accent)' : 'var(--color-text-secondary)'};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;

    &:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: rgba(59,219,134,0.08);
    }
`

const ShareBar = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 2rem 1.5rem;
    padding: 10px 14px;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border-secondary);
    background: var(--color-background-secondary);
`

const ShareUrl = styled.span`
    flex: 1;
    font-size: 12px;
    color: var(--color-text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const CopyBtn = styled.button`
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    &:hover { opacity: 0.8; }
`

const TrashBtn = styled.button`
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border-secondary);
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: #e06c75;
        color: #e06c75;
    }
`

const Trash = styled(TrashIcon)`
    width: 15px;
    height: 15px;
    fill: currentColor;
    display: block;
    flex-shrink: 0;
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: ${props => props.$error ? '#e06c75' : 'var(--color-text-tertiary)'};
`
