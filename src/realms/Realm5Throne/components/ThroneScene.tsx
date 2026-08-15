// ============================================================================
// REALM 5 COMPONENT: ThroneScene (User World)
// PURPOSE: The Throne Room & Inner Sanctum of The Overlord
// UPDATES:
//   - Background calibrated to show full chamber without cropped cuts
//   - Title banner in top-right corner
//   - Leave button on bottom-right corner
//   - Slave (Pose 8) size increased by 20% at bottom right
//   - Horizontal bottom dock of 4 icons (chatbot, inquiry, notice, scroll) with simple English labels
//   - Clean modal popups when clicking each icon
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DialogueBox } from '../../../components/ui/DialogueBox'
import { trackEvent } from '../../../services/analytics'
import { useStore } from '../../../store/useStore'
import { ChatBot } from './ChatBot'
import { EnquiryForm } from './EnquiryForm'
import { ResumeDownload } from './ResumeDownload'
import { SendOff } from './SendOff'
import { WhatsNew } from './WhatsNew'

interface ThroneSceneProps {
  onReturnToGate: () => void
  onPrevRealm: () => void
}

type ModalType = 'chatbot' | 'inquiry' | 'notice' | 'scroll' | null

const SCRIPTS: Record<string, string[]> = {
  firsttime: [
    'You have crossed the abyss, mortal.',
    'Every trial survived. Every sovereign realm unlocked.',
    'You stand now in the presence of The Overlord — Suraj Kumar.',
    'He builds what others merely conceive. Speak with me, examine his codex, or leave your scroll upon his altar.',
  ],
  recruiter_regular: [
    'A recruiter walks among the shadows.',
    'You have witnessed his engineering depth, his RAG fortresses, and his product discipline.',
    'His terms: Immediate availability. Remote deployment. Modest tribute (~₹40,000 monthly).',
    'Consult the oracle or claim his codex below.',
  ],
  recruiter_fasttrack: [
    'You chose the swift path of efficiency.',
    'The Overlord values those who cut straight to the truth.',
    'He is ready to join your ranks immediately. Download his scrolls or request an audience.',
  ],
  revisitor: [
    'You return to the throne room, traveler.',
    'The Overlord continues his relentless expansion.',
    'Inspect the new dispatches upon the monolith or consult the oracle once more.',
  ],
}

