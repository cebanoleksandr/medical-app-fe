import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase'
import { styled } from '@mui/material/styles'
import { colors, radius, typography } from '../../theme'

export interface FilterChipProps extends ButtonBaseProps {
  active?: boolean
}

const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>(({ active }) => ({
  ...typography.labelS,
  padding: '4px 10px',
  borderRadius: radius.full,
  whiteSpace: 'nowrap',
  transition: 'background-color 150ms',
  ...(active
    ? { backgroundColor: colors.primary[50], color: colors.primary[500] }
    : {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[700],
        '&:hover': { backgroundColor: colors.neutral[200] },
      }),
  '&.Mui-focusVisible': { outline: `2px solid ${colors.primary[500]}`, outlineOffset: 1 },
}))

/** Toggleable filter pill, e.g. "All", "PERSON", "DATE" above the entity list. */
export function FilterChip({ active = false, ...props }: FilterChipProps) {
  return <Root active={active} aria-pressed={active} disableRipple {...props} />
}
