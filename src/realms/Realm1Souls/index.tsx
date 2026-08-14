import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DialogueBox } from '../../components/ui/DialogueBox'
import type { DialogueState } from '../../components/ui/DialogueBox'
import { NavigationArrow } from '../../components/ui/NavigationArrow'
import { ParticleScene } from '../../components/three/ParticleScene'

interface Props {
  onNext: () => void
  onPrev: () => void
  initialFinished?: boolean
}

type Phase = 'arrival' | 'shake' | 'transition' | 'monolith' | 'dialogue' | 'interactive'
type SoundKey = 'hall' | 'rumble' | 'bgTransition' | 'monolithAppear' | 'monolithIdle' | 'infoReveal' | 'soulDust' | 'nav'

const DIALOGUE_1 =
  "I have served warlords. Advised fallen gods. Counselled the architects of apocalypse. None of them — not one — built the way The Overlord builds. He emerged from a place mortals call Pondicherry University, wielding nothing but curiosity and an unreasonable refusal to stop. That was enough. It was more than enough."

const DIALOGUE_2 =
  'That monolith before you is not mere stone, mortal. It is a record. Carved by forces older than language. Every word on its face was earned — not claimed. Approach it. Touch it. Learn who built this world.'

const RESPONSE =
  "Behold, mortal. The Overlord's record. Read it carefully. Most who seek such knowledge never earn the right to witness it."

const INFO_LINES = [
  { label: 'NAME', value: 'Suraj Kumar' },
  { label: 'TITLE', value: 'Architect of GenAI // MCA Final Year' },
  { label: 'ORIGIN', value: 'Pondicherry University — May 2026' },
  { label: 'DOMAIN', value: 'GenAI Engineering // AI Product Building' },
  { label: 'NATURE', value: 'AI-Native Builder // Vibe Coder' },
  { label: 'STATUS', value: 'Available for Remote Dominion — Immediately', special: 'status' as const },
  { label: 'TRIBUTE', value: '₹40,000/month' },
  { label: 'CONTACT', value: 'surajkush1704@gmail.com', special: 'contact' as const },
]

const audioMap: Record<SoundKey, { file: string; loop?: boolean; volume: number }> = {
  hall: { file: 'hall-ambience.mp3', loop: true, volume: 0.3 },
  rumble: { file: 'earth-rumble.mp3', volume: 0.8 },
  bgTransition: { file: 'bg-transition.mp3', volume: 0.5 },
  monolithAppear: { file: 'monolith-appear.mp3', volume: 0.7 },
  monolithIdle: { file: 'monolith-idle.mp3', loop: true, volume: 0.1 },
  infoReveal: { file: 'info-reveal.mp3', volume: 0.6 },
  soulDust: { file: 'soul-dust.mp3', loop: true, volume: 0.08 },
  nav: { file: 'gate-slam.mp3', volume: 0.5 },
}

function CornerBrackets() {
  return (
    <>
      <i className="ib tl" /><i className="ib tr" />
      <i className="ib bl" /><i className="ib br" />
    </>
  )
}

