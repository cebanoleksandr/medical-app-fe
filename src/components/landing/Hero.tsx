import { Fragment } from 'react'
import { keyframes, styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import heroImage from '../../assets/landing/hero.png'
import { GetStartedButton } from '../layouts/landing/GetStartedButton'
import { Container, NARROW, TABLET } from '../layouts/landing/styles'
import { colors, typography } from '../../theme'
import { fadeUp, stagger } from './motion'

const trust = ['HIPAA Compliant', 'GDPR Certified', '99.9% Accuracy']

// Slow drift of the background waves.
const drift = keyframes({
  from: { transform: 'scale(1.04) translate3d(-1%, 0, 0)' },
  to: { transform: 'scale(1.04) translate3d(1%, -1.5%, 0)' },
})

const Root = styled('section')({
  position: 'relative',
  overflow: 'hidden',
  isolation: 'isolate',
  display: 'flex',
  alignItems: 'center',
  minHeight: 820,
  paddingBottom: 140,
  // The waves sit in the lower part of the image; keep them below the text.
  [TABLET]: { minHeight: 680, paddingBottom: 160 },
  [NARROW]: { minHeight: 600, paddingTop: 48, paddingBottom: 180 },
  // On a pseudo-element so it can move without shifting the text.
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    background: `url("${heroImage}") center / cover no-repeat`,
    animation: `${drift} 14s ease-in-out infinite alternate`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
})

const Inner = styled(motion.create(Container))({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  '& h1': {
    ...typography.h1,
    maxWidth: 720,
    margin: 0,
    color: colors.white,
    [NARROW]: { fontSize: '32px', lineHeight: '40px' },
  },
  '& .Hero-lead': {
    ...typography.h4,
    maxWidth: 560,
    margin: '16px 0 0',
    color: colors.neutral[300],
    opacity: 0.8,
    // The design breaks the line on desktop only.
    '& br': { [NARROW]: { display: 'none' } },
  },
})

const Cta = styled(motion.div)({ paddingTop: 32 })

const Trust = styled(motion.ul)({
  ...typography.labelM,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
  margin: 0,
  padding: '24px 0 0',
  listStyle: 'none',
  color: colors.neutral[400],
  [NARROW]: { gap: '8px 16px' },
  '& .Hero-dot': {
    // Dots would dangle at line ends once the row wraps.
    [NARROW]: { display: 'none' },
    width: 2,
    height: 2,
    borderRadius: '50%',
    backgroundColor: colors.neutral[500],
  },
})

export function Hero() {
  return (
    <Root>
      {/* Plays on load rather than on scroll: the hero is always in view. */}
      <Inner initial="hidden" animate="visible" variants={stagger(0.12, 0.15)}>
        <motion.h1 variants={fadeUp}>
          Clinical Data De-Identification &amp; Synthesis Studio
        </motion.h1>
        <motion.p className="Hero-lead" variants={fadeUp}>
          Enterprise-grade PII detection and anonymization{' '}
          <br />
          for healthcare organizations
        </motion.p>
        <Cta variants={fadeUp}>
          <GetStartedButton />
        </Cta>
        <Trust variants={fadeUp}>
          {trust.map((item, index) => (
            <Fragment key={item}>
              {index > 0 && <li className="Hero-dot" aria-hidden />}
              <li>{item}</li>
            </Fragment>
          ))}
        </Trust>
      </Inner>
    </Root>
  )
}
