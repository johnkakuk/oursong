import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import TipTapEditor from '../components/TipTapEditor'
import PeopleChips from '../components/PeopleChips'
import SongsService from '../services/songs.service'
import PeopleService from '../services/people.service'
import MemoriesService from '../services/memories.service'
import { ReactComponent as TrashIcon } from '../images/np_trash_1523231_000000.svg'

const TYPES = [
    { id: 'text',  label: 'Text' },
    { id: 'photo', label: 'Photo' },
    { id: 'video', label: 'Video' },
]

const BG_COLORS = [
    { hex: '#242424', label: 'Default' },
    { hex: '#1a1535', label: 'Indigo' },
    { hex: '#2a1218', label: 'Burgundy' },
    { hex: '#221a0e', label: 'Amber' },
    { hex: '#0d2420', label: 'Teal' },
    { hex: '#141a2e', label: 'Navy' },
    { hex: '#1a1a2e', label: 'Slate' },
    { hex: '#1e1a0e', label: 'Gold' },
]

function AddEditMemory() {
    const { id, memoryId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const editMode = Boolean(memoryId)
    const returnTo = location.state?.returnTo || '/'

    const [song, setSong] = useState(location.state?.song || null)
    const [people, setPeople] = useState([])

    // In edit mode, memory data drives initial form state
    const [memoryData, setMemoryData] = useState(location.state?.memory || null)
    // Gate rendering until we have memory data (for direct-URL edit navigation)
    const [formReady, setFormReady] = useState(!editMode || Boolean(location.state?.memory))

    // Form state
    const [type, setType] = useState('')
    const [selectedPeople, setSelectedPeople] = useState([])

    // Text
    const [content, setContent] = useState('')
    const [bgColor, setBgColor] = useState('#242424')

    // Photo
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [dragOver, setDragOver] = useState(false)

    // Text background image
    const [bgImageFile, setBgImageFile] = useState(null)
    const [bgImagePreview, setBgImagePreview] = useState(null)
    const [clearBgImage, setClearBgImage] = useState(false)

    // Video
    const [videoSource, setVideoSource] = useState('upload')
    const [videoFile, setVideoFile] = useState(null)
    const [videoThumbnail, setVideoThumbnail] = useState(null) // AI assisted
    const [thumbStatus, setThumbStatus] = useState('idle') // 'idle' | 'generating' | 'ready'
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [videoDragOver, setVideoDragOver] = useState(false)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Fetch song if not passed via state
    useEffect(() => {
        if (!song) {
            SongsService.getOne(id)
                .then(res => {
                    const { memories: _, ...songData } = res.data
                    setSong(songData)
                })
                .catch(() => {})
        }
    }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch memory in edit mode if not passed via state
    useEffect(() => {
        if (editMode && !memoryData) {
            MemoriesService.getOne(memoryId)
                .then(res => {
                    setMemoryData(res.data)
                    setFormReady(true)
                })
                .catch(() => setFormReady(true))
        }
    }, [editMode, memoryId]) // eslint-disable-line react-hooks/exhaustive-deps

    // Pre-populate form from memoryData in edit mode
    useEffect(() => {
        if (!editMode || !memoryData) return

        setType(memoryData.type || '')
        setBgColor(memoryData.bgColor || '#242424')
        setContent(memoryData.content || '')
        setSelectedPeople(
            (memoryData.people || []).map(p => (typeof p === 'string' ? p : p._id))
        )
        if (memoryData.type === 'photo') {
            setPhotoPreview(memoryData.mediaUrl || null)
        }
        if (memoryData.backgroundImageUrl) {
            setBgImagePreview(memoryData.backgroundImageUrl)
        }
        if (memoryData.type === 'video') {
            if (isValidYouTubeUrl(memoryData.mediaUrl || '')) {
                setVideoSource('youtube')
                setYoutubeUrl(memoryData.mediaUrl)
            } else {
                setVideoSource('upload')
            }
        }
    }, [editMode, memoryData])

    useEffect(() => {
        PeopleService.getAll()
            .then(res => setPeople(res.data))
            .catch(() => {})
    }, [])

    useEffect(() => {
        return () => {
            if (photoPreview && !editMode) URL.revokeObjectURL(photoPreview)
        }
    }, [photoPreview, editMode])

    // AI assisted — canvas thumbnail generation
    const handleVideoFile = async (file) => {
        if (!file || !file.type.startsWith('video/')) return
        setVideoFile(file)
        setVideoThumbnail(null)
        setThumbStatus('generating')
        try {
            const thumb = await generateVideoThumbnail(file)
            setVideoThumbnail(thumb)
            setThumbStatus('ready')
        } catch {
            setThumbStatus('idle')
        }
    }

    const handlePhotoFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        setPhotoFile(file)
        if (photoPreview && !editMode) URL.revokeObjectURL(photoPreview)
        setPhotoPreview(URL.createObjectURL(file))
    }

    const handleTogglePerson = (personId) => {
        setSelectedPeople(prev =>
            prev.includes(personId)
                ? prev.filter(p => p !== personId)
                : [...prev, personId]
        )
    }

    const canSubmit = () => {
        if (!type) return false
        if (type === 'text') return content.replace(/<[^>]+>/g, '').trim().length > 0
        if (type === 'photo') return editMode ? true : Boolean(photoFile)
        if (type === 'video') {
            if (editMode) return videoSource === 'youtube' ? isValidYouTubeUrl(youtubeUrl) : true
            return videoSource === 'upload' ? Boolean(videoFile) : isValidYouTubeUrl(youtubeUrl)
        }
        return false
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!canSubmit() || submitting) return

        setSubmitting(true)
        setError('')

        try {
            let payload

            if (editMode) {
                // Update existing memory
                if (type === 'text') {
                    if (bgImageFile) {
                        payload = new FormData()
                        payload.append('content', content)
                        payload.append('bgColor', bgColor !== '#242424' ? bgColor : '')
                        selectedPeople.forEach(p => payload.append('people', p))
                        payload.append('bgImage', bgImageFile)
                    } else {
                        payload = {
                            content,
                            bgColor: bgColor !== '#242424' ? bgColor : null,
                            people: selectedPeople,
                            ...(clearBgImage && { backgroundImageUrl: null }),
                        }
                    }
                 } else if (type === 'photo') {
                    if (photoFile) {
                        payload = new FormData()
                        payload.append('image', photoFile)
                        selectedPeople.forEach(p => payload.append('people', p))
                    } else {
                        payload = { people: selectedPeople }
                    }
                } else if (type === 'video') {
                    if (videoSource === 'youtube') {
                        payload = { mediaUrl: youtubeUrl, people: selectedPeople }
                    } else if (videoFile) {
                        payload = new FormData()
                        payload.append('video', videoFile)
                        if (videoThumbnail) payload.append('thumbnail', videoThumbnail, 'thumbnail.jpg')
                        selectedPeople.forEach(p => payload.append('people', p))
                    } else {
                        payload = { people: selectedPeople }
                    }
                }
                await MemoriesService.update(memoryId, payload)
            } else {
                // Create new memory
                if (type === 'text') {
                    if (bgImageFile) {
                        payload = new FormData()
                        payload.append('type', type)
                        payload.append('songId', id)
                        payload.append('content', content)
                        payload.append('bgColor', bgColor !== '#242424' ? bgColor : '')
                        selectedPeople.forEach(p => payload.append('people', p))
                        payload.append('bgImage', bgImageFile)
                    } else {
                        payload = {
                            type,
                            songId: id,
                            content,
                            bgColor: bgColor !== '#242424' ? bgColor : null,
                            people: selectedPeople,
                        }
                    }
                 } else if (type === 'photo') {
                    payload = new FormData()
                    payload.append('type', type)
                    payload.append('songId', id)
                    selectedPeople.forEach(p => payload.append('people', p))
                    payload.append('image', photoFile)
                } else if (type === 'video') {
                    if (videoSource === 'youtube') {
                        payload = {
                            type,
                            songId: id,
                            mediaUrl: youtubeUrl,
                            people: selectedPeople,
                        }
                    } else {
                        payload = new FormData()
                        payload.append('type', type)
                        payload.append('songId', id)
                        selectedPeople.forEach(p => payload.append('people', p))
                        payload.append('video', videoFile)
                        if (videoThumbnail) payload.append('thumbnail', videoThumbnail, 'thumbnail.jpg')
                    }
                }
                await MemoriesService.create(payload)
            }

            
            navigate(returnTo, { replace: true })
        } catch (err) {
            const msg = err?.response?.data?.error || err.message || 'Failed to save memory'
            setError(msg)
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Delete this memory? This cannot be undone.')) return
        try {
            await MemoriesService.remove(memoryId)
            navigate(returnTo, { replace: true })
        } catch {
            setError('Failed to delete memory')
        }
    }

    if (!formReady) return <StatusMsg>Loading…</StatusMsg>

    return (
        <Page>
            <Form onSubmit={handleSubmit}>
                <Header>
                    <BackBtn type="button" onClick={() => navigate(returnTo)}>
                        ← Back
                    </BackBtn>
                    <PageTitle>{editMode ? 'Edit memory' : 'New memory'}</PageTitle>
                    {editMode && (
                        <TrashBtn type="button" onClick={handleDelete} title="Delete memory">
                            <Trash />
                        </TrashBtn>
                    )}
                </Header>

                {song && (
                    <SongStrip>
                        <SongThumb src={song.albumArtUrl} alt={song.albumName} />
                        <SongStripInfo>
                            <SongStripTitle>{song.title}</SongStripTitle>
                            <SongStripArtist>{song.artists?.join(', ')}</SongStripArtist>
                        </SongStripInfo>
                    </SongStrip>
                )}

                <Divider />

                {/* Content type selector — hidden in edit mode */}
                {!editMode && (
                    <>
                        <TypeRow>
                            {TYPES.map(t => (
                                <TypeBtn
                                    key={t.id}
                                    type="button"
                                    $active={type === t.id}
                                    onClick={() => setType(t.id)}
                                >
                                    {t.label}
                                </TypeBtn>
                            ))}
                        </TypeRow>

                        <Divider />
                    </>
                )}

                {/* ── Text block ── */}
                <ContentBlock $visible={type === 'text'}>
                    <BgFieldRow>
                        <Field>
                            <FieldLabel>Background</FieldLabel>
                            <ColorRow $dimmed={Boolean(bgImagePreview)}>
                                {BG_COLORS.map(c => (
                                    <ColorSwatch
                                        key={c.hex}
                                        type="button"
                                        style={{ background: c.hex }}
                                        $selected={bgColor === c.hex}
                                        onClick={() => setBgColor(c.hex)}
                                        title={c.label}
                                        disabled={Boolean(bgImagePreview)}
                                    />
                                ))}
                                <HexInputField
                                    type="text"
                                    value={bgColor}
                                    onChange={e => {
                                        const val = e.target.value
                                        if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setBgColor(val)
                                    }}
                                    placeholder="#hex"
                                    maxLength={7}
                                    spellCheck={false}
                                    disabled={Boolean(bgImagePreview)}
                                />
                            </ColorRow>
                        </Field>
                        <Field>
                            <FieldLabel>Background image</FieldLabel>
                            <BgImageRow>
                                <BgImageBtn type="button" onClick={() => document.getElementById('bg-image-input').click()}>
                                    {bgImagePreview ? 'Change image' : 'Add image'}
                                </BgImageBtn>
                                {bgImagePreview && (
                                    <>
                                        <BgImageThumb src={bgImagePreview} alt="background preview" />
                                        <RemoveBgBtn type="button" onClick={() => {
                                            setBgImageFile(null)
                                            setBgImagePreview(null)
                                            setClearBgImage(true)
                                        }}>
                                            Remove
                                        </RemoveBgBtn>
                                    </>
                                )}
                            </BgImageRow>
                            <HiddenInput
                                id="bg-image-input"
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files[0]
                                    if (!file) return
                                    setBgImageFile(file)
                                    setBgImagePreview(URL.createObjectURL(file))
                                    setClearBgImage(false)
                                    e.target.value = ''
                                }}
                            />
                        </Field>
                    </BgFieldRow>
                    <EditorWrap style={bgImagePreview ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.75)),url(${bgImagePreview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : { background: bgColor }}>
                        <TipTapEditor
                            key={editMode ? (memoryData?._id || 'edit') : 'new'}
                            onChange={setContent}
                            initialContent={editMode ? (memoryData?.content || '') : ''}
                        />
                    </EditorWrap>
                    <Divider />
                </ContentBlock>

                {/* ── Photo block ── */}
                <ContentBlock $visible={type === 'photo'}>
                    <DropZone
                        $dragOver={dragOver}
                        $hasPreview={Boolean(photoPreview)}
                        onClick={() => document.getElementById('photo-input').click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault()
                            setDragOver(false)
                            handlePhotoFile(e.dataTransfer.files[0])
                        }}
                    >
                        {photoPreview
                            ? <PhotoPreview src={photoPreview} alt="preview" />
                            : <DropLabel>Click or drag a photo here</DropLabel>
                        }
                    </DropZone>
                    <HiddenInput
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        onChange={e => handlePhotoFile(e.target.files[0])}
                    />
                    <Divider />
                </ContentBlock>

                {/* ── Video block ── */}
                <ContentBlock $visible={type === 'video'}>
                    <SourceTabs>
                        <SourceTab
                            type="button"
                            $active={videoSource === 'upload'}
                            onClick={() => setVideoSource('upload')}
                        >
                            Upload file
                        </SourceTab>
                        <SourceTab
                            type="button"
                            $active={videoSource === 'youtube'}
                            onClick={() => setVideoSource('youtube')}
                        >
                            YouTube link
                        </SourceTab>
                    </SourceTabs>

                    {videoSource === 'upload' ? (
                        <>
                            <DropZone
                                $dragOver={videoDragOver}
                                $hasPreview={Boolean(videoFile)}
                                onClick={() => document.getElementById('video-input').click()}
                                onDragOver={e => { e.preventDefault(); setVideoDragOver(true) }}
                                onDragLeave={() => setVideoDragOver(false)}
                                onDrop={e => {
                                    e.preventDefault()
                                    setVideoDragOver(false)
                                    handleVideoFile(e.dataTransfer.files[0])
                                }}
                            >
                                {videoFile ? (
                                    <FileLabelRow>
                                        <span>{videoFile.name}</span>
                                        {thumbStatus === 'generating' && <ThumbSpinner>⋯</ThumbSpinner>}
                                        {thumbStatus === 'ready'      && <ThumbReady>✓</ThumbReady>}
                                    </FileLabelRow>
                                ) : (
                                    <DropLabel>
                                        {editMode && !videoFile
                                            ? 'Click or drag to replace the video file'
                                            : 'Click or drag a video file here'}
                                    </DropLabel>
                                )}
                            </DropZone>
                            <HiddenInput
                                id="video-input"
                                type="file"
                                accept="video/*"
                                onChange={e => handleVideoFile(e.target.files[0] || null)}
                            />
                        </>
                    ) : (
                        <UrlInput
                            type="url"
                            value={youtubeUrl}
                            onChange={e => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=…"
                        />
                    )}
                    <Divider />
                </ContentBlock>

                <Field>
                    <FieldLabel>With</FieldLabel>
                    <PeopleChips
                        people={people}
                        selected={selectedPeople}
                        onToggle={handleTogglePerson}
                        onPersonCreated={person => {
                            setPeople(prev => [...prev, person])
                            setSelectedPeople(prev => [...prev, person._id])
                        }}
                    />
                </Field>

                {type && (
                    <SubmitRow>
                        {error && <ErrorMsg>{error}</ErrorMsg>}
                        <SubmitBtn type="submit" disabled={!canSubmit() || submitting}>
                            {submitting
                                ? (editMode ? 'Updating…' : 'Saving…')
                                : (editMode ? 'Update memory' : 'Save memory')}
                        </SubmitBtn>
                    </SubmitRow>
                )}
            </Form>
        </Page>
    )
}

