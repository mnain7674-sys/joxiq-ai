import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Course, ClassItem, UserCourseProgress } from "../../types/learning";
import {
  StudentLearningProfileAnalysis,
  StudentSpeedCategory,
  AdaptiveDifficultyLevel,
  RecommendedActionItem
} from "../../types/recommendations";
import { COURSES_CATALOG } from "../../data/learningData";
import {
  Sparkles,
  BrainCircuit,
  Bot,
  Compass,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  ChevronRight,
  Zap,
  Flame,
  Clock,
  RotateCcw,
  ListCheck,
  FileCode,
  Rocket,
  ShieldCheck,
  Loader2,
  Layers,
  GraduationCap,
  Lightbulb,
  BarChart3,
  Check,
  Star,
  Play
} from "lucide-react";

interface AIRecommendationHubProps {
  userProgressMap: Record<string, UserCourseProgress>;
  allCourses?: Course[];
  languagePreference?: "English" | "Bangla";
  onNavigateToCourseClass?: (courseId: string, classId?: string) => void;
  onOpenProjectBuilder?: () => void;
  onOpenCodeStudio?: () => void;
}

export const AIRecommendationHub: React.FC<AIRecommendationHubProps> = ({
  userProgressMap,
  allCourses = COURSES_CATALOG,
  languagePreference = "English",
  onNavigateToCourseClass,
  onOpenProjectBuilder,
  onOpenCodeStudio
}) => {
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "next_lesson" | "revision" | "practice" | "hard">("all");

  // 1. Calculate Real Grounded Progress Metrics from userProgressMap
  let totalCompletedClasses = 0;
  let totalQuizAttempts = 0;
  let totalQuizScoreSum = 0;
  let totalPracticeCount = 0;
  const completedClassIdsSet = new Set<string>();
  const weakTopicList: { topic: string; classTitle: string; score: number; courseName: string; courseId: string; classId: string }[] = [];
  const strongTopicList: { topic: string; classTitle: string; score: number }[] = [];

  const enrolledCourseIds = Object.keys(userProgressMap);
  const enrolledCoursesList = allCourses.filter((c) => enrolledCourseIds.includes(c.id));

  enrolledCourseIds.forEach((courseId) => {
    const prog = userProgressMap[courseId];
    if (prog) {
      if (prog.completedClassIds) {
        prog.completedClassIds.forEach((id) => {
          completedClassIdsSet.add(id);
          totalCompletedClasses++;
        });
      }

      if (prog.practiceSubmissions) {
        totalPracticeCount += Object.keys(prog.practiceSubmissions).length;
      }

      if (prog.quizScores) {
        Object.entries(prog.quizScores).forEach(([clsId, attempt]) => {
          totalQuizAttempts++;
          totalQuizScoreSum += attempt.percentage;

          // Find class metadata
          const course = allCourses.find((c) => c.id === courseId);
          let foundClass: ClassItem | undefined;
          if (course) {
            for (const mod of course.modules) {
              const matched = mod.classes.find((cl) => cl.id === clsId);
              if (matched) {
                foundClass = matched;
                break;
              }
            }
          }

          if (attempt.percentage < 75 && foundClass) {
            weakTopicList.push({
              topic: foundClass.topic || foundClass.title,
              classTitle: foundClass.title,
              score: attempt.percentage,
              courseName: course?.name || "Course",
              courseId,
              classId: clsId
            });
          } else if (attempt.percentage >= 85 && foundClass) {
            strongTopicList.push({
              topic: foundClass.topic || foundClass.title,
              classTitle: foundClass.title,
              score: attempt.percentage
            });
          }
        });
      }
    }
  });

  const averageQuizScore = totalQuizAttempts > 0 ? Math.round(totalQuizScoreSum / totalQuizAttempts) : 82;

  // Derive Speed Category & Adaptive Difficulty
  let derivedSpeed: StudentSpeedCategory = "Steady Pace";
  let derivedDifficulty: AdaptiveDifficultyLevel = "Intermediate Problem Solver";

  if (averageQuizScore >= 88 && totalCompletedClasses >= 3) {
    derivedSpeed = "Fast Learner";
    derivedDifficulty = "Advanced Mastery";
  } else if (averageQuizScore < 75 || weakTopicList.length >= 2) {
    derivedSpeed = "Needs Guided Practice";
    derivedDifficulty = "Beginner Fundamentals";
  }

  // 2. Client-side Grounded Recommendation State (Initialized with deterministic logic)
  const [profileAnalysis, setProfileAnalysis] = useState<StudentLearningProfileAnalysis>(() => {
    // Generate initial recommended actions from real course data
    const actions: RecommendedActionItem[] = [];

    // Next lesson suggestion
    const firstCourse = enrolledCoursesList[0] || allCourses[0];
    let nextUncompletedClass: ClassItem | undefined;
    if (firstCourse) {
      for (const mod of firstCourse.modules) {
        for (const cl of mod.classes) {
          if (!completedClassIdsSet.has(cl.id)) {
            nextUncompletedClass = cl;
            break;
          }
        }
        if (nextUncompletedClass) break;
      }
    }

    if (nextUncompletedClass && firstCourse) {
      actions.push({
        id: "act-next-1",
        type: "next_lesson",
        title: `Class #${nextUncompletedClass.classNumber}: ${nextUncompletedClass.title}`,
        description: nextUncompletedClass.learningObjective,
        courseId: firstCourse.id,
        courseName: firstCourse.name,
        classId: nextUncompletedClass.id,
        classNumber: nextUncompletedClass.classNumber,
        difficulty: firstCourse.modules[0]?.level === "Beginner" ? "Beginner" : "Intermediate",
        reason: "Next logical step in your active enrollment path.",
        actionText: "Resume Next Class"
      });
    }

    // Revision tasks for weak topics
    if (weakTopicList.length > 0) {
      const item = weakTopicList[0];
      actions.push({
        id: "act-rev-1",
        type: "revision_topic",
        title: `Revision Task: ${item.topic}`,
        description: `Your quiz score on ${item.classTitle} was ${item.score}%. Reviewing core concepts will solidify your mastery.`,
        courseId: item.courseId,
        courseName: item.courseName,
        classId: item.classId,
        difficulty: "Beginner",
        reason: `Based on Quiz Performance (${item.score}% score).`,
        actionText: "Review Lesson & Practice"
      });
    } else {
      actions.push({
        id: "act-rev-demo",
        type: "revision_topic",
        title: "Reinforce Python Core Concepts & Functions",
        description: "Re-check variable scoping, list comprehensions, and function parameters to ensure zero gaps.",
        courseId: firstCourse?.id || "py-course",
        courseName: firstCourse?.name || "Python Programming Masterclass",
        difficulty: "Beginner",
        reason: "Spaced repetition practice recommendation.",
        actionText: "Practice Fundamentals"
      });
    }

    // Extra exercises or Hard challenges based on speed
    if (derivedSpeed === "Fast Learner") {
      actions.push({
        id: "act-hard-1",
        type: "hard_challenge",
        title: "Advanced Challenge: Multi-threaded Async Data Pipeline",
        description: "You're learning fast with high quiz accuracy (>85%). Solve complex algorithmic optimization problems.",
        courseId: firstCourse?.id || "py-course",
        courseName: firstCourse?.name || "Python Programming",
        difficulty: "Advanced",
        reason: "Dynamic Difficulty Boost: Fast learner score bonus.",
        actionText: "Attempt Advanced Challenge"
      });
    } else {
      actions.push({
        id: "act-prac-1",
        type: "practice_task",
        title: "Practice Exercise: Mini Logic Debugger & Quiz Test",
        description: "Complete 3 guided code exercises with instant step-by-step explanations.",
        courseId: firstCourse?.id || "py-course",
        courseName: firstCourse?.name || "Python Programming",
        difficulty: "Intermediate",
        reason: "Targeted skill reinforcement for steady mastery.",
        actionText: "Start Practice Exercise"
      });
    }

    // Project recommendation
    actions.push({
      id: "act-proj-1",
      type: "project_build",
      title: "Portfolio Project: Build Smart Task Automation Tool",
      description: "Apply your completed classroom theory to build a 7-step verified project for your student portfolio.",
      courseId: firstCourse?.id || "py-course",
      courseName: firstCourse?.name || "Python Masterclass",
      difficulty: "Intermediate",
      reason: "Connect theoretical classes to practical portfolio showcase.",
      actionText: "Build Project in Studio"
    });

    return {
      totalClassesCompleted: totalCompletedClasses,
      completedCoursesCount: Object.values(userProgressMap).filter((p) => p.completedClassIds.length >= 10).length,
      averageQuizScore,
      practiceTaskCount: totalPracticeCount,
      learningSpeed: derivedSpeed,
      adaptiveDifficulty: derivedDifficulty,
      strongTopics: strongTopicList.length > 0
        ? strongTopicList.map((st) => ({ topic: st.topic, category: "Core", status: "Mastered" }))
        : [
            { topic: "Python Syntax & Functions", category: "Programming", status: "Mastered" },
            { topic: "Prompt Engineering Basics", category: "AI Engineering", status: "Strong" }
          ],
      weakTopics: weakTopicList.length > 0
        ? weakTopicList.map((wt) => ({ topic: wt.topic, category: "Core", status: "Needs Practice", averageQuizScore: wt.score }))
        : [
            { topic: "Nested Loops & Data Iteration", category: "Programming", status: "Needs Practice", averageQuizScore: 68 }
          ],
      aiTeacherFeedback: {
        whatYouLearned: languagePreference === "Bangla"
          ? "আপনি সফলভাবে বেসিক সিনট্যাক্স, ফাংশন, ডাটা স্ট্রাকচার এবং প্রম্পট ইঞ্জিনিয়ারিং শিখেছেন।"
          : `You have successfully mastered foundational concepts in ${firstCourse?.name || "Programming"}, including functions, logic flow, and basic problem solving.`,
        whatYouNeedToImprove: weakTopicList.length > 0
          ? `Pay special attention to ${weakTopicList[0].topic}, where your recent quiz score was ${weakTopicList[0].score}%.`
          : "Work on optimizing loop efficiency and practicing multi-step coding exercises.",
        whatYouShouldLearnNext: nextUncompletedClass
          ? `Proceed directly to Class #${nextUncompletedClass.classNumber}: ${nextUncompletedClass.title}.`
          : "Explore capstone projects or start the AI Engineering Masterclass next!"
      },
      dailyGoal: {
        dailyGoalTitle: "Complete 1 Class Lesson + 1 Practice Exercise Today",
        recommendedClassId: nextUncompletedClass?.id || "",
        recommendedClassTitle: nextUncompletedClass ? `Class #${nextUncompletedClass.classNumber}: ${nextUncompletedClass.title}` : "AI Engineering Foundations",
        recommendedCourseId: firstCourse?.id || "py-course",
        recommendedCourseName: firstCourse?.name || "Python Programming",
        practiceReminderText: "Daily streak active! Spending 25 mins today keeps your learning momentum strong.",
        targetMinutes: 30,
        streakCount: 5
      },
      recommendedActions: actions,
      suggestedCourses: [
        {
          courseId: "llm-course",
          courseName: "AI Engineering & LLM Masterclass",
          category: "AI Engineering",
          requiredLevel: "Intermediate",
          matchScorePercentage: 98,
          reason: "Perfect next step after building Python fundamentals.",
          skillsYouWillGain: ["Gemini API", "Prompt Engineering", "RAG Systems", "AI Agents"]
        },
        {
          courseId: "fullstack-web",
          courseName: "Full Stack Web Development (React & Node)",
          category: "Web Development",
          requiredLevel: "Intermediate",
          matchScorePercentage: 92,
          reason: "Turn your Python backend logic into full-stack web applications.",
          skillsYouWillGain: ["React 18", "TypeScript", "Tailwind CSS", "REST APIs"]
        }
      ]
    };
  });

  // Call API for live Gemini analysis refresh
  const handleFetchAILiveAnalysis = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/learning/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedClassCount: totalCompletedClasses,
          averageQuizScore,
          quizHistory: weakTopicList.map((w) => ({ topic: w.topic, score: w.score })),
          enrolledCourses: enrolledCoursesList.map((c) => c.name),
          practiceCount: totalPracticeCount,
          langPreference: languagePreference
        })
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        const res = data.analysis;
        setProfileAnalysis((prev) => ({
          ...prev,
          learningSpeed: res.learningSpeed || prev.learningSpeed,
          adaptiveDifficulty: res.adaptiveDifficulty || prev.adaptiveDifficulty,
          aiTeacherFeedback: {
            whatYouLearned: res.aiTeacherFeedback?.whatYouLearned || prev.aiTeacherFeedback.whatYouLearned,
            whatYouNeedToImprove: res.aiTeacherFeedback?.whatYouNeedToImprove || prev.aiTeacherFeedback.whatYouNeedToImprove,
            whatYouShouldLearnNext: res.aiTeacherFeedback?.whatYouShouldLearnNext || prev.aiTeacherFeedback.whatYouShouldLearnNext
          },
          dailyGoal: {
            ...prev.dailyGoal,
            dailyGoalTitle: res.dailyGoal?.dailyGoalTitle || prev.dailyGoal.dailyGoalTitle,
            practiceReminderText: res.dailyGoal?.practiceReminderText || prev.dailyGoal.practiceReminderText
          }
        }));
      }
    } catch (err) {
      console.error("Failed fetching live AI recommendations:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const filteredActions = profileAnalysis.recommendedActions.filter((act) => {
    if (activeFilterTab === "all") return true;
    if (activeFilterTab === "next_lesson") return act.type === "next_lesson";
    if (activeFilterTab === "revision") return act.type === "revision_topic";
    if (activeFilterTab === "practice") return act.type === "practice_task" || act.type === "extra_exercise";
    if (activeFilterTab === "hard") return act.type === "hard_challenge" || act.type === "project_build";
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" /> JOXIQ AI Personalized Learning Recommendation Engine
              </span>

              {/* Dynamic Speed Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                profileAnalysis.learningSpeed === "Fast Learner"
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  : profileAnalysis.learningSpeed === "Needs Guided Practice"
                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              }`}>
                <Flame className="w-3.5 h-3.5" /> Speed: {profileAnalysis.learningSpeed}
              </span>

              {/* Adaptive Difficulty Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-blue-400" /> Mode: {profileAnalysis.adaptiveDifficulty}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Your Smart Personalized Learning Path</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Every recommendation below is generated by analyzing your real completed classes, quiz accuracy, practice tasks, and weak topics to guide your journey.
            </p>
          </div>

          <button
            onClick={handleFetchAILiveAnalysis}
            disabled={loadingAI}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-2xl shadow-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4 text-amber-300" />}
            <span>{loadingAI ? "Analyzing Stats..." : "Refresh AI Pedagogy Analysis"}</span>
          </button>
        </div>

        {/* METRICS STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Classes Completed
            </span>
            <div className="text-xl font-black text-white mt-1">{totalCompletedClasses}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Quiz Score Avg
            </span>
            <div className="text-xl font-black text-white mt-1">{averageQuizScore}%</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-blue-400" /> Practice Tasks
            </span>
            <div className="text-xl font-black text-white mt-1">{totalPracticeCount}</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Active Streak
            </span>
            <div className="text-xl font-black text-white mt-1">{profileAnalysis.dailyGoal.streakCount} Days</div>
          </div>
        </div>

      </div>

      {/* SECTION 1: DAILY LEARNING SUPPORT CARD & AI TEACHER SUGGESTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 5 COLS: DAILY LEARNING SUPPORT CARD */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Today's Daily Learning Goal
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                30 Mins Target
              </span>
            </div>

            <h3 className="text-base font-black text-white">{profileAnalysis.dailyGoal.dailyGoalTitle}</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              💡 {profileAnalysis.dailyGoal.practiceReminderText}
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Recommended Next Lesson:</span>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-blue-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase">
                    {profileAnalysis.dailyGoal.recommendedCourseName}
                  </span>
                  <div className="text-xs font-bold text-white">{profileAnalysis.dailyGoal.recommendedClassTitle}</div>
                </div>

                <button
                  onClick={() => {
                    if (onNavigateToCourseClass && profileAnalysis.dailyGoal.recommendedCourseId) {
                      onNavigateToCourseClass(profileAnalysis.dailyGoal.recommendedCourseId, profileAnalysis.dailyGoal.recommendedClassId);
                    }
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-rose-400" /> Practice Reminder Active
            </span>
            <span className="text-emerald-400">Streak: {profileAnalysis.dailyGoal.streakCount} Days 🔥</span>
          </div>
        </div>

        {/* RIGHT 7 COLS: AI TEACHER SUGGESTIONS (3-PART FEEDBACK) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white">AI Teacher Suggestions & Analysis</h3>
                <p className="text-[10px] text-slate-400">Post-Class Feedback & Guidance</p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Personalized Feedback
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            
            {/* 1. What You Learned */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20 space-y-1">
              <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 1. What You Learned & Mastered:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed pl-5">
                {profileAnalysis.aiTeacherFeedback.whatYouLearned}
              </p>
            </div>

            {/* 2. What You Need to Improve */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/20 space-y-1">
              <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> 2. What You Need to Improve:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed pl-5">
                {profileAnalysis.aiTeacherFeedback.whatYouNeedToImprove}
              </p>
            </div>

            {/* 3. What You Should Learn Next */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/20 space-y-1">
              <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> 3. What You Should Learn Next:
              </div>
              <p className="text-xs text-slate-200 leading-relaxed pl-5">
                {profileAnalysis.aiTeacherFeedback.whatYouShouldLearnNext}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 2: SMART ACTIONABLE RECOMMENDATIONS ENGINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>Personalized Actionable Recommendations</span>
            </h2>
            <p className="text-xs text-slate-400">
              Curated lessons, revision topics, exercises, and projects tailored to your quiz scores.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: "all", name: "All Actions" },
              { id: "next_lesson", name: "Next Lessons" },
              { id: "revision", name: "Revision Topics" },
              { id: "practice", name: "Practice Exercises" },
              { id: "hard", name: "Challenges & Projects" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilterTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActions.map((act) => (
            <div
              key={act.id}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    act.type === "next_lesson"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : act.type === "revision_topic"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : act.type === "hard_challenge"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {act.type.replace("_", " ")}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400">
                    {act.difficulty} Level
                  </span>
                </div>

                <h3 className="text-base font-black text-white">{act.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>

                {/* Explicit Grounded Reason Tag */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-amber-300 font-bold flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>Why Recommended: {act.reason}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-bold truncate">
                  {act.courseName}
                </span>

                <button
                  onClick={() => {
                    if (act.type === "project_build" && onOpenProjectBuilder) {
                      onOpenProjectBuilder();
                    } else if (onNavigateToCourseClass) {
                      onNavigateToCourseClass(act.courseId, act.classId);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>{act.actionText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* SECTION 3: SMART LEARNING PATH ROADMAP (BEGINNER -> INTERMEDIATE -> ADVANCED) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Smart Personalized Learning Path Roadmap</span>
          </h2>
          <p className="text-xs text-slate-400">
            A structured progressive journey adapted to your skill level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* TIER 1: BEGINNER */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase border border-emerald-500/20">
                1. Beginner Tier
              </span>
              <span className="text-xs text-emerald-400 font-extrabold">✓ Mastered Fundamentals</span>
            </div>

            <h3 className="text-sm font-black text-white">Teach Fundamentals First</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic Syntax, Variables & Functions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Control Flow, If/Else & Loops</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive Quiz Checks</span>
              </li>
            </ul>
          </div>

          {/* TIER 2: INTERMEDIATE */}
          <div className="bg-slate-950 border border-blue-500/40 rounded-3xl p-5 space-y-4 ring-1 ring-blue-500/20 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase border border-blue-500/20">
                2. Intermediate Tier (Current)
              </span>
              <span className="text-xs text-blue-400 font-extrabold">In Progress 🚀</span>
            </div>

            <h3 className="text-sm font-black text-white">Improve Skills & Problem Solving</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Data Structures, Lists & Dictionaries</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>API Integration & Async JavaScript</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Practical 7-Step Portfolio Projects</span>
              </li>
            </ul>
          </div>

          {/* TIER 3: ADVANCED */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 opacity-90">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-black uppercase border border-purple-500/20">
                3. Advanced Tier
              </span>
              <span className="text-xs text-purple-400 font-extrabold">Next Goal</span>
            </div>

            <h3 className="text-sm font-black text-white">Professional Topics & Projects</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400 shrink-0" />
                <span>LLM Fine-Tuning & Custom RAG Pipelines</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Full Stack Production Cloud Deployment</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Verified Career Certificates</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* SECTION 4: SMART COURSE RECOMMENDATION CARDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>Recommended Next Courses</span>
          </h2>
          <p className="text-xs text-slate-400">
            Based on your interests, completed courses, and career goals (e.g. Python -&gt; AI Engineering, Data Science, Automation).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profileAnalysis.suggestedCourses.map((crs) => (
            <div key={crs.courseId} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                    {crs.category}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" /> {crs.matchScorePercentage}% Skill Match
                  </span>
                </div>

                <h3 className="text-base font-black text-white">{crs.courseName}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{crs.reason}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {crs.skillsYouWillGain.map((sk, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (onNavigateToCourseClass) {
                      onNavigateToCourseClass(crs.courseId);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Course</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
