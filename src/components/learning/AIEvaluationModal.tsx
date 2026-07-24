import React, { useState } from "react";
import { AIFeedbackResult, ClassItem, CourseModule } from "../../types/learning";
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  X,
  RefreshCw,
  Award,
  Zap
} from "lucide-react";

interface AIEvaluationModalProps {
  isOpen: boolean;
  evaluation: AIFeedbackResult | null;
  currentClass: ClassItem;
  currentModule: CourseModule;
  quizScorePercentage?: number;
  onClose: () => void;
  onGenerateFreshEvaluation?: () => void;
  isGenerating?: boolean;
}

export const AIEvaluationModal: React.FC<AIEvaluationModalProps> = ({
  isOpen,
  evaluation,
  currentClass,
  currentModule,
  quizScorePercentage = 80,
  onClose,
  onGenerateFreshEvaluation,
  isGenerating = false
}) => {
  if (!isOpen) return null;

  // Fallback structure if evaluation is null or missing fields
  const fallbackFeedback: AIFeedbackResult = evaluation || {
    classId: currentClass.id,
    strengths: [
      `Grasped core concepts of "${currentClass.title}"`,
      `Demonstrated good retention on key lesson takeaways`,
      quizScorePercentage >= 80 ? "Excellent accuracy on knowledge check quiz questions" : "Solid attempt on practice questions"
    ],
    weakAreas: [
      quizScorePercentage < 100 ? "Slight hesitation on edge-case options in the quiz" : "None identified for this class",
      "Ensure hands-on syntax accuracy during real-world tasks"
    ],
    suggestions: [
      `Review the practical code example in ${currentClass.title} again`,
      "Practice typing out the code solution manually rather than copy-pasting",
      "Experiment with different inputs in the practice exercise"
    ],
    recommendedNextSteps: [
      "Mark this class as completed and advance to the next lesson",
      `Apply these skills in the ${currentModule.title} capstone project`
    ],
    evaluationSummary: `Great progress! You earned a ${quizScorePercentage}% quiz score on Class #${currentClass.classNumber}. Keep up the momentum!`,
    evaluatedAt: Date.now()
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-black uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-violet-400" />
            <span>AI Learning Diagnostic & Evaluation</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Performance Insights: {currentClass.title}
          </h2>

          <p className="text-xs text-slate-300">
            {fallbackFeedback.evaluationSummary}
          </p>
        </div>

        {/* Evaluation Sections Grid */}
        <div className="space-y-4 relative z-10">
          
          {/* 1. Student Strengths */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Your Key Strengths</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {fallbackFeedback.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Weak Areas */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Areas to Refine</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {fallbackFeedback.weakAreas.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Suggestions for Improvement */}
          <div className="bg-violet-950/30 border border-violet-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Suggestions for Improvement</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {fallbackFeedback.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Recommended Next Steps */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Recommended Next Steps</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {fallbackFeedback.recommendedNextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 relative z-10">
          {onGenerateFreshEvaluation && (
            <button
              onClick={onGenerateFreshEvaluation}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Analyzing..." : "Re-Analyze with Gemini"}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer ml-auto"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
