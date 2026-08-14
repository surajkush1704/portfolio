import { AnimatePresence, motion } from 'framer-motion'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { DialogueBox } from '../../components/ui/DialogueBox'
import type { DialogueState } from '../../components/ui/DialogueBox'

type Sound = 'ambient' | 'thunder' | 'arrival' | 'slam' | 'moon' | 'stone' | 'scream' | 'gold'

const paragraphs = [
  '...Another mortal. How quaint.',
  "I am Xal'Vorith, the Crowned Slave of the Endless One. I have ended empires before breakfast and rebuilt them by dusk — yet I stand here, willingly, as guide to one whose power eclipses even mine.",
  'You should feel honoured. Most who seek an audience with The Overlord simply... cease to exist. These gates have not opened for a mortal in a very long time.',
  'I suggest you do not waste this moment.',
  'Enter.',
]

const audioFiles: Record<Sound, string> = {
  ambient: 'ambient-drone.mp3', thunder: 'thunder.mp3', arrival: 'glass-shatter.mp3', slam: 'gate-slam.mp3',
  moon: 'moon-rumble.mp3', stone: 'stone-crack.mp3', scream: 'moon-scream.mp3', gold: 'gold-resonance.mp3',
}

interface Props {
  onNext?: () => void
  initialFinished?: boolean
}

export default function Realm0Gate({ onNext, initialFinished }: Props) {
  const sounds = useRef<Partial<Record<Sound, Howl>>>({})
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [line, setLine] = useState(0)
  const [dialogueComplete, setDialogueComplete] = useState(false)
  const [entered, setEntered] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordWrong, setPasswordWrong] = useState(false)
  const moonClicks = useRef(0)
  const lastMoonClick = useRef(0)
  const [dialogueState, setDialogueState] = useState<DialogueState>('narration')
  const [dialogueText, setDialogueText] = useState(paragraphs[0])
  const dialogueVisible = !dialogueComplete

  const play = useCallback((name: Sound) => {
    if (!audioEnabled) return
    const sound = sounds.current[name] ??= new Howl({ src: [`/audio/${audioFiles[name]}`], loop: name === 'ambient', volume: name === 'ambient' ? .34 : .62 })
    sound.play()
  }, [audioEnabled])

  const advance = useCallback(() => {
    if (dialogueComplete || entered) return
    const nextLine = Math.min(line + 1, paragraphs.length - 1)
    setLine(nextLine)
    setDialogueText(paragraphs[nextLine])
    if (nextLine === paragraphs.length - 1) {
      setDialogueState('idle')
      const finish = window.setTimeout(() => setDialogueComplete(true), 1500)
      return () => window.clearTimeout(finish)
    }
  }, [dialogueComplete, entered, line])

  useEffect(() => {
    const arrival = window.setTimeout(() => { play('ambient'); play('arrival') }, 750)
    const thunder = window.setInterval(() => play('thunder'), 10000)
    const onKey = (event: KeyboardEvent) => { if (!(event.target instanceof HTMLInputElement) && !passwordVisible) advance() }
    window.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(arrival); window.clearInterval(thunder); window.removeEventListener('keydown', onKey); Object.values(sounds.current).forEach(sound => sound?.stop()) }
  }, [advance, passwordVisible, play])

  useEffect(() => {
    if (initialFinished) {
      setLine(paragraphs.length - 1)
      setDialogueComplete(true)
      setEntered(true)
      setDialogueState('idle')
      setDialogueText(paragraphs[paragraphs.length - 1])
    }
  }, [initialFinished])

  const openGate = () => {
    if (!entered) {
      setEntered(true)
      play('slam')
      Object.values(sounds.current).forEach(s => s?.fade(s?.volume() ?? 0, 0, 800))
      window.setTimeout(() => onNext?.(), 1800)
    }
  }
  const awakenMoon = () => {
    const now = Date.now()
    moonClicks.current = now - lastMoonClick.current > 8000 ? 1 : moonClicks.current + 1
    lastMoonClick.current = now
    play(moonClicks.current === 3 ? 'stone' : 'moon')
    if (moonClicks.current === 3) { moonClicks.current = 0; window.setTimeout(() => setPasswordVisible(true), 600) }
  }
  const submitPassword = (event: FormEvent) => {
    event.preventDefault()
    if (password && password === import.meta.env.VITE_MASTER_KEY) {
      setPasswordVisible(false)
      setEntered(true)
      play('gold')
      play('slam')
      Object.values(sounds.current).forEach(s => s?.fade(s?.volume() ?? 0, 0, 800))
      window.setTimeout(() => onNext?.(), 1800)
      return
    }
    setPassword(''); setPasswordWrong(true); play('scream'); window.setTimeout(() => { setPasswordWrong(false); setPasswordVisible(false) }, 1700)
  }

  return <main className={`realm ${entered ? 'entered' : ''}`}>
    <style>{styles}</style>
    <div className="background backgroundBefore" />
    <div className="background backgroundAfter" />
    <div className="atmosphere" />
    <button className="moon" onClick={awakenMoon} aria-label="Blood moon — click three times"><video src="/videos/blood-moon.mp4" autoPlay muted loop playsInline /></button>
    <i className="torch torchLeft" /><i className="torch torchRight" />
    <div className="xalGround" />
    <motion.img className="xal" src="/images/xalvorith-standing.png" alt="Xal'Vorith, the Crowned Slave" initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.25, delay: .55 }} />

    <DialogueBox
      speaker="Xal'Vorith — The Crowned Slave"
      text={dialogueText}
      state={dialogueState}
      visible={dialogueVisible}
      variant="realm2"
      onTypeComplete={advance}
      onSkip={advance}
      hintText="[ CLICK ANYWHERE OR PRESS ANY KEY TO CONTINUE ]"
    />

    <AnimatePresence>{dialogueComplete && !entered && <motion.button className="enter" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} style={{ left: '38%', transform: 'translateX(-50%)', bottom: '8%' }} onClick={openGate}>ENTER THE UNDERWORLD</motion.button>}</AnimatePresence>
    <button className="mute" onClick={() => setAudioEnabled(value => !value)}>♫ {audioEnabled ? 'MUTE' : 'UNMUTE'}</button>
    <AnimatePresence>{passwordVisible && <motion.div className="passwordOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.form className={passwordWrong ? 'passwordPanel shake' : 'passwordPanel'} onSubmit={submitPassword} initial={{ y: 80 }} animate={{ y: 0 }}><div>ᚱ ᚠ ᚨ ᚾ ᚢ ᚦ</div><b>SPEAK YOUR NAME, ENDLESS ONE</b><input autoFocus type="password" value={password} onChange={event => setPassword(event.target.value)} /><button>SUBMIT</button></motion.form></motion.div>}</AnimatePresence>
  </main>
}

