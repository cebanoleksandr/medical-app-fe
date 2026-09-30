import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useNavigate } from 'react-router-dom'
import { Button, type ButtonSize } from '../../ui'

/** Landing CTA; signed-in users get sent on to /app by the auth loader. */
export function GetStartedButton({ size = 'large' }: { size?: ButtonSize }) {
  const navigate = useNavigate()
  return (
    <Button
      size={size}
      endIcon={<ArrowForwardIcon />}
      onClick={() => navigate('/auth/login')}
      sx={{
        '& svg': { transition: 'transform 200ms' },
        '&:hover svg, &.Mui-focusVisible svg': { transform: 'translateX(4px)' },
        '@media (prefers-reduced-motion: reduce)': { '& svg': { transition: 'none' } },
      }}
    >
      Get started
    </Button>
  )
}
