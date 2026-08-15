// ============================================================================
// REALM 5: THE THRONE ROOM (Main Router)
// PURPOSE: Decides between the Overlord Admin Chamber (Moon route) or
//          the visitor Throne Scene based on isAdmin state.
// ============================================================================

import { useStore } from '../../store/useStore'
import { AdminPanel } from './admin/AdminPanel'
import { ThroneScene } from './components/ThroneScene'

interface Props {
  onNext?: () => void
  onPrev?: () => void
  initialFinished?: boolean
}

export default function Realm5Throne({ onNext, onPrev }: Props) {
  const { isAdmin } = useStore()

  if (isAdmin) {
    return <AdminPanel onExitAdmin={() => onNext?.()} />
  }

  return (
    <ThroneScene
      onReturnToGate={() => onNext?.()}
      onPrevRealm={() => onPrev?.()}
    />
  )
}
