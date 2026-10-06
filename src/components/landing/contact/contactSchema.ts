import * as yup from 'yup'
import { CONTACT_LIMITS } from '../../../api/types'
import i18n from '../../../i18n'

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = CONTACT_LIMITS.message

// Messages are functions so they're translated in the current language.
const tooLong = ({ max }: { max: number }) => i18n.t('landing:contact.validation.tooLong', { max })

export const contactSchema = yup.object({
  firstName: yup.string().trim().required(() => i18n.t('landing:contact.validation.firstName'))
    .max(CONTACT_LIMITS.firstName, tooLong),
  lastName: yup.string().trim().required(() => i18n.t('landing:contact.validation.lastName'))
    .max(CONTACT_LIMITS.lastName, tooLong),
  company: yup.string().trim().max(CONTACT_LIMITS.company, tooLong).default(''),
  email: yup
    .string()
    .trim()
    .required(() => i18n.t('landing:contact.validation.email'))
    .email(() => i18n.t('landing:contact.validation.emailInvalid'))
    .max(CONTACT_LIMITS.email, tooLong),
  // Optional, but a one-word note isn't enough to act on.
  message: yup
    .string()
    .trim()
    .max(MESSAGE_MAX, tooLong)
    .default('')
    .test(
      'min-if-filled',
      () => i18n.t('landing:contact.validation.messageMin', { min: MESSAGE_MIN }),
      (value) => !value || value.length >= MESSAGE_MIN,
    ),
})

export type ContactFormValues = yup.InferType<typeof contactSchema>

export const emptyContactForm: ContactFormValues = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  message: '',
}
