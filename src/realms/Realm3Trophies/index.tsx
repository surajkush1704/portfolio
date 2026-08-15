// ============================================================================
// REALM 3: TROPHY HALL (THE 5 KINGDOM PILLARS)
// PURPOSE: Fourth realm featuring an interactive lava crossing across 5 pillars,
//          each representing one of Suraj Kumar's flagship projects.
//
// STATE & POSE RULES:
//   - Step 0: Intro monologue with Xal'Vorith pose 4 (xalvorith-pose4.png).
//   - Steps 1-5: Lava hopping crossing across 5 pillars. Xal'Vorith is invisible.
//   - Step 6 (Arrival): Door opens, congratulatory praise sequence begins.
//       * During praise monologue: Xal'Vorith uses pose 5 (xalvorith-pose5.png).
//       * On guide invitation: Transitions to pose 6 (xalvorith-pose6.png).
//       * AFTER dialogue ends: Pose 6 STAYS PERMANENTLY STANDING on screen.
//   - Backward Navigation (initialFinished = true):
//       * Mounts directly on Step 6 with pose 6 standing permanently and nav active.
// ============================================================================

import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { Howl } from 'howler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DialogueBox, type DialogueState } from '../../components/ui/DialogueBox'
import { ParticleScene } from '../../components/three/ParticleScene'

interface Props {
  onNext: () => void
  onPrev: () => void
  initialFinished?: boolean
}

interface PillarData {
  id: string
  pillarNumber: number
  name: string
  tagline: string
  status: 'live' | 'in-development'
  statusLabel: string
  color: string
  accentColor: string
  userProblem: string
  pmSummary: string
  productDecisions: string[]
  workflow: string[]
  features: string[]
  techStack: string
  techDetail: string[]
  outcome: string
  liveUrl: string | null
  githubUrl: string
  xalQuote: string
}

type RealmPhase =
  | 'intro'
  | 'crossing'
  | 'pillar-view'
  | 'final-gap'
  | 'complete'
  | 'praise'
  | 'guide'
  | 'done'

type CurrentStep = 0 | 1 | 2 | 3 | 4 | 5 | 6
type XalPose = 'none' | 'pose4' | 'pose5' | 'pose6'
type SoundKey =
  | 'lavaAmbient'
  | 'xalIntro'
  | 'hopWhoosh'
  | 'stoneThud'
  | 'heatFlash'
  | 'infoAppear'
  | 'xalAppear'
  | 'clapSound'
  | 'doorOpen'
  | 'navArrow'

