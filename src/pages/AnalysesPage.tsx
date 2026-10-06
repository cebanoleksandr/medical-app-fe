import Pagination from '@mui/material/Pagination'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Framework, type AnalysesFilter } from '../api/types'
import warningIcon from '../assets/configuration/warning.svg'
import addIcon from '../assets/review/add.svg'
import downloadIcon from '../assets/review/report.svg'
import { AnalysesTable } from '../components/dashboard/AnalysesTable'
import { FRAMEWORK_ORDER, type FrameworkFilter } from '../components/dashboard/dashboardModel'
import { Banner } from '../components/de-identify/configStyles'
import { Button, DateRangePicker, Dropdown, MaskIcon, type DateRange } from '../components/ui'
import { useAnalysesPage, useExportAnalyses } from '../hooks'
import { colors, shadows, typography } from '../theme'

const PAGE_SIZE = 10
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

const Toolbar = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  '& > .Analyses-filter': { width: 180 },
  '& > button:last-of-type': { marginLeft: 'auto' },
})

const Card = styled('section')({
  minWidth: 0,
  overflow: 'hidden',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 16,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  transition: 'opacity 150ms',
  '&[aria-busy="true"]': { opacity: 0.6 },
})

const Footer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '8px 24px 16px',
  backgroundColor: colors.neutral[50],
  '@media (max-width: 720px)': { padding: '8px 16px 16px' },
})

// Figma: 40px round items 6px apart, the current page on primary-50.
const Pager = styled(Pagination)({
  '& ul': { gap: 6 },
  '& .MuiPaginationItem-root': {
    ...typography.bodyM,
    width: 40,
    height: 40,
    margin: 0,
    borderRadius: '50%',
    color: colors.neutral[900],
    '& svg': { fontSize: 22, color: colors.neutral[700] },
    '&:hover': { backgroundColor: colors.neutral[100] },
    '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: colors.primary[50] },
    '&.Mui-disabled': { opacity: 1, '& svg': { color: colors.neutral[300] } },
    '&.Mui-focusVisible': { outline: `2px solid ${colors.primary[300]}` },
  },
  '& .MuiPaginationItem-ellipsis': { lineHeight: '40px' },
})


// Days travel in the URL as yyyy-mm-dd, in the user's zone.
const pad = (n: number) => String(n).padStart(2, '0')
const toParam = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function fromParam(value: string | null): Date | null {
  const match = value && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

const isFramework = (value: string | null): value is Framework =>
  !!value && Object.values(Framework).includes(value as Framework)

/** Every past analysis, filterable by framework and day, ten per page. */
const AnalysesPage = () => {
  const { t } = useTranslation(['analyses', 'common'])
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const frameworkParam = params.get('framework')
  const framework = isFramework(frameworkParam) ? frameworkParam : undefined
  const range: DateRange = { from: fromParam(params.get('from')), to: fromParam(params.get('to')) }
  const page = Math.max(1, Number(params.get('page')) || 1)

  const filter: AnalysesFilter = {
    framework,
    from: range.from?.toISOString(),
    to: range.to ? endOfDay(range.to).toISOString() : undefined,
  }
  const list = useAnalysesPage({ ...filter, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
  const exportCsv = useExportAnalyses()
  const data = list.data
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1
  const filtered = !!framework || !!range.from
  const frameworkOptions = [
    { value: 'ALL' as const, label: t('common:frameworkFilter.all') },
    ...FRAMEWORK_ORDER.map((f) => ({ value: f, label: t(`common:frameworks.${f}`) })),
  ]

  /** Changing a filter goes back to page 1. */
  const update = (changes: Record<string, string | null>) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      if (!('page' in changes)) next.delete('page')
      return next
    })

  return (
    <Root>
      <Toolbar>
        <Dropdown<FrameworkFilter>
          className="Analyses-filter"
          size="compact"
          options={frameworkOptions}
          value={framework ?? 'ALL'}
          onChange={(value) => update({ framework: value === 'ALL' ? null : value })}
          aria-label={t('common:frameworkFilter.label')}
        />
        <DateRangePicker
          className="Analyses-filter"
          value={range}
          onChange={({ from, to }) =>
            update({ from: from && toParam(from), to: to && toParam(to) })
          }
          aria-label={t('table.date')}
        />
        <Button
          variant="secondary"
          size="medium"
          startIcon={<MaskIcon src={addIcon} />}
          onClick={() => navigate(NEW_ANALYSIS_URL)}
        >
          {t('common:actions.newAnalysis')}
        </Button>
      </Toolbar>

      {exportCsv.isError && (
        <Banner role="alert" data-tone="error">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>{t('exportFailed')}</strong>
            <p>{exportCsv.error.message}</p>
          </div>
        </Banner>
      )}

      <Card aria-label={t('table.label')} aria-busy={list.isPlaceholderData || undefined}>
        <AnalysesTable
          layout="full"
          rows={data?.items}
          error={list.error}
          emptyText={filtered ? t('table.noMatch') : t('table.empty')}
        />
        {!!data?.total && (
          <Footer>
            <Pager
              count={pages}
              page={Math.min(page, pages)}
              onChange={(_, value) => update({ page: value > 1 ? String(value) : null })}
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              aria-label={t('common:pagination.label')}
              getItemAriaLabel={(type, value, selected) =>
                type === 'page'
                  ? selected
                    ? t('common:pagination.current', { page: value })
                    : t('common:pagination.page', { page: value })
                  : type === 'start-ellipsis' || type === 'end-ellipsis'
                    ? t('common:pagination.ellipsis')
                    : t(`common:pagination.${type}`)
              }
            />
            <Button
              variant="ghost"
              size="medium"
              startIcon={<MaskIcon src={downloadIcon} />}
              disabled={exportCsv.isPending}
              onClick={() => exportCsv.mutate(filter)}
            >
              {exportCsv.isPending ? t('common:actions.exporting') : t('common:actions.exportCsv')}
            </Button>
          </Footer>
        )}
      </Card>
    </Root>
  )
}

export default AnalysesPage;
