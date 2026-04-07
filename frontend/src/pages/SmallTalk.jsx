import { useState, useRef } from 'react';
import axios from 'axios';
import AlexAvatar from '../components/AlexAvatar';
import AlexSpeech from '../components/AlexSpeech';
import VoiceRecorder from '../components/VoiceRecorder';
import ScoreCard from '../components/ScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SCENARIOS = [
  { id: 1, title: "Monday Morning Arrival", situation: "It's Monday morning. You've just arrived at the office and see a friendly colleague in the corridor.", who: "A friendly colleague from another team", opening_line: "Morning! Good weekend? Ready for another week of it?", tier: 1, tip: "Keep it light and positive. A simple 'Yes, not bad thanks — you?' works perfectly. Don't over-share." },
  { id: 2, title: "Coffee Machine Queue", situation: "You're waiting for the coffee machine. A senior colleague joins the queue behind you.", who: "A senior colleague, slightly above your level", opening_line: "Ah, the morning queue — absolutely essential isn't it. How are you settling in?", tier: 2, tip: "Be warm but professional. This is your chance to make a good impression without being too eager." },
  { id: 3, title: "Unexpected Sunshine", situation: "It's been raining for weeks and today is suddenly beautiful. You're by the window with a colleague.", who: "A friendly peer colleague", opening_line: "Oh brilliant, would you look at that — proper sunshine for once! Almost forgot what it looked like.", tier: 1, tip: "British weather chat is the national sport. Agree enthusiastically — it's safe, relatable, and a great icebreaker." },
  { id: 4, title: "Bank Holiday Plans", situation: "It's the Thursday before a bank holiday weekend. Everyone's in a good mood.", who: "A colleague you're friendly with but don't know very well", opening_line: "Right then, big plans for the long weekend? Please tell me you're not spending it working.", tier: 1, tip: "Keep plans vague if you haven't got exciting ones — 'taking it easy' or 'catching up with friends' is perfectly fine." },
  { id: 5, title: "Commute Delay", situation: "You arrive slightly late because of train delays. Your colleague is at their desk.", who: "A team member you work alongside daily", opening_line: "Morning — trains playing up again?", tier: 1, tip: "Commute complaints are universally relatable in the UK. Keep it brief, a bit wry, and move on quickly." },
  { id: 6, title: "Friday Lunch Plans", situation: "It's Friday around noon. Your manager mentions they're grabbing lunch nearby.", who: "Your direct manager", opening_line: "We're thinking of heading to that new place on the high street for lunch — do you want to join us?", tier: 2, tip: "If you can join, say yes with enthusiasm. If you can't, decline warmly and show you appreciate being asked." },
  { id: 7, title: "Colleague's Leaving Do", situation: "A well-liked colleague is leaving the company. There's a card going round.", who: "The colleague who organised the leaving card", opening_line: "Have you signed Priya's card? We're all heading to the pub on Friday at five — you should come along.", tier: 1, tip: "Even if you don't know Priya well, show goodwill. Express you'll try to come." },
  { id: 8, title: "Office Too Hot", situation: "The office heating is on full blast on an unusually warm spring day. Everyone is uncomfortable.", who: "A colleague sitting near you", opening_line: "It's absolutely boiling in here isn't it. Can't someone do something about the heating?", tier: 1, tip: "A shared complaint about the office environment is great bonding material. Commiserate and maybe suggest a solution lightly." },
  { id: 9, title: "Broken Printer", situation: "The main office printer has broken and everyone who needs to print something is frustrated.", who: "A colleague also waiting for the printer", opening_line: "Not again — third time this month. IT say they've ordered parts but I'll believe it when I see it.", tier: 1, tip: "Shared frustration with office tech is a classic British bonding topic. Agree wryly, maybe add a humorous observation." },
  { id: 10, title: "Waiting for the Lift", situation: "You're waiting for a slow lift to arrive. A Partner (very senior) is also waiting.", who: "A Partner at the firm — very senior", opening_line: "Takes an age doesn't it. I sometimes think the stairs would be quicker.", tier: 2, tip: "With very senior people, mirror their energy. If they're relaxed and light, you can be too. Don't overthink it." },
  { id: 11, title: "Someone's New Baby", situation: "A colleague has just returned from maternity leave with photos of their new baby.", who: "A colleague who just had a baby", opening_line: "Right, I have to show you — arrived last week, seven pounds four. Completely changed our lives!", tier: 1, tip: "Express genuine warmth and interest. Ask the baby's name, say something kind. This is a happy occasion." },
  { id: 12, title: "After-Work Drinks", situation: "It's 5:30 on a Friday. Some colleagues are heading to a nearby bar.", who: "A peer colleague who's inviting you", opening_line: "Come on, a few of us are heading to The Crown — you're coming aren't you? Just the one!", tier: 1, tip: "'Just the one' is classic British understatement for potentially several drinks. Be enthusiastic or decline warmly." },
  { id: 13, title: "Promotion Congratulations", situation: "You've just heard that a colleague you know well has been promoted.", who: "The colleague who was just promoted", opening_line: "Oh you heard then! Yeah, just found out this morning — bit of a surprise to be honest.", tier: 1, tip: "Congratulate genuinely but match their modest tone. Don't over-effuse if they're being understated — that's very British." },
  { id: 14, title: "Working from Home Day", situation: "You're on a video call with a colleague who's working from home today.", who: "A colleague on video call", opening_line: "Good to be home today — kids are at school so actually getting loads done. How's the office?", tier: 1, tip: "Working from home is now normal in UK offices. Show interest in how they're finding it." },
  { id: 15, title: "Canteen Food Complaint", situation: "You're both in the office canteen. The food selection today is particularly uninspiring.", who: "A colleague you eat lunch with occasionally", opening_line: "What is this supposed to be? I think it's meant to be pasta but I genuinely can't tell.", tier: 1, tip: "Mild food complaints are a great low-stakes bonding topic. Be mildly amusing rather than genuinely angry." },
  { id: 16, title: "Big Client Win", situation: "Your team has just won a significant new contract. The atmosphere is celebratory.", who: "Your team manager in a celebratory mood", opening_line: "Did you hear? We got it — signed this morning! Three-year contract. Big one for the team.", tier: 2, tip: "Match their enthusiasm. Ask what it means for the team. Show you understand the significance even if you're new." },
  { id: 17, title: "New Starter on the Team", situation: "A new graduate has joined your team today. You've been asked to show them around.", who: "New graduate starter, first week", opening_line: "Hi, I'm Tom — just started today. This place is massive isn't it, I've already got lost twice.", tier: 1, tip: "Be warm and welcoming. Share a relatable experience from when you were new. Make them feel at ease." },
  { id: 18, title: "Manager is Away", situation: "Your manager is on holiday. A senior colleague has been asked to cover.", who: "Senior colleague covering for your manager", opening_line: "Right, so James is away until Thursday — anything you need this week, just come to me. How are things going?", tier: 2, tip: "Be professional and reassuring. Mention one thing you're working on to show you're on top of things." },
  { id: 19, title: "Football Result", situation: "There was a major match last night — everyone in the office is talking about it.", who: "A very enthusiastic football-supporting colleague", opening_line: "Did you see the match last night?! Unbelievable result. You follow football at all?", tier: 1, tip: "Even if you don't follow football, you can engage. 'I caught some of the highlights — quite something' works well. Ask who they support." },
  { id: 20, title: "Christmas Party Planning", situation: "It's early November and someone's organising the team Christmas party.", who: "The colleague organising the Christmas party", opening_line: "Right, trying to sort the Christmas do — are you around on the 19th? We're thinking dinner and maybe a bar after.", tier: 1, tip: "Show enthusiasm even if you're not sure yet. Christmas parties are a big deal in UK offices and being engaged matters." },
  { id: 21, title: "Birthday Cake in the Kitchen", situation: "Someone has brought in a cake for their birthday and left it in the kitchen for everyone.", who: "The colleague who brought in the cake", opening_line: "Happy birthday to me — go on, grab a slice, there's loads. I couldn't eat it all at home.", tier: 1, tip: "Accept warmly, wish them happy birthday, say something kind about the cake. Simple and warm." },
  { id: 22, title: "Train Cancelled This Morning", situation: "You arrive flustered after a chaotic commute involving a cancelled train.", who: "A colleague at reception who notices you look stressed", opening_line: "You alright? You look a bit frazzled — everything okay?", tier: 1, tip: "Explain briefly and with humour — don't vent at length. 'What a morning!' with a small laugh is very British." },
  { id: 23, title: "Project Deadline Stress", situation: "The team is under pressure with a deadline tomorrow. You pass a stressed colleague in the corridor.", who: "A stressed colleague you work with on the project", opening_line: "Tell me about it — I've been here since seven this morning. We'll get there though. How's your bit looking?", tier: 2, tip: "Show solidarity, be calm and reassuring. Offer briefly to help if appropriate. Don't add to the stress." },
  { id: 24, title: "Awkward Silence Recovery", situation: "You're in a meeting room waiting for others to arrive. There's an uncomfortable silence with someone you barely know.", who: "Someone from a different department you've seen but never spoken to", opening_line: "...(silence — they glance up from their phone briefly)", tier: 3, tip: "Break the silence naturally. A simple 'I don't think we've properly met — I'm Faisal' is perfect. Don't overthink it." },
  { id: 25, title: "Running into Someone from Another Team", situation: "You bump into someone from the Digital team in the corridor near the water cooler.", who: "Someone from another team, roughly your level", opening_line: "Oh sorry — nearly had you there! You're on the OT team aren't you — the new placement?", tier: 1, tip: "When someone correctly identifies you, confirm warmly and show interest in their work too." },
];

