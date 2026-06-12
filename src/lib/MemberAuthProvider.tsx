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
  type MemberProfile,
  type MemberSession,
} from './memberAuth'

type MemberAuthContextValue = {
  session: MemberSession | null
  profile: MemberProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null)

const PROFILE_FETCH_TIMEOUT_MS = 10_000

async function fetchProfileWithTimeout(token: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      fetchMemberProfile(token),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile fetch timed out')), PROFILE_FETCH_TIMEOUT_MS)
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MemberSession | null>(() => getStoredSession())
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const current = getStoredSession()
    if (!current) {
      setSession(null)
      setProfile(null)
      return
    }

    try {
      const nextProfile = await fetchProfileWithTimeout(current.token)
      setSession(current)
      setProfile(nextProfile)
    } catch {
      clearStoredSession()
      setSession(null)
      setProfile(null)
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
        const nextProfile = await fetchProfileWithTimeout(current.token)
        if (!cancelled) {
          setSession(current)
          setProfile(nextProfile)
        }
      } catch {
        clearStoredSession()
        if (!cancelled) {
          setSession(null)
          setProfile(null)
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
    }),
    [session, profile, isLoading, login, logout, refreshProfile],
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
