import type { CSSProperties, ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import checkIcon from '../../assets/generated/check.svg'
import errorIcon from '../../assets/generated/error.svg'
import warningIcon from '../../assets/generated/warning.svg'
import infoIcon from '../../assets/configuration/info.svg'
import smallErrorIcon from '../../assets/synthetic/error.svg'
import smallWarningIcon from '../../assets/generated/warning-small.svg'
import { colors, shadows, typography } from '../../theme'
import { TONE_COLOR } from './styles'
import { IconButton, MaskIcon } from '../ui'
import type { Tone } from './resultModel'

interface GlyphProps {
  src: string
  /** The SVG's own size. */
  size: number
  /** Figma frames some icons in a smaller slot; the glyph sits top-left. */
  slot?: number
  color?: string
  className?: string
}

/** A single-color Figma icon tinted with `color` (or the text color). */
export function Glyph({ src, size, slot = size, color, className }: GlyphProps) {
  return (
    <span
      className={className}
      aria-hidden
      style={{ display: 'block', flexShrink: 0, width: slot, height: slot, fontSize: size, color }}
    >
      <MaskIcon src={src} />
    </span>
  )
}

const CHECK_ICONS: Record<Tone, string> = {
  success: checkIcon,
  warning: warningIcon,
  error: errorIcon,
}

const CheckRow = styled('li')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: colors.neutral[500],
  '& .CheckItem-state': { color: colors.neutral[700] },
  '&[data-emphasis] .CheckItem-label, &[data-emphasis] .CheckItem-state': { color: 'var(--tone)' },
})

interface CheckItemProps {
  tone: Tone
  label: ReactNode
  /** Short result after the label: "Removed", "Detected". */
  state?: ReactNode
  /** Colors the text too, not only the icon. */
  emphasis?: boolean
}

export function CheckItem({ tone, label, state, emphasis = false }: CheckItemProps) {
  return (
    <CheckRow
      data-emphasis={emphasis || undefined}
      style={{ '--tone': TONE_COLOR[tone] } as CSSProperties}
    >
      <Glyph src={CHECK_ICONS[tone]} size={20} color={TONE_COLOR[tone]} />
      <span className="CheckItem-label">{label}</span>
      {state && <span className="CheckItem-state">{state}</span>}
    </CheckRow>
  )
}

export type NoticeTone = 'info' | 'error' | 'neutral'

const NoticeRoot = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 16px',
  border: '1px solid',
  borderRadius: 8,
  boxShadow: shadows.sm,
  '& p': { flex: 1, minWidth: 0, margin: 0 },
  '&[data-tone="info"]': {
    borderColor: colors.info,
    backgroundColor: colors.infoLight,
    color: colors.info,
  },
  '&[data-tone="error"]': {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
    color: colors.error,
  },
  '&[data-tone="neutral"]': {
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    color: colors.neutral[500],
  },
})

/** Bordered notice in drawers and modals ("Trust block" in Figma). */
export function Notice({
  tone,
  children,
  className,
}: {
  tone: NoticeTone
  children: ReactNode
  className?: string
}) {
  return (
    <NoticeRoot className={className} data-tone={tone} role={tone === 'error' ? 'alert' : undefined}>
      {tone === 'info' && <Glyph src={infoIcon} size={24} slot={20} />}
      {tone === 'error' && <Glyph src={errorIcon} size={20} />}
      <p>{children}</p>
    </NoticeRoot>
  )
}

const SoftNoticeRoot = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  padding: 12,
  borderRadius: 8,
  '& p': { flex: 1, minWidth: 0, margin: 0 },
  '&[data-tone="warning"]': {
    backgroundColor: 'rgba(254, 249, 195, 0.3)',
    color: colors.warning,
  },
  '&[data-tone="error"]': {
    backgroundColor: 'rgba(254, 226, 226, 0.3)',
    color: colors.error,
  },
})

/** Borderless tinted note in the compliance panel. */
export function SoftNotice({ tone, children }: { tone: 'warning' | 'error'; children: ReactNode }) {
  return (
    <SoftNoticeRoot data-tone={tone}>
      <Glyph src={tone === 'warning' ? smallWarningIcon : smallErrorIcon} size={16} />
      <p>{children}</p>
    </SoftNoticeRoot>
  )
}

const HeaderRoot = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  '& > div': { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: 0, color: colors.neutral[400] },
  '& > button': { flexShrink: 0, margin: -4 },
})

interface DialogHeaderProps {
  titleId: string
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  className?: string
}

/** Title, grey subtitle and a close button: shared by drawers and modals. */
export function DialogHeader({ titleId, title, subtitle, onClose, className }: DialogHeaderProps) {
  return (
    <HeaderRoot className={className}>
      <div>
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <IconButton variant="ghost" aria-label="Close" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </HeaderRoot>
  )
}

