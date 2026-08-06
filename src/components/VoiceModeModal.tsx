import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, MessageSquare, PhoneOff, Settings2, RefreshCw } from "lucide-react";

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  isStreaming: boolean;
  currentStreamText: string;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isStreaming,
  currentStreamText,
}) => {
  const [modeState, setModeState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [lastUserSpeech, setLastUserSpeech] = useState<string>("");
  const [aiSpeechText, setAiSpeechText] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [selectedLang, setSelectedLang] = useState<"en-US" | "bn-BD">("en-US");

  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef<boolean>(true);
  const silenceTimerRef = useRef<any>(null);
  const isMutedRef = useRef<boolean>(isMuted);
  const lastStreamTextRef = useRef<string>("");

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en") || v.lang.startsWith("bn"));
      setAvailableVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Initialize Speech Recognition when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopAllVoiceActivity();
      return;
    }

    isComponentMounted.current = true;
    startSpeechRecognition();

    return () => {
      isComponentMounted.current = false;
      stopAllVoiceActivity();
    };
  }, [isOpen, selectedLang]);

  // Handle SSE streaming text updates
  useEffect(() => {
    if (isStreaming) {
      setModeState("thinking");
      if (currentStreamText) {
        lastStreamTextRef.current = currentStreamText;
        setAiSpeechText(currentStreamText);
      }
    }
  }, [isStreaming, currentStreamText]);

  const stopAllVoiceActivity = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setModeState("idle");
    setTranscript("");
  };

  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = selectedLang;

      rec.onstart = () => {
        if (!isMutedRef.current) {
          setModeState("listening");
        }
      };

      rec.onresult = (event: any) => {
        if (isMutedRef.current) return;

        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interim += event.results[i][0].transcript;
        }

        const trimmed = interim.trim();
        if (trimmed) {
          setTranscript(trimmed);
          setModeState("listening");

          // Reset silence debounce timer (1.5s after user stops talking, auto-send)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleAutoSendSpeech(trimmed);
          }, 1600);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.warn("Speech recognition error:", event.error);
        }
      };

      rec.onend = () => {
        // Automatically restart if still in Voice Mode and not currently speaking AI response
        if (isOpen && isComponentMounted.current && modeState !== "speaking" && modeState !== "thinking") {
          try {
            rec.start();
          } catch (e) {}
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const handleAutoSendSpeech = async (speechText: string) => {
    if (!speechText.trim() || modeState === "thinking" || modeState === "speaking") return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // Stop listening during processing
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    setLastUserSpeech(speechText);
    setTranscript("");
    setModeState("thinking");
    lastStreamTextRef.current = "";

    try {
      await onSendMessage(speechText);
    } catch (e) {
      console.error("Voice message error:", e);
      speakText("Sorry, I could not process that request. Please try again.");
    }
  };

  // Speak AI response when streaming completes
  const speakText = (textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setModeState("speaking");
    setAiSpeechText(textToSpeak);

    // Clean markdown and code formatting for text-to-speech
    const cleanText = textToSpeak
      .replace(/`{3}[\s\S]*?`{3}/g, "I have generated code for you in the chat.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_#\-]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (!cleanText) {
      setModeState("idle");
      startSpeechRecognition();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Check for Bengali script or fallback to available voices
      const containsBangla = /[\u0980-\u09FF]/.test(cleanText);
      const allVoices = window.speechSynthesis.getVoices();
      let chosenVoice: SpeechSynthesisVoice | undefined = undefined;

      if (containsBangla) {
        chosenVoice = allVoices.find((v) => v.lang.startsWith("bn")) || availableVoices.find((v) => v.lang.startsWith("bn"));
        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        } else {
          utterance.lang = "bn-BD";
        }
      } else {
        chosenVoice = availableVoices[selectedVoiceIndex] || allVoices.find((v) => v.lang.startsWith("en")) || allVoices[0];
        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        }
      }

      utterance.onend = () => {
        if (!isComponentMounted.current) return;
        setModeState("idle");
        // Resume continuous speech listening
        startSpeechRecognition();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        if (!isComponentMounted.current) return;
        setModeState("idle");
        startSpeechRecognition();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to speak text:", err);
      setModeState("idle");
      startSpeechRecognition();
    }
  };

  // Watch for completed AI response streaming to trigger TTS
  const prevStreamingRef = useRef<boolean>(false);
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && isOpen) {
      const textToSpeak = lastStreamTextRef.current || currentStreamText;
      if (textToSpeak) {
        speakText(textToSpeak);
        lastStreamTextRef.current = "";
      } else {
        setModeState("idle");
        startSpeechRecognition();
      }
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, currentStreamText, isOpen]);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setModeState("idle");
    } else {
      startSpeechRecognition();
    }
  };

  const handleInterrupt = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setModeState("idle");
    startSpeechRecognition();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 overflow-hidden select-none animate-fadeIn">
      {/* Background Animated Ambient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000 opacity-40 ${
            modeState === "speaking"
              ? "bg-cyan-500 scale-125"
              : modeState === "thinking"
              ? "bg-purple-600 scale-110"
              : modeState === "listening"
              ? "bg-indigo-500 scale-100 animate-pulse"
              : "bg-slate-800 scale-90"
          }`}
        />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <span className={`w-2.5 h-2.5 rounded-full ${modeState === "listening" ? "bg-emerald-400 animate-ping" : "bg-cyan-400"}`} />
          <span className="text-sm font-semibold text-white tracking-wide">Voice Mode</span>
          <span className="text-xs text-slate-400 capitalize px-2 py-0.5 rounded-md bg-white/10">
            {modeState === "listening" ? "Listening..." : modeState === "thinking" ? "Thinking..." : modeState === "speaking" ? "Speaking..." : "Ready"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            onClick={() => setSelectedLang((prev) => (prev === "en-US" ? "bn-BD" : "en-US"))}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-cyan-300 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
            title="Toggle Mic Language (English / Bangla)"
          >
            <span>🌐</span>
            <span>{selectedLang === "en-US" ? "English" : "বাংলা"}</span>
          </button>

          {/* Subtitles toggle */}
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`p-2.5 rounded-full border transition-all cursor-pointer ${
              showSubtitles ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Toggle Subtitles"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Close / End Voice Chat */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Voice Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Area: Interactive Animated Sphere */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-8">
        <div className="relative flex items-center justify-center my-6">
          {/* Outer Ripple Rings for Listening */}
          {modeState === "listening" && (
            <>
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-cyan-500/30 animate-ping [animation-duration:2s]" />
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-indigo-500/20 animate-ping [animation-duration:3s]" />
            </>
          )}

          {/* Outer Ripple Rings for Speaking */}
          {modeState === "speaking" && (
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 animate-pulse blur-xl" />
          )}

          {/* Main Visualizer Orb */}
          <div
            className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
              modeState === "speaking"
                ? "bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 shadow-cyan-500/40 scale-110"
                : modeState === "thinking"
                ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 shadow-purple-500/40 animate-spin [animation-duration:6s]"
                : modeState === "listening"
                ? "bg-gradient-to-tr from-indigo-500 via-cyan-500 to-blue-600 shadow-indigo-500/30 scale-105"
                : "bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-900 border border-white/10 shadow-slate-900/50"
            }`}
          >
            {/* Inner Glowing Core */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 border border-white/20">
              {modeState === "thinking" ? (
                <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
              ) : modeState === "speaking" ? (
                <div className="flex items-center gap-1.5 h-8">
                  <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-8 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-4 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-7 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.2s]" />
                </div>
              ) : modeState === "listening" ? (
                <Mic className="w-10 h-10 text-cyan-400 animate-pulse" />
              ) : (
                <Sparkles className="w-8 h-8 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {/* Status Text & Dynamic Subtitle Display */}
        <div className="max-w-xl mx-auto space-y-3 px-4 min-h-[90px] flex flex-col justify-center">
          {modeState === "listening" && (
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">Say something...</p>
              <p className="text-lg sm:text-xl font-medium text-white italic">
                {transcript || lastUserSpeech || "Listening to your voice..."}
              </p>
            </div>
          )}

          {modeState === "thinking" && (
            <div>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">Processing response...</p>
              <p className="text-base text-slate-300 font-medium animate-pulse">Analyzing request...</p>
            </div>
          )}

          {modeState === "speaking" && showSubtitles && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md max-h-32 overflow-y-auto text-left shadow-lg">
              <p className="text-xs font-semibold text-cyan-400 mb-1">AI Response:</p>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                {aiSpeechText}
              </p>
            </div>
          )}

          {modeState === "idle" && (
            <p className="text-sm text-slate-400">
              {isMuted ? "Microphone muted. Tap mic to resume." : "Tap microphone or start speaking."}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto">
        {/* Mic Toggle Button */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full border transition-all cursor-pointer shadow-lg ${
            isMuted
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* End Call / Exit Button */}
        <button
          onClick={onClose}
          className="p-5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-xl shadow-rose-600/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 px-6"
          title="End Voice Chat"
        >
          <PhoneOff className="w-6 h-6" />
          <span className="font-bold text-sm">End Call</span>
        </button>

        {/* Interrupt / Stop Speech Button */}
        {modeState === "speaking" && (
          <button
            onClick={handleInterrupt}
            className="p-4 rounded-full bg-white/10 border border-white/20 text-slate-200 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
            title="Interrupt AI Speaking"
          >
            <VolumeX className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
