import type { HTMLAttributes } from 'react'
import { styled, type CSSObject } from '@mui/material/styles'
import { colors, typography } from '../../theme'

export type EntityHighlightVariant = 'selected' | 'review' | 'excluded' | 'normal'

export interface EntityHighlightProps extends HTMLAttributes<HTMLSpanElement> {
  /** `review`: low-confidence entity that needs a look. */
  variant?: EntityHighlightVariant
}

const variantStyles: Record<EntityHighlightVariant, CSSObject> = {
  selected: {
    backgroundColor: colors.accent[50],
    borderBottom: `2px solid ${colors.accent[500]}`,
  },
  review: {
    // Figma: warning-light at 30% opacity.
    backgroundColor: 'rgba(254, 249, 195, 0.3)',
    borderBottom: `2px solid ${colors.warning}`,
  },
  excluded: { borderBottom: `1px dashed ${colors.neutral[400]}` },
  normal: { color: colors.neutral[700] },
}

const Root = styled('span', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: EntityHighlightVariant }>(({ variant }) => ({
  ...typography.bodyM,
  padding: '0 2px',
  borderRadius: 2,
  color: colors.neutral[900],
  // Keeps padding and underline on every line when the entity wraps.
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
  ...variantStyles[variant],
}))

/** Inline highlight of a detected entity inside the analysed text. */
export function EntityHighlight({ variant = 'selected', ...props }: EntityHighlightProps) {
  return <Root variant={variant} {...props} />
}
