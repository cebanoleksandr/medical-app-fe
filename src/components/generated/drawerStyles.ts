import { styled } from '@mui/material/styles'
import { colors, shadows } from '../../theme'
import { DialogHeader } from './parts'

/** Right-hand drawer body: 400px wide, full height. */
export const DrawerPanel = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: 'min(400px, 100vw)',
  minHeight: '100%',
  backgroundColor: colors.white,
  boxShadow: shadows.lg,
})

export const DrawerHeader = styled(DialogHeader)({
  flexShrink: 0,
  minHeight: 98,
  padding: '0 20px',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  '& > div': { gap: 0 },
})

export const DrawerContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  padding: 20,
})

/** A block of the drawer, separated from the next by a hairline. */
export const DrawerSection = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '16px 0',
  borderBottom: `1px solid ${colors.neutral[100]}`,
  '&:last-of-type': { borderBottom: 0 },
})
