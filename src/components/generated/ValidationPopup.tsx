import { useId, type ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { ValidationCheck, ValidationReport } from '../../api/types'
import autorenewIcon from '../../assets/configuration/autorenew.svg'
import cancelIcon from '../../assets/generated/cancel-large.svg'
import checkCircleIcon from '../../assets/generated/check-circle-large.svg'
import downloadIcon from '../../assets/review/report.svg'
import settingsIcon from '../../assets/review/settings.svg'
import { formatNumber } from '../../i18n/format'
import { colors, radius, shadows, typography } from '../../theme'
import BasePopup from '../popups/BasePopup'
import { Button, MaskIcon } from '../ui'
import { CheckItem, DialogHeader, Glyph, Notice } from './parts'
import { Checklist, Divider, SectionLabel } from './styles'
import {
  findingGroups,
  frameworkName,
  levelLabel,
  qualityLabel,
  type ResultStatus,
} from './resultModel'

// Figma: 560px card, 32px padding, 16px corners.
const panelStyle = {
  width: 'min(560px, 92vw)',
  minWidth: 0,
  padding: 'clamp(20px, 6vw, 32px)',
  borderRadius: radius.xl,
  boxShadow: shadows.lg,
}

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
})

const StatusRow = styled('p')({
  ...typography.labelL,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  margin: 0,
  color: colors.neutral[700],
})

const Section = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '16px 0',
  '& ul': { gap: 8 },
})

const Footer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 16,
})

// Short names and results ("Names — Removed") are `synthetic:result.validation.checksText`.

function checkItem(check: ValidationCheck, t: TFunction<'synthetic'>) {
  const key = `result.validation.checksText.${check.id}` as const
  return (
    <CheckItem
      key={check.id}
      tone={check.passed ? 'success' : 'error'}
      emphasis={!check.passed}
      label={<span title={check.detail}>{t(`${key}.label`, { defaultValue: check.label })}</span>}
      state={check.passed ? t(`${key}.passed`) : t(`${key}.failed`)}
    />
  )
}

/** Review notes: weak source fields plus whatever made the verdict a warning. */
function warningItems(report: ValidationReport, t: TFunction<'synthetic'>) {
  const items: { key: string; label: ReactNode; state: ReactNode }[] = []
  const { compliance, quality } = report
  if (compliance.riskLevel !== 'LOW') {
    items.push({
      key: 'risk',
      label: <span title={compliance.riskFactors.join('\n')}>{t('result.validation.riskLevel')}</span>,
      state: levelLabel(compliance.riskLevel),
    })
  }
  if (quality.quality !== 'GOOD') {
    items.push({
      key: 'quality',
      label: t('result.validation.dataQuality'),
      state: qualityLabel(quality.quality),
    })
  }
  if (quality.consistency !== 'HIGH') {
    items.push({
      key: 'consistency',
      label: t('result.validation.consistency'),
      state: t('result.validation.consistencyState', {
        level: levelLabel(quality.consistency),
        rate: formatNumber(quality.consistencyRate, { style: 'percent', maximumFractionDigits: 0 }),
      }),
    })
  }
  report.lowConfidenceFields.forEach((field, index) =>
    items.push({ key: `field-${index}`, label: field.field, state: field.reason }),
  )
  return items
}

interface ValidationPopupProps {
  isVisible: boolean
  onClose: () => void
  report: ValidationReport
  status: ResultStatus
  onDownload: () => void
  onRegenerate: () => void
  onAdjustSettings: () => void
  regenerating?: boolean
}

