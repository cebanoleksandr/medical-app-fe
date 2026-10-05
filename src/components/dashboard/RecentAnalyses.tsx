import { useState } from 'react'
import { styled } from '@mui/material/styles'
import type { AnalysisSummary, Framework } from '../../api/types'
import descriptionIcon from '../../assets/generated/description.svg'
import { useAnalysesList } from '../../hooks'
import { colors, shadows, typography } from '../../theme'
import { Glyph } from '../generated/parts'
import { Dot } from '../generated/styles'
import { Button } from '../ui'
import { FRAMEWORK_LABELS, formatDate, formatNumber } from './dashboardModel'

const PAGE = 20

const Root = styled('section')({
  minWidth: 0,
  overflow: 'hidden',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
})

const Header = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 24px',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: '4px 0 0', color: colors.neutral[500] },
  '@media (max-width: 720px)': { padding: 16 },
})

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
})

const Document = styled('span')({ display: 'flex', alignItems: 'center', gap: 8 })

const Status = styled(Dot)({ color: colors.neutral[700], '--dot': colors.success })

const Message = styled('td')({
  '&&': { height: 88, textAlign: 'center', color: colors.neutral[500] },
})

const More = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: 12,
  borderTop: `1px solid ${colors.neutral[100]}`,
})

interface RecentAnalysesProps {
  recent: AnalysisSummary[] | undefined
  framework: Framework | undefined
}

/** The latest analyses; "View all" pages through the rest in place. */
export function RecentAnalyses({ recent, framework }: RecentAnalysesProps) {
  const [all, setAll] = useState(false)
  const list = useAnalysesList({ limit: PAGE, framework, enabled: all })
  const rows = all ? list.data?.pages.flat() : recent
  const scope = framework ? FRAMEWORK_LABELS[framework] : 'all compliance frameworks'

  return (
    <Root aria-labelledby="recent-activity-heading">
      <Header>
        <div>
          <h2 id="recent-activity-heading">Recent Activity</h2>
          <p>{all ? `All analyses across ${scope}, newest first` : `Last 5 analyses across ${scope}`}</p>
        </div>
        {(all || (recent?.length ?? 0) >= 5) && (
          <Button variant="ghost" size="medium" onClick={() => setAll((value) => !value)}>
            {all ? 'Show recent' : 'View all'}
          </Button>
        )}
      </Header>
      <Scroller>
        <Table>
          <thead>
            <tr>
              <th scope="col">Document</th>
              <th scope="col">Status</th>
              <th scope="col">Framework</th>
              <th scope="col">Entities</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {all && list.isError ? (
              <tr>
                <Message colSpan={5} role="alert">
                  Couldn&apos;t load analyses: {list.error.message}
                </Message>
              </tr>
            ) : !rows ? (
              <tr>
                <Message colSpan={5}>Loading…</Message>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <Message colSpan={5}>No analyses yet</Message>
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
                  <td>{FRAMEWORK_LABELS[analysis.framework]}</td>
                  <td>{formatNumber(analysis.detected)}</td>
                  <td>{formatDate(analysis.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Scroller>
      {all && list.hasNextPage && (
        <More>
          <Button
            variant="ghostSecondary"
            size="medium"
            disabled={list.isFetchingNextPage}
            onClick={() => list.fetchNextPage()}
          >
            {list.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </More>
      )}
    </Root>
  )
}
