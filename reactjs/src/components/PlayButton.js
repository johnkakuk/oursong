import styled from 'styled-components'
import { usePlayer } from '../contexts/PlayerContext'

function PlayButton({ song, size = 'md', variant = 'framed' }) {
    const player = usePlayer()
    if (!player?.isReady) return null

    const isActive = player.sdkTrack?.uri === song.spotifyUri
    const isPlaying = isActive && !player.isPaused

    const handleClick = (e) => {
        e.stopPropagation()
        if (isActive) {
            player.togglePlay()
        } else {
            player.play(song)
        }
    }

    return (
        <Btn onClick={handleClick} $active={isActive} $size={size} $variant={variant} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
                <svg viewBox="0 0 16 16" fill="none">
                    <rect x="3.5" y="3" width="3" height="10" rx="1" fill="currentColor" />
                    <rect x="9.5" y="3" width="3" height="10" rx="1" fill="currentColor" />
                </svg>
            ) : (
                <svg viewBox="0 0 16 16" fill="none">
                    <path d="M5 3l8 5-8 5V3z" fill="currentColor" />
                </svg>
            )}
        </Btn>
    )
}

export default PlayButton

const SIZE = { sm: '20px', md: '26px', lg: '36px' }
const ICON = { sm: '10px', md: '14px', lg: '16px' }

const Btn = styled.button`
    width: ${p => SIZE[p.$size] || SIZE.md};
    height: ${p => SIZE[p.$size] || SIZE.md};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s, background 0.15s, border-color 0.15s, opacity 0.15s;

    svg {
        width: ${p => ICON[p.$size] || ICON.md};
        height: ${p => ICON[p.$size] || ICON.md};
    }

    /* ── framed variant ── */
    ${p => p.$variant !== 'icon' && `
        border: 1.5px solid ${p.$active ? 'var(--accent)' : 'rgba(255,255,255,0.3)'};
        background: ${p.$active ? 'rgba(59,219,134,0.12)' : 'rgba(0,0,0,0.45)'};
        backdrop-filter: blur(4px);
        color: ${p.$active ? 'var(--accent)' : 'rgba(255,255,255,0.9)'};

        &:hover {
            background: ${p.$active ? 'rgba(59,219,134,0.22)' : 'rgba(0,0,0,0.65)'};
            border-color: ${p.$active ? 'var(--accent)' : 'rgba(255,255,255,0.6)'};
        }
    `}

    /* ── icon variant ── */
    ${p => p.$variant === 'icon' && `
        border: none;
        background: none;
        color: ${p.$active ? 'var(--accent)' : 'rgba(255,255,255,0.7)'};

        &:hover {
            color: ${p.$active ? 'var(--accent)' : 'rgba(255,255,255,1)'};
            opacity: 0.9;
        }
    `}
`
