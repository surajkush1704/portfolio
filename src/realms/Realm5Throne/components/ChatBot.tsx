// ============================================================================
// REALM 5 COMPONENT: ChatBot (Consult the Oracle — Xal'Vorith)
// PURPOSE: Conversational AI Oracle with deep character lore, verified facts,
//          context memory, dynamic question rotation, and resilient error states.
// ============================================================================

import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { XAL_SYSTEM_PROMPT } from '../../../constants/xalvorithPrompt'
import { trackEvent } from '../../../services/analytics'
import { useStore } from '../../../store/useStore'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isError?: boolean
  canRetry?: boolean
  lastUserPrompt?: string
}

export const ALL_QUICK_QUESTIONS = {
  availability: [
    'Is he available to start immediately?',
    'What is his notice period?',
    'Can he work fully remote?',
    'Is he open to contract or freelance roles?',
    'Is he available for a part-time engagement?',
  ],
  projects: [
    'Tell me about Kino',
    'How does ContractGuard work?',
    'What is Socratiq and why is it ambitious?',
    'What is ELI5 AI?',
    'Tell me about Asha Kiran',
    'Which project best shows his RAG skills?',
    'Which project took the most product thinking?',
    'What is his most complex technical project?',
    'Are all his projects live and deployed?',
    'Which project would you recommend a recruiter look at first?',
  ],
  skills: [
    'What are his strongest technical skills?',
    'Can he build and deploy a full-stack AI application?',
    'What LLMs has he worked with?',
    'What is his experience with RAG pipelines?',
    'How strong is his prompt engineering?',
    'What does vibe coder actually mean?',
    'Can he write code or only direct AI to write it?',
    'What is his product management experience?',
    'Has he designed user interfaces himself?',
    'What AI tools does he use daily?',
  ],
  background: [
    'Where did he study?',
    'What is his educational background?',
    'Tell me about his 100 Days of AI',
    'How long has he been building AI products?',
    'What certifications does he have?',
    'Is he self-taught or formally trained?',
    'What makes him an AI-native builder?',
  ],
  rolefit: [
    'Is he a good fit for a GenAI Engineer role?',
    'Would he work well in a startup environment?',
    'Can he take a product from idea to launch alone?',
    'Is he suitable for an AI Product Manager role?',
    'How does he handle ambiguous requirements?',
    'Can he work independently without hand-holding?',
    'What kind of team does he work best in?',
    'Would he be good at stakeholder communication?',
  ],
  differentiation: [
    'What makes him different from other candidates?',
    'Why should I hire him over a traditional developer?',
    'What is his unique edge as an AI PM?',
    'What can he do that most engineers cannot?',
    'What can he do that most PMs cannot?',
    'Why would he be good at a role that needs both technical and product skills?',
  ],
  contact: [
    'How do I get in touch with him directly?',
    'How do I submit an enquiry?',
    'Where can I see his GitHub repositories?',
    'Where can I see his LinkedIn?',
    'Is there a resume I can download?',
  ],
  character: [
    'Why do you serve The Overlord?',
    'How long have you been his butler?',
    'What is the most impressive thing you have seen him build?',
    'Do you think he will be successful?',
    'What would you tell a recruiter who is on the fence?',
  ],
}

const INITIAL_FEATURED_QUESTIONS = [
  'Tell me about Kino',
  'Is he available to start immediately?',
  'What makes him different from other candidates?',
  'Which project best shows his RAG skills?',
]

