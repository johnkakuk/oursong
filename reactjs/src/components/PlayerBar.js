import styled, { css } from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'

function PlayerBar() {
    const player = usePlayer()
    if (!player?.sdkTrack && !player?.preloadedSong) return null

    const {
        sdkTrack, currentSong, preloadedSong, isPaused,
        position, duration, volume,
        play, togglePlay, seek, setVolume, nextTrack, prevTrack,
    } = player

    const isPreloaded = !sdkTrack && preloadedSong
    const albumArt = isPreloaded ? preloadedSong.albumArtUrl : (currentSong?.albumArtUrl || sdkTrack?.album?.images?.[0]?.url)
    const title    = isPreloaded ? preloadedSong.title : sdkTrack?.name
    const artist   = isPreloaded ? preloadedSong.artists?.join(', ') : sdkTrack?.artists?.map(a => a.name).join(', ')
    const displayIsPaused  = isPreloaded ? true : isPaused
    const displayPosition  = isPreloaded ? 0 : position
    const displayDuration  = isPreloaded ? (preloadedSong.duration || 0) : duration
    const pct      = displayDuration > 0 ? Math.min((displayPosition / displayDuration) * 100, 100) : 0

    const handlePlayPause = () => isPreloaded ? play(preloadedSong) : togglePlay()

    const fmt = (ms) => {
        const s = Math.floor(ms / 1000)
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
    }

    return (
        <Bar>
            <TrackInfo>
                {albumArt && <AlbumArt src={albumArt} alt={title} />}
                <TrackText>
                    <TrackTitle>{title}</TrackTitle>
                    <TrackArtist>{artist}</TrackArtist>
                </TrackText>
            </TrackInfo>

            <Center>
                <Controls>
                    <CtrlBtn onClick={prevTrack} title="Previous" disabled={isPreloaded}>
                        <svg viewBox="0 0 16 16" fill="none">
                            <path d="M3 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M13 3L6 8l7 5V3z" fill="currentColor" />
                        </svg>
                    </CtrlBtn>

                    <PlayPauseBtn onClick={handlePlayPause}>
                        {displayIsPaused ? (
                            <svg viewBox="0 0 16 16" fill="none">
                                <path d="M5 3l8 5-8 5V3z" fill="currentColor" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 16 16" fill="none">
                                <rect x="3.5" y="3" width="3" height="10" rx="1" fill="currentColor" />
                                <rect x="9.5" y="3" width="3" height="10" rx="1" fill="currentColor" />
                            </svg>
                        )}
                    </PlayPauseBtn>

                    <CtrlBtn onClick={nextTrack} title="Next" disabled={isPreloaded}>
                        <svg viewBox="0 0 16 16" fill="none">
                            <path d="M13 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M3 3l7 5-7 5V3z" fill="currentColor" />
                        </svg>
                    </CtrlBtn>
                </Controls>

                <ProgressRow>
                    <TimeLabel>{fmt(displayPosition)}</TimeLabel>
                    <ProgressInput
                        type="range"
                        min={0}
                        max={displayDuration || 0}
                        value={displayPosition}
                        onChange={e => !isPreloaded && seek(Number(e.target.value))}
                        $pct={pct}
                        disabled={isPreloaded}
                    />
                    <TimeLabel>{fmt(displayDuration)}</TimeLabel>
                </ProgressRow>
            </Center>

            <VolumeSection>
                <VolumeIcon $muted={volume === 0}>
                    {volume === 0 ? (
                        <svg viewBox="0 0 16 16" fill="none">
                            <path d="M8 4L4 7H2v2h2l4 3V4z" fill="currentColor" />
                            <path d="M12 6l-3 3m0-3l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 16 16" fill="none">
                            <path d="M8 4L4 7H2v2h2l4 3V4z" fill="currentColor" />
                            <path d="M11 6c.8.6 1.2 1.3 1.2 2s-.4 1.4-1.2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M13.5 4.5C15 5.8 15.8 6.9 15.8 8s-.8 2.2-2.3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    )}
                </VolumeIcon>
                <VolumeInput
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    $pct={volume * 100}
                />
            </VolumeSection>
        </Bar>
    )
}

export default PlayerBar

// ── Styled components ─────────────────────────────────────────────────────────

const Bar = styled.div`
    position: fixed;
    bottom: 0;
    left: 220px;
    right: 0;
    height: 72px;
    background: var(--color-background-secondary);
    border-top: 1px solid var(--color-border-secondary);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 24px;
    gap: 16px;
    z-index: 100;

    @media (max-width: 768px) {
        left: 0;
        grid-template-columns: 1fr auto;
        padding: 0 16px;
    }
`

const TrackInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
`

const AlbumArt = styled.img`
    width: 42px;
    height: 42px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
`

const TrackText = styled.div`
    min-width: 0;
`

const TrackTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const TrackArtist = styled.div`
    font-size: 11px;
    color: var(--color-text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
`

const Center = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 320px;
    max-width: 480px;

    @media (max-width: 768px) {
        min-width: 0;
        max-width: none;
    }
`

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`

const CtrlBtn = styled.button`
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: 50%;
    transition: color 0.15s;

    svg { width: 14px; height: 14px; }

    &:hover { color: var(--color-text-primary); }
`

const PlayPauseBtn = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-text-primary);
    border: none;
    color: var(--color-background-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.15s;

    svg { width: 15px; height: 15px; }

    &:hover { opacity: 0.85; }
    &:active { transform: scale(0.94); }
`

const ProgressRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
`

const TimeLabel = styled.span`
    font-size: 10px;
    color: var(--color-text-tertiary);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    min-width: 28px;

    &:last-child { text-align: right; }
`

const rangeTrack = css`
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    cursor: pointer;
    flex: 1;

    &::-webkit-slider-runnable-track {
        height: 3px;
        border-radius: 2px;
        background: linear-gradient(
            to right,
            var(--color-text-primary) 0%,
            var(--color-text-primary) ${p => p.$pct}%,
            rgba(255,255,255,0.12) ${p => p.$pct}%,
            rgba(255,255,255,0.12) 100%
        );
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-text-primary);
        margin-top: -4.5px;
        opacity: 0;
        transition: opacity 0.15s;
    }

    &:hover::-webkit-slider-thumb { opacity: 1; }

    &::-moz-range-track {
        height: 3px;
        border-radius: 2px;
        background: rgba(255,255,255,0.12);
    }

    &::-moz-range-progress {
        height: 3px;
        border-radius: 2px;
        background: var(--color-text-primary);
    }

    &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-text-primary);
        border: none;
        opacity: 0;
        transition: opacity 0.15s;
    }

    &:hover::-moz-range-thumb { opacity: 1; }
`

const ProgressInput = styled.input`
    ${rangeTrack}
    flex: 1;
`

const VolumeSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;

    @media (max-width: 768px) {
        display: none;
    }
`

const VolumeIcon = styled.div`
    width: 18px;
    height: 18px;
    color: ${p => p.$muted ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)'};
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    svg { width: 16px; height: 16px; }
`

const VolumeInput = styled.input`
    ${rangeTrack}
    width: 80px;
    flex: none;
`
