import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

function Hero({ user }) {
    const [searchParams] = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')
    const navigate = useNavigate()

    useEffect(() => {
        setQuery(searchParams.get('q') || '')
    }, [searchParams])

    const greeting = getGreeting()
    const firstName = user?.displayName?.split(' ')[0] || 'there'

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }

    return (
        <HeroSection>
            <HeroGreeting>{greeting}, {firstName}</HeroGreeting>
            <HeroHeadline>
                What song takes you<br />back <HeroAccent>today?</HeroAccent>
            </HeroHeadline>
            <SearchForm onSubmit={handleSearch}>
                <label htmlFor="hero-search" className="sr-only">
                    Search songs, artists, or albums
                </label>
                <SearchIcon viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </SearchIcon>
                <SearchInput
                    id="hero-search"
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search for a song, artist, or album…"
                />
                <SearchShortcut type="submit">↵ Enter</SearchShortcut>
            </SearchForm>
        </HeroSection>
    )
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

export default Hero

const HeroSection = styled.div`
    padding: 5rem 2rem;
    text-align: center;
`

const HeroGreeting = styled.p`
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 4px;
`

const HeroHeadline = styled.h1`
    font-size: 28px;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
    margin-bottom: 1.5rem;
    line-height: 1.3;
`

const HeroAccent = styled.span`
    color: var(--accent);
`

const SearchForm = styled.form`
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-lg);
    padding: 10px 16px;
    max-width: 520px;
    margin: 0 auto;
    cursor: text;
    transition: border-color 0.15s;

    &:hover,
    &:focus-within {
        border-color: #4E4E4E;
    }
`

const SearchIcon = styled.svg`
    width: 16px;
    height: 16px;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
`

const SearchInput = styled.input`
    flex: 1;
    min-width: 0;
    font-size: 15px;
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;
    caret-color: var(--color-text-primary);

    &::placeholder {
        color: var(--color-text-tertiary);
        opacity: 1;
    }

    /* Hide browser-default clear/search button */
    &::-webkit-search-cancel-button { display: none; }
`

const SearchShortcut = styled.button`
    margin-left: auto;
    font-size: 11px;
    color: var(--color-text-tertiary);
    background: var(--color-background-tertiary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    white-space: nowrap;
`
