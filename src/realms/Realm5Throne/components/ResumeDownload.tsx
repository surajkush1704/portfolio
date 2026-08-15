// ============================================================================
// REALM 5 COMPONENT: ResumeDownload (The Overlord's Codex)
// PURPOSE: Downloadable credentials condensed in parchment styling with dual track toggle
// ============================================================================

import { useState } from 'react'
import { trackEvent } from '../../../services/analytics'
import { useStore } from '../../../store/useStore'

export function ResumeDownload() {
  const { userType } = useStore()
  const [version, setVersion] = useState<'genai' | 'aipm'>('genai')
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    trackEvent('resume_downloaded', userType ?? 'unknown', { version })

    const fileName =
      version === 'genai'
        ? 'Suraj-Kumar-GenAI-Engineer.pdf'
        : 'Suraj-Kumar-AI-Product-Manager.pdf'

    const targetUrl =
      version === 'genai'
        ? '/resume/suraj-kumar-genai-engineer.pdf'
        : '/resume/suraj-kumar-aipm.pdf'

    // Initiate download link
    const link = document.createElement('a')
    link.href = targetUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloaded(true)
  }

  return (
    <div className="resume-panel">
      {/* Header */}
      <div className="resume-header">
        <div className="resume-title-wrap">
          <span className="resume-icon">⚗</span>
          <div>
            <h3 className="resume-title">THE OVERLORD'S CODEX</h3>
            <span className="resume-sub">His credentials, condensed & verified</span>
          </div>
        </div>
      </div>

      {/* Parchment Preview Card */}
      <div className="codex-parchment">
        <div className="codex-watermark">ᚱ ᚠ ᚨ</div>
        <h4 className="codex-name">SURAJ KUMAR</h4>
        <span className="codex-role">
          {version === 'genai'
            ? 'GenAI Engineer · Systems Architect'
            : 'AI Product Builder · Full-Stack Engineer'}
        </span>
        <div className="codex-divider" />
        <ul className="codex-skills">
          <li>◈ Multi-Agent Systems & LiveKit Voice (Socratiq)</li>
          <li>◈ LangChain, pgvector & Cross-Jurisdictional RAG</li>
          <li>◈ Gemini 2.0 Flash & Vision Pipelines (Kino)</li>
          <li>◈ FastAPI, Next.js, Flutter, Neon PostgreSQL</li>
          <li>◈ MCA Final Year · Pondicherry University (2026)</li>
        </ul>
      </div>

      {/* Version Selector Toggle */}
      <div className="codex-toggle-bar">
        <button
          className={`toggle-btn ${version === 'genai' ? 'active' : ''}`}
          onClick={() => setVersion('genai')}
        >
          [ GenAI Engineer ]
        </button>
        <span className="toggle-sep">·</span>
        <button
          className={`toggle-btn ${version === 'aipm' ? 'active' : ''}`}
          onClick={() => setVersion('aipm')}
        >
          [ AI Product Manager ]
        </button>
      </div>

      {/* Download Action */}
      <button className={`codex-download-btn ${downloaded ? 'downloaded' : ''}`} onClick={handleDownload}>
        {downloaded ? '✓ CODEX CLAIMED (DOWNLOAD AGAIN)' : 'DOWNLOAD THE CODEX ↓'}
      </button>

      {downloaded && (
        <p className="codex-download-ack">
          "The Overlord's credentials are now in your custody, mortal. Deploy them with purpose."
        </p>
      )}

      <style>{`
        .resume-panel {
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
        .resume-header {
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .resume-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .resume-icon {
          font-size: 22px;
          color: #D4AF37;
        }
        .resume-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.12em;
          margin: 0;
        }
        .resume-sub {
          font-size: 13px;
          color: rgba(212, 175, 55, 0.7);
          letter-spacing: 0.05em;
          margin-top: 2px;
          display: block;
        }
        .codex-parchment {
          position: relative;
          background: linear-gradient(145deg, rgba(24, 12, 36, 0.85), rgba(8, 2, 16, 0.95));
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 4px;
          padding: 20px;
          text-align: center;
          margin-bottom: 16px;
          overflow: hidden;
        }
        .codex-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 64px;
          color: rgba(212, 175, 55, 0.05);
          font-family: 'Cinzel Decorative', serif;
          pointer-events: none;
        }
        .codex-name {
          font-family: 'Cinzel Decorative', serif;
          font-size: 20px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.15em;
          margin: 0 0 4px;
        }
        .codex-role {
          font-size: 14.5px;
          color: rgba(212, 175, 55, 0.85);
          letter-spacing: 0.08em;
          display: block;
        }
        .codex-divider {
          width: 80px;
          height: 1px;
          background: rgba(212, 175, 55, 0.45);
          margin: 12px auto;
        }
        .codex-skills {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }
        .codex-skills li {
          font-size: 14px;
          color: rgba(235, 225, 250, 0.95);
          line-height: 1.55;
          letter-spacing: 0.02em;
        }
        .codex-toggle-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .toggle-btn {
          background: transparent;
          border: none;
          color: rgba(212, 175, 55, 0.6);
          font-family: 'Cinzel', serif;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 4px 8px;
        }
        .toggle-btn.active {
          color: #FFD700;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }
        .toggle-sep {
          color: rgba(212, 175, 55, 0.35);
          font-size: 14px;
        }
        .codex-download-btn {
          margin-top: auto;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.6);
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.2em;
          padding: 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .codex-download-btn:hover {
          background: rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.45);
        }
        .codex-download-btn.downloaded {
          border-color: #22c55e;
          color: #4ade80;
          background: rgba(34, 197, 94, 0.15);
        }
        .codex-download-ack {
          font-size: 13px;
          color: rgba(212, 175, 55, 0.85);
          font-style: italic;
          text-align: center;
          margin: 10px 0 0;
          line-height: 1.45;
        }
      `}</style>
    </div>
  )
}
