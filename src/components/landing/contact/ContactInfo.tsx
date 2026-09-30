import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import mailIcon from '../../../assets/landing/mail.svg'
import shieldIcon from '../../../assets/landing/shield.svg'
import { Logo } from '../../layouts/landing/Logo'
import { colors, typography } from '../../../theme'
import { TABLET } from '../../layouts/landing/styles'
import { drawLine, fadeUp, reveal, stagger } from '../motion'
import { CONTACT_EMAIL, contactBorder } from './styles'

const Root = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 40,
  flex: 1,
  minWidth: 0,
  padding: 24,
  // Stacked under the page header, the logo just repeats the site header.
  [TABLET]: { gap: 24, padding: 0, '& .ContactInfo-logo': { display: 'none' } },
})

const Heading = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  '& h3': {
    fontSize: 24,
    lineHeight: '32px',
    fontWeight: 500,
    margin: 0,
    color: colors.white,
  },
  '& p': { ...typography.labelM, margin: 0, color: colors.neutral[500] },
})

const Divider = styled(motion.hr)({
  alignSelf: 'stretch',
  margin: 0,
  border: 0,
  borderTop: contactBorder,
})

const Row = styled(motion.div)({
  ...typography.bodyM,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 10,
  '& img': { flexShrink: 0 },
  '& a': { color: colors.white, textDecoration: 'none', transition: 'color 150ms' },
  '& a:hover': { color: colors.accent[400] },
})

export function ContactInfo() {
  return (
    <Root {...reveal} variants={stagger(0.1)}>
      <motion.div className="ContactInfo-logo" variants={fadeUp}>
        <Logo />
      </motion.div>
      <Heading variants={fadeUp}>
        <h3>Have questions about data anonymization or compliance?</h3>
        <p>
          Our team of experts is ready to help you navigate HIPAA, GDPR, and other
          privacy regulations.
        </p>
      </Heading>
      <Divider variants={drawLine} />
      <Row variants={fadeUp}>
        <img src={mailIcon} alt="" />
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </Row>
      {/* Pinned to the bottom of the panel. */}
      <Row variants={fadeUp} style={{ marginTop: 'auto', color: 'rgba(255, 255, 255, 0.7)' }}>
        <img src={shieldIcon} alt="" />
        We respond within 24 hours
      </Row>
    </Root>
  )
}