const PILLARS: PillarData[] = [
  // ── PILLAR 1 ─────────────────────────────────────────────
  {
    id: 'ashakiran',
    pillarNumber: 1,
    name: 'ASHA KIRAN',
    tagline: 'Healthcare Matching Platform',
    status: 'live',
    statusLabel: 'LIVE',
    color: '#F0F4FF',
    accentColor: '#94A3B8',

    userProblem:
      'People in need of healthcare support — blood donors, ' +
      'organ registration, mental health help, physiotherapy — ' +
      'cannot find others who can help without exposing their ' +
      'personal information to strangers. No existing platform ' +
      'treated privacy as a first-class product decision.',

    pmSummary:
      'Designed and shipped a healthcare matching platform where ' +
      'the most vulnerable users are the most protected. Privacy ' +
      'was not a legal checkbox — it was the core product principle ' +
      'designed in before the first line of code was written. ' +
      'Every feature decision was made through the lens of: ' +
      'does this protect or expose the user?',

    productDecisions: [
      'Designed masked PII architecture from day one — donors and seekers interact through anonymised system IDs, never real names or contact details, until both parties explicitly consent to reveal',
      'Built 11+ health categories as structured discovery — eliminates the anxiety of open search for users who are already in a vulnerable state when they arrive',
      'Separated emotional safety from data safety as two distinct design problems — most platforms only solve the second one',
      "Made dual-consent reveal the default pattern — neither party sees the other's real identity without active confirmation from both sides simultaneously",
      'Chose a web platform over mobile app deliberately — lower barrier to access for users who may not have storage space or reliable internet for app downloads',
    ],

    workflow: [
      'User registers as either a Seeker (needs help) or Donor (can provide)',
      'JWT authentication assigns a system ID — real identity is never stored in the matching layer',
      'Seeker selects from 11+ health categories to describe what they need',
      'System surfaces anonymised Donor profiles that match the category',
      'Both parties communicate through the platform messaging layer — no direct contact yet',
      'When both parties consent: real contact details are revealed simultaneously',
      'PostgreSQL relational design ensures the matching logic is accurate and auditable',
    ],

    features: [
      '11+ health support categories: blood donation, organ registration, mental health, physiotherapy, elderly care, and more',
      'Masked PII system: all interaction happens through anonymised IDs until dual consent',
      'Dual-consent reveal: real identity shown only when BOTH parties agree',
      'JWT session management: secure login, protected routes, session handling',
      'Donor profile management: availability, category, location (anonymised)',
      'Seeker request flow: category selection, browsing, connection request',
      'Platform messaging: communicate before revealing real contact details',
      'SQL-based matching logic: relational joins ensure accurate category matching',
    ],

    techStack:
      'Node.js · Express · PostgreSQL (Neon) · JWT Auth · ' +
      'GitHub Pages (frontend) · Render (backend API)',

    techDetail: [
      'Node.js + Express: REST API for all platform interactions — registration, matching, consent flow, messaging',
      'PostgreSQL on Neon: relational data design with foreign keys ensuring referential integrity across users, categories, matches, and consent records',
      'JWT: stateless authentication — token issued on login, verified on every protected route',
      'PII masking: implemented at the database query layer, not just the UI — raw personal data never reaches the matching tables',
      'GitHub Pages: static frontend hosting — zero cost, reliable uptime',
      'Render: backend API hosting with environment variable management for sensitive config',
    ],

    outcome:
      'A working healthcare matching platform where the most vulnerable ' +
      "users are the most protected. Every design decision prioritised " +
      "the user's safety before the platform's convenience. " +
      'Live and publicly accessible.',

    liveUrl: 'https://surajkush1704.github.io/asha-kiran',
    githubUrl: 'https://github.com/surajkush1704/asha-kiran',

    xalQuote:
      'He made it so the most vulnerable users are the most protected. ' +
      'He thought of this before anyone asked. ' +
      'In ten thousand years I have rarely seen power used this carefully.',
  },

  // ── PILLAR 2 ─────────────────────────────────────────────
  {
    id: 'eli5',
    pillarNumber: 2,
    name: 'ELI5 AI',
    tagline: 'Adaptive Concept Explainer — 18 Output Modes',
    status: 'live',
    statusLabel: 'LIVE',
    color: '#60A5FA',
    accentColor: '#3B82F6',

    userProblem:
      'AI explanations default to one register — usually ' +
      'academic and verbose. A 5-year-old, a curious teenager, ' +
      'and a domain expert all need entirely different outputs ' +
      'for the exact same concept. No existing tool let users ' +
      'choose both the depth AND the style of explanation simultaneously.',

    pmSummary:
      'Identified that the explanation problem has two independent ' +
      'axes — difficulty level and explanation style — and built a ' +
      'system that addresses both simultaneously. 18 distinct output ' +
      'modes from a 3×6 matrix. Scoped ruthlessly to what mattered ' +
      'for launch, shipped in one week, live before the idea could ' +
      'become a project that never launches. The discipline of ' +
      'finishing is the rarest product skill.',

    productDecisions: [
      'Defined scope on day 1: explanation engine only — no user accounts, no history, no sharing features — none of these make explanations better, they just delay shipping',
      'Designed the 3×6 matrix (3 difficulty levels × 6 style modes) as the core product differentiator — 18 genuinely different outputs, not cosmetic variation of the same response',
      'Chose Streamlit deliberately over a custom frontend — fastest path to a testable, shareable product with zero frontend overhead',
      'Set a personal deadline of one week — real users, real feedback loop established before the idea could die in development',
      'Prompt-engineered each of the 18 combinations individually to produce genuinely different outputs — this is product work, not just engineering',
    ],

    workflow: [
      'User enters any concept, topic, or term they want explained',
      'User selects a Difficulty Level: ELI5 (age 5), Intermediate, or Expert',
      'User selects an Explanation Style: Simple, Analogy, Story, Bullet Points, Socratic, or Technical',
      'The 3×6 combination determines which specific prompt template is sent to Gemini API',
      'Gemini generates an explanation calibrated to that exact combination',
      'Output renders immediately in the Streamlit interface',
      'User can change either axis and regenerate — instant comparison of different approaches',
    ],

    features: [
      '3 Difficulty Levels: ELI5 (pure simplicity, no jargon), Intermediate (some depth, still accessible), Expert (full technical precision)',
      '6 Explanation Styles: Simple (clean direct language), Analogy (real-world comparisons), Story (narrative format), Bullet Points (structured breakdown), Socratic (leading questions), Technical (domain-specific language)',
      '18 unique prompt configurations — each combination engineered individually to produce genuinely different output',
      'Any concept explainable — not limited to specific domains',
      'Instant re-generation on style/difficulty change',
      'Clean Streamlit interface — zero learning curve, works on any device',
      'No account required — zero friction entry',
    ],

    techStack: 'Python · Streamlit · Gemini API · Streamlit Cloud',

    techDetail: [
      'Python: core logic for prompt template selection based on 3×6 matrix combination',
      'Streamlit: full UI — dropdown selectors, text input, output display, all in pure Python — no HTML/CSS/JS required',
      'Gemini API: language model generating the explanation — called with mode-specific system prompt per combination',
      '18 prompt templates: each one engineered to enforce the correct register, depth, and style for that specific combination — hallucination minimised through explicit format constraints',
      'Streamlit Cloud: zero-config deployment — push to GitHub, live in minutes',
    ],

    outcome:
      '18 explanation modes. Launched in 7 days. Live and working with ' +
      'real users. Proof that scoping discipline is a product skill. ' +
      'The question "what NOT to build" is harder than "what to build" — ' +
      'this project was the answer to that question.',

    liveUrl: 'https://eli5-ai.streamlit.app',
    githubUrl: 'https://github.com/surajkush1704/eli5-ai',

    xalQuote:
      'Most mortals spend months building what no one asked for. ' +
      'He defined scope, built exactly what was needed, and shipped ' +
      'in seven days. Then found out immediately whether it mattered. ' +
      'This is the rarest form of discipline I have encountered.',
  },

  // ── PILLAR 3 ─────────────────────────────────────────────
  {
    id: 'contractguard',
    pillarNumber: 3,
    name: 'CONTRACTGUARD',
    tagline: 'AI Legal Contract Analyzer — RAG Pipeline',
    status: 'live',
    statusLabel: 'LIVE',
    color: '#A78BFA',
    accentColor: '#7C3AED',

    userProblem:
      'Legal contracts are dense, technical, and written to protect ' +
      'the party that drafted them — not the party signing. ' +
      'Manual review is slow and expensive. Most people sign ' +
      'contracts they do not fully understand because professional ' +
      'legal review costs more than the contract is worth. ' +
      'Generic AI responses hallucinate on legal text because they ' +
      'are not grounded in the actual document.',

    pmSummary:
      'Identified a gap in his own RAG skills and defined a product ' +
      'that would close it publicly. The 6-section output format was ' +
      'a product decision — designed specifically so a non-technical ' +
      'user could understand AI analysis at a glance without needing ' +
      'a legal background. Iterated the layout based on what was ' +
      'confusing versus clear during real usage testing. ' +
      'Built, tested, and shipped before the skill gap could remain theoretical.',

    productDecisions: [
      'Designed the 6-section output format from scratch — Overview, Risk Score, Red Flags, Missing Clauses, Favorable Clauses, Negotiation Tips — each section serves a different user need and decision point',
      'Prioritised structured output over raw AI response — the FORMAT is what makes this useful to a non-technical user, not the underlying model capability',
      'Built and tested the interface with real internal usage before public deployment — identified specific sections that confused users and redesigned the layout',
      'Added RAG chatbot mode on top of the structured analysis — follow-up questions are the natural next user need after reading the report, not a separate product',
      'Chose to ground ALL responses in the uploaded document via RAG — eliminates the hallucination problem that makes raw LLM legal analysis dangerous',
    ],

    workflow: [
      'User uploads a PDF contract through the Streamlit interface',
      'PyPDF2 extracts the full text from the PDF',
      'LangChain splits the document into overlapping chunks using RecursiveCharacterTextSplitter',
      'Each chunk is embedded using Gemini embedding model and stored in ChromaDB vector store',
      'Structured analysis prompt is constructed with retrieved context and sent to Gemini 2.0 Flash',
      'Gemini returns a structured JSON response covering all 6 sections',
      'Streamlit renders each section in its own formatted panel with color-coded risk indicators',
      'User can then enter the RAG Chat mode — questions are answered using retrieval from the same ChromaDB store',
      'Each chat response is grounded in document chunks — no hallucination on facts in the contract',
    ],

    features: [
      'PDF upload and text extraction via PyPDF2',
      'Full RAG pipeline: chunking → embedding → ChromaDB vector store → semantic retrieval',
      'SECTION 1 — Overview: plain language summary of what the contract is and does',
      'SECTION 2 — Risk Score: numerical 1-10 risk assessment with reasoning for the score',
      'SECTION 3 — Red Flags: specific dangerous or unusual clauses identified with location',
      'SECTION 4 — Missing Clauses: standard protections that should be present but are absent',
      'SECTION 5 — Favorable Clauses: clauses that protect the signing party',
      'SECTION 6 — Negotiation Tips: actionable next steps the user can take',
      'RAG Chat mode: conversational follow-up questions grounded in the actual document',
      'Hallucination reduction: all responses constrained to retrieved document context',
      'API rate limit handling for stable usage under real load',
    ],

    techStack:
      'LangChain · ChromaDB · Gemini 2.0 Flash · PyPDF2 · ' +
      'Streamlit · Streamlit Cloud',

    techDetail: [
      'PyPDF2: PDF text extraction — handles multi-page documents, preserves paragraph structure',
      'LangChain RecursiveCharacterTextSplitter: chunk size 1000, overlap 200 — preserves clause context across chunk boundaries',
      'Gemini text-embedding-004: converts each chunk to a vector embedding for semantic search',
      'ChromaDB: in-memory vector store during session — stores all chunk embeddings, enables similarity search',
      'LangChain RetrievalQA chain: orchestrates retrieval → prompt construction → model call → response',
      'Gemini 2.0 Flash: primary LLM for both structured analysis and RAG chat — chosen for speed and cost at this scale',
      'Structured prompt engineering: explicit JSON schema in system prompt enforces consistent 6-section output format',
      'Streamlit: UI framework — file uploader, section panels, chat interface, all in Python',
      'Streamlit Cloud: deployment — live at contractguard.streamlit.app',
    ],

    outcome:
      'A full RAG pipeline that produces structured, readable legal analysis ' +
      'grounded in the actual uploaded document. Live and tested with real usage. ' +
      'Proof of end-to-end AI product ownership: problem identification, ' +
      'product design, technical implementation, and deployment.',

    liveUrl: 'https://contractguard.streamlit.app',
    githubUrl: 'https://github.com/surajkush1704/contractguard',

    xalQuote:
      'He identified a gap in his own skills. Then built a product to close it publicly. ' +
      'Most mortals learn from tutorials. He learns by shipping things that work ' +
      'in the real world with real users. Note the difference.',
  },

  // ── PILLAR 4 ─────────────────────────────────────────────
  {
    id: 'kino',
    pillarNumber: 4,
    name: 'KINO',
    tagline: 'AI Movie & Anime Discovery — Mood-First',
    status: 'live',
    statusLabel: 'LIVE',
    color: '#F59E0B',
    accentColor: '#D4AF37',

    userProblem:
      'Existing recommendation platforms force users into ' +
      'genre and keyword searches. But real viewing decisions ' +
      'are made by mood and feeling — not category. ' +
      '"I want something cozy for a rainy evening" is not a ' +
      'genre. It is a state of mind. No platform was built ' +
      'around that truth. Every platform asked what you liked ' +
      'before. Kino asks how you feel right now.',

    pmSummary:
      'The flagship product. The insight was not technical — ' +
      'it was human. Identified that mood drives viewing decisions ' +
      'before any technical work began. Designed Vibe Check as the ' +
      'core feature and built everything else (Library, Watchlist, ' +
      'For You feed, Anime section) to support and extend that ' +
      'central insight. Owned every product decision from initial ' +
      'concept through production deployment and post-launch ' +
      'incident response.',

    productDecisions: [
      'Identified Vibe Check as the core — a natural language mood description that returns contextually matched film recommendations — and sequenced all other features to support this one insight',
      'Designed the full 6-screen user journey from scratch: Vibe Check, Library, Watchlist, Classics, For You, Anime — not as separate features but as a coherent discovery ecosystem',
      'Sequenced feature build by user value, not technical ease — shipped the hardest and most important feature (Vibe Check) first, even though simpler features were available to build instead',
      'Extended into anime via Jikan API integration — recognised that anime discovery has the same mood-driven problem as film discovery, and that the same core solution applied',
      'Handled real production crisis end-to-end: two API key exposure incidents — identified the breach, rotated credentials, purged git history, hardened .gitignore, documented prevention — this is product ownership at a level most PMs never experience',
    ],

    workflow: [
      'User opens Kino on Android — authenticates via Firebase Auth (email or Google)',
      'VIBE CHECK FLOW: user types a mood description in natural language — "something dark and thought-provoking for a late night alone"',
      'FastAPI backend receives the mood string and constructs a Gemini prompt requesting film recommendations that match the described emotional state',
      'Gemini 2.0 Flash processes the mood and returns structured film recommendations with explanations of why each film matches',
      'Recommendations display in a card feed — user can add to Watchlist or Library from the card',
      "LIBRARY: user's personal film collection — add, remove, mark as watched",
      'WATCHLIST: films queued to watch — ordered by user priority',
      'CLASSICS: curated selection of essential cinema — browsable and filterable',
      'FOR YOU FEED: personalised discovery based on Library and Watchlist activity',
      'ANIME SECTION: full Jikan API integration — browse 25K+ titles, search, seasonal charts, top rankings',
      'SharedPreferences: local state persistence — Library and Watchlist survive app restarts',
    ],

    features: [
      'Vibe Check: natural language mood → Gemini-powered film recommendations with explanations',
      'Library: personal film collection management with watched status tracking',
      'Watchlist: priority-ordered queue of films to watch next',
      'Classics: curated essential cinema — manually selected, always available',
      'For You Feed: personalised discovery based on Library and Watchlist patterns',
      'Anime Section: full Jikan API integration — 25K+ titles, search, seasonal anime, top rankings, pagination',
      'Firebase Authentication: email and Google sign-in, session persistence',
      'SharedPreferences: local state for instant app startup without loading',
      'Android APK: live and downloadable from GitHub Releases v1.0.0',
      'Sub-2-second Vibe Check response: backend optimised for latency',
    ],

    techStack:
      'Flutter (Dart) · FastAPI (Python) · Gemini 2.0 Flash API · ' +
      'Firebase Authentication · Jikan REST API · ' +
      'SharedPreferences · Render',

    techDetail: [
      'Flutter: cross-platform mobile framework — Android APK live, iOS-ready codebase',
      'FastAPI: async Python backend — handles Vibe Check requests, Gemini API orchestration, Jikan API proxy',
      'Gemini 2.0 Flash: processes natural language mood input and returns structured film recommendations — chosen for speed (sub-2s target) and quality at this use case',
      'Firebase Authentication: handles user identity — Google OAuth and email/password, session tokens stored securely',
      'Jikan REST API: unofficial MyAnimeList API — 25K+ anime titles, search, seasonal charts, top rankings, full pagination handling',
      'SharedPreferences: key-value local storage for Library and Watchlist — instant startup, no loading state for returning users',
      'Render: backend hosting — monitored for latency, autoscaled, environment variables for API key security',
      'Production incident response: git history purge (BFG Repo Cleaner), credential rotation, .gitignore hardening — applied twice and documented',
    ],

    outcome:
      'A live Android app with mood-to-movie discovery via natural language. ' +
      '6 feature sections. 25K+ anime titles. Active backend on Render. ' +
      'APK downloadable from GitHub Releases. ' +
      'Full product ownership demonstrated from insight to incident response.',

    liveUrl: 'https://github.com/surajkush1704/kino/releases',
    githubUrl: 'https://github.com/surajkush1704/kino',

    xalQuote:
      'The insight was not technical — it was human. He understood how people ' +
      'actually make decisions before he wrote a single line of code. ' +
      'That is the hardest kind of product thinking. ' +
      'Most builders optimise what they can build. He optimised what people need.',
  },

  // ── PILLAR 5 ─────────────────────────────────────────────
  {
    id: 'socratiq',
    pillarNumber: 5,
    name: 'SOCRATIQ',
    tagline: 'AI Voice Tutor — 5-Agent Orchestration System',
    status: 'in-development',
    statusLabel: 'IN DEVELOPMENT',
    color: '#C084FC',
    accentColor: '#A855F7',

    userProblem:
      'AI tutors either answer questions OR teach concepts — ' +
      'rarely both simultaneously in a coordinated way. ' +
      'Text-based AI tutoring feels like an exam, not a conversation. ' +
      'Voice interaction makes tutoring feel natural and human ' +
      'but almost no AI product uses voice as the primary interface. ' +
      'Building a tutor that listens, teaches, evaluates, and ' +
      'generates practice — all in real time, all coordinated — ' +
      'requires an architecture most single-model chatbots cannot provide.',

    pmSummary:
      'The most ambitious project. Designed a multi-agent AI voice tutor ' +
      'where the product design problem was harder than the technical one. ' +
      'The central question: how do you make AI tutoring feel like a ' +
      'conversation with a person, not an interaction with a system? ' +
      'Answer: separate the agents. Each agent has exactly one job. ' +
      'The Tutor teaches. The Evaluator judges. The Content agent plans. ' +
      'No agent does two things. This separation is a product decision ' +
      'before it is a technical one.',

    productDecisions: [
      'Designed voice-first interface because text makes AI tutoring feel like an exam — the moment you speak to it, it feels like a person is present, which changes how users engage with the material',
      'Separated Tutor Agent from Evaluator Agent deliberately — mixing teaching and assessment in one model creates conflicted, hedging output that serves neither goal well',
      'Assigned exactly one job per agent — Content extracts curriculum, Tutor teaches, Evaluator judges, MCQ Generator creates practice, Reasoning Agent handles complex logic — no overlap, no confusion',
      'Designed the session flow around human tutoring patterns — topic selection → curriculum extraction → teaching session → evaluation → practice questions — not around what was easiest to build',
      'Added an OpenRouter fallback pool as the final layer — reliability is a product requirement, not just a technical nice-to-have, and a voice tutor that goes silent mid-session is a broken product',
    ],

    workflow: [
      'User authenticates via Firebase Auth and selects a topic to study',
      'CONTENT AGENT (Kimi API): extracts structured curriculum from the topic — breaks it into learnable units with dependencies',
      'TUTOR AGENT (Gemini 2.0 Flash): receives curriculum unit and begins teaching via TTS — explains concepts, gives examples, asks comprehension questions',
      'User responds via voice — Groq Whisper (STT) transcribes speech to text in real time',
      "EVALUATOR AGENT (Gemini 2.0 Flash — separate instance): receives the user's answer and the expected understanding, returns assessment score and targeted feedback",
      'Feedback is spoken back to the user via Deepgram Aura TTS (primary) or gTTS (fallback)',
      'REASONING AGENT (Cloudflare Workers AI): handles complex logical or multi-step questions that require deeper reasoning than the Tutor Agent is optimised for',
      'MCQ GENERATOR (Mistral Small): generates multiple-choice practice questions calibrated to the current curriculum unit and session difficulty',
      'OPENROUTER FALLBACK: if any primary model is unavailable, OpenRouter routes to the next available compatible model — session continues without interruption',
      'All session data (progress, scores, completed units) stored in Firebase Firestore + Neon PostgreSQL',
    ],

    features: [
      '5-Agent orchestration: Content (Kimi) + Tutor (Gemini) + Evaluator (Gemini) + MCQ Generator (Mistral) + Reasoning (Cloudflare) — each with exactly one job',
      'Voice-first interface: speak your answers, hear the tutor respond — fully conversational',
      'Real-time STT: Groq Whisper transcribes user speech with low latency',
      'Natural TTS: Deepgram Aura primary voice output with gTTS fallback',
      'Curriculum extraction: Kimi API structures any topic into learnable units before the session begins',
      'Adaptive evaluation: Evaluator Agent assesses each answer and calibrates subsequent teaching depth',
      'MCQ practice: Mistral generates contextually accurate multiple-choice questions per curriculum unit',
      'Reasoning backup: Cloudflare Workers AI handles multi-step logical problems',
      'OpenRouter fallback pool: reliability layer — no silent failures mid-session',
      'Session flow: topic → curriculum → teach → evaluate → practice → advance',
      'Firebase Authentication: secure user identity and session management',
      'Progress tracking: Neon PostgreSQL stores session history, scores, completed curriculum units',
      'Docker containers: each agent service containerised for consistent deployment',
      'Railway hosting: multi-service deployment with environment isolation per container',
    ],

    techStack:
      'Flutter · FastAPI · Docker · Gemini 2.0 Flash · ' +
      'Groq Whisper (STT) · Deepgram Aura (TTS) · gTTS · ' +
      'Kimi API · Mistral Small · Cloudflare Workers AI · ' +
      'OpenRouter · Firebase Auth · Neon PostgreSQL · ' +
      'Hive · Railway',

    techDetail: [
      'Flutter: voice-first mobile UI — real-time waveform display during recording, smooth TTS playback, session progress indicators',
      'FastAPI: central orchestration backend — receives user speech transcription, routes to correct agent, coordinates multi-agent response pipeline',
      'Docker: each agent service (Tutor, Evaluator, MCQ, Reasoning) containerised separately — independent scaling, isolated dependencies',
      'Gemini 2.0 Flash (Tutor instance): primary teaching model — system prompt engineered for explanation depth, example generation, Socratic questioning',
      'Gemini 2.0 Flash (Evaluator instance): separate instance with evaluation-specific system prompt — scores answers 1-10, identifies misconceptions, generates targeted feedback',
      'Groq Whisper: STT transcription — chosen for speed (sub-500ms) and accuracy on conversational speech',
      'Deepgram Aura: primary TTS — natural voice quality, low latency, essential for conversational feel',
      'gTTS: TTS fallback — activates automatically if Deepgram is unavailable',
      'Kimi API (Moonshot): long-context model used for curriculum extraction — takes topic and returns structured learning units with prerequisite mapping',
      'Mistral Small: MCQ generation — fine-tuned for structured question formats, generates distractors that test genuine understanding not pattern matching',
      'Cloudflare Workers AI: reasoning layer — handles multi-step logical questions, mathematical reasoning, complex concept decomposition',
      'OpenRouter: model routing fallback — configured with priority list, activates when primary models return errors',
      'Firebase Auth: user authentication and identity persistence across sessions',
      'Neon PostgreSQL: session history, score tracking, curriculum progress — relational design for querying progress across topics',
      'Hive: local Flutter storage — offline session cache, reduces API calls for repeated content',
      'Railway: multi-service deployment — separate service per agent container, shared internal network, environment variables per service',
    ],

    outcome:
      'A multi-agent AI voice tutor with full STT/TTS loop, ' +
      'curriculum extraction, teaching, evaluation, and MCQ generation. ' +
      'Five specialised agents coordinated by a single FastAPI orchestrator. ' +
      'Currently in active development. The architecture is complete. ' +
      'It will be finished.',

    liveUrl: null,
    githubUrl: 'https://github.com/surajkush1704',

    xalQuote:
      'Five agents. One commander. The product design problem was harder ' +
      'than the technical one. He solved both. ' +
      'It is not finished. It will be. ' +
      'I have been watching him build long enough to know the difference ' +
      'between abandoned and in progress.',
  },
]

