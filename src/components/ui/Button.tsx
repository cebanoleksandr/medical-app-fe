import type { ReactNode } from 'react'
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase'
import { styled, type CSSObject } from '@mui/material/styles'
import { colors, radius, typography } from '../../theme'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghostSecondary'
export type ButtonSize = 'large' | 'medium'
export type ButtonSurface = 'light' | 'dark'

export interface ButtonProps extends Omit<ButtonBaseProps, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** `dark` restyles the disabled state for the navy landing background. */
  surface?: ButtonSurface
  startIcon?: ReactNode
  endIcon?: ReactNode
  children?: ReactNode
}

// The 2px border is always there (transparent by default), so focus and
// pressed borders don't change the button's size.
const BORDER = 2

const filledDisabled: CSSObject = {
  backgroundColor: 'transparent',
  borderColor: colors.neutral[300],
  color: colors.neutral[400],
}

// Filled buttons on the landing background (Figma: Disabled on dark).
const darkDisabled: CSSObject = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  borderColor: 'rgba(255, 255, 255, 0.6)',
  color: 'rgba(255, 255, 255, 0.38)',
}

const ghostDisabled: CSSObject = {
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  color: colors.neutral[400],
}

const variantStyles: Record<ButtonVariant, CSSObject> = {
  primary: {
    backgroundColor: colors.accent[400],
    color: colors.primary[800],
    '&:hover': { backgroundColor: colors.accent[200] },
    '&.Mui-focusVisible': {
      backgroundColor: colors.accent[400],
      borderColor: colors.accent[600],
    },
    '&:active': {
      backgroundColor: colors.accent[500],
      borderColor: colors.accent[600],
    },
    '&.Mui-disabled': filledDisabled,
  },
  secondary: {
    backgroundColor: colors.primary[500],
    color: colors.white,
    '&:hover': { backgroundColor: colors.primary[400] },
    '&.Mui-focusVisible': {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[400],
    },
    '&:active': {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
    },
    '&.Mui-disabled': filledDisabled,
  },
  ghost: {
    color: colors.accent[400],
    '&:hover': { backgroundColor: colors.neutral[100], color: colors.accent[500] },
    '&.Mui-focusVisible': {
      backgroundColor: colors.neutral[100],
      borderColor: colors.accent[400],
      color: colors.accent[500],
    },
    '&:active': { backgroundColor: colors.accent[50], color: colors.accent[600] },
    '&.Mui-disabled': ghostDisabled,
  },
  ghostSecondary: {
    color: colors.primary[500],
    '&:hover': { backgroundColor: colors.neutral[100] },
    '&.Mui-focusVisible': {
      backgroundColor: colors.neutral[100],
      borderColor: colors.primary[400],
      color: colors.primary[600],
    },
    '&:active': { backgroundColor: colors.primary[50], color: colors.primary[600] },
    '&.Mui-disabled': ghostDisabled,
  },
}

// Padding from Figma, minus the border.
const padding = {
  large: { filled: [12, 32], ghost: [12, 16] },
  medium: { filled: [8, 24], ghost: [8, 12] },
} as const

const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'size' && prop !== 'surface',
})<{ variant: ButtonVariant; size: ButtonSize; surface: ButtonSurface }>(({
  variant,
  size,
  surface,
}) => {
  const isGhost = variant === 'ghost' || variant === 'ghostSecondary'
  const [py, px] = padding[size][isGhost ? 'ghost' : 'filled']
  return {
    ...(size === 'large' ? typography.labelL : typography.labelM),
    gap: 12,
    padding: `${py - BORDER}px ${px - BORDER}px`,
    border: `${BORDER}px solid transparent`,
    borderRadius: radius.md,
    whiteSpace: 'nowrap',
    transition: 'background-color 150ms, border-color 150ms, color 150ms',
    ...variantStyles[variant],
    ...(surface === 'dark' && !isGhost && { '&.Mui-disabled': darkDisabled }),
  }
})

const Icon = styled('span')({
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: 24,
  '& > svg': { fontSize: 'inherit' },
})

/** CTA button: Primary, Secondary, Ghost and Ghost/secondary from Figma. */
export function Button({
  variant = 'primary',
  size = 'large',
  surface = 'light',
  startIcon,
  endIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <Root variant={variant} size={size} surface={surface} disableRipple {...props}>
      {startIcon && <Icon>{startIcon}</Icon>}
      {children}
      {endIcon && <Icon>{endIcon}</Icon>}
    </Root>
  )
}
