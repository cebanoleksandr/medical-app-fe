import type { ChangeEvent } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import { styled } from '@mui/material/styles'
import { colors, radius, shadows, typography } from '../../theme'

export interface ComplianceCardProps {
  /** Radio group name; cards with the same name select one at a time. */
  name: string
  value: string
  title: string
  description: string
  badge: string
  checked: boolean
  onChange: (value: string) => void
}

// A <label> around a visually hidden radio: clicking anywhere selects it and
// arrow keys move between cards, like any radio group.
const Root = styled('label')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 16,
  minHeight: 156,
  padding: 20,
  border: `1.5px solid ${colors.neutral[200]}`,
  borderRadius: 12,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  color: colors.primary[500],
  cursor: 'pointer',
  transition: 'border-color 150ms, background-color 150ms, box-shadow 150ms',
  '&:hover': { borderColor: colors.primary[200] },
  '&:has(input:checked)': {
    // 2px in the design; the extra half pixel is an inset shadow so the
    // content doesn't shift when the card gets selected.
    borderColor: colors.primary[500],
    boxShadow: `inset 0 0 0 0.5px ${colors.primary[500]}, ${shadows.sm}`,
    backgroundColor: colors.primary[50],
  },
  '&:has(input:focus-visible)': {
    outline: `2px solid ${colors.accent[400]}`,
    outlineOffset: 2,
  },
  '& input': {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  '& .ComplianceCard-title': {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    ...typography.h4,
    '& > svg': { flexShrink: 0, fontSize: 24 },
  },
  '& .ComplianceCard-description': { ...typography.bodyS, display: 'block' },
  '& .ComplianceCard-badge': {
    ...typography.labelS,
    alignSelf: 'flex-start',
    padding: '2px 8px',
    border: `1px solid ${colors.primary[300]}`,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    transition: 'background-color 150ms',
  },
  '&:has(input:checked) .ComplianceCard-badge': { backgroundColor: colors.primary[100] },
})

/** Selectable compliance framework card from the first wizard step. */
export function ComplianceCard({
  name,
  value,
  title,
  description,
  badge,
  checked,
  onChange,
}: ComplianceCardProps) {
  return (
    <Root>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
      <span>
        <span className="ComplianceCard-title">
          {title}
          {checked && <CheckIcon aria-hidden />}
        </span>
        <span className="ComplianceCard-description">{description}</span>
      </span>
      <span className="ComplianceCard-badge">{badge}</span>
    </Root>
  )
}
