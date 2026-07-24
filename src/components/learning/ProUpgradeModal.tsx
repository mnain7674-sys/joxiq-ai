import React, { useState } from "react";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Zap,
  Lock,
  ArrowRight,
  Shield,
  Star,
  Check,
  X,
  GraduationCap
} from "lucide-react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  reasonText?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
  reasonText = "Unlock complete access to all 100 classes per course, AI Teacher, and certificates!"
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-slate-100 space-y-6">
        
        {/* Glowing Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-amber-400" />
            <span>JOXIQ Pro Membership</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unlock Full Academy Pass
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {reasonText}
          </p>
        </div>

        {/* Pro Benefits List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl relative z-10">
          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Full 100 Classes per Course</span>
              <p className="text-[11px] text-slate-400">Beginner, Intermediate, Advanced & Capstone</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">24/7 AI Teacher & Doubt Chat</span>
              <p className="text-[11px] text-slate-400">Voice explanation & step-by-step guidance</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Interactive Code & Quizzes</span>
              <p className="text-[11px] text-slate-400">Hands-on practice tasks & exam practice</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Verified Certificate</span>
              <p className="text-[11px] text-slate-400">Shareable completion credentials</p>
            </div>
          </div>
        </div>

        {/* Pricing Plan Selector */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
              selectedPlan === "monthly"
                ? "bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-600/20"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold">Monthly</div>
            <div className="text-lg font-black text-white mt-1">$19 <span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
            <div className="text-[10px] text-slate-400 mt-1">Flexible billing</div>
          </div>

          <div
            onClick={() => setSelectedPlan("yearly")}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
              selectedPlan === "yearly"
                ? "bg-gradient-to-b from-violet-600/30 to-indigo-600/30 border-violet-400 text-white shadow-xl shadow-violet-600/30"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
              Most Popular
            </div>
            <div className="text-xs font-bold text-amber-300">Yearly</div>
            <div className="text-lg font-black text-white mt-1">$9 <span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">Save 50% ($108/yr)</div>
          </div>

          <div
            onClick={() => setSelectedPlan("lifetime")}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
              selectedPlan === "lifetime"
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold">Lifetime</div>
            <div className="text-lg font-black text-white mt-1">$199 <span className="text-[10px] text-slate-400 font-normal">once</span></div>
            <div className="text-[10px] text-slate-400 mt-1">Unlimited forever</div>
          </div>
        </div>

        {/* Upgrade Action Button */}
        <div className="space-y-2 relative z-10">
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-violet-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-sm transition-all shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Upgrading your account to Pro...</span>
            ) : (
              <>
                <Crown className="w-5 h-5 fill-amber-300" />
                <span>Upgrade to JOXIQ Pro Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Access • 30-Day Money Back Guarantee • Cancel Anytime</span>
          </p>
        </div>

      </div>
    </div>
  );
};
