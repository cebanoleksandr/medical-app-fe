import { styled } from '@mui/material/styles'
import { Outlet } from 'react-router-dom'
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

const Main = styled('main')({
  flex: 1,
})

const LandingLayout = () => {
  return (
    <Root>
      <LandingHeader />
      <Main>
        <Outlet />
      </Main>
      <LandingFooter />
    </Root>
  )
}

export default LandingLayout;
