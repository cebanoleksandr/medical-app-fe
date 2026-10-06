import { useId, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { Dataset, ValidationReport } from '../../api/types'
import checkCircleIcon from '../../assets/generated/check-circle-small.svg'
import downloadIcon from '../../assets/review/report.svg'
import { colors, radius, shadows, typography } from '../../theme'
import BasePopup from '../popups/BasePopup'
import { Button, Checkbox, MaskIcon } from '../ui'
import { formatRecords } from '../synthetic/generationSettings'
import { DialogHeader, Glyph, Notice } from './parts'
import { CheckboxOption, Divider, MetaList, MetaRow } from './styles'
import { frameworkName, type ResultStatus } from './resultModel'

// Figma: 544px card, 32px padding, 16px corners.
const panelStyle = {
  width: 'min(544px, 92vw)',
  minWidth: 0,
  padding: 'clamp(20px, 6vw, 32px)',
  borderRadius: radius.xl,
  boxShadow: shadows.lg,
}

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
})

const Header = styled(DialogHeader)({ '& h2': typography.h3 })

const Meta = styled(MetaList)({
  padding: 16,
  borderRadius: 8,
  backgroundColor: colors.neutral[50],
})

const Options = styled('div')({ display: 'flex', flexDirection: 'column', gap: 8 })

const Footer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 16,
})

// Validation texts are `synthetic:result.download.<status>`.

export interface DownloadOptions {
  validationReport: boolean
  schemaSummary: boolean
}

interface DownloadPopupProps {
  isVisible: boolean
  onClose: () => void
  dataset: Dataset
  report: ValidationReport | undefined
  status: ResultStatus | undefined
  onDownload: (options: DownloadOptions) => void
  pending?: boolean
  error?: string
}

/** What will be downloaded, plus optional report files. */
export function DownloadPopup({
  isVisible,
  onClose,
  dataset,
  report,
  status,
  onDownload,
  pending = false,
  error,
}: DownloadPopupProps) {
  const { t } = useTranslation(['synthetic', 'common'])
  const titleId = useId()
  const [options, setOptions] = useState<DownloadOptions>({
    validationReport: true,
    schemaSummary: false,
  })
  const toggle = (key: keyof DownloadOptions) =>
    setOptions((current) => ({ ...current, [key]: !current[key] }))

  return (
    <BasePopup isVisible={isVisible} onClose={onClose} labelledBy={titleId} style={panelStyle}>
      <Content>
        <Header titleId={titleId} title={t('result.download.title')} onClose={onClose} />
        <Meta>
          <MetaRow>
            <dt>{t('result.download.format')}</dt>
            <dd>{dataset.format}</dd>
          </MetaRow>
          <MetaRow>
            <dt>{t('result.download.records')}</dt>
            <dd>{formatRecords(dataset.records)}</dd>
          </MetaRow>
          <MetaRow>
            <dt>{t('result.download.fields')}</dt>
            <dd>{formatRecords(dataset.fields)}</dd>
          </MetaRow>
          <MetaRow>
            <dt>{t('result.download.framework')}</dt>
            <dd>{frameworkName(dataset.framework, 'long')}</dd>
          </MetaRow>
          <MetaRow>
            <dt>{t('result.download.validation')}</dt>
            <dd>
              {status === 'passed' && (
                <Glyph src={checkCircleIcon} size={14} color={colors.success} />
              )}
              {status ? t(`result.download.${status}`) : t('result.download.inProgress')}
            </dd>
          </MetaRow>
        </Meta>
        <Notice tone="info">{t('result.download.notice')}</Notice>
        <Options>
          <CheckboxOption>
            <Checkbox
              checked={options.validationReport}
              disabled={!report}
              onChange={() => toggle('validationReport')}
            />
            {t('result.download.report')}
          </CheckboxOption>
          <CheckboxOption>
            <Checkbox checked={options.schemaSummary} onChange={() => toggle('schemaSummary')} />
            {t('result.download.schema')}
          </CheckboxOption>
        </Options>
        {error && <Notice tone="error">{error}</Notice>}
        <Divider />
        <Footer>
          <Button variant="ghostSecondary" size="medium" onClick={onClose}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            startIcon={<MaskIcon src={downloadIcon} />}
            disabled={pending || status === 'failed'}
            onClick={() => onDownload({ ...options, validationReport: options.validationReport && !!report })}
          >
            {pending ? t('common:actions.downloading') : t('common:actions.download')}
          </Button>
        </Footer>
      </Content>
    </BasePopup>
  )
}
