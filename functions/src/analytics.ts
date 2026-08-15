import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import cors from 'cors'

const db = admin.firestore()
const corsHandler = cors({ origin: true })

const ALLOWED_ADMINS = ['surajkush1704@gmail.com', 'raj17bittu@gmail.com']

export const getAdminReport = functions
  .region('us-central1')
  .https
  .onRequest((req, res) => {
    corsHandler(req, res, async () => {
      const authHeader = req.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const token = authHeader.split('Bearer ')[1]
      try {
        const decodedToken = await admin.auth().verifyIdToken(token)
        const adminEmailConfig = functions.config().admin?.email
        
        const isAuthorized =
          (decodedToken.email && ALLOWED_ADMINS.includes(decodedToken.email)) ||
          (adminEmailConfig && decodedToken.email === adminEmailConfig)

        if (!isAuthorized) {
          res.status(403).json({ error: 'Forbidden' })
          return
        }
      } catch {
        res.status(401).json({ error: 'Invalid token' })
        return
      }

      const { range = '30' } = req.query
      const daysAgo = parseInt(range as string, 10)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      try {
        const analyticsSnap = await db
          .collection('analytics')
          .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
          .get()

        const events = analyticsSnap.docs.map(d => d.data())

        const unreadSnap = await db
          .collection('enquiries')
          .where('read', '==', false)
          .get()

        const sessions = new Set(events.map(e => e.sessionId))

        const countByEvent = (eventName: string) =>
          events.filter(e => e.event === eventName).length

        const visitsByType = {
          firsttime: events.filter(e => e.event === 'visit' && e.userType === 'firsttime').length,
          recruiter: events.filter(e => e.event === 'visit' && e.userType === 'recruiter').length,
          revisitor: events.filter(e => e.event === 'visit' && e.userType === 'revisitor').length,
        }

        const projectOpens: Record<string, number> = {}
        events
          .filter(e => e.event === 'project_opened')
          .forEach(e => {
            if (e.projectId) {
              projectOpens[e.projectId] = (projectOpens[e.projectId] || 0) + 1
            }
          })

        const dropoffs: Record<number, number> = {}
        events
          .filter(e => e.event === 'realm_dropped')
          .forEach(e => {
            if (e.realm) {
              dropoffs[e.realm] = (dropoffs[e.realm] || 0) + 1
            }
          })

        res.status(200).json({
          totalVisitors: sessions.size,
          visitsByType,
          unreadEnquiries: unreadSnap.size,
          resumeDownloads: countByEvent('resume_downloaded'),
          aiInteractions: countByEvent('ai_interacted'),
          fastTrackUsed: countByEvent('fast_track_used'),
          directAudienceUsed: countByEvent('direct_audience_used'),
          enquiriesSubmitted: countByEvent('enquiry_submitted'),
          projectOpens,
          dropoffs,
        })

      } catch (error) {
        console.error('Analytics error:', error)
        res.status(500).json({ error: 'Failed to fetch analytics' })
      }
    })
  })
