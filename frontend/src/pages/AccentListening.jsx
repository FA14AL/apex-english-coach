import { useState, useRef } from 'react';

const PHRASES = [
  { text: "That'll be four fifty love, you got a Nectar card?", actual: "That'll be four fifty love, you got a Nectar card?", explanation: "'Love' is a warm term of address in UK service contexts — not romantic. 'Nectar card' is a Sainsbury's loyalty card. Cashiers ask this constantly." },
  { text: "Alright, you coming to Janet's thing later or what?", actual: "Alright, you coming to Janet's thing later or what?", explanation: "'Alright' as a greeting (not a question about health). 'Thing' means event/party. 'Or what?' is a casual British prompt for an answer." },
  { text: "Proper miserable out innit, been like this all week", actual: "Proper miserable out innit, been like this all week", explanation: "'Proper' is British slang meaning 'really/truly'. 'Innit' = 'isn't it' — a contracted tag question, very common in casual British speech." },
  { text: "Ayup, alright duck, how do?", actual: "Ayup, alright duck, how do?", explanation: "Lancashire dialect. 'Ayup' = hello, 'duck' = a friendly term of address (like 'mate'), 'how do?' = how are you? You might hear this from colleagues from the North." },
  { text: "Gonna grab a brew, want owt?", actual: "Gonna grab a brew, want owt?", explanation: "Northern English: 'brew' = cup of tea, 'owt' = anything. Equivalent to 'I'm making a cup of tea, do you want anything?'" },
  { text: "Did ya see the match last night, it were unbelievable", actual: "Did you see the match last night, it was unbelievable", explanation: "'Were' instead of 'was' is a Northern English dialect feature, not a mistake. 'Ya' = 'you'. Don't correct this — it's regional identity." },
  { text: "Mind how you go", actual: "Mind how you go", explanation: "A British farewell meaning 'take care' or 'be careful'. Often said at the end of a work day or when someone leaves in bad weather." },
  { text: "You alright?", actual: "You alright?", explanation: "Used as a greeting in British English, NOT a genuine enquiry about your health. The correct response is 'Yeah, you?' not a detailed account of how you're feeling." },
  { text: "That's not bad that, actually", actual: "That's not bad that, actually", explanation: "British understatement. 'Not bad' often means 'quite good' or even 'very good'. Adding 'actually' suggests mild surprise at quality. A genuine compliment in disguise." },
  { text: "Shall we crack on then?", actual: "Shall we crack on then?", explanation: "'Crack on' means to get started or continue working. 'Shall we crack on?' = 'shall we get started?' Very common in UK workplaces to end a chat and resume work." },
  { text: "I'll leave that with you", actual: "I'll leave that with you", explanation: "A polite British way of assigning a task or responsibility to someone. It sounds casual but it means 'this is now your responsibility to handle'." },
  { text: "It's not ideal to be fair", actual: "It's not ideal to be fair", explanation: "'To be fair' is a British filler meaning 'to be honest' or 'admittedly'. 'Not ideal' is British understatement for 'this is a problem' or 'this is bad'." },
  { text: "We'll have to see how we get on", actual: "We'll have to see how we get on", explanation: "A vague, non-committal British phrase meaning 'we'll see what happens'. Often used to avoid giving a definitive answer. Common in client conversations." },
  { text: "Could you not just...", actual: "Could you not just...", explanation: "A polite but slightly impatient British request. It sounds like a question but is really a gentle instruction. 'Could you not just send it over?' = 'Please just send it'." },
  { text: "Cheers for that", actual: "Cheers for that", explanation: "'Cheers' in British English means 'thank you' in informal contexts (not just a drinking toast). 'Cheers for that' = 'thanks for doing that'. Very widely used." },
  { text: "Whereabouts in India are you from?", actual: "Whereabouts in India are you from?", explanation: "'Whereabouts' means 'which part of' — a friendly, curious question. British people ask this because India is a big country and they're genuinely interested in the specific region." },
  { text: "You settled in alright?", actual: "You settled in alright?", explanation: "A warm question asking if you've adjusted to your new environment. Expected answer: 'Yeah, getting there!' or 'Yes, everyone's been really welcoming, thanks.' Short and positive." },
  { text: "Bit chilly in here innit", actual: "Bit chilly in here innit", explanation: "'Bit' = a little. 'Chilly' = cold. 'Innit' = isn't it. Office temperature is one of the most discussed topics in UK workplaces. Agreeing warmly is always the right move." },
  { text: "I'm just going to grab five minutes", actual: "I'm just going to grab five minutes", explanation: "Means 'I need a short break'. 'Grab' is used informally for taking something quickly. In an office context this often means stepping away from the desk briefly." },
  { text: "Shall I stick the kettle on?", actual: "Shall I stick the kettle on?", explanation: "'Stick the kettle on' = put the kettle on = make tea. Offering to make tea is a significant social gesture in UK offices. Accept gracefully: 'Oh brilliant, yes please'." },
  { text: "That's gone and broken again hasn't it", actual: "That's gone and broken again hasn't it", explanation: "'Gone and broken' is a British construction emphasising resigned frustration — 'gone and' adds a sense of things happening despite you. Common for office equipment failures." },
  { text: "You've lost me there a bit", actual: "You've lost me there a bit", explanation: "A polite British way of saying 'I don't understand'. 'A bit' softens it. You might hear this from a non-technical colleague when you explain something. Stop and simplify." },
  { text: "We're just waiting on one more", actual: "We're just waiting on one more", explanation: "'Waiting on' is British English for 'waiting for' in this context. Said at the start of a meeting when not everyone has arrived. Very common phrase." },
  { text: "It's gone a bit pear-shaped", actual: "It's gone a bit pear-shaped", explanation: "British idiom meaning 'it's gone wrong' or 'things have become chaotic'. Nobody knows the exact origin. Very common in professional settings to describe a project or plan going badly." },
  { text: "Not gonna lie that meeting was heavy", actual: "Not gonna lie that meeting was heavy", explanation: "'Not gonna lie' = to be honest (filler phrase). 'Heavy' in this context means intense, difficult, or emotionally draining. Common after difficult client or internal meetings." },
  { text: "Bit of a mare this morning", actual: "Bit of a mare this morning", explanation: "'Bit of a mare' is short for 'bit of a nightmare' — meaning a difficult, frustrating situation. Very British casual expression for when things have gone badly." },
  { text: "Client's being a bit funny about it", actual: "Client's being a bit funny about it", explanation: "'Funny' here means difficult, awkward, or unreasonable — NOT amusing. 'Being funny about it' = being difficult or fussy. This is important to understand in client conversations." },
  { text: "Right, I'll let you crack on", actual: "Right, I'll let you crack on", explanation: "A polite British way to end a conversation and let someone get back to work. 'Right' signals a conversation is ending. 'Let you crack on' = 'I'll let you get back to it'." },
  { text: "She's ever so good at her job", actual: "She's ever so good at her job", explanation: "'Ever so' is very British — it intensifies the adjective, meaning 'extremely' or 'very'. 'Ever so good' = extremely good. Used especially by older British speakers." },
  { text: "Just ping me when you're done", actual: "Just ping me when you're done", explanation: "'Ping me' means send me a message (email, Teams, Slack, etc.). Extremely common in modern UK office contexts. 'When you're done' = when you've finished the task." },
  { text: "He's well chuffed about it", actual: "He's well chuffed about it", explanation: "'Chuffed' is British slang for very pleased or proud. 'Well chuffed' = very pleased. This is genuine praise. 'I'm chuffed to bits' is an even stronger version." },
  { text: "That's well out of order", actual: "That's well out of order", explanation: "'Out of order' means unacceptable or inappropriate (not just a broken machine). 'Well out of order' = seriously unacceptable. Strong but common expression of disapproval." },
  { text: "I'm absolutely cream crackered", actual: "I'm absolutely cream crackered", explanation: "Cockney rhyming slang: cream cracker = knackered = exhausted. 'Absolutely' intensifies it. Used humorously. You might hear this on a Friday afternoon in the office." },
  { text: "We need to touch base on that at some point", actual: "We need to touch base on that at some point", explanation: "'Touch base' is office jargon meaning 'have a brief conversation about'. 'At some point' = when convenient. This is a soft request for a meeting — don't ignore it." },
  { text: "Fancy a cheeky Nando's after?", actual: "Fancy a cheeky Nando's after?", explanation: "'Fancy' = would you like. 'Cheeky' is used for mild indulgences — slightly naughty but acceptable. 'Nando's' is a popular UK chicken restaurant chain. A very British social invitation." },
];