/** Validation Details (passed) or Validation Issues (failed). */
export function ValidationPopup({
  isVisible,
  onClose,
  report,
  status,
  onDownload,
  onRegenerate,
  onAdjustSettings,
  regenerating = false,
}: ValidationPopupProps) {
  const { t } = useTranslation(['synthetic', 'common'])
  const titleId = useId()
  const failed = status === 'failed'
  const framework = frameworkName(report.compliance.framework, 'long')

  return (
    <BasePopup isVisible={isVisible} onClose={onClose} labelledBy={titleId} style={panelStyle}>
      <Content>
        <DialogHeader
          titleId={titleId}
          title={failed ? t('result.validation.issuesTitle') : t('result.validation.detailsTitle')}
          subtitle={framework}
          onClose={onClose}
        />
        <Divider />
        {failed ? <FailedBody report={report} /> : <PassedBody report={report} />}
        <Footer>
          {failed ? (
            <>
              <Button
                variant="ghostSecondary"
                size="medium"
                startIcon={<MaskIcon src={settingsIcon} />}
                onClick={onAdjustSettings}
              >
                {t('result.validation.adjust')}
              </Button>
              <Button
                variant="secondary"
                size="medium"
                startIcon={<MaskIcon src={autorenewIcon} />}
                disabled={regenerating}
                onClick={onRegenerate}
              >
                {regenerating ? t('common:actions.regenerating') : t('common:actions.regenerate')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghostSecondary" size="medium" onClick={onClose}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                variant="secondary"
                size="medium"
                startIcon={<MaskIcon src={downloadIcon} />}
                onClick={onDownload}
              >
                {t('common:actions.download')}
              </Button>
            </>
          )}
        </Footer>
      </Content>
    </BasePopup>
  )
}

function PassedBody({ report }: { report: ValidationReport }) {
  const { t } = useTranslation('synthetic')
  const warnings = warningItems(report, t)
  return (
    <>
      <StatusRow>
        <Glyph src={checkCircleIcon} size={20} color={colors.success} />
        {warnings.length ? t('result.validation.passedNotes') : t('result.validation.passed')}
      </StatusRow>
      <Section aria-labelledby="validation-checks">
        <SectionLabel id="validation-checks">{t('result.validation.checks')}</SectionLabel>
        <Checklist>{report.checks.map((check) => checkItem(check, t))}</Checklist>
      </Section>
      {warnings.length > 0 && (
        <>
          <Divider />
          <Section aria-labelledby="validation-warnings">
            <SectionLabel id="validation-warnings">{t('result.validation.warnings')}</SectionLabel>
            <Checklist>
              {warnings.map((item) => (
                <CheckItem key={item.key} tone="warning" label={item.label} state={item.state} />
              ))}
            </Checklist>
          </Section>
          <Notice tone="info">{t('result.validation.warningsNote')}</Notice>
        </>
      )}
      <Divider />
    </>
  )
}

function FailedBody({ report }: { report: ValidationReport }) {
  const { t } = useTranslation('synthetic')
  const detected = report.compliance.directIdentifiers === 'DETECTED'
  const failedChecks = report.checks.filter((check) => !check.passed)
  const passedChecks = report.checks.filter((check) => check.passed)
  return (
    <>
      <StatusRow>
        <Glyph src={cancelIcon} size={24} slot={20} color={colors.error} />
        {t('result.validation.failedTitle')}
      </StatusRow>
      <Notice tone="error">
        {detected
          ? t('result.validation.identifiersDetected')
          : t('result.validation.checksFailed')}
      </Notice>
      <Section aria-labelledby="validation-issues">
        <SectionLabel id="validation-issues">{t('result.validation.issues')}</SectionLabel>
        <Checklist>
          {findingGroups(report).map((group) => (
            <CheckItem
              key={group.label}
              tone="error"
              emphasis
              label={group.label}
              state={t('result.validation.detectedCount', { count: group.count })}
            />
          ))}
          {failedChecks.map((check) => checkItem(check, t))}
          {!detected &&
            report.compliance.riskLevel === 'HIGH' &&
            report.compliance.riskFactors.map((factor) => (
              <CheckItem key={factor} tone="error" emphasis label={factor} />
            ))}
        </Checklist>
      </Section>
      {passedChecks.length > 0 && (
        <>
          <Divider />
          <Section aria-labelledby="validation-passed">
            <SectionLabel id="validation-passed">{t('result.validation.passedSection')}</SectionLabel>
            <Checklist>{passedChecks.map((check) => checkItem(check, t))}</Checklist>
          </Section>
        </>
      )}
      <Divider />
      <Notice tone="neutral">
        {t('result.validation.recommended')}
      </Notice>
    </>
  )
}
