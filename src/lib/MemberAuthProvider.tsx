import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredSession,
  fetchMemberProfile,
  getStoredSession,
  loginMember,
  logoutMember,
  refreshMemberMembershipStatus,
  storeSession,
  type MemberProfile,
  type MembershipRefreshResult,
  type MemberSession,
} from './memberAuth'
import { normalizeMembershipTier } from './membershipTier'

type MemberAuthContextValue = {
  session: MemberSession | null
  profile: MemberProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<MemberProfile | null>
  refreshMembershipStatus: () => Promise<MembershipRefreshResult | null>
}

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null)

const PROFILE_FETCH_TIMEOUT_MS = 10_000

function isSessionInvalidError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message === 'Session expired. Please log in again.' ||
    message === 'Member account not found.' ||
    message.includes('Session expired. Please log in again.')
  )
}

function applyProfileToSession(current: MemberSession, nextProfile: MemberProfile): MemberSession {
  return {
    token: current.token,
    member: {
      id: nextProfile.id,
      email: nextProfile.email,
      first_name: nextProfile.first_name,
      last_name: nextProfile.last_name,
      is_first_login: nextProfile.is_first_login,
      is_active: nextProfile.is_active,
    },
  }
}

async function fetchProfileWithTimeout(token: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      fetchMemberProfile(token),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Profile fetch timed out')),
          PROFILE_FETCH_TIMEOUT_MS,
        )
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

async function loadMemberProfile(token: string): Promise<MemberProfile> {
  const nextProfile = await fetchProfileWithTimeout(token)
  const tier = normalizeMembershipTier(nextProfile.membership_tier)

  if (
    nextProfile.has_paid_current_year_dues !== true &&
    (tier === 'diaspora' || tier === 'premium')
  ) {
    const refreshed = await refreshMemberMembershipStatus(token)
    return refreshed.member
  }

  return nextProfile
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MemberSession | null>(() => getStoredSession())
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async (): Promise<MemberProfile | null> => {
    const current = getStoredSession()
    if (!current) {
      setSession(null)
      setProfile(null)
      return null
    }

    try {
      const nextProfile = await loadMemberProfile(current.token)
      const nextSession = applyProfileToSession(current, nextProfile)
      storeSession(nextSession)
      setSession(nextSession)
      setProfile(nextProfile)
      return nextProfile
    } catch (error) {
      if (isSessionInvalidError(error)) {
        clearStoredSession()
        setSession(null)
        setProfile(null)
      }
      throw error
    }
  }, [])

  const refreshMembershipStatus = useCallback(async (): Promise<MembershipRefreshResult | null> => {
    const current = getStoredSession()
    if (!current) {
      setSession(null)
      setProfile(null)
      return null
    }

    try {
      const result = await refreshMemberMembershipStatus(current.token)
      const nextSession = applyProfileToSession(current, result.member)
      storeSession(nextSession)
      setSession(nextSession)
      setProfile(result.member)
      return result
    } catch (error) {
      if (isSessionInvalidError(error)) {
        clearStoredSession()
        setSession(null)
        setProfile(null)
      }
      throw error
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const current = getStoredSession()
      if (!current) {
        if (!cancelled) {
          setSession(null)
          setProfile(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const nextProfile = await loadMemberProfile(current.token)
        if (!cancelled) {
          setSession(current)
          setProfile(nextProfile)
        }
      } catch (error) {
        if (isSessionInvalidError(error)) {
          clearStoredSession()
          if (!cancelled) {
            setSession(null)
            setProfile(null)
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await loginMember(email, password)
    setSession(nextSession)
    const nextProfile = await fetchMemberProfile(nextSession.token)
    setProfile(nextProfile)
  }, [])

  const logout = useCallback(async () => {
    const token = session?.token ?? getStoredSession()?.token
    if (token) {
      await logoutMember(token)
    } else {
      clearStoredSession()
    }
    setSession(null)
    setProfile(null)
  }, [session?.token])

  const value = useMemo(
    () => ({
      session,
      profile,
      isAuthenticated: Boolean(session && profile),
      isLoading,
      login,
      logout,
      refreshProfile,
      refreshMembershipStatus,
    }),
    [session, profile, isLoading, login, logout, refreshProfile, refreshMembershipStatus],
  )

  return <MemberAuthContext.Provider value={value}>{children}</MemberAuthContext.Provider>
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext)
  if (!context) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider')
  }
  return context
}
