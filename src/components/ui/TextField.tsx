import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { styled } from '@mui/material/styles'
import { colors, radius, typography } from '../../theme'

export type TextFieldSurface = 'light' | 'dark'

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>, 'size'> {
  label: string
  /** Shown below the field; replaced by `error` when that is a string. */
  helperText?: ReactNode
  /** `true` or a message; a message replaces the helper text. */
  error?: boolean | string
  /** `dark` for fields on the navy landing background. */
  surface?: TextFieldSurface
  multiline?: boolean
  rows?: number
  /**
   * Current length, shown as "length/maxLength" under the field; needs
   * `maxLength`. Passed in because registered (uncontrolled) inputs have no
   * `value` to count.
   */
  characterCount?: number
  /** Icon or icon button inside the field, on the right. */
  endAdornment?: ReactNode
  ref?: Ref<HTMLInputElement & HTMLTextAreaElement>
}

const palette = {
  light: {
    background: colors.white,
    border: colors.neutral[300],
    text: colors.neutral[900],
    label: colors.neutral[500],
    focus: colors.primary[500],
    disabledBackground: colors.neutral[100],
    disabledBorder: colors.neutral[200],
    disabledText: colors.neutral[300],
  },
  dark: {
    background: colors.primary[800],
    border: colors.neutral[500],
    text: colors.white,
    label: colors.neutral[400],
    focus: colors.accent[400],
    disabledBackground: colors.primary[800],
    disabledBorder: colors.neutral[500],
    disabledText: colors.neutral[500],
  },
} as const

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

// Focus and error borders are 2px in the design; the extra pixel is an inset
// shadow so the text doesn't shift.
const Field = styled('div', {
  shouldForwardProp: (prop) => prop !== 'surface' && prop !== 'invalid' && prop !== 'multiline',
})<{ surface: TextFieldSurface; invalid: boolean; multiline: boolean }>(({
  surface,
  invalid,
  multiline,
}) => {
  const p = palette[surface]
  const accent = invalid ? colors.error : p.focus
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    // Only a textarea grows with its container; a single-line field keeps
    // its height when a neighbour in the same row shows an error.
    flex: multiline ? 1 : 'none',
    minHeight: multiline ? undefined : 56,
    border: `1px solid ${invalid ? colors.error : p.border}`,
    borderRadius: radius.md,
    backgroundColor: p.background,
    boxShadow: invalid ? `inset 0 0 0 1px ${colors.error}` : undefined,
    transition: 'border-color 150ms, box-shadow 150ms',
    '& label': {
      ...typography.labelS,
      position: 'absolute',
      top: -9,
      left: 12,
      padding: '0 4px',
      borderRadius: 4,
      backgroundColor: p.background,
      color: invalid ? colors.error : p.label,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    },
    '& .TextField-required': { color: colors.error },
    '& input, & textarea': {
      ...typography.bodyM,
      flex: 1,
      minWidth: 0,
      height: '100%',
      margin: 0,
      padding: '17px 16px',
      border: 0,
      outline: 0,
      background: 'none',
      color: p.text,
      resize: 'none',
      '&::placeholder': { color: colors.neutral[400], opacity: 1 },
    },
    '& textarea': { padding: '12px 16px' },
    '& .TextField-end': { display: 'flex', paddingRight: 8, color: colors.neutral[400] },
    '&:focus-within': {
      borderColor: accent,
      boxShadow: `inset 0 0 0 1px ${accent}`,
      '& label': { color: accent },
    },
    '&[data-disabled]': {
      borderColor: p.disabledBorder,
      boxShadow: 'none',
      backgroundColor: p.disabledBackground,
      '& label': { backgroundColor: p.disabledBackground, color: p.disabledText },
      '& input, & textarea, & input::placeholder, & textarea::placeholder': {
        color: p.disabledText,
      },
    },
  }
})

const Supporting = styled('div', {
  shouldForwardProp: (prop) => prop !== 'invalid',
})<{ invalid: boolean }>(({ invalid }) => ({
  ...typography.bodyS,
  display: 'flex',
  gap: 16,
  // Always reserved, so an error appearing doesn't push the form down.
  minHeight: 20,
  padding: '4px 16px 0',
  color: invalid ? colors.error : colors.neutral[500],
  '& .TextField-count': { marginLeft: 'auto', color: colors.neutral[500] },
}))

/** Outlined text field with a notched label, from the design system. */
export function TextField({
  label,
  helperText,
  error = false,
  surface = 'light',
  multiline = false,
  rows = 3,
  characterCount,
  endAdornment,
  required,
  disabled,
  id,
  className,
  value,
  maxLength,
  ref,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const supportingId = `${inputId}-supporting`
  const invalid = Boolean(error)
  const message = typeof error === 'string' ? error : helperText
  const count = characterCount !== undefined && maxLength !== undefined
    ? `${characterCount}/${maxLength}`
    : null
  const hasSupporting = Boolean(message) || count !== null

  const control = {
    ...inputProps,
    ref,
    id: inputId,
    value,
    maxLength,
    required,
    disabled,
    'aria-invalid': invalid || undefined,
    'aria-describedby': hasSupporting ? supportingId : undefined,
  }

  return (
    <Root className={className}>
      <Field
        surface={surface}
        invalid={invalid}
        multiline={multiline}
        data-disabled={disabled || undefined}
      >
        <label htmlFor={inputId}>
          {label}
          {required && <span className="TextField-required" aria-hidden>*</span>}
        </label>
        {multiline ? <textarea rows={rows} {...control} /> : <input {...control} />}
        {endAdornment && <span className="TextField-end">{endAdornment}</span>}
      </Field>
      <Supporting id={supportingId} invalid={invalid}>
        {message && <span>{message}</span>}
        {count && <span className="TextField-count">{count}</span>}
      </Supporting>
    </Root>
  )
}
