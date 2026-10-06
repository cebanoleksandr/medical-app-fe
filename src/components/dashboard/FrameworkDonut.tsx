import type { CSSProperties } from 'react'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { visuallyHidden } from '@mui/utils'
import type { Dashboard, Framework } from '../../api/types'
import { colors, typography } from '../../theme'
import { Tooltip } from '../ui'
import { FRAMEWORK_COLORS, FRAMEWORK_ORDER, formatNumber } from './dashboardModel'

const WIDTH = 326
const HEIGHT = 190
const CX = WIDTH / 2
const CY = HEIGHT / 2
const OUTER = 82
const INNER = 57
/** Leader lines run this far past the ring before turning horizontal. */
const ELBOW = 14
const UNDERLINE = 64
const LABEL_GAP = 34

const Root = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  '& svg': { display: 'block', maxWidth: '100%', height: 'auto', overflow: 'visible' },
  '& text': { ...typography.bodyS, fill: colors.neutral[700] },
  '& .FrameworkDonut-value': { fontWeight: 600, fill: colors.neutral[900] },
  '& path': { cursor: 'default', transition: 'opacity 150ms', outline: 'none' },
  '& path:hover, & path:focus-visible': { opacity: 0.85 },
})

const Legend = styled('ul')({
  ...typography.bodyS,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '4px 16px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  color: colors.neutral[700],
  '& li': { display: 'flex', alignItems: 'center', gap: 8 },
  '& li::before': {
    content: '""',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--slice)',
  },
})

const polar = (angle: number, r: number) => [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]

function arc(a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0
  const [x0, y0] = polar(a0, OUTER)
  const [x1, y1] = polar(a1, OUTER)
  const [x2, y2] = polar(a1, INNER)
  const [x3, y3] = polar(a0, INNER)
  return `M${x0},${y0}A${OUTER},${OUTER} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${INNER},${INNER} 0 ${large} 0 ${x3},${y3}Z`
}

interface Slice {
  framework: Framework
  count: number
  share: number
  a0: number
  a1: number
}

/** Labels on each side are pushed apart so small neighbours don't overlap. */
function placeLabels(slices: Slice[]) {
  const placed = slices.map((slice) => {
    const mid = (slice.a0 + slice.a1) / 2
    const [ax, ay] = polar(mid, OUTER + 2)
    const right = Math.cos(mid) >= 0
    return { slice, ax, ay, right, y: polar(mid, OUTER + ELBOW)[1] }
  })
  for (const side of [true, false]) {
    const column = placed.filter((p) => p.right === side).sort((a, b) => a.y - b.y)
    for (let i = 1; i < column.length; i++) {
      column[i].y = Math.max(column[i].y, column[i - 1].y + LABEL_GAP)
    }
    // Pull the column back up if it ran off the bottom.
    const overflow = (column.at(-1)?.y ?? 0) - (HEIGHT - 4)
    if (overflow > 0) column.forEach((p) => (p.y -= overflow))
  }
  return placed
}

/** Clockwise from 12 o'clock in the fixed framework order. */
function toSlices(frameworks: Dashboard['frameworks']): Slice[] {
  const total = frameworks.reduce((sum, f) => sum + f.count, 0)
  const counts = new Map(frameworks.map((f) => [f.framework, f.count]))
  const present = FRAMEWORK_ORDER.filter((f) => (counts.get(f) ?? 0) > 0)
  let before = 0
  return present.map((framework) => {
    const count = counts.get(framework)!
    const a0 = -Math.PI / 2 + (before / total) * 2 * Math.PI
    before += count
    return { framework, count, share: count / total, a0, a1: -Math.PI / 2 + (before / total) * 2 * Math.PI }
  })
}

const percent = (share: number) => formatNumber(share, { style: 'percent', maximumFractionDigits: 0 })

/** Share of analyses per framework: a ring with labelled leader lines. */
export function FrameworkDonut({ frameworks }: { frameworks: Dashboard['frameworks'] }) {
  const { t } = useTranslation(['dashboard', 'common'])
  const name = (framework: Framework) => t(`common:frameworks.${framework}`)
  const slices = toSlices(frameworks)
  const single = slices.length === 1

  return (
    <Root>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t('frameworks.chartLabel')}>
        {slices.map((slice) => (
          <Tooltip
            key={slice.framework}
            title={t('frameworks.slice', {
              framework: name(slice.framework),
              count: formatNumber(slice.count),
              share: percent(slice.share),
            })}
            followCursor
          >
            <path
              d={single ? arc(-Math.PI / 2, (3 * Math.PI) / 2 - 1e-4) : arc(slice.a0, slice.a1)}
              fill={FRAMEWORK_COLORS[slice.framework]}
              // A 2px surface gap between neighbouring slices.
              stroke={single ? 'none' : colors.white}
              strokeWidth={2}
              tabIndex={0}
              aria-label={`${name(slice.framework)}: ${percent(slice.share)}`}
            />
          </Tooltip>
        ))}
        {placeLabels(slices).map(({ slice, ax, ay, right, y }) => {
          const ex = right ? CX + OUTER + ELBOW : CX - OUTER - ELBOW
          const end = right ? ex + UNDERLINE : ex - UNDERLINE
          const anchor = right ? 'end' : 'start'
          return (
            <g key={slice.framework} aria-hidden>
              <polyline
                points={`${ax},${ay} ${ex},${y} ${end},${y}`}
                fill="none"
                stroke={FRAMEWORK_COLORS[slice.framework]}
                strokeWidth={1}
              />
              <text x={end} y={y - 18} textAnchor={anchor}>
                {name(slice.framework)}
              </text>
              <text className="FrameworkDonut-value" x={end} y={y - 4} textAnchor={anchor}>
                {percent(slice.share)}
              </text>
            </g>
          )
        })}
      </svg>
      <Legend aria-hidden>
        {slices.map((slice) => (
          <li key={slice.framework} style={{ '--slice': FRAMEWORK_COLORS[slice.framework] } as CSSProperties}>
            {name(slice.framework)}
          </li>
        ))}
      </Legend>
      <table style={visuallyHidden}>
        <caption>{t('frameworks.chartLabel')}</caption>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.framework}>
              <th scope="row">{name(slice.framework)}</th>
              <td>{slice.count}</td>
              <td>{percent(slice.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Root>
  )
}