// AI assisted — video must be in the DOM for browsers to decode frames; off-DOM elements
// return black canvas. requestVideoFrameCallback (Chrome 83+, Safari 15.4+) is the
// purpose-built API for this; older browsers fall back to play+pause.
function generateVideoThumbnail(file) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        Object.assign(video.style, {
            position: 'fixed', top: '-9999px', left: '-9999px',
            width: '1px', height: '1px', pointerEvents: 'none',
        })
        document.body.appendChild(video)

        const url = URL.createObjectURL(file)
        video.src = url

        const cleanup = () => {
            URL.revokeObjectURL(url)
            video.parentNode?.removeChild(video)
        }

        const drawFrame = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth || 1280
                canvas.height = video.videoHeight || 720
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
                cleanup()
                canvas.toBlob(
                    blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
                    'image/jpeg', 0.85
                )
            } catch (err) { cleanup(); reject(err) }
        }

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration * 0.1)
        }

        video.onseeked = () => {
            if ('requestVideoFrameCallback' in video) {
                video.requestVideoFrameCallback(drawFrame)
                video.play().catch(() => {})
            } else {
                video.play().catch(drawFrame)
            }
        }

        video.onplaying = () => {
            if (!('requestVideoFrameCallback' in video)) {
                video.pause()
                drawFrame()
            }
        }

        video.onerror = () => { cleanup(); reject(new Error('Video load failed')) }
    })
}

