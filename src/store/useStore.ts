// ============================================================================
// GLOBAL STORE (Zustand)
// PURPOSE: Persistent user types, routing decisions, admin mode, and session flags
// ============================================================================

import { create } from 'zustand'
import { getSessionId } from '../services/analytics'

export type UserType = 'firsttime' | 'recruiter' | 'revisitor' | null
export type RouteChoice = 'regular' | 'fasttrack' | 'direct' | null

interface GlobalStore {
  // Visitor classification
  userType: UserType
  setUserType: (t: UserType) => void

  // Route choice (fast track vs regular journey vs direct audience)
  routeChoice: RouteChoice
  setRouteChoice: (r: RouteChoice) => void

  // Admin access flag (from Moon route password)
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void

  // Session tracking
  sessionId: string

  // Realm 5 visit tracker
  realm5Visited: boolean
  setRealm5Visited: (v: boolean) => void

  // Reset all visitor state for a new journey
  resetSession: () => void
}

export const useStore = create<GlobalStore>((set) => ({
  userType: null,
  setUserType: (userType) => set({ userType }),

  routeChoice: null,
  setRouteChoice: (routeChoice) => set({ routeChoice }),

  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),

  sessionId: getSessionId(),

  realm5Visited: false,
  setRealm5Visited: (realm5Visited) => set({ realm5Visited }),

  resetSession: () =>
    set({
      userType: null,
      routeChoice: null,
      isAdmin: false,
      realm5Visited: false,
    }),
}))
