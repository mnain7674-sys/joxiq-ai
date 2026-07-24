import React from "react";
import { AchievementBadge } from "../../types/learning";
import {
  Trophy,
  Sparkles,
  Flame,
  CheckCircle2,
  Award,
  Zap,
  ArrowRight,
  X,
  Star,
  GraduationCap,
  Rocket
} from "lucide-react";

export interface RewardNotificationData {
  type: "lesson_completed" | "quiz_passed" | "project_completed" | "badge_unlocked" | "milestone_reached";
  title: string;
  message: string;
  xpEarned?: number;
  badge?: AchievementBadge;
  milestonePercentage?: number;
  courseName?: string;
}

interface RewardNotificationModalProps {
  isOpen: boolean;
  reward: RewardNotificationData | null;
  onClose: () => void;
  onViewAchievements?: () => void;
}

export const RewardNotificationModal: React.FC<RewardNotificationModalProps> = ({
  isOpen,
  reward,
  onClose,
  onViewAchievements
}) => {
  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-slate-100 text-center space-y-5 overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-600/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Badge Icon Header */}
        <div className="pt-2 relative z-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-purple-600 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-amber-400">
              {reward.type === "badge_unlocked" ? (
                <Award className="w-10 h-10" />
              ) : reward.type === "milestone_reached" ? (
                <Trophy className="w-10 h-10 text-amber-300" />
              ) : reward.type === "project_completed" ? (
                <Rocket className="w-10 h-10 text-indigo-400" />
              ) : reward.type === "quiz_passed" ? (
                <Star className="w-10 h-10 text-amber-400 fill-amber-400/20" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              )}
            </div>
          </div>
        </div>

        {/* Header Badge Pill */}
        <div className="relative z-10 space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-3 h-3" /> JOXIQ Learning Achievement
          </span>

          <h2 className="text-xl font-black text-white tracking-tight">
            {reward.title}
          </h2>
        </div>

        {/* Message Content */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl relative z-10 space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            "{reward.message}"
          </p>

          {reward.courseName && (
            <div className="text-[11px] font-bold text-amber-300">
              Course: {reward.courseName}
            </div>
          )}

          {reward.xpEarned && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-black text-emerald-400">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>+{reward.xpEarned} Learning XP Earned!</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 relative z-10">
          {onViewAchievements && (
            <button
              onClick={() => {
                onClose();
                onViewAchievements();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Badges & Certificates</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
