import { useEffect, useState } from 'react';
import axios from 'axios';
import ProgressChart from '../components/ProgressChart';

const MODULE_INFO = {
  smalltalk: { label: 'Small Talk', icon: '💬', color: '#4F46E5' },
  'accent-speaking': { label: 'Accent Speaking', icon: '🎙', color: '#7C3AED' },
  'accent-listening': { label: 'Accent Listening', icon: '👂', color: '#2563EB' },
  email: { label: 'Email Coach', icon: '✉', color: '#0891B2' },
  consulting: { label: 'Consulting + OT', icon: '📋', color: '#059669' },
};

function CircularProgress({ score }) {
  const [animScore, setAnimScore] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-gray-800">{score}</p>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>
  );
}

function getMotivationalMessage(score) {
  if (score < 30) {
    return {
      headline: "Brilliant start, Faisal.",
      body: "Every expert was once a beginner. You've taken the first step — that already puts you ahead. Let's build from here, one session at a time.",
    };
  }
  if (score < 60) {
    return {
      headline: "Good stuff — you're building momentum.",
      body: "You're making real progress. Your professional English is coming together. Keep going — the difference between 40% and 70% is just consistent practice.",
    };
  }
  if (score < 70) {
    return {
      headline: "Nearly there — spot on progress.",
      body: "You're approaching KPMG-ready. A few more focused sessions on your weak areas and you'll be walking into that placement with genuine confidence.",
    };
  }
  return {
    headline: "Lovely — you're KPMG ready.",
    body: "Your scores show you're prepared to handle the communication challenges of your placement. The KPMG Simulation is unlocked. Go show them what you've got.",
  };
}

function TrendBadge({ score }) {
  if (!score) return <span className="text-gray-400 text-xs">No data</span>;
  const color = score >= 70 ? 'text-emerald-600 bg-emerald-50' : score >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

export default function Dashboard({ userProfile, navigate }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    axios.get('/api/sessions').then((res) => setSessions(res.data || [])).catch(() => {});
  }, []);

  if (!userProfile) return null;

  const readiness = userProfile.readiness_score || 0;
  const motivation = getMotivationalMessage(readiness);
  const moduleScores = userProfile.module_scores || {};
  const weakAreas = userProfile.weak_areas || [];
  const improving = userProfile.improving || [];

  // Find module with lowest score for "Start Today's Session"
  const moduleEntries = Object.entries(moduleScores);
  let suggestedModule = 'smalltalk';
  if (moduleEntries.length > 0) {
    const sorted = moduleEntries.sort((a, b) => a[1] - b[1]);
    suggestedModule = sorted[0][0];
  }

  const recentSessions = sessions.slice(0, 5);

  const weakAreaAdvice = {
    naturalness: "Focus on contractions and informal connectors: 'I'd', 'it's', 'you know', 'to be honest'.",
    vocabulary: "Spend 10 minutes daily reading BBC News or The Guardian to absorb natural British phrasing.",
    confidence: "Record yourself speaking for 2 minutes daily. Hearing yourself builds familiarity.",
    hesitation: "Replace 'um' and 'uh' with a short pause or 'Right, so...' — it sounds more confident.",
    question_quality: "End more of your turns with a question. It shows engagement and extends the conversation.",
    formality: "Watch for over-formal phrases — 'I would like to enquire' → 'Can I ask...' is more natural.",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Good to see you, Faisal</h1>
        <p className="text-gray-500 text-sm mt-1">
          {userProfile.sessions_completed} sessions completed
          {userProfile.last_session
            ? ` · Last session ${new Date(userProfile.last_session).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
            : ' · No sessions yet'}
        </p>
      </div>

      {/* Top grid: readiness + motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Readiness circle */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">KPMG Readiness Score</p>
          <CircularProgress score={readiness} />
          <p className="text-sm text-gray-500 mt-3">
            {readiness < 70 ? `${70 - readiness} points to unlock KPMG Simulation` : 'KPMG Simulation unlocked!'}
          </p>
        </div>

        {/* Motivation from Alex */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AX</div>
            <span className="text-xs font-semibold text-purple-600">ALEX SAYS</span>
          </div>
          <p className="font-semibold text-gray-800 mb-2">{motivation.headline}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{motivation.body}</p>
        </div>
      </div>

      {/* Module scores */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Module Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(MODULE_INFO).map(([id, info]) => {
            const score = moduleScores[id] || moduleScores[id.replace('-', '')] || null;
            return (
              <button
                key={id}
                onClick={() => navigate(id === 'email' ? 'email-coach' : id)}
                className="flex flex-col items-center p-4 rounded-xl border hover:shadow-md transition-all hover:border-indigo-200 text-center"
              >
                <span className="text-2xl mb-2">{info.icon}</span>
                <p className="text-xs font-medium text-gray-600 mb-2">{info.label}</p>
                <TrendBadge score={score} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Alex's Observations</h2>
          <p className="text-sm text-gray-500 mb-4">Areas to prioritise based on your sessions</p>
          <div className="space-y-3">
            {weakAreas.slice(0, 3).map((area) => (
              <div key={area} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-amber-500 text-lg mt-0.5">⚠</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700 capitalize">{area.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {weakAreaAdvice[area] || 'Keep practising this in your sessions.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {improving.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 mb-1">IMPROVING</p>
              <p className="text-sm text-gray-700">{improving.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Recent sessions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sessions yet — start one below!</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{s.scenario_title || s.module}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {s.scores?.overall !== undefined && (
                  <TrendBadge score={s.scores.overall} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress chart */}
      {sessions.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Overall Progress</h2>
          <ProgressChart data={sessions} metric="overall" />
        </div>
      )}

      {/* Start session CTA */}
      <div className="text-center pb-4">
        <button
          onClick={() => navigate(suggestedModule === 'email' ? 'email-coach' : suggestedModule || 'smalltalk')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          Start Today's Session
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Suggested: {MODULE_INFO[suggestedModule]?.label || "Small Talk"}
        </p>
      </div>
    </div>
  );
}
