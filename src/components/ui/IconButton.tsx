import type { ReactNode } from 'react'
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase'
import { styled, type CSSObject } from '@mui/material/styles'
import { colors, radius } from '../../theme'

export type IconButtonVariant = 'round' | 'ghost'

export interface IconButtonProps extends Omit<ButtonBaseProps, 'children'> {
  variant?: IconButtonVariant
  children: ReactNode
  /** Required: the button has no visible text. */
  'aria-label': string
}

const variantStyles: Record<IconButtonVariant, CSSObject> = {
  round: {
    '& .IconButton-content': {
      backgroundColor: colors.primary[500],
      color: colors.white,
    },
    '&:hover .IconButton-content': { backgroundColor: colors.primary[400] },
    '&.Mui-focusVisible .IconButton-content': {
      backgroundColor: colors.primary[500],
    },
    '&:active .IconButton-content': {
      backgroundColor: colors.primary[600],
      borderRadius: radius.md,
    },
    '&.Mui-disabled .IconButton-content': {
      backgroundColor: colors.neutral[200],
      color: colors.neutral[400],
    },
  },
  ghost: {
    '& .IconButton-content': { color: colors.neutral[500] },
    '&:hover .IconButton-content, &.Mui-focusVisible .IconButton-content': {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
    },
    '&:active .IconButton-content': {
      backgroundColor: colors.neutral[200],
      color: colors.neutral[900],
      borderRadius: radius.md,
    },
    '&.Mui-disabled .IconButton-content': {
      backgroundColor: 'transparent',
      color: colors.neutral[300],
    },
  },
}

// 48px hit area around a 40px visible button.
const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: IconButtonVariant }>(({ variant }) => ({
  position: 'relative',
  width: 48,
  height: 48,
  borderRadius: radius.full,
  '&.Mui-focusVisible::after': {
    content: '""',
    position: 'absolute',
    inset: 2,
    border: `3px solid ${colors.accent[400]}`,
    borderRadius: radius.full,
    pointerEvents: 'none',
  },
  ...variantStyles[variant],
}))

const Content = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: radius.full,
  fontSize: 24,
  transition: 'background-color 150ms, color 150ms, border-radius 150ms',
  '& > svg': { fontSize: 'inherit' },
})

/** Icon-only button: filled round or ghost. */
export function IconButton({ variant = 'round', children, ...props }: IconButtonProps) {
  return (
    <Root variant={variant} disableRipple {...props}>
      <Content className="IconButton-content">{children}</Content>
    </Root>
  )
}
