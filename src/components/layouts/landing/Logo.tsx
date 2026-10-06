import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../../../assets/logo-landing.svg'
import { colors, typography } from '../../../theme'
import { NARROW } from './styles'

const LogoLink = styled(Link)({
  ...typography.h3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 12,
  color: colors.white,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  '& img': { width: 32, height: 34, flexShrink: 0 },
  [NARROW]: typography.h4,
})

export function Logo() {
  const { t } = useTranslation()
  return (
    <LogoLink to="/">
      <img src={logo} alt="" />
      {t('brand.name')}
    </LogoLink>
  )
}
