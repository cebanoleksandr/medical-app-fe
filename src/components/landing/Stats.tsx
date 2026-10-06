import { useEffect, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container, NARROW, TABLET } from '../layouts/landing/styles'
import { colors, typography } from '../../theme'
import { EASE_OUT, fadeUp, reveal, stagger, viewport } from './motion'

const Root = styled('section')({
  padding: '64px 0',
  [NARROW]: { padding: '48px 0' },
  backgroundColor: colors.primary[800],
})

const List = styled(motion.dl)({
  display: 'flex',
  justifyContent: 'space-between',
  margin: 0,
  // Four across on tablets (dividers dropped), two by two on phones.
  [TABLET]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '32px 16px',
  },
  [NARROW]: { gridTemplateColumns: '1fr 1fr' },
})

const Item = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column-reverse',
  alignItems: 'center',
  gap: 8,
  whiteSpace: 'nowrap',
  '& dt': { ...typography.labelL, color: colors.neutral[400] },
  '& dd': {
    ...typography.h1,
    margin: 0,
    color: colors.white,
    // Digits keep their width while counting, so the text doesn't jitter.
    fontVariantNumeric: 'tabular-nums',
    [TABLET]: { fontSize: '40px', lineHeight: '48px' },
    [NARROW]: { fontSize: '36px', lineHeight: '44px' },
  },
  // Values line up at the top even when a label wraps (column-reverse).
  [TABLET]: { justifyContent: 'flex-end', whiteSpace: 'normal', textAlign: 'center' },
})

const Divider = styled(motion.div)({
  flexShrink: 0,
  width: 1,
  alignSelf: 'stretch',
  backgroundColor: 'rgba(102, 217, 200, 0.2)',
  transformOrigin: 'top',
  [TABLET]: { display: 'none' },
})

const growDown = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.8, ease: EASE_OUT } },
}

/**
 * Counts the number inside `value` up from zero once it's on screen; the
 * prefix and suffix ("< ", "%", " min") stay as they are. Renders the final
 * value first, so it's correct without JS and for reduced motion.
 */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, viewport)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    const match = /^(\D*)([\d.]+)(.*)$/.exec(value)
    if (!node || !inView || reduceMotion || !match) return
    const [, prefix, number, suffix] = match
    const decimals = number.split('.')[1]?.length ?? 0
    // Writes to the DOM directly: no re-render per frame.
    const controls = animate(0, Number(number), {
      duration: 1.6,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        node.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value])

  return <dd ref={ref}>{value}</dd>
}

export function Stats() {
  const { t } = useTranslation('landing')
  return (
    <Root>
      <Container>
        <List {...reveal} variants={stagger(0.1)}>
          {t('stats', { returnObjects: true }).flatMap((stat, index) => [
            index > 0 && <Divider key={`divider-${index}`} aria-hidden variants={growDown} />,
            // The label comes first in the markup (dt before dd) but shows below.
            <Item key={stat.label} variants={fadeUp}>
              <dt>{stat.label}</dt>
              <CountUp value={stat.value} />
            </Item>,
          ])}
        </List>
      </Container>
    </Root>
  )
}
