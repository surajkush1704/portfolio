// ============================================================================
// REALM 4: THE THREE PATHS (THE CHRONICLES)
// PURPOSE: Fifth realm where the visitor chooses between 3 diverging pathways:
//   - LEFT PATH  → LinkedIn profile (external link via giant ground left-arrow.png)
//   - CENTER PATH → Xal'Vorith guard / Gateway to Realm 5 (Throne Room)
//   - RIGHT PATH → GitHub profile (external link via giant ground right-arrow.png)
//
// FEATURES:
//   - 500% enlarged ground arrows for LinkedIn and GitHub
//   - Narrow hitbox on center Xal'Vorith character
//   - Dialogue narration reacting to path choices
//   - Unified navigation buttons (← TROPHY HALL, THE THRONE ↗)
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DialogueBox, type DialogueState } from '../../components/ui/DialogueBox'

interface Props {
  onNext: () => void
  onPrev: () => void
  initialFinished?: boolean
}

type RealmPhase =
  | 'opening'
  | 'exploring'
  | 'transitioning'
  | 'both-visited'
  | 'exiting'

type SoundKey =
  | 'lavaAmbient'
  | 'xalAppear'
  | 'pathHoverLeft'
  | 'pathHoverRight'
  | 'portalWhoosh'
  | 'portalOpen'
  | 'bothVisited'
  | 'navArrow'

const PATHS = {
  left: {
    id: 'linkedin',
    label: 'LINKEDIN',
    url: 'https://linkedin.com/in/surajkumar1704',
    hoverDialogue: [
      "The left path leads to The Overlord's chronicle of consistency. One hundred days. Every single day, he documented what he built, what he broke, and what he learned. Publicly. Honestly.",
      'If you need to understand his discipline before his capability — step into his LinkedIn scrolls.',
    ],
    visitedDialogue: [
      'You have seen the chronicles. One hundred days of documented building. You understand now that his consistency is not occasional — it is structural.',
      'The right path (GitHub) awaits if you wish further proof. Or click The Overlord to proceed to the castle.',
    ],
  },
  right: {
    id: 'github',
    label: 'GITHUB',
    url: 'https://github.com/surajkush1704',
    hoverDialogue: [
      "The right path leads to The Overlord's conquered repositories. Every project you witnessed in the Trophy Hall exists there — the code, the commits, the deployment configurations.",
      'Code does not lie, mortal. Repositories do not exaggerate. If you need proof beyond my word — enter his GitHub repository scrolls.',
    ],
    visitedDialogue: [
      'The repositories do not disappoint. Every project, every commit, every incident response. All of it exactly as I described.',
      'You have seen what he builds and the evidence that he built it. Click The Overlord to enter the Throne Room.',
    ],
  },
}

const DIALOGUES = {
  opening: [
    'Ah. You made it this far.',
    'Most mortals who enter this Underworld turn back before reaching these paths. They see the Arsenal and are overwhelmed. They cross the Trophy Hall and feel they have seen enough.',
    'They are wrong. What you have seen is what he has built. What lies beyond these arrows is proof that he continues to build. Every day. Without pause.',
    'Click the Left Arrow (LinkedIn) for his 100 days of AI building, or the Right Arrow (GitHub) for his open-source repositories. I will watch your choice.',
  ],

  afterBothVisited: [
    'Both portals witnessed. You have been thorough, mortal. Most do not bother with both — they take the one that confirms what they already wanted to believe.',
    'You chose to see everything. That is exactly the disposition The Overlord values in the people he works with.',
    'The center path. The castle. The Throne Room. He is waiting. Click the center path or The Overlord to enter.',
  ],

  proceedToThrone: ['Follow the center path, mortal. I will meet you there.'],
}

const DIALOGUE_PAUSES: Record<string, number> = {
  opening_0: 1400,
  opening_1: 1200,
  opening_2: 1000,
  opening_3: 800,
  afterBothVisited_0: 1000,
  afterBothVisited_1: 800,
  afterBothVisited_2: 800,
  default: 800,
}

