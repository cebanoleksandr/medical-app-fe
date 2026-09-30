import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import adminPanelIcon from '../../assets/landing/admin-panel-settings.svg'
import databaseIcon from '../../assets/landing/database.svg'
import descriptionIcon from '../../assets/landing/description.svg'
import manageSearchIcon from '../../assets/landing/manage-search.svg'
import { Container, NARROW, TABLET, sectionPadding, sectionTitle } from '../layouts/landing/styles'
import { colors, typography } from '../../theme'
import { drawLine, fadeUp, reveal, stagger } from './motion'
import { SectionHeader } from './SectionHeader'

type CardVariant = 'glow' | 'solid'

interface Feature {
  title: string
  description: string
  icon: string
  variant: CardVariant
  /** Share of the row, from the Figma widths. */
  grow: number
}

// Two rows; the wide and narrow cards swap places on the second one.
const rows: Feature[][] = [
  [
    {
      title: 'Deep Signal Detection',
      description: 'Align with global regulations through a single adaptive compliance layer.',
      icon: manageSearchIcon,
      variant: 'glow',
      grow: 486,
    },
    {
      title: 'Synthetic Intelligence Layer',
      description:
        'Generate high-fidelity synthetic datasets that preserve patterns — without exposing real identities.',
      icon: databaseIcon,
      variant: 'solid',
      grow: 689,
    },
  ],
  [
    {
      title: 'Unified Compliance Engine',
      description: 'Align with global regulations through a single adaptive compliance layer.',
      icon: descriptionIcon,
      variant: 'solid',
      grow: 690,
    },
    {
      title: 'Adaptive Privacy Shield',
      description: 'Continuously anonymize and protect data while maintaining analytical value.',
      icon: adminPanelIcon,
      variant: 'glow',
      grow: 486,
    },
  ],
]

const Root = styled('section')({
  paddingTop: sectionPadding.paddingBlock,
  [TABLET]: { paddingTop: sectionPadding[TABLET].paddingBlock },
  [NARROW]: { paddingTop: sectionPadding[NARROW].paddingBlock },
  backgroundColor: colors.primary[800],
})

const Inner = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 72,
  [TABLET]: { gap: 48 },
  [NARROW]: { gap: 40 },
})

const Grid = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
})

const Row = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'features',
})<{ features: Feature[] }>(({ features }) => ({
  display: 'grid',
  gridTemplateColumns: features.map((feature) => `${feature.grow}fr`).join(' '),
  gap: 24,
  [NARROW]: { gridTemplateColumns: '1fr', gap: 16 },
}))

const Card = styled(motion.article, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: CardVariant }>(({ variant }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 36,
  minWidth: 0,
  padding: 16,
  borderRadius: 16,
  // The lift itself is `whileHover`: motion's inline transform would override CSS.
  transition: 'box-shadow 300ms ease-out, border-color 300ms',
  '@media (hover: hover)': {
    '&:hover': {
      boxShadow: '0 16px 32px rgba(0, 191, 165, 0.12)',
    },
    '&:hover .Feature-icon': { transform: 'scale(1.12) rotate(-6deg)' },
  },
  ...(variant === 'glow'
    ? {
        background:
          'linear-gradient(147.96deg, rgba(0, 0, 0, 0) 23.34%, rgba(0, 191, 165, 0.2) 96.36%), rgba(21, 45, 84, 0.7)',
      }
    : {
        border: '1.25px solid rgba(102, 217, 200, 0.2)',
        '&:hover': { borderColor: 'rgba(102, 217, 200, 0.45)' },
        backgroundColor: colors.primary[700],
      }),
  '& .Feature-top': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  '& p': {
    ...typography.bodyL,
    maxWidth: variant === 'glow' ? 350 : 450,
    margin: 0,
    color: colors.neutral[400],
  },
  '& .Feature-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 50,
    height: 50,
    transition: 'transform 300ms ease-out',
  },
  '& h3': {
    ...typography.h3,
    lineHeight: '32px',
    margin: 0,
    color: colors.white,
    textTransform: 'capitalize',
  },
}))

const Divider = styled(motion.hr)({
  width: '100%',
  height: 1,
  margin: 0,
  border: 0,
  backgroundColor: 'rgba(51, 201, 180, 0.3)',
})

const Outro = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  textAlign: 'center',
  '& h2': { ...sectionTitle, maxWidth: 640, margin: 0, color: colors.white },
  '& p': {
    fontSize: 24,
    lineHeight: '32px',
    fontWeight: 500,
    maxWidth: 791,
    margin: 0,
    color: colors.neutral[500],
    [NARROW]: typography.h4,
  },
})

export function Features() {
  return (
    <Root>
      <Inner>
        <SectionHeader
          title="Protect Patient Privacy Without Compromising Data Value"
          description="Comprehensive tools for healthcare organizations to securely manage clinical data"
        />
        <Grid>
          {rows.map((row, index) => (
            <Row key={index} features={row} {...reveal} variants={stagger(0.12)}>
              {row.map((feature) => (
                <Card key={feature.title} variant={feature.variant} variants={fadeUp} whileHover={{ y: -4 }}>
                  <div className="Feature-top">
                    <p>{feature.description}</p>
                    <span className="Feature-icon">
                      <img src={feature.icon} alt="" />
                    </span>
                  </div>
                  <h3>{feature.title}</h3>
                </Card>
              ))}
            </Row>
          ))}
        </Grid>
        <Divider {...reveal} variants={drawLine} />
        <Outro {...reveal} variants={stagger(0.12)}>
          <motion.h2 variants={fadeUp}>From Data Intelligence to Compliance</motion.h2>
          <motion.p variants={fadeUp}>
            Seamlessly transition from data intelligence to regulatory compliance with
            built-in frameworks tailored to your industry.
          </motion.p>
        </Outro>
      </Inner>
    </Root>
  )
}
