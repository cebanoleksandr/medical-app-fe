import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from '@mui/material/styles'
import { Navigate, useNavigate } from 'react-router-dom'
import type { DetectedEntity, RenderAnalysisRequest } from '../api/types'
import warningIcon from '../assets/configuration/warning.svg'
import addIcon from '../assets/review/add.svg'
import settingsIcon from '../assets/review/settings.svg'
import wandIcon from '../assets/review/wand-stars.svg'
import { Banner } from '../components/de-identify/configStyles'
import { StepFooter } from '../components/layouts/de-identify/StepFooter'
import { useDeIdentify } from '../components/layouts/de-identify/context'
import { DE_IDENTIFY_BASE, stepUrl } from '../components/layouts/de-identify/steps'
import { ConfirmPopup } from '../components/popups/ConfirmPopup'
import { DocumentViewer } from '../components/review/DocumentViewer'
import { EntityPanel } from '../components/review/EntityPanel'
import {
  buildReport,
  deidentifiedText,
  formatDate,
  formatPercent,
  formatSeconds,
} from '../components/review/reviewModel'
import { StatsBar } from '../components/review/StatsBar'
import { Button, MaskIcon } from '../components/ui'
import { useCreateSourceFromAnalysis, useRenderAnalysis } from '../hooks'
import { formatNumber } from '../i18n/format'
import { colors, typography } from '../theme'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: '24px 32px 24px',
  '@media (max-width: 720px)': { padding: '24px 16px' },
})

const Header = styled('div')({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 16,
  '& h2': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: '8px 0 0', color: colors.neutral[500] },
  '& > button': { marginTop: 8 },
})

// Both panes scroll inside a fixed-height row, like the design.
const Workspace = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 344px',
  gap: 24,
  height: 'max(460px, calc(100vh - 540px))',
  '@media (max-width: 1024px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(420px, 70vh) minmax(320px, 60vh)',
    height: 'auto',
  },
})

const DOWNLOAD_NAME = 'deidentification-report.txt'

function download(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const ReviewStepPage = () => {
  const { t } = useTranslation(['deIdentify', 'common'])
  const { draft, updateDraft, resetDraft } = useDeIdentify()
  const navigate = useNavigate()
  const render = useRenderAnalysis()
  const createSource = useCreateSourceFromAnalysis()
  // Include/exclude choices not yet confirmed by a render; kept on failure
  // so "Try again" re-sends them.
  const [pending, setPending] = useState<DetectedEntity[] | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [confirmNew, setConfirmNew] = useState(false)

  useEffect(() => {
    if (!focusedId) return
    document
      .getElementById(`entity-row-${focusedId}`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const timer = setTimeout(() => setFocusedId(null), 1500)
    return () => clearTimeout(timer)
  }, [focusedId])

  const { analysis, text } = draft
  if (!analysis || !text) return <Navigate to={`${DE_IDENTIFY_BASE}/configuration`} replace />

  const entities = pending ?? analysis.entities
  const included = entities.filter((entity) => entity.included)
  const source =
    draft.inputMode === 'file' && draft.upload ? draft.upload.name : t('review.pastedText')
  const output = pending ? deidentifiedText(text, entities) : analysis.deidentifiedText

  const sendRender = (next: DetectedEntity[]) => {
    const request: RenderAnalysisRequest = {
      text,
      entities: next,
      // Risk-level analyses keep their methods per entity.
      outputMode: analysis.riskLevel ? undefined : analysis.outputMode,
    }
    render.mutate(
      { id: analysis.id, request },
      {
        onSuccess: (rendered) => {
          setPending(null)
          updateDraft({ analysis: rendered })
        },
      },
    )
  }

  const toggle = (id: string) => {
    const next = entities.map((entity) =>
      entity.id === id ? { ...entity, included: !entity.included } : entity,
    )
    setPending(next)
    sendRender(next)
  }

  const startNew = () => {
    resetDraft()
    navigate(stepUrl(0))
  }

  const generateSynthetic = () => {
    createSource.mutate(
      { analysisId: analysis.id, text, entities },
      { onSuccess: (created) => navigate(`/app/synthetic/settings?source=${created.id}`) },
    )
  }

  let warning: string | undefined
  if (entities.length === 0) warning = t('review.warnings.clean')
  else if (included.length === 0) warning = t('review.warnings.allExcluded')
  else {
    const toReview = included.filter((entity) => entity.lowConfidence).length
    if (toReview > 0) warning = t('review.warnings.toReview', { count: toReview })
  }

  const renderFailed = render.isError
  const canGenerate =
    included.length > 0 && !pending && !renderFailed && !createSource.isPending

  return (
    <Root>
      <Header>
        <div>
          <h2>{t('review.title')}</h2>
          <p>{t('review.meta', { source, date: formatDate(analysis.createdAt) })}</p>
        </div>
        <Button
          variant="secondary"
          size="medium"
          startIcon={<MaskIcon src={settingsIcon} />}
          onClick={() => navigate(stepUrl(2))}
        >
          {t('review.adjust')}
        </Button>
      </Header>

      <StatsBar
        items={[
          { value: formatNumber(entities.length), label: t('review.stats.detected') },
          { value: formatNumber(included.length), label: t('review.stats.processed') },
          { value: formatPercent(analysis.stats.avgConfidence), label: t('review.stats.confidence') },
          { value: formatSeconds(analysis.stats.processingMs), label: t('review.stats.time') },
        ]}
      />

      <Workspace>
        <DocumentViewer
          text={text}
          entities={entities}
          renderError={renderFailed}
          onRetry={() => sendRender(entities)}
          onEntityClick={setFocusedId}
          copyText={{ original: text, deidentified: output }}
          onReport={() => download(buildReport(analysis, entities, source, output), DOWNLOAD_NAME)}
          warning={warning}
        />
        <EntityPanel entities={entities} onToggle={toggle} focusedId={focusedId} />
      </Workspace>

      {createSource.isError && (
        <Banner role="alert" data-tone="error">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>{t('review.sourceFailed')}</strong>
            <p>{createSource.error.message}</p>
          </div>
        </Banner>
      )}

      <StepFooter
        start={
          <Button
            variant="ghostSecondary"
            startIcon={<MaskIcon src={addIcon} />}
            onClick={() => setConfirmNew(true)}
          >
            {t('common:actions.newAnalysis')}
          </Button>
        }
        end={
          <Button
            variant="secondary"
            size="medium"
            startIcon={<MaskIcon src={wandIcon} />}
            disabled={!canGenerate}
            onClick={generateSynthetic}
          >
            {createSource.isPending ? t('review.preparing') : t('review.generate')}
          </Button>
        }
      />

      <ConfirmPopup
        isVisible={confirmNew}
        onClose={() => setConfirmNew(false)}
        onConfirm={startNew}
        title={t('review.newTitle')}
        description={t('review.newText')}
        confirmLabel={t('review.newConfirm')}
      />
    </Root>
  )
}

export default ReviewStepPage;
