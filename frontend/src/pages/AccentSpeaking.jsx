import { useState, useRef } from 'react';
import axios from 'axios';
import AlexAvatar from '../components/AlexAvatar';
import AlexSpeech from '../components/AlexSpeech';
import VoiceRecorder from '../components/VoiceRecorder';
import ScoreCard from '../components/ScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';

const EXERCISES = [
  {
    id: 'non-rhotic-r',
    title: 'Non-Rhotic R',
    icon: '🔤',
    description: "British English drops the 'R' sound after a vowel when it's not followed by another vowel. So 'better' sounds like 'bet-uh', not 'bet-er'. This is the single biggest marker of a British accent.",
    instruction: "Alex will say each word. Repeat it, dropping the final R sound completely — replace it with a neutral 'uh' sound.",
    items: ['better', 'water', 'teacher', 'corner', 'summer', 'butter', 'paper', 'never', 'flower', 'colour'],
    feedbackFocus: 'non-rhotic R — did they drop the final R and replace it with a schwa sound?',
  },
  {
    id: 'long-ah-vowel',
    title: 'Long AH Vowel',
    icon: '🗣',
    description: "In British English, words like 'bath', 'grass', and 'can't' use a long 'AH' sound — like the 'a' in 'father'. In Indian English and American English, these often use a shorter 'a' sound (like 'cat').",
    instruction: "Repeat each word with the long AH vowel — 'BAHTH' not 'BATH', 'GRAHSS' not 'GRASS'.",
    items: ['bath', 'grass', "can't", 'dance', 'chance', 'plant', 'castle', 'path', 'class', 'fast'],
    feedbackFocus: 'long AH vowel — did they use the long open vowel rather than the short front vowel?',
  },
  {
    id: 'crisp-t',
    title: 'Crisp T',
    icon: '✍',
    description: "British English uses a crisp, sharp T sound in the middle of words. Indian English often uses a softer, flapped T (similar to American English). The British T is a quick, clean stop — think of it as 'tapping' a hard surface.",
    instruction: "Say each word or phrase making the T sound sharp and crisp — not soft or flapped.",
    items: ['water', 'butter', 'better', 'matter', 'a little', 'get it', 'let it', 'city', 'twenty', 'party'],
    feedbackFocus: 'crisp T — did they produce a clean alveolar stop rather than a flapped or retroflex T?',
  },
  {
    id: 'stress-patterns',
    title: 'Stress Patterns',
    icon: '📊',
    description: "Word stress often differs between British and Indian English. British English stresses specific syllables that may differ from what you're used to. Getting these right makes a huge difference to how natural you sound.",
    instruction: "Alex will say the correct British pronunciation. Repeat it with the same stress pattern — emphasise the same syllable Alex does.",
    items: [
      { display: 'CONtroversy', note: 'Stress on CON, not con-TROV-ersy' },
      { display: 'ADvertisement', note: 'Stress on AD, not ad-VER-tisement' },
      { display: 'LABoratory', note: 'Stress on LAB, not lab-OR-atory' },
      { display: 'GArage', note: 'Stress on GAR, not ga-RAGE' },
      { display: 'INteresting', note: 'Three syllables: IN-trest-ing, not in-TER-est-ing' },
      { display: 'schedULE', note: 'Pronounced SHED-yool, not SKED-yool' },
      { display: 'alUMinium', note: 'al-yoo-MIN-ee-um — five syllables' },
      { display: 'conTROVersy', note: 'Alternative: some British speakers say con-TROV-ersy' },
    ],
    feedbackFocus: 'word stress — did they place emphasis on the same syllable as British standard pronunciation?',
  },
  {
    id: 'shadowing',
    title: 'Shadowing',
    icon: '🪞',
    description: "Shadowing is one of the most effective accent training techniques. Alex speaks at natural pace, and you repeat immediately after, matching rhythm, stress, and intonation as closely as possible.",
    instruction: "Listen to Alex's full sentence, then repeat it immediately, copying the rhythm and natural flow as closely as possible.",
    items: [
      "Hi, I'm Faisal — I've just joined the OT Synapse team as a placement student from Lancaster University.",
      "I'm working on my master's in AI, so I'm particularly interested in how machine learning can be applied to OT security.",
      "SCADA systems are fascinating from a data perspective — there's so much operational data that anomaly detection models could use.",
      "I commute in on the northern line most mornings — it's not too bad once you get used to the timings.",
      "I had a really productive weekend, actually — spent some time reading up on the IEC 62443 framework.",
      "One thing I'm finding interesting is how different OT security is from traditional IT security — the risk calculus is completely different.",
      "I had a brief meeting with the partner yesterday and she gave me some really useful context on the client's situation.",
      "I'm keen to get involved in the threat assessment work — I think my background in data analysis could be genuinely useful.",
      "Can I ask — how long have you been working on the OT Synapse team? I'd love to understand how the team operates.",
      "I think the biggest challenge is communicating these technical risks to non-technical stakeholders — that's something I want to get better at.",
    ],
    feedbackFocus: 'shadowing accuracy — did they match the rhythm, stress, and intonation patterns of British professional speech?',
  },
];

