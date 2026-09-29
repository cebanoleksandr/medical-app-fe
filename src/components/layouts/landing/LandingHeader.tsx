import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { styled } from '@mui/material/styles'
import { NavLink, useNavigate } from 'react-router-dom'
import { colors, typography } from '../../../theme'
import { Button } from '../../ui'
import { Logo } from './Logo'
import { Container, NARROW, landingBorder } from './styles'

const Root = styled('header')({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  borderBottom: landingBorder,
  backgroundColor: colors.primary[800],
})

const Inner = styled(Container)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  height: 72,
  [NARROW]: {
    flexWrap: 'wrap',
    height: 'auto',
    gap: 12,
    rowGap: 0,
    paddingBlock: 12,
  },
})

const Nav = styled('nav')({
  display: 'flex',
  alignItems: 'center',
  gap: 32,
  padding: 10,
  [NARROW]: {
    order: 1,
    width: '100%',
    justifyContent: 'center',
  },
})

const Link = styled(NavLink)({
  ...typography.labelM,
  color: colors.neutral[200],
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'color 150ms',
  '&:hover, &.active': { color: colors.accent[400] },
})

export function LandingHeader() {
  const navigate = useNavigate()

  return (
    <Root>
      <Inner>
        <Logo />
        <Nav aria-label="Main">
          <Link to="/" end>
            Solutions
          </Link>
          <Link to="/contact-us">Contact Us</Link>
        </Nav>
        {/* Signed-in users get sent on to /app by the auth loader. */}
        <Button
          size="medium"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/auth/login')}
        >
          Get started
        </Button>
      </Inner>
    </Root>
  )
}
