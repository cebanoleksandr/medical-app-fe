import { styled } from '@mui/material/styles'
import type { DetectedEntity } from '../../api/types'
import warningIcon from '../../assets/configuration/warning.svg'
import arrowIcon from '../../assets/review/arrow-small.svg'
import { colors, shadows, typography } from '../../theme'
import { EntityTypeLabel, MaskIcon, StatusButton } from '../ui'
import { categoryOf } from './reviewModel'

export interface EntityRowProps {
  entity: DetectedEntity
  onToggle: () => void
  /** Briefly highlighted after a click on the entity in the document. */
  flash?: boolean
}

const Root = styled('li')({
  display: 'grid',
  gridTemplateColumns: '62px minmax(0, 1fr) auto',
  alignItems: 'start',
  gap: 12,
  padding: 12,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  transition: 'background-color 150ms, box-shadow 300ms',
  '&[data-review]': {
    borderColor: 'transparent',
    backgroundColor: 'rgba(254, 249, 195, 0.3)',
  },
  '&[data-excluded]': {
    borderColor: 'transparent',
    backgroundColor: colors.neutral[50],
    '& .EntityTypeLabel-icon, & .EntityTypeLabel-text, & .EntityRow-value': {
      color: colors.neutral[400],
    },
  },
  '&[data-flash]': { boxShadow: `0 0 0 2px ${colors.primary[300]}` },
  // Two-word types wrap rather than spill into the value column.
  '& .EntityTypeLabel-text': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
})

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  '& .EntityRow-value': {
    ...typography.bodyM,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.neutral[700],
  },
})

const Result = styled('span')({
  ...typography.labelM,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  minWidth: 0,
  color: colors.primary[500],
  '& > span:first-of-type': { flexShrink: 0, fontSize: 12, color: colors.neutral[300] },
  '& > span:last-of-type': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '&[data-unchanged]': { ...typography.bodyM, color: colors.neutral[400] },
})

const Actions = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 4,
})

const Score = styled('span')({
  ...typography.labelS,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: colors.neutral[400],
  '& > span': { fontSize: 12, color: colors.warning },
})

/** One detected entity: type, value, what it becomes, and the include toggle. */
export function EntityRow({ entity, onToggle, flash = false }: EntityRowProps) {
  const category = categoryOf(entity)
  const review = entity.included && entity.lowConfidence

  return (
    <Root
      id={`entity-row-${entity.id}`}
      data-review={review || undefined}
      data-excluded={!entity.included || undefined}
      data-flash={flash || undefined}
    >
      <EntityTypeLabel type={category.icon} label={category.label} />
      <Content>
        <span className="EntityRow-value" title={entity.text}>
          {entity.text}
        </span>
        <Result data-unchanged={!entity.included || undefined}>
          <MaskIcon src={arrowIcon} aria-hidden />
          <span>
            {entity.included ? (entity.replacement ?? '…') : 'unchanged'}
          </span>
        </Result>
      </Content>
      <Actions>
        <StatusButton
          included={entity.included}
          onClick={onToggle}
          aria-label={`${entity.included ? 'Exclude' : 'Include'} ${category.label} ${entity.text}`}
        />
        <Score>
          {entity.score.toFixed(2)}
          {entity.lowConfidence && (
            <MaskIcon src={warningIcon} role="img" aria-label="Low confidence" />
          )}
        </Score>
      </Actions>
    </Root>
  )
}
