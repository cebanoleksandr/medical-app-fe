import type { CSSProperties, ReactNode } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
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
  FRAMEWORK_NAMES,
  LEVEL_LABELS,
  QUALITY,
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

const BANNER: Record<ResultStatus, { icon: string; text: string }> = {
  passed: { icon: bannerSuccessIcon, text: 'Generation completed' },
  warning: { icon: bannerWarningIcon, text: 'Passed with warnings' },
  failed: { icon: bannerErrorIcon, text: 'Failed' },
}

/** Verdict of the validation; a spinner while it runs. */
export function StatusBanner({ status }: { status: ResultStatus | undefined }) {
  if (!status) {
    return (
      <BannerRoot data-status="pending" role="status">
        <CircularProgress size={28} thickness={4} color="inherit" />
        <p>Validating dataset…</p>
      </BannerRoot>
    )
  }
  const { icon, text } = BANNER[status]
  return (
    <BannerRoot data-status={status} role="status">
      <Glyph src={icon} size={36} />
      <p>{text}</p>
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
  gridTemplateColumns: 'var(--key) minmax(0, 1fr)',
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
        title="Compliance"
        accent={report ? TONE_COLOR[complianceTone] : pendingAccent}
      >
        {facts(100, [
          ['Framework:', FRAMEWORK_NAMES[dataset.framework].short],
          ['Risk level:', report ? LEVEL_LABELS[report.compliance.riskLevel] : PENDING],
          [
            'Direct identifiers:',
            report ? (
              <span style={detected ? { color: colors.error } : undefined}>
                {detected ? 'Detected' : 'Not detected'}
              </span>
            ) : (
              PENDING
            ),
          ],
        ])}
      </SummaryCard>

      <SummaryCard
        icon={<Glyph src={financeModeIcon} size={16} />}
        title="Data Quality"
        accent={statusAccent}
      >
        {facts(75, [
          ['Quality:', report ? QUALITY[report.quality.quality].label : PENDING],
          ['Consistency:', report ? LEVEL_LABELS[report.quality.consistency] : PENDING],
          [
            'Warnings:',
            !report ? (
              PENDING
            ) : detected ? (
              <Badge data-tone="error">Direct identifiers</Badge>
            ) : warnings ? (
              <Badge data-tone="warning">{warnings} low-confidence</Badge>
            ) : (
              'None'
            ),
          ],
        ])}
      </SummaryCard>

      <SummaryCard
        icon={<Glyph src={arrowCircleDownIcon} size={16} />}
        title="Export"
        accent={statusAccent}
      >
        <Note>
          {failed ? (
            <Glyph src={cancelIcon} size={24} slot={16} color={colors.error} />
          ) : (
            <Glyph src={checkCircleIcon} size={16} color={status ? colors.success : colors.neutral[400]} />
          )}
          {!status ? 'Checking…' : failed ? 'Do not download' : 'Ready to download'}
        </Note>
        <Note>
          <Glyph src={arrowCircleDownIcon} size={16} color={colors.neutral[500]} />
          Session only — download before leaving
        </Note>
      </SummaryCard>

      <SummaryCard
        icon={<Glyph src={tableChartIcon} size={24} slot={16} />}
        title="Dataset Summary"
        accent={colors.neutral[100]}
      >
        {facts(52, [
          ['Format:', dataset.format],
          ['Records:', formatRecords(dataset.records)],
          ['Fields:', formatRecords(dataset.fields)],
        ])}
      </SummaryCard>
    </Row>
  )
}