export function ThroneScene({ onReturnToGate, onPrevRealm }: ThroneSceneProps) {
  const { userType, routeChoice, setRealm5Visited } = useStore()
  const [phase, setPhase] = useState<'entrance' | 'interactive' | 'sendoff'>('entrance')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const startTime = useRef(Date.now())

  const scriptKey =
    userType === 'recruiter'
      ? routeChoice === 'fasttrack'
        ? 'recruiter_fasttrack'
        : 'recruiter_regular'
      : userType === 'revisitor'
      ? 'revisitor'
      : 'firsttime'

  const script = SCRIPTS[scriptKey] ?? SCRIPTS.firsttime

  useEffect(() => {
    trackEvent('visit', userType ?? 'unknown', { realm: 5 })
    setRealm5Visited(true)
    return () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      trackEvent('realm_duration', userType ?? 'unknown', { realm: 5, duration })
    }
  }, [userType, setRealm5Visited])

  const advanceWelcomeDialogue = useCallback(() => {
    if (dialogueIndex + 1 < script.length) {
      setDialogueIndex((prev) => prev + 1)
    } else {
      setPhase('interactive')
    }
  }, [dialogueIndex, script.length])

  const handleLeaveUnderworld = () => {
    setPhase('sendoff')
  }

  return (
    <div className="throne-chamber">
      {/* Background — Full room without aggressive cropping */}
      <div className="throne-bg" />

      {/* Top Right: Inner Sanctum Title Banner */}
      <div className="throne-title-banner">
        <span className="throne-realm-tag">REALM V // THE THRONE ROOM</span>
        <h1 className="throne-realm-title">THE INNER SANCTUM</h1>
      </div>

      {/* Slave Character (Pose 8) — Increased by 20% */}
      <motion.img
        src="/images/xalvorith-pose8.png"
        alt="Xal'Vorith, The Crowned Slave"
        className="xal-throne-pose8"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0, delay: 0.2 }}
      />

      {/* Welcome Narration Dialogue (Entrance Phase) */}
      {phase === 'entrance' && (
        <DialogueBox
          speaker="Xal'Vorith — The Throne Room"
          text={script[dialogueIndex]}
          state="narration"
          visible={true}
          onSkip={advanceWelcomeDialogue}
          hintText="[ TAP OR PRESS ANY KEY TO PROCEED ]"
          variant="realm2"
        />
      )}

      {/* Interactive Phase — Horizontal Dock of 4 Icons with Clear English */}
      {phase === 'interactive' && (
        <div className="throne-dock-container">
          <div className="throne-dock">
            {/* Icon 1: Oracle Chatbot */}
            <button
              className={`throne-icon-btn ${activeModal === 'chatbot' ? 'active' : ''}`}
              onClick={() => setActiveModal('chatbot')}
            >
              <img src="/images/chatbot.png" alt="Oracle AI" className="dock-icon-img" />
              <span className="dock-icon-title">CONSULT ORACLE</span>
              <span className="dock-icon-sub">AI Assistant</span>
            </button>

            {/* Icon 2: Audience Enquiry Form */}
            <button
              className={`throne-icon-btn ${activeModal === 'inquiry' ? 'active' : ''}`}
              onClick={() => setActiveModal('inquiry')}
            >
              <img src="/images/inquiry.png" alt="Request Audience" className="dock-icon-img" />
              <span className="dock-icon-title">REQUEST AUDIENCE</span>
              <span className="dock-icon-sub">Contact Form</span>
            </button>

            {/* Icon 3: Dispatches Notice Board */}
            <button
              className={`throne-icon-btn ${activeModal === 'notice' ? 'active' : ''}`}
              onClick={() => setActiveModal('notice')}
            >
              <img src="/images/notice.png" alt="Dispatches" className="dock-icon-img" />
              <span className="dock-icon-title">DISPATCHES</span>
              <span className="dock-icon-sub">Latest Updates</span>
            </button>

            {/* Icon 4: Codex Resume Download */}
            <button
              className={`throne-icon-btn ${activeModal === 'scroll' ? 'active' : ''}`}
              onClick={() => setActiveModal('scroll')}
            >
              <img src="/images/scroll.png" alt="Overlord Codex" className="dock-icon-img" />
              <span className="dock-icon-title">OVERLORD CODEX</span>
              <span className="dock-icon-sub">Resume Download</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Popup Container */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="throne-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="throne-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="throne-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Close"
              >
                ✕
              </button>

              {activeModal === 'chatbot' && <ChatBot isFirstVisit={false} />}
              {activeModal === 'inquiry' && <EnquiryForm />}
              {activeModal === 'notice' && <WhatsNew />}
              {activeModal === 'scroll' && <ResumeDownload />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation: Return to Realm 4 (Bottom Left) */}
      {phase === 'interactive' && (
        <button
          className="realm-nav-btn prev-btn throne-prev-btn"
          onClick={onPrevRealm}
          aria-label="Return to The Chronicles"
        >
          ← THE CHRONICLES
        </button>
      )}

      {/* Navigation: Leave Underworld Button (Bottom Right) */}
      {phase === 'interactive' && (
        <button
          className="throne-leave-btn"
          onClick={handleLeaveUnderworld}
          aria-label="Leave Underworld"
        >
          LEAVE UNDERWORLD ↗
        </button>
      )}

      {/* Farewell Sequence */}
      {phase === 'sendoff' && <SendOff onReturnToGate={onReturnToGate} />}

      <style>{`
        .throne-chamber {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          width: 100dvw;
          height: 100dvh;
          overflow: hidden;
          background: #030105;
          color: #eee4ee;
          font-family: 'Cinzel', serif;
        }

        /* Full Background — Calibrated to prevent cropping */
        .throne-bg {
          position: fixed;
          inset: 0;
          background-image: url('/images/relam5-bg1.png');
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          z-index: 0;
          filter: brightness(0.78) contrast(1.08);
        }

        /* Top Right Title Banner */
        .throne-title-banner {
          position: fixed;
          top: 24px;
          right: 28px;
          z-index: 40;
          text-align: right;
          background: rgba(4, 0, 10, 0.75);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 10px 18px;
          border-radius: 4px;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.7);
        }
        .throne-realm-tag {
          font-family: 'Geist Mono', monospace;
          font-size: 8.5px;
          color: #D4AF37;
          letter-spacing: 0.25em;
          display: block;
        }
        .throne-realm-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 16px;
          color: #FFD700;
          margin: 2px 0 0;
          letter-spacing: 0.12em;
          text-shadow: 0 0 15px rgba(212,175,55,0.4);
        }

        /* Right Bottom Standing Slave (Pose 8) — Increased by 20% */
        .xal-throne-pose8 {
          position: fixed;
          right: 2vw;
          bottom: 0;
          width: clamp(290px, 32vw, 470px);
          max-height: 86vh;
          object-fit: contain;
          z-index: 10;
          pointer-events: none;
          filter: drop-shadow(0 15px 12px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(212,175,55,0.25));
        }

        .throne-dock-container {
          position: fixed;
          bottom: 24px;
          left: 46%;
          transform: translateX(-50%);
          z-index: 35;
          max-width: 60vw;
          display: flex;
          justify-content: center;
        }
        .throne-dock {
          display: flex;
          gap: clamp(18px, 2.5vw, 36px);
          background: transparent;
          border: none;
          padding: 0;
          box-shadow: none;
          backdrop-filter: none;
          overflow-x: visible;
        }

        .throne-icon-btn {
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
        .throne-icon-btn:hover, .throne-icon-btn.active {
          transform: translateY(-8px) scale(1.08);
          background: transparent;
          border: none;
          box-shadow: none;
        }
        .dock-icon-img {
          width: clamp(70px, 6.5vw, 92px);
          height: clamp(70px, 6.5vw, 92px);
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0,0,0,0.95)) drop-shadow(0 0 16px rgba(212,175,55,0.4));
          margin-bottom: 8px;
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .throne-icon-btn:hover .dock-icon-img {
          filter: drop-shadow(0 10px 24px rgba(0,0,0,0.95)) drop-shadow(0 0 28px rgba(255,215,0,0.85));
        }
        .dock-icon-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.06em;
          white-space: nowrap;
          text-shadow: 0 2px 10px rgba(0,0,0,0.95), 0 0 12px rgba(212,175,55,0.6);
        }
        .dock-icon-sub {
          font-family: 'Cinzel', serif;
          font-size: 12.5px;
          color: rgba(212,175,55,0.9);
          margin-top: 3px;
          white-space: nowrap;
          text-shadow: 0 2px 8px rgba(0,0,0,0.95);
        }

        /* Modal Popups */
        .throne-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(2, 0, 8, 0.82);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .throne-modal-content {
          position: relative;
          width: min(840px, 94vw);
          max-height: 88vh;
          overflow-y: auto;
          background: rgba(8, 2, 16, 0.96);
          border: 1px solid #D4AF37;
          border-radius: 8px;
          box-shadow: 0 0 60px rgba(0,0,0,0.95), 0 0 40px rgba(212,175,55,0.25);
          padding: 24px;
        }
        .throne-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: 1px solid rgba(212,175,55,0.3);
          color: #D4AF37;
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
        .throne-modal-close:hover {
          background: #D4AF37;
          color: #000;
        }

        /* Nav Buttons */
        .throne-prev-btn {
          position: fixed !important;
          top: auto !important;
          bottom: 24px !important;
          left: 24px !important;
          right: auto !important;
          height: auto !important;
          width: auto !important;
          z-index: 40;
          background: rgba(8, 2, 14, 0.85);
          border: 1px solid rgba(212,175,55,0.6);
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(212,175,55,0.2);
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .throne-prev-btn:hover {
          background: #D4AF37;
          color: #000;
          box-shadow: 0 0 30px rgba(212,175,55,0.6);
          transform: translateY(-2px);
        }
        .throne-leave-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          background: rgba(8, 2, 14, 0.85);
          border: 1px solid rgba(212,175,55,0.6);
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(212,175,55,0.2);
          transition: all 0.25s;
        }
        .throne-leave-btn:hover {
          background: #D4AF37;
          color: #000;
          box-shadow: 0 0 30px rgba(212,175,55,0.6);
          transform: translateY(-2px);
        }

        @media (max-width: 860px) {
          .throne-title-banner {
            top: 14px;
            right: 14px;
            padding: 8px 12px;
          }
          .throne-realm-title { font-size: 13px; }
          .xal-throne-pose8 {
            width: 48vw;
            right: -5vw;
            opacity: 0.5;
          }
          .throne-dock-container {
            bottom: 74px;
            width: 96vw;
          }
          .throne-dock {
            gap: 8px;
            padding: 8px;
          }
          .throne-icon-btn {
            min-width: 78px;
            padding: 6px;
          }
          .dock-icon-img {
            width: 28px;
            height: 28px;
          }
          .dock-icon-title { font-size: 8px; }
          .dock-icon-sub { font-size: 7px; }
          .throne-leave-btn {
            bottom: 16px;
            right: 16px;
            font-size: 9.5px;
            padding: 10px 14px;
          }
          .throne-prev-btn {
            bottom: 16px;
            left: 16px;
          }
        }
      `}</style>
    </div>
  )
}
