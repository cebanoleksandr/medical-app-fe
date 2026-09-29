import type { ReactNode } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ScatterPlotIcon from '@mui/icons-material/ScatterPlotOutlined'
import SettingsIcon from '@mui/icons-material/SettingsOutlined'
import { styled } from '@mui/material/styles'
import { NavLink, useMatch } from 'react-router-dom'
import dashboardIcon from '../../../assets/icons/dashboard.svg'
import databaseIcon from '../../../assets/icons/database.svg'
import deIdentifyIcon from '../../../assets/icons/de-identify.svg'
import logo from '../../../assets/logo.svg'
import { useLogout } from '../../../hooks'
import { colors, radius, typography } from '../../../theme'
import { Button, MaskIcon } from '../../ui'

export const SIDEBAR_WIDTH = 260

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  children?: NavItem[]
}

const nav: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: <MaskIcon src={dashboardIcon} /> },
  { to: '/app/de-identify', label: 'De-Identify', icon: <MaskIcon src={deIdentifyIcon} /> },
  {
    to: '/app/synthetic',
    label: 'Synthetic Data',
    icon: <MaskIcon src={databaseIcon} />,
    children: [
      { to: '/app/synthetic/settings', label: 'Generation Settings', icon: <SettingsIcon /> },
      { to: '/app/synthetic/result', label: 'Generated Data', icon: <ScatterPlotIcon /> },
    ],
  },
]

const Root = styled('aside')({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  width: SIDEBAR_WIDTH,
  height: '100%',
  paddingBottom: 24,
  overflowY: 'auto',
  backgroundColor: colors.primary[800],
})

const Brand = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '40px 20px 24px',
  borderBottom: `1px solid ${colors.neutral[400]}`,
  ...typography.labelS,
  '& img': { width: 32, height: 34, flexShrink: 0 },
})

const Items = styled('nav')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '32px 12px 8px',
  // Pushes Sign out to the bottom.
  flex: 1,
})

const Link = styled(NavLink, {
  shouldForwardProp: (prop) => prop !== 'nested',
})<{ nested?: boolean }>(({ nested }) => ({
  ...(nested ? typography.labelS : typography.labelM),
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: nested ? '8px 16px 8px 32px' : '12px 16px',
  borderRadius: radius.md,
  color: colors.neutral[400],
  textDecoration: 'none',
  transition: 'background-color 150ms, color 150ms',
  '& .Sidebar-icon': {
    display: 'flex',
    flexShrink: 0,
    fontSize: nested ? 16 : 24,
    '& > svg': { fontSize: 'inherit' },
  },
  '&:hover': {
    backgroundColor: colors.primary[700],
    color: colors.neutral[300],
  },
  '&:focus-visible': {
    outline: `2px solid ${colors.accent[400]}`,
    outlineOffset: -2,
  },
  '&.active': nested
    ? { backgroundColor: 'transparent', color: colors.accent[400] }
    : { backgroundColor: colors.accent[400], color: colors.primary[800] },
}))

function NavEntry({ item, nested }: { item: NavItem; nested?: boolean }) {
  // Sub-items show only while their section is open.
  const inSection = useMatch({ path: item.to, end: false })
  return (
    <>
      <Link to={item.to} end={item.to === '/app'} nested={nested}>
        <span className="Sidebar-icon" aria-hidden>
          {item.icon}
        </span>
        {item.label}
      </Link>
      {inSection && item.children?.map((child) => (
        <NavEntry key={child.to} item={child} nested />
      ))}
    </>
  )
}

export function Sidebar() {
  const logout = useLogout()

  return (
    <Root>
      <Brand>
        <img src={logo} alt="" />
        <div>
          <div style={{ color: colors.white }}>De-ID Studio</div>
          <div style={{ color: colors.neutral[400] }}>De-ID &amp; Synthesis</div>
        </div>
      </Brand>

      <Items aria-label="Main">
        {nav.map((item) => (
          <NavEntry key={item.to} item={item} />
        ))}
      </Items>

      {/* AppLayout redirects to login once the session is cleared. */}
      <Button
        variant="ghost"
        endIcon={<ArrowForwardIcon />}
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
        sx={{ alignSelf: 'flex-start' }}
      >
        Sign out
      </Button>
    </Root>
  )
}
