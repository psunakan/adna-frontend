import { createFileRoute, redirect } from '@tanstack/react-router'
import { PortalDashboardPage } from '../../pages/PortalDashboardPage'
import { getStoredSession, PORTAL_LOGIN_PATH } from '../../lib/memberAuth'

export const Route = createFileRoute('/portal/')({
  beforeLoad: () => {
    if (!getStoredSession()) {
      throw redirect({ to: PORTAL_LOGIN_PATH })
    }
  },
  component: PortalDashboardPage,
})
