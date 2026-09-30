import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { TABLET, sectionTitle } from '../layouts/landing/styles'
import { colors, typography } from '../../theme'
import { fadeUp, reveal, stagger } from './motion'

const Root = styled(motion.div)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  width: '100%',
  '& h2': { ...sectionTitle, flex: 1, margin: 0, color: colors.white },
  '& p': {
    ...typography.h4,
    maxWidth: 494,
    margin: 0,
    color: colors.neutral[500],
    textAlign: 'right',
  },
  [TABLET]: {
    flexDirection: 'column',
    '& p': { maxWidth: 640, textAlign: 'left' },
  },
})

/** Section title on the left, short description on the right. */
export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <Root {...reveal} variants={stagger(0.12)}>
      <motion.h2 variants={fadeUp}>{title}</motion.h2>
      <motion.p variants={fadeUp}>{description}</motion.p>
    </Root>
  )
}
