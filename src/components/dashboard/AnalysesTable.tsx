import { styled } from '@mui/material/styles'
import type { AnalysisSummary } from '../../api/types'
import descriptionIcon from '../../assets/generated/description.svg'
import { colors, typography } from '../../theme'
import { Glyph } from '../generated/parts'
import { Dot } from '../generated/styles'
import { FRAMEWORK_LABELS, formatDate, formatNumber } from './dashboardModel'

const Scroller = styled('div')({ overflowX: 'auto' })

const Table = styled('table')({
  width: '100%',
  minWidth: 640,
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  '& th': {
    ...typography.labelL,
    padding: '8px 24px',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    backgroundColor: colors.neutral[50],
    color: colors.neutral[500],
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  '& td': {
    ...typography.bodyM,
    height: 44,
    padding: '0 24px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
    color: colors.neutral[900],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& tbody tr:last-of-type td': { borderBottom: 0 },
  // The full list (All Analyses): taller header, numbers and dates on the right.
  '&[data-layout="full"]': {
    '& th': { padding: '16px 16px 8px 24px' },
    '& .AnalysesTable-end': { textAlign: 'right' },
  },
})

const Document = styled('span')({ display: 'flex', alignItems: 'center', gap: 8 })

const Status = styled(Dot)({ color: colors.neutral[700], '--dot': colors.success })

const Message = styled('td')({
  '&&': { height: 88, textAlign: 'center', color: colors.neutral[500] },
})

interface AnalysesTableProps {
  rows: AnalysisSummary[] | undefined
  error?: Error | null
  layout?: 'compact' | 'full'
  emptyText?: string
}

/** Past analyses: what the server keeps about each one, never the text. */
export function AnalysesTable({
  rows,
  error,
  layout = 'compact',
  emptyText = 'No analyses yet',
}: AnalysesTableProps) {
  const end = layout === 'full' ? 'AnalysesTable-end' : undefined
  return (
    <Scroller>
      <Table data-layout={layout}>
        <thead>
          <tr>
            <th scope="col">Document</th>
            <th scope="col">Status</th>
            <th scope="col" className={end}>Framework</th>
            <th scope="col" className={end}>Entities</th>
            <th scope="col" className={end}>Date</th>
          </tr>
        </thead>
        <tbody>
          {error && !rows ? (
            <tr>
              <Message colSpan={5} role="alert">
                Couldn&apos;t load analyses: {error.message}
              </Message>
            </tr>
          ) : !rows ? (
            <tr>
              <Message colSpan={5}>Loading…</Message>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <Message colSpan={5}>{emptyText}</Message>
            </tr>
          ) : (
            rows.map((analysis) => (
              <tr key={analysis.id}>
                <td>
                  {/* The server keeps no file names or text, only the length. */}
                  <Document>
                    <Glyph src={descriptionIcon} size={16} />
                    {formatNumber(analysis.characters)} characters · {analysis.language.toUpperCase()}
                  </Document>
                </td>
                <td>
                  {/* Only finished analyses are stored. */}
                  <Status>Completed</Status>
                </td>
                <td className={end}>{FRAMEWORK_LABELS[analysis.framework]}</td>
                <td className={end}>{formatNumber(analysis.detected)}</td>
                <td className={end}>{formatDate(analysis.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Scroller>
  )
}
