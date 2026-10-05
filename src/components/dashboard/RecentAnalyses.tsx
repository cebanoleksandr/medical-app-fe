import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import type { AnalysisSummary, Framework } from '../../api/types'
import { colors, shadows, typography } from '../../theme'
import { Button } from '../ui'
import { AnalysesTable } from './AnalysesTable'
import { ALL_ANALYSES_URL, FRAMEWORK_LABELS } from './dashboardModel'

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

interface RecentAnalysesProps {
  recent: AnalysisSummary[] | undefined
  framework: Framework | undefined
}

/** The latest five analyses; "View all" opens the full, filterable list. */
export function RecentAnalyses({ recent, framework }: RecentAnalysesProps) {
  const navigate = useNavigate()
  const scope = framework ? FRAMEWORK_LABELS[framework] : 'all compliance frameworks'

  return (
    <Root aria-labelledby="recent-activity-heading">
      <Header>
        <div>
          <h2 id="recent-activity-heading">Recent Activity</h2>
          <p>Last 5 analyses across {scope}</p>
        </div>
        {!!recent?.length && (
          <Button
            variant="ghost"
            size="medium"
            onClick={() =>
              navigate(framework ? `${ALL_ANALYSES_URL}?framework=${framework}` : ALL_ANALYSES_URL)
            }
          >
            View all
          </Button>
        )}
      </Header>
      <AnalysesTable rows={recent} />
    </Root>
  )
}
