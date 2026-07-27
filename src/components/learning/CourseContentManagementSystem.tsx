import React, { useState, useEffect } from "react";
import { AILessonGeneratorModal } from "./AILessonGeneratorModal";
import {
  CMSLessonPackage,
  CMSContentStatus,
  CMSCodeExample,
  CMSRealLifeExample,
  CMSPracticeTask,
  CMSQuizQuestion,
  CMSImageAsset,
  CMSDiagramAsset,
  CMSCodeAsset,
  CMSTableAsset
} from "../../types/courseCMS";
import { CourseCategory, CourseLevel, Course } from "../../types/learning";
import {
  getAllCMSLessonsFromFirestore,
  saveCMSLessonToFirestore,
  deleteCMSLessonFromFirestore,
  duplicateCMSLessonInFirestore,
  moveCMSLessonInFirestore,
  restoreCMSLessonVersionInFirestore,
  createEmptyCMSLessonPackage,
  seedInitialCMSLessonsToFirestore
} from "../../services/courseCMSService";
import {
  BookOpen,
  Layers,
  Plus,
  Edit3,
  Trash2,
  Copy,
  FolderInput,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  RefreshCw,
  Save,
  X,
  Code,
  ListChecks,
  FileText,
  Image as ImageIcon,
  Video,
  Database,
  ArrowRight,
  Eye,
  Tag,
  PenTool,
  HelpCircle,
  FolderTree,
  Sliders,
  Award,
  AlertCircle
} from "lucide-react";

interface CourseContentManagementSystemProps {
  courses: Course[];
  onClose?: () => void;
  isProMember?: boolean;
}

type EditorTab = "metadata" | "teaching" | "activities" | "assets" | "versioning";

