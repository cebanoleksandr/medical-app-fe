import { styled } from '@mui/material/styles'
import { colors, typography } from '../../theme'

export const NARROW = '@media (max-width: 720px)'

/** Numbered block of the Configuration step: "1. Choose Method". */
export const Section = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  '& > h3': {
    margin: 0,
    fontSize: 24,
    lineHeight: '32px',
    fontWeight: 500,
    color: colors.neutral[900],
    transition: 'color 150ms',
  },
  // Not reachable yet: the heading shows what comes next.
  '&[data-locked] > h3': { color: colors.neutral[400] },
})

/** Content of a section, with the accent bar on its left. */
export const Rail = styled('div')({
  display: 'flex',
  gap: 16,
  '&::before': {
    content: '""',
    flexShrink: 0,
    width: 4,
    borderRadius: 4,
    backgroundColor: colors.accent[100],
  },
  '& > *': { flex: 1, minWidth: 0 },
})

export const Stack = styled('div')({ display: 'flex', flexDirection: 'column', gap: 24 })

export const Cards = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
  gap: 16,
  '&[data-size="small"]': {
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  },
})

/** Bold line plus a grey one above a control. */
export const Description = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  '& strong': { ...typography.labelL, color: colors.neutral[900] },
  '& span': { ...typography.bodyM, color: colors.neutral[500] },
})

/** Notice with an icon: warning (default), error or info via `data-tone`. */
export const Banner = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: 16,
  border: `1px solid ${colors.warning}`,
  borderRadius: 8,
  backgroundColor: 'rgba(254, 249, 195, 0.3)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  '& > span:first-of-type': { flexShrink: 0, fontSize: 20, color: colors.warning },
  '& > div': { flex: 1, minWidth: 0 },
  '& strong': { ...typography.labelM, display: 'block', color: colors.warning },
  '& p': { ...typography.bodyS, margin: '8px 0 0', color: colors.neutral[700] },
  '&[data-tone="error"]': {
    borderColor: colors.error,
    backgroundColor: 'rgba(220, 38, 38, 0.03)',
    '& > span:first-of-type, & strong': { color: colors.error },
  },
  '&[data-tone="info"]': {
    alignItems: 'center',
    borderColor: colors.info,
    backgroundColor: colors.infoLight,
    '& > span:first-of-type': { alignSelf: 'flex-start', color: colors.info },
    '& strong': { color: colors.neutral[900] },
  },
  // The action drops below the text, in line with it.
  [NARROW]: {
    flexWrap: 'wrap',
    '& > div': { flexBasis: 'calc(100% - 28px)' },
    '& > button': { marginLeft: 20 },
  },
})
