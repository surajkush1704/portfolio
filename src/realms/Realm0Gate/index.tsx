import { AnimatePresence, motion } from 'framer-motion'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

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

  const play = useCallback((name: Sound) => {
    if (!audioEnabled) return
    const sound = sounds.current[name] ??= new Howl({ src: [`/audio/${audioFiles[name]}`], loop: name === 'ambient', volume: name === 'ambient' ? .34 : .62 })
    sound.play()
  }, [audioEnabled])

  const advance = useCallback(() => {
    if (dialogueComplete || entered) return
    setLine(current => Math.min(current + 1, paragraphs.length - 1))
  }, [dialogueComplete, entered])

  useEffect(() => {
    const arrival = window.setTimeout(() => { play('ambient'); play('arrival') }, 750)
    const thunder = window.setInterval(() => play('thunder'), 10000)
    const onKey = (event: KeyboardEvent) => { if (!(event.target instanceof HTMLInputElement) && !passwordVisible) advance() }
    window.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(arrival); window.clearInterval(thunder); window.removeEventListener('keydown', onKey); Object.values(sounds.current).forEach(sound => sound?.stop()) }
  }, [advance, passwordVisible, play])

  // If the realm has been completed previously, restore finished state
  useEffect(() => {
    if (initialFinished) {
      setLine(paragraphs.length - 1)
      setDialogueComplete(true)
      setEntered(true)
    }
  }, [initialFinished])

  useEffect(() => {
    if (line !== paragraphs.length - 1) return
    const finish = window.setTimeout(() => setDialogueComplete(true), 1500)
    return () => window.clearTimeout(finish)
  }, [line])

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

    <AnimatePresence>{!dialogueComplete && <motion.section className="dialogue" onClick={advance} role="button" tabIndex={0} aria-label="Advance dialogue" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -22 }} transition={{ duration: .55 }}>
      <div className="speaker"><span />Xal'Vorith — The Crowned Slave</div>
      <AnimatePresence mode="wait"><motion.p key={line} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: .38 }}>{paragraphs[line]}</motion.p></AnimatePresence>
      {line !== paragraphs.length - 1 && <small>click anywhere or press any key to continue</small>}
    </motion.section>}</AnimatePresence>

    <AnimatePresence>{dialogueComplete && !entered && <motion.button className="enter" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1.25 }} style={{ left: '45%' }} onClick={openGate}>ENTER</motion.button>}</AnimatePresence>
    <button className="mute" onClick={() => setAudioEnabled(value => !value)}>♫ {audioEnabled ? 'MUTE' : 'UNMUTE'}</button>
    <AnimatePresence>{passwordVisible && <motion.div className="passwordOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.form className={passwordWrong ? 'passwordPanel shake' : 'passwordPanel'} onSubmit={submitPassword} initial={{ y: 80 }} animate={{ y: 0 }}><div>ᚱ ᚠ ᚨ ᚾ ᚢ ᚦ</div><b>SPEAK YOUR NAME, ENDLESS ONE</b><input autoFocus type="password" value={password} onChange={event => setPassword(event.target.value)} /><button>SUBMIT</button></motion.form></motion.div>}</AnimatePresence>
  </main>
}

