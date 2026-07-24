import React, { useState } from "react";
import { Course, CourseModule, ClassItem, UserCourseProgress } from "../../types/learning";
import { AITeacherClassroom } from "./AITeacherClassroom";
import { isClassLocked } from "../../lib/learningAccess";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  Award,
  Sparkles,
  HelpCircle,
  FileText,
  Target,
  Lightbulb,
  Code2,
  Rocket,
  Check,
  X,
  Zap,
  Bookmark,
  BrainCircuit,
  Volume2,
  Crown,
  Lock
} from "lucide-react";
import Markdown from "react-markdown";

interface ClassViewerProps {
  course: Course;
  currentModule: CourseModule;
  currentClass: ClassItem;
  userProgress?: UserCourseProgress;
  isProUser?: boolean;
  onToggleClassCompleted: (classId: string) => void;
  onSelectClass: (mod: CourseModule, cls: ClassItem) => void;
  onLockedClassClick?: (mod: CourseModule, cls: ClassItem) => void;
  onBackToCourse: () => void;
  onSaveQuizScore?: (classId: string, score: number, total: number, percentage: number) => void;
  onSavePracticeSubmission?: (classId: string, text: string) => void;
  onOpenAIEvaluation?: (currentClass: ClassItem, currentModule: CourseModule, quizScorePercentage: number) => void;
  onOpenCodeStudio?: () => void;
  onOpenProjectBuilder?: () => void;
}

