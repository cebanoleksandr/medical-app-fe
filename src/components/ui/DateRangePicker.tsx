import { useId, useState, type KeyboardEvent } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ButtonBase from '@mui/material/ButtonBase'
import Popover from '@mui/material/Popover'
import { styled } from '@mui/material/styles'
import eventIcon from '../../assets/dashboard/event.svg'
import { colors, radius, shadows, typography } from '../../theme'
import { Button } from './Button'
import { MaskIcon } from './MaskIcon'

/** Calendar days in the user's zone; `to` is the last included day. */
export interface DateRange {
  from: Date | null
  to: Date | null
}

// ---------- day helpers (local calendar days) ----------

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime()
const pad = (n: number) => String(n).padStart(2, '0')
const formatInput = (d: Date | null) =>
  d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : ''

/** "21/04/2026" → that day; null when it isn't a real date. */
function parseInput(text: string): Date | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim())
  if (!match) return null
  const [day, month, year] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

const triggerFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long' })
const longFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** Six weeks starting on the Sunday on or before the 1st. */
function monthGrid(month: Date) {
  const first = startOfMonth(month)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay())
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  )
}

// ---------- styles ----------

const Trigger = styled(ButtonBase)({
  ...typography.bodyL,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: '100%',
  height: 36,
  padding: '4px 12px',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: radius.md,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
  color: colors.neutral[700],
  whiteSpace: 'nowrap',
  '&[data-placeholder]': { color: colors.neutral[500] },
  '& svg': { flexShrink: 0, color: colors.neutral[500] },
  '&:hover': { borderColor: colors.neutral[300] },
  '&.Mui-focusVisible': {
    borderColor: colors.primary[500],
    outline: `1px solid ${colors.primary[500]}`,
  },
})

const Panel = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 'min(768px, calc(100vw - 32px))',
  padding: 16,
  '& h2': {
    ...typography.h4,
    margin: 0,
    padding: '8px 0',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    color: colors.neutral[900],
  },
})

const Pair = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 16,
  '@media (max-width: 720px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})

const Field = styled('label')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  height: 56,
  margin: '8px 0',
  padding: '0 8px 0 16px',
  border: `1px solid ${colors.neutral[300]}`,
  borderRadius: radius.md,
  backgroundColor: colors.white,
  '&:focus-within': { borderColor: colors.primary[500], outline: `1px solid ${colors.primary[500]}` },
  '&[data-invalid]': { borderColor: colors.error },
  '& > span:first-of-type': {
    ...typography.labelS,
    position: 'absolute',
    top: -9,
    left: 12,
    padding: '0 4px',
    backgroundColor: colors.white,
    color: colors.neutral[500],
  },
  '& input': {
    ...typography.bodyM,
    flex: 1,
    minWidth: 0,
    border: 0,
    outline: 'none',
    background: 'none',
    color: colors.neutral[900],
  },
  '& .DateRangePicker-event': { fontSize: 24, margin: 8, color: colors.neutral[500] },
})

const Calendar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})

const Nav = styled('div')({
  ...typography.labelM,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 64,
  color: colors.neutral[700],
  '& > div': { display: 'flex', alignItems: 'center', gap: 4 },
  '& > div > span': { minWidth: 72, textAlign: 'center' },
  '& button': {
    width: 40,
    height: 40,
    borderRadius: '50%',
    color: colors.neutral[700],
    '&:hover': { backgroundColor: colors.neutral[100] },
    '&.Mui-disabled': { color: colors.neutral[300] },
  },
})

const Grid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  rowGap: 0,
  '& > abbr': {
    ...typography.bodyL,
    height: 48,
    lineHeight: '48px',
    textAlign: 'center',
    textDecoration: 'none',
    color: colors.neutral[900],
  },
})

