import { useRef, type KeyboardEvent } from 'react'
import { styled } from '@mui/material/styles'
import editIcon from '../../assets/data-input/edit.svg'
import uploadIcon from '../../assets/data-input/upload.svg'
import { colors, radius, typography } from '../../theme'
import type { InputMode } from '../layouts/de-identify/context'
import { MaskIcon } from '../ui'

export interface InputModeTabsProps {
  value: InputMode
  onChange: (mode: InputMode) => void
  /** Id prefix: tab `${idPrefix}-text` controls panel `${idPrefix}-text-panel`. */
  idPrefix: string
}

const TABS: { mode: InputMode; label: string; icon: string }[] = [
  { mode: 'text', label: 'Enter Text', icon: editIcon },
  { mode: 'file', label: 'Upload File', icon: uploadIcon },
]

const List = styled('div')({
  display: 'flex',
  width: 'fit-content',
  maxWidth: '100%',
  padding: 4,
  borderRadius: radius.md,
  backgroundColor: colors.neutral[100],
})

const Tab = styled('button')({
  ...typography.labelM,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  width: 196,
  minWidth: 0,
  flexShrink: 1,
  height: 40,
  padding: '8px 16px',
  border: 0,
  borderRadius: radius.md,
  background: 'none',
  color: colors.neutral[400],
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms, box-shadow 150ms',
  '& > span:first-of-type': { fontSize: 16 },
  '&:hover': { color: colors.neutral[500] },
  '&:focus-visible': { outline: `2px solid ${colors.accent[400]}`, outlineOffset: -2 },
  '&[aria-selected="true"]': {
    ...typography.labelL,
    backgroundColor: colors.white,
    color: colors.primary[500],
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    cursor: 'default',
  },
})

/** "Enter Text / Upload File" switch of the Data Input step. */
export function InputModeTabs({ value, onChange, idPrefix }: InputModeTabsProps) {
  const refs = useRef<Partial<Record<InputMode, HTMLButtonElement | null>>>({})

  // Arrow keys move between tabs and select them, as in a WAI-ARIA tablist.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = value === 'text' ? 'file' : 'text'
    onChange(next)
    refs.current[next]?.focus()
  }

  return (
    <List role="tablist" aria-label="Input type" onKeyDown={onKeyDown}>
      {TABS.map(({ mode, label, icon }) => {
        const selected = mode === value
        return (
          <Tab
            key={mode}
            ref={(node) => {
              refs.current[mode] = node
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-${mode}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-${mode}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(mode)}
          >
            <MaskIcon src={icon} aria-hidden />
            {label}
          </Tab>
        )
      })}
    </List>
  )
}
