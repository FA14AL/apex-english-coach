import { useState, useEffect } from 'react';
import axios from 'axios';
import ScoreCard from '../components/ScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SCENARIOS = [
  { id: 1, title: "Unhappy Client — Late Deliverable", context: "A client has emailed you expressing frustration that a report was due yesterday and hasn't arrived.", recipient: "Sarah Chen, Client Manager at Meridian Energy", relationship: "External client — professional but currently unhappy", situation: "The report was delayed due to unexpected data quality issues. It will be ready tomorrow morning.", what_needed: "Acknowledge the delay professionally, explain briefly without over-excusing, give a firm new commitment, apologise sincerely." },
  { id: 2, title: "Thank Recruiter After Placement Interview", context: "You've just had your final interview for the KPMG OT Synapse placement. It went well.", recipient: "James Hartley, Early Careers Recruiter at KPMG", relationship: "Recruiter — professional, warm", situation: "The interview covered your AI background, your interest in OT security, and your plans for the placement year.", what_needed: "Thank them for their time, briefly reinforce your enthusiasm, mention one specific thing from the conversation that excited you." },
  { id: 3, title: "Post-Meeting Action Points", context: "You've just finished a client workshop and need to send a follow-up with agreed actions.", recipient: "Michael Davies, Operations Director at PowerGrid UK", relationship: "Senior client stakeholder", situation: "Three actions were agreed: you'll send the risk register by Friday, the client will share network diagrams by Wednesday, and a follow-up call is booked for next Tuesday at 2pm.", what_needed: "Professional, structured follow-up. Clear action items with owners and dates. Warm but concise." },
  { id: 4, title: "Request Feedback After Two Weeks", context: "You're two weeks into your placement. You want to ask your manager for early feedback.", recipient: "Dr. Priya Sharma, Manager — OT Synapse", relationship: "Your direct manager — senior, knowledgeable, busy", situation: "You want to know how you're doing, whether your work meets expectations, and if there are areas to focus on.", what_needed: "Professional, not needy. Show initiative. Make it easy for them to respond briefly if they're busy." },
  { id: 5, title: "Introduce Yourself on Day One", context: "It's your first day. You want to introduce yourself to the wider team by email.", recipient: "The OT Synapse Team (group email)", relationship: "New colleagues at various levels", situation: "You're Faisal, MSc AI student from Lancaster, joining for a year-long placement on the OT Synapse team working on OT/ICS security.", what_needed: "Warm, professional, brief. Mention your background, what you're excited about, and that you look forward to working with them. Not too long." },
  { id: 6, title: "Politely Decline a Meeting", context: "You've been invited to an optional all-hands meeting but have a conflicting deadline.", recipient: "Tom Willis, Senior Analyst", relationship: "Senior colleague, friendly", situation: "The meeting is tomorrow at 3pm. You have a deliverable due at 5pm that needs your full focus. The meeting is optional — it's an internal update session.", what_needed: "Decline professionally without over-explaining. Show you value being included. Ask to be sent notes if appropriate." },
  { id: 7, title: "Chase a Colleague", context: "You needed some data from a colleague three days ago and haven't heard back.", recipient: "Emma Clarke, Data Analyst", relationship: "Peer colleague — same level", situation: "You emailed Emma on Monday requesting network traffic logs for your analysis. It's now Thursday and she hasn't replied. Your deadline is tomorrow.", what_needed: "Polite chase — not passive-aggressive, not too apologetic. Clear about what you need and by when." },
  { id: 8, title: "Question for a Partner", context: "You need to ask a very senior Partner a question about scope. Keep it concise and respectful.", recipient: "Richard Blackwood, Partner — Cyber Advisory", relationship: "Very senior — Partner level. Likely busy. May not know you well.", situation: "You're unclear whether the threat assessment should include the vendor remote access systems or just the on-premise OT environment. This affects the scope of your work significantly.", what_needed: "Brief. Respectful. Clear. One specific question. Make it easy for them to answer with a yes/no or a sentence." },
  { id: 9, title: "Out of Scope Client Request", context: "A client has asked for something that falls outside the agreed project scope.", recipient: "David Lee, IT Manager at ChemFlow Industries", relationship: "Client stakeholder — technical, direct", situation: "The client wants you to also review their IT network security in addition to the OT environment, which is not in scope and would require additional budget and time.", what_needed: "Acknowledge the request positively, explain it's outside current scope, suggest a path forward (additional engagement / separate conversation). Don't just say no." },
  { id: 10, title: "Project Delay Update", context: "An unexpected technical issue means the project will be two weeks behind schedule.", recipient: "Alison Hayes, Programme Director at NorthWest Power", relationship: "Senior client — she cares about delivery dates. Professional relationship.", situation: "Discovery of legacy PLCs running unsupported firmware has expanded the assessment scope significantly. The new estimated completion date is 14th March.", what_needed: "Be direct about the delay. Explain the reason briefly without excessive technical jargon. Give the new date. Show you're in control." },
  { id: 11, title: "Share Findings with Non-Technical Client", context: "You need to share the key findings from your AI anomaly detection analysis.", recipient: "Frances North, CFO at AquaGrid UK", relationship: "Very senior client — non-technical, values plain English and financial impact", situation: "Your model detected three anomalous traffic patterns on the OT network. Two are likely benign configuration changes. One requires investigation — it matches patterns of known lateral movement.", what_needed: "Plain English. No jargon. Clear risk level. What they need to do next. One paragraph of findings, not a technical report." },
  { id: 12, title: "Ask Manager for Deadline Extension", context: "You've hit an unexpected complexity and need more time on a deliverable.", recipient: "Dr. Priya Sharma, Manager — OT Synapse", relationship: "Your direct manager", situation: "The asset inventory report was due Friday. You discovered the client's network diagrams were out of date and you've had to conduct additional passive scanning. You need until Monday.", what_needed: "Be honest and upfront. Explain the specific reason. Give the new date. Show you're managing it." },
  { id: 13, title: "Introduce New Team Member to Client", context: "A new senior consultant is joining the project and needs to be introduced to your client contact.", recipient: "Stuart Palmer, Head of OT at Nexus Rail", relationship: "Client — professional relationship, familiar with the project", situation: "Hannah Williams, Senior Consultant, is joining the team next Monday. She'll be leading the remediation planning phase.", what_needed: "Warm introduction. Brief background on Hannah. Explain her role on the project. Keep it concise." },
  { id: 14, title: "Acknowledge and Correct a Mistake", context: "You sent the wrong version of a document to the client yesterday.", recipient: "Grace Thompson, Project Manager at ClearWater Utilities", relationship: "Client — professional, working relationship", situation: "You sent draft v0.2 instead of the final v1.0 of the risk register. The draft contained internal notes that were not meant to be shared.", what_needed: "Acknowledge the error clearly and professionally. Don't over-apologise. Send the correct version. Brief explanation of what happened." },
  { id: 15, title: "Respond to Praise from a Senior", context: "A Senior Manager has sent you a very positive email about your presentation yesterday.", recipient: "Mark Chen, Senior Manager — OT Synapse", relationship: "Senior colleague — impressed by your work", situation: "He specifically mentioned that your explanation of the anomaly detection model was the clearest he'd heard, and that the client responded very positively.", what_needed: "Warm, genuine, professional. Don't be dismissive of the praise but don't be boastful. Brief. Acknowledge the team if appropriate." },
];

