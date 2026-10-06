import { yupResolver } from '@hookform/resolvers/yup'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { styled } from '@mui/material/styles'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import checkIcon from '../../../assets/landing/check-circle.svg'
import errorIcon from '../../../assets/landing/error.svg'
import { useSendContactMessage } from '../../../hooks'
import { colors, typography } from '../../../theme'
import { Button, TextField } from '../../ui'
import { NARROW, TABLET } from '../../layouts/landing/styles'
import {
  MESSAGE_MAX,
  contactSchema,
  emptyContactForm,
  type ContactFormValues,
} from './contactSchema'
import { EASE_OUT, fadeUp, reveal } from '../motion'
import { CONTACT_EMAIL, contactBorder } from './styles'

// Form, success and failure views fade into one another.
const swap: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

const iconPop = {
  initial: { scale: 0 },
  animate: { scale: [0, 1.15, 1], transition: { duration: 0.5, delay: 0.15 } },
}

const iconShake = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    x: [0, -8, 8, -6, 6, 0],
    transition: { scale: { duration: 0.3, delay: 0.1 }, x: { duration: 0.5, delay: 0.35 } },
  },
}

const swapProps = { variants: swap, initial: 'initial', animate: 'animate', exit: 'exit' } as const

const Root = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'failed',
})<{ failed: boolean }>(({ failed }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  flex: '0 0 787px',
  // Keeps the panel from collapsing when the form is swapped for a result.
  minHeight: 540,
  padding: 24,
  border: failed ? '1px solid rgba(220, 38, 38, 0.5)' : contactBorder,
  borderRadius: 16,
  transition: 'border-color 300ms',
  [TABLET]: { flexBasis: 'auto' },
  [NARROW]: { minHeight: 480, padding: '24px 16px' },
}))

const View = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  flex: 1,
})

const Heading = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '& h3': { ...typography.h3, margin: 0, color: colors.white },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  // Each field reserves 20px for its error line; the gap keeps that line
  // clear of the next field's notched label.
  gap: 12,
  flex: 1,
  // Room for the first row's notched labels.
  paddingTop: 8,
  '& .ContactPanel-names': {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'start',
    gap: '0 16px',
    [NARROW]: { gridTemplateColumns: '1fr' },
  },
  '& .ContactPanel-message': { flex: 1 },
  '& .ContactPanel-actions': {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 8,
    [NARROW]: { '& > *': { flex: 1 } },
  },
})

const Result = styled(View)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 20,
  flex: 1,
  textAlign: 'center',
  // Centers the message; the button sits at the bottom.
  '& .ContactPanel-body': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    margin: 'auto 0',
  },
  '& .ContactPanel-icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: '50%',
  },
  '& h3': { ...typography.h3, margin: 0, color: colors.white },
  '& p': { ...typography.bodyM, margin: 0, color: colors.neutral[500] },
  '& .ContactPanel-text': { display: 'flex', flexDirection: 'column', gap: 8 },
  '& a': { color: colors.accent[400] },
})

/** Contact form; swaps to a success or failure message after sending. */
export function ContactPanel() {
  const { t } = useTranslation(['landing', 'common'])
  const navigate = useNavigate()
  const send = useSendContactMessage()
  // Lives above the success / failure views, so "Try again" gets the
  // filled-in form back.
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: emptyContactForm,
  })
  const message = useWatch({ control, name: 'message' })

  const field = (name: keyof ContactFormValues) => ({
    ...register(name),
    error: errors[name]?.message,
    surface: 'dark' as const,
  })

  // Values arrive trimmed by the schema.
  const submit = (values: ContactFormValues) => {
    send.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        company: values.company || undefined,
        message: values.message || undefined,
      },
      { onSuccess: () => reset() },
    )
  }

  const view = send.isSuccess ? 'success' : send.isError ? 'error' : 'form'

  return (
    <Root failed={send.isError} {...reveal} variants={fadeUp}>
      <AnimatePresence mode="wait" initial={false}>
        {view === 'success' && (
          <Result key="success" role="status" {...swapProps}>
            <div className="ContactPanel-body">
              <motion.span
                className="ContactPanel-icon"
                style={{
                  backgroundColor: colors.successLight,
                  boxShadow: '0 0 24px 8px rgba(0, 191, 165, 0.3)',
                }}
                {...iconPop}
              >
                <img src={checkIcon} alt="" />
              </motion.span>
              <div className="ContactPanel-text">
                <h3>{t('contact.success.title')}</h3>
                <p>{t('contact.success.thanks')}</p>
                <p>{t('contact.success.reply')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="medium"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              {t('contact.success.home')}
            </Button>
          </Result>
        )}

        {view === 'error' && (
          <Result key="error" role="alert" {...swapProps}>
            <div className="ContactPanel-body">
              <motion.span
                className="ContactPanel-icon"
                style={{
                  backgroundColor: colors.errorLight,
                  boxShadow: '0 0 24px 8px rgba(220, 38, 38, 0.3)',
                }}
                {...iconShake}
              >
                <img src={errorIcon} alt="" />
              </motion.span>
              <div className="ContactPanel-text">
                <h3>{t('contact.failure.title')}</h3>
                <p>{t('contact.failure.description')}</p>
                <p>
                  Please try again or email us directly{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </p>
              </div>
            </div>
            {/* Back to the form with everything still filled in. */}
            <Button size="medium" onClick={() => send.reset()}>
              {t('common:actions.tryAgain')}
            </Button>
          </Result>
        )}

        {view === 'form' && (
          <View key="form" {...swapProps}>
            <Heading>
              <h3>{t('contact.form.title')}</h3>
              <p>{t('contact.form.subtitle')}</p>
            </Heading>
            <Form noValidate onSubmit={handleSubmit(submit)}>
              <div className="ContactPanel-names">
                <TextField
                  label={t('contact.form.firstName')}
                  placeholder={t('contact.form.firstNamePlaceholder')}
                  autoComplete="given-name"
                  required
                  {...field('firstName')}
                />
                <TextField
                  label={t('contact.form.lastName')}
                  placeholder={t('contact.form.lastNamePlaceholder')}
                  autoComplete="family-name"
                  required
                  {...field('lastName')}
                />
              </div>
              <TextField
                label={t('contact.form.company')}
                placeholder={t('contact.form.companyPlaceholder')}
                autoComplete="organization"
                {...field('company')}
              />
              <TextField
                label={t('contact.form.email')}
                type="email"
                placeholder={t('contact.form.emailPlaceholder')}
                autoComplete="email"
                required
                {...field('email')}
              />
              <TextField
                className="ContactPanel-message"
                label={t('contact.form.message')}
                placeholder={t('contact.form.messagePlaceholder')}
                multiline
                rows={3}
                maxLength={MESSAGE_MAX}
                characterCount={message.length}
                {...field('message')}
              />
              <div className="ContactPanel-actions">
                <Button
                  type="submit"
                  surface="dark"
                  endIcon={<ArrowForwardIcon />}
                  disabled={!isValid || send.isPending}
                >
                  {send.isPending ? t('contact.form.sending') : t('contact.form.send')}
                </Button>
              </div>
            </Form>
          </View>
        )}
      </AnimatePresence>
    </Root>
  )
}