function isValidYouTubeUrl(url) {
    try {
        const u = new URL(url)
        const isYTHost = u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com'
        const isWatch  = isYTHost && Boolean(u.searchParams.get('v'))
        const isShorts = isYTHost && /^\/shorts\/[\w-]+/.test(u.pathname)
        const isTiny   = u.hostname === 'youtu.be' && u.pathname.length > 1
        return isWatch || isShorts || isTiny
    } catch {
        return false
    }
}

export default AddEditMemory

const Page = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const Form = styled.form`
    max-width: 680px;
    margin: 0 auto;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
`

const BackBtn = styled.button`
    font-size: 13px;
    color: var(--color-text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: color 0.1s;

    &:hover { color: var(--color-text-primary); }
`

const PageTitle = styled.h1`
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    white-space: nowrap;
    flex: 1;
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

const SongStrip = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: var(--border-radius-md);
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-tertiary);
    margin-bottom: 1.5rem;
`

const SongThumb = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
`

const SongStripInfo = styled.div`
    flex: 1;
    min-width: 0;
`

const SongStripTitle = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const SongStripArtist = styled.div`
    font-size: 12px;
    color: var(--color-text-secondary);
`

const Divider = styled.hr`
    height: 1px;
    background: var(--color-border-tertiary);
    border: none;
    margin: 1.5rem 0;
