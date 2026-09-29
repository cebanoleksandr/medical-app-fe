import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase'
import { styled } from '@mui/material/styles'
import { colors, radius, typography } from '../../theme'

export interface StatusButtonLabels {
  included: string
  excluded: string
  /** Shown on hover / focus of an included item. */
  exclude: string
  /** Shown on hover / focus of an excluded item. */
  include: string
}

export interface StatusButtonProps extends Omit<ButtonBaseProps, 'children'> {
  included: boolean
  labels?: StatusButtonLabels
}

const defaultLabels: StatusButtonLabels = {
  included: 'Included',
  excluded: 'Excluded',
  exclude: 'Exclude',
  include: 'Include',
}

const BORDER = 1

const Root = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'included',
})<{ included: boolean }>(({ included }) => ({
  ...typography.labelS,
  height: 26,
  padding: `0 ${8 - BORDER}px`,
  border: `${BORDER}px solid transparent`,
  borderRadius: radius.md,
  backgroundColor: colors.white,
  transition: 'background-color 150ms, border-color 150ms, color 150ms',
  '& .StatusButton-label': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    '& > svg': { fontSize: 12 },
  },
  '& .StatusButton-action': { display: 'none' },
  '&:hover .StatusButton-status, &.Mui-focusVisible .StatusButton-status': {
    display: 'none',
  },
  '&:hover .StatusButton-action, &.Mui-focusVisible .StatusButton-action': {
    display: 'inline-flex',
  },
  ...(included
    ? {
        borderColor: colors.primary[500],
        color: colors.primary[500],
        '&:hover, &.Mui-focusVisible': {
          backgroundColor: colors.errorLight,
          borderColor: 'transparent',
          color: colors.error,
        },
      }
    : {
        color: colors.neutral[500],
        '&:hover, &.Mui-focusVisible': {
          backgroundColor: colors.primary[50],
          color: colors.primary[500],
        },
      }),
}))

/**
 * Include / exclude toggle from the result screen. Shows the current status
 * and switches to the action it will perform on hover or keyboard focus.
 */
export function StatusButton({
  included,
  labels = defaultLabels,
  ...props
}: StatusButtonProps) {
  return (
    <Root included={included} aria-pressed={included} disableRipple {...props}>
      <span className="StatusButton-label StatusButton-status">
        {included ? <CheckIcon /> : <RemoveIcon />}
        {included ? labels.included : labels.excluded}
      </span>
      <span className="StatusButton-label StatusButton-action">
        {included ? <CloseIcon /> : <AddIcon />}
        {included ? labels.exclude : labels.include}
      </span>
    </Root>
  )
}