const getRandomQuestions = (count: number = 4): string[] => {
  const allQuestions = Object.values(ALL_QUICK_QUESTIONS).flat()
  const shuffled = [...allQuestions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

const BLOCKED_PATTERNS = [
  /\b(fuck|shit|ass|bitch|bastard|cunt|dick|pussy)\b/i,
]

interface ChatBotProps {
  isFirstVisit?: boolean
}

export function ChatBot(_props?: ChatBotProps) {
  const { userType } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const conversationRef = useRef<Array<{ role: string; content: string }>>([])
  const lastPromptRef = useRef<string>('')

  // Track screen size for quick questions count
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [quickQuestions, setQuickQuestions] = useState<string[]>(() =>
    isMobile ? INITIAL_FEATURED_QUESTIONS.slice(0, 2) : INITIAL_FEATURED_QUESTIONS
  )

  // Refresh quick questions after each assistant response
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setQuickQuestions(getRandomQuestions(isMobile ? 2 : 4))
    }
  }, [messages, isMobile])

  // Auto-scroll on new messages & focus input
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [messages, isLoading])

  // In-character fallback responses adhering strictly to rule specifications
  const getFallbackAnswer = (query: string): string => {
    const q = query.toLowerCase()
    if (q.includes('available') || q.includes('hire') || q.includes('join') || q.includes('start') || q.includes('notice')) {
      return "The Overlord is available immediately, mortal. He requires no notice period, no transition timeline, no handover schedule. He is ready now. The only question is whether your opportunity is ready for him. Contact him at surajkush1704@gmail.com."
    }
    if (q.includes('salary') || q.includes('tribute') || q.includes('rate') || q.includes('cost') || q.includes('money') || q.includes('ctc') || q.includes('charge')) {
      return "Matters of tribute are discussed between The Overlord and those who seek his services directly. He can be reached at surajkush1704@gmail.com. I am told the conversation is always worth initiating."
    }
    if (q.includes('contractguard') || q.includes('legal') || q.includes('rag')) {
      return "ContractGuard exists because most mortals sign contracts they do not fully understand, because legal review costs more than the contract is worth. The Overlord built a full RAG pipeline — LangChain ingestion, ChromaDB vector storage, and Gemini-grounded retrieval — outputting six structured risk dimensions from the actual document. It is live at contractguard.streamlit.app."
    }
    if (q.includes('socratiq') || q.includes('voice') || q.includes('tutor') || q.includes('agent')) {
      return "Socratiq is The Overlord's voice-first multi-agent tutoring architecture. Five specialised agents coordinate live curriculum generation, Socratic dialogue, and evaluation using Groq Whisper STT, Deepgram Aura TTS, and FastAPI. It represents his deepest exploration of real-time multi-agent orchestration."
    }
    if (q.includes('kino') || q.includes('movie') || q.includes('anime')) {
      return "Kino is his flagship discovery platform, built on the insight that mood drives viewing decisions rather than genre. Armed with Flutter, FastAPI, Gemini 2.0 Flash, and the Jikan API, it maps emotional intent to cinema across 25,000+ titles with sub-2-second speed. The Android APK is live on GitHub Releases."
    }
    if (q.includes('pm') || q.includes('product manager') || q.includes('product management')) {
      return "The Overlord has shipped four products as sole product owner — every user flow, every feature decision, and every launch. Most product managers define what to build; most engineers build what they are told. He does both simultaneously with disciplined execution."
    }
    if (q.includes('weakness') || q.includes("can't do") || q.includes('cannot do')) {
      return "He does not train language models — he builds with them. He is not a decade-deep infrastructure engineer; his background is two years of intense, high-velocity building and shipping. Every power has its domain, and The Overlord's domain is building real AI products."
    }
    if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('linkedin')) {
      return "The Overlord can be reached directly via electronic dispatch at surajkush1704@gmail.com, or through his professional scroll at linkedin.com/in/surajkumar1704. You may also leave an audience offering right here in this hall."
    }
    return "The Overlord (Suraj Kumar, MCA Pondicherry University) builds production-ready GenAI architectures and AI-native products from idea to launch. He is immediately available for remote roles. Inscribe your inquiry or contact him directly at surajkush1704@gmail.com."
  }

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      setInputError('')

      // 1. Minimum length check
      if (trimmed.length < 2) {
        setInputError('Ask a full question, mortal.')
        return
      }

      // 2. Maximum length check
      if (trimmed.length > 500) {
        setInputError('Even I cannot process a question of that length. Be more precise.')
        return
      }

      if (isLoading || isRateLimited) return

      lastPromptRef.current = trimmed

      // 3. Profanity / inappropriate content check (quiet in-character response)
      const isInappropriate = BLOCKED_PATTERNS.some((p) => p.test(trimmed))
      if (isInappropriate) {
        setMessages((prev) => [
          ...prev,
          { id: `user_${Date.now()}`, role: 'user', content: trimmed, timestamp: Date.now() },
          {
            id: `xal_${Date.now()}`,
            role: 'assistant',
            content: 'The Underworld maintains certain standards of discourse, mortal. Ask again — more carefully this time.',
            timestamp: Date.now(),
          },
        ])
        setInputValue('')
        return
      }

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

      // Abort controller with 15000ms timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        const apiKey =
          import.meta.env.VITE_NVIDIA_API_KEY ||
          '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'
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
                  ...conversationRef.current.slice(-12),
                ],
                temperature: 0.7,
                max_tokens: 450,
              }),
              signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (res.status === 429) {
              setIsRateLimited(true)
              replyContent =
                'The oracle needs rest, mortal. You have asked many questions in a short time. Return in an hour and I shall answer all that remains.'
            } else if (res.ok) {
              const data = await res.json()
              replyContent = data.choices?.[0]?.message?.content?.trim() || ''
              if (!replyContent) {
                replyContent =
                  'The oracle spoke but nothing reached your ears. An unusual occurrence. Ask again.'
              }
            } else {
              console.warn('Oracle API non-200 status:', res.status)
              replyContent =
                'The oracle encountered an unforeseen complication. These are rare. Try your question again.'
            }
          } catch (fetchErr: unknown) {
            clearTimeout(timeoutId)
            if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
              replyContent =
                'The connection to the oracle took longer than ten thousand years of patience allows. Try again.'
            } else {
              console.warn('Direct fetch failed, falling back to ancient memory:', fetchErr)
              replyContent = getFallbackAnswer(trimmed)
            }
          }
        } else {
          clearTimeout(timeoutId)
          await new Promise((r) => setTimeout(r, 400))
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
        clearTimeout(timeoutId)
        console.error('Chat error:', err)
        const errorMsg: Message = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content:
            "The oracle's connection was severed mid-transmission. The mortal internet is occasionally unreliable. Try again.",
          timestamp: Date.now(),
          isError: true,
          canRetry: true,
          lastUserPrompt: trimmed,
        }
        setMessages((prev) => [...prev, errorMsg])
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
    setInputError('')
    setQuickQuestions(isMobile ? INITIAL_FEATURED_QUESTIONS.slice(0, 2) : INITIAL_FEATURED_QUESTIONS)
  }

  const handleQuickQuestionClick = (question: string) => {
    setInputValue(question)
    sendMessage(question)
  }

  const handleRetry = (prompt?: string) => {
    if (prompt) {
      sendMessage(prompt)
    } else if (lastPromptRef.current) {
      sendMessage(lastPromptRef.current)
    }
  }

  return (
    <div
      className="oracle-container"
      role="region"
      aria-label="Chat with Xal'Vorith, The Crowned Slave"
    >
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
      <div
        className="oracle-messages"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {messages.length === 0 && (
          <div className="oracle-empty">
            <p className="oracle-empty-text">
              "Ask of The Overlord's conquests, his weapons of code, his architecture, or his immediate availability."
            </p>
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
            {msg.role === 'assistant' && (
              <div className="xal-avatar">
                <span className="xal-glyph">⚔</span>
              </div>
            )}
            <div className="msg-bubble">
              {msg.role === 'assistant' && <span className="msg-sender">XAL'VORITH</span>}
              <p className="msg-text">{msg.content}</p>
              {msg.canRetry && (
                <button
                  className="oracle-retry-btn"
                  onClick={() => handleRetry(msg.lastUserPrompt)}
                >
                  ↻ TRY AGAIN
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            className="oracle-msg msg-xal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-label="Xal'Vorith is responding"
          >
            <div className="xal-avatar">
              <span className="xal-glyph">⚔</span>
            </div>
            <div className="msg-bubble loading-bubble">
              <span className="msg-sender">XAL'VORITH</span>
              <div className="rune-pulse">
                <span className="rune-dot" />
                <span className="rune-dot" />
                <span className="rune-dot" />
                <span className="rune-text">Consulting the Nether...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Questions Pills (Show when empty or after assistant responses) */}
        {!isLoading && !isRateLimited && (
          <div className="quick-pills-wrap">
            <span className="quick-pills-label">QUICK CONSULTATIONS:</span>
            <div className="quick-pills">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-pill"
                  onClick={() => handleQuickQuestionClick(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Max conversation length notice (> 40 messages / 20 exchanges) */}
      {messages.length >= 40 && (
        <div className="oracle-length-notice">
          The oracle has answered many questions in this session. For extended consultation, contact The Overlord directly at surajkush1704@gmail.com
        </div>
      )}

      {/* Input Error Message */}
      {inputError && <div className="oracle-input-error">{inputError}</div>}

      {/* Input Bar */}
      <div className="oracle-input-bar">
        <input
          ref={inputRef}
          type="text"
          className="oracle-input"
          placeholder={
            isRateLimited
              ? 'The oracle rests. Return in one hour...'
              : 'Inscribe your question for Xal’Vorith...'
          }
          value={inputValue}
          disabled={isLoading || isRateLimited}
          onChange={(e) => {
            setInputValue(e.target.value)
            if (inputError) setInputError('')
          }}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          className="oracle-send-btn"
          onClick={() => sendMessage(inputValue)}
          disabled={isLoading || !inputValue.trim() || isRateLimited}
          aria-label="Send message"
        >
          {isLoading ? '...' : 'TRANSMIT ↗'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="oracle-footer">
        <span>⚡ POWERED BY NVIDIA NIM</span>
        <span>•</span>
        <span>ZERO MODEL TRAINING CLAIMS • REAL DATA ONLY</span>
      </div>

      <style>{`
        .oracle-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 580px;
          background: rgba(10, 6, 8, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.08);
          font-family: 'Cinzel', serif;
        }

        .oracle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(20, 10, 15, 0.8);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .oracle-badge {
          display: inline-block;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: #d4af37;
          opacity: 0.8;
          margin-bottom: 2px;
        }

        .oracle-title {
          margin: 0;
          font-size: 14px;
          letter-spacing: 0.15em;
          color: #f5eedb;
          font-weight: 600;
        }

        .oracle-clear-btn {
          background: none;
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: rgba(212, 175, 55, 0.6);
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          letter-spacing: 0.1em;
          transition: all 0.2s ease;
        }

        .oracle-clear-btn:hover {
          color: #d4af37;
          border-color: #d4af37;
          background: rgba(212, 175, 55, 0.1);
        }

        .oracle-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .oracle-empty {
          text-align: center;
          padding: 16px 10px;
        }

        .oracle-empty-text {
          font-size: 12.5px;
          color: rgba(245, 238, 219, 0.7);
          font-style: italic;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .quick-pills-wrap {
          margin-top: 6px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .quick-pills-label {
          font-size: 9.5px;
          letter-spacing: 0.12em;
          color: rgba(212, 175, 55, 0.6);
        }

        .quick-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quick-pill {
          background: rgba(212, 175, 55, 0.06);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: rgba(212, 175, 55, 0.75);
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          padding: 6px 12px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .quick-pill:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.15);
          color: #f5eedb;
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
        }

        .quick-pill:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .oracle-msg {
          display: flex;
          gap: 10px;
          max-width: 90%;
        }

        .msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .msg-xal {
          align-self: flex-start;
        }

        .xal-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.3), rgba(20, 10, 15, 0.9));
          border: 1px solid #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .xal-glyph {
          font-size: 12px;
          color: #d4af37;
        }

        .msg-bubble {
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.55;
        }

        .msg-user .msg-bubble {
          background: rgba(40, 20, 30, 0.85);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #f5eedb;
          border-top-right-radius: 1px;
        }

        .msg-xal .msg-bubble {
          background: rgba(18, 12, 16, 0.9);
          border: 1px solid rgba(212, 175, 55, 0.2);
          color: #e5dfd0;
          border-top-left-radius: 1px;
        }

        .msg-sender {
          display: block;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #d4af37;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .msg-text {
          margin: 0;
          white-space: pre-wrap;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          line-height: 1.6;
        }

        .oracle-retry-btn {
          margin-top: 8px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #d4af37;
          font-family: 'Cinzel', serif;
          font-size: 9.5px;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
          letter-spacing: 0.1em;
          transition: all 0.2s ease;
        }

        .oracle-retry-btn:hover {
          background: rgba(212, 175, 55, 0.25);
          color: #fff;
        }

        .rune-pulse {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rune-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d4af37;
          animation: pulseDot 1.2s infinite ease-in-out;
        }

        .rune-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .rune-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes pulseDot {
          0%, 80%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
            box-shadow: 0 0 6px #d4af37;
          }
        }

        .rune-text {
          font-size: 10px;
          color: rgba(212, 175, 55, 0.8);
          letter-spacing: 0.1em;
          margin-left: 4px;
        }

        .oracle-length-notice {
          padding: 6px 14px;
          font-size: 11px;
          color: rgba(212, 175, 55, 0.65);
          font-style: italic;
          background: rgba(20, 10, 15, 0.7);
          border-top: 1px solid rgba(212, 175, 55, 0.15);
          text-align: center;
        }

        .oracle-input-error {
          padding: 4px 14px;
          font-size: 10.5px;
          color: #ff6b6b;
          background: rgba(60, 10, 15, 0.8);
          letter-spacing: 0.05em;
        }

        .oracle-input-bar {
          display: flex;
          padding: 10px 14px;
          background: rgba(15, 8, 12, 0.9);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          gap: 8px;
        }

        .oracle-input {
          flex: 1;
          background: rgba(5, 3, 4, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.25);
          color: #f5eedb;
          padding: 10px 14px;
          font-size: 16px; /* Prevents iOS auto-zoom */
          border-radius: 4px;
          outline: none;
          font-family: system-ui, -apple-system, sans-serif;
          transition: border-color 0.2s ease;
        }

        .oracle-input:focus {
          border-color: #d4af37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
        }

        .oracle-send-btn {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(160, 120, 30, 0.15));
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #f5eedb;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          padding: 0 16px;
          min-height: 44px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .oracle-send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.45), rgba(160, 120, 30, 0.3));
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
          border-color: #d4af37;
        }

        .oracle-send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .oracle-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: rgba(8, 4, 6, 0.95);
          font-size: 8.5px;
          letter-spacing: 0.15em;
          color: rgba(212, 175, 55, 0.5);
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }

        @media (max-width: 768px) {
          .oracle-container {
            max-height: 420px;
          }
          .oracle-msg {
            max-width: 94%;
          }
          .quick-pills {
            flex-direction: column;
          }
          .quick-pill {
            width: 100%;
          }
        }

        @media (max-height: 520px) {
          .oracle-container {
            max-height: 84vh;
          }
          .oracle-messages {
            padding: 10px;
            gap: 8px;
          }
          .oracle-header {
            padding: 8px 12px;
          }
          .oracle-input-bar {
            padding: 6px 10px;
          }
          .oracle-send-btn {
            min-height: 38px;
            padding: 0 12px;
          }
        }
      `}</style>
    </div>
  )
}
