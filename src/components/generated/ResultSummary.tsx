import type { CSSProperties, ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { Dataset, ValidationReport } from '../../api/types'
import arrowCircleDownIcon from '../../assets/generated/arrow-circle-down.svg'
import bannerErrorIcon from '../../assets/generated/banner-error.svg'
import bannerSuccessIcon from '../../assets/generated/banner-success.svg'
import bannerWarningIcon from '../../assets/generated/banner-warning.svg'
import cancelIcon from '../../assets/generated/cancel.svg'
import checkCircleIcon from '../../assets/generated/check-circle.svg'
import financeModeIcon from '../../assets/generated/finance-mode.svg'
import tableChartIcon from '../../assets/generated/table-chart-view.svg'
import verifiedIcon from '../../assets/generated/verified.svg'
import { colors, shadows, typography } from '../../theme'
import { formatRecords } from '../synthetic/generationSettings'
import { Glyph } from './parts'
import { TONE_COLOR } from './styles'
import {
  frameworkName,
  levelLabel,
  qualityLabel,
  STATUS_TONE,
  type ResultStatus,
  type Tone,
} from './resultModel'

const BannerRoot = styled('div')({
  ...typography.bodyL,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 24px',
  border: '1px solid',
  borderRadius: 8,
  boxShadow: shadows.sm,
  '& > p': { margin: 0 },
  '& .MuiCircularProgress-root': { margin: 4 },
  '&[data-status="passed"]': {
    borderColor: colors.neutral[100],
    backgroundColor: 'rgba(220, 252, 231, 0.22)',
    color: colors.success,
  },
  '&[data-status="warning"]': {
    borderColor: 'rgba(254, 249, 195, 0.3)',
    backgroundColor: 'rgba(254, 249, 195, 0.3)',
    color: colors.warning,
  },
  '&[data-status="failed"]': {
    borderColor: colors.errorLight,
    backgroundColor: 'rgba(254, 226, 226, 0.4)',
    color: colors.error,
  },
  '&[data-status="pending"]': {
    borderColor: colors.neutral[100],
    backgroundColor: colors.white,
    color: colors.neutral[500],
  },
})

// Texts are `synthetic:result.banner.<status>`.
const BANNER_ICONS: Record<ResultStatus, string> = {
  passed: bannerSuccessIcon,
  warning: bannerWarningIcon,
  failed: bannerErrorIcon,
}

/** Verdict of the validation; a spinner while it runs. */
export function StatusBanner({ status }: { status: ResultStatus | undefined }) {
  const { t } = useTranslation('synthetic')
  if (!status) {
    return (
      <BannerRoot data-status="pending" role="status">
        <CircularProgress size={28} thickness={4} color="inherit" />
        <p>{t('result.banner.pending')}</p>
      </BannerRoot>
    )
  }
  return (
    <BannerRoot data-status={status} role="status">
      <Glyph src={BANNER_ICONS[status]} size={36} />
      <p>{t(`result.banner.${status}`)}</p>
    </BannerRoot>
  )
}

const Row = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) minmax(0, 340px)',
  gap: 24,
  '@media (max-width: 1100px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  '@media (max-width: 600px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const Card = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minWidth: 0,
  minHeight: 133,
  padding: 16,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  color: colors.neutral[700],
  '& > h3': {
    ...typography.labelS,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: 0,
    textTransform: 'uppercase',
  },
  '& > hr': {
    width: '100%',
    height: 1,
    margin: 0,
    border: 0,
    backgroundColor: 'var(--accent)',
  },
})

const Facts = styled('dl')({
  ...typography.bodyS,
  display: 'grid',
  gridTemplateColumns: 'minmax(var(--key), max-content) minmax(0, 1fr)',
  columnGap: 8,
  rowGap: 4,
  margin: 0,
  '& dt': { fontWeight: 500 },
  '& dd': { margin: 0, minWidth: 0 },
})

const Note = styled('p')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  margin: 0,
})

const Badge = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  maxWidth: '100%',
  padding: '0 4px',
  borderRadius: 9999,
  whiteSpace: 'nowrap',
  '&::before': {
    content: '""',
    flexShrink: 0,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  '&[data-tone="warning"]': { backgroundColor: 'rgba(254, 249, 195, 0.3)', color: colors.warning },
  '&[data-tone="error"]': { backgroundColor: colors.errorLight, color: colors.error },
})

