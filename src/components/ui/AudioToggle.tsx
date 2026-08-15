import { Howler } from 'howler'
import { useCallback, useState } from 'react'

export function AudioToggle() {
  const [muted, setMuted] = useState(false)

  const toggleAudio = useCallback(() => {
    const nextMuted = !muted
    setMuted(nextMuted)
    Howler.mute(nextMuted)
  }, [muted])

  return (
    <button
      className="global-audio-toggle"
      onClick={toggleAudio}
      aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
      title={muted ? 'Unmute Audio' : 'Mute Audio'}
    >
      <span>{muted ? '🔇' : '🔊'}</span>
      <span>{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
    </button>
  )
}
