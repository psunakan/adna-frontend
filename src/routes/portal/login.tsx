import { createFileRoute, redirect } from '@tanstack/react-router'
import { PortalLoginPage } from '../../pages/PortalLoginPage'
import { getStoredSession, PORTAL_PATH } from '../../lib/memberAuth'

export const Route = createFileRoute('/portal/login')({
  beforeLoad: () => {
    if (getStoredSession()) {
      throw redirect({ to: PORTAL_PATH })
    }
  },
  component: PortalLoginPage,
})
