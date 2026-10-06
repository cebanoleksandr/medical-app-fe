import { Fragment, useId } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import Drawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import type { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import type { EntityType, RiskLevel } from '../../api/types'
import type { RiskPresets } from './configRequest'
import arrowIcon from '../../assets/configuration/arrow-right.svg'
import { colors, shadows, typography } from '../../theme'
import { IconButton, MaskIcon } from '../ui'
import {
  ENTITIES,
  ENTITY_GROUPS,
  MEDIUM_LOGIC,
  useLawText,
  type EntityGroupId,
  type LawInfo,
} from './entityConfig'

export interface LogicDrawerProps {
  open: boolean
  onClose: () => void
  law: LawInfo
  /** Explains this level's preset; Medium when none is picked yet. */
  level: RiskLevel | undefined
  presets: RiskPresets
}

const Panel = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 'min(608px, 100vw)',
  minHeight: '100%',
  padding: '24px 16px',
  backgroundColor: colors.white,
  boxShadow: shadows.lg,
})

const Header = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '20px 24px',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  '& > div': { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, maxWidth: 347, margin: 0, color: colors.neutral[500] },
})

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: 24,
  '@media (max-width: 720px)': { padding: '24px 8px' },
})

const Group = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  overflow: 'hidden',
  paddingBottom: 8,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  boxShadow: shadows.md,
  '&:first-of-type': { boxShadow: 'none' },
  '&[data-special]': { borderColor: colors.warning },
})

const GroupHeader = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 4,
  minHeight: 32,
  padding: '4px 16px',
  backgroundColor: colors.neutral[100],
  '& h3': {
    ...typography.labelS,
    margin: 0,
    color: colors.neutral[700],
    textTransform: 'uppercase',
  },
  '& p': { ...typography.bodyS, margin: 0, color: colors.neutral[500] },
  '[data-special] > &': {
    backgroundColor: 'rgba(254, 249, 195, 0.3)',
    '& h3': { color: colors.warning },
  },
})

const Item = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '0 16px',
  '& p': { ...typography.bodyS, margin: 0, color: colors.neutral[500] },
})

const Line = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  '& > .LogicDrawer-arrow': { fontSize: 24, color: colors.neutral[300] },
  '& > strong': { ...typography.labelM, color: colors.primary[500] },
})

const Entity = styled('span')({
  ...typography.labelS,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: colors.primary[500],
  '& > span': { fontSize: 16 },
})

const Divider = styled('span')({
  alignSelf: 'stretch',
  width: 1,
  backgroundColor: colors.neutral[200],
})

/** Low and High have no hand-written rationale: describe their methods. */
/** One line of the drawer: entity types, the method they get, and why. */
interface LogicLine {
  entities: EntityType[]
  method: string
  rationale: string
}

interface LogicGroup {
  id: EntityGroupId
  special?: boolean
  items: LogicLine[]
}

/** Low and High have no hand-written rationale: describe their methods. */
function presetLogic(level: RiskLevel, presets: RiskPresets, t: TFunction<'deIdentify'>): LogicGroup[] {
  const preset = presets[level]
  return ENTITY_GROUPS.map((group) => {
    const items: LogicLine[] = []
    for (const entity of group.entities) {
      const method = preset[entity.type]
      const name = t(`methods.${method}.short`)
      const last = items.at(-1)
      // Neighbours with the same method share a line, as in the design.
      if (last && last.method === name) last.entities.push(entity.type)
      else
        items.push({
          entities: [entity.type],
          method: name,
          rationale: t(`methods.${method}.description`),
        })
    }
    return { id: group.id, special: group.special, items }
  })
}

/** The Medium preset's hand-written explanation. */
function mediumLogic(articleShort: string, t: TFunction<'deIdentify'>): LogicGroup[] {
  return MEDIUM_LOGIC.map((group) => ({
    id: group.group,
    special: group.special,
    items: group.items.map((item) => ({
      entities: item.entities,
      method: t(`logic.medium.${item.key}.method`),
      rationale: t(`logic.medium.${item.key}.rationale`, { article: articleShort }),
    })),
  }))
}

const entityInfo = new Map(ENTITIES.map((entity) => [entity.type, entity]))

/** Side panel explaining which method each entity type gets and why. */
export function LogicDrawer({ open, onClose, law, level, presets }: LogicDrawerProps) {
  const { t } = useTranslation(['deIdentify', 'common'])
  const lawText = useLawText(law)
  const titleId = useId()
  const groups =
    !level || level === 'MEDIUM'
      ? mediumLogic(lawText.articleShort, t)
      : presetLogic(level, presets, t)

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { 'aria-labelledby': titleId, sx: { boxShadow: 'none' } } }}
    >
      <Panel>
        <Header>
          <div>
            <h2 id={titleId}>{t('logic.title')}</h2>
            <IconButton variant="ghost" aria-label={t('common:actions.close')} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <p>
            <Trans t={t} i18nKey="logic.intro" values={{ law: lawText.name }} />
          </p>
        </Header>
        <Content>
          {groups.map((group) => (
            <Group key={group.id} data-special={group.special || undefined}>
              <GroupHeader>
                <h3>
                  {group.special
                    ? t('entityGroups.specialArticle', { article: lawText.specialArticle })
                    : t(`entityGroups.${group.id}`)}
                </h3>
                {group.special && (
                  <p>
                    <Trans
                      t={t}
                      i18nKey="logic.specialNote"
                      values={{ article: lawText.articleLong }}
                    />
                  </p>
                )}
              </GroupHeader>
              {group.items.map((item) => (
                <Item key={item.entities.join()}>
                  <Line>
                    {item.entities.map((type, index) => {
                      const entity = entityInfo.get(type)!
                      return (
                        <Fragment key={type}>
                          {index > 0 && <Divider aria-hidden />}
                          <Entity>
                            <MaskIcon src={entity.icon} aria-hidden />
                            {t(`entities.${entity.type}`)}
                          </Entity>
                        </Fragment>
                      )
                    })}
                    <MaskIcon className="LogicDrawer-arrow" src={arrowIcon} aria-hidden />
                    <strong>{item.method}</strong>
                  </Line>
                  <p>{item.rationale}</p>
                </Item>
              ))}
            </Group>
          ))}
        </Content>
      </Panel>
    </Drawer>
  )
}
