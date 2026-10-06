import { useId, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import { styled } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import chevronIcon from '../../assets/landing/chevron-down.svg'
import { Container, NARROW, TABLET, sectionPadding } from '../layouts/landing/styles'
import { colors, typography } from '../../theme'
import { fadeUp, reveal, stagger } from './motion'
import { SectionHeader } from './SectionHeader'


const Root = styled('section')({
  ...sectionPadding,
  backgroundColor: colors.primary[800],
})

const Inner = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 48,
  [TABLET]: { gap: 32 },
})

const List = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  width: '100%',
  maxWidth: 800,
})

const Item = styled(motion.div)({
  padding: '12px 0',
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.05))',
})

const Question = styled('button')({
  ...typography.h4,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  width: '100%',
  padding: '20px 24px',
  [NARROW]: { ...typography.labelL, fontWeight: 600, padding: '16px 8px' },
  border: 0,
  borderBottom: `1px solid ${colors.accent[200]}`,
  background: 'none',
  color: colors.white,
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'color 200ms, border-color 200ms',
  '&:hover': { color: colors.accent[200], borderBottomColor: colors.accent[400] },
  '&:focus-visible': {
    outline: `2px solid ${colors.accent[400]}`,
    outlineOffset: 2,
  },
  '& img': {
    flexShrink: 0,
    transition: 'transform 200ms',
  },
  '&[aria-expanded="true"] img': { transform: 'scaleY(-1)' },
})

const Answer = styled('p')({
  ...typography.bodyL,
  margin: 0,
  padding: '24px 24px 0',
  [NARROW]: { padding: '16px 8px 0' },
  color: colors.neutral[400],
})

function FaqItem({ question, answer, defaultOpen }: {
  question: string
  answer: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const answerId = useId()
  return (
    <Item variants={fadeUp}>
      <Question aria-expanded={open} aria-controls={answerId} onClick={() => setOpen(!open)}>
        {question}
        <img src={chevronIcon} alt="" />
      </Question>
      <Collapse in={open}>
        <Answer id={answerId}>{answer}</Answer>
      </Collapse>
    </Item>
  )
}

export function Faq() {
  const { t } = useTranslation('landing')
  return (
    <Root>
      <Inner>
        <SectionHeader
          title={t('faq.title')}
          description={t('faq.description')}
        />
        <List {...reveal} variants={stagger(0.08)}>
          {t('faq.items', { returnObjects: true }).map((item, index) => (
            <FaqItem key={item.question} {...item} defaultOpen={index === 0} />
          ))}
        </List>
      </Inner>
    </Root>
  )
}
