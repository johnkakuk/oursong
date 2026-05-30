import styled, { css } from 'styled-components'
import PlayButton from './PlayButton'
import { usePlayer } from '../contexts/PlayerContext'

function SearchResult({ type, result, isSaved, onSave, saving }) {
    const player = usePlayer()
    const isTrack = type === 'track'
    const isPremium = Boolean(player?.isReady)

    const image = isTrack
        ? result.album?.images?.[0]?.url
        : result.images?.[0]?.url

    const itemUrl = result.external_urls?.spotify
    const artists = type === 'artist' ? null : result.artists || []

    const songForPlayer = isTrack ? {
        spotifyUri: result.uri,
        title: result.name,
        artists: artists.map(a => a.name),
        albumArtUrl: result.album?.images?.[0]?.url,
    } : null

    const handleRowClick = () => {
        if (!isTrack) return
        if (isPremium) {
            player.play(songForPlayer)
        } else {
            window.open(itemUrl, '_blank', 'noopener,noreferrer')
        }
    }

    const subtitle = type === 'artist' ? 'Artist' : (
        <>
            {type === 'album' ? 'Album' : 'Song'}
            {' · '}
            {artists.map((a, i) => (
                <span key={a.id}>
                    {i > 0 && ', '}
                    <ArtistLink
                        href={a.external_urls?.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                    >
                        {a.name}
                    </ArtistLink>
                </span>
            ))}
        </>
    )

    return (
        <Row $clickable={isTrack} onClick={handleRowClick}>
            {isTrack ? (
                <ThumbWrap>
                    {image
                        ? <Thumb src={image} alt={result.name} />
                        : <ThumbPlaceholder />
                    }
                    <ThumbPlayOverlay>
                        <PlayButton song={songForPlayer} size="sm" />
                    </ThumbPlayOverlay>
                </ThumbWrap>
            ) : (
                <ThumbLink href={itemUrl} target="_blank" rel="noopener noreferrer">
                    {image
                        ? <Thumb src={image} alt={result.name} $circle={type === 'artist'} />
                        : <ThumbPlaceholder $circle={type === 'artist'} />
                    }
                </ThumbLink>
            )}
            <Info>
                {isTrack ? (
                    <TrackName>{result.name}</TrackName>
                ) : (
                    <Name href={itemUrl} target="_blank" rel="noopener noreferrer">
                        {result.name}
                    </Name>
                )}
                <Sub>{subtitle}</Sub>
            </Info>
            {isTrack && (
                isSaved ? (
                    <SavedBadge>✦ Saved</SavedBadge>
                ) : (
                    <SaveBtn type="button" onClick={e => { e.stopPropagation(); onSave() }} disabled={saving}>
                        {saving ? 'Saving…' : '+ Save'}
                    </SaveBtn>
                )
            )}
        </Row>
    )
}

export default SearchResult

const thumbShape = css`
    width: 44px;
    height: 44px;
    object-fit: cover;
    flex-shrink: 0;
    border-radius: ${({ $circle }) => $circle ? '50%' : '4px'};
`

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: var(--border-radius-md);
    cursor: ${p => p.$clickable ? 'pointer' : 'default'};
    transition: background 0.1s;
    min-width: 0;

    &:hover {
        background: var(--color-background-secondary);
    }
`

const ThumbWrap = styled.div`
    position: relative;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
`

const ThumbPlayOverlay = styled.div`
    position: absolute;
    inset: 0;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s;

    ${Row}:hover & { opacity: 1; }
`

const ThumbLink = styled.a`
    flex-shrink: 0;
    border-radius: inherit;
    line-height: 0;
`

const Thumb = styled.img`
    ${thumbShape}
    transition: opacity 0.15s;

    ${ThumbLink}:hover & {
        opacity: 0.8;
    }
`

const ThumbPlaceholder = styled.div`
    ${thumbShape}
    background: var(--color-background-secondary);
`

const Info = styled.div`
    flex: 1;
    min-width: 0;
`

const Name = styled.a`
    display: block;
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`

const TrackName = styled.div`
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const Sub = styled.div`
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const ArtistLink = styled.a`
    color: inherit;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`

const SavedBadge = styled.span`
    font-size: 11px;
    color: var(--accent);
    flex-shrink: 0;
`

const SaveBtn = styled.button`
    font-size: 11px;
    color: var(--accent-highlight);
    border: 1px solid var(--accent-muted);
    border-radius: var(--border-radius-md);
    padding: 4px 10px;
    background: var(--accent-subtle);
    cursor: pointer;
    flex-shrink: 0;
    white-space: nowrap;
    transition: border-color 0.1s;

    &:hover:not(:disabled) {
        border-color: var(--accent);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`
