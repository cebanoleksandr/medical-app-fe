import { styled } from '@mui/material/styles'
import { colors, typography } from '../../theme'

export interface StatsBarProps {
  items: { value: string; label: string }[]
}

const Root = styled('dl')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  rowGap: 16,
  margin: 0,
  padding: '16px 24px',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 16,
  backgroundColor: colors.white,
  boxShadow: '0 1px 1.5px rgba(0, 0, 0, 0.08)',
})

const Item = styled('div')({
  display: 'flex',
  flexDirection: 'column-reverse',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 24px',
  borderLeft: `1px solid ${colors.neutral[200]}`,
  '& dt': { ...typography.bodyM, color: colors.neutral[500] },
  '& dd': { ...typography.h3, margin: 0, color: colors.neutral[900] },
})

/** Row of headline numbers above the review workspace. */
export function StatsBar({ items }: StatsBarProps) {
  return (
    <Root>
      {items.map((item) => (
        <Item key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </Item>
      ))}
    </Root>
  )
}