const TIER_COLORS = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-red-100 text-red-700',
};
const TIER_LABELS = { 1: 'Tier 1 — Casual', 2: 'Tier 2 — Professional', 3: 'Tier 3 — Recovery' };

export default function SmallTalk({ userProfile, setUserProfile }) {
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [alexText, setAlexText] = useState('');
  const [alexState, setAlexState] = useState('idle');
  const [exchangeCount, setExchangeCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const alexRef = useRef(null);

  const startScenario = (scenario) => {
    setSelected(scenario);
    setMessages([{ role: 'assistant', content: scenario.opening_line }]);
    setAlexText(scenario.opening_line);
    setAlexState('speaking');
    setExchangeCount(0);
    setSessionDone(false);
    setScores(null);
    setStartTime(Date.now());
  };

  const handleUserResponse = async (text) => {
    if (loading || sessionDone) return;
    setAlexState('listening');

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setExchangeCount((c) => c + 1);

    if (exchangeCount + 1 >= 4) {
      await endSession(newMessages);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/chat', {
        messages: newMessages,
        userProfile,
        moduleContext: `Small Talk: ${selected.title}. Scenario: ${selected.situation}. Person: ${selected.who}.`,
      });
      const reply = res.data.message;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setAlexText(reply);
      setAlexState('speaking');
    } catch (err) {
      setAlexText("Sorry, I had a connection hiccup there. Give it another go?");
      setAlexState('speaking');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (currentMessages) => {
    setSessionDone(true);
    setAlexState('idle');
    setScoring(true);

    const transcript = currentMessages.map((m) => `${m.role === 'assistant' ? 'Alex' : 'Faisal'}: ${m.content}`).join('\n');

    try {
      const scoreRes = await axios.post('/api/score', {
        transcript,
        module: 'smalltalk',
        scenario: selected.title,
      });
      setScores(scoreRes.data);

      setSaving(true);
      try {
        const summaryRes = await axios.post('/api/summarise', { transcript, scores: scoreRes.data });
        const duration = Math.round((Date.now() - startTime) / 1000);

        await axios.post('/api/session', {
          module: 'smalltalk',
          scenario_title: selected.title,
          scores: scoreRes.data,
          summary: summaryRes.data.summary,
          duration_seconds: duration,
        });

        const currentScores = userProfile?.module_scores || {};
        const existingScore = currentScores['smalltalk'] || 0;
        const newScore = Math.round((existingScore + (scoreRes.data.overall || 0)) / (existingScore ? 2 : 1));
        const updatedProfile = await axios.put('/api/profile', {
          sessions_completed: (userProfile?.sessions_completed || 0) + 1,
          module_scores: { ...currentScores, smalltalk: newScore },
          readiness_score: Math.min(100, Math.round(Object.values({ ...currentScores, smalltalk: newScore }).reduce((a, b) => a + b, 0) / Math.max(Object.keys({ ...currentScores, smalltalk: newScore }).length, 1))),
        });
        if (setUserProfile) setUserProfile(updatedProfile.data);
      } catch {}
    } catch (err) {
      setAlexText("Couldn't get scores right now — but well done for finishing the scenario.");
    } finally {
      setScoring(false);
      setSaving(false);
    }
  };

  const reset = () => {
    setSelected(null);
    setMessages([]);
    setAlexText('');
    setAlexState('idle');
    setExchangeCount(0);
    setSessionDone(false);
    setScores(null);
  };

  if (!selected) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Small Talk</h1>
        <p className="text-gray-500 text-sm mb-6">25 real workplace scenarios. Practice the conversations that happen every day at KPMG.</p>

        <div className="grid gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="bg-white border rounded-xl p-4 text-left hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{s.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[s.tier]}`}>
                      {TIER_LABELS[s.tier]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{s.situation}</p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </div>
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
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[selected.tier]}`}>
          {TIER_LABELS[selected.tier]}
        </span>
      </div>

      {/* Scenario card */}
      <div className="bg-slate-50 border rounded-xl p-4 mb-4 text-sm">
        <p className="text-gray-600 mb-1"><span className="font-semibold">Situation:</span> {selected.situation}</p>
        <p className="text-gray-600 mb-2"><span className="font-semibold">Talking to:</span> {selected.who}</p>
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <span className="text-amber-700 font-semibold text-xs">TIP: </span>
          <span className="text-amber-800 text-xs">{selected.tip}</span>
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-xl border p-4 mb-4 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-2 mb-2">
          <AlexAvatar state={alexState} size="sm" />
          <span className="text-xs text-gray-400 font-medium">Alex · Exchange {Math.min(exchangeCount + 1, 4)} of 4</span>
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-4 py-3 text-sm max-w-xs md:max-w-md ${
              m.role === 'assistant'
                ? 'bg-purple-50 border border-purple-100 text-purple-900 mr-auto'
                : 'bg-indigo-600 text-white ml-auto'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <LoadingSpinner text="Alex is thinking..." />
          </div>
        )}
      </div>

      {/* Alex speech */}
      {alexText && <AlexSpeech ref={alexRef} text={messages[messages.length - 1]?.role === 'assistant' ? alexText : ''} />}

      {/* Input */}
      {!sessionDone && (
        <div>
          <VoiceRecorder onTranscript={handleUserResponse} disabled={loading} />
          {exchangeCount >= 2 && (
            <div className="text-center mt-2">
              <button
                onClick={() => endSession(messages)}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                End conversation early
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scoring */}
      {scoring && (
        <div className="text-center py-6">
          <LoadingSpinner text="Alex is reviewing your conversation..." />
        </div>
      )}

      {saving && !scoring && (
        <div className="text-center py-2">
          <LoadingSpinner text="Saving your session..." />
        </div>
      )}

      {/* Results */}
      {scores && !scoring && (
        <div className="space-y-4 mt-4">
          <ScoreCard scores={scores} />
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => startScenario(selected)}
              className="bg-white border border-indigo-200 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={reset}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Next Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
