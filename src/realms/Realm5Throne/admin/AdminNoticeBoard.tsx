// ============================================================================
// ADMIN COMPONENT: AdminNoticeBoard
// PURPOSE: Create, update, toggle visibility, and delete domain dispatches
// ============================================================================

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../../lib/firebase'
import type { Notice } from '../components/WhatsNew'

export function AdminNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([])

  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newActive, setNewActive] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return

    try {
      const colRef = collection(db, 'notices')
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<Notice, 'id'>),
            }))
            fetched.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            setNotices(fetched)
          } else {
            setNotices([])
          }
        },
        (err) => {
          console.warn('Notice board listener error:', err)
        }
      )
      return () => unsubscribe()
    } catch (err) {
      console.warn('Failed to initialize notice board listener:', err)
    }
  }, [])

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const newOrder = notices.length + 1
    const newDoc: Notice = {
      id: `notice-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      active: newActive,
      order: newOrder,
    }

    setNotices((prev) => [...prev, newDoc])
    setNewTitle('')
    setNewContent('')
    setCreating(false)

    if (import.meta.env.VITE_FIREBASE_API_KEY) {
      try {
        await addDoc(collection(db, 'notices'), {
          title: newDoc.title,
          content: newDoc.content,
          active: newDoc.active,
          order: newDoc.order,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.warn('Error creating notice:', err)
      }
    }
  }

  const toggleActive = async (notice: Notice) => {
    const nextActive = !notice.active
    setNotices((prev) =>
      prev.map((n) => (n.id === notice.id ? { ...n, active: nextActive } : n))
    )

    if (import.meta.env.VITE_FIREBASE_API_KEY && !notice.id.startsWith('demo-')) {
      try {
        await updateDoc(doc(db, 'notices', notice.id), {
          active: nextActive,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.warn('Error toggling active:', err)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Strike this dispatch from the Underworld?')) return
    setNotices((prev) => prev.filter((n) => n.id !== id))

    if (import.meta.env.VITE_FIREBASE_API_KEY && !id.startsWith('demo-')) {
      try {
        await deleteDoc(doc(db, 'notices', id))
      } catch (err) {
        console.warn('Error deleting notice:', err)
      }
    }
  }

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id)
    setEditTitle(notice.title)
    setEditContent(notice.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return

    setNotices((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title: editTitle.trim(), content: editContent.trim() } : n
      )
    )

    setEditingId(null)

    if (import.meta.env.VITE_FIREBASE_API_KEY && !id.startsWith('demo-')) {
      try {
        await updateDoc(doc(db, 'notices', id), {
          title: editTitle.trim(),
          content: editContent.trim(),
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.warn('Error updating notice:', err)
      }
    }
  }

  return (
    <div className="admin-box">
      <div className="admin-box-header">
        <div>
          <h3 className="admin-box-title">NOTICE BOARD DISPATCHES</h3>
          <span className="admin-box-sub">Publish live updates to Realm 5 visitors</span>
        </div>

        <button className="admin-create-btn" onClick={() => setCreating(!creating)}>
          {creating ? '✕ CANCEL' : '+ INSCRIBE DISPATCH'}
        </button>
      </div>

      {/* New Notice Form */}
      {creating && (
        <form className="new-notice-form" onSubmit={handleCreateNotice}>
          <input
            type="text"
            className="admin-input"
            placeholder="Dispatch Title (e.g., LiveKit Architecture Deployed)"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="admin-textarea"
            rows={3}
            placeholder="Dispatch content and technical details..."
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <label className="active-checkbox-label">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
            />
            Broadcast actively to visitors immediately
          </label>
          <button type="submit" className="admin-publish-btn">
            BROADCAST DISPATCH ⚡
          </button>
        </form>
      )}

      {/* Notices List */}
      <div className="notices-admin-list">
        {notices.length === 0 ? (
          <p className="admin-empty">No active dispatches. Click "+ INSCRIBE DISPATCH" above to publish decrees to mortals.</p>
        ) : (
          notices.map((n) => (
            <div key={n.id} className={`notice-admin-card ${!n.active ? 'inactive' : ''}`}>
              {editingId === n.id ? (
                <div className="edit-box">
                  <input
                    type="text"
                    className="admin-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="edit-actions">
                    <button className="admin-btn save" onClick={() => handleSaveEdit(n.id)}>
                      ✓ SAVE
                    </button>
                    <button className="admin-btn cancel" onClick={cancelEdit}>
                      ✕ CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="notice-admin-top">
                    <span className="notice-admin-title">{n.title}</span>
                    <button
                      className={`active-toggle-btn ${n.active ? 'active' : ''}`}
                      onClick={() => toggleActive(n)}
                    >
                      {n.active ? '● ACTIVE' : '○ DRAFT'}
                    </button>
                  </div>

                  <p className="notice-admin-content">{n.content}</p>

                  <div className="notice-admin-actions">
                    <button className="admin-btn edit" onClick={() => startEdit(n)}>
                      ✎ EDIT
                    </button>
                    <button className="admin-btn delete" onClick={() => handleDelete(n.id)}>
                      ✕ STRIKE
                    </button>
                  </div>
                </>
              )}
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
        .admin-create-btn {
          background: rgba(124, 58, 237, 0.2);
          border: 1px solid #7c3aed;
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.15em;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-create-btn:hover {
          background: #7c3aed;
          color: #fff;
        }
        .new-notice-form {
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(124, 58, 237, 0.3);
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .admin-input, .admin-textarea {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(124, 58, 237, 0.3);
          color: #eee4ee;
          font-family: 'Cinzel', serif;
          font-size: 14px;
          padding: 10px 14px;
          border-radius: 4px;
          outline: none;
        }
        .admin-input:focus, .admin-textarea:focus {
          border-color: #a855f7;
        }
        .admin-textarea {
          resize: none;
        }
        .active-checkbox-label {
          font-size: 13px;
          color: #c084fc;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .admin-publish-btn {
          background: rgba(124, 58, 237, 0.25);
          border: 1px solid #7c3aed;
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 13.5px;
          font-weight: 700;
          padding: 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .admin-publish-btn:hover {
          background: #7c3aed;
          color: #fff;
        }
        .notices-admin-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-right: 6px;
        }
        .notice-admin-card {
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(124, 58, 237, 0.25);
          border-radius: 6px;
          padding: 16px 18px;
          transition: all 0.2s;
        }
        .notice-admin-card.inactive {
          opacity: 0.6;
          border-style: dashed;
        }
        .notice-admin-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .notice-admin-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 16px;
          font-weight: 700;
          color: #FFD700;
        }
        .active-toggle-btn {
          font-size: 11px;
          letter-spacing: 0.15em;
          padding: 4px 10px;
          border-radius: 3px;
          cursor: pointer;
          background: rgba(100, 100, 100, 0.2);
          border: 1px solid rgba(150, 150, 150, 0.4);
          color: #ccc;
          font-family: 'Geist Mono', monospace;
        }
        .active-toggle-btn.active {
          background: rgba(34, 197, 94, 0.2);
          border-color: #22c55e;
          color: #4ade80;
        }
        .notice-admin-content {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(235, 225, 250, 0.92);
          margin: 6px 0 12px;
        }
        .notice-admin-actions {
          display: flex;
          gap: 10px;
        }
        .admin-btn {
          font-family: 'Cinzel', serif;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.15em;
          padding: 5px 12px;
          border-radius: 3px;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s;
        }
        .admin-btn.edit {
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #D4AF37;
        }
        .admin-btn.edit:hover {
          background: rgba(212, 175, 55, 0.15);
        }
        .admin-btn.delete {
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
        }
        .admin-btn.delete:hover {
          background: rgba(239, 68, 68, 0.15);
        }
        .edit-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .edit-actions {
          display: flex;
          gap: 8px;
        }
        .admin-btn.save {
          border: 1px solid #22c55e;
          color: #4ade80;
          background: rgba(34, 197, 94, 0.15);
        }
        .admin-btn.cancel {
          border: 1px solid #9ca3af;
          color: #cbd5e1;
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
