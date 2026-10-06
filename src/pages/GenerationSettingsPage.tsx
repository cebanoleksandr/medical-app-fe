import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/errors'
import {
  MAX_RECORDS,
  type CreateDatasetRequest,
  type DatasetType,
  type Framework,
  type OutputFormat,
} from '../api/types'
import warningIcon from '../assets/configuration/warning.svg'
import wandIcon from '../assets/review/wand-stars.svg'
import articleIcon from '../assets/synthetic/article.svg'
import formatIcon from '../assets/synthetic/format.svg'
import shieldIcon from '../assets/synthetic/shield.svg'
import { Banner } from '../components/de-identify/configStyles'
import { useDraftStore } from '../components/layouts/de-identify/draftStore'
import { DeidentifiedSource } from '../components/synthetic/DeidentifiedSource'
import {
  DEFAULT_RECORDS,
  checkSourceFile,
  estimateSize,
  formatRecords,
  recordsError,
} from '../components/synthetic/generationSettings'
import { SourceDropZone, type SourceDropZoneState } from '../components/synthetic/SourceDropZone'
import { Button, Dropdown, MaskIcon, TextField } from '../components/ui'
import {
  useCreateDataset,
  useCreateSourceFromAnalysis,
  useCreateSourceFromFile,
  useSource,
  useSyntheticOptions,
} from '../hooks'
import i18n from '../i18n'
import { useCatalog } from '../i18n/useCatalog'
import { colors, shadows, typography } from '../theme'

const STACK = '@media (max-width: 960px)'

// Fills AppLayout's content area: the settings scroll, the footer stays put.
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
  gap: 32,
  maxWidth: 1040,
  margin: '0 auto',
})

const PageHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

const Blocks = styled('div')({ display: 'flex', flexDirection: 'column', gap: 8 })

const Columns = styled('div')({
  display: 'grid',
  gridTemplateColumns: '400px minmax(0, 1fr)',
  gap: 24,
  alignItems: 'stretch',
  '&[data-single]': { gridTemplateColumns: 'minmax(0, 1fr)' },
  [STACK]: { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const Card = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  minWidth: 0,
  padding: 24,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
  // The data source card keeps its height; the configuration one stretches.
  '&[data-fit]': { alignSelf: 'start' },
  '& > h3': {
    ...typography.labelL,
    margin: 0,
    paddingBottom: 4,
    borderBottom: `1px solid ${colors.neutral[200]}`,
    color: colors.neutral[700],
  },
  '@media (max-width: 720px)': { padding: 16 },
})

const Field = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minWidth: 0,
  '& > label, & > span': { ...typography.labelS, color: colors.neutral[500] },
  '& .GenerationSettings-required': { color: colors.error },
})

const UploadBlock = styled('div')({ display: 'flex', flexDirection: 'column', gap: 8 })

const Or = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: colors.neutral[400],
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[100],
  },
})

const Rule = styled('hr')({
  margin: 0,
  border: 0,
  borderTop: `1px solid ${colors.neutral[200]}`,
})

// One column next to the data source card; two when the card is gone.
const ConfigGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  columnGap: 20,
  rowGap: 24,
  '&[data-wide]': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    '& > .GenerationSettings-records': { gridColumn: 1 },
    '& > .GenerationSettings-full': { gridColumn: '1 / -1' },
  },
  '@media (max-width: 720px)': {
    '&[data-wide]': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
})

const Estimate = styled('p')({
  ...typography.bodyS,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  margin: 0,
  color: colors.neutral[500],
  '& strong': { fontWeight: 400, color: colors.neutral[700] },
})

const Hint = styled('p')({
  ...typography.bodyS,
  margin: 0,
  textAlign: 'right',
  color: colors.neutral[400],
})

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  flexShrink: 0,
  padding: '16px 70px 16px 48px',
  borderTop: `1px solid ${colors.neutral[200]}`,
  backgroundColor: colors.white,
  '@media (max-width: 720px)': { padding: '16px' },
})

const FieldIcon = styled(MaskIcon)({ fontSize: 24 })

type SourceMode = 'type' | 'file' | 'document'

function problemOf(error: unknown) {
  return {
    title: i18n.t('synthetic:settings.fileUnreadable'),
    message: error instanceof Error ? error.message : i18n.t('synthetic:settings.fileTryAnother'),
  }
}

