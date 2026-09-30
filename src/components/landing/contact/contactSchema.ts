import * as yup from 'yup'

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 5000

export const contactSchema = yup.object({
  firstName: yup.string().trim().required('Enter your first name'),
  lastName: yup.string().trim().required('Enter your last name'),
  company: yup.string().trim().default(''),
  email: yup.string().trim().required('Enter your email').email('Invalid email format'),
  // Optional, but a one-word note isn't enough to act on.
  message: yup
    .string()
    .trim()
    .max(MESSAGE_MAX)
    .default('')
    .test(
      'min-if-filled',
      `Message must be at least ${MESSAGE_MIN} characters`,
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
