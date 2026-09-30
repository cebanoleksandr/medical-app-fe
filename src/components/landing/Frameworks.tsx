import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { Container, NARROW, TABLET, sectionPadding } from '../layouts/landing/styles'
import { colors, radius, typography } from '../../theme'
import { fadeUp, reveal, stagger } from './motion'
import { SectionHeader } from './SectionHeader'

const frameworks = [
  { badge: 'EU GDPR', name: 'General Data Protection Regulation', entities: 11 },
  { badge: 'HIPAA', name: 'Health Insurance Portability and Accountability Act', entities: 17 },
  { badge: 'UK DPI', name: 'UK Data Protection and Investigatory Powers', entities: 9 },
  { badge: 'Swiss FADP', name: 'Swiss Federal Act on Data Protection', entities: 8 },
]

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
  return (
    <Root>
      <Inner>
        <SectionHeader
          title="Built for Compliance"
          description="Choose from industry-standard regulatory frameworks or create your own custom compliance profile"
        />
        <Cards {...reveal} variants={stagger(0.1)}>
          {frameworks.map((framework) => (
            <Card key={framework.badge} variants={fadeUp} whileHover={{ y: -4 }}>
              <span className="Framework-badge">{framework.badge}</span>
              <h3>{framework.name}</h3>
              <p>{framework.entities} entity types</p>
            </Card>
          ))}
        </Cards>
      </Inner>
    </Root>
  )
}
