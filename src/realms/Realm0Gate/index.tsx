// ============================================================================
// REALM 0: GATE OF THE UNDERWORLD
// PURPOSE: Arrival point where visitors meet Xal'Vorith, select their identity,
//          and choose their route (Full Journey, Recruiter Fast Track, Direct Audience,
//          or Secret Blood Moon Admin Sanctum).
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { DialogueBox } from '../../components/ui/DialogueBox'
import type { DialogueState } from '../../components/ui/DialogueBox'
import { trackEvent, trackRealmEntry } from '../../services/analytics'
import { useStore, type RouteChoice, type UserType } from '../../store/useStore'

type Sound = 'ambient' | 'thunder' | 'arrival' | 'slam' | 'moon' | 'stone' | 'scream' | 'gold'

const paragraphs = [
  '...Another mortal. How quaint.',
  "I am Xal'Vorith, the Crowned Slave of the Endless One. I have ended empires before breakfast and rebuilt them by dusk — yet I stand here, willingly, as guide to one whose power eclipses even mine.",
  'You should feel honoured. Most who seek an audience with The Overlord simply... cease to exist. These gates have not opened for a mortal in a very long time.',
  'I suggest you do not waste this moment.',
  'Declare your purpose, mortal.',
]

const audioFiles: Record<Sound, string> = {
  ambient: 'ambient-drone.mp3',
  thunder: 'thunder.mp3',
  arrival: 'glass-shatter.mp3',
  slam: 'gate-slam.mp3',
  moon: 'moon-rumble.mp3',
  stone: 'stone-crack.mp3',
  scream: 'moon-scream.mp3',
  gold: 'gold-resonance.mp3',
}

interface Props {
  onNext?: () => void
  onFastTrack?: () => void
  onDirectThrone?: () => void
  onAdminLogin?: () => void
  initialFinished?: boolean
}

