import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().trim().required('Enter your email').email('Enter valid email'),
})

export type LoginFormValues = yup.InferType<typeof loginSchema>
