import { styled } from '@mui/material/styles'
import { typography } from '../../../theme'

/** Tablets and small laptops: stacked section headers, single-column contact. */
export const TABLET = '@media (max-width: 1024px)'

/** Phones: header nav on its own row, single-column grids. */
export const NARROW = '@media (max-width: 720px)'

/** 1200px content column with side gutters on narrow screens. */
export const Container = styled('div')({
  width: '100%',
  maxWidth: 1200 + 2 * 24,
  marginInline: 'auto',
  paddingInline: 24,
  [NARROW]: { paddingInline: 16 },
})

/** Vertical rhythm of landing sections: 96px in Figma, less on small screens. */
export const sectionPadding = {
  paddingBlock: 96,
  [TABLET]: { paddingBlock: 72 },
  [NARROW]: { paddingBlock: 56 },
} as const

/** Section titles (h2): 36px in Figma, 28px on phones. */
export const sectionTitle = {
  ...typography.h2,
  [NARROW]: { fontSize: '28px', lineHeight: '36px' },
} as const

/** Borders on the dark landing surfaces: accent-200 at 30%. */
export const landingBorder = '1px solid rgba(102, 217, 200, 0.3)'