const styles = `@import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp:wght@400;700&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&display=swap');
.realm{position:fixed;inset:0;isolation:isolate;width:100vw;height:100vh;width:100dvw;height:100dvh;overflow:hidden;background:#030104;color:#eee4ee;font-family:'UnifrakturCook',serif}.background{position:absolute;inset:-2%;z-index:-5;background:center/contain no-repeat;transform:scale(1.015);animation:breathe 12s ease-in-out infinite}.backgroundBefore{background-image:url('/images/bg1.png')}.backgroundAfter{z-index:-4;background-image:url('/images/bg2.png');opacity:0;transition:opacity 1.3s ease}.entered .backgroundAfter{opacity:1}.atmosphere{position:absolute;inset:0;z-index:-3;pointer-events:none;background:linear-gradient(90deg,rgba(3,0,4,.3),transparent 43%,rgba(3,0,4,.18)),linear-gradient(0deg,rgba(0,0,0,.42),transparent 47%)}
.moon{position:absolute;z-index:1;top:5vh;left:4vw;width:clamp(110px,13vw,210px);aspect-ratio:1;padding:0;border:0;background:transparent;cursor:pointer;overflow:hidden;clip-path:circle(43% at 50% 50%);mix-blend-mode:screen;animation:moonFloat 9s ease-in-out infinite}.moon video{display:block;width:145%;height:145%;margin:-22.5%;object-fit:cover;mix-blend-mode:screen;filter:contrast(1.22) saturate(1.18)}.torch{position:absolute;z-index:1;width:70px;height:120px;border-radius:50%;background:radial-gradient(ellipse at 50% 20%,rgba(255,255,190,.9) 0 4%,rgba(255,100,0,.85) 11%,rgba(255,35,0,.45) 35%,transparent 70%);filter:blur(3px);mix-blend-mode:screen;animation:flicker .18s infinite alternate}.torchLeft{left:27.5%;top:48%}.torchRight{right:27.5%;top:48%;animation-delay:.09s}
.xalGround{position:absolute;z-index:2;right:clamp(2px,1vw,20px);bottom:1vh;width:clamp(140px,14vw,210px);height:56px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.92),rgba(20,0,26,.45) 42%,transparent 73%);filter:blur(7px)}.xal{position:absolute;z-index:3;right:clamp(2px,1vw,20px);bottom:0;width:clamp(280px,28vw,420px);max-height:80vh;object-fit:contain;filter:drop-shadow(0 14px 8px rgba(0,0,0,.82)) drop-shadow(0 0 10px rgba(100,24,150,.24))}
.mute{position:absolute;z-index:7;right:18px;bottom:16px;border:0;background:transparent;color:rgba(230,215,230,.72);font:16px 'UnifrakturCook',serif;letter-spacing:.12em;cursor:pointer}
.enter{position:absolute;z-index:40;bottom:8%;left:38%;transform:translateX(-50%);text-align:center;border:1px solid rgba(212,175,55,0.65);background:rgba(4,0,12,0.85);color:#D4AF37;font-family:'Cinzel Decorative',serif;font-size:13px;letter-spacing:0.45em;text-transform:uppercase;padding:14px 48px;cursor:pointer;box-shadow:0 0 25px rgba(212,175,55,0.3),0 0 50px rgba(212,175,55,0.1),inset 0 0 20px rgba(0,0,0,0.5);transition:all 0.3s ease;animation:btnGoldPulse 2.5s ease-in-out infinite}.enter:hover{box-shadow:0 0 40px rgba(212,175,55,0.6),0 0 80px rgba(212,175,55,0.2);background:rgba(212,175,55,0.08)}
@keyframes btnGoldPulse{0%,100%{box-shadow:0 0 20px rgba(212,175,55,0.3),0 0 40px rgba(212,175,55,0.1)}50%{box-shadow:0 0 35px rgba(212,175,55,0.6),0 0 70px rgba(212,175,55,0.25)}}
.passwordOverlay{position:absolute;z-index:20;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72)}.passwordPanel{display:grid;gap:16px;width:min(360px,90vw);padding:30px;text-align:center;background:linear-gradient(145deg,#1b0508,#080004);border:1px solid #861515;box-shadow:0 0 55px rgba(180,0,0,.45);color:#dba39a}.passwordPanel div{color:#7e1515;letter-spacing:.45em}.passwordPanel b{font-size:16px;letter-spacing:.1em}.passwordPanel input{padding:11px;background:#040004;border:1px solid #7e1515;color:#ffd0c0;text-align:center;font:18px 'UnifrakturCook',serif}.passwordPanel button{justify-self:center;padding:9px 26px;background:transparent;border:1px solid #9c2626;color:#da6868;font:16px 'UnifrakturCook',serif;letter-spacing:.15em;cursor:pointer}.shake{animation:shake .45s}
@keyframes breathe{50%{transform:scale(1.04)}}@keyframes moonFloat{50%{transform:translateY(8px) rotate(1deg)}}@keyframes flicker{to{transform:scale(.86,1.12);opacity:.7}}@keyframes fire{50%{color:#fff2a8;text-shadow:0 0 6px #fff,0 0 18px #ffb000,0 0 36px #ff3000,0 0 65px #a40000}}@keyframes shake{20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
@media(max-width:800px){.moon{top:5vh;left:4vw;width:108px}.torchLeft{left:19%;top:53%}.torchRight{right:19%;top:53%}.xalGround{right:-18px;width:28vw}.xal{right:-22px;width:56vw;bottom:1vh}.mute{font-size:12px}.enter{font-size:11px;padding:12px 32px}}
`