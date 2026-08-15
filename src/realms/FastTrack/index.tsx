// ============================================================================
// FAST TRACK DIMENSION: RECRUITER CV ROOM
// PURPOSE: A compressed, highly legible single-page briefing room designed for
//          recruiters who need essential credentials before proceeding to the Throne.
// ============================================================================

import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { trackEvent, trackRealmEntry } from '../../services/analytics'
import { useStore } from '../../store/useStore'

interface Props {
  onProceedToThrone: () => void
}

const FAST_SKILLS = [
  { name: 'LLM & Agent Systems', desc: 'Gemini, GPT-4o, Claude 3.5 Sonnet, LiveKit STT/TTS loops, Multi-Agent routing.' },
  { name: 'RAG & Vector Search', desc: 'LangChain, pgvector, hybrid semantic search, context management pipelines.' },
  { name: 'Full-Stack Architecture', desc: 'FastAPI, Python, Next.js, TypeScript, PostgreSQL, Cloudflare Workers.' },
  { name: 'AI Product Strategy', desc: 'Problem decomposition, prompt architecture, speed-to-market vibe coding.' },
  { name: 'Cross-Platform Mobile', desc: 'Flutter & Dart for native AI assistant apps with offline resilience.' },
]

const FAST_PROJECTS = [
  {
    title: 'Socratiq',
    tagline: 'Multi-agent AI Voice Tutor with real-time WebRTC conversational loop',
    stack: 'FastAPI · LiveKit · Kimi · Mistral · Neon PostgreSQL',
    liveUrl: null,
    githubUrl: 'https://github.com/surajkush1704',
  },
  {
    title: 'Kino',
    tagline: 'AI Cinema Engine transforming raw scripts into storyboard sequences',
    stack: 'Gemini 2.0 Flash · Next.js · FastAPI · Tailwind',
    liveUrl: null,
    githubUrl: 'https://github.com/surajkush1704',
  },
  {
    title: 'ContractGuard',
    tagline: 'Cross-jurisdictional AI legal contract & indemnity risk analyzer',
    stack: 'Next.js · LangChain · Claude 3.5 Sonnet · pgvector',
    liveUrl: 'https://contractguard.ai',
    githubUrl: 'https://github.com/surajkush1704',
  },
  {
    title: 'ELI5 AI',
    tagline: 'Dynamic concept explainer adapting across 5 cognitive depths',
    stack: 'React · Tailwind · Gemini API',
    liveUrl: 'https://eli5-ai.vercel.app',
    githubUrl: 'https://github.com/surajkush1704',
  },
  {
    title: 'Asha Kiran',
    tagline: 'Women Empowerment ecosystem with multilingual voice assistant',
    stack: 'Flutter · Firebase · Gemini',
    liveUrl: null,
    githubUrl: 'https://github.com/surajkush1704',
  },
]

