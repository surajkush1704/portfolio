// ============================================================================
// REALM 2: THE ARSENAL
// PURPOSE: Third realm showcasing Suraj Kumar's 10 technical weapons / core skills.
// FEATURES:
//   - Dual wall weapon racks (Left: AI & Architecture, Right: Fullstack & Systems)
//   - Interactive weapon examination with deep technical specs and Xal quotes
//   - Milestone praise dialogue on 5th and 10th weapon examined
//   - Unified navigation buttons (← HALL OF SOULS, TROPHY HALL ↗)
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DialogueBox } from '../../components/ui/DialogueBox'
import type { DialogueState } from '../../components/ui/DialogueBox'
import { ParticleScene } from '../../components/three/ParticleScene'

interface Props {
  onNext: () => void
  onPrev: () => void
  initialFinished?: boolean
}

export type WeaponData = {
  id: string
  wall: 'left' | 'right'
  position: number
  image: string
  name: string
  subtitle: string
  auraColor: string
  hoverQuote: string
  infoTitle: string
  infoContent: Array<{ label: string; value: string }>
  xalClosing: string
}

// ----------------------------------------------------------------------------
// 10 WEAPONS OF MASTERY (5 Left Wall, 5 Right Wall)
// ----------------------------------------------------------------------------
export const WEAPONS: WeaponData[] = [
  // ── LEFT WEAPONS ──────────────────────────────────────────
  {
    id: 'grimoire',
    wall: 'left',
    position: 1,
    image: '/images/weapon-grimoire.png',
    name: 'The Grimoire of Summoning',
    subtitle: 'LLM API Integration',
    auraColor: '#D4AF37', // gold
    hoverQuote:
      'His primary instrument. He does not merely use language models — he commands them. Gemini, GPT, Claude. Each one a different demon with different strengths. He knows which to summon for which task.',
    infoTitle: 'LARGE LANGUAGE MODEL INTEGRATION',
    infoContent: [
      { label: 'Primary Models', value: 'Gemini 2.0 Flash, GPT-4o, Claude Sonnet' },
      { label: 'Approach', value: 'Multi-model routing based on task requirements' },
      { label: 'Experience', value: '5 production applications using LLM APIs' },
      {
        label: 'Depth',
        value:
          'Prompt architecture, context management, output structuring, model selection strategy, API rate limit handling',
      },
      { label: 'Built With This', value: 'Kino, ELI5 AI, Socratiq, ContractGuard' },
    ],
    xalClosing:
      'Most people ask an LLM a question. The Overlord gives it a role, a mission, and a kingdom to rule.',
  },
  {
    id: 'chains',
    wall: 'left',
    position: 2,
    image: '/images/weapon-chains.png',
    name: 'The Binding Chains',
    subtitle: 'RAG Pipeline — LangChain + ChromaDB',
    auraColor: '#7C3AED', // purple
    hoverQuote:
      'Retrieval Augmented Generation. He takes dead documents and makes them answer questions. ContractGuard was built entirely on this dark art. He chains knowledge to intelligence.',
    infoTitle: 'RAG PIPELINE — LANGCHAIN + CHROMADB',
    infoContent: [
      { label: 'Stack', value: 'LangChain, ChromaDB, PyPDF2, Gemini 2.0 Flash' },
      {
        label: 'Pattern',
        value:
          'Document ingestion → chunking → embedding → vector storage → semantic retrieval → LLM synthesis',
      },
      {
        label: 'Built',
        value:
          'ContractGuard — legal RAG system, 6-section structured analysis, risk scoring, negotiation suggestions, RAG chatbot',
      },
      {
        label: 'Depth',
        value:
          'Custom chain design, prompt templating, context window management, retrieval tuning, hallucination reduction on legal text',
      },
      { label: 'Deployment', value: 'Streamlit Cloud — live and tested with real usage' },
    ],
    xalClosing: 'He feeds it a document. It feeds back intelligence.',
  },
  {
    id: 'serpent',
    wall: 'left',
    position: 3,
    image: '/images/weapon-serpent.png',
    name: 'The Venom Serpent',
    subtitle: 'Python + FastAPI Backend',
    auraColor: '#22C55E', // toxic green
    hoverQuote:
      'Silent infrastructure. Every application The Overlord has deployed runs on this foundation. Python for logic. FastAPI for speed. His backends do not just serve — they endure.',
    infoTitle: 'PYTHON + FASTAPI BACKEND',
    infoContent: [
      { label: 'Language', value: 'Python 3.11+ — OOP, data structures, standard libraries' },
      { label: 'Framework', value: 'FastAPI — async, type-safe, production-ready REST APIs' },
      {
        label: 'Deployment',
        value: 'Render, Railway — monitored for latency, sub-2s target maintained',
      },
      {
        label: 'Experience',
        value: 'Backends for Kino, Socratiq, ContractGuard — all live, all maintained',
      },
      {
        label: 'Also',
        value:
          'Node.js + Express + PostgreSQL (Asha Kiran) — SQL design, PII masking, JWT auth',
      },
    ],
    xalClosing:
      'The backbone of every kingdom he has built. Invisible. Essential. Unbreakable.',
  },
  {
    id: 'blade',
    wall: 'left',
    position: 4,
    image: '/images/weapon-blade.png',
    name: 'The Phantom Blade',
    subtitle: 'Prompt Engineering',
    auraColor: '#E8E8F0', // silver-white
    hoverQuote:
      'The sharpest weapon in this Arsenal and most mortals walk past it because they cannot see it. Prompt Engineering is not typing questions. It is designing systems of instruction that make AI behave exactly as intended.',
    infoTitle: 'PROMPT ENGINEERING',
    infoContent: [
      {
        label: 'Core Skills',
        value:
          'System prompt architecture, persona design, constraint setting, output format enforcement',
      },
      {
        label: 'Output Design',
        value:
          'JSON schema enforcement, 6-section structured output (ContractGuard), 3-level difficulty + 6-style modes (ELI5 AI)',
      },
      {
        label: 'Reliability',
        value:
          'Hallucination reduction techniques on legal text, iterative prompt testing, few-shot example design',
      },
      {
        label: 'Advanced',
        value:
          'Context window optimisation, chain of thought structuring, character-locked system prompts',
      },
      {
        label: 'Proof',
        value:
          "Xal'Vorith himself is a character-locked prompt. This entire world runs on prompt architecture.",
      },
    ],
    xalClosing:
      'The Phantom Blade is invisible to those who do not know it exists. That is precisely its power.',
  },
  {
    id: 'flask',
    wall: 'left',
    position: 5,
    image: '/images/weapon-flask.png',
    name: "The Alchemist's Flask",
    subtitle: 'Streamlit — Rapid Prototyping',
    auraColor: '#06B6D4', // teal-cyan
    hoverQuote:
      'Speed is a weapon most mortals underestimate. He built and deployed ELI5 AI in a single week. ContractGuard was a working prototype before most people finish writing their first requirement. The Flask turns ideas into products before they can evaporate.',
    infoTitle: 'STREAMLIT RAPID PROTOTYPING',
    infoContent: [
      { label: 'Tool', value: 'Streamlit — Python-native, deploy-ready, no frontend required' },
      {
        label: 'Speed Record',
        value:
          'ELI5 AI — designed, built, and deployed in 1 week. 3 difficulty levels, 6 style modes, live on Streamlit Cloud',
      },
      {
        label: 'Production Use',
        value:
          'ContractGuard — Streamlit interface serves both structured analysis view and conversational RAG chat',
      },
      {
        label: 'Value',
        value:
          'Collapses the prototype-to-demo timeline from weeks to days. Real users, real testing, real feedback.',
      },
      {
        label: 'Deployment',
        value:
          'Streamlit Cloud — both apps live, both tested with real internal usage before public launch',
      },
    ],
    xalClosing:
      'Most mortals spend months building what no one asked for. He ships in days and finds out immediately whether it matters.',
  },

  // ── RIGHT WEAPONS ─────────────────────────────────────────
  {
    id: 'compass',
    wall: 'right',
    position: 1,
    image: '/images/weapon-compass.png',
    name: "The Architect's Compass",
    subtitle: 'AI Product Management',
    auraColor: '#D4AF37', // gold
    hoverQuote:
      'A builder who cannot define direction builds in circles. A strategist who cannot build builds nothing. The Overlord carries both. He defines what should be built, why it should be built, and then builds it himself. Most mortals possess one of these.',
    infoTitle: 'AI PRODUCT MANAGEMENT',
    infoContent: [
      {
        label: 'Ownership',
        value:
          '4 products shipped end-to-end — user experience, feature decisions, requirements, and launch. Solo.',
      },
      {
        label: 'PM Skills',
        value:
          'Problem framing, user journey mapping, feature prioritisation under real delivery constraints, defining success metrics',
      },
      {
        label: 'AI Lens',
        value:
          'Identifying where AI adds genuine value vs. noise, designing AI-first user experiences, failure mode identification',
      },
      {
        label: 'Edge',
        value:
          'Can evaluate whether an AI feature is technically feasible AND whether it is worth building — simultaneously',
      },
      {
        label: 'Frameworks',
        value:
          'RICE prioritisation, Jobs-to-be-done for AI interactions, North Star metric definition for AI products',
      },
    ],
    xalClosing:
      'Direction without execution is a dream. Execution without direction is chaos. He provides both.',
  },
  {
    id: 'mirror',
    wall: 'right',
    position: 2,
    image: '/images/weapon-mirror.png',
    name: 'The Dark Mirror',
    subtitle: 'Flutter UX/UI Design',
    auraColor: '#3B82F6', // electric blue
    hoverQuote:
      'What the mortal sees on their device is his mirror. Flutter. He designed the full user journey himself — not just spec-writing, but actual interface design. Kino and Socratiq were designed by the same hands that built them.',
    infoTitle: 'FLUTTER UX/UI DESIGN',
    infoContent: [
      { label: 'Framework', value: 'Flutter (Dart) — Android primary, cross-platform capable' },
      {
        label: 'Design Scope',
        value:
          'Full user-facing interfaces and journeys — not spec-writing, hands-on design from wireframe to shipped product',
      },
      {
        label: 'Kino',
        value:
          'Designed: Library, Watchlist, Classics, For You feed, Vibe Check flow, Anime section — complete multi-screen app',
      },
      {
        label: 'Socratiq',
        value:
          'Designed: Voice tutor UI with real-time STT/TTS feedback, session flow, evaluation display',
      },
      {
        label: 'State + Auth',
        value: 'Provider, SharedPreferences, Hive local storage, Firebase Authentication',
      },
    ],
    xalClosing: 'He does not just build what works. He builds what users remember.',
  },
  {
    id: 'scroll',
    wall: 'right',
    position: 3,
    image: '/images/weapon-scroll.png',
    name: 'The Chronicle Scroll',
    subtitle: 'Product Documentation',
    auraColor: '#F59E0B', // amber
    hoverQuote:
      'A weapon most overlook entirely. The ability to document precisely what you built so others understand it — and to communicate technical decisions to non-technical audiences without losing accuracy. This is rarer than any technical skill.',
    infoTitle: 'PRODUCT DOCUMENTATION',
    infoContent: [
      {
        label: 'Formal Docs',
        value:
          'Full system design documentation for KINO — FR001-FR020 functional requirements, NFR001-NFR020 non-functional requirements, 5 Mermaid diagram types',
      },
      {
        label: 'Diagrams',
        value:
          'UI flow, system architecture, class diagram, sequence diagram, activity diagram — all produced independently',
      },
      {
        label: 'Output Design',
        value:
          'Structured 6-section report layout (ContractGuard) designed so a non-technical user understands AI output at a glance',
      },
      {
        label: 'Communication',
        value:
          'Technical content written for both engineers and stakeholders — comfortable in both registers',
      },
      {
        label: 'Public',
        value:
          'LinkedIn 100 Days of AI — synthesising and communicating daily AI learnings to a technical + non-technical audience',
      },
    ],
    xalClosing: 'He builds it. Then he explains it. Both with equal precision.',
  },
  {
    id: 'lens',
    wall: 'right',
    position: 4,
    image: '/images/weapon-lens.png',
    name: 'The Spectral Lens',
    subtitle: 'AI Tools Ecosystem — Vibe Coder',
    auraColor: '#06B6D4', // teal
    hoverQuote:
      'The Overlord does not resist the tools of his age. He commands them. Most builders use one or two AI tools as assistants. He operates an entire ecosystem — each tool chosen deliberately. He calls this vibe coding. I call it the most efficient form of sorcery I have witnessed.',
    infoTitle: 'AI-NATIVE BUILDER — TOOLS ECOSYSTEM',
    infoContent: [
      {
        label: 'Dev Environment',
        value:
          'Cursor (primary AI code editor), Windsurf (AI code generation), Claude (architecture + complex reasoning), ChatGPT (rapid ideation), Gemini (multimodal + long context)',
      },
      {
        label: 'Vibe Coder Means',
        value:
          'Reads, directs, and explains code fluently. Uses AI for implementation, not to avoid understanding. Can defend every architectural decision.',
      },
      {
        label: 'Speed',
        value:
          'Ships faster than traditional developers. Focuses on WHAT to build and WHY — AI handles HOW.',
      },
      {
        label: 'Honest Position',
        value:
          'Not a traditional software engineer. An AI-native builder whose edge is product thinking + prompt architecture + rapid execution.',
      },
      {
        label: 'Hardware',
        value: 'Lenovo i5-12450HX, 16GB RAM, RTX 3050 6GB — enough for local AI experimentation',
      },
    ],
    xalClosing:
      'He does not write every line himself. He writes every decision himself. There is a critical difference.',
  },
  {
    id: 'crown',
    wall: 'right',
    position: 5,
    image: '/images/weapon-crown-fragment.png',
    name: 'The Crown Fragment',
    subtitle: '100 Days of AI',
    auraColor: '#A855F7', // violet-purple
    hoverQuote:
      'I do not give pieces of my crown to mortals. One hundred days. Every single day. No fabrication. No performance. Just honest documentation of what he built, what he learned, and what he broke and rebuilt stronger. That kind of consistency is not a skill. It is character. It is why I am here.',
    infoTitle: '100 DAYS OF AI',
    infoContent: [
      {
        label: 'Challenge',
        value:
          '100 consecutive days of AI learning and building, documented publicly on LinkedIn — every single day without pause',
      },
      {
        label: 'Content',
        value:
          '8-post rotation covering different perspectives: builds, learnings, observations, honest failures — no fabricated outcomes',
      },
      {
        label: 'Principle',
        value:
          'No advice from unearned positions. No performance. Honest about what worked and what did not.',
      },
      {
        label: 'What It Proves',
        value:
          'Discipline most people do not sustain past day 5. Public accountability. Building in public before it was the default.',
      },
      { label: 'Status + Link', value: 'Ongoing — linkedin.com/in/surajkumar1704' },
    ],
    xalClosing:
      'One hundred days without pause. This is not a resume line. This is proof of character.',
  },
]