// 48px cell; the band shows the range, the 40px circle the day itself.
const Day = styled(ButtonBase)({
  ...typography.bodyL,
  position: 'relative',
  height: 48,
  color: colors.neutral[700],
  '& .DateRangePicker-day': {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1px solid transparent',
  },
  '&:hover .DateRangePicker-day': { backgroundColor: colors.neutral[100] },
  '&.Mui-focusVisible .DateRangePicker-day': { outline: `2px solid ${colors.primary[300]}` },
  '&[data-today] .DateRangePicker-day': { borderColor: colors.primary[500] },
  '&[data-in-range]': { backgroundColor: colors.primary[50] },
  '&[data-start]': { background: `linear-gradient(to right, transparent 50%, ${colors.primary[50]} 50%)` },
  '&[data-end]': { background: `linear-gradient(to left, transparent 50%, ${colors.primary[50]} 50%)` },
  '&[data-start][data-end]': { background: 'none' },
  '&[data-start] .DateRangePicker-day, &[data-end] .DateRangePicker-day': {
    backgroundColor: colors.primary[500],
    color: colors.white,
  },
  '&[data-outside]': { color: colors.neutral[300], opacity: 0.6 },
  '&.Mui-disabled': { color: colors.neutral[300] },
})

const Actions = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 12px',
  '& > :first-of-type': { marginRight: 'auto' },
  '& .DateRangePicker-cancel': { color: colors.neutral[500] },
})

// ---------- components ----------

interface MonthViewProps {
  month: Date
  onMonth: (month: Date) => void
  draft: DateRange
  onPick: (day: Date) => void
  max: Date
}

function MonthView({ month, onMonth, draft, onPick, max }: MonthViewProps) {
  const today = startOfDay(new Date())
  const { from, to } = draft
  const nextMonth = addMonths(month, 1)
  return (
    <Calendar>
      <Nav>
        <div>
          <ButtonBase aria-label="Previous month" onClick={() => onMonth(addMonths(month, -1))}>
            <ChevronLeftIcon />
          </ButtonBase>
          <span aria-live="polite">{monthFormat.format(month)}</span>
          <ButtonBase
            aria-label="Next month"
            disabled={nextMonth > max}
            onClick={() => onMonth(nextMonth)}
          >
            <ChevronRightIcon />
          </ButtonBase>
        </div>
        <div>
          <ButtonBase aria-label="Previous year" onClick={() => onMonth(addMonths(month, -12))}>
            <ChevronLeftIcon />
          </ButtonBase>
          <span>{month.getFullYear()}</span>
          <ButtonBase
            aria-label="Next year"
            disabled={addMonths(month, 12) > max}
            onClick={() => onMonth(addMonths(month, 12))}
          >
            <ChevronRightIcon />
          </ButtonBase>
        </div>
      </Nav>
      <Grid role="grid" aria-label={`${monthFormat.format(month)} ${month.getFullYear()}`}>
        {WEEKDAYS.map((day, i) => (
          <abbr key={i} aria-hidden>
            {day}
          </abbr>
        ))}
        {monthGrid(month).map((day) => {
          const outside = day.getMonth() !== month.getMonth()
          const start = sameDay(day, from)
          const end = sameDay(day, to ?? from)
          const inRange = !!from && !!to && day > from && day < to
          return (
            <Day
              key={day.getTime()}
              disableRipple
              role="gridcell"
              aria-label={longFormat.format(day)}
              aria-selected={start || end || inRange}
              data-outside={outside || undefined}
              data-today={sameDay(day, today) || undefined}
              data-start={(!outside && start) || undefined}
              data-end={(!outside && end && !!to) || (!outside && start && !to) || undefined}
              data-in-range={(!outside && inRange) || undefined}
              // Neighbouring months' days are context only: the other grid owns them.
              aria-hidden={outside || undefined}
              disabled={outside || day > max}
              onClick={() => onPick(day)}
            >
              <span className="DateRangePicker-day">{day.getDate()}</span>
            </Day>
          )
        })}
      </Grid>
    </Calendar>
  )
}

interface DateFieldProps {
  label: string
  value: Date | null
  onCommit: (day: Date | null) => void
}

