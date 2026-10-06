import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import type { Framework } from '../api/types'
import { ComplianceCard } from '../components/de-identify/ComplianceCard'
import { StepFooter } from '../components/layouts/de-identify/StepFooter'
import { useDeIdentify } from '../components/layouts/de-identify/context'
import { Button } from '../components/ui'
import { useAnalysisOptions } from '../hooks'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../i18n/useCatalog'
import { colors, typography } from '../theme'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 48,
  padding: '40px 48px',
  '@media (max-width: 720px)': { gap: 32, padding: '32px 16px' },
})

const Header = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '& h2': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

// Two 520px cards side by side in the design; one column when that won't fit.
const Cards = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
  gap: 24,
  maxWidth: 520 * 2 + 24,
})

const LoadError = styled('div')({
  ...typography.bodyM,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  color: colors.error,
})

const ComplianceStepPage = () => {
  const { t } = useTranslation(['deIdentify', 'common'])
  const catalog = useCatalog()
  const { draft, updateDraft } = useDeIdentify()
  const options = useAnalysisOptions()

  const select = (framework: Framework) => {
    if (framework === draft.framework) return
    // Methods, identifiers and risk presets belong to a framework; pick them again.
    updateDraft({
      framework,
      method: undefined,
      identifiers: undefined,
      riskLevel: undefined,
      entityMethods: undefined,
    })
  }

  return (
    <Root>
      <Header>
        <h2 id="framework-heading">{t('compliance.title')}</h2>
        <p>{t('compliance.subtitle')}</p>
      </Header>

      {/* A failed background refetch keeps the cached frameworks. */}
      {options.isError && !options.data ? (
        <LoadError role="alert">
          {t('compliance.loadFailed')}
          <Button variant="ghostSecondary" size="medium" onClick={() => options.refetch()}>
            {t('common:actions.tryAgain')}
          </Button>
        </LoadError>
      ) : (
        <Cards role="radiogroup" aria-labelledby="framework-heading" aria-busy={options.isPending}>
          {options.isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} variant="rounded" height={156} sx={{ borderRadius: '12px' }} />
              ))
            : options.data.frameworks.map((framework) => {
                const text = catalog.framework(framework)
                return (
                <ComplianceCard
                  key={framework.id}
                  name="framework"
                  value={framework.id}
                  title={text.name}
                  description={text.description}
                  badge={text.region}
                  checked={draft.framework === framework.id}
                  onChange={() => select(framework.id)}
                />
                )
              })}
        </Cards>
      )}

      <StepFooter continueDisabled={!draft.framework} />
    </Root>
  )
}

export default ComplianceStepPage;
