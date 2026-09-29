import MuiRadio, { type RadioProps } from '@mui/material/Radio'
import { styled } from '@mui/material/styles'
import { colors } from '../../theme'

const StyledRadio = styled(MuiRadio)({
  padding: 8,
  color: colors.neutral[400],
  '&:hover': { backgroundColor: colors.primary[50], color: colors.primary[600] },
  '&.Mui-focusVisible': { backgroundColor: colors.primary[100], color: colors.primary[600] },
  '&:active': { backgroundColor: colors.primary[100], color: colors.neutral[900] },
  '&.Mui-checked': { color: colors.primary[500] },
  '&.Mui-checked.Mui-focusVisible': { color: colors.primary[600] },
  '&.Mui-checked:active': { color: colors.primary[700] },
  '&.Mui-disabled': { color: colors.neutral[300] },
})

export type { RadioProps }

/** MUI Radio in the design-system colors; use inside RadioGroup / FormControlLabel. */
export function Radio(props: RadioProps) {
  return <StyledRadio disableRipple {...props} />
}