export default function EmailCoach({ userProfile, setUserProfile }) {
  const [selected, setSelected] = useState(null);
  const [emailText, setEmailText] = useState('');
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('/api/sessions').then((res) => {
      const emailSessions = (res.data || []).filter((s) => s.module === 'email').slice(0, 5);
      setHistory(emailSessions);
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!emailText.trim() || loading) return;
    setLoading(true);
    setScores(null);
    setShowRewrite(false);

    try {
      const res = await axios.post('/api/score', {
        transcript: `EMAIL SUBJECT: [User to write subject line]\n\n${emailText}`,
        module: 'email',
        scenario: selected.title + ' — Recipient: ' + selected.recipient + '. Context: ' + selected.context,
      });
      setScores(res.data);

      try {
        const summary = `Email to ${selected.recipient}: ${emailText.slice(0, 100)}...`;
        await axios.post('/api/session', {
          module: 'email',
          scenario_title: selected.title,
          scores: res.data,
          summary,
          duration_seconds: 0,
        });

        const currentScores = userProfile?.module_scores || {};
        const existing = currentScores['email'] || 0;
        const newScore = Math.round((existing + (res.data.overall || 0)) / (existing ? 2 : 1));
        const updated = await axios.put('/api/profile', {
          sessions_completed: (userProfile?.sessions_completed || 0) + 1,
          module_scores: { ...currentScores, email: newScore },
          readiness_score: Math.min(100, Math.round(Object.values({ ...currentScores, email: newScore }).reduce((a, b) => a + b, 0) / Math.max(Object.keys({ ...currentScores, email: newScore }).length, 1))),
        });
        if (setUserProfile) setUserProfile(updated.data);

        const freshSessions = await axios.get('/api/sessions');
        setHistory((freshSessions.data || []).filter((s) => s.module === 'email').slice(0, 5));
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelected(null);
    setEmailText('');
    setScores(null);
    setShowRewrite(false);
  };

  if (!selected) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Email Coach</h1>
        <p className="text-gray-500 text-sm mb-6">15 real KPMG placement scenarios. Write the email — Alex scores and rewrites it.</p>

        {/* History panel */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl border p-4 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Recent Email Attempts</p>
            <div className="space-y-2">
              {history.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{s.scenario_title}</span>
                  {s.scores?.overall && (
                    <span className={`font-semibold ${s.scores.overall >= 70 ? 'text-emerald-600' : s.scores.overall >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {s.scores.overall}/100
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="bg-white border rounded-xl p-4 text-left hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <p className="font-semibold text-gray-800 text-sm mb-1">{s.title}</p>
              <p className="text-xs text-gray-500 mb-1">{s.recipient}</p>
              <p className="text-xs text-gray-400">{s.context.slice(0, 80)}...</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">{selected.title}</h1>
      </div>

      {/* Scenario */}
      <div className="bg-slate-50 border rounded-xl p-4 mb-4 text-sm space-y-2">
        <p><span className="font-semibold text-gray-700">To:</span> <span className="text-gray-600">{selected.recipient}</span></p>
        <p><span className="font-semibold text-gray-700">Relationship:</span> <span className="text-gray-600">{selected.relationship}</span></p>
        <p><span className="font-semibold text-gray-700">Situation:</span> <span className="text-gray-600">{selected.situation}</span></p>
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
          <span className="text-amber-700 font-semibold text-xs">YOUR GOAL: </span>
          <span className="text-amber-800 text-xs">{selected.what_needed}</span>
        </div>
      </div>

      {/* Email textarea */}
      {!scores && (
        <div className="bg-white rounded-xl border p-4 mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Write your email to {selected.recipient.split(',')[0]}:
          </label>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder={`Subject: \n\nDear ${selected.recipient.split(',')[0].split(' ')[0]},\n\n...`}
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono resize-none"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{emailText.length} characters</span>
            <button
              onClick={handleSubmit}
              disabled={loading || !emailText.trim()}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              {loading ? 'Scoring...' : 'Submit to Alex'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-6">
          <LoadingSpinner text="Alex is reviewing your email..." />
        </div>
      )}

      {/* Results */}
      {scores && !loading && (
        <div className="space-y-4">
          <ScoreCard scores={scores} />

          {/* Tips */}
          {(scores.tip_1 || scores.tip_2 || scores.tip_3) && (
            <div className="bg-white rounded-xl border p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Alex's 3 Specific Tips</p>
              <div className="space-y-2">
                {[scores.tip_1, scores.tip_2, scores.tip_3].filter(Boolean).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alex's rewrite */}
          {scores.rewritten_email && (
            <div className="bg-white rounded-xl border">
              <button
                onClick={() => setShowRewrite(!showRewrite)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <span>Alex's Rewritten Version</span>
                <span className="text-gray-400">{showRewrite ? '▲' : '▼'}</span>
              </button>
              {showRewrite && (
                <div className="px-5 pb-5">
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <p className="text-xs text-purple-600 font-semibold mb-2">HOW ALEX WOULD WRITE IT</p>
                    <pre className="text-sm text-purple-900 whitespace-pre-wrap font-sans leading-relaxed">
                      {scores.rewritten_email}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Your original */}
          <div className="bg-white rounded-xl border">
            <button
              onClick={() => {}}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700"
            >
              <span>Your Email</span>
            </button>
            <div className="px-5 pb-5">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-4">
                {emailText}
              </pre>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setScores(null); setShowRewrite(false); }}
              className="bg-white border border-indigo-200 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-50"
            >
              Rewrite Email
            </button>
            <button
              onClick={reset}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
            >
              New Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
