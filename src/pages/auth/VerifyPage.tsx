import { useEffect, useRef } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { AnimatePresence } from 'framer-motion'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
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

function describeError(error: ApiError | null, t: TFunction<['auth', 'common']>) {
  if (!error) return t('verify.incomplete')
  if (error.isUnauthorized) return t('verify.expired')
  if (error.isRateLimited) return t('verify.rateLimited')
  if (error.isNetworkError) return t('common:errors.unreachable')
  if (error.status >= 500) return t('common:errors.server')
  return error.message
}

/** Landing page of the magic link: redeems ?token= and moves on to /app. */
const VerifyPage = () => {
  const { t } = useTranslation(['auth', 'common'])
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
            <h1>{t('verify.failedTitle')}</h1>
            <p>{describeError(verify.error, t)}</p>
          </Headline>
          {canRetry && token ? (
            <Button variant="secondary" sx={ctaSx} onClick={() => verify.mutate(token, {
              onSuccess: () => navigate('/app', { replace: true }),
            })}>
              {t('common:actions.tryAgain')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              sx={ctaSx}
              onClick={() => navigate('/auth/login', { replace: true })}
            >
              {t('verify.requestNew')}
            </Button>
          )}
        </Status>
      ) : (
        <Status key="pending" {...swapProps} role="status" aria-live="polite">
          <CircularProgress className="Auth-icon" size={40} sx={{ color: colors.accent[500] }} />
          <Headline>
            <h1>{t('verify.pendingTitle')}</h1>
            <p>{t('verify.pendingDescription')}</p>
          </Headline>
        </Status>
      )}
    </AnimatePresence>
  )
}

export default VerifyPage;
