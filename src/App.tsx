// ============================================================================
// APP ROOT COMPONENT
// PURPOSE: Global realm routing, seamless transitions, backward state persistence,
//          user routing (Fast Track, Direct Audience, Regular 5 Realms, Moon Admin).
//
// REALM STRUCTURE:
//   Realm 0: Gate of the Underworld (User Type, Route Selection, Moon Admin Key)
//   Realm 1: Hall of Souls (Monolith & Lore Discovery)
//   Realm 2: The Arsenal (10 Mastery Weapons & Skills)
//   Realm 3: Trophy Hall (5 Pillars Lava Crossing, Kingdom Projects)
//   Realm 4: The Three Paths — Chronicles (Social Portals & Journey)
//   Realm 5: The Throne Room (Admin Chamber or Visitor Sanctum + AI Oracle + Enquiry)
//   Fast Track (Realm 10): Compressed Recruiter CV Dimension
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { AudioToggle } from './components/ui/AudioToggle'
import FastTrack from './realms/FastTrack'
import Realm0Gate from './realms/Realm0Gate'
import Realm1Souls from './realms/Realm1Souls'
import Realm2Arsenal from './realms/Realm2Arsenal'
import Realm3Trophies from './realms/Realm3Trophies'
import Realm4Chronicles from './realms/Realm4Chronicles'
import Realm5Throne from './realms/Realm5Throne'
import { useStore } from './store/useStore'

export default function App() {
  const { isAdmin, setIsAdmin } = useStore()

  // Current active realm index (0 to 5, or 10 for Fast Track)
  const [realm, setRealm] = useState(0)

  // Black fade transition overlay state between realms
  const [overlay, setOverlay] = useState(false)

  // Tracks which realms have already been fully explored
  const [realmFinished, setRealmFinished] = useState<Record<number, boolean>>({})

  // --------------------------------------------------------------------------
  // NAVIGATION HANDLER: Seamless black transition overlay between realms
  // --------------------------------------------------------------------------
  const goToRealm = useCallback((next: number) => {
    setOverlay(true)
    window.setTimeout(() => {
      setRealm(next)
      window.setTimeout(() => setOverlay(false), 50)
    }, 500)
  }, [])

  // Realm 0 Handlers
  const handleRealm0Next = useCallback(() => {
    setRealmFinished((r) => ({ ...r, 0: true }))
    goToRealm(1)
  }, [goToRealm])

  const handleFastTrack = useCallback(() => {
    goToRealm(10)
  }, [goToRealm])

  const handleDirectThrone = useCallback(() => {
    goToRealm(5)
  }, [goToRealm])

  const handleAdminLogin = useCallback(() => {
    setIsAdmin(true)
    goToRealm(5)
  }, [setIsAdmin, goToRealm])

  // Fast Track to Throne
  const handleFastTrackProceed = useCallback(() => {
    goToRealm(5)
  }, [goToRealm])

  // Realm 1 - 4 Navigation
  const handleRealm1Next = useCallback(() => {
    setRealmFinished((r) => ({ ...r, 1: true }))
    goToRealm(2)
  }, [goToRealm])
  const handleRealm1Prev = useCallback(() => goToRealm(0), [goToRealm])

  const handleRealm2Next = useCallback(() => {
    setRealmFinished((r) => ({ ...r, 2: true }))
    goToRealm(3)
  }, [goToRealm])
  const handleRealm2Prev = useCallback(() => goToRealm(1), [goToRealm])

  const handleRealm3Next = useCallback(() => {
    setRealmFinished((r) => ({ ...r, 3: true }))
    goToRealm(4)
  }, [goToRealm])
  const handleRealm3Prev = useCallback(() => goToRealm(2), [goToRealm])

  const handleRealm4Next = useCallback(() => {
    setRealmFinished((r) => ({ ...r, 4: true }))
    goToRealm(5)
  }, [goToRealm])
  const handleRealm4Prev = useCallback(() => goToRealm(3), [goToRealm])

  // Realm 5 Navigation
  const handleRealm5Prev = useCallback(() => {
    if (isAdmin) {
      setIsAdmin(false)
      goToRealm(0)
    } else {
      goToRealm(4)
    }
  }, [isAdmin, setIsAdmin, goToRealm])

  const handleRealm5Next = useCallback(() => {
    goToRealm(0)
  }, [goToRealm])

  return (
    <>
      {/* SECTION: Top-Right Audio Mute Control (Active in Realm 0) */}
      {realm === 0 && <AudioToggle />}

      {/* SECTION: Realm Views */}
      {realm === 0 && (
        <Realm0Gate
          onNext={handleRealm0Next}
          onFastTrack={handleFastTrack}
          onDirectThrone={handleDirectThrone}
          onAdminLogin={handleAdminLogin}
          initialFinished={!!realmFinished[0]}
        />
      )}

      {/* Fast Track Dimension for Recruiters */}
      {realm === 10 && <FastTrack onProceedToThrone={handleFastTrackProceed} />}

      {/* Normal Realm Progression */}
      {realm === 1 && (
        <Realm1Souls
          onNext={handleRealm1Next}
          onPrev={handleRealm1Prev}
          initialFinished={!!realmFinished[1]}
        />
      )}
      {realm === 2 && (
        <Realm2Arsenal
          onNext={handleRealm2Next}
          onPrev={handleRealm2Prev}
          initialFinished={!!realmFinished[2]}
        />
      )}
      {realm === 3 && (
        <Realm3Trophies
          onNext={handleRealm3Next}
          onPrev={handleRealm3Prev}
          initialFinished={!!realmFinished[3]}
        />
      )}
      {realm === 4 && (
        <Realm4Chronicles
          onNext={handleRealm4Next}
          onPrev={handleRealm4Prev}
          initialFinished={!!realmFinished[4]}
        />
      )}
      {realm === 5 && (
        <Realm5Throne
          onNext={handleRealm5Next}
          onPrev={handleRealm5Prev}
          initialFinished={!!realmFinished[5]}
        />
      )}

      {/* SECTION: Blackout Realm Transition Fade Overlay */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            className="realm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .realm-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
          pointer-events: none;
        }
      `}</style>
    </>
  )
}
