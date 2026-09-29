import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Boxes,
  HelpCircle,
  Volume2,
  FileAudio,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';
import aiService from '../../api/aiService.js';
import VoiceRecorder from '../../components/ui/VoiceRecorder.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../utils/formatters.js';

export const AiAssistantPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  const [fileInput, setFileInput] = useState(null);

  const { addItem } = useCart();
  const toast = useToast();

  const handleAudioSubmit = async (audioBlob) => {
    setIsSubmitting(true);
    setAiResult(null);

    try {
      const data = await aiService.queryVoice(audioBlob);
      setAiResult(data);
      setLastQuery(data.transcription || 'Voice query');
      toast.success('AI query processed successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to process voice query'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file (e.g. MP3, WAV, WEBM, M4A)');
      return;
    }

    handleAudioSubmit(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Multilingual Voice AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Inventory Voice Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Query your electrical store inventory using natural speech in English, Urdu, or Roman Urdu.
        </p>
      </div>

      {/* Voice Recorder Terminal */}
      <VoiceRecorder
        onAudioSubmit={handleAudioSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Alternate Audio File Upload */}
      <div className="text-center">
        <span className="text-xs text-slate-400">or upload pre-recorded audio:</span>
        <div className="mt-2">
          <input
            type="file"
            id="audio-file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="audio-file"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
          >
            <FileAudio className="w-4 h-4 text-slate-500" />
            <span>Upload Audio File</span>
          </label>
        </div>
      </div>

      {/* AI Query Results Box */}
      {aiResult && (
        <Card
          title="AI Assistant Result"
          subtitle={`Action: ${aiResult.action || 'checkStock'}`}
          className="border-amber-300 shadow-md animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="space-y-4">
            {/* User transcription display */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  AI Transcribed Speech
                </span>
                <p className="text-sm font-semibold text-slate-900 italic">
                  &ldquo;{aiResult.transcription}&rdquo;
                </p>
              </div>
            </div>

            {/* Matched Products list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Matched Inventory Products ({aiResult.products?.length || 0})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiResult.products?.map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">
                        {prod.brand}
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {prod.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={prod.stockQuantity > 0 ? 'success' : 'danger'}
                        size="md"
                      >
                        {prod.stockQuantity} {prod.unit || 'pcs'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Helpful Speech Prompts Guide */}
      <Card title="Speech Suggestions Guide" subtitle="How to talk to the AI engine">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="font-bold text-amber-900 block mb-1">Roman Urdu</span>
            <p className="text-slate-600 italic">&ldquo;fan ka stock kitna hai?&rdquo;</p>
            <p className="text-slate-600 italic mt-1">&ldquo;cable bachi hui hai kya?&rdquo;</p>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
            <span className="font-bold text-sky-900 block mb-1">English</span>
            <p className="text-slate-600 italic">&ldquo;How much wire is in stock?&rdquo;</p>
            <p className="text-slate-600 italic mt-1">&ldquo;Check inventory for Pak Fans&rdquo;</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">Urdu Script</span>
            <p className="text-slate-600 italic font-sans">&ldquo;پنکھے کا اسٹاک کتنا ہے؟&rdquo;</p>
            <p className="text-slate-600 italic font-sans mt-1">&ldquo;تار کتنا باقی ہے؟&rdquo;</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AiAssistantPage;
