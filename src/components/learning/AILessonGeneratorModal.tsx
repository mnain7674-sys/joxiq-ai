import React, { useState, useEffect } from "react";
import { CourseCategory, CourseLevel, Course } from "../../types/learning";
import { CMSLessonPackage } from "../../types/courseCMS";
import { generateAILessonPackageWithEngine } from "../../services/aiLessonGeneratorService";
import { Sparkles, BrainCircuit, CheckCircle2, X, BookOpen, Layers, ArrowRight, ShieldCheck, Zap, AlertCircle } from "lucide-react";

interface AILessonGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  currentCategory: CourseCategory;
  currentCourseId: string;
  currentLevel: CourseLevel;
  currentModuleId: string;
  existingLessonsInModule: CMSLessonPackage[];
  onLessonGenerated: (newLessonPackage: CMSLessonPackage) => void;
}

export const AILessonGeneratorModal: React.FC<AILessonGeneratorModalProps> = ({
  isOpen,
  onClose,
  courses,
  currentCategory,
  currentCourseId,
  currentLevel,
  currentModuleId,
  existingLessonsInModule,
  onLessonGenerated
}) => {
  const [category, setCategory] = useState<CourseCategory>(currentCategory);
  const [courseId, setCourseId] = useState<string>(currentCourseId);
  const [level, setLevel] = useState<CourseLevel>(currentLevel);
  const [moduleId, setModuleId] = useState<string>(currentModuleId);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [lessonNumber, setLessonNumber] = useState<number>(existingLessonsInModule.length + 1);
  const [topicTitle, setTopicTitle] = useState<string>("");
  
  // Previous & Next Lesson Context
  const [previousLessonTitle, setPreviousLessonTitle] = useState<string>("");
  const [previousLessonSummary, setPreviousLessonSummary] = useState<string>("");
  const [nextLessonTitle, setNextLessonTitle] = useState<string>("");
  const [nextLessonSummary, setNextLessonSummary] = useState<string>("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto detect course name & module title
  const selectedCourse = courses.find((c) => c.id === courseId) || courses[0];

  useEffect(() => {
    if (selectedCourse) {
      setCategory(selectedCourse.category);
      if (selectedCourse.modules && selectedCourse.modules.length > 0) {
        const mod = selectedCourse.modules.find((m) => m.id === moduleId) || selectedCourse.modules[0];
        setModuleId(mod.id);
        setModuleTitle(mod.title);
      } else {
        setModuleTitle(`Module ${moduleId}`);
      }
    }
  }, [courseId, moduleId, selectedCourse]);

  // Auto-fill previous and next lesson context when existing lessons change
  useEffect(() => {
    if (existingLessonsInModule.length > 0) {
      const lastLesson = existingLessonsInModule[existingLessonsInModule.length - 1];
      setPreviousLessonTitle(lastLesson.title);
      setPreviousLessonSummary(lastLesson.objective || lastLesson.title);
      setLessonNumber(existingLessonsInModule.length + 1);
    } else {
      setPreviousLessonTitle("");
      setPreviousLessonSummary("");
      setLessonNumber(1);
    }
  }, [existingLessonsInModule, moduleId]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep(1);

    try {
      // Step 1: Context analysis
      await new Promise((r) => setTimeout(r, 600));
      setGenerationStep(2);

      // Step 2: 9-Step Pedagogical Flow Structuring
      await new Promise((r) => setTimeout(r, 700));
      setGenerationStep(3);

      // Step 3: AI Script & Code Example Generation
      const result = await generateAILessonPackageWithEngine({
        category,
        courseId,
        courseName: selectedCourse ? selectedCourse.name : "JOXIQ Academy Course",
        level,
        moduleId,
        moduleTitle: moduleTitle || `Module ${moduleId}`,
        lessonNumber,
        topicTitle: topicTitle.trim() || undefined,
        previousLessonTitle: previousLessonTitle.trim() || undefined,
        previousLessonSummary: previousLessonSummary.trim() || undefined,
        nextLessonTitle: nextLessonTitle.trim() || undefined,
        nextLessonSummary: nextLessonSummary.trim() || undefined
      });

      setGenerationStep(4);
      await new Promise((r) => setTimeout(r, 500));

      if (result.success && result.lessonPackage) {
        onLessonGenerated(result.lessonPackage);
        setIsGenerating(false);
        onClose();
      } else {
        setErrorMessage(result.error || "Failed to generate lesson with AI Quality Engine.");
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error("Lesson generation error:", err);
      setErrorMessage(err.message || "An error occurred during AI lesson generation.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/40 text-indigo-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                JOXIQ AI Teaching Quality Engine
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Master Pedagogy v2.5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generates complete 9-step lessons with real-world examples, step-by-step teaching, and interactive quizzes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-bold">Generation Issue</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* 1. Context Information */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 1. Course & Module Curriculum Context
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category & Level</label>
                <div className="flex gap-2">
                  <span className="w-1/2 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 text-xs flex items-center font-semibold">
                    {category}
                  </span>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CourseLevel)}
                    disabled={isGenerating}
                    className="w-1/2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Module Title</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 1: Python Basics & Setup"
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Lesson Topic / Specific Focus</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="e.g. Master Variables, Data Types & Type Casting"
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Natural Sequence / Previous & Next Context */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> 2. Lesson Natural Sequence Context
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Previous Lesson Title (Connection)</label>
                <input
                  type="text"
                  value={previousLessonTitle}
                  onChange={(e) => setPreviousLessonTitle(e.target.value)}
                  placeholder="e.g. Installation & Hello World"
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Next Lesson Title (Bridge)</label>
                <input
                  type="text"
                  value={nextLessonTitle}
                  onChange={(e) => setNextLessonTitle(e.target.value)}
                  placeholder="e.g. Control Flow: If-Else Statements"
                  disabled={isGenerating}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Teaching Quality Rules & Flow Summary */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Teaching Quality & 9-Step Pedagogy Flow
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-300">
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1. Introduce Today's Topic</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2. Why Learn It (Real Value)</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3. Step-by-Step Mechanics</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>4. Real-Life Examples</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>5. Practical Code Samples</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>6. Hands-on Practice Task</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>7. Quiz & Self-Assessment</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>8. Comprehensive Summary</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>9. Next Lesson Bridge</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator when Generating */}
          {isGenerating && (
            <div className="p-5 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-white">AI Teaching Quality Engine at Work...</h4>
                  <p className="text-xs text-indigo-300">
                    {generationStep === 1 && "Step 1/4: Analyzing course context & curriculum sequence..."}
                    {generationStep === 2 && "Step 2/4: Structuring 9-Step Pedagogical Teaching Flow..."}
                    {generationStep === 3 && "Step 3/4: Generating teacher scripts, code examples & quizzes..."}
                    {generationStep === 4 && "Step 4/4: Finalizing content & storing in Firebase backend..."}
                  </p>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                  style={{ width: `${generationStep * 25}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Stored in real Firebase database collection (`course_lessons`).</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? "Generating Lesson..." : "Generate AI Lesson Package"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
