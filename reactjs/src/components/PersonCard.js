import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

export function NewPersonCard() {
    const navigate = useNavigate()
    return (
        <NewCard onClick={() => navigate('/people/new')}>
            <NewIcon>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </NewIcon>
            <span>Add person</span>
        </NewCard>
    )
}

function PersonCard({ person, memoryCount = 0 }) {
    const navigate = useNavigate()

    const initials = [person.firstName?.[0], person.lastName?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase() || '?'

    const displayName = [person.firstName, person.lastName].filter(Boolean).join(' ')

    return (
        <Card onClick={() => navigate(`/people/${person._id}`)}>
            <Avatar>
                {person.profilePictureUrl
                    ? <AvatarImg src={person.profilePictureUrl} alt={displayName} />
                    : initials
                }
            </Avatar>
            <PersonName>{displayName}</PersonName>
            <MemoryCount>
                {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
            </MemoryCount>
        </Card>
    )
}

export default PersonCard

const Card = styled.article`
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--color-border-tertiary);
    background: var(--color-background-secondary);
    padding: 1.25rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, transform 0.15s;

    &:hover {
        border-color: var(--color-border-secondary);
        transform: translateY(-2px);
    }
`

const Avatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 4px;
    overflow: hidden;
    background: var(--accent-subtle);
    color: var(--accent-highlight);
`

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`

const PersonName = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
`

const MemoryCount = styled.span`
    font-size: 12px;
    color: var(--color-text-tertiary);
`

const NewCard = styled.article`
    border-radius: var(--border-radius-lg);
    border: 1px dashed var(--color-border-secondary);
    background: transparent;
    padding: 1.25rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: var(--color-text-tertiary);
    text-align: center;
    min-height: 120px;
    transition: border-color 0.15s;

    &:hover {
        border-color: var(--accent-muted);
    }
`

const NewIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px dashed var(--color-border-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
`