const styles = `@import url('https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap');
.realm{position:fixed;inset:0;isolation:isolate;width:100vw;height:100vh;width:100dvw;height:100dvh;overflow:hidden;background:#030104;color:#eee4ee;font-family:'UnifrakturCook',serif}.background{position:absolute;inset:-2%;z-index:-5;background:center/cover no-repeat;transform:scale(1.015);animation:breathe 12s ease-in-out infinite}.backgroundBefore{background-image:url('/images/bg1.png')}.backgroundAfter{z-index:-4;background-image:url('/images/bg2.png');opacity:0;transition:opacity 1.3s ease}.entered .backgroundAfter{opacity:1}.atmosphere{position:absolute;inset:0;z-index:-3;pointer-events:none;background:linear-gradient(90deg,rgba(3,0,4,.3),transparent 43%,rgba(3,0,4,.18)),linear-gradient(0deg,rgba(0,0,0,.42),transparent 47%)}
.moon{position:absolute;z-index:1;top:5vh;left:4vw;width:clamp(110px,13vw,210px);aspect-ratio:1;padding:0;border:0;background:transparent;cursor:pointer;overflow:hidden;clip-path:circle(43% at 50% 50%);mix-blend-mode:screen;animation:moonFloat 9s ease-in-out infinite}.moon video{display:block;width:145%;height:145%;margin:-22.5%;object-fit:cover;mix-blend-mode:screen;filter:contrast(1.22) saturate(1.18)}.torch{position:absolute;z-index:1;width:70px;height:120px;border-radius:50%;background:radial-gradient(ellipse at 50% 20%,rgba(255,255,190,.9) 0 4%,rgba(255,100,0,.85) 11%,rgba(255,35,0,.45) 35%,transparent 70%);filter:blur(3px);mix-blend-mode:screen;animation:flicker .18s infinite alternate}.torchLeft{left:27.5%;top:48%}.torchRight{right:27.5%;top:48%;animation-delay:.09s}
.xalGround{position:absolute;z-index:2;right:clamp(12px,6vw,116px);bottom:1vh;width:clamp(230px,28vw,450px);height:56px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.92),rgba(20,0,26,.45) 42%,transparent 73%);filter:blur(7px)}.xal{position:absolute;z-index:3;right:clamp(16px,7vw,130px);bottom:0;width:clamp(230px,28vw,470px);max-height:85vh;object-fit:contain;filter:drop-shadow(0 14px 8px rgba(0,0,0,.82)) drop-shadow(0 0 10px rgba(100,24,150,.24))}
.dialogue{position:absolute;z-index:5;right:clamp(28vw,35vw,41vw);bottom:clamp(8vh,14vh,150px);width:min(500px,38vw);min-height:158px;padding:20px 24px;border-left:2px solid rgba(212,175,55,.85);background:linear-gradient(90deg,rgba(4,0,11,.86),rgba(4,0,11,.25));box-shadow:inset 30px 0 45px rgba(0,0,0,.25);cursor:pointer;text-shadow:0 2px 8px #000}.speaker{display:flex;align-items:center;gap:9px;margin-bottom:13px;color:#e2a93d;font-size:clamp(13px,1.1vw,17px);letter-spacing:.1em;text-transform:uppercase}.speaker span{width:3px;height:20px;background:#d4af37}.dialogue p{margin:0;font-size:clamp(16px,1.55vw,23px);line-height:1.6;letter-spacing:.035em}.dialogue small{display:block;margin-top:15px;color:rgba(232,232,240,.62);font-size:clamp(11px,.8vw,14px);letter-spacing:.12em;text-transform:uppercase}.enter{position:absolute;z-index:6;left:50%;bottom:7vh;width:clamp(90px,12.5vw,180px);aspect-ratio:2/1;display:grid;place-items:center;transform:translateX(-50%);border:0;background:transparent;color:#ffd36e;font:700 clamp(20px,2.5vw,41px)/1 'UnifrakturCook',serif;letter-spacing:.2em;cursor:pointer;text-shadow:0 0 4px #fff3b0,0 0 12px #ffb000,0 0 25px #ff4700,0 0 48px #cc1200;animation:fire 1.25s ease-in-out infinite}.mute{position:absolute;z-index:7;right:18px;bottom:16px;border:0;background:transparent;color:rgba(230,215,230,.72);font:16px 'UnifrakturCook',serif;letter-spacing:.12em;cursor:pointer}
.passwordOverlay{position:absolute;z-index:20;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72)}.passwordPanel{display:grid;gap:16px;width:min(360px,90vw);padding:30px;text-align:center;background:linear-gradient(145deg,#1b0508,#080004);border:1px solid #861515;box-shadow:0 0 55px rgba(180,0,0,.45);color:#dba39a}.passwordPanel div{color:#7e1515;letter-spacing:.45em}.passwordPanel b{font-size:16px;letter-spacing:.1em}.passwordPanel input{padding:11px;background:#040004;border:1px solid #7e1515;color:#ffd0c0;text-align:center;font:18px 'UnifrakturCook',serif}.passwordPanel button{justify-self:center;padding:9px 26px;background:transparent;border:1px solid #9c2626;color:#da6868;font:16px 'UnifrakturCook',serif;letter-spacing:.15em;cursor:pointer}.shake{animation:shake .45s}
@keyframes breathe{50%{transform:scale(1.04)}}@keyframes moonFloat{50%{transform:translateY(8px) rotate(1deg)}}@keyframes flicker{to{transform:scale(.86,1.12);opacity:.7}}@keyframes fire{50%{color:#fff2a8;text-shadow:0 0 6px #fff,0 0 18px #ffb000,0 0 36px #ff3000,0 0 65px #a40000}}@keyframes shake{20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
@media(max-width:800px){.moon{top:5vh;left:4vw;width:108px}.torchLeft{left:19%;top:53%}.torchRight{right:19%;top:53%}.xalGround{right:-18px;width:48vw}.xal{right:-22px;width:47vw;bottom:1vh}.dialogue{right:38vw;bottom:12vh;width:57vw;min-height:185px;padding:14px}.dialogue p{font-size:15px}.speaker{font-size:12px}.enter{font-size:21px;bottom:5vh}}
`