const audioConfig: Record<SoundKey, { file: string; loop?: boolean; volume: number }> = {
  lavaAmbient: { file: 'lava-ambient.mp3', loop: true, volume: 0.3 },
  xalAppear: { file: 'xal-appear.mp3', volume: 0.5 },
  pathHoverLeft: { file: 'hop-whoosh.mp3', volume: 0.35 },
  pathHoverRight: { file: 'hop-whoosh.mp3', volume: 0.35 },
  portalWhoosh: { file: 'heat-flash.mp3', volume: 0.6 },
  portalOpen: { file: 'door-open.mp3', volume: 0.5 },
  bothVisited: { file: 'clap-sound.mp3', volume: 0.6 },
  navArrow: { file: 'nav-arrow.mp3', volume: 0.5 },
}

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Geist+Mono:wght@400;700&display=swap');

  .realm4 {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    background: #030104;
    color: #eee4ee;
  }

  .r4-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: url('/images/relam4-bg1.png');
    background-size: cover;
    background-position: center top;
    background-repeat: no-repeat;
    will-change: transform;
  }

  .r4-lava-glow {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(0deg, rgba(255,50,0,0.2) 0%, rgba(255,20,0,0.06) 25%, transparent 60%);
    animation: r4LavaPulse 3.5s ease-in-out infinite;
  }
  @keyframes r4LavaPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .flash-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 25;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 35%, rgba(3,0,4,0.85) 100%);
  }

  /* Center Path Click Zone for Throne Room */
  .center-path-hitbox {
    position: absolute;
    left: 38%;
    width: 24%;
    top: 0;
    height: 100%;
    z-index: 6;
    cursor: pointer;
  }

  .xal-r4-container {
    position: absolute;
    bottom: 2vh;
    left: 36%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    pointer-events: none;
  }

  /* Hitbox centered on Xal'Vorith */
  .xal-r4-hitbox {
    position: relative;
    width: clamp(300px, 30vw, 500px);
    max-height: 76vh;
    cursor: pointer;
    pointer-events: auto;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }

  .xal-r4-img {
    width: clamp(320px, 32vw, 540px);
    max-height: 76vh;
    object-fit: contain;
    filter: drop-shadow(0 18px 16px rgba(0,0,0,0.9)) drop-shadow(0 0 25px rgba(212,175,55,0.45));
    animation: xalR4Float 6.5s ease-in-out infinite;
    transition: transform 0.5s ease, opacity 1.0s ease, filter 0.3s ease;
    pointer-events: none; /* Image element relies on hitbox container */
  }
  .xal-r4-hitbox:hover .xal-r4-img {
    filter: drop-shadow(0 14px 14px rgba(0,0,0,0.9)) drop-shadow(0 0 25px rgba(212,175,55,0.7));
  }

  @keyframes xalR4Float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  /* Top Left Dialogue Box Container Wrapper */
  .r4-dialogue-wrapper {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 45;
    width: 460px;
    max-width: calc(100vw - 48px);
    pointer-events: auto;
  }
  .r4-dialogue-wrapper .dialogue-box {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    bottom: auto !important;
    right: auto !important;
    transform: none !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Ground-Stuck Arrow Link Gateways (Left = LinkedIn, Right = GitHub) */
  .ground-arrow {
    position: absolute;
    bottom: -10px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    pointer-events: none;
  }
  .ground-arrow.left-ground-arrow {
    left: 14vw;
  }
  .ground-arrow.right-ground-arrow {
    right: 14vw;
  }
  .ground-arrow-img-wrapper {
    cursor: pointer;
    pointer-events: auto; /* Click impact point ONLY on the arrow image */
    display: inline-block;
  }
  .ground-arrow img {
    width: clamp(240px, 24vw, 380px);
    height: auto;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.95)) drop-shadow(0 0 16px rgba(212,175,55,0.4));
    transform: translateY(0);
    transition: transform 0.35s ease, filter 0.35s ease;
  }
  .ground-arrow-img-wrapper:hover img {
    transform: translateY(-12px) scale(1.06);
    filter: drop-shadow(0 16px 28px rgba(0,0,0,0.95)) drop-shadow(0 0 32px rgba(212,175,55,0.95));
  }
  .ground-arrow-label {
    font-family: 'Cinzel Decorative', serif;
    font-size: 11px;
    letter-spacing: 0.22em;
    color: #D4AF37;
    text-shadow: 0 2px 8px #000;
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
    margin-top: -6px;
  }
  .visited-indicator {
    font-family: 'Geist Mono', monospace;
    font-size: 9px;
    color: #22C55E;
    letter-spacing: 0.15em;
  }

  /* Return to Trophy Hall Button */
  .retreat-btn {
    position: absolute;
    bottom: 18px;
    left: 24px;
    z-index: 55;
    padding: 8px 14px;
    background: rgba(4, 0, 10, 0.85);
    border: 1px solid rgba(212,175,55,0.3);
    color: rgba(212,175,55,0.7);
    font-family: 'Cinzel', serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 3px;
    backdrop-filter: blur(8px);
    transition: all 0.25s ease;
  }
  .retreat-btn:hover {
    background: rgba(212,175,55,0.15);
    border-color: #D4AF37;
    color: #FFD700;
  }

  @media (max-width: 1024px) {
    .ground-arrow img { width: 220px; }
  }
  @media (max-width: 768px) {
    .ground-arrow.left-ground-arrow { left: 4vw; }
    .ground-arrow.right-ground-arrow { right: 4vw; }
    .ground-arrow img { width: 170px; }
    .xal-r4-hitbox { width: 110px; }
    .r4-dialogue-wrapper {
      top: 12px;
      left: 12px;
      right: 12px;
      width: auto;
      max-width: calc(100vw - 24px);
    }
    .retreat-btn { bottom: 12px; left: 12px; font-size: 8px; padding: 6px 10px; }
  }
  @media (max-height: 520px) {
    .ground-arrow { bottom: 4vh !important; }
    .ground-arrow.left-ground-arrow { left: 8vw !important; }
    .ground-arrow.right-ground-arrow { right: 8vw !important; }
    .ground-arrow img { width: clamp(110px, 16vw, 160px) !important; }
    .xal-r4-container {
      height: 78vh !important;
      width: clamp(180px, 24vw, 300px) !important;
      left: 36% !important;
      bottom: 0 !important;
    }
    .r4-dialogue-wrapper {
      top: 8px !important;
      left: 10px !important;
      max-width: 420px !important;
    }
  }
