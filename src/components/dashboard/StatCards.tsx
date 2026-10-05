import { styled } from '@mui/material/styles'
import type { Dashboard } from '../../api/types'
import descriptionIcon from '../../assets/dashboard/description.svg'
import financeModeIcon from '../../assets/dashboard/finance-mode.svg'
import manageSearchIcon from '../../assets/dashboard/manage-search.svg'
import playlistCheckIcon from '../../assets/dashboard/playlist-check.svg'
import { colors, shadows, typography } from '../../theme'
import { MaskIcon } from '../ui'
import { formatNumber, formatRate } from './dashboardModel'

const Row = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 16,
  '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  '@media (max-width: 560px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const Card = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: '0 20px',
  overflow: 'hidden',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  '&::before': {
    content: '""',
    height: 3,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  '& > div': { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0' },
  '& h2': { ...typography.bodyM, margin: 0, color: colors.neutral[500], whiteSpace: 'nowrap' },
  '& p': { ...typography.h3, margin: '4px 0 0', color: colors.neutral[900] },
})

const Icon = styled('span')({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: colors.primary[50],
  color: colors.primary[500],
  fontSize: 24,
  '[data-empty] &': { backgroundColor: colors.neutral[100], color: colors.neutral[500] },
})

interface StatCardsProps {
  data: Dashboard | undefined
  empty: boolean
}

/** Documents, entities, anonymization rate and synthetic records for the period. */
export function StatCards({ data, empty }: StatCardsProps) {
  const stats = [
    { label: 'Total Documents', icon: descriptionIcon, value: data && formatNumber(data.analyses.count) },
    {
      label: 'Entities Detected',
      icon: manageSearchIcon,
      value: data && formatNumber(data.analyses.entitiesDetected),
    },
    {
      label: 'Anonymization Rate',
      icon: playlistCheckIcon,
      value: data && (empty ? '0' : formatRate(data.analyses.anonymizationRate)),
    },
    {
      label: 'Synthetic Records',
      icon: financeModeIcon,
      value: data && formatNumber(data.datasets.recordsGenerated),
    },
  ]

  return (
    <Row data-empty={empty || undefined}>
      {stats.map((stat) => (
        <Card key={stat.label} aria-label={stat.label}>
          <div>
            <Icon>
              <MaskIcon src={stat.icon} aria-hidden />
            </Icon>
            <div>
              <h2>{stat.label}</h2>
              <p>{stat.value ?? '…'}</p>
            </div>
          </div>
        </Card>
      ))}
    </Row>
  )
}
