import * as yup from 'yup'
import i18n from '../../i18n'

// Messages are functions so they're translated in the current language.
export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required(() => i18n.t('auth:login.emailRequired'))
    .email(() => i18n.t('auth:login.emailInvalid')),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