const PENDING = '…'

interface SummaryCardProps {
  icon: ReactNode
  title: string
  accent: string
  children: ReactNode
}

function SummaryCard({ icon, title, accent, children }: SummaryCardProps) {
  return (
    <Card style={{ '--accent': accent } as CSSProperties}>
      <h3>
        {icon}
        {title}
      </h3>
      <hr />
      {children}
    </Card>
  )
}

function facts(keyWidth: number, rows: [string, ReactNode][]) {
  return (
    <Facts style={{ '--key': `${keyWidth}px` } as CSSProperties}>
      {rows.map(([key, value]) => (
        <div key={key} style={{ display: 'contents' }}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </Facts>
  )
}

interface SummaryCardsProps {
  dataset: Dataset
  report: ValidationReport | undefined
  status: ResultStatus | undefined
}

/** Compliance, data quality, export readiness and the dataset's shape. */
export function SummaryCards({ dataset, report, status }: SummaryCardsProps) {
  const { t } = useTranslation('synthetic')
  const pendingAccent = colors.neutral[200]
  const statusAccent = status ? TONE_COLOR[STATUS_TONE[status]] : pendingAccent
  const detected = report?.compliance.directIdentifiers === 'DETECTED'
  const complianceTone: Tone =
    detected || report?.compliance.riskLevel === 'HIGH' ? 'error' : 'success'
  const warnings = report?.quality.warnings ?? 0
  const failed = status === 'failed'

  return (
    <Row>
      <SummaryCard
        icon={<Glyph src={verifiedIcon} size={24} slot={16} />}
        title={t('result.cards.compliance')}
        accent={report ? TONE_COLOR[complianceTone] : pendingAccent}
      >
        {facts(100, [
          [t('result.cards.framework'), frameworkName(dataset.framework, 'short')],
          [t('result.cards.risk'), report ? levelLabel(report.compliance.riskLevel) : PENDING],
          [
            t('result.cards.identifiers'),
            report ? (
              <span style={detected ? { color: colors.error } : undefined}>
                {detected ? t('result.cards.detected') : t('result.cards.notDetected')}
              </span>
            ) : (
              PENDING
            ),
          ],
        ])}
      </SummaryCard>

      <SummaryCard
        icon={<Glyph src={financeModeIcon} size={16} />}
        title={t('result.cards.quality')}
        accent={statusAccent}
      >
        {facts(75, [
          [t('result.cards.qualityRow'), report ? qualityLabel(report.quality.quality) : PENDING],
          [t('result.cards.consistency'), report ? levelLabel(report.quality.consistency) : PENDING],
          [
            t('result.cards.warnings'),
            !report ? (
              PENDING
            ) : detected ? (
              <Badge data-tone="error">{t('result.cards.directIdentifiers')}</Badge>
            ) : warnings ? (
              <Badge data-tone="warning">
                {t('result.cards.lowConfidence', { count: warnings })}
              </Badge>
            ) : (
              t('result.cards.none')
            ),
          ],
        ])}
      </SummaryCard>

      <SummaryCard
        icon={<Glyph src={arrowCircleDownIcon} size={16} />}
        title={t('result.cards.export')}
        accent={statusAccent}
      >
        <Note>
          {failed ? (
            <Glyph src={cancelIcon} size={24} slot={16} color={colors.error} />
          ) : (
            <Glyph src={checkCircleIcon} size={16} color={status ? colors.success : colors.neutral[400]} />
          )}
          {!status
            ? t('result.cards.checking')
            : failed
              ? t('result.cards.doNotDownload')
              : t('result.cards.ready')}
        </Note>
        <Note>
          <Glyph src={arrowCircleDownIcon} size={16} color={colors.neutral[500]} />
          {t('result.cards.session')}
        </Note>
      </SummaryCard>

      <SummaryCard
        icon={<Glyph src={tableChartIcon} size={24} slot={16} />}
        title={t('result.cards.summary')}
        accent={colors.neutral[100]}
      >
        {facts(52, [
          [t('result.cards.format'), dataset.format],
          [t('result.cards.records'), formatRecords(dataset.records)],
          [t('result.cards.fields'), formatRecords(dataset.fields)],
        ])}
      </SummaryCard>
    </Row>
  )
}
