// ============================================================================
// ADMIN COMPONENT: AdminLetterBox
// PURPOSE: Manage enquiries/scrolls from mortals with real-time Firestore sync
// ============================================================================

import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../../lib/firebase'

export interface Enquiry {
  id: string
  name: string
  company?: string
  email: string
  message: string
  userType: string
  read: boolean
  timestamp?: { seconds: number } | null
}

export function AdminLetterBox() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'recruiter'>('all')

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return

    try {
      const q = query(collection(db, 'enquiries'), orderBy('timestamp', 'desc'))
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Enquiry, 'id'>),
            }))
            setEnquiries(fetched)
          } else {
            setEnquiries([])
          }
        },
        () => {}
      )
      return () => unsubscribe()
    } catch {
      // ignore
    }
  }, [])

  const markAsRead = async (id: string) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)))
    if (import.meta.env.VITE_FIREBASE_API_KEY) {
      try {
        await updateDoc(doc(db, 'enquiries', id), { read: true })
      } catch (err) {
        console.warn('Error marking read:', err)
      }
    }
  }

  const unreadCount = enquiries.filter((e) => !e.read).length
  const filtered = enquiries.filter((e) => {
    if (filter === 'unread') return !e.read
    if (filter === 'recruiter') return e.userType === 'recruiter'
    return true
  })

  return (
    <div className="admin-box">
      <div className="admin-box-header">
        <div>
          <h3 className="admin-box-title">THE LETTER BOX ({unreadCount})</h3>
          <span className="admin-box-sub">Scrolls received from mortals seeking audience</span>
        </div>

        {/* Filter Tabs */}
        <div className="admin-filters">
          <button className={`admin-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            ALL
          </button>
          <button className={`admin-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            UNREAD
          </button>
          <button className={`admin-tab ${filter === 'recruiter' ? 'active' : ''}`} onClick={() => setFilter('recruiter')}>
            RECRUITERS
          </button>
        </div>
      </div>

      <div className="enquiries-list">
        {filtered.length === 0 ? (
          <p className="admin-empty">No mortal scrolls received yet. Audience requests submitted in Realm 5 will materialize here in real-time.</p>
        ) : (
          filtered.map((enq) => (
            <div key={enq.id} className={`enquiry-card ${!enq.read ? 'unread' : ''}`}>
              <div className="enquiry-top-row">
                <div className="enquiry-sender">
                  <span className={`unread-dot ${!enq.read ? 'glowing' : ''}`} />
                  <span className="enquiry-name">{enq.name}</span>
                  {enq.company && <span className="enquiry-company">@{enq.company}</span>}
                </div>
                <span className={`user-badge ${enq.userType}`}>{enq.userType.toUpperCase()}</span>
              </div>

              <div className="enquiry-email">
                <a href={`mailto:${enq.email}`}>{enq.email}</a>
              </div>

              <p className="enquiry-msg">{enq.message}</p>

              <div className="enquiry-actions">
                {!enq.read && (
                  <button className="enquiry-btn read" onClick={() => markAsRead(enq.id)}>
                    ✓ MARK READ
                  </button>
                )}
                <a
                  href={`mailto:${enq.email}?subject=Re: Your inquiry to Suraj Kumar`}
                  className="enquiry-btn reply"
                >
                  REPLY VIA PARCHMENT ↗
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .admin-box {
          display: flex;
          flex-direction: column;
          background: rgba(10, 2, 22, 0.94);
          border: 1px solid rgba(124, 58, 237, 0.4);
          border-radius: 6px;
          padding: 24px;
          height: 100%;
          min-height: 440px;
          color: #eee4ee;
        }
        .admin-box-header {
          border-bottom: 1px solid rgba(124, 58, 237, 0.25);
          padding-bottom: 14px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 10px;
        }
        .admin-box-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          margin: 0;
          letter-spacing: 0.1em;
        }
        .admin-box-sub {
          font-size: 13px;
          color: #c084fc;
          margin-top: 2px;
          display: block;
        }
        .admin-filters {
          display: flex;
          gap: 6px;
        }
        .admin-tab {
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.35);
          color: #c084fc;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s;
        }
        .admin-tab.active {
          background: rgba(124, 58, 237, 0.35);
          color: #FFD700;
          border-color: #a855f7;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
        }
        .enquiries-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-right: 6px;
        }
        .enquiry-card {
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(124, 58, 237, 0.25);
          border-radius: 6px;
          padding: 16px 18px;
          transition: all 0.2s;
        }
        .enquiry-card.unread {
          border-color: rgba(255, 215, 0, 0.55);
          background: rgba(124, 58, 237, 0.1);
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
        }
        .enquiry-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .enquiry-sender {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.4);
        }
        .unread-dot.glowing {
          background: #FFD700;
          box-shadow: 0 0 10px #FFD700;
        }
        .enquiry-name {
          font-family: 'Cinzel Decorative', serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFD700;
        }
        .enquiry-company {
          font-size: 13px;
          color: #c084fc;
        }
        .user-badge {
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #FFD700;
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 3px 8px;
          border-radius: 3px;
          font-family: 'Geist Mono', monospace;
        }
        .enquiry-email {
          font-size: 13.5px;
          color: #a855f7;
          margin-bottom: 8px;
        }
        .enquiry-email a {
          color: #c084fc;
          text-decoration: underline;
        }
        .enquiry-msg {
          font-size: 14.5px;
          line-height: 1.6;
          color: rgba(235, 225, 250, 0.95);
          margin: 0 0 14px;
        }
        .enquiry-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .enquiry-btn {
          font-family: 'Cinzel', serif;
          font-size: 12.5px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .enquiry-btn.read {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid #22c55e;
          color: #4ade80;
        }
        .enquiry-btn.reply {
          background: rgba(124, 58, 237, 0.2);
          border: 1px solid #7c3aed;
          color: #e9d5ff;
        }
        .enquiry-btn.reply:hover {
          background: #7c3aed;
          color: #fff;
        }
        .admin-empty {
          font-size: 14.5px;
          color: rgba(212, 175, 55, 0.75);
          font-style: italic;
          text-align: center;
          margin-top: 40px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}
