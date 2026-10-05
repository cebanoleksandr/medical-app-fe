import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import warningIcon from '../assets/configuration/warning.svg'
import addIcon from '../assets/review/add.svg'
import { ActivityChart } from '../components/dashboard/ActivityChart'
import { BarChart } from '../components/dashboard/BarChart'
import { ChartCard, EmptyChart } from '../components/dashboard/ChartCard'
import {
  FRAMEWORK_LABELS,
  FRAMEWORK_ORDER,
  METHOD_LABELS,
  METHOD_ORDER,
  PERIOD_OPTIONS,
  entityLabel,
  periodParams,
  type FrameworkFilter,
  type PeriodDays,
} from '../components/dashboard/dashboardModel'
import { FrameworkDonut } from '../components/dashboard/FrameworkDonut'
import { RecentAnalyses } from '../components/dashboard/RecentAnalyses'
import { StatCards } from '../components/dashboard/StatCards'
import { Banner } from '../components/de-identify/configStyles'
import { Button, Dropdown, MaskIcon } from '../components/ui'
import { useDashboard } from '../hooks'
import { colors, typography } from '../theme'

const NEW_ANALYSIS_URL = '/app/de-identify'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  width: '100%',
  maxWidth: 1440,
  margin: '0 auto',
  padding: 32,
  '@media (max-width: 720px)': { padding: '24px 16px' },
})

/** Filters scope everything below them, so they sit in one row on top. */
const Toolbar = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  '& > .Dashboard-filter': { width: 180 },
  '& > button:last-of-type': { marginLeft: 'auto' },
})

const Welcome = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: 16,
  border: `1px solid ${colors.info}`,
  borderRadius: 8,
  backgroundColor: colors.infoLight,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  '& > div': { display: 'flex', gap: 8 },
  '& .Dashboard-info': { fontSize: 24, color: colors.info, fontWeight: 600, lineHeight: '20px' },
  '& strong': { ...typography.labelM, display: 'block', color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: '8px 0 0', color: colors.neutral[700] },
})

const ChartsRow = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16,
  '& > section': { minHeight: 315 },
  '@media (max-width: 1100px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const frameworkOptions = [
  { value: 'ALL' as const, label: 'All frameworks' },
  ...FRAMEWORK_ORDER.map((f) => ({ value: f, label: FRAMEWORK_LABELS[f] })),
]

const DashboardPage = () => {
  const navigate = useNavigate()
  const [days, setDays] = useState<PeriodDays>('7')
  const [framework, setFramework] = useState<FrameworkFilter>('ALL')
  // Recomputed on change only, so "now" doesn't shift the query key per render.
  const [params, setParams] = useState(() => periodParams('7', 'ALL'))
  const dashboard = useDashboard(params)
  const data = dashboard.data

  const changeDays = (value: PeriodDays) => {
    setDays(value)
    setParams(periodParams(value, framework))
  }
  const changeFramework = (value: FrameworkFilter) => {
    setFramework(value)
    setParams(periodParams(days, value))
  }

  // Recent analyses ignore the period: none at all means a brand-new account.
  const firstVisit = !!data && framework === 'ALL' && data.recentAnalyses.length === 0
  const periodEmpty = !!data && data.analyses.count === 0
  const busy = dashboard.isPlaceholderData
  const emptyText = firstVisit ? 'No analyses found' : 'No analyses in this period'

  const methods = data
    ? METHOD_ORDER.map((method) => ({
        key: method,
        label: METHOD_LABELS[method],
        value: data.methods.find((m) => m.method === method)?.count ?? 0,
      }))
    : []
  const entityTypes = (data?.entityTypes ?? []).map((t) => ({
    key: t.type,
    label: entityLabel(t.type),
    value: t.count,
  }))

  const newAnalysis = (
    <Button
      variant="secondary"
      size="medium"
      startIcon={<MaskIcon src={addIcon} />}
      onClick={() => navigate(NEW_ANALYSIS_URL)}
    >
      New analysis
    </Button>
  )

  return (
    <Root>
      {firstVisit ? (
        <Welcome role="status">
          <div>
            <span className="Dashboard-info" aria-hidden>
              i
            </span>
            <div>
              <strong>Welcome to De-ID Studio</strong>
              <p>Run your first analysis to see activity and statistics here.</p>
            </div>
          </div>
          {newAnalysis}
        </Welcome>
      ) : (
        <Toolbar>
          <Dropdown<PeriodDays>
            className="Dashboard-filter"
            size="compact"
            options={PERIOD_OPTIONS}
            value={days}
            onChange={changeDays}
            aria-label="Period"
          />
          <Dropdown<FrameworkFilter>
            className="Dashboard-filter"
            size="compact"
            options={frameworkOptions}
            value={framework}
            onChange={changeFramework}
            aria-label="Framework"
          />
          {newAnalysis}
        </Toolbar>
      )}

      {dashboard.isError && !data && (
        <Banner role="alert" data-tone="error">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>Couldn&apos;t load the dashboard</strong>
            <p>{dashboard.error.message}</p>
          </div>
        </Banner>
      )}

      <StatCards data={data} empty={periodEmpty} />

      <ActivityChart activity={data?.activity ?? []} busy={busy} />

      <ChartsRow>
        <ChartCard
          id="method-usage-heading"
          title="De-Identification Method Usage"
          subtitle={
            firstVisit
              ? 'Methods will appear after your first analysis'
              : 'Popular methods applied to detected entities'
          }
          busy={busy}
        >
          {methods.some((m) => m.value > 0) ? (
            <BarChart rows={methods} color={colors.accent[400]} noun="methods" />
          ) : (
            <EmptyChart picture="methods" text={emptyText} />
          )}
        </ChartCard>

        <ChartCard
          id="framework-usage-heading"
          title="Compliance Framework Usage"
          subtitle={
            firstVisit
              ? 'Framework distribution will appear after your first analysis'
              : 'Distribution of frameworks applied across analyses'
          }
          busy={busy}
        >
          {data && data.frameworks.length > 0 ? (
            <FrameworkDonut frameworks={data.frameworks} />
          ) : (
            <EmptyChart picture="frameworks" text={emptyText} />
          )}
        </ChartCard>

        <ChartCard
          id="entity-types-heading"
          title="Entity Types Detected"
          subtitle={
            firstVisit
              ? 'Entity breakdown will appear after your first analysis'
              : 'Distribution of PII entities found in documents'
          }
          busy={busy}
        >
          {entityTypes.some((t) => t.value > 0) ? (
            <BarChart
              rows={entityTypes}
              color={colors.primary[500]}
              collapsedRows={6}
              noun="entity types"
            />
          ) : (
            <EmptyChart picture="entityTypes" text={emptyText} />
          )}
        </ChartCard>
      </ChartsRow>

      <RecentAnalyses
        recent={data?.recentAnalyses}
        framework={framework === 'ALL' ? undefined : framework}
      />
    </Root>
  )
}

export default DashboardPage;
