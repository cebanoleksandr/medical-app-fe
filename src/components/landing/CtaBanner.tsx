import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import bannerImage from '../../assets/landing/cta-banner.png'
import { GetStartedButton } from '../layouts/landing/GetStartedButton'
import { Container, NARROW, sectionPadding, sectionTitle } from '../layouts/landing/styles'
import { colors, typography } from '../../theme'
import { fadeUp, reveal, scaleIn, stagger } from './motion'

const Root = styled('section')({
  ...sectionPadding,
  background: `${colors.primary[800]} url("${bannerImage}") center / cover no-repeat`,
})

const Card = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 32,
  maxWidth: 880,
  margin: '0 auto',
  padding: '32px 24px',
  [NARROW]: { gap: 24, padding: '32px 16px' },
  border: `1px solid ${colors.accent[200]}`,
  borderRadius: 16,
  background:
    'linear-gradient(102.75deg, rgba(0, 0, 0, 0) 17.09%, rgba(0, 191, 165, 0.2) 123.06%), rgba(1, 19, 47, 0.7)',
  backdropFilter: 'blur(0.45px)',
  textAlign: 'center',
  '& h2': { ...sectionTitle, margin: 0, color: colors.white },
  '& p': {
    ...typography.labelL,
    maxWidth: 600,
    margin: 0,
    color: 'rgba(255, 255, 255, 0.8)',
  },
})

export function CtaBanner() {
  return (
    <Root>
      <Container>
        <Card {...reveal} variants={scaleIn}>
          <motion.div
            variants={stagger(0.12, 0.2)}
            style={{ display: 'contents' }}
          >
            <motion.h2 variants={fadeUp}>Ready to Protect Your Clinical Data?</motion.h2>
            <motion.p variants={fadeUp}>
            Start de-identifying and synthesizing healthcare data in minutes with our
            enterprise-grade platform
            </motion.p>
            <motion.div variants={fadeUp}>
              <GetStartedButton />
            </motion.div>
          </motion.div>
        </Card>
      </Container>
    </Root>
  )
}
