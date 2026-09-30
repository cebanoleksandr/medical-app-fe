import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { styled } from '@mui/material/styles'
import { AnimatePresence } from 'framer-motion'
import { useForm, useWatch } from 'react-hook-form'
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

function describeError(error: ApiError) {
  if (error.isRateLimited) return 'Too many attempts. Please try again in a few minutes.'
  if (error.isNetworkError) return "Couldn't reach the server. Check your connection and try again."
  if (error.status >= 500) return 'Something went wrong on our side. Please try again.'
  return error.message
}

/** Magic-link sign-in: enter an email, then "check your inbox". */
const LoginPage = () => {
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
          if (!sentTo) setError('email', { type: 'server', message: describeError(error) })
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
            <h1>Check your inbox</h1>
            <p>
              We sent a sign-in link to <strong>{sentTo}</strong>
            </p>
          </Headline>
          <Divider />
          <Resend role="status">
            Didn&apos;t receive it? Check spam or{' '}
            <button
              type="button"
              disabled={cooldown > 0 || request.isPending}
              onClick={() => send({ email: sentTo })}
            >
              {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
            </button>
            {request.isError && (
              <span className="Login-resendError">{describeError(request.error)}</span>
            )}
          </Resend>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<ArrowBackIcon />}
            onClick={backToForm}
            sx={backSx}
          >
            Back to Sign In
          </Button>
        </Status>
      ) : (
        <View key="form" {...swapProps}>
          <Headline>
            <h1>Sign in to De-ID Studio</h1>
            <p>Enter your email to receive a sign-in link</p>
          </Headline>
          <Form noValidate onSubmit={handleSubmit(send)}>
            <TextField
              label="Email"
              type="email"
              placeholder="Enter your email"
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
              {request.isPending ? 'Sending…' : 'Send Magic Link'}
            </Button>
          </Form>
          <Button
            variant="ghostSecondary"
            size="medium"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={backSx}
          >
            Back
          </Button>
        </View>
      )}
    </AnimatePresence>
  )
}

export default LoginPage;