export default function FastTrack({ onProceedToThrone }: Props) {
  const { userType } = useStore()
  const [scrollProgress, setScrollProgress] = useState(0)

  // Track scroll percentage for top gold progress indicator
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
    setScrollProgress(progress || 0)
  }

  const handleProceed = useCallback(() => {
    trackRealmEntry(5)
    trackEvent('fast_track_completed', userType ?? 'recruiter')
    onProceedToThrone()
  }, [userType, onProceedToThrone])

  useEffect(() => {
    trackEvent('fast_track_opened', userType ?? 'recruiter')
  }, [userType])

  return (
    <div className="fast-track-container" onScroll={handleScroll}>
      {/* Top Gold Scroll Progress Bar */}
      <div className="fast-track-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <main className="fast-track-content">
        {/* Header Briefing */}
        <motion.header
          className="ft-section ft-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ft-badge">FAST TRACK BRIEFING // RECRUITER PORTAL</div>
          <h1 className="ft-title">THE ESSENTIAL CODEX</h1>
          <p className="ft-intro">
            "I will be brief, recruiter. The Overlord values both your time and his own. What follows is everything
            essential before your audience at the Throne." — <em>Xal'Vorith</em>
          </p>
        </motion.header>

        {/* Section 1: Identity & Credentials */}
        <section className="ft-section ft-card">
          <h2 className="ft-section-heading">01 // WHO HE IS</h2>
          <div className="ft-grid-2">
            <div className="ft-info-item">
              <span className="ft-label">ARCHITECT</span>
              <span className="ft-value highlight">Suraj Kumar</span>
            </div>
            <div className="ft-info-item">
              <span className="ft-label">SPECIALIZATION</span>
              <span className="ft-value">GenAI Engineer · AI Product Builder</span>
            </div>
            <div className="ft-info-item">
              <span className="ft-label">ACADEMIC BACKGROUND</span>
              <span className="ft-value">MCA Final Year · Pondicherry University (May 2026)</span>
            </div>
            <div className="ft-info-item">
              <span className="ft-label">AVAILABILITY</span>
              <span className="ft-value status-avail">Available Immediately (Remote Dominion)</span>
            </div>
            <div className="ft-info-item">
              <span className="ft-label">EXPECTED TRIBUTE</span>
              <span className="ft-value">₹40,000 / month</span>
            </div>
            <div className="ft-info-item">
              <span className="ft-label">DIRECT CONTACT</span>
              <a href="mailto:surajkush1704@gmail.com" className="ft-link">
                surajkush1704@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: Core Arsenal Skills */}
        <section className="ft-section ft-card">
          <h2 className="ft-section-heading">02 // WHAT HE WIELDS (CORE STACK)</h2>
          <div className="ft-skills-list">
            {FAST_SKILLS.map((skill, i) => (
              <div key={i} className="ft-skill-item">
                <span className="ft-skill-name">⚔ {skill.name}</span>
                <p className="ft-skill-desc">{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Flagship Built Systems */}
        <section className="ft-section ft-card">
          <h2 className="ft-section-heading">03 // WHAT HE HAS BUILT (5 KINGDOMS)</h2>
          <div className="ft-projects-list">
            {FAST_PROJECTS.map((proj, i) => (
              <div key={i} className="ft-project-card">
                <div className="ft-project-top">
                  <h3 className="ft-project-title">{proj.title}</h3>
                  <div className="ft-project-links">
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="ft-btn-small">
                        LIVE ↗
                      </a>
                    )}
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="ft-btn-small">
                      CODE ↗
                    </a>
                  </div>
                </div>
                <p className="ft-project-tagline">{proj.tagline}</p>
                <span className="ft-project-stack">{proj.stack}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Proof of Discipline */}
        <section className="ft-section ft-card">
          <h2 className="ft-section-heading">04 // PROOF OF STRUCTURAL DISCIPLINE</h2>
          <p className="ft-proof-text">
            <strong>100 Days of AI</strong> — Documented publicly every single day on LinkedIn. Every breakthrough,
            bug, and architectural decision recorded in real time.
          </p>
          <div className="ft-social-links">
            <a
              href="https://linkedin.com/in/surajkumar1704"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-social-btn"
            >
              LINKEDIN CHRONICLES ↗
            </a>
            <a
              href="https://github.com/surajkush1704"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-social-btn"
            >
              GITHUB REPOSITORIES ↗
            </a>
          </div>
        </section>

        {/* Section 5: Proceed to Throne Room CTA */}
        <section className="ft-section ft-cta-section">
          <button className="ft-cta-btn" onClick={handleProceed}>
            PROCEED TO THE OVERLORD'S THRONE →
          </button>
          <p className="ft-cta-sub">Your audience awaits in Realm 5.</p>
        </section>
      </main>

      <style>{`
        .fast-track-container {
          position: fixed;
          inset: 0;
          overflow-y: auto;
          background: #040107;
          color: #eee4ee;
          font-family: 'Cinzel', serif;
          padding: 40px 20px 80px;
          scroll-behavior: smooth;
        }
        .fast-track-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: #D4AF37;
          box-shadow: 0 0 10px #D4AF37;
          z-index: 100;
          transition: width 0.1s ease;
        }
        .fast-track-content {
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .ft-section {
          background: rgba(8, 2, 16, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 4px;
          padding: 24px 28px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.8);
        }
        .ft-header {
          text-align: center;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 20px 10px;
        }
        .ft-badge {
          display: inline-block;
          font-family: 'Geist Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.4);
          padding: 4px 12px;
          border-radius: 2px;
          margin-bottom: 12px;
        }
        .ft-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 26px;
          color: #FFD700;
          letter-spacing: 0.15em;
          margin: 6px 0 12px;
        }
        .ft-intro {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(220, 210, 240, 0.85);
          max-width: 600px;
          margin: 0 auto;
        }
        .ft-intro em {
          color: #D4AF37;
          font-style: normal;
        }
        .ft-section-heading {
          font-family: 'Cinzel Decorative', serif;
          font-size: 14px;
          color: #D4AF37;
          letter-spacing: 0.15em;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          padding-bottom: 8px;
        }
        .ft-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ft-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ft-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(212, 175, 55, 0.6);
        }
        .ft-value {
          font-size: 13px;
          color: #fff;
        }
        .ft-value.highlight {
          font-size: 16px;
          font-family: 'Cinzel Decorative', serif;
          color: #FFD700;
        }
        .ft-value.status-avail {
          color: #4ade80;
        }
        .ft-link {
          color: #c084fc;
          text-decoration: none;
          font-size: 13px;
        }
        .ft-link:hover {
          text-decoration: underline;
        }
        .ft-skills-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ft-skill-item {
          border-left: 2px solid rgba(212, 175, 55, 0.4);
          padding-left: 12px;
        }
        .ft-skill-name {
          font-size: 13px;
          color: #FFD700;
          font-weight: 600;
        }
        .ft-skill-desc {
          font-size: 12px;
          color: rgba(220, 210, 240, 0.8);
          margin-top: 2px;
        }
        .ft-projects-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ft-project-card {
          background: rgba(4, 0, 10, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          padding: 14px 16px;
          border-radius: 3px;
        }
        .ft-project-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .ft-project-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 15px;
          color: #FFD700;
        }
        .ft-project-links {
          display: flex;
          gap: 8px;
        }
        .ft-btn-small {
          font-size: 9px;
          letter-spacing: 0.15em;
          padding: 4px 8px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #D4AF37;
          text-decoration: none;
          border-radius: 2px;
        }
        .ft-btn-small:hover {
          background: rgba(212, 175, 55, 0.25);
          color: #FFF;
        }
        .ft-project-tagline {
          font-size: 12px;
          color: rgba(220, 210, 240, 0.85);
          margin-bottom: 6px;
        }
        .ft-project-stack {
          font-family: 'Geist Mono', monospace;
          font-size: 10px;
          color: rgba(212, 175, 55, 0.6);
        }
        .ft-proof-text {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(220, 210, 240, 0.9);
          margin-bottom: 14px;
        }
        .ft-social-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ft-social-btn {
          font-size: 11px;
          letter-spacing: 0.15em;
          padding: 8px 16px;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid rgba(124, 58, 237, 0.4);
          color: #e9d5ff;
          text-decoration: none;
          border-radius: 3px;
        }
        .ft-social-btn:hover {
          background: rgba(124, 58, 237, 0.3);
          border-color: #c084fc;
        }
        .ft-cta-section {
          text-align: center;
          padding: 36px 20px;
          background: linear-gradient(180deg, rgba(20, 0, 30, 0.8), rgba(4, 0, 10, 0.95));
          border: 1px solid rgba(212, 175, 55, 0.5);
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
        }
        .ft-cta-btn {
          padding: 16px 36px;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid #D4AF37;
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 14px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 3px;
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }
        .ft-cta-btn:hover {
          background: rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 45px rgba(212, 175, 55, 0.6);
          transform: scale(1.02);
        }
        .ft-cta-sub {
          margin-top: 12px;
          font-size: 11px;
          color: rgba(212, 175, 55, 0.6);
          letter-spacing: 0.15em;
        }
        @media (max-width: 600px) {
          .ft-grid-2 {
            grid-template-columns: 1fr;
          }
          .ft-cta-btn {
            width: 100%;
            font-size: 12px;
            padding: 14px 18px;
          }
        }
      `}</style>
    </div>
  )
}
