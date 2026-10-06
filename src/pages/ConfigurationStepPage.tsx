import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import { Navigate, useNavigate } from 'react-router-dom'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../i18n/useCatalog'
import type { ApiError } from '../api/errors'
import analyzeIcon from '../assets/configuration/analyze.svg'
import warningIcon from '../assets/configuration/warning.svg'
import { Banner, NARROW, Stack } from '../components/de-identify/configStyles'
import { dataProtectionSettings, hipaaSettings } from '../components/de-identify/configRequest'
import { DataProtectionSettings } from '../components/de-identify/DataProtectionSettings'
import { LAWS } from '../components/de-identify/entityConfig'
import { HipaaSettings } from '../components/de-identify/HipaaSettings'
import { StepFooter } from '../components/layouts/de-identify/StepFooter'
import { useDeIdentify } from '../components/layouts/de-identify/context'
import { DE_IDENTIFY_BASE, stepUrl } from '../components/layouts/de-identify/steps'
import { Button, MaskIcon } from '../components/ui'
import { useAnalysisOptions, useCreateAnalysis } from '../hooks'
import { colors, typography } from '../theme'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  padding: '24px 48px 32px',
  // Data-protection laws: the design's tighter 32px gutters.
  '&[data-compact]': { gap: 24, padding: 32 },
  [NARROW]: { '&, &[data-compact]': { padding: '24px 16px 32px' } },
})

const Header = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '& h2': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

function describeAnalyzeError(error: ApiError, t: TFunction<['deIdentify', 'common']>) {
  if (error.isRateLimited) return t('configuration.errors.rateLimited')
  if (error.isNetworkError) return t('common:errors.unreachable')
  // The detection service sleeps when idle and takes up to a minute to start.
  if (error.status === 503) return t('configuration.errors.starting')
  if (error.status >= 500) return t('common:errors.server')
  return error.message
}

const ConfigurationStepPage = () => {
  const { t } = useTranslation(['deIdentify', 'common'])
  const catalog = useCatalog()
  const { draft, updateDraft } = useDeIdentify()
  const navigate = useNavigate()
  const options = useAnalysisOptions()
  const analyze = useCreateAnalysis()

  // Reached by URL without the earlier steps: send the user back to them.
  if (!draft.framework) return <Navigate to={`${DE_IDENTIFY_BASE}/compliance`} replace />
  if (!draft.text) return <Navigate to={`${DE_IDENTIFY_BASE}/input`} replace />

  const framework = options.data?.frameworks.find((item) => item.id === draft.framework)
  // HIPAA picks a method; the data-protection laws pick a risk level.
  const law = LAWS[draft.framework]
  const settings = framework
    ? law
      ? dataProtectionSettings(draft, framework, options.data!.entityConfig.riskPresets)
      : hipaaSettings(draft, framework)
    : null

  const run = () => {
    if (!settings || !draft.text || !draft.framework) return
    analyze.mutate(
      { ...settings, text: draft.text, framework: draft.framework },
      {
        onSuccess: (analysis) => {
          updateDraft({ analysis })
          navigate(stepUrl(3))
        },
      },
    )
  }

  return (
    <Root data-compact={law ? '' : undefined}>
      <Header>
        <h2>{t('configuration.title')}</h2>
        <p>
          {law
            ? t('configuration.subtitleRisk')
            : t('configuration.subtitleMethod', {
                framework: framework ? catalog.framework(framework).name : '…',
              })}
        </p>
      </Header>

      {/* A failed background refetch keeps the cached settings. */}
      {options.isError && !options.data ? (
        <Banner role="alert" data-tone="error">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>{t('configuration.loadFailed')}</strong>
            <Button
              variant="ghostSecondary"
              size="medium"
              sx={{ marginTop: '8px' }}
              onClick={() => options.refetch()}
            >
              {t('common:actions.tryAgain')}
            </Button>
          </div>
        </Banner>
      ) : !framework || !options.data ? (
        <Stack aria-busy>
          <Skeleton variant="rounded" height={132} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rounded" height={58} sx={{ borderRadius: '8px' }} />
        </Stack>
      ) : (
        <>
          {law ? (
            <DataProtectionSettings
              law={law}
              options={options.data}
              draft={draft}
              updateDraft={updateDraft}
            />
          ) : (
            <HipaaSettings
              framework={framework}
              options={options.data}
              draft={draft}
              updateDraft={updateDraft}
            />
          )}

          {analyze.isError && (
            <Banner role="alert" data-tone="error">
              <MaskIcon src={warningIcon} aria-hidden />
              <div>
                <strong>{t('configuration.analysisFailed')}</strong>
                <p>{describeAnalyzeError(analyze.error, t)}</p>
              </div>
            </Banner>
          )}
        </>
      )}

      <StepFooter
        continueLabel={analyze.isPending ? t('configuration.analyzing') : t('configuration.analyze')}
        continueIcon={<MaskIcon src={analyzeIcon} />}
        continueDisabled={!settings || analyze.isPending}
        onContinue={run}
      />
    </Root>
  )
}

export default ConfigurationStepPage;
