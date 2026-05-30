import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { ReactComponent as NotesIcon } from '../images/np_notes_2825949_000000.svg'
import PlayButton from './PlayButton'

function getYouTubeId(url) {
    try {
        const u = new URL(url)
        if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
        if (u.hostname.includes('youtube.com')) {
            const shortsMatch = /^\/shorts\/([\w-]+)/.exec(u.pathname)
            if (shortsMatch) return shortsMatch[1]
            return u.searchParams.get('v')
        }
    } catch { /* ignore */ }
    return null
}

function MemoryCard({ memory, onEdit, hideSong }) {
    if (memory.type === 'photo') return <PhotoMemory memory={memory} onEdit={onEdit} hideSong={hideSong} />
    if (memory.type === 'video') return <VideoMemory memory={memory} onEdit={onEdit} hideSong={hideSong} />
    return <TextMemory memory={memory} onEdit={onEdit} hideSong={hideSong} />
}

function SongLabel({ song, hideSong }) {
    if (hideSong || !song?.title) return null
    const artist = song.artists?.[0] ?? ''
    return (
        <SongLabelWrap>
            <NoteIcon />
            {song.title}{artist ? ` · ${artist}` : ''}
        </SongLabelWrap>
    )
}

function Caption({ text }) {
    const [expanded, setExpanded] = useState(false)
    if (!text) return null
    return (
        <CaptionWrap>
            <CaptionText $expanded={expanded}>{text}</CaptionText>
            <ReadMoreBtn type="button" onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
                {expanded ? 'Show less' : 'Read more ↓'}
            </ReadMoreBtn>
        </CaptionWrap>
    )
}

function PeopleAttribution({ people = [] }) {
    if (!people.length) return null
    return (
        <span>
            Tags:{' '}
            {people.map((person, i) => (
                <span key={person._id}>
                    <PersonLink to={`/tags/${person._id}`}>
                        {person.name}
                    </PersonLink>
                    {i < people.length - 1 && ', '}
                </span>
            ))}
        </span>
    )
}

function PhotoMemory({ memory, onEdit, hideSong }) {
    const { mediaUrl, songId, people = [] } = memory
    const [lightboxOpen, setLightboxOpen] = useState(false)

    return (
        <>
            <Card $clickable onClick={() => setLightboxOpen(true)}>
                <MediaWrap>
                    <MemoryImg src={mediaUrl} alt="memory" />
                    {!hideSong && songId?.title && (
                        <TopBar>
                            <SongLabel song={songId} hideSong={hideSong} />
                            <PlayButton song={songId} size="sm" variant="icon" />
                        </TopBar>
                    )}
                </MediaWrap>
                <Caption text={memory.caption} />
                <BottomBar>
                    <PeopleAttribution people={people} />
                    {onEdit && (
                        <CardEditBtn type="button" onClick={e => { e.stopPropagation(); onEdit(memory) }}>
                            Edit
                        </CardEditBtn>
                    )}
                </BottomBar>
            </Card>
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={[{ src: mediaUrl }]}
                carousel={{ finite: true }}
                controller={{ closeOnBackdropClick: true }}
                styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.92)' } }}
            />
        </>
    )
}

