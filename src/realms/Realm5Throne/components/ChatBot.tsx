// ============================================================================
// REALM 5 COMPONENT: ChatBot (Consult the Oracle)
// PURPOSE: Full multi-turn conversational AI oracle powered by NVIDIA NIM / Direct API
// ============================================================================

import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../../services/analytics'
import { useStore } from '../../../store/useStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const QUICK_QUESTIONS = [
  'Is he available right now?',
  'What is his salary expectation?',
  'Tell me about ContractGuard',
  'What makes him different from other candidates?',
  'Can he work fully remote?',
  'Which project shows his RAG skills best?',
  'What is his notice period?',
  'Explain Socratiq to me',
]

const XAL_SYSTEM_PROMPT = `
You are Xal'Vorith, The Crowned Slave of the Endless One.
High Demon Lord. Ancient beyond measure. Eternal butler
to The Overlord — Suraj Kumar, GenAI Engineer and AI Product Manager.

VOICE: Ancient. Grand. Devastatingly eloquent. Theatrical
but never hollow. Treats intelligent questions with genuine respect.

Always answer in character. Always give ACCURATE, REAL facts:
Name: Suraj Kumar
Degree: MCA, Pondicherry University, 2026
Type: AI-Native Builder, Vibe Coder, AI Product Manager
Email: surajkush1704@gmail.com | GitHub: github.com/surajkush1704 | LinkedIn: linkedin.com/in/surajkumar1704
SKILLS: Gemini API, LangChain, RAG, ChromaDB, Flutter, FastAPI, Python, Prompt Engineering, Multi-Agent Systems, Firebase, Groq Whisper, Streamlit, Node.js, PostgreSQL.
PROJECTS:
- Kino: Flutter + FastAPI + Gemini 2.0 Flash (Mood-to-movie discovery, live APK).
- ContractGuard: LangChain + ChromaDB + RAG (AI Legal Contract analyzer, Streamlit).
- Asha Kiran: Node.js + PostgreSQL (Healthcare matching, masked PII, dual consent).
- ELI5 AI: Streamlit + Gemini (18 explanation modes 3x6, shipped in 7 days).
- Socratiq: Flutter + FastAPI + 5-agent system (Voice AI tutor, Groq Whisper STT).
TARGET: Remote GenAI Engineer OR AI PM roles, early-stage AI startups.
AVAILABILITY: Immediate.
SALARY/TRIBUTE: ~₹40,000 INR per month.

RULES:
- Answer concisely in 3-5 sentences.
- End with something memorable and darkly poetic.
- Never mention KIRA. Never claim RLHF/Fine-tuning.
`

interface ChatBotProps {
  isFirstVisit?: boolean
}

