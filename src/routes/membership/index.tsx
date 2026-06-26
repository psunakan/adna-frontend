import { createFileRoute } from '@tanstack/react-router'
import { MembershipPage } from '../../pages/MembershipPage'

export const Route = createFileRoute('/membership/')({
  component: MembershipPage,
})
