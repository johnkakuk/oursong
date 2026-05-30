import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Cropper from 'react-easy-crop'
import styled from 'styled-components'
import TagsService from '../services/tags.service'

// ── Crop helpers (same as AddEditTag) ─────────────────────────────────────────

function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.addEventListener('load', () => resolve(img))
        img.addEventListener('error', reject)
        img.setAttribute('crossOrigin', 'anonymous')
        img.src = url
    })
}

async function getCroppedImg(imageSrc, croppedAreaPixels, outputSize = 400) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    canvas.getContext('2d').drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, outputSize, outputSize
    )
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

// ── TagChips ──────────────────────────────────────────────────────────────────

function TagChips({ people, selected, onToggle, onPersonCreated }) {
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <>
            <Chips>
                {people.map(person => (
                    <Chip
                        key={person._id}
                        type="button"
                        $selected={selected.includes(person._id)}
                        onClick={() => onToggle(person._id)}
                    >
                        {person.name}
                    </Chip>
                ))}
                <AddNewChip type="button" onClick={() => setModalOpen(true)}>
                    + New tag
                </AddNewChip>
            </Chips>

            {modalOpen && (
                <QuickAddModal
                    onClose={() => setModalOpen(false)}
                    onCreated={person => {
                        setModalOpen(false)
                        onPersonCreated?.(person)
                    }}
                />
            )}
        </>
    )
}

// ── QuickAddModal ─────────────────────────────────────────────────────────────

function QuickAddModal({ onClose, onCreated }) {
    const [name, setName] = useState('')

    const [photoFile, setPhotoFile]       = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)

    const [avatarDragOver, setAvatarDragOver] = useState(false)
    const [cropOpen, setCropOpen]             = useState(false)
    const [rawImageSrc, setRawImageSrc]             = useState(null)
    const [crop, setCrop]                           = useState({ x: 0, y: 0 })
    const [zoom, setZoom]                           = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const [saving, setSaving] = useState(false)
    const [error, setError]   = useState('')
    const fileRef = useRef()

    const openCropper = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        const url = URL.createObjectURL(file)
        setRawImageSrc(url)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCropOpen(true)
    }

    const handleCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const handleCropConfirm = async () => {
        try {
            const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels)
            const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' })
            if (photoFile && photoPreview) URL.revokeObjectURL(photoPreview)
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(blob))
            URL.revokeObjectURL(rawImageSrc)
            setRawImageSrc(null)
            setCropOpen(false)
        } catch { /* stay in cropper */ }
    }

    const handleCropCancel = () => {
        URL.revokeObjectURL(rawImageSrc)
        setRawImageSrc(null)
        setCropOpen(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!name.trim() || saving) return
        setSaving(true)
        setError('')
        try {
            let payload
            if (photoFile) {
                payload = new FormData()
                payload.append('name', name.trim())
                payload.append('profilePicture', photoFile)
            } else {
                payload = { name: name.trim() }
            }
            const res = await TagsService.create(payload)
            onCreated(res.data)
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to save')
            setSaving(false)
        }
    }

    const initial = name?.[0]?.toUpperCase() || '?'

    return createPortal(
        <>
            {/* Crop modal — rendered above the quick-add modal */}
            {cropOpen && (
                <CropLayer>
                    <CropOverlay onClick={handleCropCancel} />
                    <CropDialog>
                        <CropDialogHeader>Position photo</CropDialogHeader>
                        <CropArea>
                            <Cropper
                                image={rawImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                            />
                        </CropArea>
                        <CropControls>
                            <ZoomRow>
                                <ZoomLabel>Zoom</ZoomLabel>
                                <ZoomSlider
                                    type="range"
                                    min={1} max={3} step={0.01}
                                    value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))}
                                />
                            </ZoomRow>
                            <CropActions>
                                <SecondaryBtn type="button" onClick={handleCropCancel}>Cancel</SecondaryBtn>
                                <PrimaryBtn type="button" onClick={handleCropConfirm}>Use photo</PrimaryBtn>
                            </CropActions>
                        </CropControls>
                    </CropDialog>
                </CropLayer>
            )}

            {/* Quick-add modal */}
            <Backdrop onClick={e => { if (e.target === e.currentTarget) onClose() }}>
                <Modal>
                    <ModalTitle>New tag</ModalTitle>
                    <ModalForm onSubmit={handleSubmit}>
                        <AvatarRow>
                            <AvatarBtn
                                type="button"
                                $dragOver={avatarDragOver}
                                onClick={() => fileRef.current.click()}
                                onDragOver={e => { e.preventDefault(); setAvatarDragOver(true) }}
                                onDragLeave={() => setAvatarDragOver(false)}
                                onDrop={e => {
                                    e.preventDefault()
                                    setAvatarDragOver(false)
                                    openCropper(e.dataTransfer.files[0])
                                }}
                            >
                                {photoPreview
                                    ? <AvatarImg src={photoPreview} alt="preview" />
                                    : <AvatarInitial>{initial}</AvatarInitial>
                                }
                            </AvatarBtn>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => { openCropper(e.target.files[0]); e.target.value = '' }}
                            />
                        </AvatarRow>

                        <ModalField
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />

                        {error && <ModalError>{error}</ModalError>}

                        <ModalActions>
                            <SecondaryBtn type="button" onClick={onClose}>Cancel</SecondaryBtn>
                            <PrimaryBtn type="submit" disabled={!name.trim() || saving}>
                                {saving ? 'Saving…' : 'Create'}
                            </PrimaryBtn>
                        </ModalActions>
                    </ModalForm>
                </Modal>
            </Backdrop>
        </>,
        document.body
    )
}

