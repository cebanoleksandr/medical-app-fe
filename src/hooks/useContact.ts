import { useMutation } from '@tanstack/react-query'
import { contactService } from '../services'

export function useSendContactMessage() {
  return useMutation({ mutationFn: contactService.send })
}
