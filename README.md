# APEX English Coach

> A personal project — an AI-powered British English coaching app I built to improve my own professional communication skills.

I'm an MSc Artificial Intelligence student who moved to the UK and wanted to get better at spoken professional English — small talk, workplace conversations, formal emails, and technical vocabulary. Rather than using a generic app, I built my own.

APEX is a full-stack web app that uses Groq's LLM and Whisper APIs to give me a personalised coaching environment with an AI persona called Alex, a warm British English coach who gives honest, specific feedback.

---

## Why I Built This

Moving to the UK for postgraduate study, I noticed gaps in my spoken professional English — not grammar, but the natural rhythms of British workplace conversation: how people do small talk, how emails are phrased, how to sound confident rather than overly formal. I couldn't find a tool that addressed this specifically, so I built one.

This is a personal learning tool, not a product.

---

## Features

### 7 Training Modules

| Module | What it does |
| ------ | ------------ |
| **Dashboard** | Readiness score, module progress, Alex's observations, motivational feedback |
| **Small Talk** | 25 real UK workplace scenarios across 3 difficulty tiers |
| **Accent Speaking** | 5 exercise types: non-rhotic R, long AH vowel, crisp T, stress patterns, shadowing |
| **Accent Listening** | 35 natural British phrases at native speed with word-by-word accuracy scoring |
| **Email Coach** | 15 professional email scenarios with AI scoring + Alex's full rewrite |
| **Consulting + OT Language** | 50+ professional phrases and 30 technical vocabulary terms with voice practice |
| **Workplace Simulation** | 6-scene Day 1 simulation: reception, lift chat, line manager, emails, team intro, client call |

### AI Persona — Alex

Alex is a warm, direct British English coach. He speaks naturally British ("brilliant", "right then", "spot on"), gives honest and specific feedback, and always provides one concrete rephrasing example per piece of feedback.

### Voice-First Design

- **Speech-to-text** via Groq Whisper API — records audio in the browser, transcribes server-side
- **Text-to-speech** via Web Speech Synthesis API — prefers en-GB voice at 0.9x rate
- **Text fallback** — type instead if mic is unavailable

### Token-Efficient Architecture

- Only last 4 messages kept in active conversation context
- `llama-3.3-70b-versatile` for live conversation turns with Alex
- `llama-3.1-8b-instant` for all scoring, feedback, and summarisation
- Session transcripts compressed to 200-token summaries before saving to the database
- User profile object (max 300 tokens) sent with every request — no full history ever sent to the API

---

## Tech Stack

```text
Frontend        React 18 + Vite + Tailwind CSS (plain JavaScript, no TypeScript)
Backend         Node.js + Express
AI Conversation Groq API — llama-3.3-70b-versatile
AI Scoring      Groq API — llama-3.1-8b-instant
Speech-to-Text  Groq Whisper API — whisper-large-v3
Text-to-Speech  Web Speech Synthesis API (browser built-in, en-GB voice)
Database        Supabase (PostgreSQL)
Charts          Recharts
```

---

## Project Structure

```text
apex-english-coach/
├── backend/
│   ├── server.js        # Express server, 8 API routes
│   ├── alex.js          # System prompt builder, context trimmer, session compressor
│   ├── groq.js          # Chat, Whisper transcription, JSON scoring with retry logic
│   └── supabase.js      # Profile and session database operations
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AlexAvatar.jsx      # Animated avatar (speaking/listening/idle states)
│       │   ├── AlexSpeech.jsx      # Text-to-speech with subtitle display
│       │   ├── VoiceRecorder.jsx   # MediaRecorder + Whisper transcription
│       │   ├── ScoreCard.jsx       # Animated score bars with colour coding
│       │   ├── ProgressChart.jsx   # Recharts line chart for session history
│       │   └── LoadingSpinner.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── SmallTalk.jsx           # 25 scenarios
│       │   ├── AccentSpeaking.jsx      # 5 exercise types
│       │   ├── AccentListening.jsx     # 35 phrases
│       │   ├── EmailCoach.jsx          # 15 scenarios
│       │   ├── ConsultingLanguage.jsx  # 50+ phrases + 30 technical terms
│       │   └── KPMGSimulation.jsx      # 6-scene workplace simulation
│       └── App.jsx      # Sidebar nav, state-based routing (no react-router)
├── supabase/
│   └── schema.sql       # Table definitions — paste into Supabase SQL Editor
├── .env.example         # Copy to .env and fill in your keys
└── package.json         # Root scripts: dev, install:all
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com) — free tier is generous
- A [Supabase](https://supabase.com) project — free tier is fine

### 1 — Clone and install

```bash
git clone https://github.com/FA14AL/apex-english-coach.git
cd apex-english-coach
npm run install:all
```

### 2 — Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key, Supabase URL, and Supabase anon key.

### 3 — Create the database tables

1. Open your Supabase project → **SQL Editor** → **New Query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### 4 — Start the app

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3001](http://localhost:3001)

The Vite dev server proxies all `/api` requests to the backend, so there are no CORS issues during development.

---

## API Routes

| Method | Route | Description |
| ------ | ----- | ----------- |
| `POST` | `/api/chat` | Live conversation with Alex (70b model) |
| `POST` | `/api/score` | Structured JSON scoring (8b model) |
| `POST` | `/api/transcribe` | Audio file → transcript via Groq Whisper |
| `POST` | `/api/summarise` | Compress session transcript to 200-token summary |
| `GET` | `/api/profile` | Fetch user profile (creates default row if none exists) |
| `PUT` | `/api/profile` | Update user profile and readiness score |
| `POST` | `/api/session` | Save completed session record |
| `GET` | `/api/sessions` | Fetch last 20 sessions ordered by date |

---

## Database Schema

```sql
profiles      -- User profile: readiness score, module scores, weak areas, improving areas
sessions      -- Per-session records: module, scores JSON, summary, duration, WPM
daily_reports -- Optional daily progress reports with markdown content
```

---

## Design System

- **Primary:** `#4F46E5` (indigo)
- **Background:** `#F8FAFC` (slate-50)
- **Success / Warning / Danger:** `#10B981` / `#F59E0B` / `#EF4444`
- Sidebar navigation (240px) on desktop, hamburger menu on mobile
- Pure Tailwind — no component library
- Animated score bars, SVG circular progress indicator, CSS keyframe animations
- Smooth page transitions via opacity + translate

---

## Built With

- [Groq](https://groq.com) — fastest LLM inference available
- [Supabase](https://supabase.com) — open source Firebase alternative
- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