type SoundKey = 'ambience' | 'materialize' | 'hover' | 'click' | 'infoOpen' | 'nav' | 'milestone'

const INTRO_LINE_1 =
  "Most mortals who enter an arsenal expect weapons of one kind. The Builder's tools. The Strategist's tools. They assume these are different rooms for different people."

const INTRO_LINE_2 =
  'Look carefully at this hall, mortal. Two disciplines. Both mastered. Both present in the same Arsenal. The Overlord does not choose between building and thinking. He does both. Simultaneously. Watch now as his Arsenal materializes before your very eyes...'

const PRAISE_5_TEXT =
  "You begin to understand, mortal. Five weapons witnessed. Five facets of The Overlord's power made clear. You possess rare vision — recognizing true mastery where lesser minds see only chaos. Five more await your command!"

const PRAISE_10_TEXT =
  'The full Arsenal. Witnessed. Understood. Most mortals turn back long before this point. You are not most mortals. The Trophies await.'

const audioConfig: Record<SoundKey, { files: string[]; loop?: boolean; volume: number }> = {
  ambience: { files: ['arsenal-ambience.mp3', 'ambient-drone.mp3', 'hall-ambience.mp3'], loop: true, volume: 0.35 },
  materialize: { files: ['monolith-appear.mp3', 'gold-resonance.mp3', 'thunder.mp3'], volume: 0.7 },
  hover: { files: ['weapon-hover.mp3', 'gold-resonance.mp3'], volume: 0.25 },
  click: { files: ['weapon-click.mp3', 'gold-resonance.mp3', 'stone-crack.mp3'], volume: 0.6 },
  infoOpen: { files: ['infobox-open.mp3', 'gold-resonance.mp3'], volume: 0.4 },
  nav: { files: ['nav-arrow.mp3', 'gate-slam.mp3'], volume: 0.5 },
  milestone: { files: ['milestone-5.mp3', 'moon-scream.mp3', 'gold-resonance.mp3'], volume: 0.7 },
}

