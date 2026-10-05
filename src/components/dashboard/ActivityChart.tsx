import { type CSSProperties, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import { styled } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'
import type { Dashboard } from '../../api/types'
import { colors, radius, shadows, typography } from '../../theme'
import { Radio } from '../ui'
import { ChartCard } from './ChartCard'
import { formatDay, formatLongDay, formatNumber, niceScale } from './dashboardModel'

type Series = 'documents' | 'entities'

const SERIES: Record<Series, { label: string; color: string }> = {
  documents: { label: 'Documents', color: colors.primary[500] },
  entities: { label: 'Entities', color: colors.accent[400] },
}

// Plot geometry in px; the width follows the card.
const HEIGHT = 300
const PAD = { top: 8, right: 12, bottom: 28, left: 44 }
const MAX_X_LABELS = 8
/** Above this many days the markers would merge into a band. */
const MAX_MARKERS = 31

const Switch = styled(RadioGroup)({
  flexDirection: 'row',
  gap: 16,
  '& .MuiFormControlLabel-root': { margin: 0 },
  '& .MuiFormControlLabel-label': { ...typography.labelM, color: colors.neutral[500] },
  '& .Mui-checked + .MuiFormControlLabel-label': { color: colors.primary[500] },
})

const Plot = styled('div')({
  position: 'relative',
  outline: 'none',
  touchAction: 'pan-y',
  '& svg': { display: 'block', overflow: 'visible' },
  '& text': { ...typography.bodyS, fill: colors.neutral[500] },
  '&:focus-visible': { outline: `2px solid ${colors.primary[300]}`, outlineOffset: 4, borderRadius: 4 },
})

const Readout = styled('div')({
  ...typography.bodyS,
  position: 'absolute',
  top: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 128,
  padding: '8px 12px',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: radius.md,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
  color: colors.neutral[500],
  pointerEvents: 'none',
  '& > span': { color: colors.neutral[700], fontWeight: 500 },
  '& dl': { display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 8, rowGap: 2, margin: 0 },
  '& dt': { display: 'flex', alignItems: 'center', gap: 6 },
  // Line keys, not boxes: a short stroke of the series color.
  '& dt::before': {
    content: '""',
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'var(--key)',
  },
  '& dd': { margin: 0, textAlign: 'right', ...typography.labelS, color: colors.neutral[900] },
})

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

interface ActivityChartProps {
  activity: Dashboard['activity']
  busy?: boolean
}

/** Analyses or detected entities per day of the period. */
export function ActivityChart({ activity, busy }: ActivityChartProps) {
  const headingId = useId()
  const gradientId = useId()
  const [series, setSeries] = useState<Series>('documents')
  const [active, setActive] = useState<number | null>(null)
  const [ref, width] = useWidth()

  const { color, label } = SERIES[series]
  const values = activity.map((day) => day[series])
  const scale = niceScale(Math.max(0, ...values))
  const empty = values.every((v) => v === 0)

  const plotWidth = Math.max(0, width - PAD.left - PAD.right)
  const plotHeight = HEIGHT - PAD.top - PAD.bottom
  const x = (i: number) =>
    PAD.left + (activity.length > 1 ? (i * plotWidth) / (activity.length - 1) : plotWidth / 2)
  const y = (v: number) => PAD.top + plotHeight - (v / scale.max) * plotHeight
  const baseline = y(0)

  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')
  const area = `${line}L${x(values.length - 1)},${baseline}L${x(0)},${baseline}Z`
  const labelStep = Math.ceil(activity.length / MAX_X_LABELS)
  // Every `labelStep`-th day plus the last one, which replaces a tick too close to it.
  const labelled = new Set<number>()
  for (let i = 0; i < activity.length; i += labelStep) labelled.add(i)
  const lastTick = Math.floor((activity.length - 1) / labelStep) * labelStep
  if (activity.length - 1 - lastTick < labelStep * 0.6) labelled.delete(lastTick)
  labelled.add(activity.length - 1)

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    if (!activity.length || !plotWidth) return
    const left = event.clientX - event.currentTarget.getBoundingClientRect().left - PAD.left
    const step = activity.length > 1 ? plotWidth / (activity.length - 1) : plotWidth
    setActive(Math.min(activity.length - 1, Math.max(0, Math.round(left / step))))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = activity.length - 1
    const moves: Record<string, number> = {
      ArrowLeft: Math.max(0, (active ?? last + 1) - 1),
      ArrowRight: Math.min(last, (active ?? -1) + 1),
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      setActive(moves[event.key])
    } else if (event.key === 'Escape') setActive(null)
  }

  const point = active !== null ? activity[active] : null
  const readoutLeft =
    active !== null ? Math.min(Math.max(x(active) - 64, 0), Math.max(0, width - 140)) : 0

  return (
    <ChartCard
      id={headingId}
      title="Processing Activity"
      subtitle="Based on selected date range"
      busy={busy}
      action={
        <Switch
          value={series}
          onChange={(_, value) => setSeries(value as Series)}
          aria-label="Chart data"
        >
          {(Object.keys(SERIES) as Series[]).map((key) => (
            <FormControlLabel key={key} value={key} control={<Radio />} label={SERIES[key].label} />
          ))}
        </Switch>
      }
    >
      <Plot
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={`${label} per day. Use the arrow keys to read each day.`}
        onPointerMove={pick}
        onPointerLeave={() => setActive(null)}
        onFocus={() => setActive((current) => current ?? activity.length - 1)}
        onBlur={() => setActive(null)}
        onKeyDown={onKeyDown}
      >
        {width > 0 && (
          <svg width={width} height={HEIGHT} aria-hidden>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={colors.neutral[200]}
                  strokeDasharray={tick ? '3 3' : undefined}
                />
                <text x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">
                  {formatNumber(tick)}
                </text>
              </g>
            ))}
            {activity.map((day, i) =>
              labelled.has(i) ? (
                <g key={day.date}>
                  <line
                    x1={x(i)}
                    x2={x(i)}
                    y1={PAD.top}
                    y2={baseline}
                    stroke={colors.neutral[200]}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x(i)}
                    y={HEIGHT - 8}
                    textAnchor={i === 0 ? 'start' : i === activity.length - 1 ? 'end' : 'middle'}
                  >
                    {formatDay(day.date)}
                  </text>
                </g>
              ) : null,
            )}

            {!empty && (
              <>
                <path d={area} fill={`url(#${gradientId})`} />
                <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
                {activity.length <= MAX_MARKERS &&
                  values.map((v, i) => (
                    <g key={activity[i].date}>
                      <circle cx={x(i)} cy={y(v)} r={8} fill={color} fillOpacity={0.2} />
                      <circle cx={x(i)} cy={y(v)} r={4} fill={color} stroke={colors.white} strokeWidth={2} />
                    </g>
                  ))}
              </>
            )}

            {active !== null && (
              <g>
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={baseline}
                  stroke={colors.neutral[400]}
                />
                <circle
                  cx={x(active)}
                  cy={y(values[active])}
                  r={6}
                  fill={color}
                  stroke={colors.white}
                  strokeWidth={2}
                />
              </g>
            )}
          </svg>
        )}

        {point && (
          <Readout style={{ left: readoutLeft }} aria-live="polite">
            <span>{formatLongDay(point.date)}</span>
            <dl>
              {(Object.keys(SERIES) as Series[]).map((key) => (
                <div key={key} style={{ display: 'contents', '--key': SERIES[key].color } as CSSProperties}>
                  <dt>{SERIES[key].label}</dt>
                  <dd>{formatNumber(point[key])}</dd>
                </div>
              ))}
            </dl>
          </Readout>
        )}
      </Plot>

      <table style={visuallyHidden}>
        <caption>Processing activity per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Documents</th>
            <th scope="col">Entities</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((day) => (
            <tr key={day.date}>
              <th scope="row">{formatLongDay(day.date)}</th>
              <td>{day.documents}</td>
              <td>{day.entities}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  )
}
