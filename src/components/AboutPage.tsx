import React from "react";
import { 
  User, 
  Globe, 
  MapPin, 
  BookOpen, 
  Cpu, 
  Target, 
  Eye, 
  Sparkles, 
  Heart,
  Github,
  Linkedin,
  Mail
} from "lucide-react";
import { motion } from "motion/react";
import joxiqLogo from "../assets/images/joxiq_logo_black_bg_1783530406544.jpg";

interface AboutPageProps {
  theme: "light" | "dark";
}

export function AboutPage({ theme }: AboutPageProps) {
  const isDark = theme === "dark";

  return (
    <div className={`min-h-full py-10 px-4 md:px-8 max-w-4xl mx-auto space-y-10 ${
      isDark ? "text-slate-200" : "text-slate-800"
    }`}>
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-lg bg-slate-900 mb-4 p-1">
          <img
            src={joxiqLogo}
            alt="JOXIQ AI Official Logo"
            className="w-full h-auto rounded-xl object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          About JOXIQ AI
        </h1>
        <p className={`text-sm max-w-lg mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          A smart, next-generation educational and conversational AI companion crafted to empower your daily studies, productivity, and coding workflows.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
          Version 1.0 Stable
        </div>
      </motion.div>

      {/* Grid of Key Info (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Creator Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`p-6 rounded-2xl border transition-all ${
            isDark 
              ? "bg-slate-900/40 border-slate-800 hover:border-indigo-500/30" 
              : "bg-white border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md"
          }`}
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-500 dark:text-indigo-400">
            <User size={18} />
            <span>Meet the Creator</span>
          </h2>
          
          <div className="space-y-4 text-sm">
            <p className={isDark ? "text-slate-300" : "text-slate-700"}>
              JOXIQ AI is designed and developed by <strong className="text-indigo-600 dark:text-indigo-400">Julkar Nain Mahi</strong>.
            </p>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className={`p-1.5 rounded-lg shrink-0 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <Globe size={16} className="text-emerald-500" />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Nationality</div>
                  <div className="font-semibold">Bangladeshi</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`p-1.5 rounded-lg shrink-0 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <MapPin size={16} className="text-rose-500" />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current Location</div>
                  <div className="font-semibold">Qatar (for studies)</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`p-1.5 rounded-lg shrink-0 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <BookOpen size={16} className="text-indigo-500" />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Occupation</div>
                  <div className="font-semibold">Student & AI Developer</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-6 rounded-2xl border transition-all ${
            isDark 
              ? "bg-slate-900/40 border-slate-800 hover:border-indigo-500/30" 
              : "bg-white border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md"
          }`}
        >
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-500 dark:text-indigo-400">
            <Cpu size={18} />
            <span>Project Profile</span>
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/10">
              <span className="text-slate-400">AI Name</span>
              <span className="font-bold text-indigo-500 dark:text-indigo-400">JOXIQ AI</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/10">
              <span className="text-slate-400">Main Architect</span>
              <span className="font-semibold">Julkar Nain Mahi</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/10">
              <span className="text-slate-400">Target Framework</span>
              <span className="font-mono text-xs bg-slate-500/10 px-2 py-0.5 rounded text-indigo-500">React + Vite</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Model Engine</span>
              <span className="font-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500">Gemini 3.5 Flash</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Mission and Vision section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`p-6 rounded-2xl border ${
            isDark ? "bg-indigo-650/10 border-indigo-500/20" : "bg-indigo-50/50 border-indigo-100"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3 text-indigo-600 dark:text-indigo-400">
            <Target size={20} className="shrink-0" />
            <h3 className="text-md font-bold uppercase tracking-wider">Our Mission</h3>
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            To make AI simple, intelligent, and accessible for everyone, enabling students, coders, and creators worldwide to elevate their productivity and focus on what truly matters.
          </p>
        </motion.div>

        {/* Vision Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`p-6 rounded-2xl border ${
            isDark ? "bg-emerald-650/10 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3 text-emerald-600 dark:text-emerald-400">
            <Eye size={20} className="shrink-0" />
            <h3 className="text-md font-bold uppercase tracking-wider">Our Vision</h3>
          </div>
          <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            To build one of the world's most useful and innovative AI assistants, combining advanced language capabilities with elegant interfaces for seamless study guidance and technical workspace automation.
          </p>
        </motion.div>
      </div>

      {/* About the creator section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={`p-6 md:p-8 rounded-2xl border text-center space-y-4 ${
          isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vision Statement</h3>
        <p className={`text-sm max-w-2xl mx-auto leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          "I created JOXIQ AI with the vision of building a smart, helpful, and user-friendly AI assistant that can help people with learning, productivity, coding, creativity, and everyday tasks. JOXIQ AI is an independent AI project developed by Julkar Nain Mahi."
        </p>
        <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} flex items-center justify-center gap-1.5`}>
          <span>Made with</span>
          <Heart size={12} className="text-red-500 fill-red-500 animate-bounce" />
          <span>by Julkar Nain Mahi in Qatar</span>
        </div>
      </motion.div>
    </div>
  );
}
