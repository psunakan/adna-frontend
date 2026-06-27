import { createFileRoute } from '@tanstack/react-router'
import { MembershipVerifyPage } from '../../pages/MembershipVerifyPage'

type VerifySearch = {
  code?: string
}

export const Route = createFileRoute('/membership/verify')({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    code: typeof search.code === 'string' ? search.code : undefined,
  }),
  component: MembershipVerifyPage,
})