function compareWords(userInput, actual) {
  const userWords = userInput.toLowerCase().replace(/[^a-z0-9'\s]/g, '').split(/\s+/).filter(Boolean);
  const actualWords = actual.toLowerCase().replace(/[^a-z0-9'\s]/g, '').split(/\s+/).filter(Boolean);
  let correct = 0;

  const results = actualWords.map((word, i) => {
    const userWord = userWords[i] || '';
    const isCorrect = userWord === word;
    if (isCorrect) correct++;
    return { word, userWord, correct: isCorrect };
  });

  const score = Math.round((correct / Math.max(actualWords.length, 1)) * 100);
  return { results, score, correct, total: actualWords.length };
}

export default function AccentListening() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [scores, setScores] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const currentPhrase = PHRASES[currentIndex];

  const speakPhrase = async () => {
    if (isSpeaking) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPhrase.text }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    const result = compareWords(userInput, currentPhrase.actual);
    setComparison(result);
    setScores((prev) => [...prev, result.score]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= PHRASES.length) {
      setAllDone(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setUserInput('');
    setSubmitted(false);
    setComparison(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserInput('');
    setSubmitted(false);
    setComparison(null);
    setScores([]);
    setAllDone(false);
  };

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  if (allDone) {
    const finalAvg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">All 35 Phrases Complete!</h2>
        <p className="text-gray-500 mb-6">Your average comprehension score: <span className="font-bold text-indigo-600 text-xl">{finalAvg}%</span></p>
        <div className="max-w-sm mx-auto bg-white rounded-xl border p-6 mb-6">
          {finalAvg >= 80 ? (
            <p className="text-emerald-700">Brilliant — your ear for British English is excellent. You're well prepared for the informal language at KPMG.</p>
          ) : finalAvg >= 60 ? (
            <p className="text-amber-700">Good progress. Some phrases caught you out — focus on the ones marked in red in future attempts. Regular exposure to British TV and podcasts will help enormously.</p>
          ) : (
            <p className="text-red-700">These are genuinely tricky — don't be discouraged. British informal speech takes time to tune into. Come back and repeat this exercise regularly. BBC Radio 4 as background will help your ear.</p>
          )}
        </div>
        <button onClick={handleRestart} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700">
          Start Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Accent Listening</h1>
        {scores.length > 0 && (
          <span className="text-sm text-indigo-600 font-semibold">Running: {avgScore}%</span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Alex speaks at natural British pace. Type exactly what you hear. {currentIndex + 1} of {PHRASES.length}
      </p>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / PHRASES.length) * 100}%` }}
        />
      </div>

      {/* Listen button */}
      <div className="bg-white rounded-xl border p-6 mb-4 text-center">
        <p className="text-sm text-gray-500 mb-4">Click to hear the phrase, then type what you heard</p>
        <button
          onClick={speakPhrase}
          disabled={isSpeaking}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg shadow-indigo-200 ${isSpeaking ? 'bg-indigo-400 cursor-not-allowed animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
        >
          {isSpeaking ? (
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-1 bg-white rounded-full" style={{ height: '18px', animation: `speak-pulse 0.7s ease-in-out ${i * 0.1}s infinite` }} />
              ))}
            </div>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-3">
          {isSpeaking ? 'Playing...' : 'Click to hear the phrase at natural British speed'}
        </p>
      </div>

      {/* Input */}
      {!submitted && (
        <div className="bg-white rounded-xl border p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Type what you heard:</label>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type the phrase here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="mt-3 w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Check Answer
          </button>
        </div>
      )}

      {/* Results */}
      {submitted && comparison && (
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Your Score</span>
              <span
                className={`text-xl font-bold ${comparison.score >= 80 ? 'text-emerald-600' : comparison.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}
              >
                {comparison.score}%
              </span>
            </div>

            {/* Word comparison */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Word by word:</p>
              <div className="flex flex-wrap gap-1.5">
                {comparison.results.map((r, i) => (
                  <div key={i} className="text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm font-medium ${r.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {r.correct ? r.word : (
                        <span>
                          <span className="line-through opacity-50">{r.userWord || '?'}</span>
                          <span className="ml-1">{r.word}</span>
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
              <p className="text-xs text-gray-400 mb-1">Full phrase:</p>
              <p className="text-sm font-medium text-gray-800">{currentPhrase.actual}</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-purple-600 mb-1">WHY THIS IS TRICKY</p>
            <p className="text-sm text-purple-900 leading-relaxed">{currentPhrase.explanation}</p>
          </div>

          {/* Replay & Next */}
          <div className="flex gap-3">
            <button
              onClick={speakPhrase}
              className="flex-1 bg-white border text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Hear Again
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"
            >
              {currentIndex + 1 >= PHRASES.length ? 'Finish' : 'Next Phrase →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
