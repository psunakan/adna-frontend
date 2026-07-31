import { createFileRoute } from '@tanstack/react-router'
import { ZeffyThankYouPage } from '../pages/ZeffyThankYouPage'

export const Route = createFileRoute('/thank-you')({
  component: ZeffyThankYouPage,
})
