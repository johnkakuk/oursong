import styled from 'styled-components'

function SectionHeader({ title, linkLabel, onLinkClick }) {
    return (
        <Header>
            <SectionTitle>{title}</SectionTitle>
            {linkLabel && (
                <SectionLink type="button" onClick={onLinkClick}>
                    {linkLabel}
                </SectionLink>
            )}
        </Header>
    )
}

export default SectionHeader

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
`

const SectionTitle = styled.span`
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
`

const SectionLink = styled.button`
    font-size: 13px;
    color: var(--accent);
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.85;
    padding: 0;

    &:hover {
        opacity: 1;
    }
`
