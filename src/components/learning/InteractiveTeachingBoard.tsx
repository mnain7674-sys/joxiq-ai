import React, { useState, useEffect, useRef } from "react";
import { Course, CourseModule, ClassItem } from "../../types/learning";
import {
  PenTool,
  Eraser,
  Sparkles,
  Code2,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Circle,
  Square,
  ArrowRight,
  Highlighter,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Volume2,
  Eye,
  Sliders,
  Type,
  FileText,
  Activity,
  Maximize
} from "lucide-react";
import Markdown from "react-markdown";

interface InteractiveTeachingBoardProps {
  course: Course;
  currentModule: CourseModule;
  currentClass: ClassItem;
  language: "English" | "Bangla";
  isSpeaking: boolean;
  onTriggerVoice?: (text: string) => void;
  aiCustomExplanation?: string | null;
}

export const InteractiveTeachingBoard: React.FC<InteractiveTeachingBoardProps> = ({
  course,
  currentModule,
  currentClass,
  language,
  isSpeaking,
  onTriggerVoice,
  aiCustomExplanation
}) => {
  // Board Mode: "concept" | "code" | "diagram" | "stepwise"
  const [boardMode, setBoardMode] = useState<"concept" | "code" | "diagram" | "stepwise">("stepwise");

  // Animation Annotation Tools State
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<"none" | "underline" | "circle" | "arrow" | "highlight" | "pen">("highlight");
  const [highlightedConcept, setHighlightedConcept] = useState<string | null>("variable");
  const [showCodeGlow, setShowCodeGlow] = useState<boolean>(true);
  const [selectedCodeLine, setSelectedCodeLine] = useState<number>(1);
  const [showErrorHighlight, setShowErrorHighlight] = useState<boolean>(false);

  // Step-by-Step Progressive Teaching Engine State
  const [currentBoardStep, setCurrentBoardStep] = useState<number>(1);
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(false);

  // Canvas Drawing Board State
  const [penColor, setPenColor] = useState<string>("#ec4899"); // Vibrant Pink/Red/Yellow
  const [penSize, setPenSize] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulated Terminal Run
  const [isTerminalRunning, setIsTerminalRunning] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState<string | null>(null);

  // Default Code Snippet based on lesson or fallback
  const lessonCode = currentClass.examples && currentClass.examples.length > 0
    ? currentClass.examples[0].codeOrText
    : `# JOXIQ AI Interactive Code Board\nname = "Mahi"\nage = 22\nprint(f"Student {name} is {age} years old")`;

  const codeLines = lessonCode.split("\n");

  // Step-by-step progressive content sequence for the current topic
  const progressiveSteps = [
    {
      step: 1,
      title: language === "Bangla" ? "ধাপ ১: আইডেন্টিফায়ার তৈরি" : "Step 1: Declaration & Identifier",
      displayCode: codeLines[0] || 'name = "Mahi"',
      conceptLabel: language === "Bangla" ? "ভেরিয়েন্ট তৈরি: নাম নির্ধারণ" : "Identifier Creation",
      annotationType: "underline",
      explanation: language === "Bangla"
        ? "প্রথমে একটি মেমোরি কন্টেইনার নির্দেশক বা Variable name তৈরি করা হচ্ছে।"
        : "First, memory space is identified with a clear variable name."
    },
    {
      step: 2,
      title: language === "Bangla" ? "ধাপ ২: ডেটা মান অ্যাসাইনমেন্ট" : "Step 2: Value Assignment",
      displayCode: codeLines.slice(0, 2).join("\n"),
      conceptLabel: language === "Bangla" ? "মেমোরিতে ডাটা স্টোর করা" : "Data Stored in RAM",
      annotationType: "highlight",
      explanation: language === "Bangla"
        ? "অ্যাসাইনমেন্ট অপারেটর (=) ব্যবহার করে মেমোরিতে 'Mahi' স্ট্রিং মানটি সংরক্ষণ করা হলো।"
        : "The string value 'Mahi' is stored into RAM via the assignment operator (=)."
    },
    {
      step: 3,
      title: language === "Bangla" ? "ধাপ ৩: লজিক ও প্রসেসিং" : "Step 3: Logic & Processing",
      displayCode: codeLines.slice(0, 3).join("\n"),
      conceptLabel: language === "Bangla" ? "এক্সিকিউশন লজিক" : "Execution Logic",
      annotationType: "circle",
      explanation: language === "Bangla"
        ? "ইনস্ট্রাকশন অনুযায়ী কম্পিউটার প্রসেসর ডাটা প্রসেস করছে।"
        : "The processor prepares memory contents for execution output."
    },
    {
      step: 4,
      title: language === "Bangla" ? "ধাপ ৪: আউটপুট প্রিন্টিং" : "Step 4: Output Generation",
      displayCode: lessonCode,
      conceptLabel: language === "Bangla" ? "আউটপুট ফলাফল" : "Terminal Result",
      annotationType: "arrow",
      explanation: language === "Bangla"
        ? "প্রোগ্রাম সফলভাবে টার্মিনালে ডাটা আউটপুট প্রদান করল।"
        : "The final computed string is output to the user's console display."
    }
  ];

  // Canvas Pen Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeAnnotationTool !== "pen" || !canvasRef.current) return;
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
    if (!isDrawing || activeAnnotationTool !== "pen" || !canvasRef.current) return;
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

  // Run Code Simulation
  const handleRunCode = () => {
    setIsTerminalRunning(true);
    setTerminalLog(null);
    setTimeout(() => {
      setIsTerminalRunning(false);
      setTerminalLog(`[JOXIQ AI Execution Engine] Running ${currentClass.title}...
✔ Compiled without errors (0 warnings)
✔ Output: "Student Mahi is 22 years old"
Process finished with exit code 0.`);
    }, 700);
  };

  // Auto-advance step timer when voice is active
  useEffect(() => {
    let timer: any;
    if (isAutoStepping) {
      timer = setInterval(() => {
        setCurrentBoardStep((prev) => {
          if (prev >= progressiveSteps.length) {
            setIsAutoStepping(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoStepping]);

  const activeStepData = progressiveSteps[Math.min(currentBoardStep - 1, progressiveSteps.length - 1)];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      
      {/* Background Teacher Atmosphere Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* 1. DIGITAL TEACHING BOARD HEADER & ANNOTATION TOOLBAR */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
        
        {/* Left Board Title & Teacher Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-violet-300">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">
                {language === "Bangla" ? "JOXIQ AI ডিজিটাল টিচিং বোর্ড" : "JOXIQ Interactive AI Teaching Board"}
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Classroom
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentClass.title} • {course.category}
            </p>
          </div>
        </div>

        {/* Center Board View Switcher Modes */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          {[
            { id: "stepwise", label: language === "Bangla" ? "ধাপ-ভিত্তিক শিক্ষা" : "Step-by-Step", icon: Layers },
            { id: "code", label: language === "Bangla" ? "কোড এডিটর বোর্ড" : "Code Editor", icon: Code2 },
            { id: "concept", label: language === "Bangla" ? "কনসেপ্ট ও নোট" : "Concept Notes", icon: FileText },
            { id: "diagram", label: language === "Bangla" ? "ডায়াগ্রাম ও স্ট্রাকচার" : "Diagram Board", icon: Cpu }
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = boardMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setBoardMode(mode.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Animation Annotation Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex-wrap">
          
          {/* Underline Tool */}
          <button
            onClick={() => setActiveAnnotationTool(activeAnnotationTool === "underline" ? "none" : "underline")}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeAnnotationTool === "underline"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
            title="Underline Important Text"
          >
            <Type className="w-4 h-4 underline" />
          </button>

          {/* Circle Tool */}
          <button
            onClick={() => setActiveAnnotationTool(activeAnnotationTool === "circle" ? "none" : "circle")}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeAnnotationTool === "circle"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
            title="Circle Key Points"
          >
            <Circle className="w-4 h-4" />
          </button>

          {/* Arrow Tool */}
          <button
            onClick={() => setActiveAnnotationTool(activeAnnotationTool === "arrow" ? "none" : "arrow")}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeAnnotationTool === "arrow"
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
            title="Pointer Arrow Concept"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Highlight Tool */}
          <button
            onClick={() => setActiveAnnotationTool(activeAnnotationTool === "highlight" ? "none" : "highlight")}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeAnnotationTool === "highlight"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
            title="Highlight Important Concept"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {/* Virtual Pen Tool */}
          <button
            onClick={() => setActiveAnnotationTool(activeAnnotationTool === "pen" ? "none" : "pen")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
              activeAnnotationTool === "pen"
                ? "bg-violet-600 text-white border-violet-500"
                : "text-slate-400 hover:text-white border-transparent"
            }`}
            title="Virtual Pen Draw on Board"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="text-[10px]">Pen</span>
          </button>

          {/* Pen Color Controls */}
          {activeAnnotationTool === "pen" && (
            <div className="flex items-center gap-1 pl-1">
              {["#ec4899", "#f59e0b", "#06b6d4", "#10b981"].map((c) => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${penColor === c ? "scale-125 ring-2 ring-white" : "opacity-70"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                onClick={clearCanvas}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all"
                title="Clear Drawing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 2. DIGITAL BOARD INTERACTIVE CANVAS AREA */}
      <div className="relative min-h-[420px] bg-slate-950 border border-slate-800/80 rounded-2xl p-5 sm:p-6 overflow-hidden">
        
        {/* Freehand Pen Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={800}
          height={420}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-30 ${
            activeAnnotationTool === "pen" ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
          }`}
        />

        {/* ----------------- BOARD MODE 1: STEP-BY-STEP PROGRESSIVE TEACHING ----------------- */}
        {boardMode === "stepwise" && (
          <div className="space-y-6 relative z-10 animate-fade-in">
            
            {/* Step Control Header Bar */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-violet-600/30">
                  {currentBoardStep}
                </span>
                <div>
                  <h4 className="text-xs font-black text-white">
                    {activeStepData.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {language === "Bangla" ? "ক্রমবর্ধমান শিক্ষকতা পাঠ" : "Progressive Concept Reveal"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoStepping(!isAutoStepping)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isAutoStepping
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-violet-500/40"
                  }`}
                >
                  {isAutoStepping ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isAutoStepping ? "Pause Auto Step" : "Auto Step Play"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentBoardStep((p) => Math.max(1, p - 1))}
                    disabled={currentBoardStep === 1}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentBoardStep((p) => Math.min(progressiveSteps.length, p + 1))}
                    disabled={currentBoardStep === progressiveSteps.length}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step Code Reveal Board */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> {activeStepData.conceptLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Step {currentBoardStep} of {progressiveSteps.length}</span>
              </div>

              {/* Revealed Code Block with Animation Annotations */}
              <div className="bg-black p-4 rounded-xl font-mono text-sm sm:text-base border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] text-slate-600 uppercase font-mono font-bold">Python / JS</div>
                
                <pre className="text-emerald-300 font-bold tracking-wide leading-relaxed whitespace-pre-wrap">
                  {activeStepData.displayCode}
                </pre>

                {/* Animated Underline Effect if active */}
                {(activeAnnotationTool === "underline" || activeStepData.annotationType === "underline") && (
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 rounded-full animate-pulse mt-2" />
                )}

                {/* Animated Circle Callout */}
                {(activeAnnotationTool === "circle" || activeStepData.annotationType === "circle") && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-sans mt-2 animate-bounce">
                    <Circle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Focus Point: Memory reference assignment</span>
                  </div>
                )}
              </div>

              {/* Step Teacher Explanation */}
              <div className={`p-4 rounded-2xl border transition-all ${
                activeAnnotationTool === "highlight"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-100"
                  : "bg-slate-950 border-slate-800 text-slate-200"
              }`}>
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm leading-relaxed font-medium">
                    {activeStepData.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* RAM Memory & Pointer Diagram Animation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-mono font-bold text-xs">
                  RAM
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Variable Address</span>
                  <div className="text-xs font-mono text-white font-extrabold">0x7FFF92</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pointer Mapping</span>
                  <div className="text-xs font-mono text-cyan-300 font-extrabold">name ➔ "Mahi"</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Data Status</span>
                  <div className="text-xs font-mono text-emerald-300 font-extrabold">String Immutable</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- BOARD MODE 2: PROGRAMMING CODE EDITOR & GLOW ----------------- */}
        {boardMode === "code" && (
          <div className="space-y-4 relative z-10 animate-fade-in">
            
            {/* Code Board Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  main.py
                </span>
                <span className="text-[10px] text-slate-400">Click lines to highlight with Code Glow</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Code Glow Toggle */}
                <button
                  onClick={() => setShowCodeGlow(!showCodeGlow)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    showCodeGlow
                      ? "bg-violet-600 text-white border-violet-500 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Code Glow</span>
                </button>

                {/* Error Highlight Simulation Toggle */}
                <button
                  onClick={() => setShowErrorHighlight(!showErrorHighlight)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    showErrorHighlight
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bug Check</span>
                </button>

                {/* Simulator Run Button */}
                <button
                  onClick={handleRunCode}
                  disabled={isTerminalRunning}
                  className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{isTerminalRunning ? "Running..." : "Run"}</span>
                </button>
              </div>
            </div>

            {/* VS Code Style Editor Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm space-y-2">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isLineActive = selectedCodeLine === lineNum;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCodeLine(lineNum)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-3 relative ${
                      isLineActive && showCodeGlow
                        ? "bg-violet-600/25 border border-violet-500/60 shadow-lg shadow-violet-500/20 text-white font-bold"
                        : "hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <span className="text-slate-600 select-none w-6 text-right font-bold text-[11px]">{lineNum}</span>
                    <span className="flex-1">{line}</span>

                    {/* Active Line Glow Indicator */}
                    {isLineActive && showCodeGlow && (
                      <span className="text-[10px] bg-violet-500/20 text-violet-300 font-sans font-extrabold px-2 py-0.5 rounded-md border border-violet-500/30">
                        Active Line
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Simulated Error Highlight Box */}
              {showErrorHighlight && (
                <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 space-y-1 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Syntax Error Highlighted by AI Teacher:</span>
                  </div>
                  <p className="text-[11px] opacity-90 pl-6">
                    NameError: name 'age' is referenced before assignment. Ensure variable is declared before print statements.
                  </p>
                </div>
              )}
            </div>

            {/* Console Output Terminal */}
            {terminalLog && (
              <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-1 animate-fade-in">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Interactive Terminal Output</div>
                <pre className="whitespace-pre-wrap">{terminalLog}</pre>
              </div>
            )}

          </div>
        )}

        {/* ----------------- BOARD MODE 3: CONCEPT NOTES & MARKDOWN ----------------- */}
        {boardMode === "concept" && (
          <div className="space-y-4 relative z-10 animate-fade-in">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-violet-400 border-b border-slate-800 pb-2">
                <Lightbulb className="w-4 h-4" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">
                  {language === "Bangla" ? "AI শিক্ষক ডিজিটাল নোটবোর্ড" : "AI Teacher Interactive Concept Notes"}
                </h3>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed prose prose-invert max-w-none">
                <Markdown>{aiCustomExplanation || currentClass.explanationTopic}</Markdown>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- BOARD MODE 4: DIAGRAM & ARCHITECTURE ----------------- */}
        {boardMode === "diagram" && (
          <div className="space-y-5 relative z-10 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  {language === "Bangla" ? "আর্কিটেকচার ও ডাটা ফ্লো ডায়াগ্রাম" : "System Architecture & Concept Diagram"}
                </span>
                <span className="text-[10px] text-slate-400">Interactive Flow</span>
              </div>

              {/* Interactive SVG / Component Schematic Flowchart */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
                
                {/* Node 1: Input */}
                <div className="bg-violet-950/60 border border-violet-500/40 p-4 rounded-2xl space-y-1.5 w-44 shadow-lg shadow-violet-500/10">
                  <span className="text-[10px] font-extrabold uppercase text-violet-400 block">Phase 1</span>
                  <h5 className="text-xs font-black text-white">Input / Source Data</h5>
                  <p className="text-[10px] text-slate-400">Parameters & User Input</p>
                </div>

                <ArrowRight className="w-6 h-6 text-slate-600 hidden md:block animate-pulse" />

                {/* Node 2: Processing Engine */}
                <div className="bg-indigo-950/60 border border-indigo-500/40 p-4 rounded-2xl space-y-1.5 w-48 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-400 block">Phase 2</span>
                  <h5 className="text-xs font-black text-white">Core Logic Engine</h5>
                  <p className="text-[10px] text-slate-400">Transforms & Evaluates</p>
                </div>

                <ArrowRight className="w-6 h-6 text-slate-600 hidden md:block animate-pulse" />

                {/* Node 3: Output */}
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl space-y-1.5 w-44 shadow-lg shadow-emerald-500/10">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Phase 3</span>
                  <h5 className="text-xs font-black text-white">Execution Result</h5>
                  <p className="text-[10px] text-slate-400">Rendered UI / API Output</p>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. FOOTER Synchronization Badge */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
          <span>
            {isSpeaking
              ? (language === "Bangla" ? "AI শিক্ষক এখন পড়োচ্ছেন এবং বোর্ড সিঙ্ক হচ্ছে..." : "AI Voice Teacher speaking • Screen synchronized in real-time")
              : (language === "Bangla" ? "ভয়েস রিডিং শুরু করতে Play বাটনে চাপ দিন" : "Click Play Voice on right controller to start synchronized teaching session")}
          </span>
        </div>

        <span className="font-mono text-slate-500 hidden sm:inline">
          Board Sync v2.4 • JOXIQ Classroom
        </span>
      </div>

    </div>
  );
};
