import { useEffect, useState } from 'react'
import styled from 'styled-components'

import PersonCard, { NewPersonCard } from '../components/PersonCard'
import SectionHeader from '../components/SectionHeader'
import PeopleService from '../services/people.service'

function People() {
    const [people, setPeople] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        PeopleService.getAll()
            .then(res => setPeople(res.data))
            .catch(err => setError(err.message || 'Failed to load people'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <StatusMsg>Loading…</StatusMsg>
    if (error)   return <StatusMsg $error>{error}</StatusMsg>

    return (
        <Page>
            <Section>
                <PageTitle>All People</PageTitle>
                <SectionHeader title={`${people.length} ${people.length === 1 ? 'person' : 'people'}`} />
                <Grid>
                    {people.map(person => (
                        <PersonCard
                            key={person._id}
                            person={person}
                            memoryCount={person.memoryCount}
                        />
                    ))}
                    <NewPersonCard />
                </Grid>
            </Section>
        </Page>
    )
}

export default People

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