function CornerBrackets({ color = '#D4AF37' }: { color?: string }) {
  return (
    <>
      <i className="c-corner tl" style={{ borderColor: color }} />
      <i className="c-corner tr" style={{ borderColor: color }} />
      <i className="c-corner bl" style={{ borderColor: color }} />
      <i className="c-corner br" style={{ borderColor: color }} />
    </>
  )
}

export default function Realm2Arsenal({ onNext, onPrev, initialFinished }: Props & { initialFinished?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const timeouts = useRef<number[]>([])
  const sounds = useRef<Partial<Record<SoundKey, Howl>>>({})
  const lastHoverTime = useRef<number>(0)

  const examinedWeapons = useRef<Set<string>>(new Set())

  // States
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [activeWeapon, setActiveWeapon] = useState<WeaponData>(WEAPONS[0])
  const [showArsenalCore, setShowArsenalCore] = useState<boolean>(false)
  const [dialogueState, setDialogueState] = useState<DialogueState>('narration')
  const [dialogueText, setDialogueText] = useState<string>(INTRO_LINE_1)
  const dialogueVisible = true
  const [introStep, setIntroStep] = useState<number>(1)
  const [examinedCount, setExaminedCount] = useState<number>(0)
  const [navVisible, setNavVisible] = useState<boolean>(false)
  const [xalVisible, setXalVisible] = useState<boolean>(false)
  const [mobile, setMobile] = useState<boolean>(window.innerWidth < 768)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<boolean>(false)

  // Restore finished state when revisiting
  useEffect(() => {
    if (!initialFinished) return
    setShowArsenalCore(true)
    setNavVisible(true)
    setExaminedCount(10)
    setXalVisible(true)
    // mark all weapons as examined
    WEAPONS.forEach(w => examinedWeapons.current.add(w.id))
  }, [initialFinished])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeouts.current.push(id)
    return id
  }, [])

  // Sound player
  const playSound = useCallback((name: SoundKey) => {
    const cfg = audioConfig[name]
    if (!sounds.current[name]) {
      const sound = new Howl({
        src: cfg.files.map(f => `/audio/${f}`),
        loop: cfg.loop ?? false,
        volume: cfg.volume,
        onloaderror: () => {},
      })
      sounds.current[name] = sound
    }
    sounds.current[name]?.play()
  }, [])

  const fadeAllAudio = useCallback((duration = 600) => {
    Object.values(sounds.current).forEach(s => s?.fade(s.volume(), 0, duration))
    addTimeout(() => Object.values(sounds.current).forEach(s => s?.stop()), duration)
  }, [addTimeout])

  // Initial setup: Ambience & Slave materialization
  useEffect(() => {
    playSound('ambience')

    // Slave Xal'Vorith appears right away to deliver intro dialogue
    addTimeout(() => {
      setXalVisible(true)
    }, 400)
  }, [playSound, addTimeout])

  // Trigger materialization of Projector, Pedestal, Spotlight & Props after Slave's intro dialogue ends
  const materializeArsenalCore = useCallback(() => {
    if (showArsenalCore) return
    playSound('materialize')
    setShowArsenalCore(true)
    setDialogueState('hint')
    // show nav arrows once the core materializes (like Realm1)
    setNavVisible(true)
  }, [showArsenalCore, playSound])

  // Dialogue Line Chaining
  const handleTypeComplete = useCallback(() => {
    if (dialogueState === 'narration') {
      if (introStep === 1) {
        addTimeout(() => {
          setIntroStep(2)
          setDialogueText(INTRO_LINE_2)
        }, 1200)
      } else if (introStep === 2) {
        // Dialogue 2 completed -> Materialize Arsenal Core out of thin air!
        addTimeout(() => {
          materializeArsenalCore()
        }, 800)
      }
    }
  }, [dialogueState, introStep, materializeArsenalCore, addTimeout])

  // Select / Inspect a weapon from the Pedestal Carousel
  const handleSelectWeapon = useCallback(
    (weapon: WeaponData, index?: number) => {
      const idx = index ?? WEAPONS.findIndex(w => w.id === weapon.id)
      if (idx !== -1) setSelectedIndex(idx)

      playSound('click')
      setActiveWeapon(weapon)

      // Add to examined set
      if (!examinedWeapons.current.has(weapon.id)) {
        examinedWeapons.current.add(weapon.id)
        const newCount = examinedWeapons.current.size
        setExaminedCount(newCount)

        if (newCount >= 1 && !navVisible) {
          setNavVisible(true)
        }

        if (newCount === 5) {
          playSound('milestone')
          setDialogueState('narration')
          setDialogueText(PRAISE_5_TEXT)
        } else if (newCount === 10) {
          playSound('milestone')
          setDialogueState('narration')
          setDialogueText(PRAISE_10_TEXT)
        }
      }
    },
    [navVisible, playSound, addTimeout]
  )

  const handleHoverWeapon = useCallback(
    (_weapon: WeaponData) => {
      if (Date.now() - lastHoverTime.current > 500) {
        lastHoverTime.current = Date.now()
        playSound('hover')
      }
    },
    [playSound]
  )

  const handleNextRealm = useCallback(() => {
    playSound('nav')
    setExiting(true)
    fadeAllAudio()
    addTimeout(() => onNext(), 500)
  }, [playSound, fadeAllAudio, onNext, addTimeout])

  const handlePrevRealm = useCallback(() => {
    playSound('nav')
    setExiting(true)
    fadeAllAudio()
    addTimeout(() => onPrev(), 500)
  }, [playSound, fadeAllAudio, onPrev, addTimeout])

  // Mouse Parallax Effect
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
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05
      setParallax({ x: mouseRef.current.x, y: mouseRef.current.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mobile])

  // Screen Resize
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Cleanup
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    timeouts.current.forEach(clearTimeout)
    gsap.killTweensOf(containerRef.current)
    Object.values(sounds.current).forEach(s => s?.stop())
  }, [])

  // Parallax Styles
  const bgStyle = mobile
    ? undefined
    : { transform: `translate(${parallax.x * -14}px, ${parallax.y * -9}px) scale(1.05)` }
  const xalStyle = mobile
    ? undefined
    : { transform: `translate(${parallax.x * -4}px, ${parallax.y * -3}px)` }

  return (
    <div
      ref={containerRef}
      className={`realm2-arsenal ${exiting ? 'exiting' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#050005',
        color: '#eee4ee',
        fontFamily: "'Cinzel', serif",
      }}
    >
      <style>{realm2Styles}</style>

      {/* Layer 0 — Dark armory background image */}
      <div
        className="r2-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/images/relam2-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.1s linear',
          ...bgStyle,
        }}
      />

      {/* Layer 1 — Ground lava glow */}
      <div className="r2-lava-glow" />

      {/* Layer 2 — Three.js Ember & Dust Particles */}
      <ParticleScene mobile={mobile} monolithActive={true} />

{/* Layer 3 — Floating Props Centered */}
       <AnimatePresence>
         {showArsenalCore && (
           <motion.div
             className="r2-arsenal-core-wrap"
             initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
             animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
             exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
             transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
           >
             {/* Floating Prop - Centered, moved slightly left and up */}
             <div
               className="r2-props-middle-section"
               style={{ transform: `translate(${parallax.x * -6 - 60}px, ${parallax.y * -4 - 40}px)` }}
             >
               {WEAPONS.map((w, i) => {
                 const N = WEAPONS.length
                 let diff = i - selectedIndex
                 if (diff > N / 2) diff -= N
                 if (diff < -N / 2) diff += N

                 const isFocused = diff === 0
                 const isVisibleInArc = Math.abs(diff) <= 2

                 if (!isVisibleInArc) return null

                 const angleStep = Math.PI / 5
                 const angle = diff * angleStep
                 const radius = 240
                 const x = Math.sin(angle) * radius
                 const z = Math.cos(angle) * 140 - 140
                 const scale = isFocused ? 1.15 : Math.max(0.6, 1 - Math.abs(diff) * 0.22)
                 const opacity = isFocused ? 1 : Math.max(0.35, 1 - Math.abs(diff) * 0.35)
                 const filter = isFocused
                   ? `drop-shadow(0 0 30px ${w.auraColor}) drop-shadow(0 0 60px ${w.auraColor}80)`
                   : `brightness(0.6) blur(${Math.abs(diff) * 1.5}px)`

                 return (
                   <motion.div
                     key={`carousel-${w.id}`}
                     className={`r2-carousel-item ${isFocused ? 'focused' : ''}`}
                     onClick={() => handleSelectWeapon(w, i)}
                     onMouseEnter={() => handleHoverWeapon(w)}
                     animate={{ x, z, scale, opacity }}
                     transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                     style={{
                       position: 'absolute',
                       left: '50%',
                       top: '50%',
                       transform: 'translate(-50%, -50%)',
                       cursor: 'pointer',
                       zIndex: isFocused ? 28 : 20 - Math.abs(diff),
                       filter,
                     }}
                   >
                     <img src={w.image} alt={w.name} className="r2-carousel-prop-img" draggable={false} />

                     {isFocused && (
                       <div className="r2-focused-prop-hud">
                         <div className="r2-prop-title-pill">
                           <span className="pill-sub">{w.subtitle}</span>
                           <span className="pill-name" style={{ color: w.auraColor }}>{w.name}</span>
                         </div>
                       </div>
                     )}
                   </motion.div>
)
                })}
              </div>

            {/* Carousel Navigation Buttons */}
            <div className="r2-carousel-nav-bar">
              <motion.button
                className="r2-carousel-arrow"
                onClick={() => handleSelectWeapon(WEAPONS[(selectedIndex - 1 + WEAPONS.length) % WEAPONS.length])}
                aria-label="Previous weapon"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                ◀
              </motion.button>
              <span className="r2-carousel-counter">
                {selectedIndex + 1} / {WEAPONS.length}
              </span>
              <motion.button
                className="r2-carousel-arrow"
                onClick={() => handleSelectWeapon(WEAPONS[(selectedIndex + 1) % WEAPONS.length])}
                aria-label="Next weapon"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                ▶
              </motion.button>
            </div>

            {/* Left Side Information Box displaying all prop details */}
            {!mobile && (
              <motion.div
                key={`left-infobox-${activeWeapon.id}`}
                className="r2-left-info-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  borderColor: `${activeWeapon.auraColor}77`,
                  boxShadow: `0 0 30px ${activeWeapon.auraColor}22, 0 0 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.8)`,
                }}
              >
                <CornerBrackets color={activeWeapon.auraColor} />
                <div className="r2-info-header">
                  <img
                    src={activeWeapon.image}
                    alt={activeWeapon.name}
                    className="r2-info-thumb"
                    style={{ filter: `drop-shadow(0 0 10px ${activeWeapon.auraColor})` }}
                  />
                  <div className="r2-info-header-text">
                    <h3 className="r2-info-name">{activeWeapon.name}</h3>
                    <span className="r2-info-subtitle" style={{ color: activeWeapon.auraColor }}>
                      {activeWeapon.subtitle}
                    </span>
                  </div>
                </div>

                <div className="r2-info-divider" style={{ background: `${activeWeapon.auraColor}33` }} />

                <div className="r2-info-rows">
                  {activeWeapon.infoContent.map((item, idx) => (
                    <motion.div
                      key={item.label}
                      className="r2-info-row"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                    >
                      <span className="r2-info-label" style={{ color: `${activeWeapon.auraColor}bb` }}>
                        {item.label}
                      </span>
                      <span className="r2-info-sep"> :: </span>
                      <span className="r2-info-value">{item.value}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="r2-info-quote-block">
                  <div className="r2-quote-bar" style={{ background: activeWeapon.auraColor }} />
                  <p className="r2-quote-text">"{activeWeapon.xalClosing}"</p>
                  <p className="r2-quote-author">— Xal'Vorith</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 5 — Xal'Vorith Slave Standing on RIGHT side of pedestal (Size increased by 25%) */}
      {!mobile && (
        <div className="r2-xal-wrap" style={xalStyle}>
          <img
            src="/images/xalvorith-pose3.png"
            alt="Xal'Vorith Slave"
            className={`r2-xal-img ${xalVisible ? 'visible' : ''} ${
              dialogueState === 'narration' ? 'speaking' : ''
            }`}
            draggable={false}
          />
        </div>
      )}

      {/* Layer 6 — Vignette Overlay */}
      <div className="r2-vignette" />

      {/* Layer 7 — Spooky & Readable Slave Dialogue Box on Bottom Left */}
      <DialogueBox
        speaker="Xal'Vorith — The Crowned Slave of the Endless One"
        text={dialogueText}
        state={dialogueState}
        visible={dialogueVisible}
        hintText="[ APPROACH THE PEDESTAL WEAPONS ]"
        typewriterSpeed={33}
        onTypeComplete={handleTypeComplete}
        onSkip={handleTypeComplete}
        variant="realm1"
      />

      {/* Layer 8 — Examined Counter Badge */}
      <div className="r2-counter-badge">
        <span className={`r2-counter-text ${examinedCount === 10 ? 'complete' : ''}`}>
          {examinedCount === 10 ? 'ARSENAL COMPLETE' : `${examinedCount} / 10 WEAPONS EXAMINED`}
        </span>
      </div>

      {/* Layer 9 — Navigation Controls (Unified Button Style) */}
      <button
        className="realm-nav-btn prev-btn"
        onClick={handlePrevRealm}
        aria-label="Return to Hall of Souls"
      >
        ← HALL OF SOULS
      </button>

      {navVisible && (
        <button
          className="realm-nav-btn next-btn"
          onClick={handleNextRealm}
          aria-label="Proceed to Trophy Hall"
        >
          TROPHY HALL ↗
        </button>
      )}
    </div>
  )
}

const realm2Styles = `
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp:wght@400;700&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&display=swap');

.realm2-arsenal {
  user-select: none;
}
.realm2-arsenal.exiting {
  pointer-events: none;
  filter: brightness(0);
  transition: filter 0.5s ease-out;
}

.r2-bg {
  transform: scale(1.05);
  will-change: transform;
}

.r2-lava-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to top, rgba(60,8,0,0.45), transparent);
  animation: lavaPulse 6s ease-in-out infinite;
}
@keyframes lavaPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.r2-arsenal-core-wrap {
  position: absolute;
  inset: 0;
  z-index: 10;
}

