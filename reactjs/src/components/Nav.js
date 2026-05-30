import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import noteIcon from '../images/np_notes_2825949_000000.svg'

function Nav({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false)

    // Close mobile nav when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [])

    const initials = user?.displayName
        ? user.displayName[0].toUpperCase()
        : '?'

    const handleLoginClick = () => {
        window.location.href = '/api/v1/auth/spotify'
    }

    return (
        <>
            <Hamburger
                className={isOpen ? 'is-open' : ''}
                onClick={() => setIsOpen(open => !open)}
                aria-label="Open menu"
            >
                <HamburgerIcon>
                    <HamburgerLine />
                    <HamburgerLine />
                    <HamburgerLine />
                </HamburgerIcon>
            </Hamburger>

            {isOpen && <Overlay onClick={() => setIsOpen(false)} />}

            <NavSidebar className={isOpen ? 'is-open' : ''}>
                <NavLogo>
                    <NoteIcon aria-hidden="true" />
                    OurSong
                </NavLogo>

                <NavLinks>
                    <StyledNavLink to="/" end>Home</StyledNavLink>
                    <StyledNavLink to="/search">Search</StyledNavLink>
                    <StyledNavLink to="/songs">Songs</StyledNavLink>
                    <StyledNavLink to="/memories">Memories</StyledNavLink>
                    <StyledNavLink to="/tags">Tags</StyledNavLink>
                </NavLinks>

                <NavBottom>
                    {user ? (
                        <>
                            <NavUser onClick={onLogout} title="Log out">
                                <NavAvatar>{initials}</NavAvatar>
                                <NavUsername>{user.displayName || 'My Account'}</NavUsername>
                            </NavUser>
                        </>
                    ) : (
                        <ConnectBtn type="button" onClick={handleLoginClick}>
                            Connect Spotify
                        </ConnectBtn>
                    )}
                </NavBottom>
            </NavSidebar>
        </>
    )
}

export default Nav

const NavSidebar = styled.nav`
    width: 220px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    border-right: 1px solid var(--color-border-tertiary);
    background: var(--color-background-primary);
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    transition: transform 0.25s ease;

    @media (max-width: 768px) {
        position: fixed;
        left: 0;
        top: 0;
        padding-top: 4rem;
        z-index: 100;
        transform: translateX(-100%);

        &.is-open {
            transform: translateX(0);
        }
    }
`

const NavLogo = styled.div`
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.75rem;
`

const NoteIcon = styled.span`
    width: 18px;
    height: 18px;
    background: var(--accent);
    -webkit-mask: url(${noteIcon}) center / contain no-repeat;
    mask: url(${noteIcon}) center / contain no-repeat;
    flex-shrink: 0;
    display: block;
`

const NavLinks = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`

const StyledNavLink = styled(NavLink)`
    font-size: 14px;
    color: var(--color-text-secondary);
    text-decoration: none;
    cursor: pointer;
    transition: color 0.1s, background 0.1s;
    padding: 8px 12px;
    border-radius: var(--border-radius-md);
    display: block;

    &:hover {
        color: var(--color-text-primary);
        background: var(--color-background-secondary);
    }

    &.active {
        color: var(--color-text-primary);
        font-weight: 500;
        background: var(--color-background-secondary);
    }
`

const NavBottom = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const NavUser = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    margin-bottom: 4px;
    transition: background 0.1s;

    &:hover {
        background: var(--color-background-secondary);
    }
`

const NavAvatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent-subtle);
    border: 1px solid var(--accent-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent-highlight);
    flex-shrink: 0;
`

const NavUsername = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
`

const ConnectBtn = styled.button`
    width: 100%;
    padding: 9px 0;
    border-radius: var(--border-radius-md);
    font-size: 14px;
    font-weight: 500;
    background: var(--accent);
    color: #0d2b1a;
    border: none;
    cursor: pointer;
    transition: opacity 0.15s;

    &:hover {
        opacity: 0.88;
    }
`

const Hamburger = styled.button`
    display: none;
    position: fixed;
    top: 12px;
    left: 16px;
    z-index: 200;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-md);
    cursor: pointer;

    @media (max-width: 768px) {
        display: flex;
    }
`

const HamburgerIcon = styled.span`
    position: relative;
    width: 16px;
    height: 12px;
    display: block;
`

const HamburgerLine = styled.span`
    position: absolute;
    left: 0;
    width: 16px;
    height: 2px;
    background: var(--color-text-primary);
    border-radius: 1px;
    transition: transform 0.22s ease, opacity 0.18s ease;

    &:nth-child(1) { top: 0; }
    &:nth-child(2) { top: 5px; }
    &:nth-child(3) { bottom: 0; }

    ${Hamburger}.is-open &:nth-child(1) { transform: translateY(5px) rotate(45deg); }
    ${Hamburger}.is-open &:nth-child(2) { opacity: 0; }
    ${Hamburger}.is-open &:nth-child(3) { transform: translateY(-5px) rotate(-45deg); }
`

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 90;
`
