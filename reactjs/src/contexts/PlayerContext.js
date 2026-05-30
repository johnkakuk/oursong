import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import AuthService from '../services/auth.service'

const PlayerContext = createContext(null)

export const usePlayer = () => useContext(PlayerContext)

export function PlayerProvider({ children, isPremium }) {
    const [isReady, setIsReady] = useState(false)
    const [deviceId, setDeviceId] = useState(null)
    const [sdkTrack, setSdkTrack] = useState(null)
    const [currentSong, setCurrentSong] = useState(null)
    const [isPaused, setIsPaused] = useState(true)
    const [position, setPosition] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolumeState] = useState(0.7)
    const [preloadedSong, setPreloadedSong] = useState(null)

    const playerRef = useRef(null)
    const tokenRef = useRef(null)
    const timerRef = useRef(null)
    const deviceIdRef = useRef(null)
    const volumeRef = useRef(0.7)
    const isWarmingUp = useRef(false)

    useEffect(() => { deviceIdRef.current = deviceId }, [deviceId])

    useEffect(() => {
        if (!isPremium) return

        AuthService.getSpotifyToken()
            .then(t => { tokenRef.current = t })
            .catch(() => {})

        const initPlayer = () => {
            // Guard against double-init if effect runs twice
            if (playerRef.current) return

            const player = new window.Spotify.Player({
                name: 'OurSong',
                getOAuthToken: async (cb) => {
                    const t = await AuthService.getSpotifyToken()
                    tokenRef.current = t
                    cb(t)
                },
                volume: 0,
            })

            player.addListener('ready', async ({ device_id }) => {
                deviceIdRef.current = device_id
                setDeviceId(device_id)
                setIsReady(true)
                console.log('[player] ready:', device_id)

                const token = tokenRef.current || await AuthService.getSpotifyToken()

                const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                    headers: { Authorization: `Bearer ${token}` },
                }).then(r => r.json()).catch(() => null)

                const lastTrack = recent?.items?.[0]?.track
                const lastUri = lastTrack?.uri
                console.log('[player] warm-up uri:', lastUri)
                if (!lastUri) return

                setPreloadedSong({
                    spotifyUri: lastTrack.uri,
                    title: lastTrack.name,
                    artists: lastTrack.artists?.map(a => a.name),
                    albumArtUrl: lastTrack.album?.images?.[0]?.url,
                    duration: lastTrack.duration_ms,
                })

                // Play silently so the SDK initialises _streamer without audible output.
                // State updates are suppressed until the user plays a real song.
                isWarmingUp.current = true

                const playRes = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uris: [lastUri] }),
                })
                console.log('[player] warm-up play status:', playRes.status)
            })

            player.addListener('not_ready', () => {
                console.log('[player] not_ready')
                setIsReady(false)
            })

            player.addListener('player_state_changed', (state) => {
                if (!state) return
                if (isWarmingUp.current) return
                console.log('[player] state_changed — paused:', state.paused, 'uri:', state.track_window.current_track?.uri)
                setSdkTrack(state.track_window.current_track)
                setIsPaused(state.paused)
                setPosition(state.position)
                setDuration(state.duration)
            })

            player.connect()
            playerRef.current = player
        }

        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        document.body.appendChild(script)

        // Callback for first-ever SDK load
        window.onSpotifyWebPlaybackSDKReady = initPlayer

        // If SDK was already loaded (e.g. StrictMode remount), call directly
        if (window.Spotify) initPlayer()

        return () => {
            playerRef.current?.disconnect()
            playerRef.current = null
            isWarmingUp.current = false
            if (document.body.contains(script)) document.body.removeChild(script)
            delete window.onSpotifyWebPlaybackSDKReady
        }
    }, [isPremium])

    useEffect(() => {
        clearInterval(timerRef.current)
        if (!isPaused && isReady) {
            timerRef.current = setInterval(() => {
                setPosition(p => p + 500)
            }, 500)
        }
        return () => clearInterval(timerRef.current)
    }, [isPaused, isReady])

    const play = useCallback(async (song) => {
        isWarmingUp.current = false
        setPreloadedSong(null)
        const id = deviceIdRef.current
        console.log('[player] play() — id:', id, 'uri:', song.spotifyUri)
        if (!id) return
        const token = tokenRef.current || await AuthService.getSpotifyToken()
        setCurrentSong(song)
        setPosition(0)
        setIsPaused(false)
        const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: [song.spotifyUri] }),
        })
        console.log('[player] play() response:', res.status)
        // Restore volume after the request completes. The warm-up track's final
        // state_changed fires during the fetch (volume still 0), so this avoids the blip.
        playerRef.current?.setVolume(volumeRef.current)
    }, [])

    const togglePlay = useCallback(() => {
        console.log('[player] togglePlay — playerRef:', !!playerRef.current)
        playerRef.current?.togglePlay()
    }, [])

    const seek = useCallback((ms) => {
        setPosition(ms)
        playerRef.current?.seek(ms)
    }, [])

    const changeVolume = useCallback((vol) => {
        volumeRef.current = vol
        setVolumeState(vol)
        playerRef.current?.setVolume(vol)
    }, [])

    const nextTrack = useCallback(() => playerRef.current?.nextTrack(), [])
    const prevTrack = useCallback(() => playerRef.current?.previousTrack(), [])

    return (
        <PlayerContext.Provider value={{
            isReady,
            sdkTrack,
            currentSong,
            isPaused,
            position,
            duration,
            volume,
            preloadedSong,
            play,
            togglePlay,
            seek,
            setVolume: changeVolume,
            nextTrack,
            prevTrack,
        }}>
            {children}
        </PlayerContext.Provider>
    )
}