`

export default function Realm4Chronicles({ onNext, onPrev, initialFinished }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const timeouts = useRef<number[]>([])
  const sounds = useRef<Partial<Record<SoundKey, Howl>>>({})

  const [phase, setPhase] = useState<RealmPhase>(initialFinished ? 'exploring' : 'opening')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [dialogueText, setDialogueText] = useState('')
  const [dialogueState, setDialogueState] = useState<DialogueState>('idle')
  const [dialogueVisible, setDialogueVisible] = useState(false)
  const [linkedinVisited, setLinkedinVisited] = useState(false)
  const [githubVisited, setGithubVisited] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [xalVisible, setXalVisible] = useState(false)
  const [xalRotation, setXalRotation] = useState(0)
  const [flashColor, setFlashColor] = useState('rgba(59,130,246,0.4)')
  const [mobile, setMobile] = useState(window.innerWidth < 768)

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeouts.current.push(id)
    return id
  }, [])

  const play = useCallback((name: SoundKey) => {
    const cfg = audioConfig[name]
    const sound = sounds.current[name] ??= new Howl({
      src: [`/audio/${cfg.file}`],
      loop: cfg.loop ?? false,
      volume: cfg.volume,
    })
    sound.play()
  }, [])

  const fadeAllAudio = useCallback((duration = 600) => {
    Object.values(sounds.current).forEach(s => s?.fade(s.volume(), 0, duration))
    addTimeout(() => Object.values(sounds.current).forEach(s => s?.stop()), duration)
  }, [addTimeout])

  // Parallax effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (mobile) return
    targetMouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    }
  }, [mobile])

  useEffect(() => {
    if (mobile) return
    window.addEventListener('mousemove', handleMouseMove)

    const loop = () => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05
      setParallax({ x: mouseRef.current.x, y: mouseRef.current.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mobile, handleMouseMove])

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Entrance Sequence
  useEffect(() => {
    play('lavaAmbient')

    if (initialFinished) {
      setXalVisible(false) // Slave vanishes when room finished
      return
    }

    // 1000ms: Xal'Vorith fades in
    addTimeout(() => {
      setXalVisible(true)
      play('xalAppear')
    }, 1000)

    // 1500ms: Dialogue starts opening lines
    addTimeout(() => {
      setDialogueVisible(true)
      setDialogueState('narration')
      setDialogueText(DIALOGUES.opening[0])
      setCurrentLineIndex(0)
    }, 1500)

    return () => {
      fadeAllAudio()
      timeouts.current.forEach(clearTimeout)
      cancelAnimationFrame(rafRef.current)
      Object.values(sounds.current).forEach(s => s?.stop())
    }
  }, [play, fadeAllAudio, addTimeout, initialFinished])

  // Advance dialogue logic
  const advanceOpeningDialogue = useCallback(() => {
    if (currentLineIndex >= DIALOGUES.opening.length - 1) {
      setDialogueVisible(false)
      addTimeout(() => {
        setPhase('exploring')
      }, 500)
      return
    }

    const nextIndex = currentLineIndex + 1
    setCurrentLineIndex(nextIndex)

    const pauseMs = DIALOGUE_PAUSES[`opening_${currentLineIndex}`] ?? DIALOGUE_PAUSES.default
    addTimeout(() => {
      setDialogueText(DIALOGUES.opening[nextIndex])
    }, pauseMs)
  }, [currentLineIndex, addTimeout])

  const advanceBothVisitedDialogue = useCallback(() => {
    if (currentLineIndex >= DIALOGUES.afterBothVisited.length - 1) {
      addTimeout(() => {
        play('bothVisited')
        // Crucial requirement: slave vanishes when both paths visited and gate to castle opens
        setXalVisible(false)
      }, 600)
      return
    }

    const nextIndex = currentLineIndex + 1
    setCurrentLineIndex(nextIndex)

    const pauseMs = DIALOGUE_PAUSES[`afterBothVisited_${currentLineIndex}`] ?? DIALOGUE_PAUSES.default
    addTimeout(() => {
      setDialogueText(DIALOGUES.afterBothVisited[nextIndex])
    }, pauseMs)
  }, [currentLineIndex, addTimeout, play])

  const handleDialogueComplete = useCallback(() => {
    if (phase === 'opening') {
      advanceOpeningDialogue()
    } else if (phase === 'both-visited') {
      advanceBothVisitedDialogue()
    }
  }, [phase, advanceOpeningDialogue, advanceBothVisitedDialogue])

  // Check if both visited
  const checkBothVisited = useCallback((visitedL: boolean, visitedG: boolean) => {
    if (visitedL && visitedG) {
      addTimeout(() => {
        setPhase('both-visited')
        setCurrentLineIndex(0)
        setDialogueVisible(true)
        setDialogueState('narration')
        setDialogueText(DIALOGUES.afterBothVisited[0])
      }, 1200)
    }
  }, [addTimeout])

  // Flash overlay trigger
  const triggerFlash = useCallback((color: string) => {
    setFlashColor(color)
    const flashEl = flashRef.current
    if (flashEl) {
      flashEl.style.opacity = '0.5'
      addTimeout(() => {
        flashEl.style.opacity = '0'
      }, 400)
    }
  }, [addTimeout])

  // Gateway 1: Left Arrow -> LinkedIn
  const handleLeftArrowLinkedInClick = useCallback(() => {
    if (phase === 'opening' || phase === 'exiting') return

    play('portalWhoosh')
    play('portalOpen')
    triggerFlash('rgba(59,130,246,0.5)')
    setXalRotation(-2)

    window.open(PATHS.left.url, '_blank')
    setLinkedinVisited(true)
    setPhase('transitioning')

    const newGVisited = githubVisited
    addTimeout(() => {
      setDialogueVisible(true)
      setDialogueState('narration')
      if (newGVisited) {
        checkBothVisited(true, true)
      } else {
        setDialogueText(PATHS.left.visitedDialogue[0])
        setPhase('exploring')
      }
    }, 600)
  }, [phase, githubVisited, play, triggerFlash, addTimeout, checkBothVisited])

  // Gateway 2: Right Arrow -> GitHub
  const handleRightArrowGitHubClick = useCallback(() => {
    if (phase === 'opening' || phase === 'exiting') return

    play('portalWhoosh')
    play('portalOpen')
    triggerFlash('rgba(34,197,94,0.5)')
    setXalRotation(2)

    window.open(PATHS.right.url, '_blank')
    setGithubVisited(true)
    setPhase('transitioning')

    const newLVisited = linkedinVisited
    addTimeout(() => {
      setDialogueVisible(true)
      setDialogueState('narration')
      if (newLVisited) {
        checkBothVisited(true, true)
      } else {
        setDialogueText(PATHS.right.visitedDialogue[0])
        setPhase('exploring')
      }
    }, 600)
  }, [phase, linkedinVisited, play, triggerFlash, addTimeout, checkBothVisited])

  // Gateway 3: Center Path / Character Click -> Proceed to Throne Room (Realm 5)
  const handleProceedToThrone = useCallback(() => {
    if (phase === 'exiting') return
    setPhase('exiting')
    play('navArrow')

    setDialogueVisible(true)
    setDialogueState('narration')
    setDialogueText(DIALOGUES.proceedToThrone[0])

    const container = containerRef.current
    if (container) {
      gsap.to(container, { opacity: 0, duration: 1.0, ease: 'power2.inOut', onComplete: () => onNext() })
    } else {
      addTimeout(() => onNext(), 1000)
    }
  }, [phase, play, addTimeout, onNext])

  // Click handler for Xal'Vorith character or center path
  const handleCharacterOrCenterClick = useCallback(() => {
    if (phase === 'opening' || phase === 'exiting') return

    if (linkedinVisited && githubVisited) {
      handleProceedToThrone()
      return
    }

    // Nudge dialogue if both not visited yet
    setDialogueVisible(true)
    setDialogueState('narration')
    setDialogueText(
      'The Overlord would want you to have seen everything first, mortal. Click the Left Arrow (LinkedIn) and Right Arrow (GitHub) to witness his evidence.'
    )
    play('pathHoverLeft')
  }, [phase, linkedinVisited, githubVisited, handleProceedToThrone, play])

  const handlePrevRealm = useCallback(() => {
    fadeAllAudio()
    addTimeout(() => onPrev(), 500)
  }, [fadeAllAudio, onPrev, addTimeout])

  const bgTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -12}px, ${parallax.y * -8}px)`,
  }

  const xalTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -5}px, ${parallax.y * -3}px) rotate(${xalRotation}deg)`,
  }

  return (
    <div ref={containerRef} className="realm4">
      <style>{GLOBAL_STYLES}</style>

      {/* Background Image (relam4-bg1.png — uncropped top) */}
      <div ref={bgRef} className="r4-bg" style={bgTransform} />

      {/* Layer 1 — Volcanic Lava Glow */}
      <div className="r4-lava-glow" />

      {/* Flash Overlay */}
      <div ref={flashRef} className="flash-overlay" style={{ background: flashColor }} />

      {/* Center Path Hit Box for Throne Room */}
      <div
        className="center-path-hitbox"
        onClick={handleCharacterOrCenterClick}
        aria-label="Center Path to Castle"
      />

      {/* Layer 20 — Xal'Vorith Character on Center Path (Strict tight impact point centered on body) */}
      <AnimatePresence>
        {xalVisible && (
          <motion.div
            className="xal-r4-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Reduced width hitbox: clicks only register when clicking directly on Xal'Vorith's torso */}
            <div
              className="xal-r4-hitbox"
              onClick={handleCharacterOrCenterClick}
              role="button"
              tabIndex={0}
              aria-label="Speak to Xal'Vorith / Enter Castle"
            >
              <img
                className="xal-r4-img"
                src="/images/xalvorith-pose7.png"
                alt="Xal'Vorith"
                draggable={false}
                style={xalTransform}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 25 — Vignette */}
      <div className="vignette" />

      {/* Layer 45 — Top Left Dialogue Box Container */}
      {dialogueVisible && (
        <div className="r4-dialogue-wrapper">
          <DialogueBox
            speaker="Xal'Vorith — The Crowned Slave of the Endless One"
            text={dialogueText}
            state={dialogueState}
            visible={dialogueVisible}
            onTypeComplete={handleDialogueComplete}
            onSkip={handleDialogueComplete}
            variant="realm1"
            typewriterSpeed={33}
          />
        </div>
      )}

      {/* Layer 50 — Ground Arrow Gateways (Left = LinkedIn Gateway, Right = GitHub Gateway) */}
      <motion.div
        className="ground-arrow left-ground-arrow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div
          className="ground-arrow-img-wrapper"
          onClick={handleLeftArrowLinkedInClick}
          role="button"
          tabIndex={0}
          aria-label="Open LinkedIn Profile"
        >
          <img src="/images/left-arrow.png" alt="LinkedIn Signpost" />
        </div>
      </motion.div>

      <motion.div
        className="ground-arrow right-ground-arrow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div
          className="ground-arrow-img-wrapper"
          onClick={handleRightArrowGitHubClick}
          role="button"
          tabIndex={0}
          aria-label="Open GitHub Profile"
        >
          <img src="/images/right-arrow.png" alt="GitHub Signpost" />
        </div>
      </motion.div>

      {/* Return to Trophy Hall (Realm 3) button */}
      <button
        className="realm-nav-btn prev-btn"
        onClick={handlePrevRealm}
        aria-label="Return to Trophy Hall"
      >
        ← TROPHY HALL
      </button>

      {/* Proceed to The Throne (Realm 5) button */}
      {(linkedinVisited && githubVisited || initialFinished) && (
        <button
          className="realm-nav-btn next-btn"
          onClick={handleProceedToThrone}
          aria-label="Proceed to Throne Room"
        >
          THE THRONE ↗
        </button>
      )}
    </div>
  )
}
