import { styled } from '@mui/material/styles'
import circle from '../../assets/review/empty/circle.svg'
import line1 from '../../assets/review/empty/line1.svg'
import line2 from '../../assets/review/empty/line2.svg'
import line3 from '../../assets/review/empty/line3.svg'
import magnifier from '../../assets/review/empty/magnifier.svg'
import row1 from '../../assets/review/empty/row1.svg'
import row2 from '../../assets/review/empty/row2.svg'
import row3 from '../../assets/review/empty/row3.svg'

export interface PictureLayer {
  src: string
  /** Position from Figma as insets (top, right, bottom, left) of the circle. */
  inset: string
}

const LAYERS: PictureLayer[] = [
  { src: magnifier, inset: '25% 25% 19.06% 7%' },
  { src: row1, inset: '30.78% 52.8% 57.83% 35.81%' },
  { src: row2, inset: '44.32% 52.8% 44.29% 35.81%' },
  { src: row3, inset: '57.27% 52.19% 30.14% 35.22%' },
  { src: line1, inset: '33.45% 35.8% 60.5% 50.17%' },
  { src: line2, inset: '46.99% 35.8% 46.96% 50.17%' },
  { src: line3, inset: '60.53% 35.8% 33.42% 50.17%' },
]

const Root = styled('span')({
  position: 'relative',
  display: 'block',
  flexShrink: 0,
  overflow: 'hidden',
  borderRadius: 999,
  opacity: 0.7,
  '& > span': { position: 'absolute' },
  '& img': { display: 'block', width: '100%', height: '100%', maxWidth: 'none' },
})

/** Grey circle with Figma's vector layers on top, scaled to `size`. */
export function LayeredPicture({ layers, size = 80 }: { layers: PictureLayer[]; size?: number }) {
  return (
    <Root aria-hidden style={{ width: size, height: size }}>
      <span style={{ inset: 0 }}>
        <img src={circle} alt="" />
      </span>
      {layers.map(({ src, inset }) => (
        <span key={src} style={{ inset }}>
          <img src={src} alt="" />
        </span>
      ))}
    </Root>
  )
}

/** "Nothing found" illustration: a magnifier over a list. */
export function EmptyEntitiesPicture({ size }: { size?: number }) {
  return <LayeredPicture layers={LAYERS} size={size} />
}
