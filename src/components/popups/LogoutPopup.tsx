import { Trans, useTranslation } from 'react-i18next'
import { useLogout } from '../../hooks'
import { ConfirmPopup } from './ConfirmPopup'

interface LogoutPopupProps {
  isVisible: boolean
  onClose: () => void
}

/** Asks before signing out; AppLayout redirects to /auth/login once it's done. */
export function LogoutPopup({ isVisible, onClose }: LogoutPopupProps) {
  const { t } = useTranslation('app')
  const logout = useLogout()

  return (
    <ConfirmPopup
      isVisible={isVisible}
      onClose={onClose}
      onConfirm={() => logout.mutate()}
      pending={logout.isPending}
      title={t('logout.title')}
      description={<Trans t={t} i18nKey="logout.description" />}
      confirmLabel={logout.isPending ? t('logout.pending') : t('logout.confirm')}
    />
  )
}
