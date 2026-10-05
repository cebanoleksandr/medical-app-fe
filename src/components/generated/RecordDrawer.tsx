import { useId, type CSSProperties } from 'react'
import Drawer from '@mui/material/Drawer'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import type { Dataset, DatasetRecord, ValidationReport } from '../../api/types'
import cancelIcon from '../../assets/generated/cancel.svg'
import checkCircleIcon from '../../assets/generated/check-circle-small.svg'
import { colors, typography } from '../../theme'
import { useDatasetRecord } from '../../hooks'
import { DrawerContent, DrawerHeader, DrawerPanel, DrawerSection } from './drawerStyles'
import { CheckItem, Glyph, Notice } from './parts'
import { Checklist, Dot, MetaList, MetaRow, SectionLabel, TONE_COLOR } from './styles'
import { QUALITY, entityLabel, formatCell } from './resultModel'

const TextBlock = styled('p')({
  ...typography.bodyS,
  margin: 0,
  padding: 12,
  borderRadius: 8,
  backgroundColor: colors.neutral[50],
  color: colors.neutral[500],
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
})

/** Dataset checks that hold for every record. */
const RECORD_CHECKS = new Set(['dates_transformed', 'synthetic_identifiers_generated'])

interface RecordDrawerProps {
  dataset: Dataset
  /** The row the user opened; null when closed. */
  record: DatasetRecord | null
  report: ValidationReport | undefined
  onClose: () => void
}

/** Every generated field of one record, plus its compliance notes. */
export function RecordDrawer({ dataset, record, report, onClose }: RecordDrawerProps) {
  const titleId = useId()
  return (
    <Drawer
      anchor="right"
      open={!!record}
      onClose={onClose}
      slotProps={{ paper: { 'aria-labelledby': titleId, sx: { boxShadow: 'none' } } }}
    >
      <DrawerPanel>
        <DrawerHeader
          titleId={titleId}
          title="Record details"
          subtitle={record?.recordId}
          onClose={onClose}
        />
        {record && <RecordBody dataset={dataset} row={record} report={report} />}
      </DrawerPanel>
    </Drawer>
  )
}

interface RecordBodyProps {
  dataset: Dataset
  row: DatasetRecord
  report: ValidationReport | undefined
}

function RecordBody({ dataset, row, report }: RecordBodyProps) {
  const query = useDatasetRecord(dataset.id, row.recordId)
  const record = query.data
  const idKey = dataset.columns.find((c) => c.role === 'id')?.key
  const ids = new Set([row.recordId, idKey && String(row.values[idKey] ?? '')])
  const findings = report?.findings.filter((f) => f.recordId && ids.has(f.recordId)) ?? []
  const detected = [...new Set(findings.map((f) => entityLabel(f.entityType)))]
  const quality = QUALITY[row.quality]

  const fields = dataset.columns.filter((c) => c.key !== idKey && c.type !== 'text')
  const texts = dataset.columns.filter((c) => c.type === 'text')

  return (
    <DrawerContent>
      <DrawerSection aria-label="Summary">
        <MetaList>
          <MetaRow>
            <dt>Compliance</dt>
            <dd>
              {!report ? (
                '…'
              ) : detected.length ? (
                <>
                  <Glyph src={cancelIcon} size={24} slot={14} color={colors.error} />
                  Identifiers detected
                </>
              ) : (
                <>
                  <Glyph src={checkCircleIcon} size={14} color={colors.success} />
                  Passed
                </>
              )}
            </dd>
          </MetaRow>
          <MetaRow>
            <dt>Quality</dt>
            <dd>
              <Dot style={{ '--dot': TONE_COLOR[quality.tone] } as CSSProperties}>
                {quality.label}
              </Dot>
            </dd>
          </MetaRow>
        </MetaList>
      </DrawerSection>

      {query.isError ? (
        <DrawerSection>
          <Notice tone="error">Couldn&apos;t load the record: {query.error.message}</Notice>
        </DrawerSection>
      ) : (
        <>
          <DrawerSection aria-labelledby="record-fields">
            <SectionLabel id="record-fields">Generated fields</SectionLabel>
            <MetaList>
              {fields.map((column) => (
                <MetaRow key={column.key}>
                  <dt>{column.label}</dt>
                  <dd>
                    {record ? (
                      formatCell(record.values[column.key] ?? null, column.type)
                    ) : (
                      <Skeleton variant="text" width={80} />
                    )}
                  </dd>
                </MetaRow>
              ))}
            </MetaList>
          </DrawerSection>

          {texts.map((column) => (
            <DrawerSection key={column.key} aria-label={column.label}>
              <SectionLabel as="h3">{column.label}</SectionLabel>
              {record ? (
                <TextBlock>{formatCell(record.values[column.key] ?? null)}</TextBlock>
              ) : (
                <Skeleton variant="rounded" height={64} />
              )}
            </DrawerSection>
          ))}
        </>
      )}

      <DrawerSection aria-labelledby="record-compliance">
        <SectionLabel id="record-compliance">Compliance</SectionLabel>
        <Checklist>
          {report &&
            (detected.length ? (
              <CheckItem
                tone="error"
                emphasis
                label="Direct identifiers detected:"
                state={detected.join(', ')}
              />
            ) : (
              <CheckItem tone="success" label="No direct identifiers detected" />
            ))}
          {row.issues.length ? (
            row.issues.map((issue) => <CheckItem key={issue} tone="warning" label={issue} />)
          ) : (
            <CheckItem tone="success" label="Field consistency:" state="High" />
          )}
          {report?.checks
            .filter((check) => RECORD_CHECKS.has(check.id))
            .map((check) => (
              <CheckItem
                key={check.id}
                tone={check.passed ? 'success' : 'error'}
                emphasis={!check.passed}
                label={check.label}
              />
            ))}
        </Checklist>
      </DrawerSection>
    </DrawerContent>
  )
}
