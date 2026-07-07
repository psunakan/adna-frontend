export type HelpScoutContext = 'website' | 'membership'

declare global {
  interface Window {
    Beacon?: (method: string, ...args: unknown[]) => void
  }
}

const WEBSITE_BEACON_ID =
  import.meta.env.VITE_HELPSCOUT_WEBSITE_BEACON_ID?.trim() ||
  'a322d75f-9379-40ba-b9b2-f57dd44de2c8'

const MEMBERSHIP_BEACON_ID =
  import.meta.env.VITE_HELPSCOUT_MEMBERSHIP_BEACON_ID?.trim() ||
  'c4a8e6ff-e576-47b0-a833-1ef60c50eb02'

let activeContext: HelpScoutContext | null = null

function beaconIdForContext(context: HelpScoutContext): string {
  return context === 'membership' ? MEMBERSHIP_BEACON_ID : WEBSITE_BEACON_ID
}

function callBeacon(method: string, ...args: unknown[]) {
  if (typeof window.Beacon !== 'function') return
  window.Beacon(method, ...args)
}

export function usesMembershipBeacon(pathname: string): boolean {
  return (
    pathname === '/membership' ||
    pathname.startsWith('/membership/') ||
    pathname === '/portal' ||
    pathname.startsWith('/portal/')
  )
}

/** Switch Help Scout Beacon by route — separate Beacons or session tags for one inbox. */
export function syncHelpScoutBeacon(context: HelpScoutContext) {
  if (typeof window.Beacon !== 'function') return
  if (activeContext === context) return

  const nextId = beaconIdForContext(context)
  const previousId = activeContext ? beaconIdForContext(activeContext) : null

  if (activeContext === null) {
    callBeacon('init', nextId)
  } else if (nextId !== previousId) {
    callBeacon('destroy')
    callBeacon('init', nextId)
  }

  if (context === 'membership' && nextId === WEBSITE_BEACON_ID) {
    callBeacon('session-data', {
      'Support context': 'Membership registration',
    })
  }

  activeContext = context
}
