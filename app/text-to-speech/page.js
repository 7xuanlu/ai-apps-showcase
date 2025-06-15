'use client';

import { useState } from 'react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to convert text to speech');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to convert text to speech');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Microsoft Cognitive Services: Speech Synthesis</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="outputLang" className="block mb-2 font-medium">Output language:</label>
          <select id="outputLang" className="w-full border rounded px-3 py-2" disabled defaultValue="English - US">
            <option>English - US</option>
          </select>
        </div>
        <div>
          <label htmlFor="speakingStyle" className="block mb-2 font-medium">Speaking styles:</label>
          <select id="speakingStyle" className="w-full border rounded px-3 py-2" disabled defaultValue="neutral">
            <option>neutral</option>
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
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>
            {loading ? "Converting..." : "Enter"}
          </button>
        </div>
      </form>
      
      {audioUrl && (
        <div className="mt-8 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Generated Audio:</h2>
          <audio controls src={audioUrl} className="w-full max-w-md" />
        </div>
      )}
    </div>
  );
} 