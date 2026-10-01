import { useCallback, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { colors } from '../../theme'
import { Stepper } from '../ui'
import type { DeIdentifyContext, DeIdentifyDraft, DraftPatch } from './de-identify/context'
import { DE_IDENTIFY_BASE, steps } from './de-identify/steps'

// Fills AppLayout's content area: stepper and footer stay put, the step scrolls.
const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
})

const StepperBar = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  flexShrink: 0,
  padding: '16px 48px',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  backgroundColor: colors.white,
  overflowX: 'auto',
})

const Body = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
})

const Footer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexShrink: 0,
  padding: '16px 48px',
  borderTop: `1px solid ${colors.neutral[200]}`,
  backgroundColor: colors.white,
  // Steps without a StepFooter get no bar.
  '&:empty': { display: 'none' },
})

const DeIdentifyLayout = () => {
  const { pathname } = useLocation()
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null)
  const [draft, setDraft] = useState<DeIdentifyDraft>({})
  const updateDraft = useCallback(
    (patch: DraftPatch) =>
      setDraft((prev) => {
        const changes = typeof patch === 'function' ? patch(prev) : patch
        // An analysis only matches the settings it was run with.
        return { ...prev, ...changes, analysis: changes.analysis }
      }),
    [],
  )
  const stepIndex = steps.findIndex(
    (step) => pathname === `${DE_IDENTIFY_BASE}/${step.path}`,
  )

  if (stepIndex === -1) return <Navigate to={`${DE_IDENTIFY_BASE}/${steps[0].path}`} replace />

  return (
    <Root>
      <StepperBar>
        <Stepper steps={steps} activeStep={stepIndex} />
      </StepperBar>
      <Body>
        <Outlet
          context={{ footerSlot, stepIndex, draft, updateDraft } satisfies DeIdentifyContext}
        />
      </Body>
      <Footer ref={setFooterSlot} />
    </Root>
  )
}

export default DeIdentifyLayout;
