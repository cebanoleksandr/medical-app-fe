import { type CSSProperties, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { colors, typography } from '../../theme'
import { Button, Tooltip } from '../ui'
import { formatNumber, niceScale } from './dashboardModel'

export interface BarRow {
  key: string
  label: string
  value: number
}

const LABEL_WIDTH = 92

const Root = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 12,
  padding: 8,
})

const Chart = styled('div')({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: `${LABEL_WIDTH}px minmax(0, 1fr)`,
  ...typography.bodyS,
  color: colors.neutral[500],
})

const Axis = styled('div')({
  position: 'relative',
  gridColumn: 2,
  height: 16,
  marginBottom: 4,
  '& span': { position: 'absolute', top: 0, whiteSpace: 'nowrap' },
})

/** Vertical gridlines behind the bars, one per tick. */
const Grid = styled('div')({
  position: 'absolute',
  top: 20,
  right: 0,
  bottom: 0,
  left: LABEL_WIDTH,
  pointerEvents: 'none',
  '& span': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeft: `1px dashed ${colors.neutral[200]}`,
  },
})

const Row = styled('div')({
  display: 'contents',
  '& > span:first-of-type': {
    paddingRight: 6,
    overflow: 'hidden',
    textAlign: 'right',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '23px',
  },
})

// The whole row is the hit target, not only the 12px bar.
const Track = styled('span')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: 23,
  outline: 'none',
  '& > span': {
    height: 12,
    borderRadius: '0 4px 4px 0',
    backgroundColor: 'var(--bar)',
    transition: 'filter 150ms',
  },
  '&:hover > span, &:focus-visible > span': { filter: 'brightness(1.15)' },
  '&:focus-visible': { outline: `2px solid ${colors.primary[300]}`, borderRadius: 4 },
})

const Toggle = styled(Button)({
  alignSelf: 'center',
  color: colors.accent[400],
})

interface BarChartProps {
  rows: BarRow[]
  color: string
  /** Shows this many rows and a "Show all" toggle for the rest. */
  collapsedRows?: number
  /** Accessible name of the chart. */
  label: string
  /** Text of the "Show all" toggle. */
  showAllLabel?: string
}

/** Horizontal bars with the scale on top, as in the Figma charts. */
export function BarChart({ rows, color, collapsedRows, label, showAllLabel }: BarChartProps) {
  const { t } = useTranslation(['dashboard', 'common'])
  const [expanded, setExpanded] = useState(false)
  const scale = niceScale(Math.max(0, ...rows.map((r) => r.value)))
  const collapsible = !!collapsedRows && rows.length > collapsedRows
  const shown = collapsible && !expanded ? rows.slice(0, collapsedRows) : rows
  const pct = (value: number) => (value / scale.max) * 100

  return (
    <Root>
      <Chart role="list" aria-label={label}>
        <Axis aria-hidden>
          {scale.ticks.map((tick, i) => (
            <span
              key={tick}
              style={{
                left: `${pct(tick)}%`,
                transform: i === 0 ? undefined : i === scale.ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
            >
              {formatNumber(tick)}
            </span>
          ))}
        </Axis>
        <Grid aria-hidden>
          {scale.ticks.map((tick) => (
            <span key={tick} style={{ left: `${pct(tick)}%` }} />
          ))}
        </Grid>
        {shown.map((row) => (
          <Row key={row.key} role="listitem">
            <span title={row.label}>{row.label}</span>
            <Tooltip title={t('bar', { label: row.label, value: formatNumber(row.value) })} followCursor placement="top">
              <Track tabIndex={0} aria-label={t('bar', { label: row.label, value: formatNumber(row.value) })}>
                <span style={{ width: `${pct(row.value)}%`, '--bar': color } as CSSProperties} />
              </Track>
            </Tooltip>
          </Row>
        ))}
      </Chart>
      {collapsible && (
        <Toggle
          variant="ghost"
          size="medium"
          endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t('common:actions.showLess') : showAllLabel}
        </Toggle>
      )}
    </Root>
  )
}
