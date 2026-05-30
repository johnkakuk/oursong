import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import styled from 'styled-components'

import MemoryCard from '../components/MemoryCard'
import SectionHeader from '../components/SectionHeader'
import TagsService from '../services/tags.service'
import { ReactComponent as TrashIcon } from '../images/np_trash_1523231_000000.svg'

const MASONRY_BREAKPOINTS = { default: 3, 900: 2, 640: 1 }

function TagSingle() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [tag, setTag] = useState(null)
    const [memories, setMemories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        TagsService.getOne(id)
            .then(res => {
                const { memories: tagMemories, ...tagData } = res.data
                setTag(tagData)
                setMemories(tagMemories || [])
            })
            .catch(err => setError(err.message || 'Failed to load tag'))
            .finally(() => setLoading(false))
    }, [id])

    const handleDelete = async () => {
        if (!window.confirm(`Remove "${tag.name}"? It'll be untagged from all memories.`)) return
        try {
            await TagsService.remove(id)
            navigate('/tags', { replace: true })
        } catch {
            setError('Failed to delete tag')
        }
    }

    if (loading) return <StatusMsg>Loading…</StatusMsg>
    if (error)   return <StatusMsg $error>{error}</StatusMsg>
    if (!tag) return null

    const initial = tag.name?.[0]?.toUpperCase() || '?'
    const memoryCount = memories.length

    return (
        <Page>
            <TagHero>
                <Avatar>
                    {tag.profilePictureUrl
                        ? <AvatarImg src={tag.profilePictureUrl} alt={tag.name} />
                        : initial
                    }
                </Avatar>
                <HeroInfo>
                    <TagName>{tag.name}</TagName>
                    <MemoryCount>
                        {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
                    </MemoryCount>
                </HeroInfo>
                <HeroActions>
                    <TrashBtn type="button" onClick={handleDelete} title="Delete tag">
                        <Trash />
                    </TrashBtn>
                    <EditBtn
                        type="button"
                        onClick={() => navigate(`/tags/${id}/edit`, { state: { person: tag } })}
                    >
                        Edit
                    </EditBtn>
                </HeroActions>
            </TagHero>

            <Divider />

            <Section>
                <SectionHeader title="Memories" />
                {memoryCount === 0
                    ? <EmptyMsg>No memories yet — tag {tag.name} when adding a memory.</EmptyMsg>
                    : (
                        <Masonry
                            breakpointCols={MASONRY_BREAKPOINTS}
                            className="masonry-grid"
                            columnClassName="masonry-grid-col"
                        >
                            {memories.map(memory => (
                                <MemoryCard
                                    key={memory._id}
                                    memory={memory}
                                    onEdit={memory => navigate(
                                        `/songs/${memory.songId._id}/memories/${memory._id}/edit`,
                                        { state: { memory, song: memory.songId, returnTo: location.pathname } }
                                    )}
                                />
                            ))}
                        </Masonry>
                    )
                }
            </Section>
        </Page>
    )
}

export default TagSingle

const Page = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const TagHero = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 3rem 2rem 2.5rem;

    @media (max-width: 640px) {
        padding: 2rem 1.5rem;
        gap: 1rem;
    }
`

const Avatar = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 600;
    overflow: hidden;
    background: var(--accent-subtle);
    color: var(--accent-highlight);
    border: 1px solid var(--color-border-tertiary);
`

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`

const HeroInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`

const TagName = styled.h1`
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin: 0;
`

const MemoryCount = styled.p`
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
`

const HeroActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
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

const EditBtn = styled.button`
    padding: 7px 18px;
    border-radius: var(--border-radius-md);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-secondary);
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
        border-color: var(--color-text-secondary);
        color: var(--color-text-primary);
    }
`

const Divider = styled.hr`
    height: 1px;
    background: var(--color-border-tertiary);
    border: none;
    margin: 0 2rem;
`

const Section = styled.div`
    padding: 2rem;
`

const EmptyMsg = styled.p`
    font-size: 14px;
    color: var(--color-text-tertiary);
    margin-top: 1rem;
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: ${props => props.$error ? '#e06c75' : 'var(--color-text-tertiary)'};
`
