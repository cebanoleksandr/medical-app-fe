import MuiTooltip, { type TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip'
import { colors, radius, shadows, typography } from '../../theme'

export type TooltipProps = MuiTooltipProps

/** MUI Tooltip in the design-system style: dark, 200px wide at most. */
export function Tooltip({ slotProps, ...props }: TooltipProps) {
  return (
    <MuiTooltip
      {...props}
      slotProps={{
        ...slotProps,
        tooltip: {
          ...slotProps?.tooltip,
          sx: {
            ...typography.bodyS,
            maxWidth: 200,
            padding: '8px 12px',
            borderRadius: `${radius.md}px`,
            backgroundColor: colors.primary[800],
            boxShadow: shadows.sm,
            color: colors.white,
            textAlign: 'center',
          },
        },
      }}
    />
  )
}
