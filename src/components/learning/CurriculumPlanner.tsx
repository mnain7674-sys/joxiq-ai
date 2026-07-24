import React, { useState } from "react";
import { Course, CourseCategory, CourseModule, ClassItem } from "../../types/learning";
import { CATEGORIES } from "../../data/learningData";
import {
  BrainCircuit,
  Sparkles,
  BookOpen,
  Target,
  Layers,
  CheckCircle2,
  HelpCircle,
  Code2,
  Briefcase,
  ChevronRight,
  Play,
  Zap,
  GraduationCap,
  Award,
  Lightbulb,
  Search,
  Wand2,
  ArrowRight,
  ShieldAlert,
  ListOrdered
} from "lucide-react";

interface CurriculumPlannerProps {
  courses: Course[];
  onSelectCourseToStart: (course: Course) => void;
  onSelectSpecificClass?: (course: Course, moduleItem: CourseModule, classItem: ClassItem) => void;
}

export const CurriculumPlanner: React.FC<CurriculumPlannerProps> = ({
  courses,
  onSelectCourseToStart,
  onSelectSpecificClass
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "All">("All");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<"All" | "Beginner" | "Intermediate" | "Advanced" | "Extra">("All");

  // Custom AI Curriculum Generator modal/prompt states
  const [customTopicInput, setCustomTopicInput] = useState<string>("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [customGeneratedCourse, setCustomGeneratedCourse] = useState<Course | null>(null);

  // Active inspecting class state
  const [inspectingClass, setInspectingClass] = useState<ClassItem | null>(null);

  // Filtered courses based on category selection
  const filteredCourses = courses.filter((c) =>
    selectedCategory === "All" ? true : c.category === selectedCategory
  );

  // Active course object (either custom generated or from catalog)
  const activeCourse = customGeneratedCourse
    ? customGeneratedCourse
    : courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Modules filtered by level
  const displayModules = (activeCourse?.modules || []).filter((mod) =>
    selectedLevelFilter === "All" ? true : mod.level === selectedLevelFilter
  );

  // Generate custom curriculum handler
  const handleGenerateCustomCurriculum = () => {
    if (!customTopicInput.trim()) return;
    setIsGeneratingCustom(true);

    setTimeout(() => {
      const topicName = customTopicInput.trim();
      const mockCustomCourse: Course = {
        id: `custom-curr-${Date.now()}`,
        name: `AI Planned Curriculum: ${topicName}`,
        category: "AI Engineering",
        courseGoal: `Master ${topicName} through a structured 100-class progression from basic fundamentals to enterprise applications.`,
        shortDescription: `Comprehensive, intentionally designed roadmap for ${topicName}.`,
        fullDescription: `This course has been custom planned by JOXIQ AI Engine. It covers prerequisites, 4-tier module breakdowns, practical challenges, and capstone projects for ${topicName}.`,
        requiredLevel: "All Levels",
        targetStudentLevel: "Beginner to Enterprise",
        requiredSkills: [
          "Basic logical reasoning & computer access",
          `Core interest in learning ${topicName}`,
          "Commitment to completing hands-on exercises"
        ],
        learningOutcomes: [
          `Architect and deploy ${topicName} solutions from scratch`,
          `Solve real-world industry problems using ${topicName}`,
          `Master advanced edge-cases, optimization, and debugging`,
          `Build a portfolio-ready capstone project in ${topicName}`
        ],
        curriculumRoadmap: {
          beginnerGoals: [`${topicName} Fundamentals & Setup`, "Syntax & Core Structures", "Basic Problem Solving"],
          intermediateGoals: [`Intermediate ${topicName} Patterns`, "Real-World Projects", "Async & State Design"],
          advancedGoals: [`Enterprise ${topicName} Architecture`, "Performance Tuning", "Security & Scaling"],
          extraCareerGoals: [`${topicName} Portfolio Capstone`, "Technical Interview Prep", "Industry Secrets"]
        },
        icon: "BrainCircuit",
        gradientColor: "from-purple-600 to-pink-600",
        rating: 4.98,
        enrolledCount: 1,
        estimatedHours: 42,
        totalClasses: 100,
        modules: activeCourse?.modules || []
      };

      setCustomGeneratedCourse(mockCustomCourse);
      setIsGeneratingCustom(false);
      setCustomTopicInput("");
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>AI Course Curriculum Planning System</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Intentional 100-Class Learning Roadmaps
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every course in JOXIQ Academy is engineered with a pre-planned curriculum BEFORE lesson generation. Inspect course goals, prerequisite skills, module progression, and class-by-class real-world applications.
          </p>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => { setSelectedCategory("All"); setCustomGeneratedCourse(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === "All" && !customGeneratedCourse
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Categories ({courses.length})
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => { setSelectedCategory(cat.name); setCustomGeneratedCourse(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.name && !customGeneratedCourse
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Course Selector Bar & Custom AI Curriculum Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dropdown Selector */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Course Curriculum to Inspect ({filteredCourses.length} available):
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setCustomGeneratedCourse(null);
              setInspectingClass(null);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            {filteredCourses.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.category}] {c.name} — ({c.totalClasses} Classes)
              </option>
            ))}
          </select>
        </div>

        {/* Custom AI Prompt Trigger */}
        <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-violet-400" />
            <span>Plan Custom Topic Curriculum</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder="e.g. Next.js App Router, Rust Systems..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleGenerateCustomCurriculum}
              disabled={isGeneratingCustom || !customTopicInput.trim()}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0"
            >
              {isGeneratingCustom ? "Planning..." : "Plan AI"}
            </button>
          </div>
        </div>

      </div>

      {/* 3. ACTIVE COURSE CURRICULUM OVERVIEW */}
      {activeCourse && (
        <div className="space-y-6">
          
          {/* Main Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {activeCourse.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {activeCourse.requiredLevel}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white">{activeCourse.name}</h3>
                <p className="text-xs text-slate-300 max-w-2xl">{activeCourse.fullDescription}</p>
              </div>

              <button
                onClick={() => onSelectCourseToStart(activeCourse)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Learning This Course</span>
              </button>
            </div>

            {/* Curriculum Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              
              {/* Course Goal */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-wider text-[11px]">
                  <Target className="w-4 h-4" />
                  <span>Course Goal</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {activeCourse.courseGoal}
                </p>
              </div>

              {/* Required Skills / Prerequisites */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Zap className="w-4 h-4" />
                  <span>Required Prerequisites</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  {(activeCourse.requiredSkills || ["Basic computer literacy", "Logic & problem solving mindset"]).map((sk, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold mt-0.5">•</span>
                      <span>{sk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Learning Outcomes */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Target Learning Outcomes</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  {(activeCourse.learningOutcomes || ["Build production applications", "Master real-world problem solving"]).slice(0, 3).map((out, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold mt-0.5">•</span>
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* 4-Tier Progression Roadmap Banner */}
            {activeCourse.curriculumRoadmap && (
              <div className="bg-slate-950 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-indigo-400" />
                    Four-Tier Pedagogical Learning Path (100 Classes Total)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Basic → Advanced Progression</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* Beginner */}
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                    <div className="text-[11px] font-black text-emerald-400 uppercase">1. Beginner (Classes 1-30)</div>
                    <p className="text-[11px] text-slate-300">Build basic understanding, syntax, and foundational rules.</p>
                  </div>

                  {/* Intermediate */}
                  <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3 space-y-1">
                    <div className="text-[11px] font-black text-blue-400 uppercase">2. Intermediate (Classes 31-60)</div>
                    <p className="text-[11px] text-slate-300">Improve problem solving, architecture, and practical tasks.</p>
                  </div>

                  {/* Advanced */}
                  <div className="bg-slate-900 border border-violet-500/30 rounded-xl p-3 space-y-1">
                    <div className="text-[11px] font-black text-violet-400 uppercase">3. Advanced (Classes 61-90)</div>
                    <p className="text-[11px] text-slate-300">Professional concepts, industry skills, and scaling.</p>
                  </div>

                  {/* Extra */}
                  <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 space-y-1">
                    <div className="text-[11px] font-black text-amber-400 uppercase">4. Extra (Classes 91-100)</div>
                    <p className="text-[11px] text-slate-300">Career guidance, portfolio capstones, and industry secrets.</p>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* 4. MODULE & CLASS BLUEPRINT ROADMAP INSPECTOR */}
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                Structured Module & Class Roadmap
              </h3>

              {/* Level Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
                {(["All", "Beginner", "Intermediate", "Advanced", "Extra"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevelFilter(lvl)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedLevelFilter === lvl
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Modules Grid */}
            <div className="space-y-4">
              {displayModules.map((mod) => (
                <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        mod.level === "Beginner"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : mod.level === "Intermediate"
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                          : mod.level === "Advanced"
                          ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}>
                        {mod.level} Level
                      </span>
                      <h4 className="text-base font-black text-white mt-1">{mod.title}</h4>
                      <p className="text-xs text-slate-400">{mod.description}</p>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                      {mod.classes.length} Classes
                    </span>
                  </div>

                  {/* Classes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {mod.classes.map((cls) => {
                      const isInspecting = inspectingClass?.id === cls.id;

                      return (
                        <div
                          key={cls.id}
                          onClick={() => setInspectingClass(cls)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                            isInspecting
                              ? "bg-violet-600/20 border-violet-500 text-white shadow-md"
                              : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400">
                            <span>#{cls.classNumber}</span>
                            <span>{cls.duration}</span>
                          </div>

                          <div className="text-xs font-bold line-clamp-2 leading-tight">
                            {cls.title}
                          </div>

                          <div className="text-[10px] text-violet-400 font-medium flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            <span>Inspect Design</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* 5. CLASS DESIGN INSPECTOR PANEL (When a class is clicked) */}
          {inspectingClass && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-violet-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in relative">
              
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Class #{inspectingClass.classNumber} Planning Details
                  </span>
                  <h3 className="text-xl font-black text-white mt-1.5">
                    {inspectingClass.title}
                  </h3>
                </div>

                <button
                  onClick={() => setInspectingClass(null)}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all"
                >
                  Close Inspector
                </button>
              </div>

              {/* Class Intentional Design Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Why Topic is Important */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Why This Topic Is Important
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {inspectingClass.whyImportant || inspectingClass.realLifeUsage.whyNeeded}
                  </p>
                </div>

                {/* 2. What Student Will Learn */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> What Student Will Learn
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {inspectingClass.whatYouWillLearn.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Real-Life Application */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> Real-Life Usage in Industry
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {inspectingClass.realLifeUsage.realWorldApplication}
                  </p>
                </div>

                {/* 4. Practice Task & Challenge */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" /> Planned Practice Challenge
                  </span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {inspectingClass.practiceTask}
                  </p>
                </div>

              </div>

              {/* Class Launch Trigger */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onSelectCourseToStart(activeCourse)}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Class #{inspectingClass.classNumber} in Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
