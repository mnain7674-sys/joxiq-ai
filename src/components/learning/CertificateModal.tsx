import React from "react";
import { CourseCertificate } from "../../types/learning";
import {
  Award,
  CheckCircle2,
  Download,
  Printer,
  Sparkles,
  X,
  ShieldCheck,
  Crown,
  GraduationCap,
  Calendar,
  Share2
} from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  certificate: CourseCertificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  certificate,
  onClose
}) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${certificate.courseName} Certificate - JOXIQ AI Learning Academy`,
        text: `I have officially completed the 100-class course "${certificate.courseName}" on JOXIQ AI Learning Academy!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Certificate URL copied to clipboard!");
    }
  };

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 my-8">
        
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Official Course Completion Certificate</h3>
              <p className="text-[11px] text-slate-400">JOXIQ AI Learning Academy Verified Credentials</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE FRAME */}
        <div className="mt-6 p-6 sm:p-10 bg-slate-950 border-4 border-double border-amber-500/50 rounded-2xl relative overflow-hidden shadow-2xl text-center space-y-6">
          
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <GraduationCap className="w-96 h-96 text-amber-400" />
          </div>

          {/* Certificate Corner Ornaments */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500/80" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500/80" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500/80" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500/80" />

          {/* Certificate Header */}
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              <span>JOXIQ AI Learning Academy</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
              CERTIFICATE OF COMPLETION
            </h1>

            <p className="text-xs text-slate-400 tracking-wider uppercase">
              This is to certify that
            </p>
          </div>

          {/* Student Name Display */}
          <div className="relative z-10 py-2 border-b border-slate-800/80 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {certificate.studentName || "JOXIQ Academy Scholar"}
            </h2>
          </div>

          {/* Description & Skills */}
          <div className="space-y-3 max-w-xl mx-auto relative z-10">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              has successfully completed all 100 classes, quizzes, and practical evaluations for the course
            </p>

            <h3 className="text-xl sm:text-2xl font-black text-violet-300 tracking-tight">
              "{certificate.courseName}"
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-400 pt-1">
              <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                {certificate.courseCategory}
              </span>
              <span>•</span>
              <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                {certificate.level} Level
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">
                Avg. Score: {Math.round(certificate.completionScoreAverage)}%
              </span>
            </div>

            {/* Skills Learned Display */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                Verified Skills Acquired & Mastered
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {(certificate.skillsLearned && certificate.skillsLearned.length > 0
                  ? certificate.skillsLearned
                  : ["Core Syntax & Logic", "Problem Solving", "API Integration", "Algorithmic Efficiency"]
                ).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Footer Meta */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs relative z-10 items-end">
            
            {/* Issue Date */}
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                Issued On
              </span>
              <span className="font-bold text-slate-300 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Security Emblem */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-violet-600 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 block tracking-widest uppercase">
                {certificate.certificateId}
              </span>
            </div>

            {/* Signature */}
            <div className="text-center sm:text-right space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                Academic Board
              </span>
              <span className="font-serif italic font-bold text-amber-300 text-sm block">
                Dr. Joxiq AI Director
              </span>
              <span className="text-[10px] text-slate-500 block">Verified Credentials</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
