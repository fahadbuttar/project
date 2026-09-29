import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Send, Loader2 } from 'lucide-react';
import Button from '../common/Button.jsx';

export const VoiceRecorder = ({ onAudioSubmit, isSubmitting = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setPermissionError(
        'Microphone access was denied or is unavailable. Please allow microphone permissions in your browser.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleSubmit = () => {
    if (!audioBlob) return;
    onAudioSubmit(audioBlob);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-800">
      {/* Animated Mic Display */}
      <div className="relative mb-4 flex items-center justify-center">
        {isRecording && (
          <div className="absolute w-28 h-28 rounded-full bg-amber-500/20 animate-ping pointer-events-none" />
        )}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105'
              : audioBlob
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 cursor-pointer'
          }`}
          onClick={!isRecording && !audioBlob ? startRecording : undefined}
        >
          <Mic className={`w-9 h-9 ${isRecording ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Status & Timer */}
      <div className="text-center mb-5">
        <h4 className="text-base font-bold text-white mb-0.5">
          {isRecording
            ? 'Listening to your voice...'
            : audioBlob
            ? 'Voice Query Recorded'
            : 'Press Record to Speak'}
        </h4>
        <p className="text-xs text-slate-400">
          {isRecording
            ? `Recording: ${formatTimer(recordingTime)} (Press Stop when done)`
            : audioBlob
            ? 'Listen to preview or send to AI engine'
            : 'Ask in English, Urdu, or Roman Urdu (e.g., "fan ka stock kitna hai?")'}
        </p>
      </div>

      {/* Permission warning */}
      {permissionError && (
        <div className="mb-4 text-xs text-rose-400 bg-rose-950/60 p-3 rounded-xl border border-rose-800 text-center max-w-sm">
          {permissionError}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !audioBlob && (
          <Button
            variant="primary"
            leftIcon={<Mic className="w-4 h-4" />}
            onClick={startRecording}
          >
            Start Speaking
          </Button>
        )}

        {isRecording && (
          <Button
            variant="danger"
            leftIcon={<Square className="w-4 h-4" />}
            onClick={stopRecording}
          >
            Stop Recording
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <audio src={audioUrl} controls className="h-10 rounded-xl" />
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              onClick={resetAudio}
              disabled={isSubmitting}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )
              }
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Ask AI
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
