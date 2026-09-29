import { styled } from '@mui/material/styles'
import { colors, typography } from '../../../theme'
import { Logo } from './Logo'
import { Container, landingBorder } from './styles'

const Root = styled('footer')({
  padding: '64px 0 32px',
  borderTop: landingBorder,
  backgroundColor: colors.primary[800],
})

const Brand = styled('div')({
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

const Copyright = styled('p')({
  ...typography.labelS,
  margin: 0,
  paddingTop: 32,
  color: colors.neutral[500],
  textAlign: 'right',
})

export function LandingFooter() {
  return (
    <Root>
      <Container>
        <Brand>
          <Logo />
          <p>
            Enterprise-grade clinical data de-identification and synthetic data
            generation platform
          </p>
        </Brand>
        <Copyright>
          © {new Date().getFullYear()} Clinical Data Studio. All rights reserved.
        </Copyright>
      </Container>
    </Root>
  )
}
