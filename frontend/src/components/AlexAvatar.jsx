export default function AlexAvatar({ state = 'idle', size = 'lg' }) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-20 h-20';
  const text = size === 'sm' ? 'text-sm' : 'text-2xl';

  let borderClass = '';
  let animClass = '';

  if (state === 'speaking') {
    borderClass = 'border-4 border-indigo-400';
    animClass = 'animate-speak';
  } else if (state === 'listening') {
    borderClass = 'border-4 border-emerald-400';
    animClass = 'animate-listen';
  } else {
    borderClass = 'border-4 border-transparent';
  }

  return (
    <div
      className={`${dim} rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white ${borderClass} ${animClass} flex-shrink-0`}
    >
      <span className={text}>AX</span>
    </div>
  );
}
