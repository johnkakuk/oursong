import styled from 'styled-components'
import noteIcon from '../images/np_notes_2825949_000000.svg'

function Login() {
    const handleConnect = () => {
        const base = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : ''
        window.location.href = `${base}/api/v1/auth/spotify`
    }

    return (
        <Page>
            <Card>
                <Logo>
                    <NoteIcon aria-hidden="true" />
                    OurSong
                </Logo>
                <Tagline>Your private music memory board.</Tagline>
                <Description>
                    Connect your Spotify account to start saving songs and the memories that go with them.
                </Description>
                <ConnectBtn type="button" onClick={handleConnect}>
                    Log In With Spotify
                </ConnectBtn>
            </Card>
        </Page>
    )
}

export default Login

const Page = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
`

const Card = styled.div`
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-tertiary);
    border-radius: var(--border-radius-lg);
    padding: 3rem 2.5rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`

const Logo = styled.div`
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 0.25rem;
`

const NoteIcon = styled.span`
    width: 22px;
    height: 22px;
    background: var(--accent);
    -webkit-mask: url(${noteIcon}) center / contain no-repeat;
    mask: url(${noteIcon}) center / contain no-repeat;
    flex-shrink: 0;
    display: block;
`

const Tagline = styled.p`
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0;
`

const Description = styled.p`
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
`

const ConnectBtn = styled.button`
    margin-top: 0.5rem;
    padding: 11px 24px;
    border-radius: var(--border-radius-md);
    font-size: 15px;
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