const BACKGROUNDS = [
  '/images/relam3-bg1.png', // Intro / Step 0
  '/images/relam3-bg2.png', // Pillar 1 / Asha Kiran
  '/images/relam3-bg3.png', // Pillar 2 / ELI5 AI
  '/images/relam3-bg4.png', // Pillar 3 / ContractGuard
  '/images/relam3-bg5.png', // Pillar 4 / Kino
  '/images/relam3-bg6.png', // Pillar 5 / Socratiq
  '/images/relam3-bg7.png', // Step 6 / Complete Door
]

const INTRO_LINES = [
  'I have trophy halls of my own, mortal. Kingdoms I dismantled.\nGods I outlasted. Civilisations I watched collapse and did not\nintervene because they were not worth saving.',
  'But every trophy in my hall was taken. Those five pillars\nahead of you? Each one holds something that was built.\nNot conquered. Built. There is a difference that took me\nten thousand years to understand.',
  'Cross the lava pit, mortal. Land on each pillar.\nLearn what The Overlord has created. I will be watching.\nI simply will not be visible while you do it.',
  'Try not to fall into the lava.\nI would find a replacement. Eventually.',
]

const PRAISE_LINES = [
  '...hm.',
  'You crossed it. All five kingdoms witnessed. Every pillar\nlanded on. You did not skip. You did not turn back.',
  'I have guided thousands of mortals through this room\nacross ten thousand years of existence. Most turn back\nat the third pillar. Some fall. You crossed every one.',
  'The Overlord built those five kingdoms. Alone. With vision\nthat no one assigned him and discipline that no one required.\nYou have seen them now. You understand something that a\nresume cannot explain. And that understanding is exactly\nwhat he needs you to have before you meet him.',
  'Well done, mortal. I do not say that often.\nI have said it twice in ten thousand years.',
]

