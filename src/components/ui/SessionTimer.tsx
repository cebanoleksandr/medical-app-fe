import AlarmIcon from '@mui/icons-material/AlarmOutlined'
import { styled } from '@mui/material/styles'
import { colors, radius, typography } from '../../theme'

/** Below this the timer turns red. */
const CRITICAL_BELOW_SECONDS = 2 * 60

export interface SessionTimerProps {
  secondsLeft: number
  className?: string
}

const Root = styled('span', {
  shouldForwardProp: (prop) => prop !== 'critical',
})<{ critical: boolean }>(({ critical }) => {
  const color = critical ? colors.error : colors.warning
  return {
    ...typography.labelM,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    border: `1px solid ${color}`,
    borderRadius: radius.full,
    backgroundColor: critical ? colors.errorLight : colors.warningLight,
    color,
    fontVariantNumeric: 'tabular-nums',
    '& > svg': { fontSize: 14 },
  }
})

function format(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

/**
 * Countdown until data expires: amber, then red under 2 minutes. The caller
 * decides when to show it (the design uses it from 10 minutes left).
 */
export function SessionTimer({ secondsLeft, className }: SessionTimerProps) {
  return (
    <Root className={className} critical={secondsLeft < CRITICAL_BELOW_SECONDS} role="timer">
      <AlarmIcon aria-hidden />
      {format(secondsLeft)}
    </Root>
  )
}