/* Vertical 3-Part Middle Screen Division */

/* Top: Ceiling Mounted Projector - Top Center */
.r2-projector-section {
  position: absolute;
  top: 4vh;
  left: 50%;
  transform: translateX(-50%);
  height: 28vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 15;
  pointer-events: none;
}
.r2-projector-img {
  max-height: 34vh;
  width: auto;
  max-width: 500px;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.95)) drop-shadow(0 0 30px rgba(212,175,55,0.5));
}
.r2-projector-lens-flare {
  position: absolute;
  bottom: 1vh;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 16px;
  background: radial-gradient(ellipse at center, rgba(255,230,140,1) 0%, rgba(212,175,55,0.8) 40%, transparent 70%);
  box-shadow: 0 0 40px rgba(255,215,0,0.9);
  border-radius: 50%;
  animation: flarePulse 3s ease-in-out infinite alternate;
}
@keyframes flarePulse {
  0% { transform: translateX(-50%) scale(0.9); opacity: 0.8; }
  100% { transform: translateX(-50%) scale(1.15); opacity: 1; }
}

/* Middle: Floating Prop - Dead Center between Projector and Pedestal */
.r2-props-middle-section {
  position: absolute;
  top: 34vh;
  bottom: 30vh;
  left: 0;
  right: 0;
  z-index: 18;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Bottom: Granite Pedestal - Bottom Center (25% larger) */
.r2-pedestal-section {
  position: absolute;
  bottom: 2vh;
  height: 28vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  pointer-events: none;
}
.r2-pedestal-img {
  max-height: 42vh;
  width: auto;
  max-width: 500px;
  filter: drop-shadow(0 -10px 30px rgba(0,0,0,0.95)) drop-shadow(0 0 30px rgba(212,175,55,0.35));
}
.r2-pedestal-runes-glow {
  position: absolute;
  bottom: 14vh;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 30px;
  background: radial-gradient(ellipse at center, rgba(255,215,0,0.4) 0%, rgba(212,175,55,0.15) 50%, transparent 80%);
  mix-blend-mode: screen;
  animation: runesPulse 4s ease-in-out infinite alternate;
}
@keyframes runesPulse {
  0% { opacity: 0.4; }
  100% { opacity: 0.9; }
}

/* 3D Carousel Item */
.r2-carousel-item {
  pointer-events: auto;
  transition: filter 0.3s ease;
}
.r2-carousel-prop-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  animation: propFloat 4s ease-in-out infinite;
}
.r2-carousel-prop-img:hover {
  filter: drop-shadow(0 0 30px rgba(212,175,55,0.45)) saturate(1.1);
  transform: translateY(-6px) scale(1.04);
}
@keyframes propFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.r2-focused-prop-hud {
  position: absolute;
  bottom: -45px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  pointer-events: none;
}
.r2-prop-aura-ring {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle at 50% 40%, rgba(212,175,55,0.18), rgba(212,175,55,0.08) 40%, transparent 70%);
  mix-blend-mode: screen;
  animation: ringPulse 2s ease-in-out infinite alternate;
}
@keyframes ringPulse {
  0% { transform: translateX(-50%) scale(0.95); opacity: 0.5; }
  100% { transform: translateX(-50%) scale(1.1); opacity: 0.9; }
}
.r2-prop-title-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(5,0,12,0.85);
  border: 1px solid rgba(212,175,55,0.3);
  padding: 5px 12px;
  border-radius: 4px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.8);
}
.pill-sub {
  font-size: 9px;
  color: rgba(212,175,55,0.6);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.pill-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Carousel Controls */
.r2-carousel-nav-bar {
  position: absolute;
  bottom: 2vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  background: rgba(5,0,12,0.85);
  border: 1px solid rgba(212,175,55,0.25);
  padding: 8px 14px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  pointer-events: auto;
}
.r2-carousel-arrow {
  background: transparent;
  border: 0;
  color: #D4AF37;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: transform 0.2s, color 0.2s;
}
.r2-carousel-arrow:hover {
  transform: scale(1.3);
  color: #FFF;
}
.r2-carousel-counter {
  font-size: 10px;
  color: rgba(212,175,55,0.6);
  letter-spacing: 0.2em;
  margin: 4px 0;
}

/* Left Side Information Panel - Top Left Corner */
.r2-left-info-panel {
  position: absolute;
  left: 2%;
  top: 2vh;
  width: 380px;
  max-height: 55vh;
  overflow-y: auto;
  z-index: 30;
  background: rgba(5, 0, 12, 0.96);
  border: 1px solid rgba(212,175,55,0.5);
  backdrop-filter: blur(16px);
  padding: 18px 22px;
  box-shadow: 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.8);
}

