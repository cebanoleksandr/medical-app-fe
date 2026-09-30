import type { Variants } from 'framer-motion'

/** Soft ease-out used by every landing animation. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Reveal once, when a fifth of the element is on screen. */
export const viewport = { once: true, amount: 0.2 } as const

/** Spread on a motion element to play `visible` when it scrolls into view. */
export const reveal = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport,
} as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
}

/** Divider lines draw out from the centre. */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } },
}

/** Parent that plays its children's variants one after another. */
export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: delay } },
})
