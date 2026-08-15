// ============================================================================
// ANALYTICS SERVICE
// PURPOSE: Session tracking, realm duration calculation, and Firestore events
// ============================================================================

import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Generate or retrieve persistent session ID for current browser session
export const getSessionId = (): string => {
  try {
    const stored = sessionStorage.getItem('portf_session')
    if (stored) return stored
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('portf_session', id)
    return id
  } catch {
    return `session_${Date.now()}`
  }
}

// Track any analytics event into Firestore 'analytics' collection
export const trackEvent = async (
  event: string,
  userType: string,
  extra?: Record<string, unknown>
) => {
  try {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      // Local dev mode without Firebase credentials — log to console
      console.log('[Analytics Event]:', { event, userType, ...extra })
      return
    }
    await addDoc(collection(db, 'analytics'), {
      event,
      userType: userType || 'unknown',
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      ...extra,
    })
  } catch (e) {
    // Silent fail — never break the visitor experience
    console.warn('Analytics error (silent):', e)
  }
}

// Track realm entry time for duration calculation
export const trackRealmEntry = (realm: number) => {
  try {
    sessionStorage.setItem(`realm${realm}_entry`, Date.now().toString())
  } catch {
    // ignore sessionStorage errors
  }
}

// Track realm exit time and compute duration in seconds
export const trackRealmExit = async (realm: number, userType: string) => {
  try {
    const entry = sessionStorage.getItem(`realm${realm}_entry`)
    if (!entry) return
    const duration = Math.round((Date.now() - parseInt(entry, 10)) / 1000)
    await trackEvent('realm_duration', userType, { realm, duration })
  } catch (e) {
    console.warn('Realm exit tracking error:', e)
  }
}
