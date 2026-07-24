import React, { useState } from "react";
import {
  GraduationCap,
  Send,
  Sparkles,
  HelpCircle,
  Code2,
  Lightbulb,
  AlertTriangle,
  Bot,
  User,
  Loader2,
  BookOpen
} from "lucide-react";
import Markdown from "react-markdown";

export interface LessonTeacherChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LessonTeacherChatProps {
  courseName: string;
  lessonTitle: string;
  lessonLevel: string;
  lessonCategory: string;
  lessonContent: string;
  lessonId: string;
  messages: LessonTeacherChatMessage[];
  onSendMessage: (userPrompt: string) => Promise<void>;
  isLoading: boolean;
}

export const LessonTeacherChat: React.FC<LessonTeacherChatProps> = ({
  courseName,
  lessonTitle,
  lessonLevel,
  lessonCategory,
  lessonContent,
  lessonId,
  messages,
  onSendMessage,
  isLoading
}) => {
  const [chatInput, setChatInput] = useState<string>("");

  const topic = lessonTitle.replace(/Lesson \d+ - /, "");

  const handleSend = async () => {
    if (!chatInput.trim() || isLoading) return;
    const text = chatInput.trim();
    setChatInput("");
    await onSendMessage(text);
  };

  const handleQuickPrompt = async (promptText: string) => {
    if (isLoading) return;
    await onSendMessage(promptText);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[680px] relative">
      {/* Top Header */}
      <div className="pb-3.5 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                Ask Your AI Teacher
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold">
                Dedicated 1-on-1 Chat for This Lesson Only
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
            Isolated History
          </span>
        </div>

        {/* Automatic Lesson Context Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-violet-400" /> {courseName}
          </span>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
            Level: <span className="text-emerald-400">{lessonLevel}</span>
          </span>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950 text-violet-300 border border-slate-800 truncate max-w-[180px]">
            🎯 {topic}
          </span>
        </div>
      </div>

      {/* Quick Prompt Recommendation Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-800/80">
        <button
          onClick={() => handleQuickPrompt(`Can you explain ${topic} with a simple real-life analogy?`)}
          disabled={isLoading}
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" /> Analogy
        </button>
        <button
          onClick={() => handleQuickPrompt(`Show me a practical code snippet for ${topic} with line-by-line comments.`)}
          disabled={isLoading}
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Code2 className="w-3 h-3 text-cyan-400" /> Code Example
        </button>
        <button
          onClick={() => handleQuickPrompt(`What are the most common mistakes developers make when implementing ${topic}?`)}
          disabled={isLoading}
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" /> Common Pitfalls
        </button>
        <button
          onClick={() => handleQuickPrompt(`Ask me a quick practice question about ${topic} to check my understanding.`)}
          disabled={isLoading}
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <HelpCircle className="w-3 h-3 text-violet-400" /> Quick Quiz
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-3">
            <div className="w-12 h-12 bg-violet-600/10 border border-violet-500/30 rounded-2xl flex items-center justify-center text-violet-400 mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h5 className="text-xs font-extrabold text-white">Your AI Teacher is Ready!</h5>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              I know we are currently studying <strong className="text-violet-300">{topic}</strong> in <strong className="text-violet-300">{courseName}</strong>. Ask me any question, ask for code help, or pick a recommendation above!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-md shadow-violet-600/20">
                  AI
                </div>
              )}
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20 rounded-tr-none font-medium"
                    : "bg-slate-950 text-slate-200 border border-slate-850 rounded-tl-none prose prose-invert max-w-none"
                }`}
              >
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
              AI
            </div>
            <div className="bg-slate-950 border border-slate-850 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span>AI Teacher is answering in lesson context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask your teacher about ${topic}...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !chatInput.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/20"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
