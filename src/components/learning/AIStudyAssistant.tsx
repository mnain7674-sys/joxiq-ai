import React, { useState, useEffect } from "react";
import { Course, ClassItem, CourseModule } from "../../types/learning";
import {
  SmartNote,
  LearningGoal,
  AIMemoryProfile,
  NoteCategory,
  QuickRevision
} from "../../types/studyAssistant";
import {
  getSmartNotes,
  saveSmartNote,
  deleteSmartNote,
  getLearningGoals,
  setCustomGoal,
  getAIMemory,
  updateAIMemory,
  getLessonSummaries
} from "../../lib/studyAssistantStorage";
import {
  Brain,
  Sparkles,
  Target,
  Bookmark,
  FileText,
  Code2,
  Briefcase,
  Cpu,
  Globe,
  Zap,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Award,
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  X,
  Layers
} from "lucide-react";

interface AIStudyAssistantProps {
  courses: Course[];
  onSelectCourseClass?: (course: Course, module: CourseModule, cls: ClassItem) => void;
  onOpenCodeStudio?: () => void;
  onOpenProjectBuilder?: () => void;
}

export const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({
  courses,
  onSelectCourseClass,
  onOpenCodeStudio,
  onOpenProjectBuilder
}) => {
  const [activeTab, setActiveTab] = useState<"goals" | "notes" | "quick" | "revision" | "memory">("goals");

  // State data from storage
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [memory, setMemory] = useState<AIMemoryProfile>(getAIMemory());

  // Smart Notes filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Note Modal state
  const [isAddNoteOpen, setIsAddNoteOpen] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>("");
  const [newNoteCategory, setNewNoteCategory] = useState<NoteCategory>("Web Development Notes");
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [newNoteCode, setNewNoteCode] = useState<string>("");

  // New Goal Modal state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [goalType, setGoalType] = useState<"daily_class" | "weekly_module" | "monthly_course">("daily_class");
  const [goalTarget, setGoalTarget] = useState<number>(1);

  // Quick Revision generator state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [quickRevMode, setQuickRevMode] = useState<"2min" | "5min" | "full">("2min");
  const [generatedQuickRev, setGeneratedQuickRev] = useState<QuickRevision | null>(null);
  const [loadingQuickRev, setLoadingQuickRev] = useState<boolean>(false);

  // Load and subscribe to storage changes
  useEffect(() => {
    refreshData();
    const handleStorageUpdate = () => refreshData();
    window.addEventListener("joxiq_study_assistant_updated", handleStorageUpdate);
    return () => window.removeEventListener("joxiq_study_assistant_updated", handleStorageUpdate);
  }, []);

  const refreshData = () => {
    setGoals(getLearningGoals());
    setNotes(getSmartNotes());
    setMemory(getAIMemory());
  };

  // Flatten all classes for Quick Revision selector
  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allCourseClasses: { course: Course; module: CourseModule; cls: ClassItem }[] = [];
  courses.forEach((c) => {
    c.modules.forEach((m) => {
      m.classes.forEach((cls) => {
        allCourseClasses.push({ course: c, module: m, cls });
      });
    });
  });

  const handleCreateCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    saveSmartNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      tags: [newNoteCategory.split(" ")[0], "Custom Note"],
      codeSnippet: newNoteCode.trim() || undefined,
    });

    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteCode("");
    setIsAddNoteOpen(false);
    refreshData();
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setCustomGoal({
      title: goalTitle.trim(),
      type: goalType,
      targetCount: Number(goalTarget) || 1,
      unit: goalType === "daily_class" ? "classes" : goalType === "weekly_module" ? "modules" : "courses",
      deadlineDays: goalType === "daily_class" ? 1 : goalType === "weekly_module" ? 7 : 30,
    });

    setGoalTitle("");
    setIsAddGoalOpen(false);
    refreshData();
  };

  const handleDeleteNote = (id: string) => {
    deleteSmartNote(id);
    refreshData();
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateQuickRevision = async () => {
    const targetItem = allCourseClasses.find((item) => item.cls.id === selectedClassId) || allCourseClasses[0];
    if (!targetItem) return;

    setLoadingQuickRev(true);
    try {
      const res = await fetch("/api/learning/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_revision",
          courseName: targetItem.course.name || (targetItem.course as any).title || "Course",
          className: targetItem.cls.title,
          revisionMode: quickRevMode,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setGeneratedQuickRev({
          classId: targetItem.cls.id,
          className: targetItem.cls.title,
          ...data.data,
        });
      }
    } catch (err) {
      console.error("Error generating quick revision:", err);
    } finally {
      setLoadingQuickRev(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesCategory = selectedCategory === "All" || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>JOXIQ AI LEARNING COMPANION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              AI Study Assistant
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Your intelligent tutor guiding you before, during, and after every lesson. Tracks goals, creates smart notes, and simplifies revision.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Classes Done</div>
              <div className="text-lg font-black text-emerald-400">{memory.completedLessonsCount}</div>
            </div>
            <div className="text-center px-2 border-x border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Smart Notes</div>
              <div className="text-lg font-black text-indigo-400">{notes.length}</div>
            </div>
            <div className="text-center px-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Active Goals</div>
              <div className="text-lg font-black text-amber-400">{goals.filter((g) => !g.completed).length}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "goals"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Target className="w-4 h-4 text-amber-400" />
            <span>🎯 Learning Goals</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "notes"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <span>📝 Smart Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quick")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "quick"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ Quick Revision</span>
          </button>

          <button
            onClick={() => setActiveTab("revision")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "revision"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>🔄 Revision Mode</span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "memory"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span>🧠 AI Memory Profile</span>
          </button>
        </div>
      </div>

      {/* ---------------- TAB 1: LEARNING GOALS ---------------- */}
      {activeTab === "goals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <span>My Learning Goals & Streaks</span>
              </h2>
              <p className="text-xs text-slate-400">Set daily, weekly, or monthly learning targets to stay consistent.</p>
            </div>

            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Set Custom Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
              return (
                <div
                  key={goal.id}
                  className={`bg-slate-900 border p-5 rounded-2xl space-y-4 transition-all ${
                    goal.completed
                      ? "border-emerald-500/50 bg-emerald-950/10"
                      : "border-slate-800 hover:border-indigo-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {goal.type.replace("_", " ")}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{goal.title}</h3>
                    </div>
                    {goal.completed ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Progress</span>
                      <span className="text-white font-bold">{goal.currentCount} / {goal.targetCount} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          goal.completed ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-indigo-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>Status: <strong className={goal.completed ? "text-emerald-400" : "text-amber-400"}>{goal.completed ? "Goal Achieved! 🎉" : "In Progress"}</strong></span>
                    <span>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: SMART NOTES MANAGER ---------------- */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-400" />
                <span>Categorized Smart Notes</span>
              </h2>
              <p className="text-xs text-slate-400">Auto-saved class summaries, code snippets, and business insights.</p>
            </div>

            <button
              onClick={() => setIsAddNoteOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Smart Note</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {["All", "Class Notes", "Code Notes", "Business Notes", "AI Engineering Notes", "Web Development Notes"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or tags..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No smart notes found in this category.</p>
              <button
                onClick={() => setIsAddNoteOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Add Your First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {note.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-2">{note.title}</h3>
                    <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-4 leading-relaxed">
                      {note.content}
                    </p>

                    {note.codeSnippet && (
                      <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800 overflow-x-auto max-h-32">
                        <pre>{note.codeSnippet}</pre>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyNote(note.id, `${note.title}\n\n${note.content}`)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-950 rounded-lg border border-slate-800"
                        title="Copy note text"
                      >
                        {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 rounded-lg border border-slate-800"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 3: QUICK REVISION HUB ---------------- */}
      {activeTab === "quick" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Quick Revision Generator</span>
            </h2>
            <p className="text-xs text-slate-400">Generate 2-minute blitz, 5-minute recap, or full mastery notes for any class topic.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Select Course */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || (c as any).title}</option>
                  ))}
                </select>
              </div>

              {/* Select Class */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Class Topic</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Class Topic --</option>
                  {allCourseClasses
                    .filter((item) => item.course.id === selectedCourseId)
                    .map((item) => (
                      <option key={item.cls.id} value={item.cls.id}>
                        Class #{item.cls.classNumber}: {item.cls.title} ({item.module.level})
                      </option>
                    ))}
                </select>
              </div>

              {/* Mode Select */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Revision Depth</label>
                <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setQuickRevMode("2min")}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg ${quickRevMode === "2min" ? "bg-amber-500 text-slate-950" : "text-slate-400"}`}
                  >
                    2-Min Blitz
                  </button>
                  <button
                    onClick={() => setQuickRevMode("5min")}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg ${quickRevMode === "5min" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                  >
                    5-Min
                  </button>
                  <button
                    onClick={() => setQuickRevMode("full")}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg ${quickRevMode === "full" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                  >
                    Full
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateQuickRevision}
              disabled={loadingQuickRev}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingQuickRev ? "Generating AI Revision Sheet..." : "Generate AI Quick Revision Sheet"}</span>
            </button>
          </div>

          {/* Generated Revision Sheet Display */}
          {generatedQuickRev && (
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{generatedQuickRev.mode} REVISION SHEET</span>
                  <h3 className="text-base font-bold text-white">{generatedQuickRev.title}</h3>
                </div>
                <button
                  onClick={() => {
                    saveSmartNote({
                      title: `${generatedQuickRev.className} - Quick Revision`,
                      content: `${generatedQuickRev.bullets.map(b => `- ${b}`).join("\n")}\n\n**Key Rule:** ${generatedQuickRev.keyTakeaway}`,
                      category: "Class Notes",
                      tags: ["Quick Revision", generatedQuickRev.mode]
                    });
                    alert("Saved to Smart Notes!");
                  }}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Core Takeaways & Rules:</div>
                <ul className="space-y-1.5">
                  {generatedQuickRev.bullets?.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-indigo-300 uppercase">Golden Principle</div>
                <p className="text-xs font-semibold text-slate-100 mt-1">{generatedQuickRev.keyTakeaway}</p>
              </div>

              {generatedQuickRev.codeHighlights && generatedQuickRev.codeHighlights.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto">
                  <pre>{generatedQuickRev.codeHighlights.join("\n")}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 4: REVISION MODE ---------------- */}
      {activeTab === "revision" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              <span>Revision Mode & Weak Topics Practice</span>
            </h2>
            <p className="text-xs text-slate-400">Review past mistakes, repeat weak topics, and consolidate completed lessons.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak Topics */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>IDENTIFIED WEAK AREAS</span>
              </div>
              <p className="text-xs text-slate-400">Topics flagged by AI for additional practice:</p>

              <div className="space-y-2">
                {memory.weakTopics.map((wt, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-200 font-medium">• {wt}</span>
                    <button
                      onClick={() => setActiveTab("quick")}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      Practice Topic
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Mistakes Log */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <RotateCcw className="w-4 h-4" />
                <span>PAST MISTAKES LOG</span>
              </div>
              <p className="text-xs text-slate-400">Review mistakes made during quizzes and interactive checks:</p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memory.pastMistakes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No past mistakes logged yet! Great job.</p>
                ) : (
                  memory.pastMistakes.map((pm, idx) => (
                    <div key={idx} className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20 text-xs text-rose-200">
                      ⚠️ {pm}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: AI MEMORY PROFILE ---------------- */}
      {activeTab === "memory" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>AI Memory & Context Tracker</span>
            </h2>
            <p className="text-xs text-slate-400">The AI Study Assistant retains context from your completed lessons to tailor future explanations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Active Memory Context</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Completed Lessons:</span>
                  <strong className="text-white">{memory.completedLessonsCount} Classes</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Study Time:</span>
                  <strong className="text-white">{memory.totalStudyTimeMinutes} Minutes</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Saved Notes:</span>
                  <strong className="text-white">{notes.length} Notes</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last Active Date:</span>
                  <strong className="text-white">{memory.lastActiveDate}</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Mastered Concepts</h3>
              <div className="flex flex-wrap gap-1.5">
                {memory.strongTopics.map((st, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold">
                    ✓ {st}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE SMART NOTE ---------------- */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-400" />
                <span>Create Smart Note</span>
              </h3>
              <button onClick={() => setIsAddNoteOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomNote} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. React useEffect Cleanup Rules"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as NoteCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Class Notes">Class Notes</option>
                  <option value="Code Notes">Code Notes</option>
                  <option value="Business Notes">Business Notes</option>
                  <option value="AI Engineering Notes">AI Engineering Notes</option>
                  <option value="Web Development Notes">Web Development Notes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Content / Explanation</label>
                <textarea
                  required
                  rows={4}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note explanation or key points..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={2}
                  value={newNoteCode}
                  onChange={(e) => setNewNoteCode(e.target.value)}
                  placeholder="// Optional code snippet..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE CUSTOM GOAL ---------------- */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <span>Set Custom Learning Goal</span>
              </h3>
              <button onClick={() => setIsAddGoalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomGoal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Finish 3 Classes This Week"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Type</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="daily_class">Daily Classes</option>
                  <option value="weekly_module">Weekly Modules</option>
                  <option value="monthly_course">Monthly Course</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Count</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500"
                >
                  Set Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
