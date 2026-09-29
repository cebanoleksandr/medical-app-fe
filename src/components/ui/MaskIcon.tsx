import { styled } from '@mui/material/styles'

/**
 * Tints a single-color SVG from Figma with the current text color; sized by
 * font-size like MUI icons.
 */
export const MaskIcon = styled('span')<{ src: string }>(({ src }) => ({
  display: 'block',
  flexShrink: 0,
  width: '1em',
  height: '1em',
  backgroundColor: 'currentColor',
  mask: `url("${src}") center / contain no-repeat`,
}))
