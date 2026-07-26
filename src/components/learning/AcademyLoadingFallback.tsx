import React from "react";
import { GraduationCap, Sparkles } from "lucide-react";

export const AcademyLoadingFallback: React.FC = () => {
  return (
    <div className="w-full min-h-[350px] bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 my-4 animate-pulse">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/30">
          <GraduationCap className="w-6 h-6 animate-bounce" />
        </div>
        <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-ping" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-slate-300">Loading Learning Content...</p>
        <p className="text-[11px] text-slate-500 font-mono">JOXIQ AI Learning Academy</p>
      </div>
    </div>
  );
};
