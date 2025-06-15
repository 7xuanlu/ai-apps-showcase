"use client";
import { useState } from "react";

export default function SpeechTranslation() {
  const [inputType] = useState("Microphone");
  const [inputLang] = useState("English - US");
  const [outputLang] = useState("English - US");
  const [results, setResults] = useState("");
  const [events, setEvents] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);

  // Placeholder handlers
  const handleStart = (continuous) => {
    setIsTranslating(true);
    setIsContinuous(continuous);
    setResults("");
    setEvents("");
  };
  const handleStop = () => {
    setIsTranslating(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Microsoft Cognitive Services: Speech Translation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block mb-2 font-medium">Input:</label>
          <select className="w-full border rounded px-3 py-2" disabled defaultValue={inputType}>
            <option>Microphone</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Input language:</label>
          <select className="w-full border rounded px-3 py-2" disabled defaultValue={inputLang}>
            <option>English - US</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Output language:</label>
          <select className="w-full border rounded px-3 py-2" disabled defaultValue={outputLang}>
            <option>English - US</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Once Speech Translation</h2>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 disabled:opacity-50"
            onClick={() => handleStart(false)}
            disabled={isTranslating}
          >
            start
          </button>
          <button
            className="px-6 py-2 bg-gray-400 text-white rounded ml-2 disabled:opacity-50"
            onClick={handleStop}
            disabled={!isTranslating}
          >
            stop
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Continuous Speech Translation</h2>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 disabled:opacity-50"
            onClick={() => handleStart(true)}
            disabled={isTranslating}
          >
            start
          </button>
          <button
            className="px-6 py-2 bg-gray-400 text-white rounded ml-2 disabled:opacity-50"
            onClick={handleStop}
            disabled={!isTranslating}
          >
            stop
          </button>
          <label className="ml-4 inline-flex items-center">
            <input type="checkbox" className="mr-2" checked={voiceOutput} onChange={e => setVoiceOutput(e.target.checked)} />
            Voice output
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block mb-2 font-medium">Results</label>
          <textarea className="w-full border rounded p-2 min-h-[120px]" value={results} readOnly />
        </div>
        <div>
          <label className="block mb-2 font-medium">Events:</label>
          <textarea className="w-full border rounded p-2 min-h-[120px]" value={events} readOnly />
        </div>
      </div>
    </div>
  );
} 