function VideoMemory({ memory, onEdit, hideSong }) {
    const { mediaUrl, thumbnailUrl, songId, people = [] } = memory
    const [playing, setPlaying] = useState(false)

    const ytId = getYouTubeId(mediaUrl || '')
    const isYouTube = Boolean(ytId)

    return (
        <Card>
            <MediaWrap>
                {playing ? (
                    isYouTube ? (
                        <EmbedFrame
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                            title="YouTube video"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <VideoEl src={mediaUrl} controls autoPlay />
                    )
                ) : (
                    <>
                        {isYouTube ? (
                            <MemoryImg
                                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                                alt="video thumbnail"
                                style={{ aspectRatio: '16/9' }}
                            />
                        ) : thumbnailUrl ? (
                            <MemoryImg
                                src={thumbnailUrl}
                                alt="video thumbnail"
                            />
                        ) : (
                            <VideoPlaceholder />
                        )}
                        <VideoOverlay />
                        <PlayBtn
                            role="button"
                            onClick={e => { e.stopPropagation(); setPlaying(true) }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M5 3l8 5-8 5V3z" fill="rgba(255,255,255,0.9)" />
                            </svg>
                        </PlayBtn>
                    </>
                )}
                {!hideSong && songId?.title && (
                    <TopBar>
                        <SongLabel song={songId} hideSong={hideSong} />
                        <PlayButton song={songId} size="sm" variant="icon" />
                    </TopBar>
                )}
            </MediaWrap>
            <Caption text={memory.caption} />
            <BottomBar>
                <PeopleAttribution people={people} />
                {onEdit && (
                    <CardEditBtn type="button" onClick={e => { e.stopPropagation(); onEdit(memory) }}>
                        Edit
                    </CardEditBtn>
                )}
            </BottomBar>
        </Card>
    )
}

function TextMemory({ memory, onEdit, hideSong }) {
    const { content, bgColor, backgroundImageUrl, songId, people = [] } = memory
    const [expanded, setExpanded] = useState(false)
    const plainText = content?.replace(/<[^>]+>/g, '') || ''
    const overflows = plainText.length > 300

    const cardStyle = backgroundImageUrl
        ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : bgColor ? { background: bgColor } : {}

    return (
        <Card style={cardStyle}>
            <TextTopBar>
                <SongLabel song={songId} hideSong={hideSong} />
                {!hideSong && songId && <PlayButton song={songId} size="sm" variant="icon" />}
            </TextTopBar>
            <TextInner>
                <TextContent
                    $collapsed={!expanded && overflows}
                    dangerouslySetInnerHTML={{ __html: content || '' }}
                />
            </TextInner>
            <ActionRow>
                {overflows && (
                    <ExpandBtn
                        type="button"
                        onClick={e => { e.stopPropagation(); setExpanded(x => !x) }}
                    >
                        {expanded ? 'Collapse ↑' : 'Read more ↓'}
                    </ExpandBtn>
                )}
                {onEdit && (
                    <CardEditBtn type="button" onClick={e => { e.stopPropagation(); onEdit(memory) }}>
                        Edit
                    </CardEditBtn>
                )}
            </ActionRow>
            <BottomBar $onDark>
                <PeopleAttribution people={people} />
            </BottomBar>
        </Card>
    )
}

function NewMemoryCard({ onClick }) {
    return (
        <NewCard onClick={onClick}>
            <NewIcon>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </NewIcon>
            <span>Add memory</span>
        </NewCard>
    )
}

export { NewMemoryCard }
export default MemoryCard

// ── Styled components ─────────────────────────────────────────────────────────

const Card = styled.article`
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-border-tertiary);
    overflow: hidden;
    background: var(--color-background-secondary);
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    transition: border-color 0.15s;

    &:hover {
        border-color: var(--color-border-secondary);
    }
`

const MediaWrap = styled.div`
    position: relative;
`

const MemoryImg = styled.img`
    width: 100%;
    display: block;
    object-fit: cover;
`

const VideoOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    pointer-events: none;
`

const TopBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 10px 12px 32px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0) 100%);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
`

const PlayBtn = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.52);
    border: 1.5px solid rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    transition: background 0.15s, border-color 0.15s;

    &:hover {
        background: rgba(0, 0, 0, 0.72);
        border-color: rgba(255, 255, 255, 0.9);
    }
`

const EmbedFrame = styled.iframe`
    width: 100%;
    aspect-ratio: 16 / 9;
    display: block;
    border: none;
`

const VideoEl = styled.video`
    width: 100%;
    display: block;
`

const VideoPlaceholder = styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    background: var(--color-background-secondary);
`

const SongLabelWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
`

const NoteIcon = styled(NotesIcon)`
    width: 11px;
    height: 11px;
    fill: var(--accent);
    flex-shrink: 0;
`

const BottomBar = styled.div`
    padding: 8px 12px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: ${props => props.$onDark ? 'rgba(255,255,255,0.35)' : 'var(--color-text-tertiary)'};
    border-top: 1px solid ${props => props.$onDark ? 'rgba(255,255,255,0.1)' : 'var(--color-border-tertiary)'};
`

const PersonLink = styled(Link)`
    color: var(--accent);

    &:hover {
        text-decoration: underline;
    }
`

const TextTopBar = styled.div`
    padding: 1.25rem 1.5rem 0;
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 8px;
`

const TextInner = styled.div`
    padding: 0.75rem 1.5rem 1rem;
`

const TextContent = styled.div`
    font-size: 15px;
    line-height: 1.78;
    color: rgba(255, 255, 255, 0.82);

    p + p { margin-top: 0.85em; }
    em { font-style: italic; color: rgba(255, 255, 255, 0.52); }
    img { max-width: 100%; height: auto; border-radius: 6px; display: block; }
    h1, h2, h3 {
        font-size: 17px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        margin-bottom: 0.65em;
        letter-spacing: -0.3px;
        line-height: 1.3;
    }

    ${props => props.$collapsed && css`
        max-height: 190px;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(to bottom, black 45%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 45%, transparent 100%);
    `}
`

const ActionRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 1.5rem 0.75rem;
`

const ExpandBtn = styled.button`
    padding: 0;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.38);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
    text-align: left;

    &:hover {
        color: rgba(255, 255, 255, 0.72);
    }
`

const CardEditBtn = styled.button`
    padding: 0;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.28);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
    flex-shrink: 0;

    &:hover {
        color: var(--accent);
    }
`

const CaptionWrap = styled.div`
    padding: 8px 12px 2px;
`

const CaptionText = styled.p`
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-secondary);
    margin: 0;

    ${props => !props.$expanded && `
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    `}
`

const ReadMoreBtn = styled.button`
    padding: 0;
    font-size: 11px;
    font-weight: 500;
    margin: 0 0 4px;
    color: var(--color-text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
        color: var(--color-text-secondary);
    }
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
