import { useMemo, useState } from 'react'
import { styled } from '@mui/material/styles'
import { Trans, useTranslation } from 'react-i18next'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import type { DetectedEntity } from '../../api/types'
import { colors, typography } from '../../theme'
import { Dropdown, FilterChip } from '../ui'
import { EmptyEntitiesPicture } from './EmptyEntitiesPicture'
import { EntityRow } from './EntityRow'
import { SORT_ORDERS, categoryOf, sortEntities, type SortOrder, categoryText } from './reviewModel'

export interface EntityPanelProps {
  entities: DetectedEntity[]
  onToggle: (id: string) => void
  /** Row to scroll to and highlight, from a click in the document. */
  focusedId: string | null
}

const Root = styled(motion.section)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minHeight: 0,
  overflowY: 'auto',
  padding: 16,
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.white,
})

const Header = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  '& h2': { ...typography.h4, margin: 0, color: colors.neutral[900] },
})

const Count = styled('span')({
  ...typography.labelS,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 28,
  padding: '0 8px',
  borderRadius: 9999,
  backgroundColor: colors.neutral[100],
  color: colors.neutral[500],
})

const Sort = styled('div')({ width: 203, maxWidth: '100%' })

const Chips = styled('div')({ display: 'flex', flexWrap: 'wrap', gap: 8 })

const List = styled('ul')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

const Empty = styled('div')({
  ...typography.bodyS,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  minHeight: 240,
  textAlign: 'center',
  color: colors.neutral[900],
  '& p': { maxWidth: 280, margin: 0 },
})

/** "Detected entities": sort, filter by type and include/exclude each one. */
export function EntityPanel({ entities, onToggle, focusedId }: EntityPanelProps) {
  const { t } = useTranslation('deIdentify')
  const [order, setOrder] = useState<SortOrder>('document')
  const [filter, setFilter] = useState<string | null>(null)

  // Types in the order they first appear in the document.
  const categories = useMemo(
    () => [...new Set(sortEntities(entities, 'document').map((e) => categoryOf(e).label))],
    [entities],
  )
  const activeFilter = filter && categories.includes(filter) ? filter : null
  const visible = sortEntities(entities, order).filter(
    (entity) => !activeFilter || categoryOf(entity).label === activeFilter,
  )

  return (
    <MotionConfig reducedMotion="user">
      {/* layoutScroll: rows animate correctly while the panel is scrolled. */}
      <Root aria-labelledby="entities-heading" layoutScroll>
        <Header>
          <h2 id="entities-heading">{t('review.entities.title')}</h2>
          <Count aria-label={t('review.entities.count', { count: entities.length })}>
            {entities.length}
          </Count>
        </Header>

        {entities.length > 0 && (
          <Sort>
            <Dropdown
              size="compact"
              options={SORT_ORDERS.map((value) => ({ value, label: t(`review.sort.${value}`) }))}
              value={order}
              onChange={setOrder}
              triggerLabel={t('review.entities.sortBy')}
              aria-label={t('review.entities.sortLabel')}
            />
          </Sort>
        )}

        <Chips role="group" aria-label={t('review.entities.filterLabel')}>
          <FilterChip
            active={!activeFilter}
            disabled={entities.length === 0}
            onClick={() => setFilter(null)}
          >
            {t('review.entities.all', { count: entities.length })}
          </FilterChip>
          {categories.map((category) => (
            <FilterChip
              key={category}
              active={category === activeFilter}
              onClick={() => setFilter(category === activeFilter ? null : category)}
            >
              {categoryText(category)}
            </FilterChip>
          ))}
        </Chips>

        {entities.length === 0 ? (
          <Empty>
            <EmptyEntitiesPicture />
            <p>
              <Trans t={t} i18nKey="review.entities.emptyText" />
            </p>
          </Empty>
        ) : (
          <List>
            {/* popLayout: leaving rows stop taking space, so the rest move up at once. */}
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((entity) => (
                <EntityRow
                  key={entity.id}
                  entity={entity}
                  flash={entity.id === focusedId}
                  onToggle={() => onToggle(entity.id)}
                />
              ))}
            </AnimatePresence>
          </List>
        )}
      </Root>
    </MotionConfig>
  )
}
