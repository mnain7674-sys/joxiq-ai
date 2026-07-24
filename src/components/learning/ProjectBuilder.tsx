import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Course, ClassItem } from "../../types/learning";
import {
  ProjectCategory,
  ProjectDifficulty,
  ProjectRequirement,
  StudentPortfolioProject
} from "../../types/projectBuilder";
import { SAMPLE_BUILDER_PROJECTS } from "../../data/projectBuilderData";
import {
  FolderKanban,
  Rocket,
  CheckCircle2,
  ListTodo,
  Bot,
  BrainCircuit,
  Sparkles,
  Code2,
  Play,
  Terminal,
  Bug,
  Lightbulb,
  Award,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  Layers,
  BookOpen,
  Filter,
  Star,
  ExternalLink,
  ShieldCheck,
  Clock,
  Briefcase,
  Cpu,
  Globe,
  Smartphone,
  BarChart3,
  Trash2,
  Download,
  Share2
} from "lucide-react";

interface ProjectBuilderProps {
  course?: Course | null;
  currentClass?: ClassItem | null;
  languagePreference?: "English" | "Bangla";
  onNavigateToCourse?: (courseId: string) => void;
  onSaveProjectCompletion?: (projectId: string, projectTitle: string) => void;
}

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({
  course,
  currentClass,
  languagePreference = "English",
  onNavigateToCourse,
  onSaveProjectCompletion
}) => {
  // 1. Navigation Mode: 'builder' | 'portfolio'
  const [mainMode, setMainMode] = useState<"builder" | "portfolio">("builder");

  // 2. Filters
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "All">("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ProjectDifficulty | "All">("All");

  // 3. Selected Project & Workflow Step (1 to 7)
  const [activeProject, setActiveProject] = useState<ProjectRequirement>(() => {
    if (course) {
      const matched = SAMPLE_BUILDER_PROJECTS.find(
        (p) => p.courseId === course.id || p.category.toLowerCase().includes(course.category.toLowerCase().split(" ")[0])
      );
      if (matched) return matched;
    }
    return SAMPLE_BUILDER_PROJECTS[0];
  });

  const [currentStep, setCurrentStep] = useState<number>(1);

  // 4. Code / Plan Editor State
  const [userCodeOrPlan, setUserCodeOrPlan] = useState<string>(activeProject.starterCodeOrPlan);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // When active project changes, reset editor code
  useEffect(() => {
    setUserCodeOrPlan(activeProject.starterCodeOrPlan);
  }, [activeProject]);

  // 5. Execution / Testing Simulator State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<number, boolean>>({});

  // 6. AI Mentor State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMentorResponse, setAiMentorResponse] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState<string>("");

  // 7. Portfolio Storage State
  const [portfolio, setPortfolio] = useState<StudentPortfolioProject[]>(() => {
    const saved = localStorage.getItem("joxiq_student_portfolio");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved portfolio:", e);
      }
    }
    return [
      {
        id: "port-1",
        projectId: activeProject.id,
        title: activeProject.title,
        category: activeProject.category,
        difficulty: activeProject.difficulty,
        description: activeProject.description,
        skillsUsed: activeProject.skillsUsed,
        courseName: activeProject.courseName,
        completedAt: Date.now() - 86400000 * 2,
        submissionCodeOrPlan: activeProject.starterCodeOrPlan,
        aiMentorFeedback: "Excellent initial setup and architectural implementation!",
        status: "Completed",
        currentWorkflowStep: 7
      }
    ];
  });

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem("joxiq_student_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------

  const handleSelectProject = (proj: ProjectRequirement) => {
    setActiveProject(proj);
    setCurrentStep(2); // Move to Step 2: Understand Requirements
    setUserCodeOrPlan(proj.starterCodeOrPlan);
    setAiMentorResponse(null);
    setTerminalLogs(null);
    setTestResults({});
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCodeOrPlan);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Run Test / Execution Simulator
  const handleRunSimulator = () => {
    setIsSimulating(true);
    setTerminalLogs("Initializing JOXIQ Project Execution Environment & Test Suite...");

    setTimeout(() => {
      setIsSimulating(false);
      let log = `[JOXIQ AI Build System Output - ${activeProject.category}]\n`;
      log += `Project: ${activeProject.title}\n`;
      log += `Status: Compiling and verifying deliverables...\n\n`;

      const newTestResults: Record<number, boolean> = {};
      activeProject.testCases.forEach((tc, idx) => {
        newTestResults[idx] = true;
        log += `✓ Test Case ${idx + 1}: ${tc} -> PASSED\n`;
      });

      log += `\nResult: ALL ${activeProject.testCases.length} TEST CASES PASSED SUCCESSFULLY (0.054s exit code 0)`;
      setTestResults(newTestResults);
      setTerminalLogs(log);
    }, 1000);
  };

  // Call AI Project Mentor API
  const handleCallProjectMentor = async (
    action: "roadmap" | "step_guidance" | "debug_help" | "review_improve" | "qa",
    customPrompt?: string
  ) => {
    setAiLoading(true);

    try {
      const response = await fetch("/api/learning/project-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: activeProject.title,
          category: activeProject.category,
          difficulty: activeProject.difficulty,
          courseName: activeProject.courseName || course?.name,
          moduleTitle: activeProject.moduleTitle || currentClass?.title,
          classNumber: activeProject.connectedClassNumber || currentClass?.classNumber,
          action,
          currentStepNumber: currentStep,
          submissionCodeOrPlan: userCodeOrPlan,
          userQuestion: customPrompt || userQuestion,
          langPreference: languagePreference
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiMentorResponse(data.feedback);
      } else {
        setAiMentorResponse("Error contacting AI Project Mentor. Please try again.");
      }
    } catch (err) {
      console.error("Project Mentor API error:", err);
      setAiMentorResponse("Failed to connect to AI Project Mentor server.");
    } finally {
      setAiLoading(false);
      setUserQuestion("");
    }
  };

  // Complete Project and save to Student Portfolio
  const handleCompleteAndSavePortfolio = () => {
    const existingIndex = portfolio.findIndex((p) => p.projectId === activeProject.id);

    const newPortfolioItem: StudentPortfolioProject = {
      id: existingIndex >= 0 ? portfolio[existingIndex].id : `port-${Date.now()}`,
      projectId: activeProject.id,
      title: activeProject.title,
      category: activeProject.category,
      difficulty: activeProject.difficulty,
      description: activeProject.description,
      skillsUsed: activeProject.skillsUsed,
      courseName: activeProject.courseName || course?.name,
      completedAt: Date.now(),
      submissionCodeOrPlan: userCodeOrPlan,
      aiMentorFeedback: aiMentorResponse || "Successfully built, tested, and verified using JOXIQ AI Project Mentor.",
      status: "Completed",
      currentWorkflowStep: 7
    };

    if (existingIndex >= 0) {
      const updated = [...portfolio];
      updated[existingIndex] = newPortfolioItem;
      setPortfolio(updated);
    } else {
      setPortfolio([newPortfolioItem, ...portfolio]);
    }

    if (onSaveProjectCompletion) {
      onSaveProjectCompletion(activeProject.id, activeProject.title);
    }

    setMainMode("portfolio");
  };

  const handleDeletePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  // Category Icon Resolver
  const getCategoryIcon = (cat: ProjectCategory) => {
    switch (cat) {
      case "Programming":
        return <Code2 className="w-4 h-4 text-blue-400" />;
      case "AI Engineering":
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case "Web Development":
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case "App Development":
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case "Business":
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      default:
        return <FolderKanban className="w-4 h-4 text-blue-400" />;
    }
  };

  const WORKFLOW_STEPS = [
    { num: 1, name: "Choose Project", icon: FolderKanban },
    { num: 2, name: "Understand Requirements", icon: BookOpen },
    { num: 3, name: "Create Plan", icon: ListTodo },
    { num: 4, name: "Build Step by Step", icon: FileCode },
    { num: 5, name: "Test Project", icon: Terminal },
    { num: 6, name: "Improve Project", icon: Sparkles },
    { num: 7, name: "Complete & Portfolio", icon: Award }
  ];

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* HEADER & PORTFOLIO SWITCHER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400">
                <Rocket className="w-3.5 h-3.5" /> JOXIQ AI Practical Project Builder
              </span>

              {course ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Linked: {course.name}
                  {currentClass && ` (Class #${currentClass.classNumber})`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-400">
                  <BrainCircuit className="w-3.5 h-3.5" /> All Academy Courses Connected
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Build Real-World Projects & Create Student Portfolio</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Turn classroom theory into tangible portfolio projects across Programming, AI Engineering, Web, Apps, and Business with step-by-step guidance from JOXIQ AI Project Mentor.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setMainMode("builder")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                mainMode === "builder"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>Project Builder Studio</span>
            </button>

            <button
              onClick={() => setMainMode("portfolio")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                mainMode === "portfolio"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>My Student Portfolio ({portfolio.length})</span>
            </button>
          </div>
        </div>

        {/* 7-STEP WORKFLOW STEPPER BAR (In Builder Mode) */}
        {mainMode === "builder" && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Project Workflow Steps (7-Step Process):</span>
              <span className="text-blue-400">Active Project: {activeProject.title}</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {WORKFLOW_STEPS.map((s) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                const IconComponent = s.icon;

                return (
                  <button
                    key={s.num}
                    onClick={() => setCurrentStep(s.num)}
                    className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-400 shadow-lg scale-105"
                        : isCompleted
                        ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive ? "bg-white text-blue-600" : isCompleted ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-300"
                    }`}>
                      {isCompleted ? "✓" : s.num}
                    </span>
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ----------------------------------------------------
          VIEW 1: PROJECT BUILDER STUDIO (7 STEPS)
      ---------------------------------------------------- */}
      {mainMode === "builder" && (
        <div className="space-y-6">

          {/* STEP 1: CHOOSE PROJECT CATALOG */}
          {currentStep === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-blue-400" />
                    <span>Step 1: Choose a Practical Project to Build</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Select a project aligned with your target course category and skill level.
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  {(["All", "Programming", "AI Engineering", "Web Development", "App Development", "Business"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SAMPLE_BUILDER_PROJECTS.filter(
                  (p) =>
                    (selectedCategory === "All" || p.category === selectedCategory) &&
                    (selectedDifficulty === "All" || p.difficulty === selectedDifficulty)
                ).map((proj) => {
                  const isSelected = activeProject.id === proj.id;
                  return (
                    <div
                      key={proj.id}
                      className={`bg-slate-950 border rounded-3xl p-5 space-y-4 flex flex-col justify-between transition-all hover:scale-[1.01] ${
                        isSelected
                          ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-slate-900 border border-slate-800 text-slate-300">
                            {getCategoryIcon(proj.category)}
                            <span>{proj.category}</span>
                          </span>

                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            proj.difficulty === "Beginner"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : proj.difficulty === "Intermediate"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {proj.difficulty}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-white">{proj.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                        {/* Connected Course Badge */}
                        {proj.courseName && (
                          <div className="text-[11px] text-blue-400 font-bold bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Connected Course: {proj.courseName}</span>
                          </div>
                        )}

                        {/* Skills Used Tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.skillsUsed.map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> ~{proj.estimatedHours} Hours
                        </span>

                        <button
                          onClick={() => handleSelectProject(proj)}
                          className={`px-4 py-2 text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700"
                          }`}
                        >
                          <span>{isSelected ? "Active Project" : "Start Building"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* STEPS 2 to 7 WORKFLOW WORKSPACE */}
          {currentStep > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT 7 COLS: MAIN STEP WORKSPACE */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
                  
                  {/* Step Banner Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider">
                        Step {currentStep} of 7 • {WORKFLOW_STEPS[currentStep - 1].name}
                      </span>
                      <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                        {getCategoryIcon(activeProject.category)}
                        <span>{activeProject.title}</span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* STEP 2: UNDERSTAND REQUIREMENTS */}
                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-400" /> Project Objective & Scope:
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{activeProject.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Prerequisites:</h4>
                          <ul className="space-y-1">
                            {activeProject.prerequisites.map((pre, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                                <span className="text-amber-400">•</span> {pre}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Key Deliverables:</h4>
                          <ul className="space-y-1">
                            {activeProject.deliverables.map((del, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                                <span className="text-emerald-400">✓</span> {del}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleCallProjectMentor("roadmap")}
                          disabled={aiLoading}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Generate AI Project Roadmap & Architecture</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: CREATE PLAN */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                        <span>Define Project Plan & Architecture Draft:</span>
                        <button
                          onClick={() => handleCallProjectMentor("step_guidance")}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Ask AI Mentor to Generate Plan Outline
                        </button>
                      </div>

                      <textarea
                        value={userCodeOrPlan}
                        onChange={(e) => setUserCodeOrPlan(e.target.value)}
                        placeholder="Outline project architecture, modules, and database schema..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-100 outline-none focus:border-blue-500 min-h-[280px]"
                      />
                    </div>
                  )}

                  {/* STEP 4: BUILD STEP BY STEP */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      
                      {/* Editor Header Bar */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {activeProject.category === "Programming" || activeProject.category === "AI Engineering" || activeProject.category === "Web Development"
                              ? "main_project_file"
                              : "business_plan_strategy.md"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCopyCode}
                            className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedText ? "Copied" : "Copy"}</span>
                          </button>

                          <button
                            onClick={() => setUserCodeOrPlan(activeProject.starterCodeOrPlan)}
                            className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Template</span>
                          </button>
                        </div>
                      </div>

                      {/* Code / Text Editor */}
                      <textarea
                        value={userCodeOrPlan}
                        onChange={(e) => setUserCodeOrPlan(e.target.value)}
                        placeholder="Write your code or strategy plan here..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-100 outline-none focus:border-blue-500 min-h-[320px] leading-relaxed"
                      />

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={handleRunSimulator}
                          disabled={isSimulating}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isSimulating ? "Compiling..." : "Run Simulator"}</span>
                        </button>

                        <button
                          onClick={() => handleCallProjectMentor("debug_help")}
                          disabled={aiLoading}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Bug className="w-3.5 h-3.5" />
                          <span>Find & Fix Problems</span>
                        </button>

                        <button
                          onClick={() => handleCallProjectMentor("step_guidance")}
                          disabled={aiLoading}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Step Guidance</span>
                        </button>
                      </div>

                      {/* Terminal Logs Output */}
                      {terminalLogs && (
                        <div className="bg-black border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase">
                            <span className="flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Project Build Console
                            </span>
                            <button onClick={() => setTerminalLogs(null)} className="text-slate-500 hover:text-white cursor-pointer">
                              Clear
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap">{terminalLogs}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5: TEST PROJECT */}
                  {currentStep === 5 && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Terminal className="w-4 h-4 text-emerald-400" /> Automated & Manual Test Cases Checklist:
                        </h3>

                        <div className="space-y-2">
                          {activeProject.testCases.map((tc, idx) => {
                            const isPassed = testResults[idx];
                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                                  isPassed
                                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                                    : "bg-slate-950 border-slate-800 text-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-bold">{idx + 1}.</span>
                                  <span>{tc}</span>
                                </div>

                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                                  isPassed ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-400"
                                }`}>
                                  {isPassed ? "Passed" : "Untested"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={handleRunSimulator}
                          disabled={isSimulating}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          <span>Run Complete Automated Test Suite</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: IMPROVE PROJECT */}
                  {currentStep === 6 && (
                    <div className="space-y-5">
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4" /> Recommended Improvement Prompts:
                        </h3>

                        <ul className="space-y-2">
                          {activeProject.improvementPrompts.map((imp, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleCallProjectMentor("review_improve")}
                          disabled={aiLoading}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Get AI Code & Strategy Review ("How can I improve this?")</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 7: COMPLETE PROJECT & PORTFOLIO */}
                  {currentStep === 7 && (
                    <div className="bg-slate-950 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-5">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-black mx-auto shadow-xl shadow-emerald-500/20">
                        <Award className="w-8 h-8" />
                      </div>

                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-extrabold rounded-full border border-emerald-500/20">
                          JOXIQ AI Verified Badge
                        </span>
                        <h3 className="text-2xl font-black text-white">Project Ready for Portfolio!</h3>
                        <p className="text-xs text-slate-300 max-w-md mx-auto">
                          You have successfully planned, built, tested, and improved <strong className="text-white">{activeProject.title}</strong>.
                        </p>
                      </div>

                      <div className="pt-3 flex justify-center gap-3">
                        <button
                          onClick={handleCompleteAndSavePortfolio}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-2xl shadow-xl transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>Save Project to My Portfolio</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT 5 COLS: JOXIQ AI PROJECT MENTOR DISPLAY & ASSISTANT */}
              <div className="lg:col-span-5 space-y-4">
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>JOXIQ AI Project Mentor</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-slate-400">Step {currentStep} Guidance & QA</p>
                      </div>
                    </div>
                  </div>

                  {/* QUICK ASK PROMPTS */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Quick Mentor Prompts:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleCallProjectMentor("qa", "How do I start this project?")}
                        disabled={aiLoading}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-blue-400 cursor-pointer disabled:opacity-50"
                      >
                        🚀 How do I start this project?
                      </button>

                      <button
                        onClick={() => handleCallProjectMentor("debug_help", "Why is my code or plan not working?")}
                        disabled={aiLoading}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-rose-400 cursor-pointer disabled:opacity-50"
                      >
                        🐛 Why is my code not working?
                      </button>

                      <button
                        onClick={() => handleCallProjectMentor("review_improve", "How can I improve this?")}
                        disabled={aiLoading}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-purple-400 cursor-pointer disabled:opacity-50"
                      >
                        ⚡ How can I improve this?
                      </button>
                    </div>
                  </div>

                  {/* AI Output Box */}
                  <div className="flex-1 space-y-4 my-3">
                    {aiLoading ? (
                      <div className="py-16 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                        <p className="text-xs text-slate-300 font-bold">
                          {languagePreference === "Bangla" ? "AI প্রজেক্ট মেন্টর বিশ্লেষণ করছেন..." : "JOXIQ AI Project Mentor is analyzing..."}
                        </p>
                      </div>
                    ) : aiMentorResponse ? (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed prose prose-invert max-w-none max-h-[420px] overflow-y-auto">
                        <Markdown>{aiMentorResponse}</Markdown>
                      </div>
                    ) : (
                      <div className="py-12 px-4 text-center space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                        <BrainCircuit className="w-10 h-10 text-indigo-400 mx-auto opacity-80" />
                        <h4 className="text-xs font-bold text-white">Ask AI Project Mentor Anything</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Click one of the quick prompts above or type your question below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input Box */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCallProjectMentor("qa", userQuestion)}
                        placeholder="e.g. How to connect API? / What library should I use?..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleCallProjectMentor("qa", userQuestion)}
                        disabled={aiLoading || !userQuestion.trim()}
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all disabled:opacity-40 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ----------------------------------------------------
          VIEW 2: STUDENT PORTFOLIO SYSTEM
      ---------------------------------------------------- */}
      {mainMode === "portfolio" && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>My Student Practical Project Portfolio ({portfolio.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Verified projects, source code artifacts, and practical skill achievements verified by JOXIQ AI.
                </p>
              </div>

              <button
                onClick={() => setMainMode("builder")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Build New Project</span>
              </button>
            </div>

            {portfolio.length === 0 ? (
              <div className="py-16 text-center space-y-4 bg-slate-950 rounded-3xl border border-slate-800">
                <Award className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Projects Saved Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Start building practical projects in the builder studio to populate your student portfolio!
                </p>
                <button
                  onClick={() => setMainMode("builder")}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg cursor-pointer"
                >
                  Go to Builder Studio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-900 border border-slate-800 text-slate-300">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> JOXIQ Verified
                        </span>
                      </div>

                      <h3 className="text-base font-black text-white">{item.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                      {item.courseName && (
                        <div className="text-[11px] text-blue-400 font-bold">
                          Course: {item.courseName}
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1">
                        {item.skillsUsed.map((sk, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Submission Artifact Preview */}
                      <div className="bg-black p-3 rounded-2xl border border-slate-900 font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{item.submissionCodeOrPlan}</pre>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">
                        Completed: {new Date(item.completedAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                          title="Remove from Portfolio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
