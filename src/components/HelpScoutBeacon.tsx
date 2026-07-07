import { useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { syncHelpScoutBeacon, usesMembershipBeacon } from '../lib/helpScoutBeacon'

/** Loads the site-appropriate Help Scout Beacon when the route changes. */
export function HelpScoutBeacon() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    syncHelpScoutBeacon(usesMembershipBeacon(pathname) ? 'membership' : 'website')
  }, [pathname])

  return null
}
