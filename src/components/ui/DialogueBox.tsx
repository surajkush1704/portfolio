// ============================================================================
// COMPONENT: DialogueBox
// PURPOSE: Dark fantasy styled narration & dialogue overlay for Xal'Vorith
// BEHAVIOR:
//   1. Types out dialogue line with custom typewriter effect.
//   2. Typing can be instantly completed by pressing ANY key or touching/clicking anywhere.
//   3. Next dialogue line ONLY appears when user presses a key or taps/clicks anywhere.
//   4. Fully responsive for desktop, tablet, and mobile with tactile glow aesthetics.
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'

export const TYPEWRITER_SPEED_MS = 33 // ~30 characters per second

export type DialogueState = 'narration' | 'hint' | 'response' | 'idle'

interface DialogueBoxProps {
  speaker: string
  text: string
  state: DialogueState
  visible: boolean
  hintText?: string
  typewriterSpeed?: number
  onTypeComplete?: () => void
  onSkip?: () => void
  variant?: 'realm0' | 'realm1' | 'realm2'
}

// Corner bracket dark fantasy decorative accents
function CornerBrackets() {
  return (
    <>
      <i className="corner tl" /><i className="corner tr" />
      <i className="corner bl" /><i className="corner br" />
    </>
  )
}

export function DialogueBox({
  speaker,
  text,
  state,
  visible,
  hintText = '[ TOUCH THE MONOLITH ]',
  typewriterSpeed = TYPEWRITER_SPEED_MS,
  onTypeComplete,
  onSkip,
  variant = 'realm1',
}: DialogueBoxProps) {
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<number | undefined>(undefined)
  const fullTextRef = useRef('')

  // --------------------------------------------------------------------------
  // INTERACTION HANDLER: Skip typing or advance to next dialogue
  // --------------------------------------------------------------------------
  const handleInteraction = useCallback(() => {
    if (!visible || state === 'idle' || state === 'hint') return

    if (typing) {
      // Step 1: If still typing -> instantly reveal complete current text
      window.clearInterval(timerRef.current)
      setDisplayed(fullTextRef.current)
      setTyping(false)
      onTypeComplete?.()
    } else {
      // Step 2: If already fully revealed -> advance to next dialogue line
      onSkip?.()
    }
  }, [visible, state, typing, onTypeComplete, onSkip])

  // --------------------------------------------------------------------------
  // GLOBAL LISTENERS: Keypress (Desktop) & Touch/Click (Everywhere / Mobile)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!visible) return

    // Desktop: ANY keyboard key advances dialogue (ignores typing inside input fields)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      e.stopPropagation()
      handleInteraction()
    }

    // Touch / Click: Touching anywhere on screen advances dialogue
    const onPointerDown = (e: PointerEvent) => {
      // Avoid intercepting clicks on explicit navigation buttons, moon easter egg, or modal action buttons
      const target = e.target as HTMLElement | null
      if (
        target?.closest('.realm-nav-btn') ||
        target?.closest('.enter') ||
        target?.closest('.modal-content') ||
        target?.closest('.global-audio-toggle') ||
        target?.closest('.moon') ||
        target?.closest('.choice-card') ||
        target?.closest('.user-type-panel') ||
        target?.closest('.throne-icon-btn') ||
        target?.closest('.throne-modal-content')
      ) {
        return
      }
      handleInteraction()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [visible, handleInteraction])

  // --------------------------------------------------------------------------
  // TYPEWRITER EFFECT: Stream characters incrementally
  // --------------------------------------------------------------------------
  useEffect(() => {
    window.clearInterval(timerRef.current)
    indexRef.current = 0
    setDisplayed('')
    setTyping(false)

    if (!visible || state === 'idle' || state === 'hint') return

    fullTextRef.current = text
    setTyping(true)

    timerRef.current = window.setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        window.clearInterval(timerRef.current)
        setTyping(false)
        onTypeComplete?.()
      }
    }, typewriterSpeed)

    return () => window.clearInterval(timerRef.current)
  }, [text, visible, state, typewriterSpeed, onTypeComplete])

  if (!visible) return null

  const isHint = state === 'hint'
  const isIdle = state === 'idle'

  return (
    <motion.section
      className={`dialogue-box dialogue-${variant} ${state}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55 }}
      onClick={handleInteraction}
      style={{ cursor: 'pointer' }}
    >
      <CornerBrackets />

      {/* Speaker Badge */}
      {!isHint && !isIdle && (
        <div className="dialogue-speaker">
          <span className="dialogue-bar" />
          {speaker}
        </div>
      )}

      {/* Main Dialogue Content */}
      <AnimatePresence mode="wait">
        {isHint ? (
          <motion.p
            key="hint"
            className="dialogue-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hintText}
          </motion.p>
        ) : isIdle ? (
          <motion.p key="idle" className="dialogue-idle" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            ···
          </motion.p>
        ) : (
          <div>
            <motion.p
              key={text.slice(0, 12)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {displayed}
              {typing && <span className="dialogue-cursor">▌</span>}
            </motion.p>

            {/* Prompt indicator when line is fully revealed */}
            {!typing && (
              <motion.div
                className="dialogue-advance-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                [ TAP OR PRESS ANY KEY TO CONTINUE ]
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .dialogue-box {
          position: absolute;
          z-index: 30;
          padding: 20px 24px;
          background: rgba(5, 0, 12, 0.92);
          border: 1px solid rgba(212,175,55,0.45);
          box-shadow: 0 0 40px rgba(212,175,55,0.15), 0 0 80px rgba(124,58,237,0.1), inset 0 0 40px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px);
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
          user-select: none;
        }
        .dialogue-realm1 {
          bottom: 80px;
          left: 32px;
          max-width: 540px;
        }
        .dialogue-realm0 {
          right: clamp(28vw, 35vw, 41vw);
          bottom: clamp(8vh, 14vh, 150px);
          width: min(500px, 38vw);
          min-height: 158px;
          border-left: 2px solid rgba(212,175,55,0.85);
          background: linear-gradient(90deg, rgba(4,0,11,0.86), rgba(4,0,11,0.25));
        }
        .dialogue-realm2 {
          bottom: 80px;
          left: 32px;
          max-width: 580px;
        }
        .corner {
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: rgba(212,175,55,0.5);
          border-style: solid;
        }
        .corner.tl { top: 5px; left: 5px; border-width: 1px 0 0 1px; }
        .corner.tr { top: 5px; right: 5px; border-width: 1px 1px 0 0; }
        .corner.bl { bottom: 5px; left: 5px; border-width: 0 0 1px 1px; }
        .corner.br { bottom: 5px; right: 5px; border-width: 0 1px 1px 0; }
        .dialogue-speaker {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          color: #D4AF37;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .dialogue-bar {
          width: 3px;
          height: 20px;
          background: #D4AF37;
          flex-shrink: 0;
        }
        .dialogue-box p {
          margin: 0;
          font-family: 'MedievalSharp', 'Cinzel Decorative', serif !important;
          font-size: 13px !important;
          letter-spacing: 0.04em !important;
          line-height: 1.65 !important;
          color: #f3e9f3 !important;
        }
        .dialogue-advance-prompt {
          margin-top: 10px;
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: rgba(212,175,55,0.75);
          text-transform: uppercase;
          animation: promptPulse 2s ease-in-out infinite;
        }
        .dialogue-hint {
          font-family: 'Cinzel', serif !important;
          font-size: 11px !important;
          letter-spacing: 0.4em !important;
          color: rgba(212,175,55,0.6) !important;
          text-transform: uppercase;
          text-align: center;
          animation: promptPulse 2s ease-in-out infinite;
        }
        .dialogue-cursor {
          animation: blink 0.8s step-end infinite;
          color: rgba(212,175,55,0.7);
        }
        .dialogue-idle {
          text-align: center;
          letter-spacing: 0.5em;
        }
        @keyframes promptPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.95; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @media (max-width: 768px) {
          .dialogue-realm1, .dialogue-realm2 {
            left: 8px;
            right: 8px;
            max-width: none;
            bottom: 72px;
            padding: 14px 16px;
          }
          .dialogue-box p { font-size: 13px; }
          .dialogue-advance-prompt { font-size: 8px; letter-spacing: 0.18em; }
        }
        @media (max-height: 520px) {
          .dialogue-box {
            padding: 8px 14px !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.85) !important;
          }
          .dialogue-realm0 {
            right: 26vw !important;
            bottom: 8px !important;
            width: clamp(280px, 46vw, 440px) !important;
            min-height: auto !important;
          }
          .dialogue-realm1, .dialogue-realm2 {
            bottom: 36px !important;
            left: 12px !important;
            right: auto !important;
            max-width: 440px !important;
            padding: 8px 12px !important;
          }
          .dialogue-speaker {
            margin-bottom: 4px !important;
            font-size: 9px !important;
            gap: 6px !important;
          }
          .dialogue-bar {
            height: 12px !important;
          }
          .dialogue-box p {
            font-size: 11.5px !important;
            line-height: 1.4 !important;
          }
          .dialogue-advance-prompt {
            margin-top: 4px !important;
            font-size: 7.5px !important;
          }
        }
      `}</style>
    </motion.section>
  )
}
