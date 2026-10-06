import { useId } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import { Trans, useTranslation } from 'react-i18next'
import autorenewIcon from '../../assets/configuration/autorenew.svg'
import warningIcon from '../../assets/popups/warning.svg'
import downloadIcon from '../../assets/review/report.svg'
import { colors, radius, shadows, typography } from '../../theme'
import BasePopup from '../popups/BasePopup'
import { Button, IconButton, MaskIcon } from '../ui'
import { Divider } from './styles'

// Figma: 480px card, 24px padding, 16px corners.
const panelStyle = {
  width: 'min(480px, 92vw)',
  minWidth: 0,
  padding: 24,
  borderRadius: radius.xl,
  boxShadow: shadows.lg,
}

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  textAlign: 'center',
  '& h2': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

const Header = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
  '& > button': { alignSelf: 'flex-end' },
})

const Actions = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 12,
})

interface RegeneratePopupProps {
  isVisible: boolean
  onClose: () => void
  onRegenerate: () => void
  onDownload: () => void
  pending?: boolean
}

/** Regenerating replaces the session-only dataset: offer to download first. */
export function RegeneratePopup({
  isVisible,
  onClose,
  onRegenerate,
  onDownload,
  pending = false,
}: RegeneratePopupProps) {
  const { t } = useTranslation(['synthetic', 'common'])
  const titleId = useId()
  const descriptionId = useId()

  return (
    <BasePopup
      isVisible={isVisible}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      style={panelStyle}
    >
      <Content>
        <Header>
          <IconButton variant="ghost" aria-label={t('common:actions.close')} onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <img src={warningIcon} alt="" width={48} height={48} />
          <h2 id={titleId}>{t('result.regenerate.title')}</h2>
        </Header>
        <p id={descriptionId}>
          <Trans t={t} i18nKey="result.regenerate.text" />
        </p>
        <Divider />
        <Actions>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<MaskIcon src={autorenewIcon} />}
            disabled={pending}
            onClick={onRegenerate}
          >
            {pending ? t('common:actions.regenerating') : t('common:actions.regenerate')}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            startIcon={<MaskIcon src={downloadIcon} />}
            onClick={onDownload}
          >
            {t('common:actions.download')}
          </Button>
        </Actions>
      </Content>
    </BasePopup>
  )
}
