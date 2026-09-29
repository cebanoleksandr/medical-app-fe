import type { ReactNode } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import { styled } from '@mui/material/styles'
import { colors, typography } from '../../theme'

export interface StepperStep {
  label: string
  icon: ReactNode
}

export interface StepperProps {
  steps: StepperStep[]
  /** Index of the current step; earlier steps show as completed. */
  activeStep: number
  className?: string
}

type StepState = 'completed' | 'active' | 'upcoming'

const List = styled('ol')({
  display: 'flex',
  alignItems: 'center',
  gap: 24,
  margin: 0,
  // Room for the labels, which hang below the circles.
  padding: '0 0 32px',
  listStyle: 'none',
})

const Step = styled('li', {
  shouldForwardProp: (prop) => prop !== 'state',
})<{ state: StepState }>(({ state }) => {
  const isActive = state === 'active'
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: isActive ? 60 : 32,
    height: isActive ? 60 : 32,
    borderRadius: '50%',
    fontSize: isActive ? 32 : 24,
    opacity: state === 'completed' ? 0.8 : 1,
    backgroundColor: state === 'upcoming' ? colors.neutral[300] : colors.primary[500],
    border: isActive ? `1px solid ${colors.accent[400]}` : undefined,
    color: isActive ? colors.accent[400] : colors.white,
    '& > svg': { fontSize: 'inherit' },
    '& .Stepper-label': {
      ...(isActive ? typography.labelL : typography.labelM),
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      color: state === 'upcoming' ? colors.neutral[400] : colors.primary[500],
      whiteSpace: 'nowrap',
    },
  }
})

const Trail = styled('li', {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ completed }) => ({
  flexShrink: 0,
  width: 100,
  height: completed ? 2 : 1,
  borderRadius: 1,
  backgroundColor: completed ? colors.primary[500] : colors.neutral[200],
}))

/** Horizontal wizard stepper: completed steps get a check mark. */
export function Stepper({ steps, activeStep, className }: StepperProps) {
  return (
    <List className={className}>
      {steps.map((step, index) => {
        const state: StepState =
          index < activeStep ? 'completed' : index === activeStep ? 'active' : 'upcoming'
        return [
          index > 0 && (
            <Trail key={`trail-${index}`} aria-hidden completed={index <= activeStep} />
          ),
          <Step
            key={step.label}
            state={state}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            {state === 'completed' ? <CheckIcon /> : step.icon}
            <span className="Stepper-label">{step.label}</span>
          </Step>,
        ]
      })}
    </List>
  )
}
