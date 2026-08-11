import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import Realm0Gate from './realms/Realm0Gate'
import Realm1Souls from './realms/Realm1Souls'
import Realm2Arsenal from './realms/Realm2Arsenal'

export default function App() {
  const [realm, setRealm] = useState(0)
  const [overlay, setOverlay] = useState(false)
  const [realmFinished, setRealmFinished] = useState<Record<number, boolean>>({})

  const goToRealm = useCallback((next: number) => {
    setOverlay(true)
    window.setTimeout(() => {
      setRealm(next)
      window.setTimeout(() => setOverlay(false), 50)
    }, 500)
  }, [])

  const handleRealm0Next = useCallback(() => { setRealmFinished(r => ({ ...r, 0: true })); goToRealm(1) }, [goToRealm])
  const handleRealm1Next = useCallback(() => { setRealmFinished(r => ({ ...r, 1: true })); goToRealm(2) }, [goToRealm])
  const handleRealm1Prev = useCallback(() => goToRealm(0), [goToRealm])
  const handleRealm2Next = useCallback(() => { setRealmFinished(r => ({ ...r, 2: true })); goToRealm(3) }, [goToRealm])
  const handleRealm2Prev = useCallback(() => goToRealm(1), [goToRealm])

  return (
    <>
      {realm === 0 && <Realm0Gate onNext={handleRealm0Next} initialFinished={!!realmFinished[0]} />}
      {realm === 1 && <Realm1Souls onNext={handleRealm1Next} onPrev={handleRealm1Prev} initialFinished={!!realmFinished[1]} />}
      {realm === 2 && <Realm2Arsenal onNext={handleRealm2Next} onPrev={handleRealm2Prev} initialFinished={!!realmFinished[2]} />}
      {realm >= 3 && (
        <div className="placeholder-realm">
          <p>Realm {realm} — Coming Soon</p>
          <button onClick={() => goToRealm(2)}>Return to The Arsenal of Power</button>
        </div>
      )}

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
        .placeholder-realm {
          position: fixed;
          inset: 0;
          display: grid;
          place-content: center;
          gap: 16px;
          background: #030104;
          color: #D4AF37;
          font-family: 'Cinzel', serif;
          text-align: center;
        }
        .placeholder-realm button {
          padding: 10px 24px;
          background: transparent;
          border: 1px solid rgba(212,175,55,0.4);
          color: rgba(212,175,55,0.7);
          font-family: 'Cinzel', serif;
          cursor: pointer;
          letter-spacing: 0.15em;
        }
      `}</style>
    </>
  )
}