export default function Realm1Souls({ onNext, onPrev: _onPrev, initialFinished }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const monolithRef = useRef<HTMLButtonElement>(null)
  const burstRef = useRef<HTMLDivElement>(null)
  const bg1Ref = useRef<HTMLDivElement>(null)
  const bg2Ref = useRef<HTMLDivElement>(null)
  const xalRef = useRef<HTMLImageElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const timeouts = useRef<number[]>([])
  const sounds = useRef<Partial<Record<SoundKey, Howl>>>({})
  const phaseRef = useRef<Phase>('arrival')
  const triggeredRef = useRef(false)

  const [phase, setPhase] = useState<Phase>('arrival')
  const [bg1Opacity, setBg1Opacity] = useState(0)
  const [bg2Visible, setBg2Visible] = useState(false)
  const [monolithVisible, setMonolithVisible] = useState(false)
  const [xalVisible, setXalVisible] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dialogueText, setDialogueText] = useState('')
  const [dialogueState, setDialogueState] = useState<DialogueState>('idle')
  const [dialogueVisible, setDialogueVisible] = useState(false)
  const [infoBoxOpen, setInfoBoxOpen] = useState(false)
  const [navArrowVisible, setNavArrowVisible] = useState(false)
  const [monolithIdle, setMonolithIdle] = useState(false)
  const [dialogueActive, setDialogueActive] = useState(false)
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState(false)

  phaseRef.current = phase

  // If this realm was completed previously, restore the finished state
  useEffect(() => {
    if (!initialFinished) return
    setPhase('interactive')
    setMonolithVisible(true)
    setXalVisible(true)
    setDialogueVisible(false)
    setDialogueActive(false)
    setNavArrowVisible(true)
    setMonolithIdle(true)
    setBg2Visible(true)
    setBg1Opacity(0)
  }, [initialFinished])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeouts.current.push(id)
    return id
  }, [])

  const play = useCallback((name: SoundKey) => {
    const cfg = audioMap[name]
    const sound = sounds.current[name] ??= new Howl({
      src: [`/audio/${cfg.file}`],
      loop: cfg.loop ?? false,
      volume: cfg.volume,
    })
    sound.play()
  }, [])

  const fadeAllAudio = useCallback((duration = 800) => {
    Object.values(sounds.current).forEach(s => s?.fade(s.volume(), 0, duration))
    addTimeout(() => Object.values(sounds.current).forEach(s => s?.stop()), duration)
  }, [addTimeout])

  const runShake = useCallback(() => {
    const container = containerRef.current
    const flash = flashRef.current
    const bg1 = bg1Ref.current
    if (!container) return

    play('rumble')

    gsap.to(bg1, { filter: 'brightness(1.3)', duration: 0.15, yoyo: true, repeat: 1 })

    if (flash) {
      gsap.timeline()
        .to(flash, { opacity: 0.4, duration: 0.05 })
        .to(flash, { opacity: 0, duration: 0.1 })
    }

    gsap.timeline()
      .to(container, { x: -18, duration: 0.06, ease: 'power2.out' })
      .to(container, { x: 22, duration: 0.05, ease: 'power2.inOut' })
      .to(container, { x: -25, duration: 0.06, ease: 'power2.inOut' })
      .to(container, { x: 20, y: -8, duration: 0.05, ease: 'power2.inOut' })
      .to(container, { x: -15, y: 12, duration: 0.05, ease: 'power2.inOut' })
      .to(container, { x: 18, y: -6, duration: 0.06, ease: 'power2.inOut' })
      .to(container, { x: -10, y: 4, duration: 0.05, ease: 'power2.inOut' })
      .to(container, { x: 8, y: -3, duration: 0.05, ease: 'power2.inOut' })
      .to(container, { x: -5, y: 2, duration: 0.06, ease: 'power2.out' })
      .to(container, { x: 0, y: 0, duration: 0.08, ease: 'power2.out', onComplete: () => {
        setPhase('transition')
        setBg2Visible(true)
        play('bgTransition')
        gsap.to(bg1Ref.current, { opacity: 0, duration: 1 })
        gsap.to(bg2Ref.current, { opacity: 1, duration: 1 })
        setMonolithVisible(true)
        setPhase('monolith')

        const mono = monolithRef.current
        const burst = burstRef.current
        if (mono) {
          gsap.set(mono, { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0, scale: 0.85, filter: 'brightness(3) blur(8px)' })
          gsap.to(mono, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.out' })
          gsap.to(mono, { opacity: 1, duration: 0.8 })
          gsap.to(mono, { filter: 'brightness(1) blur(0px)', duration: 1 })
          gsap.to(mono, { scale: 1, duration: 1.2, ease: 'back.out(1.2)' })
        }
        if (burst) {
          gsap.fromTo(burst, { scale: 0, opacity: 1 }, { scale: 3, opacity: 0, duration: 0.8, ease: 'power2.out' })
        }
        play('monolithAppear')

        addTimeout(() => {
          setXalVisible(true)
          play('monolithIdle')
          addTimeout(() => {
            setPhase('dialogue')
            setDialogueVisible(true)
            setDialogueActive(true)
            setDialogueState('narration')
            setDialogueText(DIALOGUE_1)
          }, 700)
        }, 300)
      }})
  }, [play, addTimeout])

  const triggerPhaseB = useCallback(() => {
    if (triggeredRef.current || phaseRef.current !== 'arrival') return
    triggeredRef.current = true
    setShowPrompt(false)
    setPhase('shake')
    runShake()
  }, [runShake])

  const onDialogue1Complete = useCallback(() => {
    addTimeout(() => {
      setDialogueText(DIALOGUE_2)
    }, 1500)
  }, [addTimeout])

  const onDialogue2Complete = useCallback(() => {
    addTimeout(() => {
      setDialogueState('hint')
      setMonolithIdle(true)
    }, 800)
  }, [addTimeout])

  const handleMonolithClick = useCallback(() => {
    if (infoBoxOpen) return
    play('infoReveal')
    setInfoBoxOpen(true)
    setDialogueState('response')
    setDialogueText(RESPONSE)
    setDialogueActive(true)

    const mono = monolithRef.current
    if (mono) {
      gsap.to(mono, { filter: 'brightness(4)', duration: 0.05, yoyo: true, repeat: 1 })
    }

    addTimeout(() => setNavArrowVisible(true), 600)
  }, [infoBoxOpen, play, addTimeout])

  const handleCloseInfo = useCallback(() => {
    setInfoBoxOpen(false)
    setDialogueState('idle')
    setDialogueActive(false)
  }, [])

  const handleNext = useCallback(() => {
    setExiting(true)
    fadeAllAudio()
    addTimeout(() => onNext(), 500)
  }, [fadeAllAudio, onNext, addTimeout])

  // Phase A — arrival
  useEffect(() => {
    play('hall')
    play('soulDust')
    gsap.to({}, { duration: 0, onComplete: () => setBg1Opacity(1) })
    gsap.fromTo(bg1Ref.current, { opacity: 0 }, { opacity: 1, duration: 1.2 })
    addTimeout(() => setShowPrompt(true), 1200)

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      triggerPhaseB()
    }
    const onClick = () => triggerPhaseB()

    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
    }
  }, [play, addTimeout, triggerPhaseB])

  // Parallax
  useEffect(() => {
    if (mobile) return
    const onMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMove)

    const loop = () => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.06
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.06
      setParallax({ x: mouseRef.current.x, y: mouseRef.current.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mobile])

  // Responsive
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Dialogue line chaining
  const dialogueCompleteHandler = useCallback(() => {
    if (dialogueState !== 'narration') return
    if (dialogueText === DIALOGUE_1) onDialogue1Complete()
    else if (dialogueText === DIALOGUE_2) onDialogue2Complete()
  }, [dialogueText, dialogueState, onDialogue1Complete, onDialogue2Complete])

  // Cleanup
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    timeouts.current.forEach(clearTimeout)
    gsap.killTweensOf(containerRef.current)
    gsap.killTweensOf(monolithRef.current)
    Object.values(sounds.current).forEach(s => s?.stop())
  }, [])

  const bgTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -12}px, ${parallax.y * -8}px) scale(1.05)`,
  }
  const xalTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -6}px, ${parallax.y * -4}px)`,
  }

  return (
    <div ref={containerRef} className={`realm1 ${exiting ? 'exiting' : ''}`} data-phase={phase}>
      <style>{styles}</style>

      {/* Layer 0 — bg1 (relam1-bg1.png — no orb glow) */}
      <div
        ref={bg1Ref}
        className="r1-bg r1-bg1"
        style={{ opacity: bg1Opacity, ...bgTransform }}
      />

      {/* Layer 1 — bg2 (relam1-bg2.png — glowing background orbs) */}
      <div
        ref={bg2Ref}
        className="r1-bg r1-bg2"
        style={{ opacity: bg2Visible ? 1 : 0, ...bgTransform }}
      >
        {/* Glow light aura overlay to make the embedded orbs in bg2 pulse with radiant light */}
        <div className="bg2-orb-glow-overlay" />
      </div>

      {/* Layer 2 — lava glow */}
      <div className="lava-glow" />

      {/* Layer 3 — Three.js Ember Particles */}
      <ParticleScene mobile={mobile} monolithActive={monolithVisible} />

      {/* Flash overlay for shake */}
      <div ref={flashRef} className="shake-flash" />

      {/* Layer 4 — Monolith (30% bigger: 364px desktop) */}
      {monolithVisible && (
        <>
          <div ref={burstRef} className="monolith-burst" />

          <button
            ref={monolithRef}
            className={`monolith ${monolithIdle ? 'idle' : ''}`}
            onClick={handleMonolithClick}
            aria-label="Touch the monolith"
          >
            <img src="/images/monolith.png" alt="Ancient monolith" draggable={false} />
          </button>
        </>
      )}

      {/* Layer 5 — Xal'Vorith (100% larger: 400px desktop) */}
      {!mobile && (
        <div className="xal-wrap" style={xalTransform}>
          <img
            ref={xalRef}
            className={`xal-pose2 ${xalVisible ? 'visible' : ''} ${dialogueActive ? 'speaking' : ''}`}
            src="/images/xalvorith-pose2.png"
            alt="Xal'Vorith"
            draggable={false}
          />
        </div>
      )}

      {/* Layer 6 — Vignette */}
      <div className="vignette" />

      {/* Layer 7 — Dialogue */}
      <DialogueBox
        speaker="Xal'Vorith — The Crowned Slave of the Endless One"
        text={dialogueText}
        state={dialogueState}
        visible={dialogueVisible}
        onTypeComplete={dialogueCompleteHandler}
        onSkip={dialogueCompleteHandler}
        variant="realm1"
      />

      {/* Layer 8 — Info box */}
      <AnimatePresence>
        {infoBoxOpen && (
          <motion.div
            className="info-box"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <CornerBrackets />
            <div className="info-header">
              <span className="info-bar" />
              <span className="info-title">THE OVERLORD — SURAJ KUMAR</span>
              <button className="info-close" onClick={handleCloseInfo} aria-label="Close">×</button>
            </div>
            <div className="info-divider" />
            {INFO_LINES.map((line, i) => (
              <motion.div
                key={line.label}
                className="info-line"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <span className="info-label">{line.label}</span>
                <span className="info-sep"> :: </span>
                {line.special === 'status' ? (
                  <span className="info-value status-value">
                    <span className="status-dot" />
                    {line.value}
                  </span>
                ) : line.special === 'contact' ? (
                  <a className="info-value contact-value" href={`mailto:${line.value}`}>{line.value}</a>
                ) : (
                  <span className="info-value">{line.value}</span>
                )}
              </motion.div>
            ))}
            <div className="info-footer">
              <button className="info-link" onClick={() => window.open('https://github.com/surajkush1704', '_blank')}>
                github.com/surajkush1704
              </button>
              <button className="info-link" onClick={() => window.open('https://linkedin.com/in/surajkumar1704', '_blank')}>
                linkedin.com/in/surajkumar1704
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 9 — Nav arrow */}
      <NavigationArrow direction="right" onClick={handleNext} visible={navArrowVisible} label="NEXT REALM" />

      {/* Layer 10 — Click prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.p
            className="click-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            [ CLICK ANYWHERE OR PRESS ANY KEY TO CONTINUE ]
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Geist+Mono:wght@400&family=UnifrakturCook:wght@700&display=swap');

.realm1 {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  width: 100dvw;
  height: 100dvh;
  overflow: hidden;
  background: #030104;
  color: #eee4ee;
  font-family: 'UnifrakturCook', serif;
}

.r1-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  transition: opacity 1s ease;
  will-change: transform, opacity;
  transform: scale(1.05);
}
.r1-bg1 {
  z-index: 0;
  background-image: url('/images/relam1-bg1.png');
  filter: none; /* No orb glow for bg1 */
}

.r1-bg2 {
  z-index: 1;
  background-image: url('/images/relam1-bg2.png');
  opacity: 0;
  animation: bg2OrbGlowPulse 4s ease-in-out infinite;
}

/* Make the painted embedded orbs inside relam1-bg2 glow and pulse dynamically */
@keyframes bg2OrbGlowPulse {
  0%, 100% {
    filter: brightness(1.05) contrast(1.05) drop-shadow(0 0 12px rgba(255,140,0,0.3));
  }
  50% {
    filter: brightness(1.25) contrast(1.15) drop-shadow(0 0 32px rgba(255,170,30,0.6));
  }
}

.bg2-orb-glow-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 25%, rgba(255, 140, 0, 0.45) 0%, rgba(255, 80, 0, 0.18) 18%, transparent 40%),
    radial-gradient(circle at 82% 28%, rgba(255, 150, 0, 0.5) 0%, rgba(255, 90, 0, 0.2) 20%, transparent 42%),
    radial-gradient(circle at 48% 18%, rgba(255, 180, 40, 0.4) 0%, rgba(212, 140, 20, 0.15) 15%, transparent 35%),
    radial-gradient(circle at 12% 70%, rgba(255, 130, 0, 0.35) 0%, transparent 30%),
    radial-gradient(circle at 88% 68%, rgba(255, 140, 0, 0.38) 0%, transparent 32%);
  mix-blend-mode: screen;
  animation: bg2AuraPulse 3.5s ease-in-out infinite alternate;
}

