import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function OrientationPrompt() {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is a touch/mobile device
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches

      const ua = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)

      const isPortrait = window.innerHeight > window.innerWidth
      const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) <= 920

      // Only trigger if mobile/touch device in portrait mode
      if ((hasTouch || isMobileUA) && isPortrait && isSmallScreen) {
        setIsPortraitMobile(true)
      } else {
        setIsPortraitMobile(false)
      }
    }

    // Initial check
    checkOrientation()

    // Event listeners for window resize & orientation change
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    if (screen?.orientation) {
      screen.orientation.addEventListener('change', checkOrientation)
    }

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
      if (screen?.orientation) {
        screen.orientation.removeEventListener('change', checkOrientation)
      }
    }
  }, [])

  const shouldShow = isPortraitMobile && !dismissed

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="orientation-prompt-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="orientation-backdrop" />

          <motion.div
            className="orientation-card"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Animated Device Rotation Graphic */}
            <div className="rotate-icon-container">
              <div className="device-graphic">
                <div className="device-screen">
                  <span className="screen-rune">⚡</span>
                </div>
              </div>
              <svg
                className="rotate-arrow-svg"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 20,50 A 30,30 0 1,1 80,50"
                  stroke="#FFD700"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
                <polygon points="80,42 90,52 76,58" fill="#FFD700" />
              </svg>
            </div>

            {/* Ancient Decree Header */}
            <span className="orientation-tag">// REALM PERSPECTIVE //</span>
            <h2 className="orientation-title">THE REALM DEMANDS A BROADER HORIZON</h2>

            {/* Lore & Instruction */}
            <p className="orientation-desc">
              Rotate your device into <strong>Landscape Mode</strong> to behold the Underworld in
              full cinematic glory.
            </p>

            <div className="orientation-badge">
              <span className="pulse-dot" />
              <span>ROTATE TO LANDSCAPE</span>
            </div>

            {/* Dismissal Fallback */}
            <button
              className="orientation-dismiss-btn"
              onClick={() => setDismissed(true)}
              aria-label="Continue in Portrait"
            >
              Proceed in portrait anyway →
            </button>
          </motion.div>

          <style>{`
            .orientation-prompt-overlay {
              position: fixed;
              inset: 0;
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              overflow: hidden;
            }

            .orientation-backdrop {
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at 50% 50%, rgba(20, 4, 34, 0.98) 0%, rgba(3, 1, 6, 0.99) 100%);
              backdrop-filter: blur(20px);
            }

            .orientation-card {
              position: relative;
              z-index: 2;
              width: min(380px, 90vw);
              background: rgba(10, 2, 20, 0.92);
              border: 1px solid rgba(212, 175, 55, 0.5);
              border-radius: 12px;
              padding: 32px 24px 24px;
              text-align: center;
              box-shadow: 0 0 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.2);
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            /* Rotating Icon Animation */
            .rotate-icon-container {
              position: relative;
              width: 100px;
              height: 100px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .device-graphic {
              width: 38px;
              height: 60px;
              border: 2.5px solid #FFD700;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(212, 175, 55, 0.1);
              box-shadow: 0 0 16px rgba(212, 175, 55, 0.35);
              animation: rotatePhone 2.6s ease-in-out infinite alternate;
              transform-origin: center center;
            }

            .device-screen {
              font-size: 14px;
              color: #FFD700;
              text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
            }

            .rotate-arrow-svg {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              animation: spinPulse 2.6s ease-in-out infinite;
              pointer-events: none;
            }

            @keyframes rotatePhone {
              0%, 25% {
                transform: rotate(0deg);
                width: 38px;
                height: 60px;
              }
              75%, 100% {
                transform: rotate(90deg);
                width: 38px;
                height: 60px;
              }
            }

            @keyframes spinPulse {
              0% {
                opacity: 0.4;
                transform: scale(0.95);
              }
              50% {
                opacity: 1;
                transform: scale(1.05);
              }
              100% {
                opacity: 0.4;
                transform: scale(0.95);
              }
            }

            .orientation-tag {
              font-family: 'Geist Mono', monospace;
              font-size: 10px;
              letter-spacing: 0.25em;
              color: #c084fc;
              margin-bottom: 8px;
            }

            .orientation-title {
              font-family: 'Cinzel Decorative', serif;
              font-size: 16px;
              font-weight: 700;
              color: #FFD700;
              letter-spacing: 0.08em;
              line-height: 1.4;
              margin: 0 0 12px;
              text-shadow: 0 0 16px rgba(212, 175, 55, 0.4);
            }

            .orientation-desc {
              font-family: 'Cinzel', serif;
              font-size: 13.5px;
              line-height: 1.6;
              color: rgba(235, 225, 250, 0.9);
              margin: 0 0 20px;
            }

            .orientation-desc strong {
              color: #FFD700;
              font-weight: 600;
            }

            .orientation-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid rgba(212, 175, 55, 0.5);
              padding: 8px 16px;
              border-radius: 20px;
              font-family: 'Cinzel', serif;
              font-size: 11px;
              letter-spacing: 0.15em;
              color: #FFD700;
              margin-bottom: 18px;
              box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
            }

            .pulse-dot {
              width: 7px;
              height: 7px;
              background: #22c55e;
              border-radius: 50%;
              box-shadow: 0 0 8px #22c55e;
              animation: blinkDot 1.4s infinite;
            }

            @keyframes blinkDot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(0.8); }
            }

            .orientation-dismiss-btn {
              background: transparent;
              border: none;
              color: rgba(212, 175, 55, 0.6);
              font-family: 'Cinzel', serif;
              font-size: 11px;
              letter-spacing: 0.1em;
              cursor: pointer;
              padding: 6px 12px;
              transition: all 0.2s;
              text-decoration: underline;
              text-underline-offset: 3px;
            }

            .orientation-dismiss-btn:hover {
              color: #FFD700;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
