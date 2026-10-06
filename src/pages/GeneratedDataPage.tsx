import { useState } from 'react'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/errors'
import type { Dataset, DatasetRecord } from '../api/types'
import autorenewIcon from '../assets/configuration/autorenew.svg'
import warningIcon from '../assets/configuration/warning.svg'
import downloadIcon from '../assets/review/report.svg'
import { Banner } from '../components/de-identify/configStyles'
import { ColumnsDrawer } from '../components/generated/ColumnsDrawer'
import { CompliancePanel } from '../components/generated/CompliancePanel'
import { DownloadPopup, type DownloadOptions } from '../components/generated/DownloadPopup'
import { RecordDrawer } from '../components/generated/RecordDrawer'
import { RecordsTable } from '../components/generated/RecordsTable'
import { RegeneratePopup } from '../components/generated/RegeneratePopup'
import { StatusBanner, SummaryCards } from '../components/generated/ResultSummary'
import {
  QUALITY_COLUMN,
  defaultColumns,
  resultStatus,
  saveSchemaSummary,
  saveValidationReport,
} from '../components/generated/resultModel'
import { ValidationPopup } from '../components/generated/ValidationPopup'
import { Button, MaskIcon } from '../components/ui'
import {
  useDataset,
  useDatasetRecords,
  useDatasetValidation,
  useDownloadDataset,
  useRegenerateDataset,
} from '../hooks'
import { colors, shadows, typography } from '../theme'

const SETTINGS_URL = '/app/synthetic/settings'
const resultUrl = (id: string) => `/app/synthetic/result?dataset=${id}`

// Fills AppLayout's content area: the results scroll, the footer stays put.
const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
})

const Body = styled('div')({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '24px 32px',
  '@media (max-width: 720px)': { padding: '24px 16px' },
})

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  maxWidth: 1440,
  margin: '0 auto',
})

const Workspace = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 340px',
  gap: 24,
  alignItems: 'stretch',
  '@media (max-width: 1024px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const Footer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 24,
  flexShrink: 0,
  padding: '16px 32px',
  borderTop: `1px solid ${colors.neutral[200]}`,
  backgroundColor: colors.white,
  '@media (max-width: 720px)': { padding: 16, gap: 8, '& > button': { flex: 1 } },
})

const Empty = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: 48,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  textAlign: 'center',
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

function ErrorBanner({ title, message }: { title: string; message: string }) {
  return (
    <Banner role="alert" data-tone="error">
      <MaskIcon src={warningIcon} aria-hidden />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </Banner>
  )
}

/** Shown without a dataset: nothing generated yet, it expired, or it failed to load. */
function NoDataset({ title, message }: { title: string; message: string }) {
  const { t } = useTranslation('synthetic')
  const navigate = useNavigate()
  return (
    <Body>
      <Wrapper>
        <Empty>
          <h2>{title}</h2>
          <p>{message}</p>
          <Button variant="secondary" size="medium" onClick={() => navigate(SETTINGS_URL)}>
            {t('result.page.goToSettings')}
          </Button>
        </Empty>
      </Wrapper>
    </Body>
  )
}

const GeneratedDataPage = () => {
  const { t } = useTranslation('synthetic')
  const [params] = useSearchParams()
  const datasetId = params.get('dataset') ?? undefined
  const dataset = useDataset(datasetId)

  if (!datasetId) {
    return (
      <NoDataset
        title={t('result.page.noDataset')}
        message={t('result.page.noDatasetText')}
      />
    )
  }
  if (dataset.isError) {
    const gone = dataset.error instanceof ApiError && dataset.error.isGone
    return (
      <NoDataset
        title={gone ? t('result.page.expired') : t('result.page.loadFailed')}
        message={gone ? t('result.page.expiredText') : dataset.error.message}
      />
    )
  }
  if (!dataset.data) {
    return (
      <Body>
        <Wrapper>
          <StatusBanner status={undefined} />
        </Wrapper>
      </Body>
    )
  }
  // Regenerating swaps the id: start over with default columns and no dialogs.
  return <GeneratedData key={dataset.data.id} dataset={dataset.data} />
}