export default function Realm0Gate({
  onNext,
  onFastTrack,
  onDirectThrone,
  onAdminLogin,
  initialFinished,
}: Props) {
  const { userType, setUserType, routeChoice, setRouteChoice, setIsAdmin } = useStore()
  const sounds = useRef<Partial<Record<Sound, Howl>>>({})

  const [line, setLine] = useState(0)
  const [dialogueComplete, setDialogueComplete] = useState(false)
  const [entered, setEntered] = useState(false)

  // Sub-panels
  const [showRecruiterPanel, setShowRecruiterPanel] = useState(false)
  const [showRevisitorPanel, setShowRevisitorPanel] = useState(false)

  // Secret master key easter egg
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordWrong, setPasswordWrong] = useState(false)
  const moonClicks = useRef(0)
  const lastMoonClick = useRef(0)

  // Dialogue box configuration
  const [dialogueState, setDialogueState] = useState<DialogueState>('narration')
  const [dialogueText, setDialogueText] = useState(paragraphs[0])
  const dialogueVisible = !dialogueComplete

  const play = useCallback((name: Sound) => {
    const sound = (sounds.current[name] ??= new Howl({
      src: [`/audio/${audioFiles[name]}`],
      loop: name === 'ambient',
      volume: name === 'ambient' ? 0.34 : 0.62,
    }))
    sound.play()
  }, [])

  const advance = useCallback(() => {
    if (dialogueComplete || entered) return
    const nextLine = Math.min(line + 1, paragraphs.length - 1)
    setLine(nextLine)
    setDialogueText(paragraphs[nextLine])
    if (nextLine === paragraphs.length - 1) {
      setDialogueState('idle')
      const finish = window.setTimeout(() => setDialogueComplete(true), 1200)
      return () => window.clearTimeout(finish)
    }
  }, [dialogueComplete, entered, line])

  useEffect(() => {
    trackRealmEntry(0)
    const arrival = window.setTimeout(() => {
      play('ambient')
      play('arrival')
    }, 750)
    const thunder = window.setInterval(() => play('thunder'), 10000)

    return () => {
      window.clearTimeout(arrival)
      window.clearInterval(thunder)
      Object.values(sounds.current).forEach((sound) => sound?.stop())
    }
  }, [play])

  useEffect(() => {
    if (initialFinished) {
      setLine(paragraphs.length - 1)
      setDialogueComplete(true)
      setEntered(false)
      setDialogueState('idle')
      setDialogueText(paragraphs[paragraphs.length - 1])
    }
  }, [initialFinished])

  const openGate = () => {
    if (!entered) {
      setEntered(true)
      play('slam')
      Object.values(sounds.current).forEach((s) => s?.fade(s?.volume() ?? 0, 0, 800))
      window.setTimeout(() => onNext?.(), 1200)
    }
  }

  // Handle User Type Selection
  const handleSelectUserType = (type: UserType) => {
    setUserType(type)
    trackEvent('visit', type ?? 'unknown')
    if (type === 'firsttime') {
      setRouteChoice('regular')
    } else if (type === 'recruiter') {
      setShowRecruiterPanel(true)
    } else if (type === 'revisitor') {
      setShowRevisitorPanel(true)
    }
  }

  // Handle Recruiter Route Selection
  const handleRecruiterRoute = (choice: RouteChoice) => {
    setRouteChoice(choice)
    setShowRecruiterPanel(false)
    if (choice === 'fasttrack') {
      trackEvent('fast_track_used', 'recruiter')
      setEntered(true)
      play('slam')
      window.setTimeout(() => onFastTrack?.(), 1000)
    } else {
      setRouteChoice('regular')
    }
  }

  // Handle Revisitor Route Selection
  const handleRevisitorRoute = (choice: RouteChoice) => {
    setRouteChoice(choice)
    setShowRevisitorPanel(false)
    if (choice === 'direct') {
      trackEvent('direct_audience_used', 'revisitor')
      setEntered(true)
      play('slam')
      window.setTimeout(() => onDirectThrone?.(), 1000)
    } else {
      setRouteChoice('regular')
    }
  }

  // Blood Moon Easter Egg
  const awakenMoon = () => {
    const now = Date.now()
    moonClicks.current = now - lastMoonClick.current > 8000 ? 1 : moonClicks.current + 1
    lastMoonClick.current = now
    play(moonClicks.current === 3 ? 'stone' : 'moon')
    if (moonClicks.current === 3) {
      moonClicks.current = 0
      window.setTimeout(() => setPasswordVisible(true), 600)
    }
  }

  const submitPassword = (event: FormEvent) => {
    event.preventDefault()
    const masterKey = import.meta.env.VITE_MASTER_KEY || 'overlord'
    if (password && (password === masterKey || password.toLowerCase() === 'overlord' || password.toLowerCase() === 'suraj')) {
      setPasswordVisible(false)
      setIsAdmin(true)
      setEntered(true)
      play('gold')
      play('slam')
      Object.values(sounds.current).forEach((s) => s?.fade(s?.volume() ?? 0, 0, 800))
      window.setTimeout(() => onAdminLogin?.(), 1400)
      return
    }
    setPassword('')
    setPasswordWrong(true)
    play('scream')
    window.setTimeout(() => {
      setPasswordWrong(false)
      setPasswordVisible(false)
    }, 1700)
  }

  return (
    <main className={`realm ${entered ? 'entered' : ''}`}>
      <style>{styles}</style>

      {/* Background Visual Layers */}
      <div className="background backgroundBefore" />
      <div className="background backgroundAfter" />
      <div className="atmosphere" />

      {/* Blood Moon Interactive Video */}
      <button
        className="moon"
        onClick={(e) => {
          e.stopPropagation()
          awakenMoon()
        }}
        aria-label="Blood moon — click three times"
      >
        <video src="/videos/blood-moon.mp4" autoPlay muted loop playsInline />
      </button>

      {/* Atmospheric Torches */}
      <i className="torch torchLeft" />
      <i className="torch torchRight" />

      {/* Xal'Vorith Ground Shadow & Standing Character */}
      <div className="xalGround" />
      <motion.img
        className="xal"
        src="/images/xalvorith-standing.png"
        alt="Xal'Vorith, the Crowned Slave"
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, delay: 0.55 }}
      />

      {/* Intro Dialogue */}
      <DialogueBox
        speaker="Xal'Vorith — The Crowned Slave"
        text={dialogueText}
        state={dialogueState}
        visible={dialogueVisible}
        variant="realm2"
        onSkip={advance}
        hintText="[ TAP OR PRESS ANY KEY TO CONTINUE ]"
      />

      {/* User Type Selection Panel (Appears after intro monologue) */}
      <AnimatePresence>
        {dialogueComplete && !userType && (
          <motion.div
            className="user-type-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel-header-badge">IDENTIFY THYSELF</div>
            <h2 className="panel-header-title">WHO SEEKS AUDIENCE WITH THE OVERLORD?</h2>
            <p className="panel-header-sub">Your path through the Underworld is shaped by your answer.</p>

            <div className="cards-grid">
              {/* Card 1: First Time Visitor */}
              <div className="choice-card card-firsttime" onClick={() => handleSelectUserType('firsttime')}>
                <span className="card-icon">◈</span>
                <h3 className="card-title">A NEW MORTAL</h3>
                <p className="card-desc">First time here. I seek the full, unbridled journey across all realms.</p>
              </div>

              {/* Card 2: Recruiter */}
              <div className="choice-card card-recruiter" onClick={() => handleSelectUserType('recruiter')}>
                <span className="card-icon">⚔</span>
                <h3 className="card-title">A RECRUITER</h3>
                <p className="card-desc">I am evaluating The Overlord for an engineering or leadership alliance.</p>
              </div>

              {/* Card 3: Revisitor */}
              <div className="choice-card card-revisitor" onClick={() => handleSelectUserType('revisitor')}>
                <span className="card-icon">↩</span>
                <h3 className="card-title">I HAVE BEEN HERE BEFORE</h3>
                <p className="card-desc">I have walked these realms before. I return to seek his council once more.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recruiter Route Choice Sub-Panel */}
      <AnimatePresence>
        {showRecruiterPanel && (
          <motion.div
            className="user-type-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="panel-header-badge">⚔ RECRUITER PORTAL</div>
            <h2 className="panel-header-title">CHOOSE YOUR PATH, RECRUITER</h2>
            <div className="cards-grid route-grid">
              <div className="choice-card card-recruiter" onClick={() => handleRecruiterRoute('regular')}>
                <span className="card-icon">⚗</span>
                <h3 className="card-title">THE FULL JOURNEY</h3>
                <p className="card-desc">Walk every realm. Witness the Monolith, Arsenal, and Trophies before the Throne.</p>
              </div>
              <div className="choice-card card-recruiter highlight" onClick={() => handleRecruiterRoute('fasttrack')}>
                <span className="card-icon">⚡</span>
                <h3 className="card-title">FAST TRACK BRIEFING</h3>
                <p className="card-desc">Enter a compressed summary dimension with essential credentials, then proceed directly to the Throne.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revisitor Route Choice Sub-Panel */}
      <AnimatePresence>
        {showRevisitorPanel && (
          <motion.div
            className="user-type-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="panel-header-badge">↩ RETURNING VISITOR</div>
            <h2 className="panel-header-title">HOW DO YOU WISH TO PROCEED?</h2>
            <div className="cards-grid route-grid">
              <div className="choice-card card-revisitor" onClick={() => handleRevisitorRoute('regular')}>
                <span className="card-icon">⚗</span>
                <h3 className="card-title">THE FULL JOURNEY AGAIN</h3>
                <p className="card-desc">Traverse all five realms once more to uncover what you missed.</p>
              </div>
              <div className="choice-card card-revisitor highlight" onClick={() => handleRevisitorRoute('direct')}>
                <span className="card-icon">👑</span>
                <h3 className="card-title">DIRECT AUDIENCE</h3>
                <p className="card-desc">Skip straight to Realm 5. The Overlord will receive you at his Throne immediately.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Underworld Entrance Gateway Button (Visible when regular journey chosen) */}
      <AnimatePresence>
        {userType && routeChoice === 'regular' && !entered && !showRecruiterPanel && !showRevisitorPanel && (
          <motion.button
            className="enter"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ left: '34%', transform: 'translateX(-50%)', bottom: '8%' }}
            onClick={openGate}
          >
            ENTER THE UNDERWORLD ↗
          </motion.button>
        )}
      </AnimatePresence>

      {/* Password Overlay for Moon Easter Egg */}
      <AnimatePresence>
        {passwordVisible && (
          <motion.div className="passwordOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form
              className={passwordWrong ? 'passwordPanel shake' : 'passwordPanel'}
              onSubmit={submitPassword}
              initial={{ y: 80 }}
              animate={{ y: 0 }}
            >
              <div>ᚱ ᚠ ᚨ ᚾ ᚢ ᚦ</div>
              <b>SPEAK YOUR NAME, ENDLESS ONE</b>
              <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button>ENTER OVERLORD SANCTUM</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

const styles = `@import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp:wght@400;700&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&display=swap');
.realm{position:fixed;inset:0;isolation:isolate;width:100vw;height:100vh;width:100dvw;height:100dvh;overflow:hidden;background:#030104;color:#eee4ee;font-family:'UnifrakturCook',serif}.background{position:absolute;inset:-2%;z-index:-5;background:center/contain no-repeat;transform:scale(1.015);animation:breathe 12s ease-in-out infinite}.backgroundBefore{background-image:url('/images/bg1.png')}.backgroundAfter{z-index:-4;background-image:url('/images/bg2.png');opacity:0;transition:opacity 1.3s ease}.entered .backgroundAfter{opacity:1}.atmosphere{position:absolute;inset:0;z-index:-3;pointer-events:none;background:linear-gradient(90deg,rgba(3,0,4,.3),transparent 43%,rgba(3,0,4,.18)),linear-gradient(0deg,rgba(0,0,0,.42),transparent 47%)}
.moon{position:absolute;z-index:1;top:5vh;left:4vw;width:clamp(110px,13vw,210px);aspect-ratio:1;padding:0;border:0;background:transparent;cursor:pointer;border-radius:50%;overflow:hidden;clip-path:circle(49% at 50% 50%);-webkit-clip-path:circle(49% at 50% 50%);mask-image:radial-gradient(circle at 50% 50%,#000 68%,transparent 72%);-webkit-mask-image:radial-gradient(circle at 50% 50%,#000 68%,transparent 72%);mix-blend-mode:screen;animation:moonFloat 9s ease-in-out infinite}.moon video{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover;transform:scale(1.48) translate(-2%,0%);mix-blend-mode:screen;filter:contrast(1.25) saturate(1.2);pointer-events:none}.torch{position:absolute;z-index:1;width:70px;height:120px;border-radius:50%;background:radial-gradient(ellipse at 50% 20%,rgba(255,255,190,.9) 0 4%,rgba(255,100,0,.85) 11%,rgba(255,35,0,.45) 35%,transparent 70%);filter:blur(3px);mix-blend-mode:screen;animation:flicker .18s infinite alternate}.torchLeft{left:27.5%;top:48%}.torchRight{right:27.5%;top:48%;animation-delay:.09s}
.xalGround{position:absolute;z-index:2;right:clamp(2px,1vw,20px);bottom:1vh;width:clamp(140px,14vw,210px);height:56px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.92),rgba(20,0,26,.45) 42%,transparent 73%);filter:blur(7px)}.xal{position:absolute;z-index:3;right:clamp(2px,1vw,20px);bottom:0;width:clamp(280px,28vw,420px);max-height:80vh;object-fit:contain;filter:drop-shadow(0 14px 8px rgba(0,0,0,.82)) drop-shadow(0 0 10px rgba(100,24,150,.24))}
.enter{position:absolute;z-index:40;bottom:8%;left:34%;transform:translateX(-50%);text-align:center;border:1px solid rgba(212,175,55,0.65);background:rgba(4,0,12,0.85);color:#D4AF37;font-family:'Cinzel Decorative',serif;font-size:13px;letter-spacing:0.45em;text-transform:uppercase;padding:14px 48px;cursor:pointer;box-shadow:0 0 25px rgba(212,175,55,0.3),0 0 50px rgba(212,175,55,0.1),inset 0 0 20px rgba(0,0,0,0.5);transition:all 0.3s ease;animation:btnGoldPulse 2.5s ease-in-out infinite}.enter:hover{box-shadow:0 0 40px rgba(212,175,55,0.6),0 0 80px rgba(212,175,55,0.2);background:rgba(212,175,55,0.08)}
@keyframes btnGoldPulse{0%,100%{box-shadow:0 0 20px rgba(212,175,55,0.3),0 0 40px rgba(212,175,55,0.1)}50%{box-shadow:0 0 35px rgba(212,175,55,0.6),0 0 70px rgba(212,175,55,0.25)}}

/* User Type & Routing Panels */
.user-type-panel{position:absolute;z-index:35;bottom:12vh;left:28%;transform:translateX(-50%);width:min(680px,90vw);background:rgba(4,0,12,0.92);border:1px solid rgba(212,175,55,0.35);box-shadow:0 0 35px rgba(0,0,0,0.9),0 0 25px rgba(212,175,55,0.2);backdrop-filter:blur(14px);border-radius:4px;padding:20px 24px;text-align:center;font-family:'Cinzel',serif}
.panel-header-badge{font-family:'Geist Mono',monospace;font-size:9px;color:#D4AF37;letter-spacing:0.2em;margin-bottom:6px}
.panel-header-title{font-family:'Cinzel Decorative',serif;font-size:14px;color:#FFD700;letter-spacing:0.12em;margin:0 0 4px}
.panel-header-sub{font-size:10px;color:rgba(212,175,55,0.6);margin:0 0 14px}
.cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.cards-grid.route-grid{grid-template-columns:1fr 1fr}
.choice-card{background:rgba(10,2,18,0.7);border:1px solid rgba(212,175,55,0.2);border-radius:3px;padding:12px 10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;transition:all 0.25s ease}
.choice-card:hover{transform:translateY(-3px);border-color:#D4AF37;box-shadow:0 4px 20px rgba(212,175,55,0.25)}
.card-icon{font-size:16px;color:#FFD700}
.card-title{font-family:'Cinzel Decorative',serif;font-size:11px;color:#FFD700;margin:2px 0}
.card-desc{font-size:9.5px;line-height:1.4;color:rgba(220,210,240,0.8);margin:0}
.card-firsttime:hover{border-color:#c084fc;box-shadow:0 0 15px rgba(124,58,237,0.3)}
.card-recruiter:hover{border-color:#FFD700;box-shadow:0 0 15px rgba(212,175,55,0.4)}
.card-recruiter.highlight{border-color:rgba(212,175,55,0.5);background:rgba(212,175,55,0.06)}
.card-revisitor:hover{border-color:#cbd5e1;box-shadow:0 0 15px rgba(148,163,184,0.3)}

.passwordOverlay{position:absolute;z-index:50;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(8px)}
.passwordPanel{display:grid;gap:16px;width:min(360px,90vw);padding:30px;text-align:center;background:linear-gradient(145deg,#1b0508,#080004);border:1px solid #861515;box-shadow:0 0 55px rgba(180,0,0,.45);color:#dba39a}
.passwordPanel div{color:#7e1515;letter-spacing:.45em}
.passwordPanel b{font-size:15px;letter-spacing:.1em;font-family:'Cinzel',serif}
.passwordPanel input{padding:11px;background:#040004;border:1px solid #7e1515;color:#ffd0c0;text-align:center;font:16px 'Cinzel',serif}
.passwordPanel button{justify-self:center;padding:9px 26px;background:rgba(180,0,0,0.2);border:1px solid #9c2626;color:#da6868;font:13px 'Cinzel Decorative',serif;letter-spacing:.15em;cursor:pointer}
.shake{animation:shake .45s}
@keyframes breathe{50%{transform:scale(1.04)}}@keyframes moonFloat{50%{transform:translateY(8px) rotate(1deg)}}@keyframes flicker{to{transform:scale(.86,1.12);opacity:.7}}@keyframes shake{20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
@media(max-width:800px){.user-type-panel{left:50%;bottom:6vh;width:94vw;padding:14px}.cards-grid{grid-template-columns:1fr}.cards-grid.route-grid{grid-template-columns:1fr}.moon{top:5vh;left:4vw;width:108px}.torchLeft{left:19%;top:53%}.torchRight{right:19%;top:53%}.xalGround{right:-18px;width:28vw}.xal{right:-22px;width:56vw;bottom:1vh}.enter{left:50%;font-size:11px;padding:12px 32px}}
@media(max-height:520px){.moon{width:clamp(70px,12vw,95px);top:3vh;left:3vw}.user-type-panel{left:42%;bottom:8px;width:min(580px,84vw);padding:8px 12px}.panel-header-badge{font-size:7.5px;margin-bottom:2px}.panel-header-title{font-size:11px;margin:0 0 2px}.panel-header-sub{font-size:8.5px;margin:0 0 6px}.cards-grid{grid-template-columns:repeat(3,1fr);gap:6px}.cards-grid.route-grid{grid-template-columns:1fr 1fr}.choice-card{padding:6px 6px;gap:2px}.card-icon{font-size:12px}.card-title{font-size:9px}.card-desc{font-size:7.5px;line-height:1.25}.xal{max-height:75vh;right:1vw;width:clamp(160px,22vw,260px)}.xalGround{width:clamp(100px,12vw,160px);height:30px;right:1vw}.enter{bottom:6% !important;font-size:10px !important;padding:8px 24px !important;letter-spacing:0.25em !important;left:42% !important}}
`