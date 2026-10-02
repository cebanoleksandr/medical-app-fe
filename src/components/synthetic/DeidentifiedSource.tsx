import { styled, type CSSObject } from '@mui/material/styles'
import { colors, shadows, typography } from '../../theme'

export interface DeidentifiedSourceProps {
  /** The de-identified document; null when it's no longer in this session. */
  preview: string | null
  /** Shown instead of the preview when there is none. */
  fallback?: string
  /**
   * `toggle`: a card that selects this source (pressed shows the preview).
   * `static`: the source passed from Review, always shown.
   */
  variant: 'toggle' | 'static'
  selected?: boolean
  disabled?: boolean
  onToggle?: () => void
}

const base: CSSObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  padding: 16,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.neutral[50],
  boxShadow: shadows.sm,
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  transition: 'border-color 150ms, background-color 150ms',
  '&[data-variant="toggle"]': {
    cursor: 'pointer',
    '&:hover:not(:disabled)': { borderColor: colors.neutral[300] },
    '&:focus-visible': { outline: `2px solid ${colors.primary[500]}`, outlineOffset: 2 },
    '&:disabled': { cursor: 'default', opacity: 0.6 },
  },
  '&[aria-pressed="true"]': { borderColor: colors.neutral[100] },
  '&[data-variant="static"]': { border: 0 },
}

const Card = styled('section')(base)
const ToggleCard = styled('button')(base)

const Title = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  '& strong': { ...typography.labelM, color: colors.neutral[900] },
  '& span': { ...typography.bodyS, color: colors.neutral[500] },
})

const Preview = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  '& .DeidentifiedSource-text': {
    ...typography.bodyS,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 6,
    minHeight: 120,
    padding: 8,
    overflow: 'hidden',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 8,
    backgroundColor: colors.white,
    color: colors.neutral[700],
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  '& .DeidentifiedSource-note': {
    ...typography.bodyS,
    padding: '4px 16px 0',
    color: colors.neutral[500],
  },
  '[data-variant="static"] & .DeidentifiedSource-text': { minHeight: 0 },
})

/** "Use de-identified data as source": the document from the de-identify wizard. */
export function DeidentifiedSource({
  preview,
  fallback,
  variant,
  selected = false,
  disabled = false,
  onToggle,
}: DeidentifiedSourceProps) {
  const expanded = variant === 'static' || selected
  const body = (
    <>
      <Title>
        <strong>Use de-identified data as source</strong>
        <span>
          {disabled ? 'De-identify a document first to use it here' : 'Use previously de-identified data'}
        </span>
      </Title>
      {expanded && (
        <Preview>
          <span className="DeidentifiedSource-text">{preview ?? fallback}</span>
          <span className="DeidentifiedSource-note">Passed from current session</span>
        </Preview>
      )}
    </>
  )

  if (variant === 'static') {
    return (
      <Card data-variant="static" aria-label="Data source">
        {body}
      </Card>
    )
  }
  return (
    <ToggleCard
      type="button"
      data-variant="toggle"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
    >
      {body}
    </ToggleCard>
  )
}