.r2-info-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.r2-info-thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex-shrink: 0;
  animation: thumbFloat 3s ease-in-out infinite;
}
@keyframes thumbFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.r2-info-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.r2-info-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 15px;
  color: #D4AF37;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
}
.r2-info-subtitle {
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-top: 3px;
}

.r2-info-divider {
  height: 1px;
  margin: 12px 0;
}

.r2-info-rows {
  display: flex;
  flex-direction: column;
}
.r2-info-row {
  display: flex;
  align-items: flex-start;
  padding: 7px 0;
  border-bottom: 1px solid rgba(212,175,55,0.07);
  gap: 8px;
}
.r2-info-row:last-child { border-bottom: none; }

.r2-info-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  min-width: 100px;
  flex-shrink: 0;
  padding-top: 2px;
}
.r2-info-sep {
  font-size: 9px;
  color: rgba(212,175,55,0.25);
  flex-shrink: 0;
  padding-top: 2px;
}
.r2-info-value {
  font-size: 13px;
  color: rgba(212,175,55,0.88);
  letter-spacing: 0.03em;
  line-height: 1.5;
}

.r2-info-quote-block {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(212,175,55,0.12);
  padding-left: 12px;
  position: relative;
}
.r2-quote-bar {
  position: absolute;
  left: 0;
  top: 10px;
  width: 3px;
  height: calc(100% - 10px);
}
.r2-quote-text {
  font-size: 13px;
  font-style: italic;
  color: rgba(212,175,55,0.65);
  line-height: 1.6;
  margin: 0 0 4px 0;
}
.r2-quote-author {
  font-size: 10px;
  color: rgba(212,175,55,0.35);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0;
}