@keyframes bg2AuraPulse {
  0% { opacity: 0.45; transform: scale(1); }
  100% { opacity: 0.95; transform: scale(1.02); }
}

.lava-glow {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(0deg, rgba(255,60,0,0.18) 0%, rgba(255,30,0,0.06) 18%, transparent 45%);
  animation: lavaPulse 4s ease-in-out infinite;
}
@keyframes lavaPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.shake-flash {
  position: absolute;
  inset: 0;
  z-index: 8;
  background: #fff;
  opacity: 0;
  pointer-events: none;
}

.monolith-burst {
  position: absolute;
  z-index: 9;
  left: 50%;
  bottom: 18%;
  width: 260px;
  height: 260px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,240,200,0.9) 0%, rgba(212,175,55,0.4) 30%, transparent 70%);
  pointer-events: none;
}

/* Monolith — 30% larger: 364px desktop */
.monolith {
  position: absolute;
  z-index: 10;
  left: 48%;
  bottom: 0;
  transform: translateX(-50%);
  width: 364px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}
.monolith img {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 24px rgba(212,175,55,0.3));
  pointer-events: none;
  transition: filter 0.3s ease;
}
.monolith.idle {
  cursor: pointer;
  animation: monolithBreathe 4s ease-in-out infinite;
}
.monolith.idle img {
  animation: monolithGlow 4s ease-in-out infinite;
}
.monolith:hover img {
  filter: drop-shadow(0 0 38px rgba(212,175,55,0.85));
}
@keyframes monolithBreathe {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.008); }
}
@keyframes monolithGlow {
  0%, 100% { filter: drop-shadow(0 0 16px rgba(212,175,55,0.35)); }
  50% { filter: drop-shadow(0 0 34px rgba(212,175,55,0.7)); }
}

