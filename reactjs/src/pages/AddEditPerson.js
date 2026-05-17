import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Cropper from 'react-easy-crop'
import styled from 'styled-components'

import PeopleService from '../services/people.service'

// ── Crop helpers ──────────────────────────────────────────────────────────────

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
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, outputSize, outputSize
    )
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

// ── Component ─────────────────────────────────────────────────────────────────

function AddEditPerson() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const editMode = Boolean(id)

    const [personData] = useState(location.state?.person || null)
    const [formReady, setFormReady] = useState(!editMode || Boolean(location.state?.person))

    // Form fields
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName]   = useState('')

    // Photo state — photoPreview is either a blob URL (new file) or server URL (existing)
    const [photoFile, setPhotoFile]       = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [dragOver, setDragOver]         = useState(false)

    // Crop modal state
    const [cropModalOpen, setCropModalOpen]         = useState(false)
    const [rawImageSrc, setRawImageSrc]             = useState(null)
    const [crop, setCrop]                           = useState({ x: 0, y: 0 })
    const [zoom, setZoom]                           = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState('')

    // Populate form in edit mode
    useEffect(() => {
        if (!editMode) return

        const populate = (p) => {
            setFirstName(p.firstName || '')
            setLastName(p.lastName || '')
            setPhotoPreview(p.profilePictureUrl || null)
            setFormReady(true)
        }

        if (personData) {
            populate(personData)
        } else {
            PeopleService.getOne(id)
                .then(res => populate(res.data))
                .catch(() => setFormReady(true))
        }
    }, [editMode, id]) // eslint-disable-line react-hooks/exhaustive-deps

    // Revoke blob URLs on unmount
    useEffect(() => {
        return () => {
            if (rawImageSrc) URL.revokeObjectURL(rawImageSrc)
        }
    }, [rawImageSrc])

    // ── Photo selection → open cropper ───────────────────────────────────────

    const openCropper = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        const url = URL.createObjectURL(file)
        setRawImageSrc(url)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCropModalOpen(true)
    }

    const handleCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels)
    }, [])

    const handleCropConfirm = async () => {
        try {
            const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels)
            const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' })

            // Revoke previous blob preview URL if it was one we created
            if (photoFile && photoPreview) URL.revokeObjectURL(photoPreview)

            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(blob))

            URL.revokeObjectURL(rawImageSrc)
            setRawImageSrc(null)
            setCropModalOpen(false)
        } catch {
            // silently ignore — user stays in cropper
        }
    }

    const handleCropCancel = () => {
        URL.revokeObjectURL(rawImageSrc)
        setRawImageSrc(null)
        setCropModalOpen(false)
    }

    const handleRemovePhoto = () => {
        if (photoFile && photoPreview) URL.revokeObjectURL(photoPreview)
        setPhotoFile(null)
        setPhotoPreview(null)
    }

    // ── Form helpers ─────────────────────────────────────────────────────────

    const initials = [firstName?.[0], lastName?.[0]]
        .filter(Boolean).join('').toUpperCase() || '?'

    const canSubmit = () => firstName.trim().length > 0

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!canSubmit() || submitting) return

        setSubmitting(true)
        setError('')

        try {
            let payload

            if (photoFile) {
                payload = new FormData()
                payload.append('firstName', firstName.trim())
                payload.append('lastName', lastName.trim())
                payload.append('profilePicture', photoFile)
            } else {
                payload = { firstName: firstName.trim(), lastName: lastName.trim() }
            }

            if (editMode) {
                await PeopleService.update(id, payload)
                navigate(`/people/${id}`, { replace: true })
            } else {
                const res = await PeopleService.create(payload)
                navigate(`/people/${res.data._id}`, { replace: true })
            }
        } catch (err) {
            const msg = err?.response?.data?.error || err.message || 'Failed to save'
            setError(msg)
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Remove ${firstName}? They'll be untagged from all memories.`)) return
        try {
            await PeopleService.remove(id)
            navigate('/people', { replace: true })
        } catch (err) {
            setError(err?.response?.data?.error || err.message || 'Failed to delete')
        }
    }

    if (!formReady) return <StatusMsg>Loading…</StatusMsg>

    return (
        <Page>
            {/* ── Crop modal ── */}
            {cropModalOpen && (
                <CropModal>
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
                                    min={1}
                                    max={3}
                                    step={0.01}
                                    value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))}
                                />
                            </ZoomRow>
                            <CropActions>
                                <CancelBtn type="button" onClick={handleCropCancel}>Cancel</CancelBtn>
                                <ConfirmBtn type="button" onClick={handleCropConfirm}>Use photo</ConfirmBtn>
                            </CropActions>
                        </CropControls>
                    </CropDialog>
                </CropModal>
            )}

            <Form onSubmit={handleSubmit}>
                <Header>
                    <BackBtn type="button" onClick={() => navigate(editMode ? `/people/${id}` : '/people')}>
                        ← Back
                    </BackBtn>
                    <PageTitle>{editMode ? 'Edit person' : 'New person'}</PageTitle>
                </Header>

                {/* Avatar preview row */}
                <AvatarSection>
                    <AvatarPreview>
                        {photoPreview
                            ? <AvatarImg src={photoPreview} alt="preview" />
                            : <AvatarInitials>{initials}</AvatarInitials>
                        }
                    </AvatarPreview>
                    <PhotoUploadBtn
                        type="button"
                        onClick={() => document.getElementById('pfp-input').click()}
                    >
                        {photoPreview ? 'Change photo' : 'Upload photo'}
                    </PhotoUploadBtn>
                    {photoPreview && (
                        <RemovePhotoBtn type="button" onClick={handleRemovePhoto}>
                            Remove
                        </RemovePhotoBtn>
                    )}
                    <HiddenInput
                        id="pfp-input"
                        type="file"
                        accept="image/*"
                        onChange={e => { openCropper(e.target.files[0]); e.target.value = '' }}
                    />
                </AvatarSection>

                {/* Drop zone: AI generated */}
                <DropZone
                    $dragOver={dragOver}
                    onClick={() => document.getElementById('pfp-input').click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                        e.preventDefault()
                        setDragOver(false)
                        openCropper(e.dataTransfer.files[0])
                    }}
                >
                    {photoPreview
                        ? <DropPreview src={photoPreview} alt="preview" />
                        : <DropLabel>Drag a photo here, or click to browse</DropLabel>
                    }
                </DropZone>

                <Divider />

                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="firstName">First name <Required>*</Required></FieldLabel>
                        <TextInput
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            placeholder="First name"
                            autoFocus={!editMode}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                        <TextInput
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            placeholder="Last name"
                        />
                    </Field>
                </FieldGroup>

                <SubmitRow>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <Actions>
                        {editMode && (
                            <DeleteBtn type="button" onClick={handleDelete}>
                                Remove person
                            </DeleteBtn>
                        )}
                        <SubmitBtn type="submit" disabled={!canSubmit() || submitting}>
                            {submitting
                                ? (editMode ? 'Updating…' : 'Saving…')
                                : (editMode ? 'Update person' : 'Save person')}
                        </SubmitBtn>
                    </Actions>
                </SubmitRow>
            </Form>
        </Page>
    )
}