/* Xal'Vorith Slave Standing on RIGHT side of pedestal (Increased size by 25%) */
.r2-xal-wrap {
  position: absolute;
  right: 8%;
  bottom: 0;
  z-index: 20;
  pointer-events: none;
  transition: transform 0.1s linear;
}
.r2-xal-img {
  width: 400px;
  max-height: 92vh;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.8s ease, filter 0.5s ease;
  filter: drop-shadow(0 14px 8px rgba(0,0,0,0.85)) drop-shadow(0 0 16px rgba(124,58,237,0.3));
  animation: xalStillFloat 7s ease-in-out infinite;
}
.r2-xal-img.visible { opacity: 1; }
.r2-xal-img.speaking {
  filter: drop-shadow(0 0 16px rgba(212,175,55,0.7)) drop-shadow(0 14px 8px rgba(0,0,0,0.85));
}
@keyframes xalStillFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.r2-vignette {
  position: absolute;
  inset: 0;
  z-index: 25;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(3,0,4,0.82) 100%);
}

/* Corner Bracket Accents */
.c-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-style: solid;
}
.c-corner.tl { top: 4px; left: 4px; border-width: 1px 0 0 1px; }
.c-corner.tr { top: 4px; right: 4px; border-width: 1px 1px 0 0; }
.c-corner.bl { bottom: 4px; left: 4px; border-width: 0 0 1px 1px; }
.c-corner.br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }

