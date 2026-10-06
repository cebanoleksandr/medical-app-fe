import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { colors } from '../../theme'
import { Stepper } from '../ui'
import type { DeIdentifyContext } from './de-identify/context'
import { resumeUrl, useDraftStore } from './de-identify/draftStore'
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
  const { t } = useTranslation('app')
  const { pathname } = useLocation()
  const [footerSlot, setFooterSlot] = useState<HTMLElement | null>(null)
  const { draft, updateDraft, resetDraft } = useDraftStore()
  const stepIndex = steps.findIndex(
    (step) => pathname === `${DE_IDENTIFY_BASE}/${step.path}`,
  )

  // /app/de-identify (the sidebar link) resumes where the draft left off.
  if (stepIndex === -1) return <Navigate to={resumeUrl(draft)} replace />

  return (
    <Root>
      <StepperBar>
        <Stepper
          steps={steps.map((step) => ({ ...step, label: t(step.label) }))}
          activeStep={stepIndex}
        />
      </StepperBar>
      <Body>
        <Outlet
          context={
            { footerSlot, stepIndex, draft, updateDraft, resetDraft } satisfies DeIdentifyContext
          }
        />
      </Body>
      <Footer ref={setFooterSlot} />
    </Root>
  )
}

export default DeIdentifyLayout;
