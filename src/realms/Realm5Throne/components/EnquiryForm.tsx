// ============================================================================
// REALM 5 COMPONENT: EnquiryForm (Request an Audience)
// PURPOSE: Direct communication scroll delivered to The Overlord via Firestore
// ============================================================================

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useState } from 'react'
import { db } from '../../../lib/firebase'
import { getSessionId, trackEvent } from '../../../services/analytics'
import { useStore } from '../../../store/useStore'

export function EnquiryForm() {
  const { userType } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isRecruiter = userType === 'recruiter'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('All mandatory runes (Name, Email, Message) must be inscribed.')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY) {
        await addDoc(collection(db, 'enquiries'), {
          name: formData.name.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          userType: userType ?? 'unknown',
          timestamp: serverTimestamp(),
          read: false,
          sessionId: getSessionId(),
        })
      }

      // Dispatch direct email alert to Overlord inbox
      try {
        fetch('https://formsubmit.co/ajax/surajkush1704@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `⚡ New Mortal Audience Request: ${formData.name.trim()} (${userType || 'Visitor'})`,
            Name: formData.name.trim(),
            Company: formData.company.trim() || 'Not Provided',
            Email: formData.email.trim(),
            Message: formData.message.trim(),
            UserType: userType || 'General Visitor',
            SessionId: getSessionId(),
          }),
        }).catch((e) => console.warn('Email dispatch notice:', e))
      } catch {
        // Non-blocking
      }

      trackEvent('enquiry_submitted', userType ?? 'unknown', {
        hasCompany: !!formData.company,
      })

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Failed to transmit scroll through the Nether. Please attempt once more.')
    }
  }

  return (
    <div className="enquiry-panel">
      {/* Header */}
      <div className="enquiry-header">
        <div className="enquiry-title-wrap">
          <span className="enquiry-icon">📜</span>
          <div>
            <h3 className="enquiry-title">REQUEST AN AUDIENCE</h3>
            <span className="enquiry-sub">Leave your offering for The Overlord</span>
          </div>
        </div>
      </div>

      {/* Recruiter Priority Notice */}
      {isRecruiter && (
        <div className="recruiter-note">
          ⚔ <em>The Overlord values decisive opportunities. This scroll reaches his personal sanctum directly.</em>
        </div>
      )}

      {status === 'success' ? (
        <div className="enquiry-success">
          <div className="success-icon">✓</div>
          <h4 className="success-title">YOUR SCROLL HAS BEEN DELIVERED</h4>
          <p className="success-text">
            "The Overlord has received your offering. He will respond when he deems you worthy. Safe passage, mortal."
          </p>
          <span className="success-sig">— Xal'Vorith</span>
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="enquiry-error">{errorMsg}</div>}

          <div className="form-group">
            <label className="form-label">YOUR NAME, MORTAL *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">YOUR REALM (COMPANY / DOMAIN)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Company or Organization"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">YOUR CONTACT SIGIL (EMAIL) *</label>
            <input
              type="email"
              className="form-input"
              placeholder="email@company.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">YOUR OFFERING (MESSAGE) *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="State your purpose, opportunity, or alliance proposal..."
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <button type="submit" className="enquiry-submit-btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'TRANSMITTING SCROLL...' : 'SEND THE SCROLL →'}
          </button>
        </form>
      )}

      <style>{`
        .enquiry-panel {
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
        .enquiry-header {
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .enquiry-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .enquiry-icon {
          font-size: 22px;
          color: #D4AF37;
        }
        .enquiry-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.12em;
          margin: 0;
        }
        .enquiry-sub {
          font-size: 13px;
          color: rgba(212, 175, 55, 0.7);
          letter-spacing: 0.05em;
          margin-top: 2px;
          display: block;
        }
        .recruiter-note {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 13.5px;
          color: #FFD700;
          margin-bottom: 14px;
          line-height: 1.5;
        }
        .enquiry-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-label {
          font-family: 'Cinzel', serif;
          font-size: 12.5px;
          letter-spacing: 0.15em;
          color: rgba(212, 175, 55, 0.85);
          font-weight: 600;
        }
        .form-input, .form-textarea {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #eee4ee;
          font-family: 'Cinzel', serif;
          font-size: 14px;
          padding: 10px 14px;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 10px rgba(212,175,55,0.25);
        }
        .form-textarea {
          resize: none;
        }
        .enquiry-submit-btn {
          margin-top: auto;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.6);
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          padding: 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .enquiry-submit-btn:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.45);
        }
        .enquiry-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .enquiry-error {
          font-size: 13px;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          padding: 8px 12px;
          border-radius: 4px;
        }
        .enquiry-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 1;
          padding: 30px 14px;
        }
        .success-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid #D4AF37;
          color: #FFD700;
          display: grid;
          place-content: center;
          font-size: 22px;
          margin-bottom: 16px;
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.45);
        }
        .success-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 17px;
          font-weight: 700;
          color: #FFD700;
          margin: 0 0 10px;
        }
        .success-text {
          font-size: 14px;
          line-height: 1.65;
          color: rgba(235, 225, 250, 0.9);
          font-style: italic;
          margin: 0 0 12px;
        }
        .success-sig {
          font-size: 13px;
          color: #D4AF37;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
