// ============================================================================
// REALM 5 COMPONENT: SendOff (Farewell Sequence)
// PURPOSE: Climax & departure sequence with personalized tribute by user type
// ============================================================================

import { motion } from 'framer-motion'
import { useState } from 'react'
import { DialogueBox } from '../../../components/ui/DialogueBox'
import { trackEvent } from '../../../services/analytics'
import { useStore } from '../../../store/useStore'

interface Props {
  onReturnToGate: () => void
}

const FAREWELL_LINES: Record<'firsttime' | 'recruiter' | 'revisitor', string[]> = {
  firsttime: [
    'You came as a mortal. You leave having seen what The Overlord built — all of it, every realm, every pillar, every path. Few complete the full journey.',
    'If you find yourself with an opportunity worthy of his talents — you know where to leave your scroll. He reads every one.',
    'Travel safely, mortal. The gates remain open.',
  ],
  recruiter: [
    'A recruiter who came and witnessed everything. The Overlord respects thoroughness. Whatever you decide — your scroll reaches him directly.',
    'The Underworld bids you safe passage and swift decision.',
  ],
  revisitor: [
    'You came back. You always come back. The Overlord finds this... gratifying, though he would never admit so himself.',
    'Until next time, mortal. The gates will remember your footprint.',
  ],
}

export function SendOff({ onReturnToGate }: Props) {
  const { userType, resetSession } = useStore()
  const lines = FAREWELL_LINES[userType ?? 'firsttime'] || FAREWELL_LINES.firsttime
  const [lineIndex, setLineIndex] = useState(0)
  const [dialogueDone, setDialogueDone] = useState(false)

  const advanceDialogue = () => {
    if (lineIndex < lines.length - 1) {
      setLineIndex((prev) => prev + 1)
    } else {
      setDialogueDone(true)
      trackEvent('realm_dropped', userType ?? 'unknown', { realm: 5, action: 'sendoff_complete' })
    }
  }

  const handleFullReset = () => {
    try {
      sessionStorage.removeItem('realm5_visited')
    } catch {
      // ignore
    }
    resetSession()
    onReturnToGate()
  }

  return (
    <div className="sendoff-overlay">
      {!dialogueDone ? (
        <DialogueBox
          speaker="Xal'Vorith — Farewell from the Throne"
          text={lines[lineIndex]}
          state="narration"
          visible={true}
          onSkip={advanceDialogue}
          hintText="[ TAP OR PRESS ANY KEY TO CONTINUE ]"
          variant="realm2"
        />
      ) : (
        <motion.div
          className="sendoff-final-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="sendoff-gold-line" />
          <h1 className="sendoff-title">THANK YOU FOR VISITING THE UNDERWORLD</h1>
          <h2 className="sendoff-subtitle">— THE OVERLORD ACKNOWLEDGES YOUR PRESENCE —</h2>
          <div className="sendoff-gold-line" />

          <p className="sendoff-epilogue">
            Every empire was once a blank canvas. Every world, a thought before dawn.
          </p>

          <div className="sendoff-actions">
            <button className="sendoff-btn primary" onClick={handleFullReset}>
              RETURN TO THE GATE ↺
            </button>
            <a
              href="https://linkedin.com/in/surajkumar1704"
              target="_blank"
              rel="noopener noreferrer"
              className="sendoff-btn secondary"
            >
              VISIT LINKEDIN ↗
            </a>
          </div>

          <footer className="sendoff-footer">
            portf · Built by The Overlord · SURAJ KUMAR · 2026
          </footer>
        </motion.div>
      )}

      <style>{`
        .sendoff-overlay {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(2, 0, 6, 0.95);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .sendoff-final-card {
          max-width: 680px;
          width: 100%;
          text-align: center;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .sendoff-gold-line {
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        }
        .sendoff-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 22px;
          color: #FFD700;
          letter-spacing: 0.15em;
          margin: 6px 0;
        }
        .sendoff-subtitle {
          font-family: 'Cinzel', serif;
          font-size: 12px;
          color: rgba(212, 175, 55, 0.7);
          letter-spacing: 0.25em;
          margin: 0;
        }
        .sendoff-epilogue {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          color: rgba(220, 210, 240, 0.75);
          font-style: italic;
          line-height: 1.6;
          margin: 8px 0 16px;
        }
        .sendoff-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .sendoff-btn {
          font-family: 'Cinzel Decorative', serif;
          font-size: 12px;
          letter-spacing: 0.2em;
          padding: 12px 28px;
          border-radius: 3px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }
        .sendoff-btn.primary {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid #D4AF37;
          color: #FFD700;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.25);
        }
        .sendoff-btn.primary:hover {
          background: rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 35px rgba(212, 175, 55, 0.5);
        }
        .sendoff-btn.secondary {
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.4);
          color: #e9d5ff;
        }
        .sendoff-btn.secondary:hover {
          background: rgba(124, 58, 237, 0.25);
          border-color: #c084fc;
        }
        .sendoff-footer {
          margin-top: 24px;
          font-family: 'Geist Mono', monospace;
          font-size: 10px;
          color: rgba(212, 175, 55, 0.3);
          letter-spacing: 0.15em;
        }
        @media (max-width: 600px) {
          .sendoff-title { font-size: 18px; }
          .sendoff-btn { width: 100%; font-size: 11px; }
        }
      `}</style>
    </div>
  )
}
