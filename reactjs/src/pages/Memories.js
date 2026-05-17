import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import styled from 'styled-components'

import MemoryCard from '../components/MemoryCard'
import SectionHeader from '../components/SectionHeader'
import MemoriesService from '../services/memories.service'

const MASONRY_BREAKPOINTS = { default: 3, 900: 2, 640: 1 }

function Memories() {
    const [memories, setMemories] = useState([])
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState('')
    const navigate  = useNavigate()
    const location  = useLocation()

    useEffect(() => {
        MemoriesService.getAll()
            .then(res => setMemories(res.data))
            .catch(err => setError(err.message || 'Failed to load memories'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <StatusMsg>Loading…</StatusMsg>
    if (error)   return <StatusMsg $error>{error}</StatusMsg>

    return (
        <Page>
            <Section>
                <PageTitle>All Memories</PageTitle>
                <SectionHeader title={`${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}`} />
                {memories.length === 0
                    ? <StatusMsg>No memories yet — open a song and add one.</StatusMsg>
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

export default Memories

const Page = styled.div`
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
        padding-top: 64px;
    }
`

const Section = styled.div`
    padding: 2rem;
`

const PageTitle = styled.h1`
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    margin: 0 0 1.5rem;
`

const StatusMsg = styled.p`
    padding: 4rem 2rem;
    font-size: 14px;
    color: ${props => props.$error ? '#e06c75' : 'var(--color-text-tertiary)'};
`
