import type { ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import { colors, radius, typography } from '../../theme'

export type Status = 'completed' | 'processing' | 'failed'

export interface StatusBadgeProps {
  status: Status
  /** Defaults to the English status name. */
  children?: ReactNode
  className?: string
}

const palette: Record<Status, { background: string; color: string }> = {
  completed: { background: colors.successLight, color: colors.success },
  // Figma: warning-light at 30% opacity.
  processing: { background: 'rgba(254, 249, 195, 0.3)', color: colors.warning },
  failed: { background: colors.errorLight, color: colors.error },
}

const defaultLabels: Record<Status, string> = {
  completed: 'Completed',
  processing: 'Processing',
  failed: 'Failed',
}

const Root = styled('span')({
  ...typography.labelM,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  height: 28,
  padding: '0 12px',
  borderRadius: radius.full,
  whiteSpace: 'nowrap',
  '&::before': {
    content: '""',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
})

/** Job status pill: Completed / Processing / Failed. */
export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Root className={className} style={palette[status]}>
      {children ?? defaultLabels[status]}
    </Root>
  )
}
