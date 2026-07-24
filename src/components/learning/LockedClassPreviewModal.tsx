import React from "react";
import { Course, CourseModule, ClassItem } from "../../types/learning";
import {
  Lock,
  Crown,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  X,
  Target,
  BrainCircuit,
  Award
} from "lucide-react";

interface LockedClassPreviewModalProps {
  isOpen: boolean;
  course: Course;
  module: CourseModule;
  classItem: ClassItem;
  onClose: () => void;
  onOpenUpgradeModal: () => void;
}

export const LockedClassPreviewModal: React.FC<LockedClassPreviewModalProps> = ({
  isOpen,
  course,
  module,
  classItem,
  onClose,
  onOpenUpgradeModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-slate-100 space-y-6">
        
        {/* Background Glowing Orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Locked Badge Banner */}
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pro Member Locked Lesson</span>
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              This class is part of the Pro Curriculum ({module.level} Level).
            </p>
          </div>
        </div>

        {/* Lesson Preview Info */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-violet-400 font-mono">
              {course.name} • {module.title}
            </div>
            <h3 className="text-xl font-black text-white">
              {classItem.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{classItem.duration}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-300">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>{module.level} Level</span>
              </span>
            </div>
          </div>

          {/* Learning Objective Preview */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Learning Objective</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {classItem.learningObjective}
            </p>
          </div>

          {/* What You Will Learn List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400">What You Will Learn in This Class:</h4>
            <div className="space-y-1.5">
              {classItem.whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Action Footer */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenUpgradeModal();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white text-xs font-black transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4 fill-amber-300" />
            <span>Unlock Class with Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
