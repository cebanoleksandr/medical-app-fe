import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { Dashboard } from '../../api/types'
import descriptionIcon from '../../assets/dashboard/description.svg'
import financeModeIcon from '../../assets/dashboard/finance-mode.svg'
import manageSearchIcon from '../../assets/dashboard/manage-search.svg'
import playlistCheckIcon from '../../assets/dashboard/playlist-check.svg'
import { colors, media, shadows, typography } from '../../theme'
import { MaskIcon } from '../ui'
import { formatNumber, formatRate } from './dashboardModel'

const Row = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 16,
  '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  [media.mobile]: { gap: 12 },
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
  // Phones: two per row, the icon above the label.
  [media.mobile]: {
    padding: '0 16px',
    '& > div': { flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '16px 0' },
    '& h2': { ...typography.bodyS, whiteSpace: 'normal' },
    '& p': { ...typography.h4 },
  },
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
  [media.mobile]: { width: 32, height: 32, fontSize: 20 },
  '[data-empty] &': { backgroundColor: colors.neutral[100], color: colors.neutral[500] },
})

interface StatCardsProps {
  data: Dashboard | undefined
  empty: boolean
}

/** Documents, entities, anonymization rate and synthetic records for the period. */
export function StatCards({ data, empty }: StatCardsProps) {
  const { t } = useTranslation('dashboard')
  const stats = [
    { label: t('stats.documents'), icon: descriptionIcon, value: data && formatNumber(data.analyses.count) },
    {
      label: t('stats.entities'),
      icon: manageSearchIcon,
      value: data && formatNumber(data.analyses.entitiesDetected),
    },
    {
      label: t('stats.rate'),
      icon: playlistCheckIcon,
      value: data && (empty ? formatNumber(0) : formatRate(data.analyses.anonymizationRate)),
    },
    {
      label: t('stats.records'),
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
