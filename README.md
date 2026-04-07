# APEX English Coach

> An AI-powered British English coaching app built for professional placement preparation at KPMG UK.

APEX English Coach is a full-stack web application that uses Groq's LLM and Whisper APIs to give Faisal — an MSc AI student from Lancaster University — a personalised British English coaching environment before starting his placement on KPMG's OT Synapse team.

---

## Features

### 7 Training Modules

| Module | What it does |
|--------|-------------|
| **Dashboard** | Readiness score, module progress, Alex's observations, motivational feedback |
| **Small Talk** | 25 real UK workplace scenarios across 3 difficulty tiers |
| **Accent Speaking** | 5 exercise types: non-rhotic R, long AH vowel, crisp T, stress patterns, shadowing |
| **Accent Listening** | 35 natural British phrases at native speed with word-by-word accuracy scoring |
| **Email Coach** | 15 KPMG placement email scenarios with AI scoring + Alex's full rewrite |
| **Consulting + OT Language** | 50+ consulting phrases and 30 OT security terms with voice practice |
| **KPMG Day 1 Simulation** | 6-scene simulation: reception, lift chat, manager, emails, team intro, client call |

### AI Persona — Alex

Alex is a warm, direct British English coach. He speaks naturally British ("brilliant", "right then", "spot on"), gives specific honest feedback, and always provides one concrete rephrasing example.

### Voice-First Design

- **Speech-to-text** via Groq Whisper API — records audio in browser, transcribes server-side
- **Text-to-speech** via Web Speech Synthesis API — prefers en-GB voice
- **Text fallback** — type instead if mic is unavailable

### Token-Efficient Architecture

- Only last 4 messages kept in active conversation context
- `llama-3.3-70b-versatile` for live conversation turns
- `llama-3.1-8b-instant` for all scoring, feedback, and summarisation
- Session transcripts compressed to 200-token summaries before saving
- User profile object (max 300 tokens) sent with every request — no full history

---

## Tech Stack

```
Frontend    React 18 + Vite + Tailwind CSS (plain JavaScript)
Backend     Node.js + Express
AI Chat     Groq API — llama-3.3-70b-versatile
AI Scoring  Groq API — llama-3.1-8b-instant
Speech-to-Text  Groq Whisper API — whisper-large-v3
Text-to-Speech  Web Speech Synthesis API (browser built-in, en-GB)
Database    Supabase (PostgreSQL)
Charts      Recharts
```

---

## Project Structure

```
apex-english-coach/
├── backend/
│   ├── server.js        # Express server, 8 API routes
│   ├── alex.js          # System prompt builder, context trimmer, session compressor
│   ├── groq.js          # Chat, Whisper transcription, JSON scoring
│   └── supabase.js      # Profile and session database operations
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AlexAvatar.jsx      # Animated avatar (speaking/listening/idle)
│       │   ├── AlexSpeech.jsx      # Text-to-speech with subtitle display
│       │   ├── VoiceRecorder.jsx   # MediaRecorder + Whisper transcription
│       │   ├── ScoreCard.jsx       # Animated score bars with colour coding
│       │   ├── ProgressChart.jsx   # Recharts line chart for session history
│       │   └── LoadingSpinner.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── SmallTalk.jsx       # 25 scenarios
│       │   ├── AccentSpeaking.jsx  # 5 exercise types
│       │   ├── AccentListening.jsx # 35 phrases
│       │   ├── EmailCoach.jsx      # 15 scenarios
│       │   ├── ConsultingLanguage.jsx  # 50+ phrases + 30 OT terms
│       │   └── KPMGSimulation.jsx  # 6-scene Day 1 simulation
│       └── App.jsx      # Sidebar nav, state-based routing
├── supabase/
│   └── schema.sql       # Table definitions — paste into Supabase SQL Editor
├── .env.example         # Copy to .env and add your keys
└── package.json         # Root scripts: dev, install:all
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/apex-english-coach.git
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
- Backend: [http://localhost:3001](http://localhost:3001)

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/chat` | Conversation with Alex (70b model) |
| `POST` | `/api/score` | Structured JSON scoring (8b model) |
| `POST` | `/api/transcribe` | Audio → text via Groq Whisper |
| `POST` | `/api/summarise` | Compress session transcript to 200-token summary |
| `GET` | `/api/profile` | Get user profile (creates default if none) |
| `PUT` | `/api/profile` | Update user profile |
| `POST` | `/api/session` | Save completed session |
| `GET` | `/api/sessions` | Get last 20 sessions |

---

## Supabase Schema

```sql
profiles    -- Single user profile with readiness score, module scores, weak areas
sessions    -- Individual session records with scores and summaries
daily_reports -- Optional daily progress reports
```

---

## Design

- **Primary:** `#4F46E5` (indigo)
- **Background:** `#F8FAFC`
- **Success / Warning / Danger:** `#10B981` / `#F59E0B` / `#EF4444`
- Sidebar (240px) on desktop, hamburger menu on mobile
- All Tailwind — no component library
- Smooth transitions, animated score bars, SVG circular progress

---

## The Context

This app was built specifically for Faisal, an MSc Artificial Intelligence student at Lancaster University who is starting a year-long placement at **KPMG UK** on the **OT Synapse** team — a specialist group working on Operational Technology cybersecurity: protecting industrial control systems, SCADA networks, and critical infrastructure using AI and data analysis.

The KPMG Simulation module is locked until you reach 70% readiness — a deliberate design choice to ensure you've built the fundamentals before attempting the full Day 1 scenario.

---

## Built With

- [Groq](https://groq.com) — fastest LLM inference available
- [Supabase](https://supabase.com) — open source Firebase alternative
- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)

---

*Built in one session. Every file is complete — no placeholders, no TODO comments.*
