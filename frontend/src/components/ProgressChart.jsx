import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function ProgressChart({ data, metric = 'overall' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No data yet — complete sessions to see progress
      </div>
    );
  }

  const chartData = data.map((session) => ({
    date: new Date(session.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    score: session.scores?.[metric] ?? session.scores?.overall ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
          formatter={(value) => [value, 'Score']}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#4F46E5"
          strokeWidth={2}
          dot={{ fill: '#4F46E5', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
