import { useState, useRef } from 'react';
import axios from 'axios';
import AlexAvatar from '../components/AlexAvatar';
import AlexSpeech from '../components/AlexSpeech';
import VoiceRecorder from '../components/VoiceRecorder';
import LoadingSpinner from '../components/LoadingSpinner';

const SCENES = [
  {
    id: 1,
    title: "Reception Arrival",
    icon: "🏢",
    description: "You've just arrived at KPMG's office for your first day. The receptionist greets you warmly.",
    alexRole: "Friendly receptionist",
    opening: "Good morning! Welcome to KPMG. You must be Faisal — we've been expecting you. How was your journey in? Can I get you a visitor's pass sorted?",
    tip: "Small talk with reception sets the tone for your first impression. Be warm and relaxed.",
    type: "conversation",
    exchanges: 2,
  },
  {
    id: 2,
    title: "Lift Encounter",
    icon: "🛗",
    description: "You're waiting for the lift with a KPMG employee you haven't met. They make conversation.",
    alexRole: "KPMG employee from a different team",
    opening: "Morning! You new? I'm sure I haven't seen you around before — which team are you joining?",
    tip: "Three exchanges of natural small talk. Keep it light, show genuine curiosity about them too.",
    type: "conversation",
    exchanges: 3,
  },
  {
    id: 3,
    title: "Coffee Machine — First Meeting with Manager",
    icon: "☕",
    description: "You run into your manager Dr. Priya Sharma at the coffee machine before your official introduction.",
    alexRole: "Dr. Priya Sharma, your manager",
    opening: "Oh, you must be Faisal! I was going to find you after my nine o'clock — glad to bump into you. How are you feeling about starting today?",
    tip: "This is your manager. Be warm, show enthusiasm, but don't oversell. Ask one good question about the team.",
    type: "conversation",
    exchanges: 3,
  },
  {
    id: 4,
    title: "Day One Emails",
    icon: "✉",
    description: "You sit down at your desk and find two emails waiting for you. Reply to both.",
    type: "email",
    emails: [
      {
        from: "Marcus Webb, OT Synapse Team",
        subject: "Welcome to the team, Faisal!",
        body: "Hi Faisal, welcome aboard! Great to have you joining us. When you get a chance, would love to hear a bit about yourself — where you're from, what you studied, what drew you to OT security. Looking forward to working with you. Marcus",
        task: "Reply warmly, introduce yourself briefly, and express genuine enthusiasm for the team's work.",
      },
      {
        from: "Helena Marsh, Client Project Manager — PowerGrid UK",
        subject: "Re: OT Assessment — Team Introduction",
        body: "Hello, I understand there's a new team member joining the OT Synapse project. Could you confirm who will be working with us and their background? We have a call next Wednesday and would like to know who to expect. Best, Helena Marsh",
        task: "Reply professionally to this external client. Introduce yourself briefly and professionally. Confirm you'll be on the Wednesday call.",
      },
    ],
  },
  {
    id: 5,
    title: "Team Meeting Introduction",
    icon: "👥",
    description: "Your manager introduces you to the full OT Synapse team. She asks you to say a few words about yourself.",
    alexRole: "Dr. Priya Sharma, facilitating the team meeting",
    opening: "Right everyone, as you know Faisal is joining us today for his placement year from Lancaster. Faisal, do you want to say a few words — tell everyone a bit about yourself and what you're hoping to get out of the year?",
    tip: "This is your public self-introduction to the whole team. Be confident, warm, and authentic. 60-90 seconds max. Cover: who you are, your background, what draws you to OT security, one thing you're excited to learn.",
    type: "speech",
    exchanges: 1,
  },
  {
    id: 6,
    title: "Client Call — Background Questions",
    icon: "📞",
    description: "You join a brief introductory call with the client. The client lead asks you about your background and what you'll be working on.",
    alexRole: "Helena Marsh, Client Project Manager at PowerGrid UK",
    opening: "Thanks for joining Faisal. We like to know a bit about the people we're working with. Can you tell us a bit about your background — your studies, your experience — and specifically what you'll be contributing to this engagement?",
    tip: "Professional self-introduction to a client. Mention your AI/ML background and how it relates to OT security. Be specific about what you'll contribute. Don't undersell yourself — you're representing KPMG.",
    type: "conversation",
    exchanges: 2,
  },
];

function SimpleMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-1">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold text-gray-800 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-base font-semibold text-gray-700 mt-3 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <p key={i} className="text-sm text-gray-700 pl-4 flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span><span>{line.slice(2)}</span></p>;
        }
        if (line.match(/^\d+\. /)) {
          return <p key={i} className="text-sm text-gray-700 pl-4">{line}</p>;
        }
        if (line.trim() === '') {
          return <div key={i} className="h-1" />;
        }
        return <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

export default function KPMGSimulation({ userProfile, setUserProfile }) {
  const [started, setStarted] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [alexText, setAlexText] = useState('');
  const [alexState, setAlexState] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [sceneComplete, setSceneComplete] = useState(false);
  const [sceneScore, setSceneScore] = useState(null);
  const [allSceneData, setAllSceneData] = useState([]);
  const [emailReplies, setEmailReplies] = useState({ 0: '', 1: '' });
  const [emailScores, setEmailScores] = useState({});
  const [emailsSubmitted, setEmailsSubmitted] = useState({});
  const [simulationDone, setSimulationDone] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const alexRef = useRef(null);

  const readiness = userProfile?.readiness_score ?? 0;

  if (readiness < 70 && !started) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">KPMG Day 1 Simulation</h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          Complete the other modules to reach <span className="font-bold text-indigo-600">70% readiness</span> to unlock this simulation.
        </p>
        <div className="bg-white border rounded-xl p-6 max-w-xs w-full">
          <p className="text-sm text-gray-500 mb-3">Current readiness</p>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${readiness}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{readiness}%</span>
            <span>70% required</span>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>Modules to practise:</p>
          <p>💬 Small Talk · 🎙 Accent Speaking</p>
          <p>✉ Email Coach · 📋 Consulting Language</p>
        </div>
      </div>
    );
  }

  const currentScene = SCENES[currentSceneIndex];

  const beginSimulation = () => {
    setStarted(true);
    setCurrentSceneIndex(0);
    setMessages([]);
    setAllSceneData([]);
    setSceneScore(null);
    setSceneComplete(false);
    setExchangeCount(0);
    setEmailReplies({ 0: '', 1: '' });
    setEmailScores({});
    setEmailsSubmitted({});

    const scene = SCENES[0];
    setMessages([{ role: 'assistant', content: scene.opening }]);
    setAlexText(scene.opening);
    setAlexState('speaking');
  };

  const handleUserResponse = async (text) => {
    if (loading || sceneComplete) return;
    const scene = SCENES[currentSceneIndex];
    setAlexState('listening');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    const newCount = exchangeCount + 1;
    setExchangeCount(newCount);

    if (newCount >= scene.exchanges) {
      await scoreScene(newMessages, scene);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/chat', {
        messages: newMessages,
        userProfile,
        moduleContext: `KPMG Day 1 Simulation — Scene: ${scene.title}. You are playing: ${scene.alexRole}. ${scene.tip}`,
      });
      const reply = res.data.message;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setAlexText(reply);
      setAlexState('speaking');
    } catch {
      setAlexText("Let's keep going — what would you say?");
      setAlexState('speaking');
    } finally {
      setLoading(false);
    }
  };

  const scoreScene = async (msgs, scene) => {
    setLoading(true);
    const transcript = msgs.map((m) => `${m.role === 'assistant' ? scene.alexRole : 'Faisal'}: ${m.content}`).join('\n');
    try {
      const res = await axios.post('/api/score', {
        transcript,
        module: 'smalltalk',
        scenario: `KPMG Day 1 — ${scene.title}`,
      });
      setSceneScore(res.data);
      setAllSceneData((prev) => [...prev, { scene: scene.title, transcript, scores: res.data }]);
      setSceneComplete(true);
      setAlexState('idle');
    } catch {
      setSceneScore({ overall: 0, feedback: "Couldn't score this scene — moving on." });
      setSceneComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (emailIndex) => {
    const reply = emailReplies[emailIndex];
    if (!reply.trim()) return;
    setLoading(true);
    const scene = SCENES[3];
    const email = scene.emails[emailIndex];
    try {
      const res = await axios.post('/api/score', {
        transcript: `Original email:\nFrom: ${email.from}\nSubject: ${email.subject}\n${email.body}\n\nFaisal's reply:\n${reply}`,
        module: 'email',
        scenario: `KPMG Day 1 Email — ${email.from}`,
      });
      setEmailScores((prev) => ({ ...prev, [emailIndex]: res.data }));
      setEmailsSubmitted((prev) => ({ ...prev, [emailIndex]: true }));
      setAllSceneData((prev) => [...prev, { scene: `Email to ${email.from}`, transcript: reply, scores: res.data }]);
    } catch {
      setEmailScores((prev) => ({ ...prev, [emailIndex]: { overall: 0, feedback: "Could not score." } }));
      setEmailsSubmitted((prev) => ({ ...prev, [emailIndex]: true }));
    } finally {
      setLoading(false);
    }
  };

  const bothEmailsDone = emailsSubmitted[0] && emailsSubmitted[1];

  const goToNextScene = () => {
    const nextIndex = currentSceneIndex + 1;
    if (nextIndex >= SCENES.length) {
      finishSimulation();
      return;
    }
    setCurrentSceneIndex(nextIndex);
    setMessages([]);
    setSceneScore(null);
    setSceneComplete(false);
    setExchangeCount(0);
    setLoading(false);

    const nextScene = SCENES[nextIndex];
    if (nextScene.type !== 'email') {
      setMessages([{ role: 'assistant', content: nextScene.opening }]);
      setAlexText(nextScene.opening);
      setAlexState('speaking');
    } else {
      setAlexText('');
      setAlexState('idle');
    }
  };

  const finishSimulation = async () => {
    setSimulationDone(true);
    setGeneratingReport(true);
    const fullTranscript = allSceneData.map((d) => `SCENE: ${d.scene}\n${d.transcript}\nScores: ${JSON.stringify(d.scores)}`).join('\n\n---\n\n');
    try {
      const res = await axios.post('/api/score', {
        transcript: fullTranscript,
        module: 'kpmg-simulation',
        scenario: 'Full Day 1 KPMG Simulation',
      });
      setFinalReport(res.data);

      try {
        await axios.post('/api/session', {
          module: 'kpmg-simulation',
          scenario_title: 'KPMG Day 1 Simulation',
          scores: res.data,
          summary: 'Full 6-scene KPMG Day 1 simulation completed.',
          duration_seconds: 0,
        });
        const currentScores = userProfile?.module_scores || {};
        const updated = await axios.put('/api/profile', {
          sessions_completed: (userProfile?.sessions_completed || 0) + 1,
          module_scores: { ...currentScores, 'kpmg-simulation': res.data.overall || 0 },
          readiness_score: Math.min(100, readiness + 5),
        });
        if (setUserProfile) setUserProfile(updated.data);
      } catch {}
    } catch {
      setFinalReport({ overall: 0, report_markdown: "Couldn't generate the full report right now. Your performance across all scenes was recorded. Well done for completing the simulation." });
    } finally {
      setGeneratingReport(false);
    }
  };

  if (!started) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">KPMG Day 1 Simulation</h1>
        <p className="text-gray-500 text-sm mb-6">
          6 realistic scenes from your first day at KPMG's OT Synapse team. Reception, lift chat, meeting your manager, emails, team intro, and client call.
        </p>
        <div className="grid gap-3 mb-6">
          {SCENES.map((s, i) => (
            <div key={s.id} className="bg-white border rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Scene {i + 1}: {s.title}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={beginSimulation}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
          >
            Begin Day 1 Simulation
          </button>
          <p className="text-xs text-gray-400 mt-2">Approximately 15–20 minutes</p>
        </div>
      </div>
    );
  }

  if (simulationDone) {
    return (
      <div className="space-y-5">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800">Day 1 Simulation Complete!</h1>
          <p className="text-gray-500 mt-1">Here's Alex's full debrief on your performance.</p>
        </div>

        {generatingReport ? (
          <div className="text-center py-10">
            <LoadingSpinner text="Alex is writing your debrief report..." />
            <p className="text-xs text-gray-400 mt-2">This may take 15–20 seconds</p>
          </div>
        ) : finalReport ? (
          <div className="space-y-4">
            {finalReport.overall !== undefined && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                <p className="text-4xl font-bold text-indigo-700">{finalReport.overall}/100</p>
              </div>
            )}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AX</div>
                <span className="text-sm font-semibold text-gray-700">Alex's Full Debrief</span>
              </div>
              <SimpleMarkdown text={finalReport.report_markdown} />
            </div>
            <div className="text-center">
              <button
                onClick={() => { setStarted(false); setSimulationDone(false); setCurrentSceneIndex(0); setAllSceneData([]); setFinalReport(null); }}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700"
              >
                Run Simulation Again
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        {SCENES.map((s, i) => (
          <div
            key={s.id}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i < currentSceneIndex ? 'bg-indigo-600' : i === currentSceneIndex ? 'bg-indigo-300' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Scene header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{currentScene.icon}</span>
        <div>
          <p className="text-xs text-gray-400 font-medium">Scene {currentSceneIndex + 1} of {SCENES.length}</p>
          <h2 className="text-xl font-bold text-gray-800">{currentScene.title}</h2>
        </div>
      </div>

      {/* Description + tip */}
      <div className="bg-slate-50 border rounded-xl p-4 mb-4 text-sm">
        <p className="text-gray-600 mb-2">{currentScene.description}</p>
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <span className="text-amber-700 font-semibold text-xs">TIP: </span>
          <span className="text-amber-800 text-xs">{currentScene.tip}</span>
        </div>
      </div>

      {/* EMAIL SCENE */}
      {currentScene.type === 'email' && (
        <div className="space-y-5">
          {currentScene.emails.map((email, emailIdx) => (
            <div key={emailIdx} className="bg-white border rounded-xl p-5">
              <div className="border-b pb-3 mb-3">
                <p className="text-xs text-gray-400">From: <span className="text-gray-700 font-medium">{email.from}</span></p>
                <p className="text-xs text-gray-400">Subject: <span className="text-gray-700 font-medium">{email.subject}</span></p>
              </div>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{email.body}</p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                <span className="text-amber-700 font-semibold text-xs">YOUR GOAL: </span>
                <span className="text-amber-800 text-xs">{email.task}</span>
              </div>

              {!emailsSubmitted[emailIdx] ? (
                <div>
                  <textarea
                    value={emailReplies[emailIdx]}
                    onChange={(e) => setEmailReplies((prev) => ({ ...prev, [emailIdx]: e.target.value }))}
                    placeholder="Subject: \n\nDear ..."
                    rows={7}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                  <button
                    onClick={() => handleEmailSubmit(emailIdx)}
                    disabled={loading || !emailReplies[emailIdx].trim()}
                    className="mt-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-200 transition-colors"
                  >
                    {loading ? 'Scoring...' : 'Submit Email'}
                  </button>
                </div>
              ) : emailScores[emailIdx] ? (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Email Score</span>
                    <span className={`text-lg font-bold ${emailScores[emailIdx].overall >= 70 ? 'text-emerald-600' : emailScores[emailIdx].overall >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {emailScores[emailIdx].overall}/100
                    </span>
                  </div>
                  {emailScores[emailIdx].feedback && (
                    <p className="text-xs text-gray-600">{emailScores[emailIdx].feedback}</p>
                  )}
                </div>
              ) : null}
            </div>
          ))}

          {bothEmailsDone && (
            <div className="text-center">
              <button onClick={goToNextScene} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700">
                Next Scene →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SPEECH/CONVERSATION SCENE */}
      {currentScene.type !== 'email' && (
        <div>
          {/* Alex + messages */}
          <div className="flex items-start gap-3 mb-4">
            <AlexAvatar state={alexState} size="lg" />
            <div className="flex-1">
              <AlexSpeech ref={alexRef} text={alexText} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4 mb-4 max-h-72 overflow-y-auto scrollbar-thin space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-4 py-3 text-sm max-w-xs md:max-w-md ${
                  m.role === 'assistant' ? 'bg-purple-50 border border-purple-100 text-purple-900 mr-auto' : 'bg-indigo-600 text-white ml-auto'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && <LoadingSpinner text="..." />}
          </div>

          {!sceneComplete && (
            <VoiceRecorder onTranscript={handleUserResponse} disabled={loading} />
          )}

          {/* Scene score flash */}
          {sceneComplete && sceneScore && (
            <div className="bg-white border rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Scene Score</p>
                <span className={`text-xl font-bold ${sceneScore.overall >= 70 ? 'text-emerald-600' : sceneScore.overall >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {sceneScore.overall}/100
                </span>
              </div>
              {sceneScore.feedback && (
                <p className="text-xs text-gray-500 mt-1">{sceneScore.feedback}</p>
              )}
            </div>
          )}

          {sceneComplete && (
            <div className="text-center">
              <button
                onClick={goToNextScene}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700"
              >
                {currentSceneIndex + 1 >= SCENES.length ? 'Finish Simulation →' : 'Next Scene →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
