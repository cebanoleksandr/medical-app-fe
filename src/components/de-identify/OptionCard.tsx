import type { ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import { colors, typography } from '../../theme'
import { Radio } from '../ui'

export interface OptionCardProps {
  /** Radio group name; cards with the same name select one at a time. */
  name: string
  value: string
  title: string
  checked: boolean
  onChange: () => void
  /** Text under the title. */
  children?: ReactNode
  /** Pill in the top-right corner, e.g. "Recommended". */
  badge?: string
  /** `compact`: 16px padding instead of 20, as in the sensitivity row. */
  compact?: boolean
}

// A <label> around the radio: clicking anywhere on the card selects it.
const Root = styled('label')({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  minWidth: 0,
  padding: 20,
  border: `2px solid ${colors.neutral[100]}`,
  borderRadius: 8,
  backgroundColor: '#FCFCFD',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  cursor: 'pointer',
  transition: 'border-color 150ms, background-color 150ms',
  '&[data-compact]': { padding: 16 },
  '&:hover': { borderColor: colors.neutral[200] },
  '&[data-checked]': {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
    cursor: 'default',
    '& .OptionCard-title': { color: colors.primary[500] },
  },
})

const Body = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  flex: 1,
  minWidth: 0,
  paddingTop: 8,
})

const TitleRow = styled('span')({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
})

const Title = styled('span')({
  ...typography.h4,
  color: colors.neutral[500],
  transition: 'color 150ms',
})

const Badge = styled('span')({
  ...typography.labelS,
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  height: 28,
  // The radio's 8px padding pulls the card's content down; the badge sits
  // level with the radio instead of the title.
  marginTop: -8,
  padding: '0 12px',
  borderRadius: 9999,
  backgroundColor: colors.accent[50],
  color: colors.accent[500],
  whiteSpace: 'nowrap',
})

const Details = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
})

/** Selectable card with a radio button: HIPAA method, detection sensitivity. */
export function OptionCard({
  name,
  value,
  title,
  checked,
  onChange,
  children,
  badge,
  compact = false,
}: OptionCardProps) {
  return (
    <Root data-checked={checked || undefined} data-compact={compact || undefined}>
      <Radio name={name} value={value} checked={checked} onChange={onChange} />
      <Body>
        <TitleRow>
          <Title className="OptionCard-title">{title}</Title>
          {badge && <Badge>{badge}</Badge>}
        </TitleRow>
        {children && <Details>{children}</Details>}
      </Body>
    </Root>
  )
}