export default function AccentSpeaking({ userProfile, setUserProfile }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [alexState, setAlexState] = useState('idle');
  const [alexText, setAlexText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);
  const [exerciseDone, setExerciseDone] = useState(false);
  const alexRef = useRef(null);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentItemIndex(0);
    setAlexState('idle');
    setAlexText('');
    setFeedback(null);
    setSessionScores([]);
    setExerciseDone(false);

    setTimeout(() => {
      const firstItem = exercise.items[0];
      const text = typeof firstItem === 'object' ? firstItem.display : firstItem;
      const intro = `Right then, let's work on your ${exercise.title}. ${exercise.description} I'll say each ${exercise.id === 'shadowing' ? 'sentence' : 'word'}, and you repeat after me. Let's start with: "${text}"`;
      setAlexText(intro);
      setAlexState('speaking');
    }, 200);
  };

  const speakCurrentItem = () => {
    if (!selectedExercise) return;
    const item = selectedExercise.items[currentItemIndex];
    const text = typeof item === 'object' ? item.display.replace(/[A-Z]{2,}/g, (m) => m.toLowerCase()) : item;
    setAlexText(text);
    setAlexState('speaking');
  };

  const handleUserAttempt = async (transcript) => {
    if (loading) return;
    setAlexState('listening');
    setLoading(true);
    setFeedback(null);

    const item = selectedExercise.items[currentItemIndex];
    const target = typeof item === 'object' ? item.display : item;
    const note = typeof item === 'object' ? item.note : '';

    const promptContext = `Exercise: ${selectedExercise.title}. Target word/phrase: "${target}". ${note ? 'Pronunciation note: ' + note + '.' : ''} User said: "${transcript}". Focus: ${selectedExercise.feedbackFocus}. Faisal is a native Kannada/English speaker from Bangalore transitioning to British English pronunciation.`;

    try {
      const res = await axios.post('/api/score', {
        transcript: promptContext,
        module: 'accent',
        scenario: selectedExercise.title,
      });
      setFeedback(res.data);
      setSessionScores((prev) => [...prev, res.data.overall || 0]);
      setAlexState('idle');
    } catch {
      setFeedback({ overall: 0, feedback: "Couldn't get feedback right now — try again.", accuracy: 0, clarity: 0, british_features: 0 });
    } finally {
      setLoading(false);
    }
  };

  const nextItem = () => {
    const nextIndex = currentItemIndex + 1;
    if (nextIndex >= selectedExercise.items.length) {
      setExerciseDone(true);
      const avg = Math.round(sessionScores.reduce((a, b) => a + b, 0) / Math.max(sessionScores.length, 1));
      setAlexText(`Brilliant work getting through all ${selectedExercise.items.length} ${selectedExercise.id === 'shadowing' ? 'sentences' : 'words'}! Your average score was ${avg}/100. ${avg >= 70 ? "Lovely — your British pronunciation is coming along nicely." : avg >= 50 ? "Good progress. Keep practising these daily — even 5 minutes a day makes a real difference." : "Right then — these sounds take time. The key is repetition. Come back and do this exercise daily."}`);
      setAlexState('speaking');
      return;
    }
    setCurrentItemIndex(nextIndex);
    setFeedback(null);
    const item = selectedExercise.items[nextIndex];
    const text = typeof item === 'object' ? item.display.replace(/[A-Z]{2,}/g, (m) => m.toLowerCase()) : item;
    setAlexText(`Good stuff. Next: "${text}"`);
    setAlexState('speaking');
  };

  const reset = () => {
    setSelectedExercise(null);
    setCurrentItemIndex(0);
    setAlexState('idle');
    setAlexText('');
    setFeedback(null);
    setSessionScores([]);
    setExerciseDone(false);
  };

  if (!selectedExercise) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Accent Speaking</h1>
        <p className="text-gray-500 text-sm mb-6">Five targeted exercises to develop your British English pronunciation from an Indian English base.</p>
        <div className="grid gap-3">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => startExercise(ex)}
              className="bg-white border rounded-xl p-5 text-left hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ex.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{ex.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{ex.description.slice(0, 100)}...</p>
                  <p className="text-xs text-indigo-600 mt-1">{ex.items.length} items</p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentItem = selectedExercise.items[currentItemIndex];
  const displayText = typeof currentItem === 'object' ? currentItem.display : currentItem;
  const noteText = typeof currentItem === 'object' ? currentItem.note : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">{selectedExercise.title}</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-4">
        {selectedExercise.items.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < currentItemIndex ? 'bg-indigo-600' : i === currentItemIndex ? 'bg-indigo-300' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Alex */}
      <div className="flex items-start gap-4 mb-4">
        <AlexAvatar state={alexState} size="lg" />
        <div className="flex-1">
          <AlexSpeech ref={alexRef} text={alexText} />
        </div>
      </div>

      {/* Current item */}
      {!exerciseDone && (
        <div className="bg-white rounded-xl border p-6 text-center mb-4">
          <p className="text-xs text-gray-400 mb-2">
            Item {currentItemIndex + 1} of {selectedExercise.items.length}
          </p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{displayText}</p>
          {noteText && (
            <p className="text-sm text-indigo-600 italic">{noteText}</p>
          )}
          <button
            onClick={speakCurrentItem}
            className="mt-3 text-sm text-purple-600 underline hover:text-purple-800"
          >
            Hear it again
          </button>
        </div>
      )}

      {/* Instruction */}
      {!exerciseDone && !feedback && (
        <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 text-sm text-gray-600">
          <span className="font-semibold">Your turn: </span>{selectedExercise.instruction}
        </div>
      )}

      {/* Recorder */}
      {!exerciseDone && !feedback && (
        <VoiceRecorder onTranscript={handleUserAttempt} disabled={loading} />
      )}

      {loading && (
        <div className="text-center py-4">
          <LoadingSpinner text="Alex is listening to your pronunciation..." />
        </div>
      )}

      {/* Feedback */}
      {feedback && !exerciseDone && (
        <div className="space-y-3">
          <ScoreCard scores={feedback} />
          <div className="text-center">
            <button
              onClick={nextItem}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              {currentItemIndex + 1 >= selectedExercise.items.length ? 'Finish Exercise' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {exerciseDone && (
        <div className="text-center space-y-4 mt-6">
          <div className="bg-indigo-50 rounded-xl p-6">
            <p className="text-2xl font-bold text-indigo-700 mb-1">Exercise Complete!</p>
            <p className="text-sm text-gray-600">
              Average score: {Math.round(sessionScores.reduce((a, b) => a + b, 0) / Math.max(sessionScores.length, 1))}/100
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => startExercise(selectedExercise)}
              className="bg-white border border-indigo-200 text-indigo-600 px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-50"
            >
              Repeat Exercise
            </button>
            <button
              onClick={reset}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
            >
              Choose Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
