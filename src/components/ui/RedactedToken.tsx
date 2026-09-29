import type { HTMLAttributes } from 'react'
import { styled } from '@mui/material/styles'
import { colors } from '../../theme'

export interface RedactedTokenProps extends HTMLAttributes<HTMLSpanElement> {
  /** `edited`: the replacement was changed by the user. */
  edited?: boolean
}

const Root = styled('span', {
  shouldForwardProp: (prop) => prop !== 'edited',
})<{ edited: boolean }>(({ edited }) => ({
  fontFamily: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '18px',
  padding: '0 2px',
  borderRadius: 2,
  whiteSpace: 'nowrap',
  ...(edited
    ? { color: colors.success }
    : { backgroundColor: colors.primary[50], color: colors.primary[700] }),
}))

/** Replacement token in de-identified output, e.g. [REDACTED] or [NAME]. */
export function RedactedToken({ edited = false, children = '[REDACTED]', ...props }: RedactedTokenProps) {
  return (
    <Root edited={edited} {...props}>
      {children}
    </Root>
  )
}
