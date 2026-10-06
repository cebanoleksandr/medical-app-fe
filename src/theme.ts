import type { CSSProperties } from 'react'
import { createTheme, type Shadows } from '@mui/material/styles'

// Color variables from Figma (De-ID Studio). Keep names in sync with the design.
export const colors = {
  primary: {
    50: '#E8EFF7',
    100: '#C5D4E9',
    200: '#8AAAD1',
    300: '#4F7FB8',
    400: '#2A5A9A',
    500: '#1B3A6B',
    600: '#152D54',
    700: '#0F213D',
    800: '#01132F',
  },
  accent: {
    50: '#E0F7F4',
    100: '#B2EDE5',
    200: '#66D9C8',
    300: '#00BFA5',
    400: '#00BFA5',
    500: '#00A68F',
    600: '#008C78',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#B45309',
  warningLight: '#FEF9C3',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  white: '#FFFFFF',
} as const

export const radius = {
  /** Inputs, cards, dropdowns, buttons. */
  md: 8,
  /** Modals, drawers. */
  xl: 16,
  /** Pill buttons, avatars. */
  full: 999,
} as const

export const shadows = {
  /** Subtle card lift. */
  xs: '0 1px 2px #0000000D',
  /** Cards default. */
  sm: '0 1px 3px #00000014',
  md: '0 2px 12px #0000000F',
  /** Modals. */
  lg: '0 8px 24px #0000001F',
  focus: '0 0 24px 3px #0000004D',
} as const

// MUI expects 25 elevation levels; map them onto the five design shadows so
// Paper (1), Card (1), Menu/Popover (8) and Drawer/Dialog (16, 24) match Figma.
const muiShadows = Array.from({ length: 25 }, (_, elevation) => {
  if (elevation === 0) return 'none'
  if (elevation === 1) return shadows.xs
  if (elevation === 2) return shadows.sm
  if (elevation < 16) return shadows.md
  return shadows.lg
}) as Shadows

const fontFamily = '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

// Text styles from Figma: size / line height in px.
export const typography = {
  h1: { fontSize: '48px', lineHeight: '56px', fontWeight: 700 },
  h2: { fontSize: '36px', lineHeight: '44px', fontWeight: 700 },
  h3: { fontSize: '24px', lineHeight: '28px', fontWeight: 600 },
  h4: { fontSize: '18px', lineHeight: '26px', fontWeight: 600 },
  bodyL: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
  bodyM: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
  bodyS: { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
  labelL: { fontSize: '16px', lineHeight: '24px', fontWeight: 500 },
  labelM: { fontSize: '14px', lineHeight: '20px', fontWeight: 500 },
  labelS: { fontSize: '12px', lineHeight: '16px', fontWeight: 500 },
} as const

// Lets <Typography variant="bodyM"> and theme.typography.labelS type-check.
declare module '@mui/material/styles' {
  interface TypographyVariants {
    bodyL: CSSProperties
    bodyM: CSSProperties
    bodyS: CSSProperties
    labelL: CSSProperties
    labelM: CSSProperties
    labelS: CSSProperties
  }
  interface TypographyVariantsOptions {
    bodyL?: CSSProperties
    bodyM?: CSSProperties
    bodyS?: CSSProperties
    labelL?: CSSProperties
    labelM?: CSSProperties
    labelS?: CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    bodyL: true
    bodyM: true
    bodyS: true
    labelL: true
    labelM: true
    labelS: true
  }
}

/**
 * Layout breakpoints. Below `nav` the sidebar becomes a drawer opened from the
 * header; below `mobile` pages drop to one column and tighter padding.
 */
export const breakpoints = { nav: 1024, mobile: 720 } as const

export const media = {
  nav: `@media (max-width: ${breakpoints.nav}px)`,
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
} as const

export const theme = createTheme({
  // Base unit for sx: `borderRadius: 2` is 16px (radius.xl).
  shape: { borderRadius: radius.md },
  shadows: muiShadows,
  typography: {
    fontFamily,
    ...typography,
    // Built-in variants that MUI components use internally.
    body1: typography.bodyL,
    body2: typography.bodyM,
    caption: typography.bodyS,
    button: { ...typography.labelM, textTransform: 'none' },
  },
  palette: {
    primary: {
      light: colors.primary[300],
      main: colors.primary[500],
      dark: colors.primary[700],
      contrastText: colors.white,
    },
    secondary: {
      light: colors.accent[200],
      main: colors.accent[400],
      dark: colors.accent[600],
    },
    success: { light: colors.successLight, main: colors.success },
    warning: { light: colors.warningLight, main: colors.warning },
    error: { light: colors.errorLight, main: colors.error },
    info: { light: colors.infoLight, main: colors.info },
    grey: colors.neutral,
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[500],
      disabled: colors.neutral[400],
    },
    divider: colors.neutral[200],
    background: {
      default: colors.neutral[50],
      paper: colors.white,
    },
  },
})
