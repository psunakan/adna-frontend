import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage'

export const Route = createFileRoute('/portal/forgot-password')({
  component: ForgotPasswordPage,
})
