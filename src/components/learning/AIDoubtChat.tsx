import React, { useState, useEffect, useRef } from "react";
import { Course, CourseModule, ClassItem } from "../../types/learning";
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  BrainCircuit,
  Bot,
  User,
  HelpCircle,
  Lightbulb,
  Zap,
  Code2,
  Languages,
  Info
} from "lucide-react";
import Markdown from "react-markdown";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface AIDoubtChatProps {
  course: Course;
  currentModule: CourseModule;
  currentClass: ClassItem;
  currentStep: number;
  selectedCodeLine?: number | null;
  language: "English" | "Bangla";
}

export const AIDoubtChat: React.FC<AIDoubtChatProps> = ({
  course,
  currentModule,
  currentClass,
  currentStep,
  selectedCodeLine,
  language
}) => {
  // Chat History state keyed by class ID
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      role: "model",
      text: language === "Bangla"
        ? `স্বাগতম! আমি **JOXIQ AI Personal Teacher**। আজকের পাঠ **"${currentClass.title}"** নিয়ে যেকোনো প্রশ্ন বা কনফিউশন থাকলে আমায় জিজ্ঞেস করতে পারো।`
        : `Welcome! I am your **JOXIQ AI Personal Teacher** for **"${currentClass.title}"**. Feel free to ask any question or clear any doubts!`,
      timestamp: Date.now()
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoVoiceRead, setAutoVoiceRead] = useState<boolean>(false);

  // Speech Recognition (Voice Question Input) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll ref
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech Synthesis setup
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const playVoiceAnswer = (text: string) => {
    if (!synth) return;
    synth.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code snippet.")
      .replace(/[*#_`]/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.lang = language === "Bangla" ? "bn-BD" : "en-US";
    synth.speak(utterance);
  };

  // Speech Recognition setup (Voice Question)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === "Bangla" ? "bn-BD" : "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInputQuestion(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser version. Please type your question.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Failed to start speech recognition:", e);
      }
    }
  };

  // Send Question to Server
  const handleSendQuestion = async (textToSend?: string) => {
    const question = (textToSend || inputQuestion).trim();
    if (!question || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: question,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const chatHistoryFormatted = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/learning/doubt-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: course.name,
          courseCategory: course.category,
          level: currentModule.level,
          moduleTitle: currentModule.title,
          classTitle: currentClass.title,
          classNumber: currentClass.classNumber,
          explanationTopic: currentClass.explanationTopic,
          learningObjective: currentClass.learningObjective,
          currentStep,
          selectedCodeLine,
          language,
          chatHistory: chatHistoryFormatted,
          userQuestion: question
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "model",
          text: data.reply,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (autoVoiceRead) {
          playVoiceAnswer(data.reply);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "model",
          text: language === "Bangla"
            ? "আমার ক্লাসরুম সংযোগে একটি সাময়িক সমস্যা হয়েছে। দয়া করে আবার প্রশ্নটি করো।"
            : "I had a temporary issue connecting to the classroom server. Please ask again.",
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `Error: ${err.message || "Failed to reach AI Teacher server."}`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the AI doubt chat history for this lesson?")) {
      setMessages([
        {
          id: "welcome-reset",
          role: "model",
          text: language === "Bangla"
            ? `চ্যাট হিস্ট্রি রিসেট করা হয়েছে। তোমার নতুন কোনো প্রশ্ন আছে?`
            : `Chat history reset. How can I help you with this lesson?`,
          timestamp: Date.now()
        }
      ]);
    }
  };

  // Quick prompt chips preset list
  const quickPrompts = language === "Bangla"
    ? [
        "আমি এটা বুঝতে পারছি না",
        "আবার সহজ করে বুঝাও",
        "এই code কেন কাজ করছে?",
        "আরেকটা example দাও",
        "সহজ Step-by-Step ভেঙে দেখাও"
      ]
    : [
        "I don't understand this",
        "Explain simply again",
        "Why does this code work?",
        "Give another real-life example",
        "Break it down step-by-step"
      ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* 1. Header Banner Box with Required Prompt */}
      <div className="bg-gradient-to-r from-violet-950/80 via-slate-950 to-indigo-950/80 border border-violet-500/30 p-4 sm:p-5 rounded-2xl space-y-3 relative z-10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30 shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>AI Doubt Assistant & Personal Teacher</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Lesson Context
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-bold mt-0.5">
                {language === "Bangla"
                  ? "কোনো কিছু বুঝতে সমস্যা হলে এখানে প্রশ্ন করো। AI Teacher তোমাকে আবার সহজভাবে বুঝিয়ে দেবে।"
                  : "If you have any trouble understanding, ask here! The AI Teacher will explain it to you simply again."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoVoiceRead(!autoVoiceRead)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                autoVoiceRead
                  ? "bg-violet-600 text-white border-violet-500 shadow-md"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
              title="Toggle Auto Voice Reading of Answers"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{autoVoiceRead ? "Auto-Voice ON" : "Auto-Voice OFF"}</span>
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lesson Context Badges Row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300 pt-1">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Course: {course.name}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            Class #{currentClass.classNumber}: {currentClass.title}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300">
            Step {currentStep} of 6
          </span>
          {selectedCodeLine && (
            <span className="px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30">
              Code Line {selectedCodeLine} Active
            </span>
          )}
        </div>
      </div>

      {/* 2. Chat Stream Box */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 min-h-[260px] max-h-[420px] overflow-y-auto space-y-4 relative">
        {messages.map((msg) => {
          const isAi = msg.role === "model";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-md ${
                  isAi
                    ? "bg-slate-900 border border-slate-800 text-slate-100"
                    : "bg-violet-600 text-white font-medium"
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1.5 text-[10px] opacity-80">
                  <span className="font-bold">{isAi ? "JOXIQ AI Teacher" : "You (Student)"}</span>
                  <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="prose prose-invert max-w-none text-xs">
                  <Markdown>{msg.text}</Markdown>
                </div>

                {isAi && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => playVoiceAnswer(msg.text)}
                      className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen Voice</span>
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-violet-300 animate-pulse bg-slate-900/80 p-3 rounded-xl border border-slate-800 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
            <span>AI Teacher is formulating a clear step-by-step explanation...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 3. Quick Student Prompt Chips */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Question Suggestions:</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(chip)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Input Controls Bar (Text & Voice Input) */}
      <div className="flex items-center gap-2">
        {/* Voice Question Button */}
        <button
          onClick={toggleVoiceListening}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
            isListening
              ? "bg-rose-600 text-white border-rose-500 animate-bounce shadow-lg shadow-rose-600/40"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-violet-500 hover:text-white"
          }`}
          title={isListening ? "Listening... Click to Stop" : "Click to Speak Question (Voice Input)"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendQuestion();
            }}
            placeholder={
              isListening
                ? language === "Bangla"
                  ? "বলুন... আমরা শুনছি..."
                  : "Listening... speak your question now..."
                : language === "Bangla"
                ? "এখানে তোমার প্রশ্নটি লেখো বা মাইকে ক্লিক করে বলো..."
                : "Ask your doubt here or click mic to speak..."
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-xs text-slate-100 outline-none focus:border-violet-500 placeholder:text-slate-500"
          />

          <button
            onClick={() => handleSendQuestion()}
            disabled={!inputQuestion.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </div>
  );
};
