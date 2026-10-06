import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useMatches } from 'react-router-dom'
import { wakeDetectionService } from '../../api/wakeDetection'
import { useSession } from '../../hooks'
import type { RouteHandle } from '../../routes/handle'
import { colors } from '../../theme'
import { DraftProvider } from './de-identify/DraftProvider'
import { Header } from './app/Header'
import { Sidebar } from './app/Sidebar'

const Root = styled('div')({
  display: 'flex',
  height: '100vh',
  // Mobile browsers' 100vh includes the hidden URL bar.
  '@supports (height: 100dvh)': { height: '100dvh' },
  backgroundColor: colors.neutral[50],
})

const Main = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
})

// Pages scroll here, so the sidebar and header stay in place.
const Content = styled('main')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
})

const AppLayout = () => {
  const { t } = useTranslation('app')
  const { data: session } = useSession()
  const [navOpen, setNavOpen] = useState(false)
  const handle = useMatches()
    .map((match) => match.handle as RouteHandle | undefined)
    .findLast((handle) => handle?.title)

  // Wakes the detection service before the user gets to Analyze.
  useEffect(() => {
    wakeDetectionService()
    const onVisible = () => {
      if (document.visibilityState === 'visible') wakeDetectionService()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // The loader only runs on navigation; this catches logout and session
  // expiry while the user stays on a page.
  if (session === null) return <Navigate to="/auth/login" replace />

  return (
    <Root>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <Main>
        <Header
          title={handle ? t(handle.title) : ''}
          subtitle={handle?.subtitle && t(handle.subtitle)}
          email={session?.user.email}
          onMenu={() => setNavOpen(true)}
        />
        <Content>
          <DraftProvider>
            <Outlet />
          </DraftProvider>
        </Content>
      </Main>
    </Root>
  )
}

export default AppLayout;
