import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/membership/thank-you')({
  beforeLoad: () => {
    throw redirect({ to: '/thank-you' })
  },
})
