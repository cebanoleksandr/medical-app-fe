import { useId } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import warningIcon from '../../assets/popups/warning.svg'
import { useLogout } from '../../hooks'
import { colors, radius, shadows, typography } from '../../theme'
import { Button, IconButton } from '../ui'
import BasePopup from './BasePopup'

interface LogoutPopupProps {
  isVisible: boolean
  onClose: () => void
}

// Figma: 440px card, 48px padding (less on phones), 16px corners.
const panelStyle = {
  width: 'min(440px, 92vw)',
  minWidth: 0,
  padding: 'clamp(24px, 8vw, 48px)',
  borderRadius: radius.xl,
  boxShadow: shadows.md,
}

const Content = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  textAlign: 'center',
  '& .LogoutPopup-icon': { alignSelf: 'center' },
  '& h2': { ...typography.h3, margin: '0 0 8px', color: colors.neutral[900] },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
  '& hr': { width: '100%', margin: 0, border: 0, borderTop: `1px solid ${colors.neutral[200]}` },
})

// Sits 16px from the panel's corner, like the Figma close icon.
const Close = styled('div')({
  position: 'absolute',
  top: 4,
  right: 4,
})

const Actions = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  alignItems: 'center',
  justifyItems: 'center',
})

/** Asks before signing out; AppLayout redirects to /auth/login once it's done. */
export function LogoutPopup({ isVisible, onClose }: LogoutPopupProps) {
  const logout = useLogout()
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
      <Close>
        <IconButton variant="ghost" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Close>
      <Content>
        <img className="LogoutPopup-icon" src={warningIcon} alt="" />
        <div>
          <h2 id={titleId}>Sign out?</h2>
          <p id={descriptionId}>
            You will be signed out of your account.
            <br />
            You can sign back in at any time.
          </p>
        </div>
        <hr />
        <Actions>
          <Button variant="ghost" size="medium" startIcon={<ArrowBackIcon />} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="medium"
            endIcon={<ArrowForwardIcon />}
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            {logout.isPending ? 'Signing out…' : 'Continue'}
          </Button>
        </Actions>
      </Content>
    </BasePopup>
  )
}
