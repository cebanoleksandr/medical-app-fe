import {
  Fragment,
  useId,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ButtonBase from '@mui/material/ButtonBase'
import ListSubheader from '@mui/material/ListSubheader'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { colors, radius, shadows, typography } from '../../theme'

export interface DropdownOption<T extends string = string> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  /** Consecutive options with the same group get one header. */
  group?: string
  /** Extra content before the check mark, e.g. a badge. */
  trailing?: ReactNode
  disabled?: boolean
}

/**
 * `default`: trigger shows the selected option's icon and description.
 * `compact`: 36px trigger, one-line items, check mark on the left.
 * `field`: form field with a fixed `triggerIcon`; items as in `compact`, plus
 * their descriptions.
 */
export type DropdownSize = 'default' | 'compact' | 'field'

export interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[]
  value: T | null
  onChange: (value: T) => void
  size?: DropdownSize
  placeholder?: string
  /** Fixed trigger text instead of the selected option, e.g. "Sort by". */
  triggerLabel?: string
  /** Replaces the selected option's description in the trigger. */
  triggerDescription?: string
  /** `field` size: icon in the trigger whatever is selected. */
  triggerIcon?: ReactNode
  /** Extra trigger content before the chevron, e.g. an "Auto-detected" badge. */
  triggerTrailing?: ReactNode
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

const Trigger = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'open',
})<{ size: DropdownSize; open: boolean }>(({ size, open }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: size === 'compact' ? 12 : 16,
  width: '100%',
  minHeight: size === 'compact' ? 36 : undefined,
  padding: size === 'compact' ? '4px 12px' : '8px 12px',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: open ? `${radius.md}px ${radius.md}px 0 0` : radius.md,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
  color: size === 'compact' ? colors.neutral[700] : colors.neutral[900],
  textAlign: 'left',
  transition: 'border-color 150ms',
  '&:hover': { borderColor: colors.neutral[300] },
  '&.Mui-focusVisible': {
    borderColor: colors.primary[500],
    outline: `1px solid ${colors.primary[500]}`,
  },
  '&.Mui-disabled': {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    color: colors.neutral[300],
    '& .Dropdown-description, & .Dropdown-icon': { color: 'inherit' },
  },
  ...(size === 'field' && {
    color: colors.neutral[700],
    '& .Dropdown-icon': { color: colors.neutral[400] },
    '& .Dropdown-chevron': { color: colors.neutral[500] },
    // Not applicable rather than broken: the field stays white.
    '&.Mui-disabled': {
      backgroundColor: colors.white,
      color: colors.neutral[400],
      '& .Dropdown-icon, & .Dropdown-chevron': { color: colors.neutral[300] },
    },
  }),
}))

const TriggerLeading = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: 42,
  height: 42,
  fontSize: 24,
  color: colors.neutral[500],
  '& > svg': { fontSize: 'inherit' },
})

const Text = styled('span')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
})

const Label = styled('span')(typography.bodyL)

const Icon = styled('span')({
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: 24,
  '& > svg': { fontSize: 'inherit' },
})

const Header = styled(ListSubheader)({
  ...typography.labelS,
  display: 'flex',
  alignItems: 'center',
  height: 32,
  padding: '0 10px',
  backgroundColor: colors.neutral[50],
  color: colors.neutral[400],
  textTransform: 'uppercase',
  // Stays in the flow: sticky headers would cover items when scrolling.
  position: 'static',
})

const Item = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: DropdownSize }>(({ size }) => ({
  gap: 12,
  minHeight: size === 'default' ? 56 : 0,
  padding: size === 'default' ? '8px 12px' : '4px 12px',
  backgroundColor: colors.white,
  color: colors.neutral[900],
  whiteSpace: 'normal',
  '& .Dropdown-icon': { color: colors.neutral[400] },
  '& .Dropdown-description': { ...typography.bodyS, color: colors.neutral[400] },
  '&:hover': {
    backgroundColor: colors.neutral[50],
    '& .Dropdown-description': { color: colors.neutral[500] },
  },
  '&.Mui-focusVisible': {
    backgroundColor: colors.neutral[100],
    boxShadow: `inset 0 0 0 2px ${colors.primary[500]}`,
  },
  '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
    backgroundColor: colors.primary[50],
    color: colors.primary[500],
    '& .Dropdown-label': typography.labelL,
    '& .Dropdown-icon': { color: colors.primary[500] },
    '& .Dropdown-description': { color: colors.neutral[700] },
  },
  '&.Mui-disabled': {
    opacity: 1,
    color: colors.neutral[400],
  },
}))

