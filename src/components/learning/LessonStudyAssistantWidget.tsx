import React, { useState, useEffect } from "react";
import { Course, CourseModule, ClassItem } from "../../types/learning";
import {
  BeforeClassBrief,
  ConceptCheckQuestion,
  AfterClassSummary,
  NoteCategory
} from "../../types/studyAssistant";
import {
  saveSmartNote,
  getAIMemory,
  recordLessonCompletionMemory,
  recordPastMistake,
  saveLessonSummary
} from "../../lib/studyAssistantStorage";
import {
  Brain,
  Sparkles,
  Target,
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  AlertTriangle,
  RotateCcw,
  Zap,
  BookmarkPlus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Layers
} from "lucide-react";

interface LessonStudyAssistantWidgetProps {
  course: Course;
  currentModule: CourseModule;
  currentClass: ClassItem;
  stage?: "before" | "during" | "after" | "all";
  onCompleteClass?: () => void;
  onOpenCodeStudio?: () => void;
  onOpenProjectBuilder?: () => void;
}

export const LessonStudyAssistantWidget: React.FC<LessonStudyAssistantWidgetProps> = ({
  course,
  currentModule,
  currentClass,
  stage = "all",
  onCompleteClass,
  onOpenCodeStudio,
  onOpenProjectBuilder
}) => {
  const [activeTab, setActiveTab] = useState<"before" | "during" | "after" | "quick">("before");
  
  // Before Class Brief state
  const [beforeBrief, setBeforeBrief] = useState<BeforeClassBrief | null>(null);
  const [loadingBefore, setLoadingBefore] = useState<boolean>(false);

  // During Class Concept Check state
  const [duringCheck, setDuringCheck] = useState<ConceptCheckQuestion | null>(null);
  const [loadingDuring, setLoadingDuring] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);

  // After Class Summary state
  const [afterSummary, setAfterSummary] = useState<AfterClassSummary | null>(null);
  const [loadingAfter, setLoadingAfter] = useState<boolean>(false);
  const [savedNoteSuccess, setSavedNoteSuccess] = useState<boolean>(false);

  // Quick Revision state
  const [quickMode, setQuickMode] = useState<"2min" | "5min" | "full">("2min");
  const [quickData, setQuickData] = useState<any>(null);
  const [loadingQuick, setLoadingQuick] = useState<boolean>(false);

  // Automatically fetch Before Class brief on mount or when class changes
  useEffect(() => {
    fetchBeforeBrief();
  }, [currentClass.id]);

  const courseName = course.name || (course as any).title || "JOXIQ Course";

  const fetchBeforeBrief = async () => {
    setLoadingBefore(true);
    try {
      const res = await fetch("/api/learning/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "before_class_brief",
          courseName: courseName,
          className: currentClass.title,
          classNumber: currentClass.classNumber,
          level: currentModule.level,
          description: currentClass.learningObjective || currentClass.whatYouWillLearn?.join(", ") || ""
        })
      });
      const data = await res.json();
      if (data.data) {
        setBeforeBrief({
          classId: currentClass.id,
          ...data.data
        });
      }
    } catch (e) {
      console.error("Error fetching before brief:", e);
    } finally {
      setLoadingBefore(false);
    }
  };

  const fetchDuringCheck = async () => {
    setLoadingDuring(true);
    setAnswerSubmitted(false);
    setSelectedOption(null);
    try {
      const mem = getAIMemory();
      const res = await fetch("/api/learning/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "during_class_check",
          courseName: courseName,
          className: currentClass.title,
          level: currentModule.level,
          studentMemory: mem
        })
      });
      const data = await res.json();
      if (data.data) {
        setDuringCheck(data.data);
      }
    } catch (e) {
      console.error("Error fetching during check:", e);
    } finally {
      setLoadingDuring(false);
    }
  };

  const fetchAfterSummary = async () => {
    setLoadingAfter(true);
    try {
      const res = await fetch("/api/learning/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "after_class_summary",
          courseName: courseName,
          className: currentClass.title,
          level: currentModule.level
        })
      });
      const data = await res.json();
      if (data.data) {
        const fullSummary: AfterClassSummary = {
          classId: currentClass.id,
          className: currentClass.title,
          courseName: courseName,
          ...data.data
        };
        setAfterSummary(fullSummary);
        saveLessonSummary(currentClass.id, fullSummary);
        
        // Record completion into memory
        recordLessonCompletionMemory(
          course.id,
          courseName,
          currentClass.id,
          currentClass.title,
          currentModule.title
        );
      }
    } catch (e) {
      console.error("Error fetching after summary:", e);
    } finally {
      setLoadingAfter(false);
    }
  };

  const fetchQuickRevision = async (mode: "2min" | "5min" | "full") => {
    setQuickMode(mode);
    setLoadingQuick(true);
    try {
      const res = await fetch("/api/learning/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick_revision",
          courseName: courseName,
          className: currentClass.title,
          revisionMode: mode
        })
      });
      const data = await res.json();
      if (data.data) {
        setQuickData(data.data);
      }
    } catch (e) {
      console.error("Error fetching quick revision:", e);
    } finally {
      setLoadingQuick(false);
    }
  };

  const handleSaveSmartNote = () => {
    if (!afterSummary) return;
    
    // Auto categorize based on course domain
    let category: NoteCategory = "Class Notes";
    const lowerCourse = courseName.toLowerCase();
    if (lowerCourse.includes("web") || lowerCourse.includes("react") || lowerCourse.includes("code")) {
      category = "Web Development Notes";
    } else if (lowerCourse.includes("ai") || lowerCourse.includes("machine") || lowerCourse.includes("python")) {
      category = "AI Engineering Notes";
    } else if (lowerCourse.includes("business") || lowerCourse.includes("startup")) {
      category = "Business Notes";
    }

    const codeSnippetSample = currentClass.examples?.[0]?.codeOrText || `// Code example for ${currentClass.title}`;

    saveSmartNote({
      title: `${currentClass.title} - AI Smart Notes`,
      content: `${afterSummary.summary}\n\n**Key Points:**\n${afterSummary.keyPoints.map(p => `- ${p}`).join("\n")}\n\n**Common Mistakes to Avoid:**\n${afterSummary.commonMistakes.map(m => `- ${m}`).join("\n")}`,
      category: category,
      courseId: course.id,
      courseName: courseName,
      classId: currentClass.id,
      className: currentClass.title,
      tags: [courseName.split(" ")[0], currentModule.level, "AI Summary"],
      keyTakeaways: afterSummary.keyPoints,
      codeSnippet: codeSnippetSample
    });

    setSavedNoteSuccess(true);
    setTimeout(() => setSavedNoteSuccess(false), 3000);
  };

  const handleCheckAnswer = (index: number) => {
    setSelectedOption(index);
    setAnswerSubmitted(true);
    if (duringCheck && index !== duringCheck.checkQuestion.correctIndex) {
      recordPastMistake(`Mistake on ${currentClass.title}: Chosen "${duringCheck.checkQuestion.options[index]}" instead of "${duringCheck.checkQuestion.options[duringCheck.checkQuestion.correctIndex]}"`);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Top Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">JOXIQ AI Study Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">Guiding you before, during, and after every lesson</p>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("before")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "before"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Before Class</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("during");
              if (!duringCheck) fetchDuringCheck();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "during"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            <span>2. During Class</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("after");
              if (!afterSummary) fetchAfterSummary();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "after"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. After Class</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("quick");
              if (!quickData) fetchQuickRevision("2min");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "quick"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Quick Revision</span>
          </button>
        </div>
      </div>

      {/* ---------------- PHASE 1: BEFORE CLASS ---------------- */}
      {activeTab === "before" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {loadingBefore ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
              <p className="text-xs">Preparing Today's Learning Brief...</p>
            </div>
          ) : beforeBrief ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Learning Goal */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
                  <Target className="w-4 h-4" />
                  <span>TODAY'S LEARNING GOAL</span>
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {beforeBrief.learningGoal}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Estimated Duration: <strong className="text-slate-200">{beforeBrief.estimatedDurationMinutes} Mins</strong></span>
                </div>
              </div>

              {/* Skills Gained */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>SKILLS YOU WILL GAIN</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {beforeBrief.skillsGained.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-300"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Prerequisites */}
              <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-1">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>REQUIRED KNOWLEDGE BEFORE STARTING</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {beforeBrief.requiredKnowledge.map((req, idx) => (
                      <span key={idx} className="text-xs text-slate-300 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-md">
                        • {req}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("during");
                    if (!duringCheck) fetchDuringCheck();
                  }}
                  className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Start Learning with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <button
                onClick={fetchBeforeBrief}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs hover:bg-slate-700"
              >
                Generate Before Class Brief
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- PHASE 2: DURING CLASS ---------------- */}
      {activeTab === "during" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {loadingDuring ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Brain className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
              <p className="text-xs">Generating Clear Concept Explanation & Check Question...</p>
            </div>
          ) : duringCheck ? (
            <div className="space-y-4">
              {/* Concept & Real life example */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>CONCEPT BREAKDOWN & REAL-LIFE EXAMPLE</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium mb-3">
                  {duringCheck.explanation}
                </p>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-200">
                  <strong className="text-amber-300">💡 Real-Life Analogy:</strong> {duringCheck.realLifeExample}
                </div>
              </div>

              {/* Check Question before moving forward */}
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    UNDERSTANDING CHECK QUESTION
                  </span>
                  <span className="text-[10px] text-slate-400">Verify understanding before next step</span>
                </div>

                <p className="text-xs font-semibold text-slate-200 mb-3">
                  {duringCheck.checkQuestion.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {duringCheck.checkQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === duringCheck.checkQuestion.correctIndex;
                    let style = "bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500/50";

                    if (answerSubmitted) {
                      if (isCorrect) {
                        style = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold";
                      } else if (isSelected) {
                        style = "bg-rose-950/80 border-rose-500 text-rose-200 font-bold";
                      } else {
                        style = "bg-slate-900/50 border-slate-800 text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={answerSubmitted}
                        onClick={() => handleCheckAnswer(idx)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{option}</span>
                        {answerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {answerSubmitted && (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-300">AI Teacher Insight: </span>
                      {duringCheck.checkQuestion.explanation}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={fetchDuringCheck}
                  className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-lg text-xs hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Another Concept Check</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("after");
                    if (!afterSummary) fetchAfterSummary();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  <span>Class Done? Get Summary & Smart Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <button
                onClick={fetchDuringCheck}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-500"
              >
                Explain Concept & Ask Check Question
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- PHASE 3: AFTER CLASS ---------------- */}
      {activeTab === "after" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {loadingAfter ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
              <p className="text-xs">Generating Lesson Summary, Key Definitions & Smart Notes...</p>
            </div>
          ) : afterSummary ? (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>LESSON SUMMARY</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
                    {afterSummary.className}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {afterSummary.summary}
                </p>
              </div>

              {/* Grid: Key Points & Important Definitions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Points */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>KEY POINTS</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {afterSummary.keyPoints.map((kp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Important Definitions */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>IMPORTANT DEFINITIONS</span>
                  </div>
                  <div className="space-y-2">
                    {afterSummary.importantDefinitions.map((def, idx) => (
                      <div key={idx} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs">
                        <span className="font-bold text-indigo-300">{def.term}: </span>
                        <span className="text-slate-300">{def.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Common Mistakes & Revision Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Mistakes */}
                <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>COMMON MISTAKES TO AVOID</span>
                  </div>
                  <ul className="space-y-1 text-xs text-rose-200/90">
                    {afterSummary.commonMistakes.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Revision Notes */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>REVISION NOTES</span>
                  </div>
                  <ul className="space-y-1 text-xs text-amber-200/90">
                    {afterSummary.revisionNotes.map((rn, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>📌</span>
                        <span>{rn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Smart Next Suggestions & Save Smart Note Button */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Smart Recommendations</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong>Extra Challenge:</strong> {afterSummary.extraPracticeTask}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveSmartNote}
                    disabled={savedNoteSuccess}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      savedNoteSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                    }`}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>{savedNoteSuccess ? "Saved to Smart Notes!" : "Save to Smart Notes"}</span>
                  </button>

                  {onCompleteClass && (
                    <button
                      onClick={onCompleteClass}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30"
                    >
                      Mark Class Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              <button
                onClick={fetchAfterSummary}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500"
              >
                Generate Lesson Summary & Notes
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- PHASE 4: QUICK REVISION ---------------- */}
      {activeTab === "quick" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => fetchQuickRevision("2min")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                quickMode === "2min"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚡ 2-Min Blitz
            </button>
            <button
              onClick={() => fetchQuickRevision("5min")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                quickMode === "5min"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏱️ 5-Min Recap
            </button>
            <button
              onClick={() => fetchQuickRevision("full")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                quickMode === "full"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📜 Full Revision
            </button>
          </div>

          {loadingQuick ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Zap className="w-6 h-6 text-amber-400 animate-bounce mb-2" />
              <p className="text-xs">Generating {quickMode} quick revision sheet...</p>
            </div>
          ) : quickData ? (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-amber-400">{quickData.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {quickData.mode.toUpperCase()} MODE
                </span>
              </div>

              <div className="space-y-1.5">
                {quickData.bullets?.map((b: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-lg">
                <div className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Golden Rule / Takeaway</div>
                <p className="text-xs font-semibold text-slate-100">{quickData.keyTakeaway}</p>
              </div>

              {quickData.codeHighlights && quickData.codeHighlights.length > 0 && (
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto">
                  <pre>{quickData.codeHighlights.join("\n")}</pre>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
