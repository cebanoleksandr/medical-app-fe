import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { fadeUp, reveal } from '../../landing/motion'
import { colors, typography } from '../../../theme'
import { Logo } from './Logo'
import { Container, landingBorder } from './styles'

const Root = styled('footer')({
  padding: '64px 0 32px',
  borderTop: landingBorder,
  backgroundColor: colors.primary[800],
})

const Brand = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 16,
  '& p': {
    ...typography.labelS,
    maxWidth: 300,
    margin: 0,
    color: colors.neutral[400],
  },
})

const Copyright = styled(motion.p)({
  ...typography.labelS,
  margin: 0,
  paddingTop: 32,
  color: colors.neutral[500],
  textAlign: 'right',
})

export function LandingFooter() {
  const { t } = useTranslation('landing')
  return (
    <Root>
      <Container>
        <Brand {...reveal} variants={fadeUp}>
          <Logo />
          <p>{t('footer.about')}</p>
        </Brand>
        <Copyright {...reveal} variants={fadeUp}>
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </Copyright>
      </Container>
    </Root>
  )
}