const GUIDE_LINES = [
  'Beyond that open door lies Realm 4 — The Chronicles Gate.\nStep through the threshold to get a glimpse of The Overlord\'s life in the outer world.',
  'Move ahead, mortal. Explore his documented journey, social portals,\nand public footprint in the world beyond.',
]

const audioConfig: Record<SoundKey, { file: string; loop?: boolean; volume: number }> = {
  lavaAmbient: { file: 'lava-ambient.mp3', loop: true, volume: 0.35 },
  xalIntro: { file: 'xal-intro.mp3', volume: 0.4 },
  hopWhoosh: { file: 'hop-whoosh.mp3', volume: 0.5 },
  stoneThud: { file: 'stone-thud.mp3', volume: 0.8 },
  heatFlash: { file: 'heat-flash.mp3', volume: 0.4 },
  infoAppear: { file: 'info-appear.mp3', volume: 0.35 },
  xalAppear: { file: 'xal-appear.mp3', volume: 0.5 },
  clapSound: { file: 'clap-sound.mp3', volume: 0.6 },
  doorOpen: { file: 'door-open.mp3', volume: 0.7 },
  navArrow: { file: 'nav-arrow.mp3', volume: 0.5 },
}

function CornerBrackets({ color = 'rgba(212,175,55,0.4)' }: { color?: string }) {
  return (
    <>
      <i className="corner tl" style={{ borderColor: color }} />
      <i className="corner tr" style={{ borderColor: color }} />
      <i className="corner bl" style={{ borderColor: color }} />
      <i className="corner br" style={{ borderColor: color }} />
    </>
  )
}

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Geist+Mono:wght@400&display=swap');

  .realm3 {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    width: 100dvw;
    height: 100dvh;
    overflow: hidden;
    background: #030104;
    color: #eee4ee;
    touch-action: pan-y;
  }

  .r3-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    transition: opacity 0.6s ease;
    will-change: transform, opacity;
  }

  .lava-glow {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(0deg, rgba(255,40,0,0.25) 0%, rgba(255,20,0,0.1) 20%, transparent 55%);
    animation: lavaPulse 3.5s ease-in-out infinite;
  }
  @keyframes lavaPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .hop-flash {
    position: absolute;
    inset: 0;
    z-index: 40;
    pointer-events: none;
    opacity: 0;
  }

  .vignette {
    position: absolute;
    inset: 0;
    z-index: 25;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 35%, rgba(3,0,4,0.85) 100%);
  }

  .xal-intro {
    position: absolute;
    z-index: 20;
    right: 4%;
    bottom: 0;
    width: 360px;
    max-height: 90vh;
    object-fit: contain;
    filter: drop-shadow(0 14px 8px rgba(0,0,0,0.82)) drop-shadow(0 0 14px rgba(100,24,150,0.3));
    animation: xalFloat1 5s ease-in-out infinite;
  }
  @keyframes xalFloat1 {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .xal-complete {
    position: absolute;
    z-index: 20;
    right: 4%;
    bottom: 0;
    width: 380px;
    max-height: 92vh;
    object-fit: contain;
    filter: drop-shadow(0 14px 8px rgba(0,0,0,0.82)) drop-shadow(0 0 18px rgba(212,175,55,0.4));
    animation: xalFloat2 5s ease-in-out infinite;
  }
  @keyframes xalFloat2 {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .gesture-hint {
    position: absolute;
    z-index: 35;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    pointer-events: none;
  }
  .gesture-hint p {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    color: rgba(212,175,55,0.8);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin: 0;
    text-shadow: 0 2px 6px #000;
    white-space: nowrap;
    animation: promptPulse 2.2s ease-in-out infinite;
  }
  .gesture-hint .key {
    display: inline-block;
    padding: 2px 7px;
    background: rgba(212,175,55,0.15);
    border: 1px solid rgba(212,175,55,0.4);
    border-radius: 3px;
    font-family: 'Geist Mono', monospace;
    color: #D4AF37;
    margin: 0 4px;
  }
  @keyframes promptPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .step-counter {
    position: absolute;
    z-index: 60;
    top: 18px;
    right: 20px;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.8);
    transition: color 0.5s ease;
    text-shadow: 0 2px 8px #000;
  }
  .step-counter .subtext {
    display: block;
    font-size: 9px;
    color: rgba(212,175,55,0.7);
    letter-spacing: 0.2em;
    font-style: italic;
    margin-top: 4px;
  }

  /* Top-Left Translucent Summary Box */
  .summary-box {
    position: absolute;
    z-index: 30;
    top: 24px;
    left: 24px;
    width: 390px;
    max-height: 78vh;
    overflow-y: auto;
    padding: 22px 24px;
    background: rgba(5, 1, 14, 0.84);
    border: 1px solid var(--accent-color-40);
    box-shadow:
      0 0 35px var(--accent-color-15),
      0 0 70px rgba(0, 0, 0, 0.8),
      inset 0 0 35px rgba(0,0,0,0.7);
    backdrop-filter: blur(14px);
  }
  .summary-box .corner {
    position: absolute;
    width: 14px;
    height: 14px;
    border-style: solid;
    border-color: var(--accent-color-40);
  }
  .summary-box .corner.tl { top: 5px; left: 5px; border-width: 1px 0 0 1px; }
  .summary-box .corner.tr { top: 5px; right: 5px; border-width: 1px 1px 0 0; }
  .summary-box .corner.bl { bottom: 5px; left: 5px; border-width: 0 0 1px 1px; }
  .summary-box .corner.br { bottom: 5px; right: 5px; border-width: 0 1px 1px 0; }

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .info-name {
    font-family: 'Cinzel Decorative', serif;
    font-size: 15px;
    color: #D4AF37;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .info-badge {
    font-family: 'Cinzel', serif;
    font-size: 8px;
    letter-spacing: 0.3em;
    padding: 3px 8px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .info-badge.live {
    background: rgba(34,197,94,0.15);
    border: 1px solid rgba(34,197,94,0.4);
    color: #22C55E;
  }
  .info-badge.dev {
    background: rgba(251,191,36,0.12);
    border: 1px solid rgba(251,191,36,0.35);
    color: #FBBF24;
  }
  .dev-pulse {
    animation: devPulse 2s ease-in-out infinite;
  }
  @keyframes devPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .info-tagline {
    font-family: 'Cinzel', serif;
    font-size: 11px;
    color: var(--accent-color-70);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .info-divider {
    height: 1px;
    background: var(--accent-color-15);
    margin: 12px 0;
  }
  .info-section-label {
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(212,175,55,0.7);
    margin-bottom: 6px;
  }
  .info-text {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    color: #F8FAFC;
    line-height: 1.65;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 4px #000;
  }
  .info-tech-label {
    font-family: 'Cinzel', serif;
    font-size: 9px;
    color: rgba(212,175,55,0.6);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .info-tech-text {
    font-family: 'Geist Mono', monospace;
    font-size: 12px;
    color: #D4AF37;
    letter-spacing: 0.04em;
    line-height: 1.5;
  }

  .view-full-btn {
    width: 100%;
    margin-top: 14px;
    padding: 10px 14px;
    background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(124,58,237,0.18));
    border: 1px solid rgba(212,175,55,0.6);
    color: #FFD700;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 0 18px rgba(212,175,55,0.2);
    transition: all 0.25s ease;
  }
  .view-full-btn:hover {
    background: linear-gradient(135deg, rgba(212,175,55,0.35), rgba(124,58,237,0.35));
    border-color: #FFD700;
    box-shadow: 0 0 28px rgba(212,175,55,0.5);
    color: #FFF;
  }

  /* High Contrast Full Screen Specification Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(2, 0, 8, 0.86);
    backdrop-filter: blur(16px);
    padding: 20px;
  }
  .modal-content {
    position: relative;
    width: min(940px, 94vw);
    max-height: 88vh;
    overflow-y: auto;
    padding: 32px 38px;
    background: rgba(4, 0, 12, 0.96);
    border: 1px solid var(--accent-color);
    box-shadow:
      0 0 60px rgba(0,0,0,0.95),
      0 0 100px var(--accent-color-15),
      inset 0 0 40px rgba(0,0,0,0.8);
    color: #F8FAFC;
  }
  .modal-close-btn {
    border: 0;
    background: transparent;
    color: rgba(212,175,55,0.6);
    font-size: 24px;
    cursor: pointer;
    line-height: 1;
    padding: 0 6px;
    transition: color 0.2s;
  }
  .modal-close-btn:hover { color: #FFD700; }

  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 20px;
  }

  .modal-block {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(212,175,55,0.15);
    padding: 16px 18px;
    border-radius: 4px;
  }

  .modal-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .modal-list-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: rgba(255,255,255,0.015);
    border-left: 2px solid var(--accent-color);
    padding: 8px 12px;
  }
  .modal-list-num {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    color: var(--accent-color);
    flex-shrink: 0;
  }
  .modal-list-text {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    color: #E2E8F0;
    line-height: 1.55;
  }

  .modal-tech-bullet {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    color: #CBD5E1;
    line-height: 1.6;
    margin-bottom: 6px;
    padding-left: 12px;
    border-left: 1px solid var(--accent-color-40);
  }

  .modal-quote-box {
    margin-top: 20px;
    padding: 16px 20px;
    background: linear-gradient(90deg, rgba(124,58,237,0.15), rgba(4,0,12,0.6));
    border-left: 3px solid #D4AF37;
    border-radius: 0 4px 4px 0;
  }
  .modal-quote-text {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-style: italic;
    color: #FFD700;
    line-height: 1.7;
  }

  .modal-footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid rgba(212,175,55,0.2);
    flex-wrap: wrap;
  }

  @media (max-width: 1024px) {
    .summary-box { width: 330px; }
    .xal-intro { width: 260px; }
    .xal-complete { width: 270px; }
    .step-counter { font-size: 11px; }
    .modal-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .summary-box {
      top: 10px;
      left: 10px;
      right: 10px;
      width: auto;
      max-height: 48vh;
      padding: 16px;
    }
    .modal-content { padding: 20px 18px; width: 96vw; }
    .xal-intro { width: 180px; }
    .xal-complete { width: 190px; }
    .gesture-hint { bottom: 14px; }
    .gesture-hint p { font-size: 9px; letter-spacing: 0.15em; }
  }
`

export default function Realm3Trophies({ onNext, onPrev, initialFinished }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bg1Ref = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const xalIntroRef = useRef<HTMLImageElement>(null)
  const xalPose5Ref = useRef<HTMLImageElement>(null)
  const xalPose6Ref = useRef<HTMLImageElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const timeouts = useRef<number[]>([])
  const sounds = useRef<Partial<Record<SoundKey, Howl>>>({})
  const phaseRef = useRef<RealmPhase>(initialFinished ? 'guide' : 'intro')
  const parallaxActive = useRef(true)

  const [phase, setPhase] = useState<RealmPhase>(initialFinished ? 'guide' : 'intro')
  const [currentStep, setCurrentStep] = useState<CurrentStep>(initialFinished ? 6 : 0)
  const [fullModalOpen, setFullModalOpen] = useState(false)
  const [isHopping, setIsHopping] = useState(false)
  const [navVisible, setNavVisible] = useState(initialFinished ? true : false)
  const [xalPose, setXalPose] = useState<XalPose>(initialFinished ? 'pose6' : 'none')
  const [dialogueText, setDialogueText] = useState('')
  const [dialogueState, setDialogueState] = useState<DialogueState>('idle')
  const [dialogueVisible, setDialogueVisible] = useState(false)
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [, setIntroLineIndex] = useState(0)
  const [, setPraiseLineIndex] = useState(0)
  const [, setGuideLineIndex] = useState(0)

  phaseRef.current = phase

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeouts.current.push(id)
    return id
  }, [])

  const play = useCallback((name: SoundKey) => {
    const cfg = audioConfig[name]
    const sound = sounds.current[name] ??= new Howl({
      src: [`/audio/${cfg.file}`],
      loop: cfg.loop ?? false,
      volume: cfg.volume,
    })
    sound.play()
  }, [])

  const fadeAllAudio = useCallback((duration = 600) => {
    Object.values(sounds.current).forEach(s => s?.fade(s.volume(), 0, duration))
    addTimeout(() => Object.values(sounds.current).forEach(s => s?.stop()), duration)
  }, [addTimeout])

  const preloadBackgrounds = useCallback(() => {
    BACKGROUNDS.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  const runHopAnimation = useCallback((
    direction: 'forward' | 'back',
    _fromStep: number,
    toStep: number,
    isFinalHop = false
  ) => {
    if (isHopping) return
    setIsHopping(true)
    setFullModalOpen(false)
    parallaxActive.current = false

    const container = containerRef.current
    const flash = flashRef.current
    const bg = bg1Ref.current
    if (!container || !flash || !bg) return

    const isBack = direction === 'back'
    const jumpHeight = isFinalHop ? -28 : -18
    const jumpDuration = isFinalHop ? 0.4 : 0.25
    const flashColor = isBack ? 'rgba(255, 100, 20, 0.5)' : 'rgba(255, 160, 60, 0.7)'
    const flashPeak = isFinalHop ? 0.9 : 0.7

    play('hopWhoosh')

    const tl = gsap.timeline()

    tl.to(container, { y: jumpHeight, duration: jumpDuration, ease: 'power2.out' })
    tl.to(container, { y: -8, duration: 0.15, ease: 'power2.in' }, '+=0')

    tl.to(flash, { opacity: flashPeak, duration: 0.12, background: flashColor }, `-=${jumpDuration}`)
    tl.to(flash, { opacity: 0, duration: 0.08 }, `-=0.08`)

    tl.add(() => {
      play('heatFlash')
      bg.style.backgroundImage = `url(${BACKGROUNDS[toStep]})`
      bg.style.backgroundSize = 'cover'
      bg.style.backgroundPosition = 'center top'
    }, `-=0.08`)

    tl.to(container, { y: 4, duration: 0.15, ease: 'power2.in' })
    tl.to(container, { y: 0, duration: 0.1, ease: 'back.out(2)' })

    const shakeX = [0, -8, 10, -7, 8, -5, 5, -3, 0]
    const shakeY = [0, -5, 3, -4, 2, 0]
    shakeX.forEach((x, i) => {
      tl.to(container, { x, y: shakeY[i] || 0, duration: 0.35 / shakeX.length, ease: 'none' }, '-=0.1')
    })

    tl.add(() => {
      play('stoneThud')
    }, '-=0.35')

    tl.add(() => {
      setCurrentStep(toStep as CurrentStep)
      setIsHopping(false)
      parallaxActive.current = true

      if (toStep === 6) {
        setPhase('complete')
      } else if (toStep >= 1 && toStep <= 5) {
        setPhase('pillar-view')
        play('infoAppear')
      } else if (toStep === 0) {
        setPhase('crossing')
      }
    })
  }, [isHopping, play])

  const handleHopForward = useCallback(() => {
    if (isHopping || fullModalOpen) return
    if (currentStep >= 6) return
    if (currentStep === 5) {
      runHopAnimation('forward', currentStep, 6, true)
    } else {
      runHopAnimation('forward', currentStep, currentStep + 1)
    }
  }, [isHopping, fullModalOpen, currentStep, runHopAnimation])

  const handleHopBack = useCallback(() => {
    if (isHopping || fullModalOpen) return
    if (currentStep <= 0) {
      const container = containerRef.current
      if (container) {
        const shakeX = [0, -10, 10, -5, 5, 0]
        const tl = gsap.timeline()
        shakeX.forEach((x) => {
          tl.to(container, { x, duration: 0.3 / shakeX.length, ease: 'none' })
        })
      }
      return
    }
    runHopAnimation('back', currentStep, currentStep - 1)
  }, [isHopping, fullModalOpen, currentStep, runHopAnimation])

  const advanceIntroDialogue = useCallback(() => {
    setIntroLineIndex(prev => {
      const next = prev + 1
      if (next >= INTRO_LINES.length) {
        setDialogueVisible(false)
        setXalPose('none')
        setPhase('crossing')
        return prev
      }
      setDialogueText(INTRO_LINES[next])
      return next
    })
  }, [])

  const advancePraiseDialogue = useCallback(() => {
    setPraiseLineIndex(prev => {
      const next = prev + 1
      if (next >= PRAISE_LINES.length) {
        setXalPose('pose6')
        setPhase('guide')
        setGuideLineIndex(0)
        setDialogueText(GUIDE_LINES[0])
        return prev
      }
      setXalPose('pose5')
      setDialogueText(PRAISE_LINES[next])
      return next
    })
  }, [])

  const advanceGuideDialogue = useCallback(() => {
    setGuideLineIndex(prev => {
      const next = prev + 1
      if (next >= GUIDE_LINES.length) {
        setDialogueVisible(false)
        setNavVisible(true)
        setXalPose('pose6')
        setPhase('done') // Prevents dialogue loop
        return prev
      }
      setXalPose('pose6')
      setDialogueText(GUIDE_LINES[next])
      return next
    })
  }, [])

  const handleDialogueAdvance = useCallback(() => {
    if (phase === 'intro') advanceIntroDialogue()
    else if (phase === 'praise') advancePraiseDialogue()
    else if (phase === 'guide') advanceGuideDialogue()
  }, [phase, advanceIntroDialogue, advancePraiseDialogue, advanceGuideDialogue])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === 'Escape' && fullModalOpen) {
      setFullModalOpen(false)
      return
    }
    if (phase === 'intro' || phase === 'praise' || phase === 'guide') {
      if (dialogueVisible) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          handleDialogueAdvance()
        }
      }
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      handleHopForward()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      handleHopBack()
    }
  }, [phase, dialogueVisible, fullModalOpen, handleDialogueAdvance, handleHopForward, handleHopBack])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (fullModalOpen) return
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
  }, [fullModalOpen])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (fullModalOpen) return
    if (!touchStartRef.current || e.changedTouches.length === 0) return
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (phase === 'intro' || phase === 'praise' || phase === 'guide') return

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < -40) {
        handleHopForward()
      } else if (deltaY > 40) {
        handleHopBack()
      }
    } else {
      if (deltaX < -40) {
        handleHopForward()
      } else if (deltaX > 40) {
        handleHopBack()
      }
    }
  }, [phase, fullModalOpen, handleHopForward, handleHopBack])

  useEffect(() => {
    preloadBackgrounds()

    play('lavaAmbient')

    if (initialFinished) {
      setCurrentStep(6)
      setPhase('guide')
      setNavVisible(true)
      setXalPose('pose6')
      setDialogueVisible(false)
      return
    }

    play('xalIntro')

    gsap.fromTo(bg1Ref.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })

    setXalPose('pose4')

    addTimeout(() => {
      setDialogueVisible(true)
      setDialogueState('narration')
      setDialogueText(INTRO_LINES[0])
      setIntroLineIndex(0)
    }, 800)

    return () => {
      fadeAllAudio()
      timeouts.current.forEach(clearTimeout)
      cancelAnimationFrame(rafRef.current)
      gsap.killTweensOf(containerRef.current)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousemove', handleMouseMove)
      Object.values(sounds.current).forEach(s => s?.stop())
    }
  }, [initialFinished, preloadBackgrounds, play, fadeAllAudio, addTimeout, handleKeyDown])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (mobile || fullModalOpen) return
    targetMouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    }
  }, [mobile, fullModalOpen])

  useEffect(() => {
    if (mobile) return
    window.addEventListener('mousemove', handleMouseMove)

    const loop = (_timestamp: number) => {
      if (!parallaxActive.current || fullModalOpen) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05
      setParallax({ x: mouseRef.current.x, y: mouseRef.current.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [mobile, fullModalOpen, handleMouseMove])

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (phase !== 'complete') return

    play('doorOpen')

    const t1 = window.setTimeout(() => {
      setXalPose('pose5')
      play('xalAppear')

      const t2 = window.setTimeout(() => {
        play('clapSound')
      }, 300)
      timeouts.current.push(t2)
    }, 600)
    timeouts.current.push(t1)

    const t3 = window.setTimeout(() => {
      setXalPose('pose5')
      setDialogueVisible(true)
      setDialogueState('narration')
      setDialogueText(PRAISE_LINES[0])
      setPraiseLineIndex(0)
      setPhase('praise')
    }, 1600)
    timeouts.current.push(t3)
  }, [phase, play])

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.realm-nav-btn') || (e.target as HTMLElement).closest('.modal-content')) return
    if ((phase === 'intro' || phase === 'praise' || phase === 'guide') && dialogueVisible) {
      handleDialogueAdvance()
    }
  }, [phase, dialogueVisible, handleDialogueAdvance])

  const bgTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -8}px, ${parallax.y * -6}px)`,
  }

  const xalIntroTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -5}px, ${parallax.y * -4}px)`,
  }

  const xalCompleteTransform = mobile ? undefined : {
    transform: `translate(${parallax.x * -5}px, ${parallax.y * -4}px)`,
  }

  // Active pillar dataset for steps 1 through 5
  const activePillar = currentStep >= 1 && currentStep <= 5 ? PILLARS[currentStep - 1] : null
  const isHopPhase = phase === 'crossing' || phase === 'pillar-view' || phase === 'final-gap'

  const handleNext = useCallback(() => {
    fadeAllAudio()
    addTimeout(() => onNext(), 500)
  }, [fadeAllAudio, onNext, addTimeout])

  const handlePrev = useCallback(() => {
    fadeAllAudio()
    addTimeout(() => onPrev(), 500)
  }, [fadeAllAudio, onPrev, addTimeout])

  return (
    <div
      ref={containerRef}
      className="realm3"
      data-phase={phase}
      data-step={currentStep}
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{GLOBAL_STYLES}</style>

      {/* Background — 7 background images (relam3-bg1.png to relam3-bg7.png) */}
      <div
        ref={bg1Ref}
        className="r3-bg"
        style={{
          backgroundImage: `url(${BACKGROUNDS[currentStep]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          ...bgTransform,
        }}
      />

      {/* Layer 1 — Lava Glow */}
      <div className="lava-glow" />

      {/* Layer 2 — Three.js Lava/Ember Particles */}
      <ParticleScene mobile={mobile} monolithActive={false} />

      {/* Layer 3 — Hop Flash Overlay */}
      <div ref={flashRef} className="hop-flash" />

      {/* Layer 4 — Xal'Vorith Intro (pose4) — ONLY on step 0 */}
      <AnimatePresence mode="wait">
        {xalPose === 'pose4' && currentStep === 0 && (
          <motion.img
            ref={xalIntroRef}
            className="xal-intro"
            src="/images/xalvorith-pose4.png"
            alt="Xal'Vorith"
            draggable={false}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={xalIntroTransform}
          />
        )}
      </AnimatePresence>

      {/* Layer 5 — Xal'Vorith Complete (pose5 & pose6) */}
      <AnimatePresence mode="wait">
        {xalPose === 'pose5' && (
          <motion.img
            ref={xalPose5Ref}
            className="xal-complete"
            src="/images/xalvorith-pose5.png"
            alt="Xal'Vorith"
            draggable={false}
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={xalCompleteTransform}
          />
        )}
        {xalPose === 'pose6' && (
          <motion.img
            ref={xalPose6Ref}
            className="xal-complete"
            src="/images/xalvorith-pose6.png"
            alt="Xal'Vorith"
            draggable={false}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={xalCompleteTransform}
          />
        )}
      </AnimatePresence>

      {/* Layer 6 — Vignette */}
      <div className="vignette" />

      {/* Layer 7 — Step Counter (steps 1-5 only) */}
      {currentStep >= 1 && currentStep <= 5 && (
        <motion.div
          className="step-counter"
          animate={{ color: currentStep === 5 ? 'rgba(212,175,55,0.85)' : 'rgba(212,175,55,0.65)' }}
        >
          PILLAR {currentStep} / 5 — {PILLARS[currentStep - 1].name}
          <span className="subtext">
            {currentStep === 5 ? 'Swipe up / ↑ to reach the door →' : 'Swipe up / ↑ to hop to next pillar'}
          </span>
        </motion.div>
      )}

      {/* Layer 8 — Top-Left Translucent Summary Information Box */}
      <AnimatePresence mode="wait">
        {activePillar && !fullModalOpen && (
          <motion.div
            key={activePillar.id}
            className="summary-box"
            style={{
              '--accent-color': activePillar.accentColor,
              '--accent-color-40': `${activePillar.accentColor}66`,
              '--accent-color-15': `${activePillar.accentColor}26`,
              '--accent-color-08': `${activePillar.accentColor}14`,
              '--accent-color-70': `${activePillar.accentColor}B3`,
              '--accent-color-60': `${activePillar.accentColor}99`,
              '--accent-color-12': `${activePillar.accentColor}1F`,
              '--accent-color-10': `${activePillar.accentColor}1A`,
              '--accent-color-50': `${activePillar.accentColor}80`,
            } as React.CSSProperties}
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <CornerBrackets color={`${activePillar.accentColor}66`} />
            <div className="info-header">
              <span className="info-name">{activePillar.name}</span>
              <span className={`info-badge ${activePillar.status === 'live' ? 'live' : 'dev'}`}>
                {activePillar.status === 'live' ? (
                  <>
                    <span className="dev-pulse">●</span> LIVE
                  </>
                ) : (
                  <>
                    <span className="dev-pulse">◌</span> IN DEVELOPMENT
                  </>
                )}
              </span>
            </div>
            <p className="info-tagline">{activePillar.tagline}</p>
            <div className="info-divider" />

            <div>
              <div className="info-section-label">OVERVIEW SUMMARY</div>
              <p className="info-text">{activePillar.pmSummary}</p>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div className="info-tech-label">BUILT WITH</div>
              <p className="info-tech-text">{activePillar.techStack}</p>
            </div>

            <button
              className="view-full-btn"
              onClick={() => {
                play('infoAppear')
                setFullModalOpen(true)
              }}
            >
              [ CLICK FOR FULL KINGDOM SPECIFICATION ↗ ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 8B — Full-Screen High Contrast Detailed Specification Modal */}
      <AnimatePresence>
        {fullModalOpen && activePillar && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{
                '--accent-color': activePillar.accentColor,
                '--accent-color-40': `${activePillar.accentColor}66`,
                '--accent-color-15': `${activePillar.accentColor}26`,
                '--accent-color-08': `${activePillar.accentColor}14`,
                '--accent-color-70': `${activePillar.accentColor}B3`,
                '--accent-color-60': `${activePillar.accentColor}99`,
                '--accent-color-12': `${activePillar.accentColor}1F`,
                '--accent-color-10': `${activePillar.accentColor}1A`,
                '--accent-color-50': `${activePillar.accentColor}80`,
              } as React.CSSProperties}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <CornerBrackets color={activePillar.accentColor} />

              <div className="info-header">
                <div>
                  <span className="info-name" style={{ fontSize: '20px' }}>
                    PILLAR {activePillar.pillarNumber} — {activePillar.name}
                  </span>
                  <p className="info-tagline" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                    {activePillar.tagline}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className={`info-badge ${activePillar.status === 'live' ? 'live' : 'dev'}`}>
                    {activePillar.status === 'live' ? (
                      <>
                        <span className="dev-pulse">●</span> LIVE
                      </>
                    ) : (
                      <>
                        <span className="dev-pulse">◌</span> IN DEVELOPMENT
                      </>
                    )}
                  </span>
                  <button
                    className="modal-close-btn"
                    onClick={() => setFullModalOpen(false)}
                    aria-label="Close Specification"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="info-divider" style={{ margin: '16px 0 20px 0' }} />

              {/* Grid: Problem & Approach / Outcome & Tech */}
              <div className="modal-grid">
                <div className="modal-block">
                  <div className="info-section-label">THE USER PROBLEM</div>
                  <p className="info-text">{activePillar.userProblem}</p>

                  <div className="info-section-label" style={{ marginTop: '16px' }}>PM SUMMARY & APPROACH</div>
                  <p className="info-text">{activePillar.pmSummary}</p>
                </div>

                <div className="modal-block">
                  <div className="info-section-label">THE OUTCOME & VALUE</div>
                  <p className="info-text">{activePillar.outcome}</p>

                  <div className="info-section-label" style={{ marginTop: '16px' }}>TECH STACK SUMMARY</div>
                  <p className="info-tech-text" style={{ fontSize: '13px' }}>{activePillar.techStack}</p>
                </div>
              </div>

              {/* Product Decisions */}
              <div style={{ marginBottom: '20px' }}>
                <div className="info-section-label decisions">KEY PRODUCT DECISIONS</div>
                <div className="modal-list">
                  {activePillar.productDecisions.map((decision, i) => (
                    <div key={i} className="modal-list-item">
                      <span className="modal-list-num">◆ {i + 1}</span>
                      <span className="modal-list-text">{decision}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full User Workflow */}
              <div style={{ marginBottom: '20px' }}>
                <div className="info-section-label">FULL USER WORKFLOW & JOURNEY</div>
                <div className="modal-list">
                  {activePillar.workflow.map((step, i) => (
                    <div key={i} className="modal-list-item" style={{ borderLeftColor: '#D4AF37' }}>
                      <span className="modal-list-num" style={{ color: '#D4AF37' }}>STEP {i + 1}</span>
                      <span className="modal-list-text">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Features */}
              <div style={{ marginBottom: '20px' }}>
                <div className="info-section-label">CORE PRODUCT FEATURES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {activePillar.features.map((feat, i) => (
                    <div key={i} className="modal-block" style={{ padding: '10px 14px' }}>
                      <span className="info-text" style={{ fontSize: '12px' }}>✦ {feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Technical Detail */}
              <div style={{ marginBottom: '20px' }}>
                <div className="info-section-label">DEEP TECHNICAL ARCHITECTURE DETAILS</div>
                {activePillar.techDetail.map((detail, i) => (
                  <div key={i} className="modal-tech-bullet">
                    {detail}
                  </div>
                ))}
              </div>

              {/* Xal'Vorith Quote */}
              <div className="modal-quote-box">
                <p className="modal-quote-text">"{activePillar.xalQuote}"</p>
                <p className="info-quote-attribution" style={{ marginTop: '6px' }}>— Xal'Vorith's Verdict</p>
              </div>

              {/* Footer Actions */}
              <div className="modal-footer-actions">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {activePillar.liveUrl && (
                    <button
                      className="info-btn info-btn-live"
                      style={{ padding: '9px 18px', fontSize: '11px' }}
                      onClick={() => { if (activePillar.liveUrl) window.open(activePillar.liveUrl, '_blank') }}
                    >
                      VISIT KINGDOM ↗
                    </button>
                  )}
                  <button
                    className="info-btn info-btn-github"
                    style={{ padding: '9px 18px', fontSize: '11px' }}
                    onClick={() => window.open(activePillar.githubUrl, '_blank')}
                  >
                    VIEW CODE SCROLLS ↗
                  </button>
                </div>
                <button
                  className="info-btn"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#CBD5E1' }}
                  onClick={() => setFullModalOpen(false)}
                >
                  CLOSE SPECIFICATION ×
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 9 — Touch / Keyboard Gesture Hint (steps 0-5) */}
      {isHopPhase && currentStep < 6 && (
        <motion.div
          className="gesture-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p>
            [ SWIPE UP / PRESS <span className="key">↑</span> TO HOP FORWARD · SWIPE DOWN / PRESS <span className="key">↓</span> TO RETREAT ]
          </p>
        </motion.div>
      )}

      {/* Layer 10 — Dialogue Box (intro + complete phases) */}
      {(phase === 'intro' || phase === 'praise' || phase === 'guide') && dialogueVisible && (
        <DialogueBox
          speaker="Xal'Vorith — The Crowned Slave of the Endless One"
          text={dialogueText}
          state={dialogueState}
          visible={dialogueVisible}
          onSkip={handleDialogueAdvance}
          hintText="[ CLICK ANYWHERE OR PRESS ANY KEY TO CONTINUE ]"
          variant="realm1"
          typewriterSpeed={28}
        />
      )}

      {/* Layer 11 — Navigation Controls (Unified Button Style) */}
      <button
        className="realm-nav-btn prev-btn"
        onClick={handlePrev}
        aria-label="Return to The Arsenal"
      >
        ← THE ARSENAL
      </button>

      {navVisible && (
        <button
          className="realm-nav-btn next-btn"
          onClick={handleNext}
          aria-label="Proceed to The Chronicles"
        >
          THE CHRONICLES ↗
        </button>
      )}
    </div>
  )
}