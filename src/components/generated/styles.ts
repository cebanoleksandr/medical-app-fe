import { styled } from '@mui/material/styles'
import { colors, typography } from '../../theme'
import type { Tone } from './resultModel'

export const TONE_COLOR: Record<Tone, string> = {
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
}

/** Small "Good" / "Fair" marker: a colored dot and the label. */
export const Dot = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  whiteSpace: 'nowrap',
  '&::before': {
    content: '""',
    flexShrink: 0,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--dot)',
  },
})

/** Grey uppercase heading of a drawer or modal section. */
export const SectionLabel = styled('h3')({
  ...typography.labelS,
  margin: 0,
  paddingBottom: 8,
  color: colors.neutral[400],
  textTransform: 'uppercase',
})

export const Divider = styled('hr')({
  width: '100%',
  margin: 0,
  border: 0,
  borderTop: `1px solid ${colors.neutral[200]}`,
})

/** Key on the left, value on the right. */
export const MetaRow = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  '& > dt': { flexShrink: 0, color: colors.neutral[500] },
  '& > dd': {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    margin: 0,
    minWidth: 0,
    color: colors.neutral[900],
    textAlign: 'right',
    overflowWrap: 'anywhere',
  },
})

export const MetaList = styled('dl')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  margin: 0,
})

export const Checklist = styled('ul')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

/** Checkbox and its label; the label darkens once checked. */
export const CheckboxOption = styled('label')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: 'fit-content',
  minWidth: 0,
  color: colors.neutral[500],
  cursor: 'pointer',
  '&:has(input:checked)': { color: colors.neutral[700] },
  '&:has(input:disabled)': { cursor: 'default' },
  '& .MuiCheckbox-root': { padding: 0, borderRadius: 2 },
})
