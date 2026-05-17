import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

function SongCard({ song, memoryCount = 0 }) {
    const navigate = useNavigate()

    return (
        <Card onClick={() => navigate(`/songs/${song._id}`)}>
            <AlbumArt src={song.albumArtUrl} alt={`${song.albumName} album art`} />
            <CardBody>
                <Title>{song.title}</Title>
                <Artist>{song.artists?.join(', ')}</Artist>
                <CardMeta>
                    <MemoryCount>
                        {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
                    </MemoryCount>
                    <Dot />
                </CardMeta>
            </CardBody>
        </Card>
    )
}

function NewSongCard({ onClick }) {
    return (
        <NewCard onClick={onClick}>
            <NewIcon>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </NewIcon>
            <span>New song</span>
        </NewCard>
    )
}

export { NewSongCard }
export default SongCard

const Card = styled.article`
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-border-tertiary);
    overflow: hidden;
    background: var(--color-background-secondary);
    cursor: pointer;
    transition: border-color 0.15s, transform 0.15s;

    &:hover {
        border-color: var(--color-border-secondary);
        transform: translateY(-2px);
    }
`

const AlbumArt = styled.img`
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
`

const CardBody = styled.div`
    padding: 12px;
`

const Title = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const Artist = styled.div`
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const CardMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
`

const MemoryCount = styled.span`
    font-size: 11px;
    color: var(--color-text-tertiary);
`

const Dot = styled.div`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent-muted);
`

const NewCard = styled.article`
    border-radius: var(--border-radius-lg);
    border: 1px dashed var(--color-border-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    gap: 8px;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    color: var(--color-text-tertiary);
    transition: border-color 0.15s;

    &:hover {
        border-color: var(--accent-muted);
    }
`

const NewIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px dashed var(--color-border-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
`
