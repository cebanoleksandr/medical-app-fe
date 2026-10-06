import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EASE_OUT } from '../../landing/motion'
import { colors, typography } from '../../../theme'
import { GetStartedButton } from './GetStartedButton'
import { Logo } from './Logo'
import { Container, NARROW, landingBorder } from './styles'

const Root = styled(motion.header)({
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
  position: 'relative',
  color: colors.neutral[200],
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'color 150ms',
  // Underline that grows from the left on hover and stays on the current page.
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 1,
    backgroundColor: colors.accent[400],
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 250ms ease-out',
  },
  '&:hover, &.active': { color: colors.accent[400] },
  '&:hover::after, &.active::after': { transform: 'scaleX(1)' },
  '@media (prefers-reduced-motion: reduce)': { '&::after': { transition: 'none' } },
})

export function LandingHeader() {
  const { t } = useTranslation('landing')
  return (
    <Root
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      <Inner>
        <Logo />
        <Nav aria-label={t('nav.label')}>
          <Link to="/" end>
            {t('nav.solutions')}
          </Link>
          <Link to="/contact-us">{t('nav.contact')}</Link>
        </Nav>
        <GetStartedButton size="medium" />
      </Inner>
    </Root>
  )
}
