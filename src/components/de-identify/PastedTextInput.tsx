import { useId } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { styled } from '@mui/material/styles'
import { useForm, useWatch } from 'react-hook-form'
import { MAX_PASTED_TEXT_LENGTH, MIN_TEXT_LENGTH } from '../../api/types'
import errorIcon from '../../assets/data-input/error.svg'
import { colors, shadows, typography } from '../../theme'
import { MaskIcon } from '../ui'
import { formatCount, pastedTextSchema, type PastedTextValues } from './dataInput'

export interface PastedTextInputProps {
  /** Text from the wizard draft, e.g. after coming back from the next step. */
  defaultValue: string
  onChange: (text: string) => void
}

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
})

const Area = styled('textarea')({
  ...typography.bodyM,
  display: 'block',
  width: '100%',
  height: 357,
  margin: 0,
  padding: 16,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 12,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  color: colors.neutral[900],
  fontFamily: 'inherit',
  resize: 'none',
  outline: 0,
  transition: 'border-color 150ms, box-shadow 150ms',
  '&::placeholder': { color: colors.neutral[400], opacity: 1 },
  '&:hover': { borderColor: colors.neutral[300] },
  '&:focus': {
    borderColor: colors.primary[500],
    boxShadow: `${shadows.sm}, inset 0 0 0 1px ${colors.primary[500]}`,
  },
  '&[aria-invalid="true"]': { borderColor: colors.error },
  '&[aria-invalid="true"]:focus': {
    boxShadow: `${shadows.sm}, inset 0 0 0 1px ${colors.error}`,
  },
})

// Always rendered so an error appearing doesn't shift the layout.
const Supporting = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  minHeight: 16,
  padding: '0 16px 12px',
  color: colors.neutral[400],
  '&[data-invalid]': { color: colors.error },
})

const Message = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  '& > span:first-of-type': { fontSize: 16 },
})

const Count = styled('span')({ marginLeft: 'auto', whiteSpace: 'nowrap' })

/** "Enter Text" panel: the text to anonymize, 50 to 5 000 characters. */
export function PastedTextInput({ defaultValue, onChange }: PastedTextInputProps) {
  const id = useId()
  const supportingId = `${id}-supporting`
  const { control, register, formState } = useForm<PastedTextValues>({
    resolver: yupResolver(pastedTextSchema),
    defaultValues: { text: defaultValue },
    mode: 'onTouched',
  })
  const text = useWatch({ control, name: 'text' }) ?? ''
  // Empty isn't an error: Continue stays disabled until there is enough text.
  const error = text.trim() ? formState.errors.text?.message : undefined

  return (
    <Root>
      <Area
        id={id}
        aria-label="Text to anonymize"
        aria-invalid={Boolean(error)}
        aria-describedby={supportingId}
        placeholder={`Paste your text here — minimum ${MIN_TEXT_LENGTH} characters required`}
        spellCheck={false}
        {...register('text', { onChange: (event) => onChange(event.target.value) })}
      />
      <Supporting id={supportingId} data-invalid={error ? '' : undefined}>
        {error && (
          <Message role="alert">
            <MaskIcon src={errorIcon} aria-hidden />
            {error}
          </Message>
        )}
        <Count>
          {formatCount(text.length)} / {formatCount(MAX_PASTED_TEXT_LENGTH)} characters
        </Count>
      </Supporting>
    </Root>
  )
}
