import { styled } from '@mui/material/styles'

/** 1200px content column with side gutters on narrow screens. */
export const Container = styled('div')({
  width: '100%',
  maxWidth: 1200 + 2 * 24,
  marginInline: 'auto',
  paddingInline: 24,
})

/** Borders on the dark landing surfaces: accent-200 at 30%. */
export const landingBorder = '1px solid rgba(102, 217, 200, 0.3)'

/** Below this width the header nav drops to its own row. */
export const NARROW = '@media (max-width: 720px)'