/** dd/mm/yyyy text input; applied on blur or Enter. */
function DateField({ label, value, onCommit }: DateFieldProps) {
  const [text, setText] = useState(formatInput(value))
  const [invalid, setInvalid] = useState(false)
  // Calendar clicks replace what was typed.
  const [shown, setShown] = useState(value)
  if (shown !== value) {
    setShown(value)
    setText(formatInput(value))
    setInvalid(false)
  }
  const commit = () => {
    if (!text.trim()) return onCommit(null)
    const day = parseInput(text)
    setInvalid(!day)
    if (day) onCommit(day)
  }
  return (
    <Field data-invalid={invalid || undefined}>
      <span>{label}</span>
      <input
        value={text}
        placeholder="dd/mm/yyyy"
        inputMode="numeric"
        aria-invalid={invalid}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => event.key === 'Enter' && commit()}
      />
      <MaskIcon className="DateRangePicker-event" src={eventIcon} aria-hidden />
    </Field>
  )
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (value: DateRange) => void
  placeholder?: string
  className?: string
  'aria-label'?: string
}

/** Trigger plus a two-month range calendar; changes apply on "Apply". */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Date',
  className,
  'aria-label': ariaLabel,
}: DateRangePickerProps) {
  const titleId = useId()
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)
  const [left, setLeft] = useState(() => startOfMonth(new Date()))
  const [right, setRight] = useState(() => startOfMonth(new Date()))
  const today = startOfDay(new Date())

  const openPicker = () => {
    setDraft(value)
    // The range's first and last months (or last month and this one), always
    // two different months and never past the current one.
    const thisMonth = startOfMonth(today)
    let start = startOfMonth(value.from ?? addMonths(thisMonth, -1))
    let end = startOfMonth(value.to ?? thisMonth)
    if (end <= start) end = addMonths(start, 1)
    if (end > thisMonth) {
      end = thisMonth
      if (start >= end) start = addMonths(end, -1)
    }
    setLeft(start)
    setRight(end)
    setOpen(true)
  }

  // First click starts a range, the second ends it (in either order).
  const pick = (day: Date) =>
    setDraft(({ from, to }) =>
      !from || to ? { from: day, to: null } : day < from ? { from: day, to: from } : { from, to: day },
    )

  const setStart = (day: Date | null) =>
    setDraft(({ to }) => (day && to && day > to ? { from: to, to: day } : { from: day, to }))
  const setEnd = (day: Date | null) =>
    setDraft(({ from }) => (day && from && day < from ? { from: day, to: from } : { from, to: day }))

  const apply = () => {
    onChange({ from: draft.from, to: draft.to ?? draft.from })
    setOpen(false)
  }

  const label =
    value.from && value.to
      ? sameDay(value.from, value.to)
        ? triggerFormat.format(value.from)
        : `${triggerFormat.format(value.from)} – ${triggerFormat.format(value.to)}`
      : null

  return (
    <>
      <Trigger
        ref={setAnchor}
        className={className}
        data-placeholder={!label || undefined}
        aria-label={ariaLabel ? `${ariaLabel}: ${label ?? 'any'}` : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
      >
        {label ?? placeholder}
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Trigger>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-labelledby': titleId,
            sx: {
              mt: '6px',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: `${radius.md}px`,
              boxShadow: shadows.lg,
            },
          },
        }}
      >
        <Panel>
          <h2 id={titleId}>Select date range</h2>
          <Pair>
            <DateField label="Start date" value={draft.from} onCommit={setStart} />
            <DateField label="End date" value={draft.to} onCommit={setEnd} />
          </Pair>
          <Pair>
            <MonthView month={left} onMonth={setLeft} draft={draft} onPick={pick} max={today} />
            <MonthView month={right} onMonth={setRight} draft={draft} onPick={pick} max={today} />
          </Pair>
          <Actions>
            <Button
              variant="ghostSecondary"
              size="medium"
              disabled={!draft.from && !value.from}
              onClick={() => {
                onChange({ from: null, to: null })
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              className="DateRangePicker-cancel"
              variant="ghostSecondary"
              size="medium"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="ghost" size="medium" disabled={!draft.from} onClick={apply}>
              Apply
            </Button>
          </Actions>
        </Panel>
      </Popover>
    </>
  )
}
