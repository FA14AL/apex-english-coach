import { useEffect, useState } from 'react';

function getColor(score) {
  if (score >= 70) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function getLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Developing';
  return 'Needs Work';
}

function ScoreBar({ label, score }) {
  const [width, setWidth] = useState(0);
  const color = getColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {label.replace(/_/g, ' ')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
            {getLabel(score)}
          </span>
          <span className="text-sm font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ScoreCard({ scores }) {
  if (!scores) return null;

  const excluded = ['overall', 'feedback', 'example_rephrasing', 'strengths', 'rewritten_email', 'tip_1', 'tip_2', 'tip_3', 'better_version', 'what_to_practise', 'example', 'report_markdown'];
  const scoreEntries = Object.entries(scores).filter(
    ([key, val]) => !excluded.includes(key) && typeof val === 'number'
  );

  const overall = scores.overall;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Session Scores</h3>

      {overall !== undefined && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-indigo-50 rounded-xl">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ backgroundColor: getColor(overall) }}
          >
            {overall}
          </div>
          <div>
            <p className="font-semibold text-gray-800">Overall Score</p>
            <p className="text-sm text-gray-500">{getLabel(overall)}</p>
          </div>
        </div>
      )}

      {scoreEntries.map(([key, val]) => (
        <ScoreBar key={key} label={key} score={val} />
      ))}

      {scores.feedback && (
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-xs font-semibold text-purple-600 mb-1">ALEX'S FEEDBACK</p>
          <p className="text-sm text-purple-900 leading-relaxed">{scores.feedback}</p>
        </div>
      )}

      {scores.example_rephrasing && (
        <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-600 mb-1">TRY THIS INSTEAD</p>
          <p className="text-sm text-emerald-900 italic">&ldquo;{scores.example_rephrasing}&rdquo;</p>
        </div>
      )}

      {scores.strengths && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 mb-1">STRENGTH</p>
          <p className="text-sm text-gray-700">{scores.strengths}</p>
        </div>
      )}
    </div>
  );
}
