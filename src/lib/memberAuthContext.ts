import { createContext, useContext } from 'react'
import type { MemberProfile, MembershipRefreshResult, MemberSession } from './memberAuth'

export type MemberAuthContextValue = {
  session: MemberSession | null
  profile: MemberProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<MemberProfile | null>
  refreshMembershipStatus: () => Promise<MembershipRefreshResult | null>
}

export const MemberAuthContext = createContext<MemberAuthContextValue | null>(null)

export function useMemberAuth() {
  const context = useContext(MemberAuthContext)
  if (!context) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider')
  }
  return context
}
