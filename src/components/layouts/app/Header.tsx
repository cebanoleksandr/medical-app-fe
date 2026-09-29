import { styled } from '@mui/material/styles'
import accountIcon from '../../../assets/icons/account-circle.svg'
import { colors, typography } from '../../../theme'

export interface HeaderProps {
  title: string
  subtitle?: string
  email?: string
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
})

const Title = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 0,
  '& h1': { ...typography.h3, margin: 0, color: colors.neutral[900] },
  '& p': { ...typography.bodyS, margin: 0, color: colors.neutral[500] },
})

const Account = styled('div')({
  ...typography.labelM,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: 10,
  color: colors.neutral[700],
  whiteSpace: 'nowrap',
})

const Avatar = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: colors.primary[500],
  '&::after': {
    content: '""',
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    mask: `url("${accountIcon}") center / contain no-repeat`,
  },
})

export function Header({ title, subtitle, email }: HeaderProps) {
  return (
    <Root>
      <Title>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </Title>
      {email && (
        <Account>
          <Avatar aria-hidden />
          {email}
        </Account>
      )}
    </Root>
  )
}
