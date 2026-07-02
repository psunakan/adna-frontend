import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'

type ForgotPasswordSearch = {
  email?: string
}

export const Route = createFileRoute('/portal/forgot-password')({
  validateSearch: (search: Record<string, unknown>): ForgotPasswordSearch => ({
    email: typeof search.email === 'string' ? search.email : undefined,
  }),
  component: ForgotPasswordPage,
})
