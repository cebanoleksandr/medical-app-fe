import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { styled } from '@mui/material/styles'
import { AnimatePresence } from 'framer-motion'
import type { TFunction } from 'i18next'
import { useForm, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { ApiError } from '../../api/errors'
import mailIcon from '../../assets/auth/mail.svg'
import { Button, TextField } from '../../components/ui'
import { useHealthCheck, useRequestMagicLink } from '../../hooks'
import { colors, typography } from '../../theme'
import { Form, Headline, Status, View, backSx, ctaSx, swapProps } from './authStyles'
import { loginSchema, type LoginFormValues } from './loginSchema'

const RESEND_COOLDOWN_S = 30

const Divider = styled('hr')({
  width: '100%',
  margin: 0,
  border: 0,
  borderTop: `1px solid ${colors.neutral[200]}`,
})

const Resend = styled('p')({
  ...typography.bodyM,
  margin: 0,
  color: colors.neutral[500],
  '& button': {
    font: 'inherit',
    padding: 0,
    border: 0,
    background: 'none',
    color: colors.info,
    cursor: 'pointer',
    '&:hover:not(:disabled)': { textDecoration: 'underline' },
    '&:disabled': { color: colors.neutral[400], cursor: 'default' },
  },
  '& .Login-resendError': { display: 'block', marginTop: 8, color: colors.error },
})

function describeError(error: ApiError, t: TFunction<['auth', 'common']>) {
  if (error.isRateLimited) return t('common:errors.rateLimited')
  if (error.isNetworkError) return t('common:errors.unreachable')
  if (error.status >= 500) return t('common:errors.server')
  return error.message
}

/** Magic-link sign-in: enter an email, then "check your inbox". */
const LoginPage = () => {
  const { t } = useTranslation(['auth', 'common'])
  const navigate = useNavigate()
  const request = useRequestMagicLink()
  // Wakes the Render instance while the user types.
  useHealthCheck()

  const [sentTo, setSentTo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  })
  const email = useWatch({ control, name: 'email' })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const send = ({ email }: LoginFormValues) => {
    request.mutate(
      { email },
      {
        onSuccess: () => {
          setSentTo(email)
          setCooldown(RESEND_COOLDOWN_S)
        },
        onError: (error) => {
          if (!sentTo) setError('email', { type: 'server', message: describeError(error, t) })
        },
      },
    )
  }

  const backToForm = () => {
    request.reset()
    setSentTo(null)
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sentTo ? (
        <Status key="sent" {...swapProps}>
          <img className="Auth-icon" src={mailIcon} alt="" />
          <Headline>
            <h1>{t('sent.title')}</h1>
            <p>
              <Trans t={t} i18nKey="sent.description" values={{ email: sentTo }} />
            </p>
          </Headline>
          <Divider />
          <Resend role="status">
            {t('sent.notReceived')}{' '}
            <button
              type="button"
              disabled={cooldown > 0 || request.isPending}
              onClick={() => send({ email: sentTo })}
            >
              {cooldown > 0 ? t('sent.resendIn', { seconds: cooldown }) : t('sent.resend')}
            </button>
            {request.isError && (
              <span className="Login-resendError">{describeError(request.error, t)}</span>
            )}
          </Resend>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<ArrowBackIcon />}
            onClick={backToForm}
            sx={backSx}
          >
            {t('sent.backToSignIn')}
          </Button>
        </Status>
      ) : (
        <View key="form" {...swapProps}>
          <Headline>
            <h1>{t('login.title')}</h1>
            <p>{t('login.subtitle')}</p>
          </Headline>
          <Form noValidate onSubmit={handleSubmit(send)}>
            <TextField
              label={t('login.email')}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              autoComplete="email"
              autoFocus
              required
              {...register('email')}
              error={errors.email?.message}
            />
            {/* Enabled once something is typed; submitting shows what's wrong. */}
            <Button
              type="submit"
              variant="secondary"
              disabled={!email.trim() || request.isPending}
              sx={ctaSx}
            >
              {request.isPending ? t('login.sending') : t('login.send')}
            </Button>
          </Form>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={backSx}
          >
            {t('common:actions.back')}
          </Button>
        </View>
      )}
    </AnimatePresence>
  )
}

export default LoginPage;
