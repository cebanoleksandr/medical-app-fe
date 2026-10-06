import { styled } from '@mui/material/styles'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo-landing.svg'
import fourLeft from '../assets/not-found/four-left.svg'
import fourRight from '../assets/not-found/four-right.svg'
import magnifier from '../assets/not-found/magnifier.svg'
import { Button } from '../components/ui'
import { colors, typography } from '../theme'

const Root = styled('main')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '48px 16px',
  backgroundColor: colors.primary[800],
  textAlign: 'center',
})

const Brand = styled(Link)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
  color: colors.white,
  textDecoration: 'none',
  textAlign: 'left',
  '& img': { width: 32, height: 34, flexShrink: 0 },
  '& strong': { ...typography.h3, display: 'block' },
  '& span': { ...typography.labelS, display: 'block' },
})

const Content = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'clamp(48px, 13vh, 121px)',
  width: '100%',
  paddingTop: 48,
})

// Figma: 563 × 248; each layer's inset includes its glow, so it may overflow.
const Picture = styled('div')({
  position: 'relative',
  width: 'min(563px, 100%)',
  aspectRatio: '563.426 / 247.787',
  '& span': { position: 'absolute' },
  '& img': { display: 'block', width: '100%', height: '100%', maxWidth: 'none' },
})

const LAYERS = [
  { src: fourLeft, box: '11.44% 75.23% 16.84% 0', glow: '-15.19% -19.34%' },
  { src: fourRight, box: '11.44% 0 16.84% 75.23%', glow: '-13.5% -17.19%' },
  { src: magnifier, box: '0 25.81% 0 27.81%', glow: '-20.95% -19.85% -20.9% -19.86%' },
]

const Text = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 33,
  maxWidth: 480,
  '& h1': { ...typography.h2, margin: 0, color: colors.accent[100] },
  '& p': { ...typography.labelL, margin: 0, color: colors.neutral[400] },
  '@media (max-width: 480px)': { '& h1': typography.h3 },
})

/** Any unknown URL: a big 404, a short note and a way back home. */
const NotFoundPage = () => {
  const { t } = useTranslation(['app', 'common'])
  const navigate = useNavigate()
  return (
    <Root>
      <Brand to="/" aria-label={t('common:brand.home')}>
        <img src={logo} alt="" />
        <div>
          <strong>{t('common:brand.name')}</strong>
          <span>{t('common:brand.tagline')}</span>
        </div>
      </Brand>
      <Content>
        <Picture aria-hidden>
          {LAYERS.map(({ src, box, glow }) => (
            <span key={src} style={{ inset: box }}>
              <span style={{ inset: glow }}>
                <img src={src} alt="" />
              </span>
            </span>
          ))}
        </Picture>
        <Text>
          <h1>{t('notFound.title')}</h1>
          <p>
            <Trans t={t} i18nKey="notFound.description" />
          </p>
          <Button variant="primary" size="medium" onClick={() => navigate('/')}>
            {t('notFound.home')}
          </Button>
        </Text>
      </Content>
    </Root>
  )
}

export default NotFoundPage;