export default AddEditPerson

// ── Styled components ─────────────────────────────────────────────────────────

const Page = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const Form = styled.form`
    max-width: 480px;
    margin: 0 auto;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
`

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
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
`

const AvatarSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
`

const AvatarPreview = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
    background: var(--accent-subtle);
    border: 1px solid var(--color-border-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
`

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`

const AvatarInitials = styled.span`
    font-size: 20px;
    font-weight: 600;
    color: var(--accent-highlight);
`

const PhotoUploadBtn = styled.button`
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    background: none;
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-md);
    padding: 6px 14px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: var(--color-text-secondary);
        color: var(--color-text-primary);
    }
`

const RemovePhotoBtn = styled.button`
    font-size: 12px;
    color: var(--color-text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;

    &:hover { color: #e06c75; }
`

const DropZone = styled.div`
    border: 1px dashed ${props => props.$dragOver ? 'var(--accent-muted)' : 'var(--color-border-secondary)'};
    border-radius: var(--border-radius-lg);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.15s;

    &:hover { border-color: var(--color-text-secondary); }
`

const DropPreview = styled.img`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center center;
`

const DropLabel = styled.span`
    font-size: 14px;
    color: var(--color-text-tertiary);
    padding: 2rem;
    text-align: center;
    pointer-events: none;
`

const HiddenInput = styled.input`
    display: none;
`

const Divider = styled.hr`
    height: 1px;
    background: var(--color-border-tertiary);
    border: none;
    margin: 1.5rem 0;
`

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const FieldLabel = styled.label`
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
`

const Required = styled.span`
    color: var(--accent);
`

const TextInput = styled.input`
    padding: 10px 14px;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border-secondary);
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s;

    &::placeholder { color: var(--color-text-tertiary); }
    &:focus { border-color: var(--accent-muted); }
`

const SubmitRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 2rem;
`

const Actions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
`

const ErrorMsg = styled.p`
    font-size: 13px;
    color: #e06c75;
    margin: 0;
`

const DeleteBtn = styled.button`
    padding: 10px 0;
    font-size: 13px;
    color: var(--color-text-tertiary);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;

    &:hover { color: #e06c75; }
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
    margin-left: auto;

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: var(--color-text-tertiary);
`

// ── Crop modal ────────────────────────────────────────────────────────────────

const CropModal = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1000;
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

const CancelBtn = styled.button`
    padding: 8px 18px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-secondary);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: var(--color-text-secondary);
        color: var(--color-text-primary);
    }
`

const ConfirmBtn = styled.button`
    padding: 8px 18px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: var(--accent);
    color: #0d2b1a;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover { opacity: 0.88; }
`