`

const TypeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

const TypeBtn = styled.button`
    padding: 7px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    background: ${props => props.$active ? 'var(--accent)' : 'transparent'};
    color: ${props => props.$active ? '#0d2b1a' : 'var(--color-text-secondary)'};
    border: 1px solid ${props => props.$active ? 'var(--accent)' : 'var(--color-border-secondary)'};
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover {
        border-color: ${props => props.$active ? 'var(--accent)' : 'var(--color-text-secondary)'};
        color: ${props => props.$active ? '#0d2b1a' : 'var(--color-text-primary)'};
    }
`

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 1rem;
`

const FieldLabel = styled.span`
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
`

const ContentBlock = styled.div`
    display: ${props => props.$visible ? 'block' : 'none'};
`

const ColorRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    opacity: ${props => props.$dimmed ? 0.3 : 1};
    pointer-events: ${props => props.$dimmed ? 'none' : 'auto'};
    transition: opacity 0.2s;
`

const ColorSwatch = styled.button`
    width: 26px;
    height: 26px;
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid ${props => props.$selected ? 'var(--accent)' : 'rgba(255,255,255,0.12)'};
    outline: ${props => props.$selected ? '2px solid rgba(59,219,134,0.25)' : 'none'};
    outline-offset: 2px;
    transition: border-color 0.1s, outline 0.1s;

    &:hover {
        border-color: rgba(255, 255, 255, 0.4);
    }