export const CourseContentManagementSystem: React.FC<CourseContentManagementSystemProps> = ({
  courses,
  onClose
}) => {
  // Navigation hierarchy states
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>("Programming Languages");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length > 0 ? courses[0].id : "py-course"
  );
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>("Beginner");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod-py-1");

  // Lesson list from Firestore
  const [lessons, setLessons] = useState<CMSLessonPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Active Lesson Package Modal Editor
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingLesson, setEditingLesson] = useState<CMSLessonPackage | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>("metadata");
  const [commitNotes, setCommitNotes] = useState<string>("");

  // Move Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<boolean>(false);
  const [lessonToMove, setLessonToMove] = useState<CMSLessonPackage | null>(null);
  const [targetCourseIdForMove, setTargetCourseIdForMove] = useState<string>("");
  const [targetModuleIdForMove, setTargetModuleIdForMove] = useState<string>("");

  // AI Generator Modal State
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load lessons from Firestore on mount
  const loadLessons = async () => {
    setIsLoading(true);
    try {
      let data = await getAllCMSLessonsFromFirestore();
      if (data.length === 0) {
        // Seed initial foundational lessons
        await seedInitialCMSLessonsToFirestore();
        data = await getAllCMSLessonsFromFirestore();
      }
      setLessons(data);
    } catch (err: any) {
      showToast("Error loading lessons from Firestore: " + (err.message || err), "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const categories: CourseCategory[] = [
    "Programming Languages",
    "AI Engineering",
    "Web Development",
    "App Development",
    "Business Courses",
    "Other Skills"
  ];

  // Available courses in selected category
  const filteredCategoryCourses = courses.filter((c) => c.category === selectedCategory);
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || filteredCategoryCourses[0] || courses[0];

  // Modules in current course
  const courseModules = currentCourse?.modules || [
    { id: "mod-1", title: "Module 1: Fundamentals", level: "Beginner" as CourseLevel, description: "Core concepts", classes: [] }
  ];
  const currentModule = courseModules.find((m) => m.id === selectedModuleId) || courseModules[0];

  // Filter lessons for current hierarchy view
  const visibleLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lessonId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.objective.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = l.category === selectedCategory;
    const matchesCourse = l.courseId === selectedCourseId || !selectedCourseId;
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesCategory && matchesCourse && matchesStatus;
  });

  // ==================== ACTIONS ====================

  const handleCreateNewLesson = () => {
    const newPkg = createEmptyCMSLessonPackage(
      selectedCategory,
      selectedCourseId,
      currentCourse?.name || "Selected Course",
      selectedLevel,
      currentModule?.id || "mod-1",
      currentModule?.title || "Module 1",
      lessons.length + 1
    );
    setEditingLesson(newPkg);
    setCommitNotes("Created new CMS lesson content package");
    setActiveEditorTab("metadata");
    setIsEditorOpen(true);
  };

  const handleEditLesson = (lesson: CMSLessonPackage) => {
    setEditingLesson(JSON.parse(JSON.stringify(lesson))); // deep copy
    setCommitNotes(`Updated lesson: ${lesson.title}`);
    setActiveEditorTab("metadata");
    setIsEditorOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    if (!editingLesson.title.trim()) {
      showToast("Please provide a valid lesson title.", "error");
      return;
    }

    setIsSaving(true);
    const res = await saveCMSLessonToFirestore(editingLesson, "Admin User", commitNotes || "Saved lesson package updates");
    setIsSaving(false);

    if (res.success) {
      showToast(`Lesson '${res.lesson.title}' saved to Firestore (v${res.lesson.version})!`);
      setIsEditorOpen(false);
      setEditingLesson(null);
      await loadLessons();
    } else {
      showToast(`Failed to save lesson: ${res.error}`, "error");
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete lesson '${title}' (${lessonId}) from Firestore?`)) {
      setIsSaving(true);
      const res = await deleteCMSLessonFromFirestore(lessonId);
      setIsSaving(false);
      if (res.success) {
        showToast(`Lesson '${title}' deleted successfully.`);
        await loadLessons();
      } else {
        showToast(`Failed to delete: ${res.error}`, "error");
      }
    }
  };

  const handleDuplicateLesson = async (lessonId: string, title: string) => {
    setIsSaving(true);
    const res = await duplicateCMSLessonInFirestore(lessonId);
    setIsSaving(false);
    if (res.success && res.duplicatedLesson) {
      showToast(`Duplicated '${title}' as new Draft lesson.`);
      await loadLessons();
    } else {
      showToast(`Duplicate failed: ${res.error}`, "error");
    }
  };

  const handleOpenMoveModal = (lesson: CMSLessonPackage) => {
    setLessonToMove(lesson);
    setTargetCourseIdForMove(lesson.courseId);
    setTargetModuleIdForMove(lesson.moduleId);
    setIsMoveModalOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!lessonToMove || !targetCourseIdForMove) return;

    const targetCourse = courses.find((c) => c.id === targetCourseIdForMove);
    if (!targetCourse) return;

    const targetModule = targetCourse.modules.find((m) => m.id === targetModuleIdForMove) || targetCourse.modules[0];

    setIsSaving(true);
    const res = await moveCMSLessonInFirestore(
      lessonToMove.lessonId,
      targetCourse.id,
      targetCourse.name,
      targetCourse.category,
      targetModule?.id || "mod-1",
      targetModule?.title || "Module 1"
    );
    setIsSaving(false);

    if (res.success) {
      showToast(`Moved lesson to Course: ${targetCourse.name}`);
      setIsMoveModalOpen(false);
      setLessonToMove(null);
      await loadLessons();
    } else {
      showToast(`Move failed: ${res.error}`, "error");
    }
  };

  const handleRestoreVersion = async (targetVersionNumber: number) => {
    if (!editingLesson) return;
    if (confirm(`Restore lesson back to Version v${targetVersionNumber}? Current unsaved edits will be superseded.`)) {
      setIsSaving(true);
      const res = await restoreCMSLessonVersionInFirestore(editingLesson.lessonId, targetVersionNumber);
      setIsSaving(false);
      if (res.success && res.restoredLesson) {
        setEditingLesson(res.restoredLesson);
        showToast(`Restored version v${targetVersionNumber} snapshot successfully!`);
        await loadLessons();
      } else {
        showToast(`Restore version failed: ${res.error}`, "error");
      }
    }
  };

  const handleQuickPublishToggle = async (lesson: CMSLessonPackage) => {
    const nextStatus: CMSContentStatus = lesson.status === "Published" ? "Draft" : "Published";
    const updated = { ...lesson, status: nextStatus };
    setIsSaving(true);
    const res = await saveCMSLessonToFirestore(updated, "Admin User", `Status updated to ${nextStatus}`);
    setIsSaving(false);
    if (res.success) {
      showToast(`Status changed to ${nextStatus}`);
      await loadLessons();
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-6 space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all duration-300 ${
            toastMessage.type === "error"
              ? "bg-red-950/90 border-red-500 text-red-200"
              : toastMessage.type === "info"
              ? "bg-blue-950/90 border-blue-500 text-blue-200"
              : "bg-emerald-950/90 border-emerald-500 text-emerald-200"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>JOXIQ AI Learning Academy • Centralized Content Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Course Content Management System
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Firestore Real Sync
            </span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Structured Category → Course → Level → Module → Lesson content packages with teaching scripts, interactive board assets, activities, and version control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLessons}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2 transition-colors"
            title="Refresh Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>

          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            AI Quality Engine
          </button>

          <button
            onClick={handleCreateNewLesson}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Manual Package
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Category Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              const matchingCourse = courses.find((c) => c.category === cat);
              if (matchingCourse) {
                setSelectedCourseId(matchingCourse.id);
              }
            }}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedCategory === cat
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/40"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            {cat}
          </button>
        ))}
      </div>

      {/* 2. Structured Hierarchy Filter Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Course Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Course
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              const c = courses.find((crs) => crs.id === e.target.value);
              if (c && c.modules.length > 0) {
                setSelectedModuleId(c.modules[0].id);
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {filteredCategoryCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" /> Target Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as CourseLevel)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Beginner">Beginner Level</option>
            <option value="Intermediate">Intermediate Level</option>
            <option value="Advanced">Advanced Level</option>
            <option value="Extra">Extra Career Level</option>
          </select>
        </div>

        {/* Module Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Module
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {courseModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Search & Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-indigo-400" /> Search Lessons
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Breadcrumbs & Status Counts Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-lg text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium overflow-x-auto">
          <span className="text-indigo-400">{selectedCategory}</span>
          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-slate-200 font-semibold">{currentCourse?.name}</span>
          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-slate-400">{currentModule?.title}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Published: {visibleLessons.filter((l) => l.status === "Published").length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Draft/Review: {visibleLessons.filter((l) => l.status !== "Published").length}
          </span>
          <span className="text-slate-500">Total Packages: {visibleLessons.length}</span>
        </div>
      </div>

      {/* Lesson Content Packages Grid / List */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl p-4 overflow-y-auto">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400">Connecting to Firebase Firestore & Loading Lesson Packages...</p>
          </div>
        ) : visibleLessons.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-base font-semibold text-slate-200">No Lesson Packages Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                There are currently no lesson packages created for this course/module selection in Firestore.
              </p>
            </div>
            <button
              onClick={handleCreateNewLesson}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Lesson Package
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleLessons.map((lesson) => (
              <div
                key={lesson.lessonId}
                className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/50 px-2 py-0.5 rounded">
                      Lesson #{lesson.lessonNumber}
                    </span>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        lesson.status === "Published"
                          ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                          : lesson.status === "Under Review"
                          ? "bg-amber-950/80 border-amber-500/40 text-amber-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {lesson.status}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      v{lesson.version}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {lesson.duration}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-500" />
                      {lesson.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1">{lesson.objective}</p>

                  <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
                    <span>
                      Scripts: AI Teacher ({lesson.aiTeacherScript ? "Yes" : "No"}), Voice (
                      {lesson.voiceScript ? "Yes" : "No"}), Board ({lesson.boardScript ? "Yes" : "No"})
                    </span>
                    <span>• Quiz: {lesson.quiz?.length || 0} Qs</span>
                    <span>• Practice Tasks: {lesson.practiceTasks?.length || 0}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 shrink-0">
                  <button
                    onClick={() => handleQuickPublishToggle(lesson)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                      lesson.status === "Published"
                        ? "bg-emerald-950/40 border-emerald-700 text-emerald-300 hover:bg-emerald-900/50"
                        : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                    title="Toggle Publish Status"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {lesson.status === "Published" ? "Published" : "Publish"}
                  </button>

                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Package
                  </button>

                  <button
                    onClick={() => handleDuplicateLesson(lesson.lessonId, lesson.title)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                    title="Duplicate Lesson"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenMoveModal(lesson)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                    title="Move Lesson Module"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteLesson(lesson.lessonId, lesson.title)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg border border-red-900/40 transition-colors"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== 3. RICH FULL LESSON PACKAGE EDITOR MODAL ==================== */}
      {isEditorOpen && editingLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
                  <span>
                    {editingLesson.category} → {editingLesson.courseName}
                  </span>
                  <span>• v{editingLesson.version}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Lesson Package Editor: {editingLesson.title || "Untitled Package"}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveLesson}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
                >
                  <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
                  {isSaving ? "Saving to Firestore..." : "Save to Firestore"}
                </button>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Tabs Navigation */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto">
              {[
                { id: "metadata", label: "Metadata & Structure", icon: BookOpen },
                { id: "teaching", label: "Teaching Content & Scripts", icon: Sparkles },
                { id: "activities", label: "Student Activities & Quiz", icon: ListChecks },
                { id: "assets", label: "Lesson Assets", icon: FileText },
                { id: "versioning", label: "Status & Version Control", icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEditorTab(tab.id as EditorTab)}
                    className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                      activeEditorTab === tab.id
                        ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: METADATA & STRUCTURE */}
              {activeEditorTab === "metadata" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Lesson ID</label>
                      <input
                        type="text"
                        value={editingLesson.lessonId}
                        onChange={(e) => setEditingLesson({ ...editingLesson, lessonId: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-300"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Lesson Number</label>
                      <input
                        type="number"
                        value={editingLesson.lessonNumber}
                        onChange={(e) =>
                          setEditingLesson({ ...editingLesson, lessonNumber: parseInt(e.target.value) || 1 })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Estimated Duration</label>
                      <input
                        type="text"
                        value={editingLesson.duration}
                        onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                        placeholder="e.g. 25 mins"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Lesson Title</label>
                    <input
                      type="text"
                      value={editingLesson.title}
                      onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-semibold focus:border-indigo-500"
                      placeholder="Enter descriptive title"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Lesson Objective</label>
                    <textarea
                      rows={2}
                      value={editingLesson.objective}
                      onChange={(e) => setEditingLesson({ ...editingLesson, objective: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:border-indigo-500"
                      placeholder="What is the core problem and solution taught in this lesson?"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Learning Outcomes (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={(editingLesson.learningOutcomes || []).join("\n")}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            learningOutcomes: e.target.value.split("\n").filter((l) => l.trim() !== "")
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200"
                        placeholder="List specific outcomes..."
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Prerequisites (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={(editingLesson.prerequisites || []).join("\n")}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            prerequisites: e.target.value.split("\n").filter((l) => l.trim() !== "")
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200"
                        placeholder="List prerequisite concepts..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TEACHING CONTENT & SCRIPTS */}
              {activeEditorTab === "teaching" && (
                <div className="space-y-6">
                  {/* AI Teacher Script */}
                  <div>
                    <label className="block font-semibold text-indigo-300 mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> AI Teacher Script
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.aiTeacherScript}
                      onChange={(e) => setEditingLesson({ ...editingLesson, aiTeacherScript: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-sans"
                      placeholder="Detailed dialogue for AI avatar teacher..."
                    />
                  </div>

                  {/* Voice Teaching Script */}
                  <div>
                    <label className="block font-semibold text-indigo-300 mb-1 flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-400" /> Voice Teaching Script
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.voiceScript}
                      onChange={(e) => setEditingLesson({ ...editingLesson, voiceScript: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200"
                      placeholder="Narration script for voice synthesizer..."
                    />
                  </div>

                  {/* Board Teaching Script */}
                  <div>
                    <label className="block font-semibold text-indigo-300 mb-1 flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-indigo-400" /> Board Teaching Script & Screen Text
                    </label>
                    <textarea
                      rows={3}
                      value={editingLesson.boardScript}
                      onChange={(e) => setEditingLesson({ ...editingLesson, boardScript: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono"
                      placeholder="Interactive teaching board drawings & annotations..."
                    />
                  </div>

                  {/* Code Examples */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <Code className="w-4 h-4 text-indigo-400" /> Code Examples ({editingLesson.codeExamples?.length || 0})
                      </h4>
                      <button
                        onClick={() => {
                          const newEx: CMSCodeExample = {
                            id: `ex-${Date.now()}`,
                            title: "New Code Example",
                            language: "python",
                            code: "# Enter code here",
                            explanation: "Code explanation..."
                          };
                          setEditingLesson({
                            ...editingLesson,
                            codeExamples: [...(editingLesson.codeExamples || []), newEx]
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                      >
                        + Add Example
                      </button>
                    </div>

                    {(editingLesson.codeExamples || []).map((ex, idx) => (
                      <div key={ex.id || idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ex.title}
                            onChange={(e) => {
                              const list = [...editingLesson.codeExamples];
                              list[idx].title = e.target.value;
                              setEditingLesson({ ...editingLesson, codeExamples: list });
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-semibold"
                          />
                          <button
                            onClick={() => {
                              const list = editingLesson.codeExamples.filter((_, i) => i !== idx);
                              setEditingLesson({ ...editingLesson, codeExamples: list });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          value={ex.code}
                          onChange={(e) => {
                            const list = [...editingLesson.codeExamples];
                            list[idx].code = e.target.value;
                            setEditingLesson({ ...editingLesson, codeExamples: list });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-emerald-300"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Visual Instructions */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-400" /> Visual Explanation & Annotation Instructions
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Highlight Instructions</label>
                        <input
                          type="text"
                          value={editingLesson.visualInstructions?.highlightInstructions || ""}
                          onChange={(e) =>
                            setEditingLesson({
                              ...editingLesson,
                              visualInstructions: {
                                ...(editingLesson.visualInstructions || {
                                  highlightInstructions: "",
                                  underlineInstructions: "",
                                  circleInstructions: "",
                                  arrowInstructions: "",
                                  virtualPenInstructions: ""
                                }),
                                highlightInstructions: e.target.value
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Arrow Instructions</label>
                        <input
                          type="text"
                          value={editingLesson.visualInstructions?.arrowInstructions || ""}
                          onChange={(e) =>
                            setEditingLesson({
                              ...editingLesson,
                              visualInstructions: {
                                ...(editingLesson.visualInstructions || {
                                  highlightInstructions: "",
                                  underlineInstructions: "",
                                  circleInstructions: "",
                                  arrowInstructions: "",
                                  virtualPenInstructions: ""
                                }),
                                arrowInstructions: e.target.value
                              }
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STUDENT ACTIVITIES & QUIZ */}
              {activeEditorTab === "activities" && (
                <div className="space-y-6">
                  {/* Practice Tasks */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-indigo-400" /> Practice Tasks ({editingLesson.practiceTasks?.length || 0})
                      </h4>
                      <button
                        onClick={() => {
                          const newTask: CMSPracticeTask = {
                            id: `pt-${Date.now()}`,
                            title: "New Task",
                            instructions: "Task instructions...",
                            starterCode: "# Starter code",
                            expectedOutcome: "Expected result..."
                          };
                          setEditingLesson({
                            ...editingLesson,
                            practiceTasks: [...(editingLesson.practiceTasks || []), newTask]
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                      >
                        + Add Task
                      </button>
                    </div>

                    {(editingLesson.practiceTasks || []).map((pt, idx) => (
                      <div key={pt.id || idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={pt.title}
                            onChange={(e) => {
                              const list = [...editingLesson.practiceTasks];
                              list[idx].title = e.target.value;
                              setEditingLesson({ ...editingLesson, practiceTasks: list });
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-semibold"
                          />
                          <button
                            onClick={() => {
                              const list = editingLesson.practiceTasks.filter((_, i) => i !== idx);
                              setEditingLesson({ ...editingLesson, practiceTasks: list });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={pt.instructions}
                          onChange={(e) => {
                            const list = [...editingLesson.practiceTasks];
                            list[idx].instructions = e.target.value;
                            setEditingLesson({ ...editingLesson, practiceTasks: list });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Quiz Builder */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-400" /> Assessment Quiz ({editingLesson.quiz?.length || 0} Questions)
                      </h4>
                      <button
                        onClick={() => {
                          const newQ: CMSQuizQuestion = {
                            id: `qz-${Date.now()}`,
                            question: "Enter question prompt...",
                            options: ["Option A", "Option B", "Option C", "Option D"],
                            correctOptionIndex: 0,
                            explanation: "Explanation..."
                          };
                          setEditingLesson({
                            ...editingLesson,
                            quiz: [...(editingLesson.quiz || []), newQ]
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                      >
                        + Add Question
                      </button>
                    </div>

                    {(editingLesson.quiz || []).map((qz, idx) => (
                      <div key={qz.id || idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-300">Q{idx + 1}</span>
                          <button
                            onClick={() => {
                              const list = editingLesson.quiz.filter((_, i) => i !== idx);
                              setEditingLesson({ ...editingLesson, quiz: list });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={qz.question}
                          onChange={(e) => {
                            const list = [...editingLesson.quiz];
                            list[idx].question = e.target.value;
                            setEditingLesson({ ...editingLesson, quiz: list });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-medium"
                          placeholder="Question text..."
                        />

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {qz.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qz.id}`}
                                checked={qz.correctOptionIndex === oIdx}
                                onChange={() => {
                                  const list = [...editingLesson.quiz];
                                  list[idx].correctOptionIndex = oIdx;
                                  setEditingLesson({ ...editingLesson, quiz: list });
                                }}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const list = [...editingLesson.quiz];
                                  list[idx].options[oIdx] = e.target.value;
                                  setEditingLesson({ ...editingLesson, quiz: list });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: LESSON ASSETS */}
              {activeEditorTab === "assets" && (
                <div className="space-y-6">
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" /> Images & Diagrams
                    </h4>
                    <p className="text-slate-400">
                      Supports markdown notes, image assets, Mermaid diagrams, code snippets, data tables, and video embed URLs.
                    </p>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Video Embed URL (Optional)</label>
                      <input
                        type="text"
                        value={editingLesson.assets?.videoUrl || ""}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            assets: { ...(editingLesson.assets || { textAssets: [], images: [], diagrams: [], codeSnippets: [], tables: [], flowcharts: [] }), videoUrl: e.target.value }
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                        placeholder="e.g. https://www.youtube.com/embed/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: STATUS & VERSION CONTROL */}
              {activeEditorTab === "versioning" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Content Status</label>
                      <select
                        value={editingLesson.status}
                        onChange={(e) =>
                          setEditingLesson({ ...editingLesson, status: e.target.value as CMSContentStatus })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-medium"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Published">Published</option>
                        <option value="Updated">Updated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Commit / Version Notes</label>
                      <input
                        type="text"
                        value={commitNotes}
                        onChange={(e) => setCommitNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                        placeholder="Describe changes in this update..."
                      />
                    </div>
                  </div>

                  {/* Version History Log */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50 space-y-3">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-400" /> Version History Log ({editingLesson.versionHistory?.length || 0} Snapshots)
                    </h4>

                    {(!editingLesson.versionHistory || editingLesson.versionHistory.length === 0) ? (
                      <p className="text-slate-500 italic py-3">No previous archived versions. Current version is v{editingLesson.version}.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {editingLesson.versionHistory.map((vh) => (
                          <div
                            key={vh.versionNumber}
                            className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-4"
                          >
                            <div>
                              <span className="font-mono text-indigo-400 font-bold">v{vh.versionNumber}</span>
                              <span className="text-slate-400 ml-3">{vh.commitNotes}</span>
                              <span className="text-[10px] text-slate-500 block">{vh.updatedAt} by {vh.updatedBy}</span>
                            </div>

                            <button
                              onClick={() => handleRestoreVersion(vh.versionNumber)}
                              className="px-3 py-1 text-[11px] font-semibold bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 rounded"
                            >
                              Restore v{vh.versionNumber}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between">
              <span className="text-slate-400 text-xs">
                Status: <strong className="text-slate-200">{editingLesson.status}</strong> • Version:{" "}
                <strong className="text-indigo-400 font-mono">v{editingLesson.version}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLesson}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Lesson Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. MOVE LESSON MODAL ==================== */}
      {isMoveModalOpen && lessonToMove && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderInput className="w-5 h-5 text-indigo-400" /> Relocate Lesson Package
            </h3>
            <p className="text-xs text-slate-400">
              Select destination course and module for lesson <strong>'{lessonToMove.title}'</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Course</label>
              <select
                value={targetCourseIdForMove}
                onChange={(e) => {
                  setTargetCourseIdForMove(e.target.value);
                  const crs = courses.find((c) => c.id === e.target.value);
                  if (crs && crs.modules.length > 0) {
                    setTargetModuleIdForMove(crs.modules[0].id);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Module</label>
              <select
                value={targetModuleIdForMove}
                onChange={(e) => setTargetModuleIdForMove(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
              >
                {(
                  courses.find((c) => c.id === targetCourseIdForMove)?.modules || []
                ).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMove}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg shadow"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Lesson Generator Modal */}
      <AILessonGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        courses={courses}
        currentCategory={selectedCategory}
        currentCourseId={selectedCourseId}
        currentLevel={selectedLevel}
        currentModuleId={selectedModuleId}
        existingLessonsInModule={visibleLessons}
        onLessonGenerated={(newPkg) => {
          showToast(`Generated and saved AI Lesson '${newPkg.title}'!`);
          loadLessons();
          setEditingLesson(newPkg);
          setIsEditorOpen(true);
        }}
      />
    </div>
  );
};
