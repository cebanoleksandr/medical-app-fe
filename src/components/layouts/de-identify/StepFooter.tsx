import type { ReactNode } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../ui'
import { useDeIdentify } from './context'
import { stepUrl, steps } from './steps'

export interface StepFooterProps {
  /** Defaults to going to the next step. */
  onContinue?: () => void
  continueDisabled?: boolean
  continueLabel?: string
  /** Defaults to an arrow. */
  continueIcon?: ReactNode
  /** Replaces the Back button, e.g. "New analysis" on the last step. */
  start?: ReactNode
  /** Replaces the Continue button. */
  end?: ReactNode
}

/**
 * Bottom action bar of the de-identify wizard. Each step renders it with its
 * own state; it is portalled into DeIdentifyLayout's footer.
 */
export function StepFooter({
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  continueIcon = <ArrowForwardIcon />,
  start,
  end,
}: StepFooterProps) {
  const { footerSlot, stepIndex } = useDeIdentify()
  const navigate = useNavigate()
  if (!footerSlot) return null

  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  return createPortal(
    <>
      {start ?? (
        <Button
          variant="ghostSecondary"
          startIcon={<ArrowBackIcon />}
          disabled={isFirst}
          onClick={() => navigate(stepUrl(stepIndex - 1))}
        >
          Back
        </Button>
      )}
      {end ?? (
        <Button
          variant="secondary"
          endIcon={continueIcon}
          disabled={continueDisabled || (isLast && !onContinue)}
          onClick={onContinue ?? (() => navigate(stepUrl(stepIndex + 1)))}
        >
          {continueLabel}
        </Button>
      )}
    </>,
    footerSlot,
  )
}
