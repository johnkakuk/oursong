import { useEffect, useState } from 'react'
import styled from 'styled-components'

import TagCard, { NewTagCard } from '../components/TagCard'
import SectionHeader from '../components/SectionHeader'
import TagsService from '../services/tags.service'

function Tags() {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        TagsService.getAll()
            .then(res => setTags(res.data))
            .catch(err => setError(err.message || 'Failed to load tags'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <StatusMsg>Loading…</StatusMsg>
    if (error)   return <StatusMsg $error>{error}</StatusMsg>

    return (
        <Page>
            <Section>
                <PageTitle>All Tags</PageTitle>
                <SectionHeader title={`${tags.length} ${tags.length === 1 ? 'tag' : 'tags'}`} />
                <Grid>
                    {tags.map(tag => (
                        <TagCard
                            key={tag._id}
                            person={tag}
                            memoryCount={tag.memoryCount}
                        />
                    ))}
                    <NewTagCard />
                </Grid>
            </Section>
        </Page>
    )
}

export default Tags

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

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
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