export const ClassViewer: React.FC<ClassViewerProps> = ({
  course,
  currentModule,
  currentClass,
  userProgress,
  isProUser = false,
  onToggleClassCompleted,
  onSelectClass,
  onLockedClassClick,
  onBackToCourse,
  onSaveQuizScore,
  onSavePracticeSubmission,
  onOpenAIEvaluation,
  onOpenCodeStudio,
  onOpenProjectBuilder
}) => {
  const completedClassIds = userProgress?.completedClassIds || [];
  const isCompleted = completedClassIds.includes(currentClass.id);

  // Classroom Mode toggle state: "classroom" by default for immersive AI Teacher experience
  const [viewMode, setViewMode] = useState<"classroom" | "reading">("classroom");

  // State for Interactive Quiz Answer Tracking
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<Record<string, boolean>>({});

  // Practice task input state
  const [practiceInputText, setPracticeInputText] = useState<string>("");
  const isPracticeAlreadySubmitted = Boolean(
    userProgress?.completedPracticeTaskIds?.includes(currentClass.id) ||
    userProgress?.practiceSubmissions?.[currentClass.id]
  );
  const [isPracticeSubmitted, setIsPracticeSubmitted] = useState<boolean>(isPracticeAlreadySubmitted);

  // Flatten all classes across modules to calculate Prev / Next class navigation
  const allCourseClasses: { module: CourseModule; cls: ClassItem }[] = [];
  course.modules.forEach((mod) => {
    mod.classes.forEach((cls) => {
      allCourseClasses.push({ module: mod, cls });
    });
  });

  const currentIndex = allCourseClasses.findIndex((item) => item.cls.id === currentClass.id);
  const prevClass = currentIndex > 0 ? allCourseClasses[currentIndex - 1] : null;
  const nextClass = currentIndex < allCourseClasses.length - 1 ? allCourseClasses[currentIndex + 1] : null;

  const handleSelectClassWithLockCheck = (mod: CourseModule, cls: ClassItem) => {
    if (isClassLocked(cls, mod, isProUser)) {
      if (onLockedClassClick) {
        onLockedClassClick(mod, cls);
      } else {
        alert("This class requires a JOXIQ Pro Membership to unlock.");
      }
    } else {
      onSelectClass(mod, cls);
    }
  };

  const handleOptionSelect = (qId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleCheckQuiz = (qId: string) => {
    setShowQuizResults((prev) => {
      const nextResults = { ...prev, [qId]: true };
      
      // Calculate overall score if all quiz questions answered
      if (currentClass.quiz && currentClass.quiz.length > 0) {
        let correctCount = 0;
        currentClass.quiz.forEach((q) => {
          if (selectedAnswers[q.id] === q.correctOptionIndex) {
            correctCount += 1;
          }
        });
        const totalQ = currentClass.quiz.length;
        const percentage = Math.round((correctCount / totalQ) * 100);

        if (onSaveQuizScore) {
          onSaveQuizScore(currentClass.id, correctCount, totalQ, percentage);
        }
      }

      return nextResults;
    });
  };

  const handlePracticeSubmit = () => {
    if (!practiceInputText.trim() && !isPracticeSubmitted) return;
    setIsPracticeSubmitted(true);
    if (onSavePracticeSubmission) {
      onSavePracticeSubmission(currentClass.id, practiceInputText);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button
            onClick={onBackToCourse}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{course.name}</span>
          </button>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-[120px] sm:max-w-[180px]">{currentModule.title}</span>
          <span>/</span>
          <span className="text-white font-bold truncate max-w-[120px]">{currentClass.title}</span>
        </div>

        {/* View Mode Toggle & Completion Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("classroom")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "classroom"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI Classroom Mode</span>
            </button>

            <button
              onClick={() => setViewMode("reading")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "reading"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reading Mode</span>
            </button>

            {onOpenCodeStudio && (
              <button
                onClick={onOpenCodeStudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer bg-blue-600 hover:bg-blue-500 text-white shadow-md"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Studio</span>
              </button>
            )}

            {onOpenProjectBuilder && (
              <button
                onClick={onOpenProjectBuilder}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md"
              >
                <Rocket className="w-3.5 h-3.5 text-indigo-200" />
                <span>AI Project Builder</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onToggleClassCompleted(currentClass.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-violet-500/40"
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Complete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render AI Teacher Classroom Mode OR Reading Mode */}
      {viewMode === "classroom" ? (
        <AITeacherClassroom
          course={course}
          currentModule={currentModule}
          currentClass={currentClass}
          userProgress={userProgress}
          onToggleClassCompleted={onToggleClassCompleted}
          onBackToCourse={onBackToCourse}
          onNextClass={nextClass ? () => handleSelectClassWithLockCheck(nextClass.module, nextClass.cls) : undefined}
          onPrevClass={prevClass ? () => handleSelectClassWithLockCheck(prevClass.module, prevClass.cls) : undefined}
        />
      ) : (
        <>
          {/* Main Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Rich Class Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
            
            {/* 1. Header & Class Meta */}
            <div className="border-b border-slate-800 pb-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Class {currentClass.classNumber} / 100
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Level: {currentModule.level}
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> {currentClass.duration}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {currentClass.title}
              </h1>
            </div>

            {/* 2. Learning Objective Card */}
            <div className="bg-gradient-to-r from-violet-950/40 via-slate-950 to-indigo-950/40 border border-violet-500/30 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-violet-400">
                <Target className="w-4 h-4" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Learning Objective</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {currentClass.learningObjective}
              </p>
            </div>

            {/* 3. Real-Life Usage & Purpose Card */}
            {currentClass.realLifeUsage && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800/80 pb-3">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider">Why You Need This & Real-Life Usage</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider text-violet-300">
                      Why Students Need It
                    </span>
                    <p className="text-slate-300 leading-relaxed">{currentClass.realLifeUsage.whyNeeded}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider text-emerald-300">
                      Real-World Application
                    </span>
                    <p className="text-slate-300 leading-relaxed">{currentClass.realLifeUsage.realWorldApplication}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider text-amber-300">
                      How It Builds Skills
                    </span>
                    <p className="text-slate-300 leading-relaxed">{currentClass.realLifeUsage.skillImpact}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. What You Will Learn Takeaways */}
            {currentClass.whatYouWillLearn && currentClass.whatYouWillLearn.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  Key Takeaways
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentClass.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Topic Explanation (Markdown Lesson) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Lesson Explanation & Concepts
              </h3>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
                <Markdown>{currentClass.explanationTopic}</Markdown>
              </div>
            </div>

            {/* 6. Code / Practical Examples */}
            {currentClass.examples && currentClass.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  Practical Example Code
                </h3>
                {currentClass.examples.map((ex, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>{ex.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Run Example</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950 overflow-x-auto leading-relaxed">
                      <code>{ex.codeOrText}</code>
                    </pre>
                    <div className="p-3 bg-slate-900/40 text-xs text-slate-400 border-t border-slate-850">
                      {ex.explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. Hands-On Practice Task */}
            {currentClass.practiceTask && (
              <div className="bg-slate-950 border border-violet-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider">Hands-On Practice Exercise</h3>
                  </div>

                  {isPracticeSubmitted && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Practice Completed
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentClass.practiceTask}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <textarea
                    value={practiceInputText}
                    onChange={(e) => setPracticeInputText(e.target.value)}
                    disabled={isPracticeSubmitted}
                    placeholder="Type your solution, code, or answer here..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 min-h-[90px] resize-y"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={handlePracticeSubmit}
                      disabled={isPracticeSubmitted || !practiceInputText.trim()}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isPracticeSubmitted ? "Submitted & Verified" : "Submit Practice Exercise"}</span>
                    </button>

                    {onOpenAIEvaluation && (
                      <button
                        onClick={() => onOpenAIEvaluation(currentClass, currentModule, 90)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-violet-500/30 text-violet-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
                        <span>Get AI Feedback</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 8. Interactive Quiz */}
            {currentClass.quiz && currentClass.quiz.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Knowledge Check Quiz
                  </h3>

                  {onOpenAIEvaluation && (
                    <button
                      onClick={() => {
                        let score = 80;
                        if (currentClass.quiz) {
                          let correct = 0;
                          currentClass.quiz.forEach((q) => {
                            if (selectedAnswers[q.id] === q.correctOptionIndex) correct++;
                          });
                          score = Math.round((correct / currentClass.quiz.length) * 100);
                        }
                        onOpenAIEvaluation(currentClass, currentModule, score);
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>View AI Evaluation</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {currentClass.quiz.map((q, qIdx) => {
                    const selectedIdx = selectedAnswers[q.id];
                    const isSubmitted = showQuizResults[q.id];
                    const isCorrect = selectedIdx === q.correctOptionIndex;

                    return (
                      <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-amber-400 shrink-0">Q{qIdx + 1}:</span>
                          <span>{q.question}</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            let optionClass = "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700";
                            
                            if (selectedIdx === optIdx) {
                              optionClass = "bg-violet-600/20 border-violet-500 text-violet-200 font-bold";
                            }

                            if (isSubmitted) {
                              if (optIdx === q.correctOptionIndex) {
                                optionClass = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                              } else if (selectedIdx === optIdx) {
                                optionClass = "bg-rose-500/20 border-rose-500 text-rose-200";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => !isSubmitted && handleOptionSelect(q.id, optIdx)}
                                disabled={isSubmitted}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optionClass}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && optIdx === q.correctOptionIndex && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                                {isSubmitted && selectedIdx === optIdx && optIdx !== q.correctOptionIndex && (
                                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit Answer Button */}
                        {!isSubmitted && selectedIdx !== undefined && (
                          <button
                            onClick={() => handleCheckQuiz(q.id)}
                            className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
                          >
                            Check Answer
                          </button>
                        )}

                        {/* Explanation Result Box */}
                        {isSubmitted && (
                          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            isCorrect ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                          }`}>
                            <span className="font-bold block mb-1">
                              {isCorrect ? "Correct!" : "Incorrect"}
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 9. Homework Assignment */}
            {currentClass.homework && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <FileText className="w-4 h-4" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider">Homework Assignment</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentClass.homework}
                </p>
              </div>
            )}

            {/* 10. Bottom Next/Prev Class Controls */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
              {prevClass ? (
                <button
                  onClick={() => onSelectClass(prevClass.module, prevClass.cls)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous:</span> {prevClass.cls.title}
                </button>
              ) : (
                <div />
              )}

              {nextClass ? (
                <button
                  onClick={() => onSelectClass(nextClass.module, nextClass.cls)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-600/20 transition-all cursor-pointer ml-auto"
                >
                  <span>Next: {nextClass.cls.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onBackToCourse}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer ml-auto"
                >
                  <Award className="w-4 h-4" />
                  <span>Finish Course</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (4 cols): Course Navigation Syllabus */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Syllabus Navigator
            </h3>
            <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
              {completedClassIds.length} / 100 Classes
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {course.modules.map((mod) => (
              <div key={mod.id} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-wider pl-1">
                  <span>{mod.title}</span>
                  <span className="text-[9px] text-indigo-400 font-mono">Level: {mod.level}</span>
                </div>
                <div className="space-y-1">
                  {mod.classes.map((cls) => {
                    const isActive = cls.id === currentClass.id;
                    const isDone = completedClassIds.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        onClick={() => onSelectClass(mod, cls)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                          isActive
                            ? "bg-violet-600/20 text-violet-200 font-bold border border-violet-500/40"
                            : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-700"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold leading-tight">Class {cls.classNumber}: {cls.title.replace(/^Class \d+:\s*/, "")}</p>
                          <span className="text-[10px] text-slate-500">{cls.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      </>
      )}
    </div>
  );
};
