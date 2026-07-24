import React, { useState, useEffect, useRef } from "react";
import { Course, CourseModule, ClassItem, UserCourseProgress } from "../../types/learning";
import { AIDoubtChat } from "./AIDoubtChat";
import { InteractiveTeachingBoard } from "./InteractiveTeachingBoard";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  PenTool,
  Eraser,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Languages,
  BrainCircuit,
  Code2,
  Terminal,
  Sliders,
  Zap,
  Award,
  MessageSquare,
  Flame,
  BookOpen,
  Layers,
  Globe,
  RefreshCw,
  Square,
  Circle,
  Target,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Send,
  Trash2,
  Mic,
  MicOff,
  Smile,
  Bot
} from "lucide-react";
import Markdown from "react-markdown";

interface AITeacherClassroomProps {
  course: Course;
  currentModule: CourseModule;
  currentClass: ClassItem;
  userProgress?: UserCourseProgress;
  onToggleClassCompleted: (classId: string) => void;
  onBackToCourse: () => void;
  onNextClass?: () => void;
  onPrevClass?: () => void;
}

export const AITeacherClassroom: React.FC<AITeacherClassroomProps> = ({
  course,
  currentModule,
  currentClass,
  userProgress,
  onToggleClassCompleted,
  onBackToCourse,
  onNextClass,
  onPrevClass
}) => {
  // 1. Classroom Flow Step State: 1: Intro -> 2: Explain -> 3: Example -> 4: Practice -> 5: Quiz -> 6: Summary
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 2. Language & Voice Teaching State
  const [language, setLanguage] = useState<"English" | "Bangla">("English");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 0.75x = Slow, 1.0x = Normal, 1.25x = Fast
  const [speechRateLabel, setSpeechRateLabel] = useState<"Slow" | "Normal" | "Fast">("Normal");

  // 3. Microphone Voice Input State
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 4. AI Custom Teacher Question & Explanation State
  const [aiCustomExplanation, setAiCustomExplanation] = useState<string | null>(null);
  const [studentQuestion, setStudentQuestion] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // 5. Code / Concept Teaching Mode & Interactive Board State
  const [selectedCodeLine, setSelectedCodeLine] = useState<number | null>(1);
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  // 6. Virtual Canvas Drawing Board State
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>("#ef4444"); // Red, Yellow, Cyan, Green, Pink
  const [penSize, setPenSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 7. Interactive Quiz & Practice state
  const [practiceAnswer, setPracticeAnswer] = useState<string>("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const isCompleted = userProgress?.completedClassIds.includes(currentClass.id);

  // Voice Speech Synthesis Handler using browser Web Speech API
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  // Voice Speech Function
  const speakText = (text: string) => {
    if (!synth) return;
    synth.cancel();

    // Clean markdown text for voice synthesis
    const cleanText = text
      .replace(/```[\s\S]*?```/g, language === "Bangla" ? "বোর্ডে কোড নমুনা প্রদর্শিত হচ্ছে।" : "Code snippet displayed on screen board.")
      .replace(/[*#_`]/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;

    // Detect and assign available browser voice based on language
    if (synth) {
      const voices = synth.getVoices();
      if (language === "Bangla") {
        utterance.lang = "bn-BD";
        const bnVoice = voices.find((v) => v.lang.startsWith("bn") || v.lang.includes("BD") || v.lang.includes("IN"));
        if (bnVoice) utterance.voice = bnVoice;
      } else {
        utterance.lang = "en-US";
        const enVoice = voices.find((v) => v.lang === "en-US" || v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  };

  const handlePauseVoice = () => {
    if (!synth) return;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    } else if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const handleStopVoice = () => {
    if (!synth) return;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleReplayVoice = () => {
    if (!synth) return;
    handleStopVoice();
    setTimeout(() => {
      triggerCurrentStepVoice();
    }, 100);
  };

  const setVoiceSpeed = (rate: number, label: "Slow" | "Normal" | "Fast") => {
    setSpeechRate(rate);
    setSpeechRateLabel(label);
    if (isSpeaking) {
      handleStopVoice();
      setTimeout(() => {
        triggerCurrentStepVoice();
      }, 100);
    }
  };

  // Toggle Microphone Voice Recognition for Student Question Input
  const toggleMicListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Microphone voice input is not supported in this browser. Please type your question.");
      return;
    }

    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === "Bangla" ? "bn-BD" : "en-US";

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setStudentQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Mic error:", err);
      setIsListeningMic(false);
    }
  };

  // Trigger speech explanation based on current step & custom AI teacher text
  const triggerCurrentStepVoice = () => {
    if (aiCustomExplanation) {
      speakText(aiCustomExplanation);
      return;
    }

    let textToSpeak = "";
    if (currentStep === 1) {
      textToSpeak = language === "Bangla"
        ? `আজকের ক্লাসে স্বাগতম! আজকে আমরা শিখবো ${currentClass.title}। ${currentClass.learningObjective}`
        : `Welcome to today's class! Today we will learn ${currentClass.title}. ${currentClass.learningObjective}`;
    } else if (currentStep === 2) {
      textToSpeak = language === "Bangla"
        ? `চলুন বিষয়টির সহজ ব্যাখ্যা জেনে নিই। ${currentClass.explanationTopic.substring(0, 300)}`
        : `Let us explore the topic step by step. ${currentClass.explanationTopic.substring(0, 300)}`;
    } else if (currentStep === 3) {
      textToSpeak = language === "Bangla"
        ? `বাস্তব জীবনের ব্যবহার দেখুন। ${currentClass.realLifeUsage?.realWorldApplication || "এটি প্রডাকশন সিস্টেমে ব্যাপকভাবে ব্যবহৃত হয়।"}`
        : `Here is a real-life example. ${currentClass.realLifeUsage?.realWorldApplication || "This concept is applied in production applications."}`;
    } else if (currentStep === 4) {
      textToSpeak = language === "Bangla"
        ? `এখন হাতে-কলমে অনুশীলনের সময়। ${currentClass.practiceTask || "একটি সহজ প্রোগ্রাম কোড করে চেষ্টা করুন।"}`
        : `Now it is time for hands-on practice. ${currentClass.practiceTask || "Try writing your solution in the editor."}`;
    } else if (currentStep === 5) {
      textToSpeak = language === "Bangla"
        ? `চলুন একটি কুইজের মাধ্যমে আপনার অর্জিত জ্ঞান পরীক্ষা করি।`
        : `Let us check your understanding with a short quiz.`;
    } else if (currentStep === 6) {
      textToSpeak = language === "Bangla"
        ? `চমৎকার! আপনি সফলভাবে আজকের ক্লাস সম্পূর্ণ করেছেন।`
        : `Great job! You have successfully completed today's class lesson.`;
    }

    if (textToSpeak) {
      speakText(textToSpeak);
    }
  };

  // Auto-speak when switching steps, language, or custom explanation
  useEffect(() => {
    triggerCurrentStepVoice();

    return () => {
      if (synth) synth.cancel();
    };
  }, [currentStep, language, aiCustomExplanation]);

  // Request AI Teacher custom explanation or special request modes
  const handleAskAiTeacher = async (mode?: "explain_again" | "another_example" | "explain_easier") => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/learning/teacher-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classTitle: currentClass.title,
          explanationTopic: currentClass.explanationTopic,
          courseCategory: course.category,
          level: currentModule.level,
          language,
          studentQuestion: studentQuestion.trim() || undefined,
          requestMode: mode,
          currentStep
        })
      });

      const data = await res.json();
      if (data.success && data.explanation) {
        setAiCustomExplanation(data.explanation);
        speakText(data.explanation);
      } else {
        setAiCustomExplanation(language === "Bangla" ? "AI শিক্ষকের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Failed to connect to AI Teacher. Please try again.");
      }
    } catch (e: any) {
      setAiCustomExplanation(`AI Teacher connection error: ${e.message || e}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Canvas Drawing Board Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Code Execution Simulation
  const handleRunCode = () => {
    setIsCodeRunning(true);
    setTerminalOutput(null);
    setTimeout(() => {
      setIsCodeRunning(false);
      setTerminalOutput(`[JOXIQ Terminal Runtime] Executing ${currentClass.title}...
✔ Program compiled & executed successfully.
✔ Result Output: "Hello World from ${currentClass.title}"
Execution status: 0 (Success).`);
    }, 800);
  };

  // Interactive Token Parsing Helper for Code / Formulas
  const defaultCodeSnippet = currentClass.examples && currentClass.examples.length > 0
    ? currentClass.examples[0].codeOrText
    : `name = "Mahi"\nprint("Welcome, " + name)`;

  const codeLines = defaultCodeSnippet.split("\n");

  const sampleTokenBreakdown = [
    { token: 'name', type: 'Variable Identifier', desc: 'Container storing values in memory', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
    { token: '=', type: 'Assignment Operator', desc: 'Assigns the right-hand value to variable', color: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
    { token: '"Mahi"', type: 'String Literal Value', desc: 'Textual data enclosed in quotes', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* 1. TOP CLASSROOM HEADER & NAVIGATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCourse}
            className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-violet-500 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Back to Course Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Class {currentClass.classNumber} of 100
              </span>
              <span className="text-xs font-extrabold text-white">
                {currentClass.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {course.name} • Module: {currentModule.title}
            </p>
          </div>
        </div>

        {/* Header Controls: Language Switcher & Mark Complete */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          
          {/* Multi-Language Toggle: English / Bangla */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setLanguage("English");
                setAiCustomExplanation(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                language === "English"
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
            <button
              onClick={() => {
                setLanguage("Bangla");
                setAiCustomExplanation(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                language === "Bangla"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇧🇩 বাংলা</span>
            </button>
          </div>

          {/* Mark Class Complete Button */}
          <button
            onClick={() => onToggleClassCompleted(currentClass.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-violet-500/40"
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
            <span>{isCompleted ? "Completed" : "Complete"}</span>
          </button>
        </div>
      </div>

      {/* 2. CLASSROOM FLOW STEPS PROGRESS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[
            { id: 1, name: language === "Bangla" ? "১. পরিচিতি" : "1. Introduction", icon: Target },
            { id: 2, name: language === "Bangla" ? "২. পাঠ ব্যাখ্যা" : "2. AI Teach", icon: BrainCircuit },
            { id: 3, name: language === "Bangla" ? "৩. উদাহরণ" : "3. Examples", icon: Lightbulb },
            { id: 4, name: language === "Bangla" ? "৪. অনুশীিলন" : "4. Practice", icon: Code2 },
            { id: 5, name: language === "Bangla" ? "৫. কুইজ" : "5. Quiz", icon: HelpCircle },
            { id: 6, name: language === "Bangla" ? "৬. সারসংক্ষেপ" : "6. Summary", icon: Award }
          ].map((step) => {
            const IconComp = step.icon;
            const isActive = currentStep === step.id;
            const isPassed = currentStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setCurrentStep(step.id);
                  setAiCustomExplanation(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500 shadow-lg shadow-violet-600/20"
                    : isPassed
                    ? "bg-slate-950 text-slate-300 border-slate-800/80 hover:border-slate-700"
                    : "bg-slate-950/50 text-slate-500 border-slate-800/50 hover:text-slate-400"
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-white" : isPassed ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="truncate">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN CLASSROOM TEACHING CANVAS & VOICE TEACHER BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Teaching Screen (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ADVANCED INTERACTIVE TEACHING BOARD */}
          <InteractiveTeachingBoard
            course={course}
            currentModule={currentModule}
            currentClass={currentClass}
            language={language}
            isSpeaking={isSpeaking}
            onTriggerVoice={speakText}
            aiCustomExplanation={aiCustomExplanation}
          />

          {/* STEP-SPECIFIC INTERACTIVE EXERCISES & QUIZZES */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            
            {/* STEP 1: INTRODUCTION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/30 p-5 rounded-2xl space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> {language === "Bangla" ? "আজকের ক্লাসের মূল উদ্দেশ্য" : "Today's Learning Objective"}
                  </span>
                  <h2 className="text-lg font-black text-white">
                    {language === "Bangla" ? `আজকে আপনি যা শিখবেন:` : `What you will master today:`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {currentClass.learningObjective}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> {language === "Bangla" ? "মূল শিক্ষণীয় বিষয়সমূহ" : "Key Takeaways"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentClass.whatYouWillLearn?.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: AI STEP-BY-STEP EXPLANATION */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="text-xs font-extrabold text-violet-300 uppercase tracking-wider flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-violet-400" />
                    {language === "Bangla" ? "AI শিক্ষকের পাঠ ব্যাখ্যা (বাংলা)" : "AI Teacher Lesson Explanation (English)"}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed prose prose-invert max-w-none">
                    <Markdown>{aiCustomExplanation || currentClass.explanationTopic}</Markdown>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REAL-LIFE EXAMPLES */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">
                      {language === "Bangla" ? "বাস্তব জীবনের উদাহরণ ও প্রয়োগ" : "Real-Life Application & Why Useful"}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {currentClass.realLifeUsage?.realWorldApplication || "This topic is used extensively in industry applications."}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: PRACTICE TASK & SIMULATED RUNNER */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Code2 className="w-4 h-4" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider">
                        {language === "Bangla" ? "হাতে-কলমে প্র্যাকটিস টাস্ক" : "Hands-on Practice Task"}
                      </h3>
                    </div>
                    <button
                      onClick={handleRunCode}
                      disabled={isCodeRunning}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{isCodeRunning ? "Running..." : "Run Simulator"}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">
                      {language === "Bangla" ? "টাস্ক বিবরণ:" : "Practice Goal:"}
                    </label>
                    <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      {currentClass.practiceTask || `Write a simple program or solve a task for ${currentClass.title}.`}
                    </p>
                  </div>

                  {/* Practice Code Input Box */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">
                      {language === "Bangla" ? "আপনার সমাধান বা কোড লিখুন:" : "Your Answer / Code Solution:"}
                    </label>
                    <textarea
                      rows={4}
                      value={practiceAnswer}
                      onChange={(e) => setPracticeAnswer(e.target.value)}
                      placeholder="Type your solution here..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Terminal Console Output */}
                  {terminalOutput && (
                    <div className="bg-black p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Terminal Output</div>
                      <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: QUIZ KNOWLEDGE CHECK */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-3">
                    <HelpCircle className="w-4 h-4" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">
                      {language === "Bangla" ? "কুইজ ও জ্ঞান যাচাই" : "Lesson Quiz & Knowledge Check"}
                    </h3>
                  </div>

                  {currentClass.quiz && currentClass.quiz.length > 0 ? (
                    currentClass.quiz.map((q) => {
                      const selectedOpt = quizAnswers[q.id];
                      const isSubmitted = quizSubmitted[q.id];
                      const isCorrect = selectedOpt === q.correctOptionIndex;

                      return (
                        <div key={q.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                          <h4 className="text-xs font-bold text-white">{q.question}</h4>
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                                className={`w-full p-2.5 rounded-xl text-xs text-left transition-all cursor-pointer border flex items-center justify-between ${
                                  selectedOpt === optIdx
                                    ? "bg-violet-600/30 border-violet-500 text-white font-bold"
                                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                                }`}
                              >
                                <span>{opt}</span>
                                {selectedOpt === optIdx && <Check className="w-4 h-4 text-violet-400" />}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setQuizSubmitted({ ...quizSubmitted, [q.id]: true })}
                            disabled={selectedOpt === undefined}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:opacity-40"
                          >
                            {language === "Bangla" ? "উত্তর জমা দিন" : "Submit Answer"}
                          </button>

                          {isSubmitted && (
                            <div className={`p-3 rounded-xl text-xs space-y-1 ${isCorrect ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200" : "bg-rose-500/10 border border-rose-500/30 text-rose-200"}`}>
                              <span className="font-bold block">{isCorrect ? "✔ সঠিক উত্তর!" : "❌ আবার চেষ্টা করুন"}</span>
                              <p className="text-[11px] opacity-90">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400">No quiz items configured for this specific lesson.</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: SUMMARY & LESSON RECAP */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-6 rounded-2xl space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {language === "Bangla" ? `ক্লাস সফলভাবে সম্পন্ন করার জন্য অভিনন্দন!` : `Class Completed Successfully!`}
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    You have mastered <strong className="text-white">{currentClass.title}</strong>. Keep up the great streak!
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => onToggleClassCompleted(currentClass.id)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === "Bangla" ? "সম্পূর্ণ চিহ্নিত করুন" : "Mark Complete & Save Progress"}</span>
                    </button>

                    {onNextClass && (
                      <button
                        onClick={onNextClass}
                        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>{language === "Bangla" ? "পরবর্তী ক্লাসে যান" : "Go to Next Class"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Classroom Step Controller Buttons */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 relative z-10">
              <button
                onClick={() => {
                  setCurrentStep((prev) => Math.max(1, prev - 1));
                  setAiCustomExplanation(null);
                }}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === "Bangla" ? "পূর্ববর্তী ধাপ" : "Previous Step"}</span>
              </button>

              <div className="text-xs font-bold text-slate-400">
                Step <span className="text-violet-400">{currentStep}</span> of 6
              </div>

              <button
                onClick={() => {
                  setCurrentStep((prev) => Math.min(6, prev + 1));
                  setAiCustomExplanation(null);
                }}
                disabled={currentStep === 6}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>{language === "Bangla" ? "পরবর্তী ধাপ" : "Next Step"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Voice Controller & Student Ask AI Teacher Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* VOICE TEACHER SYSTEM CONTROLLER CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">
                    {language === "Bangla" ? "AI ভয়েস টিচার" : "AI Voice Teacher Controls"}
                  </h3>
                  <p className="text-[10px] text-slate-400">Live Voice Synthesis</p>
                </div>
              </div>

              <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
            </div>

            {/* Voice Controls: Play / Pause / Resume / Replay / Stop */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              {/* Play / Pause / Resume */}
              <button
                onClick={() => {
                  if (isSpeaking) {
                    handlePauseVoice();
                  } else {
                    triggerCurrentStepVoice();
                  }
                }}
                className="py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title={isSpeaking ? (isPaused ? "Resume Voice" : "Pause Voice") : "Play Voice"}
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isPaused ? "Resume" : "Play"}</span>
                  </>
                )}
              </button>

              {/* Replay Voice Explanation */}
              <button
                onClick={handleReplayVoice}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Replay Voice Explanation"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Replay</span>
              </button>

              {/* Stop Voice */}
              <button
                onClick={handleStopVoice}
                disabled={!isSpeaking}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                title="Stop Voice"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>

            {/* Voice Speed Controls (Slow, Normal, Fast) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>{language === "Bangla" ? "ভয়েস স্পিড কন্ট্রোল:" : "Voice Speed Control:"}</span>
                <span className="text-violet-400 font-bold text-[10px] bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                  {speechRateLabel} ({speechRate}x)
                </span>
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Slow", rate: 0.75, display: "0.75x" },
                  { label: "Normal", rate: 1.0, display: "1.0x" },
                  { label: "Fast", rate: 1.25, display: "1.25x" }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setVoiceSpeed(item.rate, item.label as any)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      speechRate === item.rate
                        ? "bg-violet-600 text-white border-violet-500 shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[9px] opacity-80 font-mono">{item.display}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ASK AI TEACHER PANEL (Student Interaction & Voice Input Mic) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-extrabold text-white">
                  {language === "Bangla" ? "শিক্ষার্থী ইন্টারঅ্যাকশন" : "Ask AI Voice Teacher"}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Q&A</span>
            </div>

            {/* Quick Request Action Chips (Required: "Explain again", "Give another example", "Explain easier") */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === "Bangla" ? "দ্রুত অনুরোধ কমান্ড:" : "Quick Requests:"}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    key: "explain_again",
                    labelEn: "🔄 Explain again",
                    labelBn: "🔄 পুনরায় ব্যাখ্যা করুন"
                  },
                  {
                    key: "another_example",
                    labelEn: "💡 Give another example",
                    labelBn: "💡 আরেকটি উদাহরণ দিন"
                  },
                  {
                    key: "explain_easier",
                    labelEn: "🧠 Explain easier",
                    labelBn: "🧠 সহজভাবে বোঝান"
                  }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleAskAiTeacher(item.key as any)}
                    disabled={isGeneratingAi}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-between text-left disabled:opacity-50"
                  >
                    <span>{language === "Bangla" ? item.labelBn : item.labelEn}</span>
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Student Question Textarea + Voice Mic Button */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">
                  {language === "Bangla" ? "প্রশ্ন লিখুন বা মুখে বলুন:" : "Type or Speak your Question:"}
                </label>

                {/* Microphone Voice Input Button */}
                <button
                  onClick={toggleMicListening}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    isListeningMic
                      ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                  title={isListeningMic ? "Stop Microphone" : "Speak via Microphone"}
                >
                  {isListeningMic ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-rose-400" />}
                  <span>{isListeningMic ? (language === "Bangla" ? "শুনছি..." : "Listening...") : (language === "Bangla" ? "মাইক্রোফোন" : "Voice Mic")}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={studentQuestion}
                onChange={(e) => setStudentQuestion(e.target.value)}
                placeholder={language === "Bangla" ? "যেকোনো বিষয় জিজ্ঞেস করুন..." : "Ask your question here..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-500"
              />

              <button
                onClick={() => handleAskAiTeacher()}
                disabled={isGeneratingAi || !studentQuestion.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "Bangla" ? "AI শিক্ষক ভাবছেন..." : "AI Teacher Thinking..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === "Bangla" ? "AI শিক্ষককে জিজ্ঞেস করুন" : "Ask AI Teacher"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. AI DOUBT CHAT SYSTEM (Below Teaching Screen) */}
      <div className="pt-4">
        <AIDoubtChat
          course={course}
          currentModule={currentModule}
          currentClass={currentClass}
          currentStep={currentStep}
          selectedCodeLine={selectedCodeLine}
          language={language}
        />
      </div>

    </div>
  );
};
