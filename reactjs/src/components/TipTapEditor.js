import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import styled, { createGlobalStyle } from 'styled-components'
import api from '../services/api'

const STATIC_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''

function TipTapEditor({ onChange, initialContent = '' }) {
    const fileInputRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false, allowBase64: false }),
            Placeholder.configure({ placeholder: 'Write your memory…' }),
        ],
        content: initialContent,
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    const handleImageFile = async (file) => {
        if (!file) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('image', file)
            const { data } = await api.post('/upload/image', formData)
            editor.chain().focus().setImage({ src: `${STATIC_BASE}${data.url}` }).run()
        } catch (err) {
            console.error('[upload] image failed:', err)
        } finally {
            setUploading(false)
            fileInputRef.current.value = ''
        }
    }

    return (
        <Wrap>
            <TipTapGlobalStyles />
            <Toolbar>
                <ToolBtn
                    type="button"
                    $active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                >
                    <strong>B</strong>
                </ToolBtn>
                <ToolBtn
                    type="button"
                    $active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                >
                    <em>I</em>
                </ToolBtn>
                <ToolDivider />
                <ToolBtn
                    type="button"
                    $active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="Heading 1"
                >
                    H1
                </ToolBtn>
                <ToolBtn
                    type="button"
                    $active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    title="Heading 2"
                >
                    H2
                </ToolBtn>
                <ToolDivider />
                <ToolBtn
                    type="button"
                    $active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet list"
                >
                    — List
                </ToolBtn>
                <ToolDivider />
                <ToolBtn
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Insert image"
                >
                    {uploading ? '…' : (
                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                            <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                            <circle cx="5.5" cy="6.5" r="1.2" fill="currentColor" />
                            <path d="M1 11l3.5-3.5 2.5 2.5 2-2 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </ToolBtn>
                <HiddenInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFile(e.target.files[0])}
                />
            </Toolbar>
            <EditorContent editor={editor} />
        </Wrap>
    )
}

export default TipTapEditor

const TipTapGlobalStyles = createGlobalStyle`
    .ProseMirror {
        min-height: 180px;
        padding: 0.75rem 0 1.5rem;
        outline: none;
        font-size: 15px;
        line-height: 1.78;
        color: rgba(255, 255, 255, 0.82);
    }

    .ProseMirror > * + * {
        margin-top: 0.85em;
    }

    .ProseMirror p {
        margin: 0;
    }

    .ProseMirror h2 {
        font-size: 17px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        letter-spacing: -0.3px;
        line-height: 1.3;
        margin: 0;
    }

    .ProseMirror h3 {
        font-size: 15px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
    }

    .ProseMirror ul {
        padding-left: 1.25rem;
    }

    .ProseMirror em {
        font-style: italic;
        color: rgba(255, 255, 255, 0.52);
    }

    .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: var(--color-text-tertiary);
        pointer-events: none;
        height: 0;
    }

    .ProseMirror img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        display: block;
        margin: 0.5em 0;
    }

    .ProseMirror img.ProseMirror-selectednode {
        outline: 2px solid var(--accent);
    }
`

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
`

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 0 8px;
    border-bottom: 1px solid var(--color-border-tertiary);
`

const ToolBtn = styled.button`
    padding: 4px 8px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: ${props => props.$active ? 'var(--color-background-tertiary)' : 'transparent'};
    color: ${props => props.$active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'};
    border: none;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
    min-width: 28px;
    text-align: center;

    &:hover {
        background: var(--color-background-tertiary);
        color: var(--color-text-primary);
    }
`

const ToolDivider = styled.span`
    width: 1px;
    height: 16px;
    background: var(--color-border-secondary);
    margin: 0 4px;
    flex-shrink: 0;
`

const HiddenInput = styled.input`
    display: none;
`
