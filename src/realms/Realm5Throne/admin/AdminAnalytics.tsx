// ============================================================================
// ADMIN COMPONENT: AdminAnalytics
// PURPOSE: Live domain intelligence dashboard tracking visitor behavior & metrics
// ============================================================================

import { collection, onSnapshot, type QuerySnapshot, type DocumentData } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../../../lib/firebase'

interface AnalyticsSummary {
  mortalsEntered: number
  recruiters: number
  scrollsReceived: number
  codexDownloads: number
  oracleConsulted: number
  fastTracksUsed: number
}

const DEFAULT_METRICS: AnalyticsSummary = {
  mortalsEntered: 0,
  recruiters: 0,
  scrollsReceived: 0,
  codexDownloads: 0,
  oracleConsulted: 0,
  fastTracksUsed: 0,
}

export function AdminAnalytics() {
  const [metrics, setMetrics] = useState<AnalyticsSummary>(DEFAULT_METRICS)
  const [projectStats, setProjectStats] = useState<Array<{ name: string; opens: number }>>([])
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('all')

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) return

    let totalEnquiriesCount = 0

    // 1. Listen to live enquiries collection for scroll count
    const unsubEnquiries = onSnapshot(
      collection(db, 'enquiries'),
      (snap: QuerySnapshot<DocumentData>) => {
        totalEnquiriesCount = snap.size
        setMetrics((prev) => ({ ...prev, scrollsReceived: totalEnquiriesCount }))
      },
      (err: Error) => console.warn('Analytics enquiries listener error:', err)
    )

    // 2. Listen to live analytics events
    const unsubAnalytics = onSnapshot(
      collection(db, 'analytics'),
      (snap: QuerySnapshot<DocumentData>) => {
        if (snap.empty) {
          setMetrics({
            mortalsEntered: 0,
            recruiters: 0,
            scrollsReceived: totalEnquiriesCount,
            codexDownloads: 0,
            oracleConsulted: 0,
            fastTracksUsed: 0,
          })
          setProjectStats([])
          return
        }

        let recruiters = 0
        let downloads = 0
        let oracle = 0
        let fastTracks = 0
        const projMap: Record<string, number> = {
          'Socratiq Engine': 0,
          'ContractGuard RAG': 0,
          'CogniCanvas Vision': 0,
          'PulseGuard IoT': 0,
          'NeuralForge Studio': 0,
        }

        const uniqueSessions = new Set<string>()
        const now = Date.now()

        snap.forEach((d: DocumentData) => {
          const data = d.data()

          // Filter by time range if timestamp exists
          if (timeRange !== 'all' && data.timestamp?.seconds) {
            const eventTime = data.timestamp.seconds * 1000
            const diffDays = (now - eventTime) / (1000 * 60 * 60 * 24)
            if (timeRange === 'today' && diffDays > 1) return
            if (timeRange === '7d' && diffDays > 7) return
            if (timeRange === '30d' && diffDays > 30) return
          }

          if (data.sessionId) uniqueSessions.add(data.sessionId)
          if (data.userType === 'recruiter') recruiters += 1
          if (data.event === 'resume_downloaded') downloads += 1
          if (data.event === 'ai_interacted' || data.event === 'chat_message_sent') oracle += 1
          if (data.event === 'fast_track_used' || data.event === 'fast_track_opened') fastTracks += 1
          if (data.event === 'enquiry_submitted') totalEnquiriesCount += 1

          const trophy = data.trophyName || data.details?.trophyName || data.name
          if (trophy) {
            const name = String(trophy)
            projMap[name] = (projMap[name] || 0) + 1
          }
        })

        const mortals = uniqueSessions.size || snap.size

        setMetrics({
          mortalsEntered: mortals,
          recruiters: recruiters,
          scrollsReceived: totalEnquiriesCount,
          codexDownloads: downloads,
          oracleConsulted: oracle,
          fastTracksUsed: fastTracks,
        })

        const sortedProj = Object.entries(projMap)
          .map(([name, opens]) => ({ name, opens }))
          .sort((a, b) => b.opens - a.opens)
        setProjectStats(sortedProj)
      },
      (err: Error) => {
        console.warn('Analytics live listener error:', err)
      }
    )

    return () => {
      unsubEnquiries()
      unsubAnalytics()
    }
  }, [timeRange])

  return (
    <div className="admin-box">
      <div className="admin-box-header">
        <div>
          <h3 className="admin-box-title">DOMAIN INTELLIGENCE</h3>
          <span className="admin-box-sub">Activity across the Underworld</span>
        </div>

        {/* Time Range Selector */}
        <div className="admin-filters">
          <button className={`admin-tab ${timeRange === 'today' ? 'active' : ''}`} onClick={() => setTimeRange('today')}>
            TODAY
          </button>
          <button className={`admin-tab ${timeRange === '7d' ? 'active' : ''}`} onClick={() => setTimeRange('7d')}>
            7 DAYS
          </button>
          <button className={`admin-tab ${timeRange === '30d' ? 'active' : ''}`} onClick={() => setTimeRange('30d')}>
            30 DAYS
          </button>
          <button className={`admin-tab ${timeRange === 'all' ? 'active' : ''}`} onClick={() => setTimeRange('all')}>
            ALL TIME
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {/* 6 Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-icon">◈</span>
            <span className="metric-val">{metrics.mortalsEntered}</span>
            <span className="metric-lbl">MORTALS ENTERED</span>
          </div>
          <div className="metric-card">
            <span className="metric-icon">⚔</span>
            <span className="metric-val">{metrics.recruiters}</span>
            <span className="metric-lbl">RECRUITERS</span>
          </div>
          <div className="metric-card">
            <span className="metric-icon">📜</span>
            <span className="metric-val">{metrics.scrollsReceived}</span>
            <span className="metric-lbl">SCROLLS RECEIVED</span>
          </div>
          <div className="metric-card">
            <span className="metric-icon">⚗</span>
            <span className="metric-val">{metrics.codexDownloads}</span>
            <span className="metric-lbl">CODEX DOWNLOADS</span>
          </div>
          <div className="metric-card">
            <span className="metric-icon">✦</span>
            <span className="metric-val">{metrics.oracleConsulted}</span>
            <span className="metric-lbl">ORACLE CONSULTED</span>
          </div>
          <div className="metric-card">
            <span className="metric-icon">⚡</span>
            <span className="metric-val">{metrics.fastTracksUsed}</span>
            <span className="metric-lbl">FAST TRACKS</span>
          </div>
        </div>

        {/* Project Inspection Ranks */}
        <div className="project-ranks-section">
          <h4 className="ranks-title">PROJECT INSPECTION INTELLIGENCE</h4>
          {projectStats.length === 0 ? (
            <p className="admin-empty-sub">No trophy inspections recorded yet. Mortal interactions will populate here in real-time.</p>
          ) : (
            <table className="ranks-table">
              <thead>
                <tr>
                  <th>PROJECT ARTIFACT</th>
                  <th>INSPECTIONS</th>
                </tr>
              </thead>
              <tbody>
                {projectStats.map((p) => (
                  <tr key={p.name}>
                    <td className="p-name">{p.name}</td>
                    <td className="p-opens">{p.opens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
        .analytics-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .metric-card {
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 6px;
          padding: 16px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .metric-icon {
          font-size: 16px;
          color: #FFD700;
        }
        .metric-val {
          font-family: 'Cinzel Decorative', serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFD700;
        }
        .metric-lbl {
          font-size: 11px;
          color: #c084fc;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .project-ranks-section {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(124, 58, 237, 0.25);
          border-radius: 4px;
          padding: 16px;
        }
        .ranks-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 14.5px;
          font-weight: 700;
          color: #FFD700;
          margin: 0 0 12px;
          letter-spacing: 0.1em;
        }
        .admin-empty-sub {
          font-size: 13.5px;
          color: rgba(212, 175, 55, 0.7);
          font-style: italic;
          margin: 6px 0;
        }
        .ranks-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .ranks-table th {
          text-align: left;
          color: #c084fc;
          font-size: 11.5px;
          letter-spacing: 0.15em;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(124, 58, 237, 0.25);
        }
        .ranks-table td {
          padding: 8px 0;
          color: rgba(235, 225, 250, 0.9);
          border-bottom: 1px solid rgba(124, 58, 237, 0.1);
        }
        .p-name {
          color: #FFD700;
          font-weight: 600;
        }
        .p-opens {
          color: #4ade80;
          font-family: 'Geist Mono', monospace;
        }
      `}</style>
    </div>
  )
}