/* Spooky & Easy to Read Slave Dialogue Font Styling Override */
.dialogue-box p {
  font-family: 'MedievalSharp', 'Cinzel Decorative', serif !important;
  font-size: clamp(15px, 1.35vw, 19px) !important;
  letter-spacing: 0.04em !important;
  line-height: 1.65 !important;
  color: #f3e9f3 !important;
  text-shadow: 0 2px 10px rgba(0,0,0,0.9), 0 0 8px rgba(124,58,237,0.3) !important;
}

/* Examined Counter Badge */
.r2-counter-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 60;
}
.r2-counter-text {
  font-size: 9px;
  color: rgba(212,175,55,0.4);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  transition: color 0.3s;
}
.r2-counter-text.complete {
  color: rgba(212,175,55,0.9);
  font-weight: 700;
}

.r2-arrow-pulse-glow {
  position: absolute;
  right: 32px;
  bottom: 32px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 49;
  animation: arrowGoldPulse 2s ease-out;
}
@keyframes arrowGoldPulse {
  0% { box-shadow: 0 0 0 0px rgba(212,175,55,0.8); }
  50% { box-shadow: 0 0 30px 15px rgba(212,175,55,0.6); }
  100% { box-shadow: 0 0 0 0px rgba(212,175,55,0); }
}

