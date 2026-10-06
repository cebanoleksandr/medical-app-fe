import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container, NARROW, TABLET, sectionPadding } from '../layouts/landing/styles'
import { colors, radius, typography } from '../../theme'
import { fadeUp, reveal, stagger } from './motion'
import { SectionHeader } from './SectionHeader'

// Keys under `frameworks` in the `landing` namespace.
const frameworks = [
  { id: 'gdpr', entities: 11 },
  { id: 'hipaa', entities: 17 },
  { id: 'uk', entities: 9 },
  { id: 'fadp', entities: 8 },
] as const

const Root = styled('section')({
  ...sectionPadding,
  backgroundColor: colors.primary[800],
})

const Inner = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  gap: 48,
  [TABLET]: { gap: 32 },
})

const Cards = styled(motion.ul)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 24,
  margin: 0,
  padding: '24px 0',
  listStyle: 'none',
  [TABLET]: { paddingBlock: 0 },
})

const Card = styled(motion.li)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: 16,
  minHeight: 200,
  [NARROW]: { minHeight: 0, gap: 12 },
  padding: '20px 24px',
  border: '1px solid rgba(249, 250, 251, 0.1)',
  borderRadius: 16,
  backgroundColor: colors.primary[700],
  // The lift itself is `whileHover`: motion's inline transform would override CSS.
  transition: 'box-shadow 300ms ease-out, border-color 300ms',
  '@media (hover: hover)': {
    '&:hover': {
      borderColor: 'rgba(102, 217, 200, 0.45)',
      boxShadow: '0 16px 32px rgba(0, 191, 165, 0.12)',
    },
    '&:hover .Framework-badge': { backgroundColor: colors.accent[400] },
  },
  '& .Framework-badge': {
    transition: 'background-color 300ms',
    ...typography.labelS,
    padding: '4px 8px',
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 191, 165, 0.6)',
    color: colors.primary[700],
    whiteSpace: 'nowrap',
  },
  '& h3': {
    ...typography.labelL,
    fontWeight: 600,
    width: '100%',
    margin: 0,
    color: colors.white,
  },
  '& p': {
    ...typography.labelM,
    width: '100%',
    margin: 0,
    color: colors.neutral[400],
  },
})

export function Frameworks() {
  const { t } = useTranslation('landing')
  return (
    <Root>
      <Inner>
        <SectionHeader
          title={t('frameworks.title')}
          description={t('frameworks.description')}
        />
        <Cards {...reveal} variants={stagger(0.1)}>
          {frameworks.map((framework) => (
            <Card key={framework.id} variants={fadeUp} whileHover={{ y: -4 }}>
              <span className="Framework-badge">{t(`frameworks.${framework.id}.badge`)}</span>
              <h3>{t(`frameworks.${framework.id}.name`)}</h3>
              <p>{t('frameworks.entityTypes', { count: framework.entities })}</p>
            </Card>
          ))}
        </Cards>
      </Inner>
    </Root>
  )
}