/**
 * Single-select dropdown from the design system: method picker, period
 * filter, language picker and the like.
 */
export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  size = 'default',
  placeholder,
  triggerLabel,
  triggerDescription,
  triggerIcon,
  triggerTrailing,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: DropdownProps<T>) {
  const { t } = useTranslation()
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const listId = `${triggerId}-list`
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  // Kept after closing so the menu doesn't shrink while it fades out.
  const [menuWidth, setMenuWidth] = useState<number>()
  const open = anchor !== null

  const selected = options.find((option) => option.value === value)
  const isCompact = size === 'compact'
  // Check mark on the left, as in `compact`.
  const listCompact = size !== 'default'
  const description = triggerDescription ?? selected?.description
  const hasIcons = options.some((option) => option.icon)

  const close = () => setAnchor(null)
  const select = (option: DropdownOption<T>) => {
    close()
    if (option.value !== value) onChange(option.value)
  }

  const openMenu = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    setMenuWidth(event.currentTarget.offsetWidth)
    setAnchor(event.currentTarget)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu(event)
    }
  }

  const chevron = listCompact
    ? open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
    : open ? <KeyboardArrowDownIcon /> : <ChevronRightIcon />

  return (
    <>
      <Trigger
        id={triggerId}
        className={className}
        size={size}
        open={open}
        disabled={disabled}
        disableRipple
        onClick={openMenu}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {size === 'field' ? (
          triggerIcon && <TriggerLeading className="Dropdown-icon">{triggerIcon}</TriggerLeading>
        ) : (
          !isCompact &&
          selected?.icon && (
            <TriggerLeading className="Dropdown-icon">{selected.icon}</TriggerLeading>
          )
        )}
        <Text>
          <Label
            sx={{
              // A field's placeholder names the field, so it isn't greyed out.
              color: selected || triggerLabel || size === 'field' ? undefined : colors.neutral[400],
            }}
          >
            {triggerLabel ?? selected?.label ?? placeholder ?? t('select.placeholder')}
          </Label>
          {size === 'default' && description && (
            <span
              className="Dropdown-description"
              style={{ ...typography.bodyM, color: colors.neutral[500] }}
            >
              {description}
            </span>
          )}
        </Text>
        {triggerTrailing}
        <Icon className="Dropdown-chevron">{chevron}</Icon>
      </Trigger>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: menuWidth,
              boxSizing: 'border-box',
              maxHeight: 440,
              // Overlaps the trigger's bottom border so they share one line.
              marginTop: '-1px',
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: `0 0 ${radius.md}px ${radius.md}px`,
              boxShadow: shadows.md,
            },
          },
          list: {
            id: listId,
            role: 'listbox',
            'aria-labelledby': ariaLabelledBy ?? triggerId,
            disablePadding: true,
          },
        }}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value
          const showHeader = option.group && option.group !== options[index - 1]?.group
          return (
            <Fragment key={option.value}>
              {showHeader && <Header>{option.group}</Header>}
              <Item
                size={size}
                role="option"
                aria-selected={isSelected}
                selected={isSelected}
                disabled={option.disabled}
                disableRipple
                onClick={() => select(option)}
              >
                {listCompact ? (
                  // The leading slot is kept on every row so labels line up.
                  <Icon className="Dropdown-icon">{isSelected && <CheckIcon />}</Icon>
                ) : (
                  hasIcons && <Icon className="Dropdown-icon">{option.icon}</Icon>
                )}
                <Text>
                  <Label className="Dropdown-label">{option.label}</Label>
                  {!isCompact && option.description && (
                    <span className="Dropdown-description">{option.description}</span>
                  )}
                </Text>
                {option.trailing}
                {size === 'default' && isSelected && (
                  <Icon className="Dropdown-icon">
                    <CheckIcon />
                  </Icon>
                )}
              </Item>
            </Fragment>
          )
        })}
      </Menu>
    </>
  )
}
