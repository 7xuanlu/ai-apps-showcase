"use client";
import { useState, useRef } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

async function getToken() {
  const res = await fetch("/api/token", { method: "POST" });
  return await res.text();
}
async function getRegion() {
  const res = await fetch("/api/region");
  return await res.text();
}

export default function SpeechRecognition() {
  const [inputType, setInputType] = useState("Microphone");
  const [inputLang, setInputLang] = useState("en-US");
  const [phraseList, setPhraseList] = useState("");
  const [results, setResults] = useState("");
  const [events, setEvents] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const recoRef = useRef(null);

  const handleStart = async (continuous) => {
    setIsRecognizing(true);
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
    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = inputLang;
    const reco = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    recoRef.current = reco;
    if (phraseList.trim()) {
      const phraseListGrammar = SpeechSDK.PhraseListGrammar.fromRecognizer(reco);
      phraseList.split(";").forEach((p) => phraseListGrammar.addPhrase(p.trim()));
    }
    reco.recognizing = (s, e) => {
      setEvents((prev) => prev + `(recognizing) Reason: ${SpeechSDK.ResultReason[e.result.reason]} Text: ${e.result.text}\n`);
      setResults((prev) => e.result.text);
    };
    reco.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        setEvents((prev) => prev + `(recognized) Reason: ${SpeechSDK.ResultReason[e.result.reason]} NoMatch\n`);
      } else {
        setEvents((prev) => prev + `(recognized) Reason: ${SpeechSDK.ResultReason[e.result.reason]} Text: ${e.result.text}\n`);
      }
      setResults((prev) => prev + (e.result.text ? e.result.text + "\n" : ""));
    };
    reco.canceled = (s, e) => {
      setEvents((prev) => prev + `(cancel) Reason: ${SpeechSDK.CancellationReason[e.reason]}${e.errorDetails ? ': ' + e.errorDetails : ''}\n`);
      setIsRecognizing(false);
    };
    reco.sessionStarted = (s, e) => setEvents((prev) => prev + `(sessionStarted) SessionId: ${e.sessionId}\n`);
    reco.sessionStopped = (s, e) => {
      setEvents((prev) => prev + `(sessionStopped) SessionId: ${e.sessionId}\n`);
      setIsRecognizing(false);
    };
    reco.speechStartDetected = (s, e) => setEvents((prev) => prev + `(speechStartDetected) SessionId: ${e.sessionId}\n`);
    reco.speechEndDetected = (s, e) => setEvents((prev) => prev + `(speechEndDetected) SessionId: ${e.sessionId}\n`);
    if (continuous) {
      reco.startContinuousRecognitionAsync();
    } else {
      reco.recognizeOnceAsync(
        () => setIsRecognizing(false),
        (err) => {
          setEvents((prev) => prev + `ERROR: ${err}\n`);
          setIsRecognizing(false);
        }
      );
    }
  };

  const handleStop = () => {
    setIsRecognizing(false);
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
    <div className="w-full max-w-5xl mx-auto mt-12 bg-white rounded-lg shadow p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Microsoft Cognitive Services: Speech Recognition</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block mb-2 font-medium">Input:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={inputType}
            onChange={e => setInputType(e.target.value)}
            disabled={isRecognizing}
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
              disabled={isRecognizing}
            />
          )}
        </div>
        <div>
          <label className="block mb-2 font-medium">Input language:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={inputLang}
            onChange={e => setInputLang(e.target.value)}
            disabled={isRecognizing}
          >
            <option value="en-US">English - US</option>
            <option value="zh-CN">Chinese - CN</option>
            <option value="ja-JP">Japanese - JP</option>
            <option value="ko-KR">Korean - KR</option>
            <option value="es-ES">Spanish - ES</option>
            <option value="fr-FR">French - FR</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Once Speech Recognition</h2>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 disabled:opacity-50"
            onClick={() => handleStart(false)}
            disabled={isRecognizing || (inputType === "File" && !audioFile)}
          >
            start
          </button>
          <button
            className="px-6 py-2 bg-gray-400 text-white rounded ml-2 disabled:opacity-50"
            onClick={handleStop}
            disabled={!isRecognizing}
          >
            stop
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Continuous Speech Recognition</h2>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2 disabled:opacity-50"
            onClick={() => handleStart(true)}
            disabled={isRecognizing || (inputType === "File" && !audioFile)}
          >
            start
          </button>
          <button
            className="px-6 py-2 bg-gray-400 text-white rounded ml-2 disabled:opacity-50"
            onClick={handleStop}
            disabled={!isRecognizing}
          >
            stop
          </button>
        </div>
      </div>
      <div className="mb-8">
        <label className="block mb-2 font-medium">Phrase List Values</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="';' separated list"
          value={phraseList}
          onChange={e => setPhraseList(e.target.value)}
          disabled={isRecognizing}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block mb-2 font-medium">Results:</label>
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