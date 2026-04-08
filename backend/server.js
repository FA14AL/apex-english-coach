require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { chat, transcribe, score, speak } = require('./groq');
const { buildSystemPrompt, buildConversationContext, compressSession } = require('./alex');
const { getProfile, updateProfile, saveSession, getSessions } = require('./supabase');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function buildScoringPrompt(transcript, module, scenario) {
  const base = `You are a professional British English language coach and assessor. Analyse the following and return ONLY a valid JSON object with no extra text.\n\nScenario: ${scenario || 'General practice'}\nModule: ${module}\n\nContent to assess:\n${typeof transcript === 'string' ? transcript : JSON.stringify(transcript)}\n\n`;

  if (module === 'smalltalk') {
    return base + `Return JSON: {"naturalness":0-100,"vocabulary":0-100,"confidence":0-100,"question_quality":0-100,"overall":0-100,"feedback":"2-3 sentences of specific honest feedback referencing Indian English to British English patterns","example_rephrasing":"one concrete better version of their weakest moment","strengths":"one sentence on what they did well"}`;
  }
  if (module === 'email') {
    return base + `Return JSON: {"tone":0-100,"professionalism":0-100,"brevity":0-100,"clarity":0-100,"subject_line_quality":0-100,"overall":0-100,"feedback":"specific feedback on the email","rewritten_email":"Alex's improved version of the full email","tip_1":"specific actionable tip","tip_2":"specific actionable tip","tip_3":"specific actionable tip"}`;
  }
  if (module === 'accent') {
    return base + `Return JSON: {"accuracy":0-100,"clarity":0-100,"british_features":0-100,"overall":0-100,"feedback":"specific feedback on pronunciation referencing Indian English to British English transition","what_to_practise":"one specific exercise to improve","example":"the correct pronunciation described in plain English"}`;
  }
  if (module === 'listening') {
    return base + `Return JSON: {"words_correct":0-100,"overall":0-100,"feedback":"brief feedback"}`;
  }
  if (module === 'consulting') {
    return base + `Return JSON: {"structure":0-100,"vocabulary":0-100,"confidence":0-100,"client_appropriateness":0-100,"overall":0-100,"feedback":"specific feedback on consulting language use","better_version":"a stronger version of their response using more appropriate consulting language"}`;
  }
  if (module === 'kpmg-simulation') {
    return base + `Score this full Day 1 KPMG simulation. Return JSON: {"small_talk":0-100,"professional_tone":0-100,"email_quality":0-100,"self_introduction":0-100,"client_readiness":0-100,"overall":0-100,"report_markdown":"A detailed markdown report covering: ## What Went Well, ## Areas to Work On, ## Overall Readiness Verdict, ## 3 Specific Actions Before Your First Day. Be warm, honest, and specific as Alex the coach. Min 300 words."}`;
  }
  return base + `Return JSON: {"overall":0-100,"feedback":"specific feedback","suggestions":"concrete improvements"}`;
}

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile, moduleContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const systemPrompt = buildSystemPrompt(userProfile || {}, moduleContext || '');
    const contextMessages = buildConversationContext(messages);
    const response = await chat(systemPrompt, contextMessages, 'llama-3.3-70b-versatile');
    res.json({ message: response });
  } catch (error) {
    console.error('/api/chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/score
app.post('/api/score', async (req, res) => {
  try {
    const { transcript, module: mod, scenario } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript is required' });
    const prompt = buildScoringPrompt(transcript, mod || 'general', scenario || '');
    const result = await score(prompt);
    res.json(result);
  } catch (error) {
    console.error('/api/score error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transcribe
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
    const transcript = await transcribe(req.file.buffer, req.file.mimetype);
    res.json({ transcript });
  } catch (error) {
    console.error('/api/transcribe error — full details:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/speak
app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const audioBuffer = await speak(text);
    res.set('Content-Type', 'audio/wav');
    res.set('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    console.error('/api/speak error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/speak/test
app.get('/api/speak/test', async (req, res) => {
  try {
    const audioBuffer = await speak("Hello Faisal, I'm Alex, your British English coach. Brilliant to meet you.");
    res.set('Content-Type', 'audio/wav');
    res.set('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    console.error('/api/speak/test error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/summarise
app.post('/api/summarise', async (req, res) => {
  try {
    const { transcript, scores } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript is required' });
    const prompt = compressSession(transcript, scores);
    const summary = await chat(
      'You compress coaching session transcripts into concise summaries. Return only the summary paragraph, no extra text.',
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant'
    );
    res.json({ summary });
  } catch (error) {
    console.error('/api/summarise error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/profile
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (error) {
    console.error('/api/profile GET error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile
app.put('/api/profile', async (req, res) => {
  try {
    const updated = await updateProfile(req.body);
    res.json(updated);
  } catch (error) {
    console.error('/api/profile PUT error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/session
app.post('/api/session', async (req, res) => {
  try {
    const session = await saveSession(req.body);
    res.json(session);
  } catch (error) {
    console.error('/api/session POST error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await getSessions(20);
    res.json(sessions);
  } catch (error) {
    console.error('/api/sessions GET error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`APEX English Coach backend running on http://localhost:${PORT}`);
});
