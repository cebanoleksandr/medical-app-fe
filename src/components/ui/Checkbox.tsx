import MuiCheckbox, { type CheckboxProps } from '@mui/material/Checkbox'
import { styled } from '@mui/material/styles'
import { colors } from '../../theme'

const StyledCheckbox = styled(MuiCheckbox)({
  padding: 8,
  color: colors.neutral[400],
  // Figma has no hover / focus states here; these match the radio button.
  '&:hover': { backgroundColor: colors.primary[50] },
  '&.Mui-focusVisible': { backgroundColor: colors.primary[100] },
  '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: colors.primary[500] },
  '&.Mui-disabled': { opacity: 0.38, color: colors.neutral[300] },
  '&.Mui-disabled.Mui-checked': { color: colors.neutral[400] },
})

export type { CheckboxProps }

/** MUI Checkbox in the design-system colors; use with FormControlLabel for a label. */
export function Checkbox(props: CheckboxProps) {
  return <StyledCheckbox disableRipple {...props} />
}
