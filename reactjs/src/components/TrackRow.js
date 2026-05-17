import styled from 'styled-components'

function TrackRow({ track, index, isSaved, onSave, saving }) {
    const { name, artists = [], album = {} } = track

    const artistNames = artists.map(a => a.name).join(', ')

    return (
        <Row>
            <TrackNum>{index + 1}</TrackNum>
            {album.images?.[0]?.url && (
                <AlbumThumb src={album.images[0].url} alt={album.name} />
            )}
            <TrackInfo>
                <TrackName>{name}</TrackName>
                <TrackArtist>{artistNames}</TrackArtist>
            </TrackInfo>
            {isSaved ? (
                <SavedBadge>✦ Saved</SavedBadge>
            ) : (
                <SaveBtn type="button" onClick={onSave} disabled={saving}>
                    {saving ? 'Saving…' : '+ Save song'}
                </SaveBtn>
            )}
        </Row>
    )
}

export default TrackRow

const Row = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: var(--border-radius-md);
    cursor: default;
    transition: background 0.1s;
    min-width: 0;

    &:hover {
        background: var(--color-background-secondary);
    }
`

const TrackNum = styled.span`
    font-size: 13px;
    color: var(--color-text-tertiary);
    width: 16px;
    text-align: right;
    flex-shrink: 0;
`

const AlbumThumb = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
`

const TrackInfo = styled.div`
    flex: 1;
    min-width: 0;
`

const TrackName = styled.div`
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const TrackArtist = styled.div`
    font-size: 12px;
    color: var(--color-text-secondary);
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
