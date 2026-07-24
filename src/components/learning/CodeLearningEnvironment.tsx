import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Course, CourseModule, ClassItem, UserCourseProgress } from "../../types/learning";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_CODING_EXERCISES,
  SAMPLE_PRACTICE_PROJECTS,
  ProgrammingLanguage,
  CodingExercise,
  PracticeProject
} from "../../data/codeLearningData";
import {
  Code2,
  Play,
  BrainCircuit,
  Sparkles,
  Bug,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Terminal,
  RotateCcw,
  Copy,
  Check,
  Zap,
  BookOpen,
  FolderKanban,
  FileCode,
  Layers,
  Award,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Send,
  Loader2,
  Bot,
  Sliders,
  ChevronDown,
  ExternalLink,
  Flame,
  Star,
  Cpu
} from "lucide-react";

interface CodeLearningEnvironmentProps {
  course?: Course | null;
  currentClass?: ClassItem | null;
  userProgressMap?: Record<string, UserCourseProgress>;
  onUpdateProgress?: (courseId: string, classId: string, type: "practice") => void;
  languagePreference?: "English" | "Bangla";
}

export const CodeLearningEnvironment: React.FC<CodeLearningEnvironmentProps> = ({
  course,
  currentClass,
  userProgressMap,
  onUpdateProgress,
  languagePreference = "English"
}) => {
  // 1. Language & State
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(() => {
    if (course?.name.includes("Python")) return "Python";
    if (course?.name.includes("JavaScript")) return "JavaScript";
    if (course?.name.includes("TypeScript")) return "TypeScript";
    if (course?.name.includes("Java")) return "Java";
    if (course?.name.includes("C++")) return "C++";
    if (course?.name.includes("C#")) return "C#";
    if (course?.name.includes("Kotlin")) return "Kotlin";
    if (course?.name.includes("Swift")) return "Swift";
    if (course?.name.includes("Dart")) return "Dart";
    if (course?.name.includes("PHP")) return "PHP";
    if (course?.name.includes("Go")) return "Go";
    if (course?.name.includes("Rust")) return "Rust";
    return "Python";
  });

  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // 2. Main Studio View Tabs: 'editor' | 'practice' | 'projects' | 'cheatsheet'
  const [studioTab, setStudioTab] = useState<"editor" | "practice" | "projects" | "cheatsheet">("editor");

  // 3. Beginner Friendly Mode
  const [beginnerMode, setBeginnerMode] = useState<boolean>(true);

  // 4. Code Editor Content & Line States
  const [codeContent, setCodeContent] = useState<string>(langMeta.starterTemplate);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // When language changes, load starter template if current code matches previous default template
  useEffect(() => {
    setCodeContent(langMeta.starterTemplate);
  }, [selectedLanguage]);

  // 5. Execution Simulator & Terminal State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string | null>(null);

  // 6. AI Code Teacher Feedback & Question State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [aiActiveTab, setAiActiveTab] = useState<"explanation" | "linebyline" | "syntax" | "chat">("explanation");

  // 7. Practice System State
  const [activeExercise, setActiveExercise] = useState<CodingExercise | null>(
    DEFAULT_CODING_EXERCISES.find((ex) => ex.language === selectedLanguage) || DEFAULT_CODING_EXERCISES[0]
  );
  const [showExampleSolution, setShowExampleSolution] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // 8. Projects State
  const [projectFilter, setProjectFilter] = useState<"All" | "Mini Project" | "Final Project" | "Portfolio Project">("All");

  // ----------------------------------------------------
  // HANDLERS & SIMULATORS
  // ----------------------------------------------------

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetCode = () => {
    setCodeContent(langMeta.starterTemplate);
    setTerminalLogs(null);
    setAiExplanation(null);
  };

  // Run Code Execution Simulator
  const handleRunCodeSimulator = () => {
    setIsRunning(true);
    setTerminalLogs("Compiling and initializing runtime execution environment...");

    setTimeout(() => {
      setIsRunning(false);
      let output = "";

      // Smart mock runtime simulation based on language
      if (selectedLanguage === "Python") {
        output = `[Python 3.11 Runtime Output]\nStudent Level: Master Learner\nTotal XP Score: 225\nExecution finished in 0.042s (exit code 0)`;
      } else if (selectedLanguage === "JavaScript") {
        output = `[Node.js v20.11 Output]\nStudent Name: Rahim Ahmed\nAverage Score: 86.3\nStatus: Passed with Honors\nProcess terminated with status 0`;
      } else if (selectedLanguage === "TypeScript") {
        output = `[tsc Compilation Success]\nCourse Completion: 50%\nProcess exited with status code 0`;
      } else if (selectedLanguage === "Java") {
        output = `[JVM Java 21 Execution Output]\nCourse: Java Enterprise Masterclass | Completed: 15 classes\nExecution completed in 0.081s`;
      } else if (selectedLanguage === "C++") {
        output = `[g++ C++20 Compiled Output]\nStudent: Sumiya Akter\nAverage Score: 89.25\nProgram executed successfully (exit code 0)`;
      } else {
        output = `[${selectedLanguage} Environment Output]\nCode executed successfully without errors!\nConsole Output Generated cleanly.`;
      }

      setTerminalLogs(output);
    }, 900);
  };

  // Call AI Code Teacher API
  const handleCallCodeTeacher = async (
    action: "explain" | "debug" | "beginner_breakdown" | "refactor" | "hint" | "evaluate_submission",
    customQuestion?: string
  ) => {
    setAiLoading(true);
    setAiActiveTab("explanation");

    try {
      const response = await fetch("/api/learning/code-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeContent,
          language: selectedLanguage,
          action,
          courseName: course?.name,
          classTitle: currentClass?.title,
          topic: currentClass?.topic || activeExercise?.topic,
          exerciseDescription: activeExercise?.description,
          beginnerMode,
          userQuestion: customQuestion || userQuestion,
          langPreference: languagePreference
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiExplanation(data.explanation);
        if (action === "evaluate_submission") {
          setEvaluationResult(data.explanation);
          if (onUpdateProgress && course && currentClass) {
            onUpdateProgress(course.id, currentClass.id, "practice");
          }
        }
      } else {
        setAiExplanation("Error communicating with AI Code Teacher. Please try again.");
      }
    } catch (err: any) {
      console.error("Code Teacher API error:", err);
      setAiExplanation("Failed to connect to AI Code Teacher server.");
    } finally {
      setAiLoading(false);
      setUserQuestion("");
    }
  };

  const handleLoadExercise = (exercise: CodingExercise) => {
    setActiveExercise(exercise);
    setSelectedLanguage(exercise.language);
    setCodeContent(exercise.starterCode);
    setStudioTab("editor");
    setAiExplanation(null);
    setEvaluationResult(null);
  };

  const handleLoadProject = (proj: PracticeProject) => {
    setSelectedLanguage(proj.language);
    setCodeContent(proj.starterCode);
    setStudioTab("editor");
    setAiExplanation(
      `### 🚀 Project Started: ${proj.title} (${proj.type})\n\n` +
        `**Language:** ${proj.language}\n` +
        `**Specifications:**\n` +
        proj.specifications.map((s) => `- ${s}`).join("\n") +
        `\n\nWrite your implementation in the editor on the left, run the simulator, and ask AI Code Teacher when you need help!`
    );
  };

  // Line count for custom editor line numbers
  const lineNumbers = codeContent.split("\n").map((_, i) => i + 1);

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* HEADER BAR & CONNECTION BADGE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          
          {/* Main Title & Connection */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400">
                <Code2 className="w-3.5 h-3.5" /> JOXIQ AI Programming Environment
              </span>
              
              {/* Current Course Connection Badge */}
              {course ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected: {course.name}
                  {currentClass && ` • Class #${currentClass.classNumber}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-400">
                  <Cpu className="w-3.5 h-3.5" /> Standalone Programming Studio
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>AI Interactive Code Teacher & Practice Studio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Write, edit, and master 12 programming languages with step-by-step AI line explanations, error debugging, exercises, and real-world project builds.
            </p>
          </div>

          {/* Beginner Mode Toggle */}
          <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl ${beginnerMode ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"}`}>
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-extrabold text-white flex items-center gap-1">
                  <span>Beginner Mode</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${beginnerMode ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                    {beginnerMode ? "ON" : "OFF"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Line-by-line breakdown & hints</p>
              </div>
            </div>

            <button
              onClick={() => setBeginnerMode(!beginnerMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                beginnerMode ? "bg-amber-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  beginnerMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

        </div>

        {/* 12 SUPPORTED LANGUAGES SELECTOR SCROLL BAR */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Select Programming Language ({SUPPORTED_LANGUAGES.length}):</span>
            <span className="text-[11px] text-blue-400 font-normal">Active: {langMeta.name} ({langMeta.category})</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-105"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{lang.icon}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN STUDIO SUB-TABS */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setStudioTab("editor")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
              studioTab === "editor"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Code Studio & AI Teacher</span>
          </button>

          <button
            onClick={() => setStudioTab("practice")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
              studioTab === "practice"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Class Exercises & Challenges</span>
          </button>

          <button
            onClick={() => setStudioTab("projects")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
              studioTab === "projects"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
            <span>Projects Practice (Mini / Final / Portfolio)</span>
          </button>

          <button
            onClick={() => setStudioTab("cheatsheet")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
              studioTab === "cheatsheet"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-md"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedLanguage} Syntax Cheat Sheet</span>
          </button>
        </div>

      </div>

      {/* ----------------------------------------------------
          TAB 1: INTERACTIVE CODE STUDIO & AI TEACHER
      ---------------------------------------------------- */}
      {studioTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLS: INTERACTIVE CODE EDITOR & TERMINAL */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Editor Window Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
              
              {/* Editor Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 ml-2 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>main{langMeta.extension}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer text-xs flex items-center gap-1"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleResetCode}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all cursor-pointer text-xs flex items-center gap-1"
                    title="Reset to Starter Template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Code Textarea with Line Numbers */}
              <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex min-h-[360px] max-h-[500px]">
                
                {/* Line Numbers Column */}
                <div className="bg-slate-900/60 text-slate-600 p-3 select-none text-right font-mono text-xs space-y-0.5 border-r border-slate-800/80 w-10 shrink-0">
                  {lineNumbers.map((num) => (
                    <div key={num}>{num}</div>
                  ))}
                </div>

                {/* Editable Code Box */}
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  spellCheck={false}
                  placeholder={`Write your ${selectedLanguage} code here...`}
                  className="w-full p-3 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-y min-h-[360px]"
                />
              </div>

              {/* AI TEACHER ACTIONS TOOLBAR */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-blue-400" /> AI Code Teacher Actions:
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRunCodeSimulator}
                    disabled={isRunning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunning ? "Compiling..." : "Run Simulator"}</span>
                  </button>

                  <button
                    onClick={() => handleCallCodeTeacher("beginner_breakdown")}
                    disabled={aiLoading}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain Line-by-Line</span>
                  </button>

                  <button
                    onClick={() => handleCallCodeTeacher("debug")}
                    disabled={aiLoading}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Find & Fix Errors</span>
                  </button>

                  <button
                    onClick={() => handleCallCodeTeacher("refactor")}
                    disabled={aiLoading}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Suggest Improvements</span>
                  </button>

                  <button
                    onClick={() => handleCallCodeTeacher("hint")}
                    disabled={aiLoading}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Get Hint</span>
                  </button>
                </div>
              </div>

              {/* TERMINAL CONSOLE OUTPUT */}
              {terminalLogs && (
                <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-900 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Console Terminal Output
                    </span>
                    <button onClick={() => setTerminalLogs(null)} className="text-slate-500 hover:text-white cursor-pointer">
                      Clear
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed">{terminalLogs}</pre>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT 5 COLS: AI CODE TEACHER DISPLAY PANEL */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden min-h-[500px] flex flex-col">
              
              {/* Teacher Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>AI Code Teacher ({selectedLanguage})</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-slate-400">Step-by-step guidance & debugging</p>
                  </div>
                </div>

                {beginnerMode && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md font-bold border border-amber-500/20">
                    Beginner Mode Active
                  </span>
                )}
              </div>

              {/* AI Output Content / Loading */}
              <div className="flex-1 space-y-4">
                {aiLoading ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-bold">
                      {languagePreference === "Bangla" ? "AI শিক্ষকের মতামত তৈরি করা হচ্ছে..." : "AI Code Teacher is analyzing your code..."}
                    </p>
                    <p className="text-[11px] text-slate-400">Checking syntax, logic, and beginner concepts...</p>
                  </div>
                ) : aiExplanation ? (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 text-xs sm:text-sm text-slate-200 leading-relaxed prose prose-invert max-w-none max-h-[460px] overflow-y-auto">
                    <Markdown>{aiExplanation}</Markdown>
                  </div>
                ) : (
                  <div className="py-12 px-4 text-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                    <BrainCircuit className="w-10 h-10 text-blue-400 mx-auto opacity-80" />
                    <h4 className="text-xs font-bold text-white">Ask AI Code Teacher Anything</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Click <strong className="text-blue-400">Explain Line-by-Line</strong> or <strong className="text-rose-400">Find Errors</strong>, or ask a question below.
                    </p>
                  </div>
                )}
              </div>

              {/* STUDENT QUESTION PROMPT INPUT BOX */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
                  <span>Ask AI Code Teacher about this code:</span>
                  <span>{languagePreference === "Bangla" ? "বাংলা/English" : "English/Bangla"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCallCodeTeacher("explain", userQuestion)}
                    placeholder="e.g. Why did we define this function? / Explain line 3..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleCallCodeTeacher("explain", userQuestion)}
                    disabled={aiLoading || !userQuestion.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: CLASS EXERCISES & CHALLENGES
      ---------------------------------------------------- */}
      {studioTab === "practice" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Programming Practice Challenges ({selectedLanguage})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Solve real coding challenges, test your logic, and get instant AI teacher evaluation scores.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Language:</span>
                <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{langMeta.icon}</span>
                  <span>{langMeta.name}</span>
                </span>
              </div>
            </div>

            {/* Exercise Details Card */}
            {activeExercise ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5">
                
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {activeExercise.difficulty} Level
                    </span>
                    <h3 className="text-base font-black text-white">{activeExercise.title}</h3>
                    <p className="text-xs text-slate-400">Topic: {activeExercise.topic}</p>
                  </div>

                  <button
                    onClick={() => handleLoadExercise(activeExercise)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Load Code into Studio Editor</span>
                  </button>
                </div>

                {/* Description & Objective */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Exercise Task:</h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    {activeExercise.description}
                  </p>
                </div>

                {/* Hints Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Teacher Guidance Hints:
                  </h4>
                  <ul className="space-y-1.5">
                    {activeExercise.hints.map((h, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Example Solution Preview Toggle */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <button
                    onClick={() => setShowExampleSolution(!showExampleSolution)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showExampleSolution ? "rotate-180" : ""}`} />
                    <span>{showExampleSolution ? "Hide Example Solution" : "Show Example Solution Code"}</span>
                  </button>

                  {showExampleSolution && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                      <pre className="whitespace-pre-wrap">{activeExercise.exampleSolution}</pre>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleCallCodeTeacher("evaluate_submission")}
                    disabled={aiLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Award className="w-4 h-4" />
                    <span>Submit Solution for AI Teacher Evaluation</span>
                  </button>
                </div>

                {/* Evaluation Result */}
                {evaluationResult && (
                  <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AI Teacher Evaluation Feedback:</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed prose prose-invert max-w-none">
                      <Markdown>{evaluationResult}</Markdown>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <p className="text-xs text-slate-400">No exercise configured for this language selection.</p>
            )}

          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: PROJECTS PRACTICE (MINI / FINAL / PORTFOLIO)
      ---------------------------------------------------- */}
      {studioTab === "projects" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-emerald-400" />
                  <span>Real-World Practice Projects</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Build mini projects, capstone final projects, and showcase-ready portfolio applications.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                {(["All", "Mini Project", "Final Project", "Portfolio Project"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setProjectFilter(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      projectFilter === type
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_PRACTICE_PROJECTS.filter((p) => projectFilter === "All" || p.type === projectFilter).map((proj) => (
                <div key={proj.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                        proj.type === "Mini Project"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : proj.type === "Final Project"
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {proj.type}
                      </span>

                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <span>{proj.language}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white">{proj.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Key Specifications:</span>
                      <ul className="space-y-1">
                        {proj.specifications.map((spec, idx) => (
                          <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleLoadProject(proj)}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Start Project in Studio</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: LANGUAGE SYNTAX CHEAT SHEET & EXAMPLES
      ---------------------------------------------------- */}
      {studioTab === "cheatsheet" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>{selectedLanguage} Syntax & Concepts Cheat Sheet</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Beginner-friendly overview of core keywords, structure, and syntax.
                </p>
              </div>

              <span className="text-2xl">{langMeta.icon}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {langMeta.syntaxHighlights.map((syn, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-white">{syn.title}</h3>
                    <button
                      onClick={() => {
                        setCodeContent(syn.snippet);
                        setStudioTab("editor");
                      }}
                      className="text-[10px] text-blue-400 hover:underline font-bold cursor-pointer"
                    >
                      Try in Editor
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{syn.description}</p>

                  <div className="bg-black p-3 rounded-xl font-mono text-xs text-slate-200 border border-slate-900">
                    <pre className="whitespace-pre-wrap">{syn.snippet}</pre>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
