import { useId, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import { styled } from '@mui/material/styles'
import type { EntityMethod, EntityMethods, EntityType } from '../../api/types'
import autorenewIcon from '../../assets/configuration/autorenew.svg'
import unfoldIcon from '../../assets/configuration/unfold-less.svg'
import { colors, shadows, typography } from '../../theme'
import { Button, Dropdown, MaskIcon, type DropdownOption } from '../ui'
import { NARROW } from './configStyles'
import {
  ENTITIES,
  ENTITY_GROUPS,
  METHODS,
  METHOD_ORDER,
  type EntityInfo,
  type LawInfo,
} from './entityConfig'

export interface EntityConfigTableProps {
  law: LawInfo
  value: EntityMethods
  /** Whether `value` differs from the risk level's preset. */
  customized: boolean
  onChange: (type: EntityType, method: EntityMethod) => void
  /** Asks to go back to the preset; the parent confirms first. */
  onReset: () => void
}

const Root = styled('div')({
  overflow: 'hidden',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.md,
})

const Header = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  minHeight: 58,
  padding: '8px 8px 8px 20px',
  '& strong': { ...typography.labelM, display: 'block', color: colors.neutral[900] },
  '& span.EntityConfig-summary': { ...typography.bodyS, color: colors.neutral[500] },
  [NARROW]: { flexWrap: 'wrap' },
})

const Actions = styled('div')({ display: 'flex', alignItems: 'center', gap: 16 })

const GroupTitle = styled('div')({
  ...typography.labelS,
  display: 'flex',
  alignItems: 'center',
  height: 32,
  padding: '0 16px',
  borderTop: `1px solid ${colors.neutral[200]}`,
  backgroundColor: colors.neutral[100],
  color: colors.neutral[700],
  textTransform: 'uppercase',
  '&[data-special]': { color: colors.warning },
})

const Row = styled('div')({
  display: 'flex',
  alignItems: 'stretch',
  borderTop: `1px solid ${colors.neutral[100]}`,
  backgroundColor: colors.primary[50],
  // The shared Dropdown, flattened into a table cell.
  '& .EntityConfig-method': {
    flex: 1,
    minWidth: 0,
    border: 0,
    borderLeft: `1px solid ${colors.neutral[200]}`,
    borderRadius: 0,
    boxShadow: 'none',
    '&.Mui-focusVisible': { outlineOffset: -2 },
  },
  [NARROW]: {
    flexDirection: 'column',
    '& .EntityConfig-method': { borderLeft: 0, borderTop: `1px solid ${colors.neutral[200]}` },
  },
})

const Entity = styled('div')({
  ...typography.labelS,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: '0 0 240px',
  minWidth: 0,
  padding: '8px 16px',
  color: colors.primary[500],
  '& > span:first-of-type': { fontSize: 16 },
  [NARROW]: { flexBasis: 'auto' },
})

const SensitiveBadge = styled('span')({
  ...typography.bodyS,
  position: 'absolute',
  top: 4,
  right: 16,
  padding: '2px 12px',
  borderRadius: 9999,
  backgroundColor: 'rgba(254, 249, 195, 0.3)',
  color: colors.warning,
})

function methodOptions(entity: EntityInfo): DropdownOption<EntityMethod>[] {
  return METHOD_ORDER.map((method) => ({
    value: method,
    label: METHODS[method].label,
    description: METHODS[method].description,
    icon: <MaskIcon src={METHODS[method].icon} />,
    group: METHODS[method].group,
    // Special category data may only be removed.
    disabled: entity.special && method !== 'REDACT',
  }))
}

/** "Entity configuration": the method applied to each entity type. */
export function EntityConfigTable({ law, value, customized, onChange, onReset }: EntityConfigTableProps) {
  const panelId = useId()
  const [open, setOpen] = useState(false)

  return (
    <Root>
      <Header>
        <div>
          <strong>Entity configuration</strong>
          <span className="EntityConfig-summary">
            {ENTITIES.length} types · {customized ? 'Customized' : 'Auto-configured'}
          </span>
        </div>
        <Actions>
          {customized && (
            <Button
              variant="ghost"
              size="medium"
              startIcon={<MaskIcon src={autorenewIcon} />}
              onClick={onReset}
            >
              Reset to default
            </Button>
          )}
          <Button
            variant="ghostSecondary"
            size="medium"
            endIcon={<MaskIcon src={unfoldIcon} />}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((current) => !current)}
          >
            Customize
          </Button>
        </Actions>
      </Header>

      <Collapse in={open} timeout={250}>
        <div id={panelId} role="group" aria-label="Methods per entity type">
          {ENTITY_GROUPS.map((group) => (
            <div key={group.title}>
              <GroupTitle data-special={group.special || undefined}>
                {group.special ? `Special category — ${law.specialArticle}` : group.title}
              </GroupTitle>
              {group.entities.map((entity) => (
                <Row key={entity.type}>
                  <Entity id={`entity-${entity.type}`}>
                    <MaskIcon src={entity.icon} aria-hidden />
                    {entity.label}
                    {entity.special && <SensitiveBadge>Sensitive</SensitiveBadge>}
                  </Entity>
                  <Dropdown
                    className="EntityConfig-method"
                    options={methodOptions(entity)}
                    value={value[entity.type]}
                    onChange={(method) => onChange(entity.type, method)}
                    triggerDescription={
                      entity.special ? `${law.specialArticle} — Special category` : undefined
                    }
                    aria-labelledby={`entity-${entity.type}`}
                  />
                </Row>
              ))}
            </div>
          ))}
        </div>
      </Collapse>
    </Root>
  )
}
