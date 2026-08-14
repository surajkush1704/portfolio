import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'

export const TYPEWRITER_SPEED_MS = 33  // 30 chars per second

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
  const completedRef = useRef(false)
  const fullTextRef = useRef('')

  const handleSkip = useCallback(() => {
    if (typing) {
      window.clearInterval(timerRef.current)
      setDisplayed(fullTextRef.current)
      setTyping(false)
      if (!completedRef.current) {
        completedRef.current = true
        onTypeComplete?.()
      }
    } else {
      onSkip?.()
    }
  }, [typing, onTypeComplete, onSkip])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        handleSkip()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [visible, handleSkip])

  useEffect(() => {
    window.clearInterval(timerRef.current)
    indexRef.current = 0
    completedRef.current = false
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
        if (!completedRef.current) {
          completedRef.current = true
          onTypeComplete?.()
        }
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
    >
      <CornerBrackets />
      {!isHint && !isIdle && (
        <div className="dialogue-speaker">
          <span className="dialogue-bar" />
          {speaker}
        </div>
      )}
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
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
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
        }
      `}</style>
    </motion.section>
  )
}
