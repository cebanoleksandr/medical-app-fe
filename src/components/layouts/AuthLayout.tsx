import { styled } from '@mui/material/styles'
import { Link, Outlet } from 'react-router-dom'
import logo from '../../assets/logo-landing.svg'
import { colors, radius, shadows, typography } from '../../theme'

const HEADER_HEIGHT = 111

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  // Dark band behind the logo and the top of the card.
  background: `linear-gradient(${colors.primary[800]} 450px, ${colors.neutral[50]} 450px)`,
})

const Header = styled('header')({
  display: 'flex',
  justifyContent: 'center',
  flexShrink: 0,
  height: HEADER_HEIGHT,
  paddingTop: 48,
})

const LogoLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  color: colors.white,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  '& img': { width: 32, height: 34, flexShrink: 0 },
  '& .AuthLayout-title': typography.h3,
  '& .AuthLayout-subtitle': typography.labelS,
})

const Main = styled('main')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  width: '100%',
  // Mirrors the header so the card sits in the middle of the viewport.
  padding: `24px 16px ${HEADER_HEIGHT}px`,
})

const Card = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: '100%',
  maxWidth: 440,
  padding: 48,
  borderRadius: radius.xl,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
  '@media (max-width: 480px)': { padding: 24 },
})

/** Sign-in screens: logo on a dark band and the page in a centered card. */
const AuthLayout = () => {
  return (
    <Root>
      <Header>
        <LogoLink to="/">
          <img src={logo} alt="" />
          <span>
            <div className="AuthLayout-title">De-ID Studio</div>
            <div className="AuthLayout-subtitle">De-ID &amp; Synthesis</div>
          </span>
        </LogoLink>
      </Header>
      <Main>
        <Card>
          <Outlet />
        </Card>
      </Main>
    </Root>
  )
}

export default AuthLayout;
