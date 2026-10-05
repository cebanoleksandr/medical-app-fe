import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import type { Framework, ValidationReport } from '../../api/types'
import arrowIcon from '../../assets/configuration/arrow-right.svg'
import { colors, shadows, typography } from '../../theme'
import { Button, MaskIcon } from '../ui'
import { CheckItem, SoftNotice } from './parts'
import { Checklist, Divider } from './styles'
import { FRAMEWORK_NAMES, LEVEL_LABELS, type ResultStatus } from './resultModel'

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

function notice(report: ValidationReport, status: ResultStatus) {
  const fields = report.lowConfidenceFields.length
  const plural = fields === 1 ? 'field' : 'fields'
  if (status === 'failed') {
    return (
      <SoftNotice tone="error">
        {report.compliance.directIdentifiers === 'DETECTED'
          ? 'Direct identifiers found — do not download'
          : 'Validation failed — do not download'}
      </SoftNotice>
    )
  }
  if (status === 'warning') {
    return (
      <SoftNotice tone="warning">
        {fields
          ? `${fields} ${plural} require review before export`
          : 'Data quality needs review before export'}
      </SoftNotice>
    )
  }
  if (fields) {
    return <SoftNotice tone="warning">{`${fields} low-confidence ${plural} may require review`}</SoftNotice>
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
  return (
    <Root aria-labelledby="compliance-validation-heading">
      <h2 id="compliance-validation-heading">Compliance Validation</h2>
      <Facts>
        <dt>Framework:</dt>
        <dd>{FRAMEWORK_NAMES[framework].long}</dd>
        <dt>Risk level:</dt>
        <dd>{report ? LEVEL_LABELS[report.compliance.riskLevel] : '…'}</dd>
        <dt>Export status:</dt>
        <dd>{!status ? '…' : status === 'failed' ? 'Do not download' : 'Safe to download'}</dd>
      </Facts>
      <Divider />
      {report && status ? (
        <>
          <Checklist aria-label="Validation checks">
            {report.checks.map((check) => (
              <CheckItem
                key={check.id}
                tone={check.passed ? 'success' : 'error'}
                emphasis={!check.passed}
                label={<span title={check.detail}>{check.label}</span>}
              />
            ))}
          </Checklist>
          <Divider />
          {notice(report, status)}
          <Button
            variant="ghostSecondary"
            size="medium"
            endIcon={<MaskIcon src={arrowIcon} />}
            onClick={onDetails}
          >
            {status === 'passed' ? 'View validation details' : 'View issues'}
          </Button>
        </>
      ) : error ? (
        <SoftNotice tone="error">Couldn&apos;t validate the dataset: {error.message}</SoftNotice>
      ) : (
        <div aria-busy="true" aria-label="Validating">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="text" width={`${60 + ((index * 13) % 30)}%`} />
          ))}
        </div>
      )}
    </Root>
  )
}
