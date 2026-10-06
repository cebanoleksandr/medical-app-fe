import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { Framework, ValidationReport } from '../../api/types'
import arrowIcon from '../../assets/configuration/arrow-right.svg'
import { colors, shadows, typography } from '../../theme'
import { Button, MaskIcon } from '../ui'
import { CheckItem, SoftNotice } from './parts'
import { Checklist, Divider } from './styles'
import { frameworkName, levelLabel, type ResultStatus } from './resultModel'

const Root = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 16,
  minWidth: 0,
  padding: 20,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
  '& > h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& > button': { alignSelf: 'flex-start' },
})

const Facts = styled('dl')({
  ...typography.bodyM,
  display: 'grid',
  gridTemplateColumns: '100px minmax(0, 1fr)',
  columnGap: 16,
  rowGap: 4,
  margin: 0,
  '& dt': { fontWeight: 500, color: colors.primary[700] },
  '& dd': { margin: 0, color: colors.neutral[500] },
})

function notice(report: ValidationReport, status: ResultStatus, t: TFunction<'synthetic'>) {
  const fields = report.lowConfidenceFields.length
  if (status === 'failed') {
    return (
      <SoftNotice tone="error">
        {report.compliance.directIdentifiers === 'DETECTED'
          ? t('result.panel.identifiersFound')
          : t('result.panel.failed')}
      </SoftNotice>
    )
  }
  if (status === 'warning') {
    return (
      <SoftNotice tone="warning">
        {fields
          ? t('result.panel.fieldsToReview', { count: fields })
          : t('result.panel.qualityReview')}
      </SoftNotice>
    )
  }
  if (fields) {
    return <SoftNotice tone="warning">{t('result.panel.lowConfidence', { count: fields })}</SoftNotice>
  }
  return null
}

interface CompliancePanelProps {
  framework: Framework
  report: ValidationReport | undefined
  status: ResultStatus | undefined
  error: Error | null
  onDetails: () => void
}

/** The validation checklist next to the records table. */
export function CompliancePanel({ framework, report, status, error, onDetails }: CompliancePanelProps) {
  const { t } = useTranslation('synthetic')
  return (
    <Root aria-labelledby="compliance-validation-heading">
      <h2 id="compliance-validation-heading">{t('result.panel.title')}</h2>
      <Facts>
        <dt>{t('result.panel.framework')}</dt>
        <dd>{frameworkName(framework, 'long')}</dd>
        <dt>{t('result.panel.risk')}</dt>
        <dd>{report ? levelLabel(report.compliance.riskLevel) : '…'}</dd>
        <dt>{t('result.panel.exportStatus')}</dt>
        <dd>
          {!status
            ? '…'
            : status === 'failed'
              ? t('result.panel.doNotDownload')
              : t('result.panel.safe')}
        </dd>
      </Facts>
      <Divider />
      {report && status ? (
        <>
          <Checklist aria-label={t('result.panel.checks')}>
            {report.checks.map((check) => (
              <CheckItem
                key={check.id}
                tone={check.passed ? 'success' : 'error'}
                emphasis={!check.passed}
                label={
                  <span title={check.detail}>
                    {t(`result.checks.${check.id}`, { defaultValue: check.label })}
                  </span>
                }
              />
            ))}
          </Checklist>
          <Divider />
          {notice(report, status, t)}
          <Button
            variant="ghostSecondary"
            size="medium"
            endIcon={<MaskIcon src={arrowIcon} />}
            onClick={onDetails}
          >
            {status === 'passed' ? t('result.panel.details') : t('result.panel.issues')}
          </Button>
        </>
      ) : error ? (
        <SoftNotice tone="error">
          {t('result.panel.validateFailed', { message: error.message })}
        </SoftNotice>
      ) : (
        <div aria-busy="true" aria-label={t('result.panel.validating')}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="text" width={`${60 + ((index * 13) % 30)}%`} />
          ))}
        </div>
      )}
    </Root>
  )
}
