import { motion } from 'framer-motion'

interface NavigationArrowProps {
  direction: 'left' | 'right'
  onClick: () => void
  visible: boolean
  label?: string
}

export function NavigationArrow({ direction, onClick, visible, label }: NavigationArrowProps) {
  if (!visible) return null

  const isRight = direction === 'right'

  return (
    <motion.button
      className={`nav-arrow nav-arrow-${direction}`}
      onClick={onClick}
      aria-label={isRight ? 'Next realm' : 'Previous realm'}
      initial={{ opacity: 0, x: isRight ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 100 100" width="80" height="80" aria-hidden="true">
        <circle cx="50" cy="50" r="44" fill="rgba(212,175,55,0.04)" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" />
        <path
          d={isRight ? 'M42 32 L62 50 L42 68' : 'M58 32 L38 50 L58 68'}
          stroke="rgba(212,175,55,0.7)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path className="wisp wisp1" d="M30 38 Q22 28 14 22" stroke="rgba(212,175,55,0.25)" strokeWidth="1" fill="none" />
        <path className="wisp wisp2" d="M70 62 Q78 72 86 78" stroke="rgba(212,175,55,0.25)" strokeWidth="1" fill="none" />
        <path className="wisp wisp3" d="M50 18 Q58 10 66 6" stroke="rgba(212,175,55,0.25)" strokeWidth="1" fill="none" />
      </svg>
      {label && <span className="nav-arrow-label">{label}</span>}
      <style>{`
        .nav-arrow {
          position: absolute;
          bottom: 32px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          animation: arrowPulse 2.5s ease-in-out infinite;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .nav-arrow-right { right: 32px; }
        .nav-arrow-left { left: 32px; }
        .nav-arrow:hover {
          transform: scale(1.15);
          filter: drop-shadow(0 0 20px rgba(212,175,55,0.4));
        }
        .nav-arrow:hover .wisp { animation-duration: 1s !important; }
        .nav-arrow:active { transform: scale(0.95); }
        .nav-arrow-label {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          color: rgba(212,175,55,0.35);
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
        .wisp { animation: smokeWisp 2.5s ease-out infinite; }
        .wisp1 { animation-duration: 2s; animation-delay: 0s; }
        .wisp2 { animation-duration: 2.5s; animation-delay: 0.4s; }
        .wisp3 { animation-duration: 3s; animation-delay: 0.8s; }
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes smokeWisp {
          0% { opacity: 0.4; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.15; transform: translate(4px, -6px) scale(1.1); }
          100% { opacity: 0; transform: translate(8px, -12px) scale(0.8); }
        }
        @media (max-width: 768px) {
          .nav-arrow { bottom: 16px; }
          .nav-arrow-right { right: 16px; }
          .nav-arrow-left { left: 16px; }
          .nav-arrow svg { width: 60px; height: 60px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .nav-arrow svg { width: 70px; height: 70px; }
        }
      `}</style>
    </motion.button>
  )
}