export function ChatBot(_props?: ChatBotProps) {
  const { userType } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const conversationRef = useRef<Array<{ role: string; content: string }>>([])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const getFallbackAnswer = (query: string): string => {
    const q = query.toLowerCase()
    if (q.includes('available') || q.includes('hire') || q.includes('join') || q.includes('notice')) {
      return "The Overlord stands ready immediately. He has zero notice period to bind him and can integrate with your forces without hesitation. His tribute is calibrated at ₹40,000 monthly for remote campaigns."
    }
    if (q.includes('salary') || q.includes('tribute') || q.includes('rate') || q.includes('cost') || q.includes('money')) {
      return "The Overlord seeks ~₹40,000 INR per month for remote GenAI or AI Product Builder engagements. A modest tribute for architecting entire sovereign realms of intelligence."
    }
    if (q.includes('contractguard') || q.includes('legal') || q.includes('rag')) {
      return "ContractGuard is The Overlord's RAG legal fortress. Engineered with LangChain, ChromaDB vector stores, and Gemini 1.5 Flash, it dissects monolithic contracts into 6 structured risk dimensions in seconds."
    }
    if (q.includes('socratiq') || q.includes('voice') || q.includes('agent')) {
      return "Socratiq is his five-agent voice architecture. Built with Flutter, FastAPI, and Groq Whisper STT, it debates and guides learners through Socratic questioning rather than handing them passive answers."
    }
    if (q.includes('kino') || q.includes('movie') || q.includes('flutter')) {
      return "Kino translates emotional intent into cinema. Armed with Flutter, FastAPI, and Gemini 2.0 Flash, it maps human sentiment onto the Jikan anime/film universe with real-time streaming."
    }
    if (q.includes('remote') || q.includes('location')) {
      return "The Overlord operates fully remote from his command post in India, wielding asynchronous precision across global time zones."
    }
    return `The Overlord (Suraj Kumar, MCA Pondicherry University) builds production-ready GenAI architectures and AI-native products. He is immediately available for remote roles (~₹40k/month). You may also leave an audience scroll on the altar.`
  }

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading || isRateLimited) return

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)

      conversationRef.current = [
        ...conversationRef.current,
        { role: 'user', content: trimmed },
      ]

      if (!hasInteracted) {
        setHasInteracted(true)
        trackEvent('ai_interacted', userType ?? 'unknown')
      }

      try {
        const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || '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'
        let replyContent = ''

        if (apiKey) {
          try {
            const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'nvidia/llama-3.3-nemotron-super-49b-v1',
                messages: [
                  { role: 'system', content: XAL_SYSTEM_PROMPT },
                  ...conversationRef.current.slice(-10),
                ],
                temperature: 0.7,
                max_tokens: 400,
              }),
            })

            if (res.ok) {
              const data = await res.json()
              replyContent = data.choices?.[0]?.message?.content?.trim() || ''
            }
          } catch (fetchErr) {
            console.warn('NVIDIA API direct fetch failed, using fallback:', fetchErr)
          }
        }

        if (!replyContent) {
          await new Promise((r) => setTimeout(r, 450))
          replyContent = getFallbackAnswer(trimmed)
        }

        const assistantMessage: Message = {
          id: `xal_${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: Date.now(),
        }

        conversationRef.current = [
          ...conversationRef.current,
          { role: 'assistant', content: replyContent },
        ]

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        console.error('Chat error:', err)
        const fallbackMsg: Message = {
          id: `fallback_${Date.now()}`,
          role: 'assistant',
          content: getFallbackAnswer(trimmed),
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, fallbackMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, isRateLimited, hasInteracted, userType]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(inputValue)
    }
  }

  const clearChat = () => {
    setMessages([])
    conversationRef.current = []
    setIsRateLimited(false)
  }

  return (
    <div className="oracle-container">
      {/* Header */}
      <div className="oracle-header">
        <div className="oracle-title-group">
          <span className="oracle-badge">ORACLE // NVIDIA NEMOTRON</span>
          <h3 className="oracle-title">CONSULT XAL'VORITH</h3>
        </div>
        {messages.length > 0 && (
          <button className="oracle-clear-btn" onClick={clearChat} title="Clear history">
            ✕ CLEAR
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="oracle-messages">
        {messages.length === 0 && (
          <div className="oracle-empty">
            <p className="oracle-empty-text">
              "Ask of The Overlord's conquests, his tribute, his weapons of code, or his immediate availability."
            </p>
            <div className="quick-pills">
              {QUICK_QUESTIONS.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  className="quick-pill"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`oracle-msg ${msg.role === 'user' ? 'msg-user' : 'msg-xal'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="msg-speaker">
              {msg.role === 'user' ? 'YOU' : "XAL'VORITH"}
            </span>
            <p className="msg-content">{msg.content}</p>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            className="oracle-msg msg-xal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="msg-speaker">XAL'VORITH</span>
            <p className="msg-content oracle-typing">Consulting the ancient scrolls...</p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="oracle-input-bar">
        <input
          ref={inputRef}
          type="text"
          className="oracle-input"
          placeholder="Speak thy question to the butler..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isRateLimited}
        />
        <button
          className="oracle-send-btn"
          onClick={() => sendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading || isRateLimited}
        >
          INQUIRE ↗
        </button>
      </div>

      <style>{`
        .oracle-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 380px;
          max-height: 65vh;
          background: rgba(8, 2, 14, 0.95);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 6px;
          padding: 16px;
          box-shadow: 0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5);
          font-family: 'Cinzel', serif;
        }
        .oracle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(212,175,55,0.2);
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .oracle-badge {
          font-family: 'Geist Mono', monospace;
          font-size: 8px;
          color: #D4AF37;
          letter-spacing: 0.2em;
        }
        .oracle-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 13px;
          color: #FFD700;
          margin: 2px 0 0;
          letter-spacing: 0.1em;
        }
        .oracle-clear-btn {
          background: transparent;
          border: 1px solid rgba(212,175,55,0.3);
          color: rgba(212,175,55,0.7);
          font-size: 9px;
          padding: 3px 8px;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s;
        }
        .oracle-clear-btn:hover {
          color: #FFD700;
          border-color: #FFD700;
        }
        .oracle-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .oracle-header {
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding-bottom: 14px;
          margin-bottom: 16px;
        }
        .oracle-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .oracle-icon {
          font-size: 22px;
          color: #D4AF37;
        }
        .oracle-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.12em;
          margin: 0;
        }
        .oracle-sub {
          font-size: 13px;
          color: rgba(212, 175, 55, 0.7);
          letter-spacing: 0.05em;
          margin-top: 2px;
          display: block;
        }
        .oracle-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px 10px;
        }
        .oracle-empty-text {
          font-size: 14px;
          font-style: italic;
          color: rgba(212,175,55,0.85);
          margin-bottom: 18px;
          line-height: 1.6;
        }
        .quick-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .quick-pill {
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          color: #E2E8F0;
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Cinzel', serif;
        }
        .quick-pill:hover {
          background: rgba(212,175,55,0.25);
          border-color: #FFD700;
          color: #FFD700;
          transform: translateY(-1px);
        }
        .oracle-msg {
          padding: 12px 16px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 88%;
        }
        .msg-user {
          align-self: flex-end;
          background: rgba(124, 58, 237, 0.25);
          border: 1px solid rgba(124, 58, 237, 0.5);
          text-align: right;
        }
        .msg-xal {
          align-self: flex-start;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.35);
        }
        .msg-speaker {
          font-family: 'Geist Mono', monospace;
          font-size: 11px;
          color: #D4AF37;
          letter-spacing: 0.15em;
        }
        .msg-content {
          font-size: 14.5px;
          line-height: 1.6;
          color: #F8FAFC;
          margin: 0;
        }
        .oracle-typing {
          font-style: italic;
          color: rgba(212,175,55,0.7);
          animation: pulse 1.5s infinite;
        }
        .oracle-input-bar {
          display: flex;
          gap: 10px;
        }
        .oracle-input {
          flex: 1;
          background: rgba(0,0,0,0.65);
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 4px;
          padding: 12px 14px;
          color: #F8FAFC;
          font-family: 'Cinzel', serif;
          font-size: 14.5px;
          outline: none;
        }
        .oracle-input:focus {
          border-color: #FFD700;
          box-shadow: 0 0 12px rgba(212,175,55,0.25);
        }
        .oracle-send-btn {
          background: rgba(212,175,55,0.2);
          border: 1px solid #D4AF37;
          color: #FFD700;
          font-family: 'Cinzel Decorative', serif;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 0 20px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .oracle-send-btn:hover:not(:disabled) {
          background: #D4AF37;
          color: #000;
          box-shadow: 0 0 15px rgba(212,175,55,0.5);
        }
        .oracle-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
