import { styled } from '@mui/material/styles'
import { motion, type Variants } from 'framer-motion'
import { colors, typography } from '../../theme'

/** One screen inside the auth card; keeps the card's 24px rhythm. */
export const View = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
})

export const Headline = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '& h1': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
  '& strong': { ...typography.labelM, color: colors.neutral[900] },
})

/** Centered status screen: icon, headline, text. */
export const Status = styled(View)({
  alignItems: 'stretch',
  textAlign: 'center',
  '& .Auth-icon': { alignSelf: 'center' },
})

export const swap: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const swapProps = { variants: swap, initial: 'initial', animate: 'animate', exit: 'exit' } as const

/** Full-width card CTA; disabled is a flat grey block, as on the sign-in screen. */
export const ctaSx = {
  width: '100%',
  '&.Mui-disabled': {
    backgroundColor: colors.neutral[200],
    borderColor: 'transparent',
    color: colors.neutral[400],
  },
} as const

/** Quiet grey "Back" action under the card's CTA. */
export const backSx = {
  alignSelf: 'center',
  color: colors.neutral[500],
  '&:hover': { color: colors.neutral[700] },
} as const

export const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  // TextField reserves 20px for its error line; 4px more makes the card's 24.
  gap: 4,
})
