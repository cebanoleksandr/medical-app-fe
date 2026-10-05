import { useId, type ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import type { ValidationCheck, ValidationReport } from '../../api/types'
import autorenewIcon from '../../assets/configuration/autorenew.svg'
import cancelIcon from '../../assets/generated/cancel-large.svg'
import checkCircleIcon from '../../assets/generated/check-circle-large.svg'
import downloadIcon from '../../assets/review/report.svg'
import settingsIcon from '../../assets/review/settings.svg'
import { colors, radius, shadows, typography } from '../../theme'
import BasePopup from '../popups/BasePopup'
import { Button, MaskIcon } from '../ui'
import { CheckItem, DialogHeader, Glyph, Notice } from './parts'
import { Checklist, Divider, SectionLabel } from './styles'
import {
  FRAMEWORK_NAMES,
  LEVEL_LABELS,
  QUALITY,
  findingGroups,
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

/** Short names and results in the spirit of "Names — Removed". */
const CHECK_TEXT: Record<ValidationCheck['id'], { label: string; passed: string; failed: string }> = {
  dates_transformed: { label: 'Dates', passed: 'Transformed', failed: 'Out of range' },
  free_text_checked: { label: 'Free-text fields', passed: 'Checked', failed: 'Identifiers found' },
  export_format_validated: { label: 'Export format', passed: 'Valid', failed: 'Invalid' },
  synthetic_identifiers_generated: {
    label: 'Synthetic identifiers',
    passed: 'Generated',
    failed: 'Not unique',
  },
  direct_identifiers_removed: { label: 'Direct identifiers', passed: 'Removed', failed: 'Detected' },
}

function checkItem(check: ValidationCheck) {
  const text = CHECK_TEXT[check.id]
  return (
    <CheckItem
      key={check.id}
      tone={check.passed ? 'success' : 'error'}
      emphasis={!check.passed}
      label={<span title={check.detail}>{text?.label ?? check.label}</span>}
      state={check.passed ? text?.passed : text?.failed}
    />
  )
}

/** Review notes: weak source fields plus whatever made the verdict a warning. */
function warningItems(report: ValidationReport) {
  const items: { key: string; label: ReactNode; state: ReactNode }[] = []
  const { compliance, quality } = report
  if (compliance.riskLevel !== 'LOW') {
    items.push({
      key: 'risk',
      label: <span title={compliance.riskFactors.join('\n')}>Risk level</span>,
      state: LEVEL_LABELS[compliance.riskLevel],
    })
  }
  if (quality.quality !== 'GOOD') {
    items.push({ key: 'quality', label: 'Data quality', state: QUALITY[quality.quality].label })
  }
  if (quality.consistency !== 'HIGH') {
    items.push({
      key: 'consistency',
      label: 'Consistency',
      state: `${LEVEL_LABELS[quality.consistency]} (${Math.round(quality.consistencyRate * 100)}%)`,
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
  const titleId = useId()
  const failed = status === 'failed'
  const framework = FRAMEWORK_NAMES[report.compliance.framework].long

  return (
    <BasePopup isVisible={isVisible} onClose={onClose} labelledBy={titleId} style={panelStyle}>
      <Content>
        <DialogHeader
          titleId={titleId}
          title={failed ? 'Validation Issues' : 'Validation Details'}
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
                Adjust settings
              </Button>
              <Button
                variant="secondary"
                size="medium"
                startIcon={<MaskIcon src={autorenewIcon} />}
                disabled={regenerating}
                onClick={onRegenerate}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghostSecondary" size="medium" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="medium"
                startIcon={<MaskIcon src={downloadIcon} />}
                onClick={onDownload}
              >
                Download
              </Button>
            </>
          )}
        </Footer>
      </Content>
    </BasePopup>
  )
}

function PassedBody({ report }: { report: ValidationReport }) {
  const warnings = warningItems(report)
  return (
    <>
      <StatusRow>
        <Glyph src={checkCircleIcon} size={20} color={colors.success} />
        {warnings.length ? 'Passed with review notes' : 'Passed'}
      </StatusRow>
      <Section aria-labelledby="validation-checks">
        <SectionLabel id="validation-checks">Checks</SectionLabel>
        <Checklist>{report.checks.map(checkItem)}</Checklist>
      </Section>
      {warnings.length > 0 && (
        <>
          <Divider />
          <Section aria-labelledby="validation-warnings">
            <SectionLabel id="validation-warnings">Warnings</SectionLabel>
            <Checklist>
              {warnings.map((item) => (
                <CheckItem key={item.key} tone="warning" label={item.label} state={item.state} />
              ))}
            </Checklist>
          </Section>
          <Notice tone="info">Review warnings before using this dataset in regulated workflows</Notice>
        </>
      )}
      <Divider />
    </>
  )
}

function FailedBody({ report }: { report: ValidationReport }) {
  const detected = report.compliance.directIdentifiers === 'DETECTED'
  const failedChecks = report.checks.filter((check) => !check.passed)
  const passedChecks = report.checks.filter((check) => check.passed)
  return (
    <>
      <StatusRow>
        <Glyph src={cancelIcon} size={24} slot={20} color={colors.error} />
        Validation failed
      </StatusRow>
      <Notice tone="error">
        {detected
          ? 'Direct identifiers detected. Do not download this dataset.'
          : 'Some checks failed. Do not download this dataset.'}
      </Notice>
      <Section aria-labelledby="validation-issues">
        <SectionLabel id="validation-issues">Issues</SectionLabel>
        <Checklist>
          {findingGroups(report).map((group) => (
            <CheckItem
              key={group.label}
              tone="error"
              emphasis
              label={group.label}
              state={`Detected (${group.count})`}
            />
          ))}
          {failedChecks.map(checkItem)}
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
            <SectionLabel id="validation-passed">Passed</SectionLabel>
            <Checklist>{passedChecks.map(checkItem)}</Checklist>
          </Section>
        </>
      )}
      <Divider />
      <Notice tone="neutral">
        Recommended: Regenerate the dataset or adjust configuration settings.
      </Notice>
    </>
  )
}
