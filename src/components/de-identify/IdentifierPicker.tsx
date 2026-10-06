import { useId, useMemo, useState } from 'react'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Collapse from '@mui/material/Collapse'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { IdentifierKey, MethodOption } from '../../api/types'
import peopleIcon from '../../assets/configuration/people.svg'
import { useCatalog } from '../../i18n/useCatalog'
import { colors, shadows, typography } from '../../theme'
import { Checkbox } from '../ui'
import { groupIdentifiers } from './identifierGroups'

export interface IdentifierPickerProps {
  method: MethodOption
  /** Checked keys; ignored for methods that apply every identifier. */
  value: IdentifierKey[]
  onChange: (value: IdentifierKey[]) => void
}

const Root = styled('div')({
  borderRadius: 8,
  boxShadow: '0 1px 1.5px rgba(0, 0, 0, 0.08)',
})

const Trigger = styled('button')({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  color: colors.neutral[500],
  fontFamily: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'border-color 150ms, border-radius 150ms',
  '&:hover': { borderColor: colors.neutral[300] },
  '&:focus-visible': {
    outline: `1px solid ${colors.primary[500]}`,
    borderColor: colors.primary[500],
  },
  '&[aria-expanded="true"]': { borderRadius: '8px 8px 0 0' },
  '& img': { flexShrink: 0, width: 42, height: 42 },
  '& svg': { flexShrink: 0, fontSize: 24 },
})

const TriggerText = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  '& strong': { ...typography.bodyL, color: colors.primary[600] },
  '& span': { ...typography.bodyM, color: colors.neutral[400] },
})

const Panel = styled('div')({
  overflow: 'hidden',
  marginTop: -1,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: '0 0 8px 8px',
  backgroundColor: colors.white,
  boxShadow: shadows.md,
})

const GroupTitle = styled('div')({
  ...typography.labelS,
  display: 'flex',
  alignItems: 'center',
  height: 32,
  padding: '0 16px',
  borderBottom: `1px solid ${colors.neutral[100]}`,
  backgroundColor: colors.neutral[100],
  color: colors.neutral[700],
  textTransform: 'uppercase',
  '[data-readonly] &': { backgroundColor: colors.neutral[50] },
})

const Items = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  '@media (max-width: 720px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const Item = styled('label')({
  ...typography.bodyM,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  minHeight: 32,
  paddingInline: 4,
  color: colors.neutral[900],
  cursor: 'pointer',
  transition: 'background-color 150ms',
  // The design's checkbox is 18px in a 24px box; MUI's has 8px padding.
  '& .MuiCheckbox-root': { padding: 7, margin: -3 },
  '&:hover': { backgroundColor: colors.neutral[50] },
  '&[data-checked]': {
    ...typography.labelL,
    backgroundColor: colors.primary[50],
    color: colors.primary[500],
  },
  '&[data-disabled]': {
    ...typography.bodyM,
    backgroundColor: colors.white,
    color: colors.neutral[400],
    cursor: 'default',
  },
})

/**
 * "Applied Identifiers" dropdown: a summary row that expands into the
 * identifiers by category. Read-only for methods that remove all of them.
 */
export function IdentifierPicker({ method, value, onChange }: IdentifierPickerProps) {
  const { t } = useTranslation('deIdentify')
  const catalog = useCatalog()
  const panelId = useId()
  const readOnly = !method.customizable
  // Customizable methods open straight away: picking is the next step.
  const [open, setOpen] = useState(method.customizable)
  const groups = useMemo(() => groupIdentifiers(method.identifiers), [method.identifiers])
  const checked = new Set(readOnly ? method.identifiers.map((item) => item.key) : value)

  const toggle = (key: IdentifierKey) => {
    const next = new Set(value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    // Keep the catalogue's order, which the request and summaries use.
    onChange(method.identifiers.map((item) => item.key).filter((item) => next.has(item)))
  }

  const count = checked.size
  const summary = readOnly
    ? t('identifierPicker.included', { count })
    : count === 0
      ? t('identifierPicker.none')
      : t('identifierPicker.selected', { count, total: method.identifiers.length })
  const hint = readOnly
    ? t('identifierPicker.allRemoved', { method: catalog.method(method).name })
    : t('identifierPicker.selectHint')

  return (
    <Root data-readonly={readOnly || undefined}>
      <Trigger
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <img src={peopleIcon} alt="" />
        <TriggerText>
          <strong>{summary}</strong>
          <span>{hint}</span>
        </TriggerText>
        {open ? <KeyboardArrowDownIcon /> : <ChevronRightIcon />}
      </Trigger>
      <Collapse in={open} timeout={200}>
        <Panel id={panelId} role="group" aria-label={t('identifierPicker.label')}>
          {groups.map((group) => (
            <div key={group.id}>
              <GroupTitle>{t(`identifierPicker.groups.${group.id}`)}</GroupTitle>
              <Items>
                {group.items.map((item) => {
                  const isChecked = checked.has(item.key)
                  return (
                    <Item
                      key={item.key}
                      data-checked={(isChecked && !readOnly) || undefined}
                      data-disabled={readOnly || undefined}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={readOnly}
                        onChange={() => toggle(item.key)}
                      />
                      {t(`identifierPicker.short.${item.key}`, {
                        defaultValue: catalog.identifier(item),
                      })}
                    </Item>
                  )
                })}
              </Items>
            </div>
          ))}
        </Panel>
      </Collapse>
    </Root>
  )
}
