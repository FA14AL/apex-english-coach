import { useState, useRef } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

export default function VoiceRecorder({ onTranscript, disabled = false }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [showText, setShowText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setError('');
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const formData = new FormData();
        formData.append('audio', blob, `recording.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`);
        setTranscribing(true);
        try {
          const res = await axios.post('/api/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const text = res.data.transcript || '';
          setTranscript(text);
          if (text) onTranscript(text);
        } catch (err) {
          setError(
            err.response?.data?.error ||
              'Transcription failed. Try again or use text input.'
          );
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start(250);
      setRecording(true);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          'Microphone access denied. Please allow microphone in your browser settings, or use the text input below.'
        );
      } else {
        setError('Could not start recording: ' + err.message + '. Use text input instead.');
      }
      setShowText(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const submitText = () => {
    const trimmed = textInput.trim();
    if (!trimmed) return;
    setTranscript(trimmed);
    onTranscript(trimmed);
    setTextInput('');
  };

  return (
    <div className="flex flex-col items-center gap-3 my-4">
      {!showText && (
        <>
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={disabled || transcribing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
              disabled || transcribing
                ? 'bg-gray-200 cursor-not-allowed'
                : recording
                ? 'bg-red-500 animate-mic'
                : 'bg-gray-200 hover:bg-gray-300 active:scale-95'
            }`}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
          <p className="text-sm text-gray-500">
            {recording ? 'Recording — click to stop' : 'Click to record your response'}
          </p>
        </>
      )}

      {transcribing && <LoadingSpinner text="Transcribing your audio..." />}

      {transcript && !transcribing && (
        <div className="bg-gray-50 border rounded-xl p-3 w-full max-w-md">
          <p className="text-xs text-gray-400 mb-1 font-medium">What Alex heard:</p>
          <p className="text-gray-800 text-sm">{transcript}</p>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center max-w-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={() => setShowText(!showText)}
        className="text-sm text-indigo-600 hover:text-indigo-800 underline"
      >
        {showText ? 'Use voice instead' : 'Type instead'}
      </button>

      {showText && (
        <div className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitText()}
            placeholder="Type your response and press Enter..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={disabled}
          />
          <button
            onClick={submitText}
            disabled={disabled || !textInput.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
