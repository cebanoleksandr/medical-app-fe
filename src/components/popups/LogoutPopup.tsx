import { useLogout } from '../../hooks'
import { ConfirmPopup } from './ConfirmPopup'

interface LogoutPopupProps {
  isVisible: boolean
  onClose: () => void
}

/** Asks before signing out; AppLayout redirects to /auth/login once it's done. */
export function LogoutPopup({ isVisible, onClose }: LogoutPopupProps) {
  const logout = useLogout()

  return (
    <ConfirmPopup
      isVisible={isVisible}
      onClose={onClose}
      onConfirm={() => logout.mutate()}
      pending={logout.isPending}
      title="Sign out?"
      description={
        <>
          You will be signed out of your account.
          <br />
          You can sign back in at any time.
        </>
      }
      confirmLabel={logout.isPending ? 'Signing out…' : 'Continue'}
    />
  )
}
