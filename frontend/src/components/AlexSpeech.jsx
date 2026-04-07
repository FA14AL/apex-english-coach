import { useEffect, forwardRef, useImperativeHandle, useState, useRef } from 'react';

const AlexSpeech = forwardRef(function AlexSpeech({ text }, ref) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utterRef = useRef(null);

  const speak = (textToSpeak) => {
    if (!textToSpeak || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utterRef.current = utter;

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const gbVoice =
        voices.find((v) => v.lang === 'en-GB') ||
        voices.find((v) => v.lang.startsWith('en-GB')) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (gbVoice) utter.voice = gbVoice;
      utter.rate = 0.9;
      utter.pitch = 1.0;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    };

    // Voices might not be loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoice;
    } else {
      loadVoice();
    }
  };

  useImperativeHandle(ref, () => ({ speak }));

  useEffect(() => {
    if (text) speak(text);
    return () => {
      window.speechSynthesis && window.speechSynthesis.cancel();
    };
  }, [text]);

  if (!text) return null;

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 my-3">
      <div className="flex items-start gap-2">
        <span className="text-purple-400 text-xs font-medium mt-0.5 flex-shrink-0">ALEX</span>
        <p className="text-purple-900 text-sm leading-relaxed">{text}</p>
      </div>
      {isSpeaking && (
        <div className="flex items-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 bg-purple-400 rounded-full"
              style={{
                height: '12px',
                animation: `speak-pulse 0.8s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
          <span className="text-xs text-purple-400 ml-1">Speaking...</span>
        </div>
      )}
    </div>
  );
});

export default AlexSpeech;
