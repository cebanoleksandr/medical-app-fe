import { styled } from '@mui/material/styles'
import { MotionConfig, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { colors } from '../../theme'
import { LandingFooter } from './landing/LandingFooter'
import { LandingHeader } from './landing/LandingHeader'

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: colors.primary[800],
  color: colors.white,
})

const Main = styled(motion.main)({
  flex: 1,
})

const LandingLayout = () => {
  const { pathname } = useLocation()

  return (
    // "user": transforms are skipped for people who ask for reduced motion.
    <MotionConfig reducedMotion="user">
      <Root>
        <LandingHeader />
        {/* Keyed by path so switching pages fades the new one in. */}
        <Main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </Main>
        <LandingFooter />
      </Root>
    </MotionConfig>
  )
}

export default LandingLayout;
