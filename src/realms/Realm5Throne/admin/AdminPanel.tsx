// ============================================================================
// REALM 5 COMPONENT: AdminPanel (Moon Route Exclusive)
// PURPOSE: Private Overlord Command Sanctum for Suraj Kumar
// UPDATES:
//   - Title banner in top-right corner
//   - Sitting/Kneeling pose increased by 100% (2x size)
//   - Pose 8 increased by 30%
//   - Horizontal bottom dock of 3 icons (mail.png, notice.png, brain.png)
//   - Interactive modal popups for each module
//   - Live Firestore connection with fallback support
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { DialogueBox } from '../../../components/ui/DialogueBox'
import { useStore } from '../../../store/useStore'
import { AdminAnalytics } from './AdminAnalytics'
import { AdminLetterBox } from './AdminLetterBox'
import { AdminNoticeBoard } from './AdminNoticeBoard'

interface AdminPanelProps {
  onExitAdmin: () => void
}

type AdminModalType = 'letterbox' | 'noticeboard' | 'analytics' | null

export function AdminPanel({ onExitAdmin }: AdminPanelProps) {
  const { setIsAdmin, setUserType } = useStore()
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [greetingDone, setGreetingDone] = useState(false)
  const [activeModal, setActiveModal] = useState<AdminModalType>(null)

  const greetingLines = [
    'My Lord. The Endless One returns to his rightful throne.',
    'I have watched over your sovereign domain during your absence.',
    'Mortals have journeyed through your underworld. Their inquiries and footsteps are recorded in the command modules below.',
  ]

  const advanceGreeting = useCallback(() => {
    if (greetingIndex + 1 < greetingLines.length) {
      setGreetingIndex((prev) => prev + 1)
    } else {
      setGreetingDone(true)
    }
  }, [greetingIndex, greetingLines.length])

  const handleExitAdmin = () => {
    setIsAdmin(false)
    setUserType('firsttime')
    onExitAdmin()
  }

  return (
    <div className="admin-chamber">
      {/* Background — Same background as Realm 5 */}
      <div className="admin-bg" />

      {/* Top Right: Command Module Title Banner */}
      <div className="admin-title-banner">
        <span className="admin-realm-tag">OVERLORD COMMAND SANCTUM // ADMIN</span>
        <h1 className="admin-realm-title">THRONE ROOM COMMAND MODULE</h1>
      </div>

      {/* Slave Character: Kneeling during greeting (+100% size); Pose 8 (+30% size) after greeting */}
      {!greetingDone ? (
        <motion.img
          key="kneeling"
          src="/images/xalvorith-kneeling.png"
          alt="Xal'Vorith Kneeling before The Overlord"
          className="admin-xal-kneeling"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      ) : (
        <motion.img
          key="pose8"
          src="/images/xalvorith-pose8.png"
          alt="Xal'Vorith Standing Pose 8"
          className="admin-xal-pose8"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        />
      )}

      {/* Greeting Dialogue */}
      {!greetingDone ? (
        <DialogueBox
          speaker="Xal'Vorith — Royal Salutation"
          text={greetingLines[greetingIndex]}
          state="narration"
          visible={true}
          onSkip={advanceGreeting}
          hintText="[ TAP OR PRESS ANY KEY TO PROCEED ]"
          variant="realm2"
        />
      ) : (
        /* Horizontal Dock of 3 Icons */
        <div className="admin-dock-container">
          <div className="admin-dock">
            {/* Icon 1: The Letter Box */}
            <button
              className={`admin-icon-btn ${activeModal === 'letterbox' ? 'active' : ''}`}
              onClick={() => setActiveModal('letterbox')}
            >
              <img src="/images/mail.png" alt="Letter Box" className="dock-icon-img" />
              <span className="dock-icon-title">THE LETTER BOX</span>
              <span className="dock-icon-sub">Enquiries</span>
            </button>

            {/* Icon 2: The Notice Board */}
            <button
              className={`admin-icon-btn ${activeModal === 'noticeboard' ? 'active' : ''}`}
              onClick={() => setActiveModal('noticeboard')}
            >
              <img src="/images/notice.png" alt="Notice Board" className="dock-icon-img" />
              <span className="dock-icon-title">NOTICE BOARD</span>
              <span className="dock-icon-sub">Dispatches</span>
            </button>

            {/* Icon 3: Domain Intelligence */}
            <button
              className={`admin-icon-btn ${activeModal === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveModal('analytics')}
            >
              <img src="/images/brain.png" alt="Domain Intelligence" className="dock-icon-img" />
              <span className="dock-icon-title">DOMAIN INTELLIGENCE</span>
              <span className="dock-icon-sub">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Popup for Admin Features */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="admin-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="admin-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
              >
                ✕
              </button>

              {activeModal === 'letterbox' && <AdminLetterBox />}
              {activeModal === 'noticeboard' && <AdminNoticeBoard />}
              {activeModal === 'analytics' && <AdminAnalytics />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Button */}
      {greetingDone && (
        <button className="admin-exit-btn" onClick={handleExitAdmin}>
          ← EXIT ADMIN — ENTER AS VISITOR
        </button>
      )}

      <style>{`
        .admin-chamber {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          width: 100dvw;
          height: 100dvh;
          overflow: hidden;
          background: #040107;
          color: #eee4ee;
          font-family: 'Cinzel', serif;
        }

        .admin-bg {
          position: fixed;
          inset: 0;
          background-image: url('/images/relam5-bg1.png');
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          z-index: 0;
          filter: brightness(0.72) contrast(1.15);
        }

        /* Top Right Title Banner */
        .admin-title-banner {
          position: fixed;
          top: 24px;
          right: 28px;
          z-index: 40;
          text-align: right;
          background: rgba(10, 0, 20, 0.85);
          padding: 10px 20px;
          border-radius: 4px;
          border: 1px solid rgba(124, 58, 237, 0.4);
          backdrop-filter: blur(10px);
          box-shadow: 0 0 25px rgba(124, 58, 237, 0.2);
        }
        .admin-realm-tag {
          font-family: 'Geist Mono', monospace;
          font-size: 8.5px;
          color: #c084fc;
          letter-spacing: 0.2em;
          display: block;
        }
        .admin-realm-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 16px;
          color: #FFD700;
          letter-spacing: 0.12em;
          margin: 2px 0 0;
        }

        /* Kneeling Slave during greeting (+100% size, strictly at bottom right) */
        .admin-xal-kneeling {
          position: fixed;
          bottom: 0;
          right: 20px;
          width: clamp(360px, 40vw, 600px);
          max-height: 82vh;
          object-fit: contain;
          z-index: 15;
          pointer-events: none;
          filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 30px rgba(124, 58, 237, 0.45));
        }

        /* Standing Slave (Pose 8) after greeting (+30% size, strictly at bottom right) */
        .admin-xal-pose8 {
          position: fixed;
          bottom: 0;
          right: 20px;
          width: clamp(310px, 35vw, 500px);
          max-height: 85vh;
          object-fit: contain;
          z-index: 15;
          pointer-events: none;
          filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 25px rgba(124, 58, 237, 0.4));
        }

        /* Bottom Horizontal Dock */
        .admin-dock-container {
          position: fixed;
          bottom: 24px;
          left: 45%;
          transform: translateX(-50%);
          z-index: 35;
          max-width: 60vw;
          display: flex;
          justify-content: center;
        }
        .admin-dock {
          display: flex;
          gap: clamp(24px, 3.5vw, 48px);
          background: transparent;
          border: none;
          padding: 0;
          box-shadow: none;
          backdrop-filter: none;
          overflow-x: visible;
        }

        .admin-icon-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
          cursor: pointer;
          transition: transform 0.3s ease, filter 0.3s ease;
          text-align: center;
        }
        .admin-icon-btn:hover, .admin-icon-btn.active {
          transform: translateY(-8px) scale(1.08);
          background: transparent;
          border: none;
          box-shadow: none;
        }
        .dock-icon-img {
          width: clamp(74px, 7vw, 98px);
          height: clamp(74px, 7vw, 98px);
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0,0,0,0.95)) drop-shadow(0 0 18px rgba(124,58,237,0.55));
          margin-bottom: 8px;
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .admin-icon-btn:hover .dock-icon-img {
          filter: drop-shadow(0 10px 24px rgba(0,0,0,0.95)) drop-shadow(0 0 28px rgba(192,132,252,0.9));
        }
        .dock-icon-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.06em;
          white-space: nowrap;
          text-shadow: 0 2px 10px rgba(0,0,0,0.95), 0 0 12px rgba(124,58,237,0.7);
        }
        .dock-icon-sub {
          font-family: 'Cinzel', serif;
          font-size: 12.5px;
          color: #c084fc;
          margin-top: 3px;
          white-space: nowrap;
          text-shadow: 0 2px 8px rgba(0,0,0,0.95);
        }

        /* Modal Popups */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(2, 0, 8, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .admin-modal-content {
          position: relative;
          width: min(880px, 94vw);
          max-height: 88vh;
          overflow-y: auto;
          background: rgba(10, 2, 20, 0.97);
          border: 1px solid #7c3aed;
          border-radius: 8px;
          box-shadow: 0 0 60px rgba(0,0,0,0.95), 0 0 40px rgba(124, 58, 237, 0.35);
          padding: 24px;
        }
        .admin-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: 1px solid rgba(124, 58, 237, 0.4);
          color: #c084fc;
          font-size: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }
        .admin-modal-close:hover {
          background: #7c3aed;
          color: #fff;
        }

        .admin-exit-btn {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 40;
          background: rgba(10, 2, 22, 0.85);
          border: 1px solid rgba(124, 58, 237, 0.6);
          color: #c084fc;
          font-family: 'Cinzel Decorative', serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
          transition: all 0.25s;
        }
        .admin-exit-btn:hover {
          background: #7c3aed;
          color: #fff;
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.7);
          transform: translateY(-2px);
        }

        @media (max-width: 860px) {
          .admin-title-banner {
            top: 14px;
            right: 14px;
            padding: 8px 12px;
          }
          .admin-realm-title { font-size: 12px; }
          .admin-xal-kneeling, .admin-xal-pose8 {
            width: 50vw;
            right: -5vw;
            opacity: 0.45;
          }
          .admin-dock-container {
            bottom: 70px;
            width: 96vw;
          }
          .admin-dock {
            gap: 8px;
            padding: 8px;
          }
          .admin-icon-btn {
            min-width: 85px;
            padding: 6px;
          }
          .dock-icon-img {
            width: 28px;
            height: 28px;
          }
          .dock-icon-title { font-size: 8px; }
          .dock-icon-sub { font-size: 7px; }
          .admin-exit-btn {
            bottom: 14px;
            right: 14px;
            font-size: 8.5px;
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  )
}
