import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import { Navigate, useNavigate } from 'react-router-dom'
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

function describeAnalyzeError(error: ApiError) {
  if (error.isRateLimited) return 'Too many analyses in a short time. Please wait a minute and try again.'
  if (error.isNetworkError) return "Couldn't reach the server. Check your connection and try again."
  if (error.status >= 500) return 'Something went wrong on our side. Please try again.'
  return error.message
}

const ConfigurationStepPage = () => {
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
        <h2>Configure De-Identification</h2>
        <p>
          {law
            ? 'Select a privacy risk level or customize how each entity type is handled'
            : `Choose how patient data will be anonymized under ${framework?.name ?? '…'}`}
        </p>
      </Header>

      {options.isError ? (
        <Banner role="alert" data-tone="error">
          <MaskIcon src={warningIcon} aria-hidden />
          <div>
            <strong>Couldn&apos;t load the settings</strong>
            <Button
              variant="ghostSecondary"
              size="medium"
              sx={{ marginTop: '8px' }}
              onClick={() => options.refetch()}
            >
              Try again
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
                <strong>Analysis failed</strong>
                <p>{describeAnalyzeError(analyze.error)}</p>
              </div>
            </Banner>
          )}
        </>
      )}

      <StepFooter
        continueLabel={analyze.isPending ? 'Analyzing…' : 'Analyze'}
        continueIcon={<MaskIcon src={analyzeIcon} />}
        continueDisabled={!settings || analyze.isPending}
        onContinue={run}
      />
    </Root>
  )
}

export default ConfigurationStepPage;