/* Xal'Vorith Character — 100% larger: 400px desktop */
.xal-wrap {
  position: absolute;
  z-index: 20;
  right: 2%;
  bottom: 0;
  transition: transform 0.1s linear;
}
.xal-pose2 {
  display: block;
  width: 400px;
  max-height: 92vh;
  object-fit: contain;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.8s ease, filter 0.5s ease;
  filter: drop-shadow(0 14px 8px rgba(0,0,0,0.82)) drop-shadow(0 0 14px rgba(100,24,150,0.3));
  animation: xalFloat 6s ease-in-out infinite;
}
.xal-pose2.visible { opacity: 1; }
.xal-pose2.speaking {
  filter: drop-shadow(0 0 12px rgba(124,58,237,0.7)) drop-shadow(0 14px 8px rgba(0,0,0,0.82));
}
@keyframes xalFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.vignette {
  position: absolute;
  inset: 0;
  z-index: 25;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(3,0,4,0.75) 100%);
}

.info-box {
  position: absolute;
  z-index: 40;
  left: 50%;
  bottom: 10%;
  transform: translateX(-50%);
  width: 520px;
  padding: 28px 32px;
  background: rgba(5, 0, 12, 0.92);
  border: 1px solid rgba(212,175,55,0.45);
  box-shadow: 0 0 40px rgba(212,175,55,0.15), 0 0 80px rgba(124,58,237,0.1), inset 0 0 40px rgba(0,0,0,0.6);
  backdrop-filter: blur(12px);
}
.ib { position: absolute; width: 14px; height: 14px; border-color: rgba(212,175,55,0.5); border-style: solid; }
.ib.tl { top: 5px; left: 5px; border-width: 1px 0 0 1px; }
.ib.tr { top: 5px; right: 5px; border-width: 1px 1px 0 0; }
.ib.bl { bottom: 5px; left: 5px; border-width: 0 0 1px 1px; }
.ib.br { bottom: 5px; right: 5px; border-width: 0 1px 1px 0; }

