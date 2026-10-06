import type { CSSProperties } from 'react'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { ColumnDefinition, Dataset, DatasetRecord, RecordsPage } from '../../api/types'
import descriptionIcon from '../../assets/generated/description.svg'
import settingsIcon from '../../assets/review/settings.svg'
import { colors, media, shadows, typography } from '../../theme'
import { Button, MaskIcon } from '../ui'
import { formatRecords } from '../synthetic/generationSettings'
import { Glyph } from './parts'
import { Dot, TONE_COLOR } from './styles'
import { formatCell, QUALITY, QUALITY_COLUMN, qualityLabel } from './resultModel'

const Root = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
})

const Header = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 24px',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: '4px 0 0', color: colors.neutral[500] },
  '@media (max-width: 720px)': { padding: 16 },
})

const Scroller = styled('div')({ overflowX: 'auto' })

// --cols: the shown data columns. Phones scroll sideways instead of cutting
// every value to a few letters.
const Table = styled('table')({
  width: '100%',
  minWidth: 'calc(var(--cols) * 100px + 125px)',
  [media.mobile]: { minWidth: 'calc(var(--cols) * 140px + 125px)' },
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  '& th': {
    ...typography.labelM,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    backgroundColor: colors.neutral[50],
    color: colors.neutral[500],
    textAlign: 'left',
  },
  '& td': {
    ...typography.labelS,
    height: 40,
    padding: '0 12px',
    borderBottom: `1px solid ${colors.neutral[100]}`,
    color: colors.neutral[700],
  },
  '& tbody tr:last-of-type td': { borderBottom: 0 },
  '& th, & td': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '& .RecordsTable-action': { width: 125, paddingLeft: 24 },
  '& td.RecordsTable-action': { paddingLeft: 0 },
})

const IdCell = styled('span')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: colors.neutral[900],
  '& > span:last-of-type': { overflow: 'hidden', textOverflow: 'ellipsis' },
})

const QualityCell = styled(Dot)({ ...typography.labelM, color: colors.neutral[500] })

const Message = styled('td')({
  '&&': { ...typography.bodyM, height: 120, textAlign: 'center', color: colors.neutral[500] },
})

interface RecordsTableProps {
  dataset: Dataset
  /** Column keys to show, QUALITY_COLUMN included. */
  columns: string[]
  page: RecordsPage | undefined
  error: Error | null
  onCustomize: () => void
  onView: (record: DatasetRecord) => void
}

/** The first records of the dataset with the chosen columns. */
export function RecordsTable({ dataset, columns, page, error, onCustomize, onView }: RecordsTableProps) {
  const { t } = useTranslation('synthetic')
  const definitions = new Map(dataset.columns.map((c) => [c.key, c]))
  const idKey = dataset.columns.find((c) => c.role === 'id')?.key
  const shown = columns
    .map((key) =>
      key === QUALITY_COLUMN
        ? ({ key, label: t('result.quality.column'), type: 'string' } satisfies ColumnDefinition)
        : definitions.get(key),
    )
    .filter((c): c is ColumnDefinition => !!c)
  const span = shown.length + 1

  const cell = (row: DatasetRecord, column: ColumnDefinition) => {
    if (column.key === QUALITY_COLUMN) {
      const quality = QUALITY[row.quality]
      return (
        <QualityCell style={{ '--dot': TONE_COLOR[quality.tone] } as CSSProperties}>
          {qualityLabel(row.quality)}
        </QualityCell>
      )
    }
    const text = formatCell(row.values[column.key] ?? null, column.type)
    if (column.key === idKey) {
      return (
        <IdCell>
          <Glyph src={descriptionIcon} size={16} />
          <span title={text}>{text}</span>
        </IdCell>
      )
    }
    return <span title={text}>{text}</span>
  }

  return (
    <Root aria-labelledby="preview-records-heading">
      <Header>
        <div>
          <h2 id="preview-records-heading">{t('result.table.title')}</h2>
          <p>
            {page
              ? t('result.table.showing', {
                  shown: formatRecords(page.rows.length),
                  total: formatRecords(page.total),
                })
              : t('result.table.total', { total: formatRecords(dataset.records) })}
          </p>
        </div>
        <Button
          variant="ghostSecondary"
          size="medium"
          startIcon={<MaskIcon src={settingsIcon} />}
          onClick={onCustomize}
        >
          {t('result.table.columns')}
        </Button>
      </Header>
      <Scroller>
        <Table style={{ '--cols': shown.length } as CSSProperties}>
          <thead>
            <tr>
              {shown.map((column) => (
                <th key={column.key} scope="col" title={column.label}>
                  {column.label}
                </th>
              ))}
              <th className="RecordsTable-action" scope="col">
                {t('result.table.action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {error && !page ? (
              <tr>
                <Message colSpan={span} role="alert">
                  {t('result.table.loadFailed', { message: error.message })}
                </Message>
              </tr>
            ) : !page ? (
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index}>
                  {Array.from({ length: span }, (_, column) => (
                    <td key={column}>
                      <Skeleton variant="text" width="70%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              page.rows.map((row) => (
                <tr key={row.recordId}>
                  {shown.map((column) => (
                    <td key={column.key}>{cell(row, column)}</td>
                  ))}
                  <td className="RecordsTable-action">
                    <Button
                      variant="ghostSecondary"
                      size="medium"
                      aria-label={t('result.table.viewRecord', { id: row.recordId })}
                      onClick={() => onView(row)}
                    >
                      {t('result.table.view')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Scroller>
    </Root>
  )
}
