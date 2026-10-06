import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import { Trans, useTranslation } from 'react-i18next'
import type { DetectedEntity } from '../../api/types'
import retryIcon from '../../assets/configuration/autorenew.svg'
import warningIcon from '../../assets/configuration/warning.svg'
import errorIcon from '../../assets/data-input/error.svg'
import copyIcon from '../../assets/review/copy.svg'
import reportIcon from '../../assets/review/report.svg'
import { colors, shadows, typography } from '../../theme'
import { Button, EntityHighlight, MaskIcon, RedactedToken } from '../ui'
import { segmentText } from './reviewModel'

export type DocumentTab = 'original' | 'deidentified'

export interface DocumentViewerProps {
  text: string
  entities: DetectedEntity[]
  /** The last render failed: the de-identified version can't be shown. */
  renderError: boolean
  onRetry: () => void
  onEntityClick: (id: string) => void
  /** Text the Copy button puts on the clipboard, per tab. */
  copyText: Record<DocumentTab, string>
  onReport: () => void
  /** Note under the document, e.g. "document appears clean". */
  warning?: string
}

// Labels are `deIdentify:review.document.<tab>`.
const TABS: DocumentTab[] = ['original', 'deidentified']

const Root = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
  border: `1px solid ${colors.neutral[200]}`,
  borderRadius: 8,
  backgroundColor: colors.neutral[50],
})

const Toolbar = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
  padding: '0 24px',
  backgroundColor: colors.white,
})

const TabList = styled('div')({ display: 'flex' })

const Tab = styled('button')({
  ...typography.labelM,
  position: 'relative',
  height: 48,
  padding: '0 16px',
  border: 0,
  background: 'none',
  color: colors.neutral[500],
  fontFamily: 'inherit',
  cursor: 'pointer',
  '&:hover': { color: colors.neutral[700] },
  '&:focus-visible': { outline: `2px solid ${colors.primary[500]}`, outlineOffset: -2 },
  '&[aria-selected="true"]': {
    color: colors.primary[500],
    '&::after': {
      content: '""',
      position: 'absolute',
      insetInline: 0,
      bottom: 0,
      height: 3,
      backgroundColor: colors.primary[500],
    },
  },
})

const Actions = styled('div')({ display: 'flex', gap: 8 })

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  flex: 1,
  minHeight: 0,
  padding: 24,
  '@media (max-width: 720px)': { padding: 12 },
})

const Sheet = styled('div')({
  ...typography.bodyM,
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: 40,
  borderRadius: 8,
  backgroundColor: colors.white,
  boxShadow: shadows.sm,
  color: colors.neutral[900],
  lineHeight: '28px',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  '& .DocumentViewer-entity': { cursor: 'pointer' },
  '@media (max-width: 720px)': { padding: 20 },
})

const Warning = styled('p')({
  ...typography.bodyS,
  display: 'flex',
  alignItems: 'flex-start',
  alignSelf: 'flex-start',
  gap: 8,
  margin: 0,
  padding: 4,
  borderRadius: 8,
  backgroundColor: 'rgba(254, 249, 195, 0.3)',
  color: colors.warning,
  '& > span': { flexShrink: 0, fontSize: 16 },
})

const Failure = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 40,
  height: '100%',
  minHeight: 320,
  whiteSpace: 'normal',
  textAlign: 'center',
  '& h3': { ...typography.h3, margin: '10px 0 0', color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
  '& hr': { alignSelf: 'stretch', margin: 0, border: 0, borderTop: `1px solid ${colors.neutral[200]}` },
})

const FailureIcon = styled(MaskIcon)({ fontSize: 48, margin: '0 auto', color: colors.error })

function variantOf(entity: DetectedEntity) {
  if (!entity.included) return 'excluded' as const
  return entity.lowConfidence ? ('review' as const) : ('selected' as const)
}

/** The analysed document: original with highlights, or the de-identified output. */
export function DocumentViewer({
  text,
  entities,
  renderError,
  onRetry,
  onEntityClick,
  copyText,
  onReport,
  warning,
}: DocumentViewerProps) {
  const { t } = useTranslation(['deIdentify', 'common'])
  const [tab, setTab] = useState<DocumentTab>('original')
  const [copied, setCopied] = useState(false)
  const tabRefs = useRef<Partial<Record<DocumentTab, HTMLButtonElement | null>>>({})
  const failed = renderError && tab === 'deidentified'

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText[tab])
      setCopied(true)
    } catch {
      // Clipboard blocked (permissions, insecure origin): nothing to report.
    }
  }

  const onTabKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const next = tab === 'original' ? 'deidentified' : 'original'
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  let body: ReactNode
  if (failed) {
    body = (
      <Failure role="alert">
        <div>
          <FailureIcon src={errorIcon} aria-hidden />
          <h3>{t('review.document.failedTitle')}</h3>
        </div>
        <p>
          <Trans t={t} i18nKey="review.document.failedText" />
        </p>
        <hr />
        <Button variant="secondary" size="medium" startIcon={<MaskIcon src={retryIcon} />} onClick={onRetry}>
          {t('common:actions.tryAgain')}
        </Button>
      </Failure>
    )
  } else {
    body = segmentText(text, entities).map((segment, index) => {
      if (typeof segment === 'string') return segment
      const { entity } = segment
      if (tab === 'deidentified') {
        return entity.included ? (
          <RedactedToken key={entity.id}>{entity.replacement ?? '…'}</RedactedToken>
        ) : (
          <span key={entity.id}>{entity.text}</span>
        )
      }
      return (
        <EntityHighlight
          key={`${entity.id}-${index}`}
          className="DocumentViewer-entity"
          variant={variantOf(entity)}
          role="button"
          tabIndex={0}
          onClick={() => onEntityClick(entity.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onEntityClick(entity.id)
            }
          }}
        >
          {entity.text}
        </EntityHighlight>
      )
    })
  }

  return (
    <Root aria-label={t('review.document.label')}>
      <Toolbar>
        <TabList role="tablist" aria-label={t('review.document.tabs')} onKeyDown={onTabKeyDown}>
          {TABS.map((value) => (
            <Tab
              key={value}
              ref={(node) => {
                tabRefs.current[value] = node
              }}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-controls="document-sheet"
              tabIndex={tab === value ? 0 : -1}
              onClick={() => setTab(value)}
            >
              {t(`review.document.${value}`)}
            </Tab>
          ))}
        </TabList>
        <Actions>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<MaskIcon src={copyIcon} />}
            disabled={failed}
            onClick={copy}
          >
            {copied ? t('review.document.copied') : t('review.document.copy')}
          </Button>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<MaskIcon src={reportIcon} />}
            disabled={failed}
            onClick={onReport}
          >
            {t('review.document.report')}
          </Button>
        </Actions>
      </Toolbar>
      <Content>
        <Sheet id="document-sheet" role="tabpanel" tabIndex={0}>
          {body}
        </Sheet>
        {warning && !failed && (
          <Warning role="status">
            <MaskIcon src={warningIcon} aria-hidden />
            {warning}
          </Warning>
        )}
      </Content>
    </Root>
  )
}
