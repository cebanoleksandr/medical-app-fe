import { useId, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import type { Dataset } from '../../api/types'
import { colors, typography } from '../../theme'
import { Button, Checkbox } from '../ui'
import { DrawerContent, DrawerHeader, DrawerPanel } from './drawerStyles'
import { Notice } from './parts'
import { CheckboxOption, SectionLabel } from './styles'
import {
  QUALITY_COLUMN,
  columnOptions,
  defaultColumns,
  type ColumnOption,
} from './resultModel'

const Selected = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '16px 0',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  '& > h3': { ...typography.labelM, margin: 0, padding: '8px 0', color: colors.neutral[700] },
})

const Additional = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  padding: '16px 0',
})

const List = styled('div')({ display: 'flex', flexDirection: 'column', gap: 8 })

const Grid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
  '& label': { overflowWrap: 'anywhere' },
})

const Footer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '20px 0 0',
  borderTop: `1px solid ${colors.neutral[200]}`,
})

interface ColumnsDrawerProps {
  open: boolean
  onClose: () => void
  dataset: Dataset
  columns: string[]
  onApply: (columns: string[]) => void
}

/** Picks the preview table's columns; the drawer opens with the current set. */
export function ColumnsDrawer({ open, onClose, dataset, columns, onApply }: ColumnsDrawerProps) {
  const titleId = useId()
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { 'aria-labelledby': titleId, sx: { boxShadow: 'none' } } }}
    >
      <DrawerPanel>
        <DrawerHeader
          titleId={titleId}
          title="Customize columns"
          subtitle="Choose fields to display"
          onClose={onClose}
        />
        {/* Remounts on open, so unapplied changes are dropped. */}
        {open && (
          <ColumnsForm
            dataset={dataset}
            columns={columns}
            onApply={(next) => {
              onApply(next)
              onClose()
            }}
          />
        )}
      </DrawerPanel>
    </Drawer>
  )
}

interface ColumnsFormProps {
  dataset: Dataset
  columns: string[]
  onApply: (columns: string[]) => void
}

function ColumnsForm({ dataset, columns, onApply }: ColumnsFormProps) {
  const { defaults, additional } = columnOptions(dataset)
  const locked = defaults.filter((c) => c.locked).map((c) => c.key)
  const [selected, setSelected] = useState(() => new Set([...locked, ...columns]))
  const total = defaults.length + additional.length

  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // Data columns in dataset order, Quality last.
  const apply = () =>
    onApply([
      ...dataset.columns.map((c) => c.key).filter((key) => selected.has(key)),
      ...(selected.has(QUALITY_COLUMN) ? [QUALITY_COLUMN] : []),
    ])

  const option = (column: ColumnOption) => (
    <CheckboxOption key={column.key}>
      <Checkbox
        checked={column.locked || selected.has(column.key)}
        disabled={column.locked}
        onChange={() => toggle(column.key)}
      />
      {column.label}
    </CheckboxOption>
  )

  return (
    <DrawerContent>
      <Notice tone="info">
        This only affects the preview table. Downloaded dataset includes all {dataset.fields}{' '}
        fields
      </Notice>
      <Selected aria-labelledby="columns-selected">
        <h3 id="columns-selected">
          Selected {selected.size} of {total}
        </h3>
        <List>{defaults.map(option)}</List>
      </Selected>
      {additional.length > 0 && (
        <Additional aria-labelledby="columns-additional">
          <SectionLabel id="columns-additional">Additional fields</SectionLabel>
          <Grid>{additional.map(option)}</Grid>
        </Additional>
      )}
      <Footer style={additional.length ? undefined : { marginTop: 'auto' }}>
        <Button
          variant="ghostSecondary"
          size="medium"
          onClick={() => setSelected(new Set([...locked, ...defaultColumns(dataset)]))}
        >
          Reset to default
        </Button>
        <Button variant="secondary" size="medium" onClick={apply}>
          Apply
        </Button>
      </Footer>
    </DrawerContent>
  )
}