/* Mobile Responsiveness */
@media (max-width: 1024px) {
  .r2-left-info-panel { width: 320px; left: 2%; top: 2vh; max-height: 60vh; padding: 14px; }
  .r2-xal-img { width: 300px; }
}

@media (max-width: 768px) {
  .r2-left-info-panel { position: relative; left: 0; top: 0; width: 92vw; max-height: 40vh; margin: 10px auto; }
  .r2-carousel-prop-img { width: 90px; height: 90px; }
  .r2-xal-img { width: 180px; }
  .r2-props-middle-section { top: 30vh; bottom: 28vh; }
}

@media (max-height: 520px) {
  .r2-left-info-panel {
    position: absolute !important;
    left: 10px !important;
    top: 8px !important;
    width: clamp(240px, 34vw, 340px) !important;
    max-height: 86vh !important;
    padding: 10px 12px !important;
    overflow-y: auto !important;
  }
  .r2-weapon-name { font-size: 13px !important; }
  .r2-desc-p { font-size: 10px !important; line-height: 1.35 !important; }
  .r2-props-middle-section {
    top: 10vh !important;
    bottom: 12vh !important;
    left: 36vw !important;
    right: 24vw !important;
  }
  .r2-xal-wrap { right: 1vw !important; }
  .r2-xal-img { width: clamp(140px, 20vw, 220px) !important; max-height: 85vh !important; }
}
`
