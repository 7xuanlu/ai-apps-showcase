'use client';

import { useState, useRef } from 'react';
import Button from "@/app/components/Button";

const languageOptions = [
  { value: 'en-US', label: 'English - US', voices: ['en-US-AriaNeural'], styles: ['neutral', 'newscast', 'customerservice', 'chat', 'cheerful', 'empathetic'] },
  { value: 'zh-CN', label: 'Chinese - CN', voices: ['zh-CN-XiaoxiaoNeural'], styles: ['neutral', 'newscast', 'customerservice', 'assistant', 'lyrical'] },
  { value: 'ja-JP', label: 'Japanese - JP', voices: ['ja-JP-Ayumi-Apollo'], styles: ['neutral'] },
  { value: 'ko-KR', label: 'Korean - KR', voices: ['ko-KR-HeamiRUS'], styles: ['neutral'] },
  { value: 'es-ES', label: 'Spanish - ES', voices: ['es-ES-Laura-Apollo'], styles: ['neutral'] },
  { value: 'fr-FR', label: 'French - FR', voices: ['fr-FR-Julie-Apollo'], styles: ['neutral'] },
];

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(languageOptions[0].value);
  const [voice, setVoice] = useState(languageOptions[0].voices[0]);
  const [style, setStyle] = useState(languageOptions[0].styles[0]);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  const currentLangObj = languageOptions.find(l => l.value === lang);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    const langObj = languageOptions.find(l => l.value === newLang);
    setLang(newLang);
    setVoice(langObj.voices[0]);
    setStyle(langObj.styles[0]);
  };

  const handleVoiceChange = (e) => {
    setVoice(e.target.value);
  };

  const handleStyleChange = (e) => {
    setStyle(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, lang, voice, style }),
      });
      if (!response.ok) {
        let errMsg = 'Failed to convert text to speech';
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errMsg;
        } catch {}
        setError(errMsg);
        throw new Error(errMsg);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      if (!error.message.includes('Failed to convert')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAudioError = () => {
    setError('Audio playback error.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-white rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center">Microsoft Speech Synthesis</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="outputLang" className="block mb-2 font-medium">Output language:</label>
          <select id="outputLang" className="w-full border rounded px-3 py-2" value={lang} onChange={handleLangChange}>
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="voice" className="block mb-2 font-medium">Voice:</label>
          <select id="voice" className="w-full border rounded px-3 py-2" value={voice} onChange={handleVoiceChange}>
            {currentLangObj.voices.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="speakingStyle" className="block mb-2 font-medium">Speaking styles:</label>
          <select id="speakingStyle" className="w-full border rounded px-3 py-2" value={style} onChange={handleStyleChange}>
            {currentLangObj.styles.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Something you want to say"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <Button type="submit" color="blue" disabled={loading}>
            {loading ? "Converting..." : "Enter"}
          </Button>
        </div>
        {error && <div className="text-red-600 font-semibold">{error}</div>}
      </form>
      {audioUrl && (
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Generated Audio:</h2>
          <audio ref={audioRef} controls src={audioUrl} className="w-full max-w-md" onError={handleAudioError} />
        </div>
      )}
    </div>
  );
} 