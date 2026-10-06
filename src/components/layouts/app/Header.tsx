import MenuIcon from '@mui/icons-material/Menu'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import accountIcon from '../../../assets/icons/account-circle.svg'
import { colors, media, typography } from '../../../theme'

export interface HeaderProps {
  title: string
  subtitle?: string
  email?: string
  /** Opens the sidebar drawer; the button shows below the nav breakpoint. */
  onMenu: () => void
}

const Root = styled('header')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  flexShrink: 0,
  height: 98,
  padding: '40px 48px 24px',
  borderBottom: `1px solid ${colors.neutral[200]}`,
  backgroundColor: colors.white,
  [media.nav]: { height: 'auto', minHeight: 72, padding: '16px 24px', gap: 12 },
  [media.mobile]: { minHeight: 64, padding: '12px 16px' },
})

const Lead = styled('div')({ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 })

const MenuButton = styled(IconButton)({
  display: 'none',
  marginLeft: -8,
  color: colors.neutral[900],
  [media.nav]: { display: 'inline-flex' },
})

const Title = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  '& h1': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: 0, color: colors.neutral[500] },
  [media.mobile]: {
    '& h1': { ...typography.h4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    '& p': { display: 'none' },
  },
})

const Account = styled('div')({
  ...typography.labelM,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: 10,
  color: colors.neutral[700],
  whiteSpace: 'nowrap',
  minWidth: 0,
  '& .Header-email': { overflow: 'hidden', textOverflow: 'ellipsis' },
  [media.mobile]: { padding: 0, '& .Header-email': { display: 'none' } },
})

const Avatar = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  flexShrink: 0,
  backgroundColor: colors.primary[500],
  '&::after': {
    content: '""',
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    mask: `url("${accountIcon}") center / contain no-repeat`,
  },
})

export function Header({ title, subtitle, email, onMenu }: HeaderProps) {
  const { t } = useTranslation('app')
  return (
    <Root>
      <Lead>
        <MenuButton aria-label={t('nav.open')} onClick={onMenu}>
          <MenuIcon />
        </MenuButton>
        <Title>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </Title>
      </Lead>
      {email && (
        <Account title={email}>
          <Avatar aria-hidden />
          <span className="Header-email">{email}</span>
        </Account>
      )}
    </Root>
  )
}
