import type { ReactNode } from 'react'
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined'
import AccountBoxIcon from '@mui/icons-material/AccountBoxOutlined'
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined'
import AddBusinessIcon from '@mui/icons-material/AddBusinessOutlined'
import AddLinkIcon from '@mui/icons-material/AddLinkOutlined'
import AdfScannerIcon from '@mui/icons-material/AdfScannerOutlined'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import BadgeIcon from '@mui/icons-material/BadgeOutlined'
import CakeIcon from '@mui/icons-material/CakeOutlined'
import CalendarTodayIcon from '@mui/icons-material/CalendarTodayOutlined'
import CallIcon from '@mui/icons-material/CallOutlined'
import CardMembershipIcon from '@mui/icons-material/CardMembershipOutlined'
import DevicesIcon from '@mui/icons-material/DevicesOutlined'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCarOutlined'
import FingerprintIcon from '@mui/icons-material/FingerprintOutlined'
import GppMaybeIcon from '@mui/icons-material/GppMaybeOutlined'
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined'
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined'
import MailIcon from '@mui/icons-material/MailOutlined'
import RouterIcon from '@mui/icons-material/RouterOutlined'
import { styled } from '@mui/material/styles'
import businessChipIcon from '../../assets/icons/business-chip.svg'
import passportIcon from '../../assets/icons/passport.svg'
import { colors, typography } from '../../theme'

/**
 * Tints a single-color SVG from Figma with the current text color. Those
 * files draw the 16px glyph in the top-left of a 24px viewBox, so the mask is
 * 1.5em and anchored top-left.
 */
const MaskIcon = styled('span')<{ src: string }>(({ src }) => ({
  display: 'block',
  width: '1em',
  height: '1em',
  backgroundColor: 'currentColor',
  mask: `url("${src}") 0 0 / 1.5em 1.5em no-repeat`,
}))

// Keys are the entity type names shown in the design.
const icons: Record<string, ReactNode> = {
  IP: <RouterIcon />,
  FAX: <AdfScannerIcon />,
  URL: <AddLinkIcon />,
  SSN: <GppMaybeIcon />,
  AGE: <CakeIcon />,
  ORG: <MaskIcon src={businessChipIcon} />,
  MRN: <BadgeIcon />,
  DATE: <CalendarTodayIcon />,
  EMAIL: <MailIcon />,
  OTHER: <HelpIcon />,
  PHONE: <CallIcon />,
  PHOTO: <AccountBoxIcon />,
  DEVICE: <DevicesIcon />,
  PERSON: <AccountCircleIcon />,
  LICENSE: <AdminPanelSettingsIcon />,
  VEHICLE: <DirectionsCarIcon />,
  ACCOUNT: <AccountBalanceIcon />,
  LOCATION: <LocationOnIcon />,
  BIOMETRIC: <FingerprintIcon />,
  BENEFICIARY: <CardMembershipIcon />,
  ORGANIZATION: <AddBusinessIcon />,
  PASSPORT: <MaskIcon src={passportIcon} />,
  NATIONAL_ID: <BadgeIcon />,
}

export interface EntityTypeLabelProps {
  /** e.g. PERSON, DATE, EMAIL; unknown types get the OTHER icon. */
  type: string
  /** Defaults to `type`. */
  label?: string
  className?: string
}

const Root = styled('span')({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
  '& .EntityTypeLabel-icon': {
    display: 'flex',
    fontSize: 16,
    color: colors.neutral[400],
    '& > svg': { fontSize: 'inherit' },
  },
  '& .EntityTypeLabel-text': {
    ...typography.labelS,
    color: colors.neutral[500],
    whiteSpace: 'nowrap',
  },
})

/** Entity type with its icon, as in the entity list and legend. */
export function EntityTypeLabel({ type, label, className }: EntityTypeLabelProps) {
  const key = type.toUpperCase()
  return (
    <Root className={className}>
      <span className="EntityTypeLabel-icon" aria-hidden>
        {icons[key] ?? icons.OTHER}
      </span>
      <span className="EntityTypeLabel-text">{label ?? key}</span>
    </Root>
  )
}
