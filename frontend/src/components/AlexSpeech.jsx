import { useEffect, forwardRef, useImperativeHandle, useState, useRef } from 'react';

const AlexSpeech = forwardRef(function AlexSpeech({ text }, ref) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  };

  const speak = async (textToSpeak) => {
    if (!textToSpeak) return;
    stopAudio();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `TTS request failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
      };
      audio.onerror = () => {
        setIsLoading(false);
        setIsSpeaking(false);
        setError('Audio playback failed');
      };

      await audio.play();
    } catch (err) {
      setIsLoading(false);
      setIsSpeaking(false);
      setError('Voice unavailable — text shown below');
      console.error('AlexSpeech error:', err.message);
    }
  };

  useImperativeHandle(ref, () => ({ speak }));

  useEffect(() => {
    if (text) speak(text);
    return () => stopAudio();
  }, [text]);

  if (!text) return null;

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 my-3">
      <div className="flex items-start gap-2">
        <span className="text-purple-400 text-xs font-medium mt-0.5 flex-shrink-0">ALEX</span>
        <p className="text-purple-900 text-sm leading-relaxed">{text}</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 bg-purple-300 rounded-full"
                style={{
                  height: '10px',
                  animation: `speak-pulse 0.6s ease-in-out ${i * 0.12}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-purple-400">Generating voice...</span>
        </div>
      )}

      {isSpeaking && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-purple-500 rounded-full"
                style={{
                  height: '14px',
                  animation: `speak-pulse 0.7s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-purple-500">Speaking...</span>
        </div>
      )}

      {error && !isLoading && !isSpeaking && (
        <p className="text-xs text-purple-300 mt-1 italic">{error}</p>
      )}
    </div>
  );
});

export default AlexSpeech;
