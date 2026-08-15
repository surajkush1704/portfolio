// ============================================================================
// REALM 5 COMPONENT: WhatsNew (Dispatches from the Underlord)
// PURPOSE: Read-only live notice board showing latest updates from the Overlord
// ============================================================================

import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../../lib/firebase'

export interface Notice {
  id: string
  title: string
  content: string
  createdAt?: { seconds: number } | null
  active: boolean
  order: number
}

const DEFAULT_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'Socratiq LiveKit Voice Engine Deployed',
    content:
      'The multi-agent conversational loop for Socratiq has completed integration with LiveKit WebRTC and Moonshot Kimi models. Active voice testing underway.',
    active: true,
    order: 1,
  },
  {
    id: 'notice-2',
    title: 'Open for Remote Full-Stack GenAI Roles',
    content:
      'Available immediately for forward-thinking AI product teams and high-velocity engineering roles. Explore the Codex or request an audience via scroll.',
    active: true,
    order: 2,
  },
]

export function WhatsNew() {
  const [notices, setNotices] = useState<Notice[]>(DEFAULT_NOTICES)

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return

    try {
      const colRef = collection(db, 'notices')
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Notice, 'id'>),
              }))
              .filter((n) => n.active !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            if (fetched.length > 0) {
              setNotices(fetched)
            }
          }
        },
        (err) => {
          console.warn('WhatsNew dispatches error:', err)
        }
      )

      return () => unsubscribe()
    } catch {
      // Fallback to local default notices
    }
  }, [])

  return (
    <div className="whatsnew-panel">
      {/* Header */}
      <div className="whatsnew-header">
        <div className="whatsnew-title-wrap">
          <span className="whatsnew-icon">⚡</span>
          <div>
            <h3 className="whatsnew-title">DISPATCHES FROM THE OVERLORD</h3>
            <span className="whatsnew-sub">Latest developments from his domain</span>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="whatsnew-list">
        {notices.length === 0 ? (
          <p className="whatsnew-empty">
            "The Overlord's dispatches are currently being prepared. Return soon, mortal."
          </p>
        ) : (
          notices.slice(0, 5).map((n) => (
            <div key={n.id} className="notice-item">
              <div className="notice-meta">
                <span className="notice-badge">DISPATCH</span>
                <span className="notice-date">2026 // LIVE</span>
              </div>
              <h4 className="notice-item-title">{n.title}</h4>
              <p className="notice-item-content">{n.content}</p>
            </div>
          ))
        )}
      </div>

      <style>{`
        .whatsnew-panel {
          display: flex;
          flex-direction: column;
          background: rgba(4, 0, 12, 0.94);
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 6px;
          backdrop-filter: blur(16px);
          padding: 24px;
          height: 100%;
          min-height: 440px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.85);
        }
        .whatsnew-header {
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .whatsnew-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .whatsnew-icon {
          font-size: 22px;
          color: #D4AF37;
        }
        .whatsnew-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.12em;
          margin: 0;
        }
        .whatsnew-sub {
          font-size: 13px;
          color: rgba(212, 175, 55, 0.7);
          letter-spacing: 0.05em;
          margin-top: 2px;
          display: block;
        }
        .whatsnew-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 6px;
        }
        .whatsnew-list::-webkit-scrollbar {
          width: 4px;
        }
        .whatsnew-list::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.4);
          border-radius: 2px;
        }
        .notice-item {
          border-bottom: 1px solid rgba(212, 175, 55, 0.18);
          padding-bottom: 14px;
        }
        .notice-item:last-child {
          border-bottom: none;
        }
        .notice-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .notice-badge {
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 3px 8px;
          border-radius: 3px;
          font-family: 'Cinzel', serif;
          font-weight: 600;
        }
        .notice-date {
          font-family: 'Geist Mono', monospace;
          font-size: 12px;
          color: rgba(212, 175, 55, 0.7);
        }
        .notice-item-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFD700;
          margin: 6px 0;
          letter-spacing: 0.08em;
        }
        .notice-item-content {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(235, 225, 250, 0.92);
          margin: 0;
        }
        .whatsnew-empty {
          text-align: center;
          font-size: 14px;
          color: rgba(212, 175, 55, 0.75);
          font-style: italic;
          margin-top: 40px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
