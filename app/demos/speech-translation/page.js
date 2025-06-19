"use client";
import { useState, useRef, useEffect } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import Button from "@/app/components/Button";

const languageOptions = [
  { value: "en-US", label: "English - US" },
  { value: "zh-CN", label: "Chinese - CN" },
  { value: "ja-JP", label: "Japanese - JP" },
  { value: "ko-KR", label: "Korean - KR" },
  { value: "fr-FR", label: "French - FR" },
  { value: "de-DE", label: "German - DE" },
  { value: "es-ES", label: "Spanish - ES" },
];

async function getToken() {
  const res = await fetch("/api/token", { method: "POST" });
  return await res.text();
}
async function getRegion() {
  const res = await fetch("/api/region");
  return await res.text();
}

export default function SpeechTranslation() {
  const [inputType, setInputType] = useState("Microphone");
  const [inputLang, setInputLang] = useState(languageOptions[0].value);
  const [outputLang, setOutputLang] = useState(languageOptions[1].value);
  const [audioFile, setAudioFile] = useState(null);
  const [results, setResults] = useState("");
  const [events, setEvents] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const recoRef = useRef(null);

  // Ensure inputLang and outputLang are never the same
  useEffect(() => {
    if (inputLang === outputLang) {
      // Pick the first available outputLang that is not inputLang
      const next = languageOptions.find(opt => opt.value !== inputLang);
      if (next) setOutputLang(next.value);
    }
  }, [inputLang, outputLang]);

  const filteredOutputOptions = languageOptions.filter(opt => opt.value !== inputLang);
  const filteredInputOptions = languageOptions.filter(opt => opt.value !== outputLang);

  const handleStart = async (continuous) => {
    setIsTranslating(true);
    setIsContinuous(continuous);
    setResults("");
    setEvents("");
    const token = await getToken();
    const region = await getRegion();
    let audioConfig;
    if (inputType === "File" && audioFile) {
      audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);
    } else {
      audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    }
    const speechConfig = SpeechSDK.SpeechTranslationConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = inputLang;
    speechConfig.addTargetLanguage(outputLang);
    const reco = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);
    recoRef.current = reco;
    let lastRecognized = "";
    reco.recognizing = (s, e) => {
      setEvents(prev => prev + `(recognizing) Reason: ${SpeechSDK.ResultReason[e.result.reason]} Text: ${e.result.text} Translations: [${outputLang}] ${e.result.translations.get(outputLang)}\n`);
      setResults(lastRecognized + (e.result.translations.get(outputLang) || ""));
    };
    reco.recognized = (s, e) => {
      setEvents(prev => prev + `(recognized) Reason: ${SpeechSDK.ResultReason[e.result.reason]} Text: ${e.result.text} Translations: [${outputLang}] ${e.result.translations.get(outputLang)}\n`);
      lastRecognized += (e.result.translations.get(outputLang) || "") + "\n";
      setResults(lastRecognized);
    };
    reco.canceled = (s, e) => {
      setEvents(prev => prev + `(cancel) Reason: ${SpeechSDK.CancellationReason[e.reason]}${e.errorDetails ? ': ' + e.errorDetails : ''}\n`);
      setIsTranslating(false);
    };
    reco.sessionStarted = (s, e) => setEvents(prev => prev + `(sessionStarted) SessionId: ${e.sessionId}\n`);
    reco.sessionStopped = (s, e) => {
      setEvents(prev => prev + `(sessionStopped) SessionId: ${e.sessionId}\n`);
      setIsTranslating(false);
    };
    reco.speechStartDetected = (s, e) => setEvents(prev => prev + `(speechStartDetected) SessionId: ${e.sessionId}\n`);
    reco.speechEndDetected = (s, e) => setEvents(prev => prev + `(speechEndDetected) SessionId: ${e.sessionId}\n`);
    if (continuous) {
      reco.startContinuousRecognitionAsync();
    } else {
      reco.recognizeOnceAsync(
        () => setIsTranslating(false),
        (err) => {
          setEvents(prev => prev + `ERROR: ${err}\n`);
          setIsTranslating(false);
        }
      );
    }
  };

  const handleStop = () => {
    setIsTranslating(false);
    if (recoRef.current) {
      if (isContinuous) {
        recoRef.current.stopContinuousRecognitionAsync(() => {
          recoRef.current.close();
          recoRef.current = null;
        });
      } else {
        recoRef.current.close();
        recoRef.current = null;
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 bg-white rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center">Microsoft Speech Translation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block mb-2 font-medium">Input:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={inputType}
            onChange={e => setInputType(e.target.value)}
            disabled={isTranslating}
          >
            <option>Microphone</option>
            <option>File</option>
          </select>
          {inputType === "File" && (
            <input
              type="file"
              accept="audio/wav"
              className="mt-2"
              onChange={e => setAudioFile(e.target.files[0])}
              disabled={isTranslating}
            />
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Input language:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={inputLang}
            onChange={e => setInputLang(e.target.value)}
            disabled={isTranslating}
          >
            {filteredInputOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Output language:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={outputLang}
            onChange={e => setOutputLang(e.target.value)}
            disabled={isTranslating}
          >
            {filteredOutputOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Once Speech Translation</h2>
          <Button
            color="blue"
            onClick={() => handleStart(false)}
            disabled={isTranslating || (inputType === "File" && !audioFile)}
          >
            start
          </Button>
          <Button
            color="gray"
            onClick={handleStop}
            disabled={!isTranslating}
          >
            stop
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Continuous Speech Translation</h2>
          <Button
            color="blue"
            onClick={() => handleStart(true)}
            disabled={isTranslating || (inputType === "File" && !audioFile)}
          >
            start
          </Button>
          <Button
            color="gray"
            onClick={handleStop}
            disabled={!isTranslating}
          >
            stop
          </Button>
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