const GenerationSettingsPage = () => {
  const { t } = useTranslation(['synthetic', 'common'])
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Set by Review's "Generate Synthetic Data": the source already exists.
  const passedSourceId = params.get('source') ?? undefined
  const { draft } = useDraftStore()
  const options = useSyntheticOptions()
  const passedSource = useSource(passedSourceId)
  const uploadSource = useCreateSourceFromFile()
  const documentSource = useCreateSourceFromAnalysis()
  const createDataset = useCreateDataset()

  const [datasetType, setDatasetType] = useState<DatasetType>('PATIENT_RECORDS')
  const [mode, setMode] = useState<SourceMode>('type')
  const [upload, setUpload] = useState<SourceDropZoneState>({ status: 'idle' })
  const [fileSourceId, setFileSourceId] = useState<string | null>(null)
  const [records, setRecords] = useState('')
  const [framework, setFramework] = useState<Framework | null>(null)
  const [format, setFormat] = useState<OutputFormat | null>(null)
  // Only the latest upload may update the zone.
  const uploadToken = useRef(0)

  const analysis = draft.analysis
  const sessionText = draft.text && analysis ? analysis.deidentifiedText : null
  const passed = passedSource.data
  const passedPreview =
    passed?.kind === 'DOCUMENT' && analysis?.id === passed.summary.analysisId
      ? analysis.deidentifiedText
      : null
  const passedFailed = !!passedSourceId && passedSource.isError

  const generate = useMutation({
    mutationFn: async () => {
      let sourceId: string | undefined
      if (passedSourceId) sourceId = passedSourceId
      else if (mode === 'file') sourceId = fileSourceId ?? undefined
      else if (mode === 'document' && analysis && draft.text) {
        const source = await documentSource.mutateAsync({
          analysisId: analysis.id,
          text: draft.text,
          entities: analysis.entities,
        })
        sourceId = source.id
      }
      const common = { framework: framework!, format: format!, recordCount: Number(records) }
      const request: CreateDatasetRequest = sourceId
        ? { ...common, sourceId }
        : { ...common, datasetType }
      return createDataset.mutateAsync(request)
    },
    onSuccess: (dataset) => navigate(`/app/synthetic/result?dataset=${dataset.id}`),
  })

  const onFile = (file: File) => {
    const token = ++uploadToken.current
    setFileSourceId(null)
    const problem = checkSourceFile(file)
    if (problem) {
      setUpload({ status: 'error', problem })
      return
    }
    setUpload({ status: 'uploading', name: file.name })
    uploadSource.mutate(
      { file },
      {
        onSuccess: (source) => {
          if (token !== uploadToken.current) return
          setFileSourceId(source.id)
          setUpload({ status: 'ready', name: file.name, size: file.size })
        },
        onError: (error) => {
          if (token === uploadToken.current) setUpload({ status: 'error', problem: problemOf(error) })
        },
      },
    )
  }

  const removeFile = () => {
    uploadToken.current++
    setFileSourceId(null)
    setUpload({ status: 'idle' })
    setMode('type')
  }

  const toggleDocument = () => {
    if (mode === 'document') {
      setMode('type')
      return
    }
    removeFile()
    setMode('document')
  }

  const maxRecords = options.data?.maxRecords ?? MAX_RECORDS
  const recordsProblem = recordsError(records, maxRecords)
  // A failed upload is only a notice: the dataset type still applies.
  const fileMode = upload.status === 'uploading' || upload.status === 'ready'
  const sourceReady = passedSourceId
    ? !!passed
    : mode === 'document'
      ? !!sessionText
      : !fileMode || !!fileSourceId
  const complete =
    sourceReady && records !== '' && !recordsProblem && !!framework && !!format
  const estimate =
    options.data && !passedSourceId && mode !== 'document' && !fileMode && !recordsProblem
      ? estimateSize(options.data, datasetType, format, records)
      : null

  const frameworkOptions = (options.data?.frameworks ?? []).map((f) => ({
    value: f.id,
    label: catalog.framework(f).name,
    description: catalog.framework(f).description,
  }))
  const formatOptions = (options.data?.formats ?? []).map((f) => ({ value: f, label: f }))
  const typeOptions = (options.data?.datasetTypes ?? []).map((type) => ({
    value: type.id,
    label: t(`datasetTypes.${type.id}`, { defaultValue: type.name }),
  }))

  const single = !!passedSourceId && !passedFailed
  const generateError = generate.error
  const generateErrorText =
    generateError instanceof ApiError && generateError.isGone
      ? t('settings.sourceExpired')
      : generateError?.message

  const dataSourceCard = (
    <Card data-fit aria-labelledby="data-source-heading">
      <h3 id="data-source-heading">{t('settings.dataSource')}</h3>
      <Field>
        <span id="dataset-type-label">{t('settings.datasetType')}</span>
        <Dropdown<DatasetType>
          size="field"
          options={typeOptions}
          value={datasetType}
          onChange={setDatasetType}
          triggerIcon={<FieldIcon src={articleIcon} />}
          placeholder={t('settings.datasetType')}
          // A source brings its own columns.
          disabled={mode === 'document' || fileMode || !options.data}
          aria-labelledby="dataset-type-label"
        />
      </Field>
      {mode === 'document' ? (
        <>
          <Rule />
          <DeidentifiedSource
            variant="toggle"
            selected
            preview={sessionText}
            onToggle={toggleDocument}
          />
        </>
      ) : (
        <UploadBlock>
          <Field>
            <span>{t('settings.uploadFile')}</span>
            <SourceDropZone
              state={upload}
              onFile={(file) => {
                setMode('file')
                onFile(file)
              }}
              onRemove={removeFile}
            />
          </Field>
          <Or>{t('settings.or')}</Or>
          <DeidentifiedSource
            variant="toggle"
            preview={sessionText}
            disabled={!sessionText}
            onToggle={toggleDocument}
          />
        </UploadBlock>
      )}
    </Card>
  )

  return (
    <Root>
      <Body>
        <Wrapper>
          <PageHeader>
            <h2>{t('settings.title')}</h2>
            <p>{t('settings.subtitle')}</p>
          </PageHeader>

          {passedFailed && (
            <Banner role="alert" data-tone="error">
              <MaskIcon src={warningIcon} aria-hidden />
              <div>
                <strong>{t('settings.sourceGone')}</strong>
                <p>{t('settings.sourceGoneText', { message: passedSource.error.message })}</p>
              </div>
            </Banner>
          )}
          {options.isError && !options.data && (
            <Banner role="alert" data-tone="error">
              <MaskIcon src={warningIcon} aria-hidden />
              <div>
                <strong>{t('settings.optionsFailed')}</strong>
                <p>{options.error.message}</p>
              </div>
            </Banner>
          )}

          <Blocks>
            <Columns data-single={single || undefined}>
              {!single && dataSourceCard}

              <Card aria-labelledby="configuration-heading">
                <h3 id="configuration-heading">{t('settings.configuration')}</h3>
                <ConfigGrid data-wide={single || undefined}>
                  <TextField
                    className="GenerationSettings-records"
                    label={t('settings.records')}
                    inputMode="numeric"
                    placeholder={String(DEFAULT_RECORDS)}
                    value={records}
                    onChange={(event) => setRecords(event.target.value.replace(/\D/g, '').slice(0, 7))}
                    helperText={t('settings.recordsMax', { max: formatRecords(maxRecords) })}
                    error={recordsProblem ?? false}
                  />
                  {single && <span aria-hidden />}
                  <Field>
                    <span id="framework-label">
                      {t('settings.framework')}
                      <span className="GenerationSettings-required" aria-hidden>*</span>
                    </span>
                    <Dropdown<Framework>
                      size="field"
                      options={frameworkOptions}
                      value={framework}
                      onChange={setFramework}
                      triggerIcon={<FieldIcon src={shieldIcon} />}
                      placeholder={t('settings.frameworkPlaceholder')}
                      disabled={!options.data}
                      aria-labelledby="framework-label"
                    />
                  </Field>
                  <Field>
                    <span id="format-label">{t('settings.format')}</span>
                    <Dropdown<OutputFormat>
                      size="field"
                      options={formatOptions}
                      value={format}
                      onChange={setFormat}
                      triggerIcon={<FieldIcon src={formatIcon} />}
                      placeholder={t('settings.formatPlaceholder')}
                      disabled={!options.data}
                      aria-labelledby="format-label"
                    />
                  </Field>
                  {single && (
                    <div className="GenerationSettings-full">
                      <DeidentifiedSource
                        variant="static"
                        preview={passedPreview}
                        fallback={
                          passed?.kind === 'DOCUMENT'
                            ? t('settings.documentSource', {
                                count: passed.summary.identifiersReplaced,
                              })
                            : passed
                              ? t('settings.fileSource', { count: passed.summary.rows })
                              : t('common:actions.loading')
                        }
                      />
                    </div>
                  )}
                </ConfigGrid>
                {estimate && (
                  <Estimate>
                    {t('settings.estimate')} <strong>{estimate}</strong>
                  </Estimate>
                )}
              </Card>
            </Columns>
            {!complete && <Hint>{t('settings.incomplete')}</Hint>}
          </Blocks>

          {generateErrorText && (
            <Banner role="alert" data-tone="error">
              <MaskIcon src={warningIcon} aria-hidden />
              <div>
                <strong>{t('settings.generateFailed')}</strong>
                <p>{generateErrorText}</p>
              </div>
            </Banner>
          )}
        </Wrapper>
      </Body>

      <Footer>
        <Button
          variant="secondary"
          size="medium"
          startIcon={<MaskIcon src={wandIcon} />}
          disabled={!complete || generate.isPending}
          onClick={() => generate.mutate()}
        >
          {generate.isPending ? t('settings.generating') : t('settings.generate')}
        </Button>
      </Footer>
    </Root>
  )
}

export default GenerationSettingsPage;
