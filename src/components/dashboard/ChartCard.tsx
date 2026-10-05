import type { ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import frameworksPicture from '../../assets/dashboard/empty/frameworks.svg'
import gearSmall from '../../assets/dashboard/empty/gear-small.svg'
import gear from '../../assets/dashboard/empty/gear.svg'
import gearMagnifier from '../../assets/dashboard/empty/magnifier.svg'
import { colors, shadows, typography } from '../../theme'
import { EmptyEntitiesPicture, LayeredPicture } from '../review/EmptyEntitiesPicture'

const Root = styled('section')({
  // Contains the visually hidden data tables (position: absolute); without
  // it they hang off the document and make the page scroll besides <main>.
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minWidth: 0,
  padding: 16,
  borderRadius: 16,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  // Refetching keeps the previous render, dimmed, instead of a skeleton.
  transition: 'opacity 150ms',
  '&[aria-busy="true"]': { opacity: 0.6 },
})

const Heading = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '& > div': {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: '4px 0 0', color: colors.neutral[500] },
  '& hr': { width: '100%', margin: 0, border: 0, borderTop: `1px solid ${colors.neutral[200]}` },
})

interface ChartCardProps {
  id: string
  title: string
  subtitle: string
  /** Right of the title, e.g. the Documents / Entities switch. */
  action?: ReactNode
  busy?: boolean
  className?: string
  children: ReactNode
}

/** White card with a title, a grey subtitle and a hairline above the chart. */
export function ChartCard({ id, title, subtitle, action, busy, className, children }: ChartCardProps) {
  return (
    <Root className={className} aria-labelledby={id} aria-busy={busy || undefined}>
      <Heading>
        <div>
          <div>
            <h2 id={id}>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {action}
        </div>
        <hr />
      </Heading>
      {children}
    </Root>
  )
}

const EmptyRoot = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  minHeight: 200,
  color: colors.neutral[900],
  '& p': { margin: 0 },
  '& .ChartCard-picture': { width: 100, height: 100 },
})

const ENTITY_TYPES_LAYERS = [
  { src: gear, inset: '37% 37.55% 44.7% 44.16%' },
  { src: gearSmall, inset: '52.09% 51.17% 37.08% 38%' },
  { src: gearMagnifier, inset: '25% 25.2% 23.4% 3.8%' },
]

export type EmptyPicture = 'methods' | 'frameworks' | 'entityTypes'

/** Illustration and "No analyses found" in place of a chart. */
export function EmptyChart({ picture, text = 'No analyses found' }: { picture: EmptyPicture; text?: string }) {
  return (
    <EmptyRoot>
      {picture === 'methods' && <EmptyEntitiesPicture size={100} />}
      {picture === 'frameworks' && (
        <img className="ChartCard-picture" src={frameworksPicture} alt="" />
      )}
      {picture === 'entityTypes' && <LayeredPicture layers={ENTITY_TYPES_LAYERS} size={100} />}
      <p>{text}</p>
    </EmptyRoot>
  )
}