.info-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.info-bar { width: 3px; height: 22px; background: #D4AF37; flex-shrink: 0; }
.info-title {
  flex: 1;
  font-family: 'Cinzel Decorative', serif;
  font-size: 15px;
  color: #D4AF37;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.info-close {
  border: 0;
  background: transparent;
  color: rgba(212,175,55,0.4);
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.2s;
}
.info-close:hover { color: rgba(212,175,55,0.9); }
.info-divider { height: 1px; background: rgba(212,175,55,0.2); margin-bottom: 16px; }

.info-line {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(212,175,55,0.08);
  gap: 8px;
}
.info-line:last-of-type { border-bottom: none; }
.info-label {
  font-family: 'Cinzel', serif;
  font-size: 11px;
  color: rgba(212,175,55,0.5);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  min-width: 72px;
  flex-shrink: 0;
}
.info-sep {
  font-family: 'Cinzel', serif;
  font-size: 10px;
  color: rgba(212,175,55,0.3);
  flex-shrink: 0;
}
.info-value {
  font-family: 'Cinzel', serif;
  font-size: 13px;
  color: rgba(212,175,55,0.9);
  letter-spacing: 0.04em;
  line-height: 1.5;
}
.status-value { display: flex; align-items: center; gap: 6px; }
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22C55E;
  box-shadow: 0 0 6px rgba(34,197,94,0.8);
  animation: dotPulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.contact-value {
  color: rgba(124,58,237,0.8) !important;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(124,58,237,0.3);
}
.info-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(212,175,55,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.info-link {
  border: 0;
  background: transparent;
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  color: rgba(124,58,237,0.6);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.info-link:hover { color: rgba(124,58,237,1); }

.click-prompt {
  position: absolute;
  z-index: 60;
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Cinzel', serif;
  font-size: 10px;
  letter-spacing: 0.45em;
  color: rgba(212,175,55,0.5);
  text-transform: uppercase;
  animation: promptPulse 2s ease-in-out infinite;
  white-space: nowrap;
}
@keyframes promptPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@media (max-width: 1024px) {
  .monolith { width: 286px; }
  .info-box { width: 420px; }
  .xal-pose2 { width: 320px; }
}
@media (max-width: 768px) {
  .monolith { width: 72vw; }
  .info-box { width: 90vw; bottom: 5%; padding: 18px; }
  .info-label { font-size: 10px; min-width: 60px; }
  .info-value { font-size: 11px; }
  .xal-pose2 { width: 200px; }
  .click-prompt { font-size: 8px; letter-spacing: 0.3em; white-space: normal; text-align: center; width: 90%; }
}
`