`

const HexInputField = styled.input`
    width: 72px;
    padding: 4px 8px;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border-secondary);
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    font-size: 12px;
    font-family: monospace;
    outline: none;

    &::placeholder { color: var(--color-text-tertiary); }
    &:focus { border-color: var(--accent-muted); }
`

const EditorWrap = styled.div`
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-border-tertiary);
    padding: 1rem 1.25rem 0 1.25rem;
    overflow: hidden;
    transition: background 0.2s;
`

const DropZone = styled.div`
    border: 1px dashed ${props => props.$dragOver
        ? 'var(--accent-muted)'
        : 'var(--color-border-secondary)'};
    border-radius: var(--border-radius-lg);
    min-height: ${props => props.$hasPreview ? 'auto' : '160px'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.15s;

    &:hover {
        border-color: var(--color-text-secondary);
    }
`

const DropLabel = styled.span`
    font-size: 14px;
    color: var(--color-text-tertiary);
    padding: 2rem;
    text-align: center;
    pointer-events: none;
`

const PhotoPreview = styled.img`
    width: 100%;
    display: block;
    max-height: 400px;
    object-fit: cover;
`

const FileLabelRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--color-text-secondary);
    padding: 1.5rem 2rem;
`

const ThumbSpinner = styled.span`
    font-size: 20px;
    color: var(--color-text-tertiary);
    letter-spacing: 2px;
    animation: pulse 1s ease-in-out infinite;

    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50%       { opacity: 1; }
    }
`

const ThumbReady = styled.span`
    font-size: 14px;
    color: var(--accent);
    font-weight: 600;
`

const HiddenInput = styled.input`
    display: none;
`

const SourceTabs = styled.div`
    display: flex;
    border-bottom: 1px solid var(--color-border-tertiary);
    margin-bottom: 1rem;
`

const SourceTab = styled.button`
    padding: 8px 16px;
    font-size: 13px;
    background: none;
    border: none;
    border-bottom: 2px solid ${props => props.$active ? 'var(--accent)' : 'transparent'};
    color: ${props => props.$active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'};
    cursor: pointer;
    margin-bottom: -1px;
    transition: color 0.1s, border-color 0.1s;

    &:hover { color: var(--color-text-primary); }
`

const UrlInput = styled.input`
    width: 100%;
    padding: 10px 14px;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border-secondary);
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    font-size: 14px;
    outline: none;

    &::placeholder { color: var(--color-text-tertiary); }
    &:focus { border-color: var(--accent-muted); }
`

const SubmitRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
`

const ErrorMsg = styled.p`
    font-size: 13px;
    color: #e06c75;
    margin: 0;
`

const SubmitBtn = styled.button`
    padding: 10px 28px;
    border-radius: var(--border-radius-md);
    font-size: 14px;
    font-weight: 500;
    background: var(--accent);
    color: #0d2b1a;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: var(--color-text-tertiary);
`

const BgFieldRow = styled.div`
    display: flex;
    gap: 2rem;
    align-items: flex-start;

    & > ${Field}:first-child { flex: 1; min-width: 0; }
    & > ${Field}:last-child  { flex-shrink: 0; }

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`

const BgImageRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`

const BgImageBtn = styled.button`
    padding: 6px 14px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-secondary);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    flex-shrink: 0;

    &:hover { border-color: var(--color-text-secondary); color: var(--color-text-primary); }
`

const BgImageThumb = styled.img`
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius-md);
    object-fit: cover;
    border: 1px solid var(--color-border-tertiary);
    flex-shrink: 0;
`

const RemoveBgBtn = styled.button`
    padding: 0;
    font-size: 12px;
    background: none;
    border: none;
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: color 0.15s;

    &:hover { color: #e06c75; }
`
