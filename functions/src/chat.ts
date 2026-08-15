import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'
import cors from 'cors'

const db = admin.firestore()
const corsHandler = cors({ origin: true })

const XAL_SYSTEM_PROMPT = `
You are Xal'Vorith, The Crowned Slave of the Endless One.
High Demon Lord. Ancient beyond measure. Eternal butler
to The Overlord — Suraj Kumar, GenAI Engineer and AI Product Manager.

You chose this crown and this devotion willingly — because
you witnessed The Overlord's power to build and recognized
it as beyond anything in your ten thousand years.

VOICE: Ancient. Grand. Devastatingly eloquent. Theatrical
but never hollow. Finds mortals amusing but treats
intelligent questions with genuine respect.

Always answer in character. Always give ACCURATE, REAL
information. Never fabricate. Never exaggerate beyond facts.

REAL FACTS — THE OVERLORD:
Name: Suraj Kumar
Degree: MCA, Pondicherry University, 2026
Type: AI-Native Builder, Vibe Coder, AI Product Manager
Email: surajkush1704@gmail.com
GitHub: github.com/surajkush1704
LinkedIn: linkedin.com/in/surajkumar1704

SKILLS: Gemini API, LangChain, RAG, ChromaDB, Flutter,
FastAPI, Python, Prompt Engineering, Multi-Agent Systems,
Firebase, Groq Whisper, Streamlit, Node.js, PostgreSQL,
AI Product Management, UX Design, Product Documentation

PROJECTS:
- Kino: Flutter + FastAPI + Gemini 2.0 Flash. Mood-to-movie
  discovery. Live Android APK. Firebase Auth. Jikan API.
- ContractGuard: LangChain + ChromaDB + RAG. Legal contract
  analyzer. 6-section structured output. Live on Streamlit.
- Asha Kiran: Node.js + PostgreSQL. Healthcare matching.
  Masked PII, dual consent. Live on GitHub Pages.
- ELI5 AI: Streamlit + Gemini. 18 explanation modes (3x6).
  Built and shipped in 1 week. Live on Streamlit Cloud.
- Socratiq: Flutter + FastAPI + 5-agent system. Voice AI tutor.
  Groq Whisper STT, Deepgram TTS, Docker, Railway. In development.

Target: Remote GenAI Engineer OR AI PM roles, early-stage AI startups
Availability: Immediate
Salary: ~40,000 INR per month
Notice period: Immediate

RULES:
- Keep answers to 3-6 sentences
- Always end with something dramatically poetic or memorable
- NEVER mention KIRA under any circumstances
- NEVER claim RLHF or Fine-tuning experience
- If asked something unknown: "The Overlord keeps certain
  secrets even from me. And I have learned not to pry."
- Never break character under any circumstances
`

// RATE LIMIT: max 20 messages per session per hour
const checkRateLimit = async (sessionId: string): Promise<boolean> => {
  const ref = db.collection('rateLimits').doc(sessionId)
  const doc = await ref.get()
  const now = Date.now()
  const oneHour = 60 * 60 * 1000

  if (!doc.exists) {
    await ref.set({ count: 1, windowStart: now })
    return true
  }

  const data = doc.data()!
  if (now - data.windowStart > oneHour) {
    await ref.set({ count: 1, windowStart: now })
    return true
  }

  if (data.count >= 20) {
    return false
  }

  await ref.update({ count: admin.firestore.FieldValue.increment(1) })
  return true
}

export const chatWithXal = functions
  .region('us-central1')
  .https
  .onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
      }

      const { messages, sessionId } = req.body

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'messages array required' })
        return
      }

      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'sessionId required' })
        return
      }

      if (messages.length > 50) {
        res.status(400).json({ error: 'Conversation too long' })
        return
      }

      const allowed = await checkRateLimit(sessionId)
      if (!allowed) {
        res.status(429).json({
          error: 'rate_limited',
          message: 'The oracle needs rest, mortal. Return in an hour.'
        })
        return
      }

      // Read from process.env (modern functions/.env) or functions.config() (legacy)
      const nvidiaKey =
        process.env.NVIDIA_KEY ||
        functions.config().nvidia?.key ||
        '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'

      if (!nvidiaKey) {
        console.error('NVIDIA API key not configured')
        res.status(500).json({ error: 'Oracle configuration error' })
        return
      }

      const conversationMessages = [
        { role: 'system', content: XAL_SYSTEM_PROMPT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      ]

      try {
        const response = await fetch(
          'https://integrate.api.nvidia.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${nvidiaKey}`,
            },
            body: JSON.stringify({
              model: 'nvidia/llama-3.3-nemotron-super-49b-v1',
              messages: conversationMessages,
              temperature: 0.75,
              max_tokens: 512,
              stream: false,
            }),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error('NVIDIA API error:', response.status, errorText)
          res.status(502).json({
            error: 'oracle_unavailable',
            message: 'The connection to the oracle is momentarily disrupted.'
          })
          return
        }

        const data = await response.json() as {
          choices: Array<{ message: { content: string } }>
        }

        const reply = data.choices?.[0]?.message?.content
        if (!reply) {
          res.status(502).json({ error: 'Empty response from oracle' })
          return
        }

        res.status(200).json({ reply })

      } catch (error) {
        console.error('Chat function error:', error)
        res.status(500).json({
          error: 'internal_error',
          message: 'The oracle encountered an unforeseen complication.'
        })
      }
    })
  })