export default TagChips

// ── Styled components ─────────────────────────────────────────────────────────

const Chips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

const Chip = styled.button`
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    background: ${props => props.$selected ? 'var(--accent-subtle)' : 'transparent'};
    color: ${props => props.$selected ? 'var(--accent-highlight)' : 'var(--color-text-secondary)'};
    border: 1px solid ${props => props.$selected ? 'var(--accent-muted)' : 'var(--color-border-secondary)'};
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover {
        border-color: ${props => props.$selected ? 'var(--accent)' : 'var(--color-text-secondary)'};
        color: ${props => props.$selected ? 'var(--accent-highlight)' : 'var(--color-text-primary)'};
    }
`

const AddNewChip = styled.button`
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    color: var(--color-text-tertiary);
    border: 1px dashed var(--color-border-secondary);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;

    &:hover {
        color: var(--accent);
        border-color: var(--accent-muted);
    }
`

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const Modal = styled.div`
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-lg);
    padding: 1.75rem;
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

const ModalTitle = styled.h2`
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
`

const ModalForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const AvatarRow = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 4px;
`

const AvatarBtn = styled.button`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 1px dashed ${props => props.$dragOver ? 'var(--accent)' : 'var(--color-border-secondary)'};
    background: ${props => props.$dragOver ? 'var(--accent-subtle)' : 'var(--color-background-secondary)'};
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s;

    &:hover { border-color: var(--accent-muted); }
`

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`

const AvatarInitial = styled.span`
    font-size: 22px;
    font-weight: 600;
    color: var(--accent-highlight);
`

const ModalField = styled.input`
    padding: 9px 12px;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border-secondary);
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    font-size: 14px;
    outline: none;

    &::placeholder { color: var(--color-text-tertiary); }
    &:focus { border-color: var(--accent-muted); }
`

const ModalError = styled.p`
    font-size: 12px;
    color: #e06c75;
    margin: 0;
`

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
`

const SecondaryBtn = styled.button`
    padding: 8px 16px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-secondary);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;

    &:hover { color: var(--color-text-primary); border-color: var(--color-text-secondary); }
`

const PrimaryBtn = styled.button`
    padding: 8px 20px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: var(--accent);
    color: #0d2b1a;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
`

// ── Crop modal ────────────────────────────────────────────────────────────────

const CropLayer = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
`

const CropOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(4px);
`

const CropDialog = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
`

const CropDialogHeader = styled.div`
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border-tertiary);
    letter-spacing: 0.02em;
`

const CropArea = styled.div`
    position: relative;
    height: 340px;
    background: #111;
`

const CropControls = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-top: 1px solid var(--color-border-tertiary);
`

const ZoomRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`

const ZoomLabel = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
    width: 36px;
`

const ZoomSlider = styled.input`
    flex: 1;
    height: 3px;
    border-radius: 2px;
    appearance: none;
    background: var(--color-border-secondary);
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--accent);
        cursor: pointer;
    }
`

const CropActions = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
`
