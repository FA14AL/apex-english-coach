require('dotenv').config();
const Groq = require('groq-sdk');

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chat(systemPrompt, messages, model = 'llama-3.3-70b-versatile') {
  const response = await groqClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 700,
    temperature: 0.8,
  });
  return response.choices[0].message.content;
}

async function transcribe(audioBuffer, mimetype) {
  const formData = new FormData();
  const audioMime = mimetype || 'audio/webm';
  const ext = audioMime.includes('mp4') ? 'mp4' : audioMime.includes('wav') ? 'wav' : 'webm';
  const blob = new Blob([audioBuffer], { type: audioMime });
  formData.append('file', blob, `recording.${ext}`);
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'en');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq Whisper error: ${errText}`);
  }

  const result = await response.json();
  return result.text;
}

async function score(prompt) {
  async function attempt(extraInstruction = '') {
    const res = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON generator. Respond with valid JSON only — no markdown, no code fences, no explanation. Just the raw JSON object.',
        },
        { role: 'user', content: prompt + extraInstruction },
      ],
      max_tokens: 900,
      temperature: 0.2,
    });
    return res.choices[0].message.content.trim();
  }

  let raw = await attempt();

  // Strip markdown code fences if model wrapped it anyway
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(raw);
  } catch {
    raw = await attempt('\n\nCRITICAL: Your entire response must be a single valid JSON object. No text before or after.');
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(raw);
  }
}

module.exports = { chat, transcribe, score };
