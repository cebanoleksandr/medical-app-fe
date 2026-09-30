import { useEffect, useRef } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ApiError } from '../../api/errors'
import errorIcon from '../../assets/landing/error.svg'
import { Button } from '../../components/ui'
import { useVerifyMagicLink } from '../../hooks'
import { colors } from '../../theme'
import { Headline, Status, ctaSx, swapProps } from './authStyles'

const ErrorIcon = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: colors.errorLight,
})

function describeError(error: ApiError | null) {
  if (!error) return 'This sign-in link is incomplete. Request a new one to continue.'
  if (error.isUnauthorized) {
    return 'This link has expired or was already used. Links work once and expire after 15 minutes.'
  }
  if (error.isRateLimited) return 'Too many attempts. Please wait a few minutes and try again.'
  if (error.isNetworkError) return "Couldn't reach the server. Check your connection and try again."
  if (error.status >= 500) return 'Something went wrong on our side. Please try again.'
  return error.message
}

/** Landing page of the magic link: redeems ?token= and moves on to /app. */
const VerifyPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const verify = useVerifyMagicLink()
  // Tokens are single-use, and StrictMode runs effects twice in development:
  // a second request would fail and hide the successful first one.
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    verify.mutate(token, {
      // useVerifyMagicLink has already stored the session.
      onSuccess: () => navigate('/app', { replace: true }),
    })
  }, [token, verify, navigate])

  const failed = !token || verify.isError
  // Retry only makes sense when the request didn't reach a verdict.
  const canRetry = verify.isError && (verify.error.isNetworkError || verify.error.status >= 500)

  return (
    <AnimatePresence mode="wait" initial={false}>
      {failed ? (
        <Status key="error" {...swapProps} role="alert">
          <ErrorIcon className="Auth-icon">
            <img src={errorIcon} alt="" />
          </ErrorIcon>
          <Headline>
            <h1>Couldn&apos;t sign you in</h1>
            <p>{describeError(verify.error)}</p>
          </Headline>
          {canRetry && token ? (
            <Button variant="secondary" sx={ctaSx} onClick={() => verify.mutate(token, {
              onSuccess: () => navigate('/app', { replace: true }),
            })}>
              Try again
            </Button>
          ) : (
            <Button
              variant="secondary"
              sx={ctaSx}
              onClick={() => navigate('/auth/login', { replace: true })}
            >
              Request a new link
            </Button>
          )}
        </Status>
      ) : (
        <Status key="pending" {...swapProps} role="status" aria-live="polite">
          <CircularProgress className="Auth-icon" size={40} sx={{ color: colors.accent[500] }} />
          <Headline>
            <h1>Signing you in…</h1>
            <p>Verifying your sign-in link</p>
          </Headline>
        </Status>
      )}
    </AnimatePresence>
  )
}

export default VerifyPage;