type Dialog = 'columns' | 'validation' | 'regenerate' | 'download' | null

function GeneratedData({ dataset }: { dataset: Dataset }) {
  const { t } = useTranslation(['synthetic', 'common'])
  const navigate = useNavigate()
  const validation = useDatasetValidation(dataset.id)
  const [columns, setColumns] = useState(() => defaultColumns(dataset))
  const records = useDatasetRecords(dataset.id, {
    columns: columns.filter((key) => key !== QUALITY_COLUMN),
  })
  const regenerate = useRegenerateDataset()
  const download = useDownloadDataset()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [viewing, setViewing] = useState<DatasetRecord | null>(null)

  const report = validation.data
  const status = report ? resultStatus(report) : undefined
  // A failed validation request shouldn't lock the user out of their data.
  const canDownload = status ? status !== 'failed' : validation.isError
  const close = () => setDialog(null)

  const onRegenerate = () =>
    regenerate.mutate(dataset.id, {
      onSuccess: (next) => navigate(resultUrl(next.id), { replace: true }),
    })

  const onDownload = (options: DownloadOptions) =>
    download.mutate(
      { id: dataset.id },
      {
        onSuccess: () => {
          if (options.validationReport && report) saveValidationReport(report)
          if (options.schemaSummary) saveSchemaSummary(dataset)
          close()
        },
      },
    )

  const openDownload = () => {
    download.reset()
    setDialog('download')
  }

  return (
    <Root>
      <Body>
        <Wrapper>
          {validation.isError ? (
            <ErrorBanner
              title={t('result.page.validateFailed')}
              message={t('result.page.validateFailedText', { message: validation.error.message })}
            />
          ) : (
            <StatusBanner status={status} />
          )}
          {regenerate.isError && (
            <ErrorBanner
              title={t('result.page.regenerateFailed')}
              message={regenerate.error.message}
            />
          )}

          <SummaryCards dataset={dataset} report={report} status={status} />

          <Workspace>
            <RecordsTable
              dataset={dataset}
              columns={columns}
              page={records.data}
              error={records.error}
              onCustomize={() => setDialog('columns')}
              onView={setViewing}
            />
            <CompliancePanel
              framework={dataset.framework}
              report={report}
              status={status}
              error={validation.error}
              onDetails={() => setDialog('validation')}
            />
          </Workspace>
        </Wrapper>
      </Body>

      <Footer>
        <Button
          variant="ghostSecondary"
          size="medium"
          startIcon={<MaskIcon src={autorenewIcon} />}
          disabled={regenerate.isPending}
          onClick={() => (status === 'failed' ? onRegenerate() : setDialog('regenerate'))}
        >
          {regenerate.isPending ? t('common:actions.regenerating') : t('common:actions.regenerate')}
        </Button>
        <Button
          variant="secondary"
          size="medium"
          startIcon={<MaskIcon src={downloadIcon} />}
          disabled={!canDownload}
          onClick={openDownload}
        >
          {t('common:actions.download')}
        </Button>
      </Footer>

      <ColumnsDrawer
        open={dialog === 'columns'}
        onClose={close}
        dataset={dataset}
        columns={columns}
        onApply={setColumns}
      />
      <RecordDrawer
        dataset={dataset}
        record={viewing}
        report={report}
        onClose={() => setViewing(null)}
      />
      {report && status && (
        <ValidationPopup
          isVisible={dialog === 'validation'}
          onClose={close}
          report={report}
          status={status}
          onDownload={openDownload}
          onRegenerate={onRegenerate}
          onAdjustSettings={() => navigate(SETTINGS_URL)}
          regenerating={regenerate.isPending}
        />
      )}
      <RegeneratePopup
        isVisible={dialog === 'regenerate'}
        onClose={close}
        onRegenerate={onRegenerate}
        onDownload={openDownload}
        pending={regenerate.isPending}
      />
      <DownloadPopup
        isVisible={dialog === 'download'}
        onClose={close}
        dataset={dataset}
        report={report}
        status={status}
        onDownload={onDownload}
        pending={download.isPending}
        error={download.error?.message}
      />
    </Root>
  )
}

export default GeneratedDataPage;
