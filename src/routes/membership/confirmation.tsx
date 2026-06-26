import { createFileRoute } from '@tanstack/react-router'
import { MembershipConfirmationPage } from '../../pages/MembershipConfirmationPage'

export const Route = createFileRoute('/membership/confirmation')({
  component: MembershipConfirmationPage,
})
