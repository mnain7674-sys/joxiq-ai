import React, { useState, useEffect } from "react";
import {
  Course,
  CourseCategory,
  CourseLevel,
  CourseModule,
  ClassItem,
  UserCourseProgress,
  CourseCertificate,
  AIFeedbackResult
} from "../../types/learning";
import { CATEGORIES, COURSES_CATALOG } from "../../data/learningData";
import { CourseCard } from "./CourseCard";
import { ClassViewer } from "./ClassViewer";
import { ProUpgradeModal } from "./ProUpgradeModal";
import { LockedClassPreviewModal } from "./LockedClassPreviewModal";
import { StudentProgressDashboard } from "./StudentProgressDashboard";
import { CertificateModal } from "./CertificateModal";
import { AIEvaluationModal } from "./AIEvaluationModal";
import { CurriculumPlanner } from "./CurriculumPlanner";
import { CodeLearningEnvironment } from "./CodeLearningEnvironment";
import { ProjectBuilder } from "./ProjectBuilder";
import { AIRecommendationHub } from "./AIRecommendationHub";
import { RewardNotificationModal, RewardNotificationData } from "./RewardNotificationModal";
import { isClassLocked, getClassAccessBadge } from "../../lib/learningAccess";
import { checkAndCalculateBadges } from "../../lib/learningBadges";
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Trophy,
  CheckCircle2,
  BarChart3,
  Flame,
  ArrowRight,
  Play,
  Layers,
  Star,
  Code2,
  BrainCircuit,
  Rocket,
  Globe,
  Smartphone,
  Briefcase,
  ShieldCheck,
  Bookmark,
  RotateCcw,
  Check,
  Target,
  Crown,
  Lock,
  Zap,
  Shield,
  Award,
  Compass
} from "lucide-react";

interface LearningAcademyProps {
  theme?: string;
  userProfile?: any;
}

export const LearningAcademy: React.FC<LearningAcademyProps> = ({
  theme = "dark",
  userProfile
}) => {
  // Persistence state key in localStorage
  const LOCAL_STORAGE_KEY = "joxiq_learning_progress_v1";

  // Pro Subscription State
  const [isProMember, setIsProMember] = useState<boolean>(() => {
    if (userProfile?.isPro || userProfile?.subscription === "pro" || userProfile?.plan === "pro") return true;
    if (typeof window !== "undefined") {
      return localStorage.getItem("joxiq_pro_access") === "true";
    }
    return false;
  });

  const toggleProMember = () => {
    const next = !isProMember;
    setIsProMember(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("joxiq_pro_access", next ? "true" : "false");
    }
  };

  // Modals state for Pro Upgrade & Locked Lesson Preview
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeReasonText, setUpgradeReasonText] = useState<string>("");
  const [previewLockedClass, setPreviewLockedClass] = useState<{
    course: Course;
    module: CourseModule;
    classItem: ClassItem;
  } | null>(null);

  // State: User Progress for courses
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserCourseProgress>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed loading learning progress:", e);
      }
    }
    // Default initial progress sample for demo student experience
    return {
      "py-course": {
        courseId: "py-course",
        completedClassIds: ["py-course-cls-1", "py-course-cls-2"],
        lastAccessedClassId: "py-course-cls-3",
        enrolledAt: Date.now() - 86400000 * 3
      },
      "llm-course": {
        courseId: "llm-course",
        completedClassIds: ["llm-course-cls-1"],
        lastAccessedClassId: "llm-course-cls-2",
        enrolledAt: Date.now() - 86400000 * 7
      }
    };
  });

  // Save progress to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProgressMap));
    } catch (e) {
      console.error("Failed saving learning progress:", e);
    }
  }, [userProgressMap]);

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog" | "mylearning" | "planner" | "codestudio" | "projectbuilder" | "recommendations">("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "All">("All");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<CourseLevel | "All">("All");
  const [courseSyllabusLevelTab, setCourseSyllabusLevelTab] = useState<CourseLevel | "All">("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Navigation Selection State: Category -> Course -> Level -> Module -> Class
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeClassView, setActiveClassView] = useState<{
    module: CourseModule;
    classItem: ClassItem;
  } | null>(null);

  // Evaluation & Certificate Modal States
  const [selectedCertificate, setSelectedCertificate] = useState<CourseCertificate | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);

  const [activeReward, setActiveReward] = useState<RewardNotificationData | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState<boolean>(false);

  const [activeEvaluation, setActiveEvaluation] = useState<AIFeedbackResult | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState<boolean>(false);
  const [evaluationClass, setEvaluationClass] = useState<ClassItem | null>(null);
  const [evaluationModule, setEvaluationModule] = useState<CourseModule | null>(null);
  const [evaluationQuizScore, setEvaluationQuizScore] = useState<number>(80);

  // Quick category icon mapper helper
  const getCategoryIcon = (catName: CourseCategory) => {
    switch (catName) {
      case "Programming Languages": return <Code2 className="w-5 h-5 text-blue-400" />;
      case "AI Engineering": return <BrainCircuit className="w-5 h-5 text-violet-400" />;
      case "Web Development": return <Globe className="w-5 h-5 text-cyan-400" />;
      case "App Development": return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case "Business Courses": return <Briefcase className="w-5 h-5 text-amber-400" />;
      case "Other Skills": return <ShieldCheck className="w-5 h-5 text-rose-400" />;
    }
  };

  // Handler: Select a class with lock check
  const handleSelectClass = (course: Course, mod: CourseModule, cls: ClassItem) => {
    if (isClassLocked(cls, mod, isProMember)) {
      setPreviewLockedClass({ course, module: mod, classItem: cls });
    } else {
      setActiveClassView({ module: mod, classItem: cls });
    }
  };

  // Handler: Toggle class completion with streak, badges, rewards and certificate calculation
  const handleToggleClassCompleted = (classId: string) => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.id;
    const currentProg = userProgressMap[courseId] || {
      courseId,
      completedClassIds: [],
      enrolledAt: Date.now()
    };

    const isAlreadyCompleted = currentProg.completedClassIds.includes(classId);
    const updatedClassIds = isAlreadyCompleted
      ? currentProg.completedClassIds.filter((id) => id !== classId)
      : [...currentProg.completedClassIds, classId];

    // Build updated course progress object
    const updatedProg: UserCourseProgress = {
      ...currentProg,
      completedClassIds: updatedClassIds,
      lastAccessedClassId: classId,
      lastActiveAt: Date.now(),
      streakDays: Math.max(1, currentProg.streakDays || 1)
    };

    // Auto-generate certificate if 100 classes completed
    if (updatedClassIds.length >= 100 && !updatedProg.certificate) {
      updatedProg.certificate = {
        certificateId: `JX-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
        studentName: userProfile?.name || "JOXIQ Academy Graduate",
        courseId,
        courseName: selectedCourse.name,
        courseCategory: selectedCourse.category,
        level: selectedCourse.requiredLevel || "All Levels",
        issuedAt: Date.now(),
        completionScoreAverage: 98,
        verifiedUrl: window.location.href,
        skillsLearned: selectedCourse.learningOutcomes || ["Core Programming", "System Architecture", "API Integration"]
      };
    }

    // Check & calculate unlocked badges
    const allProgList = Object.values({ ...userProgressMap, [courseId]: updatedProg });
    const { updatedUnlockedIds, newlyUnlocked } = checkAndCalculateBadges(updatedProg, allProgList);
    updatedProg.unlockedBadgeIds = updatedUnlockedIds;

    setUserProgressMap({
      ...userProgressMap,
      [courseId]: updatedProg
    });

    // Trigger Reward Notification if completing a class (not unchecking)
    if (!isAlreadyCompleted) {
      const newPct = Math.round((updatedClassIds.length / 100) * 100);

      if (newlyUnlocked.length > 0) {
        setActiveReward({
          type: "badge_unlocked",
          title: `New Badge Unlocked: ${newlyUnlocked[0].title}`,
          message: newlyUnlocked[0].description,
          xpEarned: 200,
          badge: newlyUnlocked[0],
          courseName: selectedCourse.name
        });
        setIsRewardModalOpen(true);
      } else if ([25, 50, 75, 100].includes(newPct)) {
        setActiveReward({
          type: "milestone_reached",
          title: `${newPct}% Course Milestone Reached!`,
          message: `Awesome work! You have completed ${newPct}% of "${selectedCourse.name}".`,
          xpEarned: 250,
          milestonePercentage: newPct,
          courseName: selectedCourse.name
        });
        setIsRewardModalOpen(true);
      } else {
        setActiveReward({
          type: "lesson_completed",
          title: "Class Completed!",
          message: `Great job! You completed class #${classId} in "${selectedCourse.name}". Keep up the learning momentum!`,
          xpEarned: 50,
          courseName: selectedCourse.name
        });
        setIsRewardModalOpen(true);
      }
    }
  };

  // Handler: Save Quiz Score
  const handleSaveQuizScore = (classId: string, score: number, total: number, percentage: number) => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.id;
    const currentProg = userProgressMap[courseId] || {
      courseId,
      completedClassIds: [],
      enrolledAt: Date.now()
    };

    const updatedQuizScores = {
      ...(currentProg.quizScores || {}),
      [classId]: {
        classId,
        score,
        totalQuestions: total,
        percentage,
        completedAt: Date.now(),
        answers: {}
      }
    };

    const updatedProg: UserCourseProgress = {
      ...currentProg,
      quizScores: updatedQuizScores,
      lastActiveAt: Date.now()
    };

    const allProgList = Object.values({ ...userProgressMap, [courseId]: updatedProg });
    const { updatedUnlockedIds, newlyUnlocked } = checkAndCalculateBadges(updatedProg, allProgList);
    updatedProg.unlockedBadgeIds = updatedUnlockedIds;

    setUserProgressMap({
      ...userProgressMap,
      [courseId]: updatedProg
    });

    if (percentage >= 70) {
      if (newlyUnlocked.length > 0) {
        setActiveReward({
          type: "badge_unlocked",
          title: `Badge Unlocked: ${newlyUnlocked[0].title}`,
          message: newlyUnlocked[0].description,
          xpEarned: 200,
          badge: newlyUnlocked[0],
          courseName: selectedCourse.name
        });
      } else {
        setActiveReward({
          type: "quiz_passed",
          title: `Quiz Passed! (${percentage}%)`,
          message: `Excellent performance on class knowledge check quiz!`,
          xpEarned: 100,
          courseName: selectedCourse.name
        });
      }
      setIsRewardModalOpen(true);
    }
  };

  // Handler: Save Practice Submission
  const handleSavePracticeSubmission = (classId: string, solutionText: string) => {
    if (!selectedCourse) return;
    const courseId = selectedCourse.id;
    const currentProg = userProgressMap[courseId] || {
      courseId,
      completedClassIds: [],
      enrolledAt: Date.now()
    };

    const updatedPracticeTaskIds = Array.from(new Set([...(currentProg.completedPracticeTaskIds || []), classId]));
    const updatedSubmissions = {
      ...(currentProg.practiceSubmissions || {}),
      [classId]: {
        classId,
        solutionText,
        completedAt: Date.now()
      }
    };

    const updatedProg: UserCourseProgress = {
      ...currentProg,
      completedPracticeTaskIds: updatedPracticeTaskIds,
      practiceSubmissions: updatedSubmissions,
      lastActiveAt: Date.now()
    };

    const allProgList = Object.values({ ...userProgressMap, [courseId]: updatedProg });
    const { updatedUnlockedIds, newlyUnlocked } = checkAndCalculateBadges(updatedProg, allProgList);
    updatedProg.unlockedBadgeIds = updatedUnlockedIds;

    setUserProgressMap({
      ...userProgressMap,
      [courseId]: updatedProg
    });

    if (newlyUnlocked.length > 0) {
      setActiveReward({
        type: "badge_unlocked",
        title: `Badge Unlocked: ${newlyUnlocked[0].title}`,
        message: newlyUnlocked[0].description,
        xpEarned: 200,
        badge: newlyUnlocked[0],
        courseName: selectedCourse.name
      });
      setIsRewardModalOpen(true);
    }
  };

  // Handler: Save Project Completion from Project Builder
  const handleSaveProjectCompletion = (projectId: string, projectTitle: string) => {
    const courseId = selectedCourse?.id || COURSES_CATALOG[0].id;
    const currentProg = userProgressMap[courseId] || {
      courseId,
      completedClassIds: [],
      enrolledAt: Date.now()
    };

    const updatedProjects = Array.from(new Set([...(currentProg.completedProjectIds || []), projectId]));

    const updatedProg: UserCourseProgress = {
      ...currentProg,
      completedProjectIds: updatedProjects,
      lastActiveAt: Date.now()
    };

    const allProgList = Object.values({ ...userProgressMap, [courseId]: updatedProg });
    const { updatedUnlockedIds, newlyUnlocked } = checkAndCalculateBadges(updatedProg, allProgList);
    updatedProg.unlockedBadgeIds = updatedUnlockedIds;

    setUserProgressMap({
      ...userProgressMap,
      [courseId]: updatedProg
    });

    if (newlyUnlocked.length > 0) {
      setActiveReward({
        type: "badge_unlocked",
        title: `Badge Unlocked: ${newlyUnlocked[0].title}`,
        message: newlyUnlocked[0].description,
        xpEarned: 300,
        badge: newlyUnlocked[0],
        courseName: projectTitle
      });
    } else {
      setActiveReward({
        type: "project_completed",
        title: "Project Completed & Saved!",
        message: `Congratulations on completing "${projectTitle}"! Added to your verified portfolio and achievements.`,
        xpEarned: 300,
        courseName: projectTitle
      });
    }
    setIsRewardModalOpen(true);
  };

  // Handler: Open AI Diagnostic Evaluation
  const handleOpenAIEvaluation = (classItem: ClassItem, module: CourseModule, quizScorePercentage: number = 80) => {
    setEvaluationClass(classItem);
    setEvaluationModule(module);
    setEvaluationQuizScore(quizScorePercentage);

    // Build or fetch feedback
    const feedback: AIFeedbackResult = {
      classId: classItem.id,
      strengths: [
        `Good conceptual understanding of ${classItem.title}`,
        quizScorePercentage >= 80 ? "High accuracy on lesson quiz questions" : "Solid persistence on learning exercises",
        `Mastered key objectives: ${classItem.learningObjective}`
      ],
      weakAreas: [
        quizScorePercentage < 100 ? "Minor error in edge case question options" : "Keep sharpening speed and syntax precision",
        "Review real-world application scenarios"
      ],
      suggestions: [
        `Re-read the topic explanation for ${classItem.title}`,
        "Practice editing code examples directly in the classroom",
        "Explain the topic in your own words to solidify memory"
      ],
      recommendedNextSteps: [
        "Mark class as completed to unlock the next module",
        "Apply these concepts in the course capstone project"
      ],
      evaluationSummary: `AI Diagnostic Evaluation completed for ${classItem.title}. Score: ${quizScorePercentage}%`,
      evaluatedAt: Date.now()
    };

    setActiveEvaluation(feedback);
    setIsEvaluationModalOpen(true);
  };

  // Handler: Select a course
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseSyllabusLevelTab("All");
    setActiveClassView(null);
  };

  // Handler: Enroll or Continue Course
  const handleContinueCourse = (course: Course) => {
    setSelectedCourse(course);
    const prog = userProgressMap[course.id];
    let targetClass: { module: CourseModule; classItem: ClassItem } | null = null;

    if (prog?.lastAccessedClassId) {
      course.modules.forEach((mod) => {
        mod.classes.forEach((cls) => {
          if (cls.id === prog.lastAccessedClassId) {
            targetClass = { module: mod, classItem: cls };
          }
        });
      });
    }

    if (!targetClass && course.modules.length > 0 && course.modules[0].classes.length > 0) {
      targetClass = { module: course.modules[0], classItem: course.modules[0].classes[0] };
    }

    if (targetClass) {
      if (isClassLocked(targetClass.classItem, targetClass.module, isProMember)) {
        setPreviewLockedClass({ course, module: targetClass.module, classItem: targetClass.classItem });
      } else {
        setActiveClassView(targetClass);
      }
    }
  };

  // Calculate Overall Platform Stats
  const enrolledCourses = COURSES_CATALOG.filter((c) => !!userProgressMap[c.id]);
  const totalClassesCompleted = Object.values(userProgressMap).reduce(
    (acc, prog) => acc + prog.completedClassIds.length,
    0
  );

  // Filter Catalog Courses
  const filteredCourses = COURSES_CATALOG.filter((course) => {
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevelFilter === "All" || course.requiredLevel.includes(selectedLevelFilter);
    const matchesSearch =
      searchQuery.trim() === "" ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  // Highlight Last Active Course for "Continue Learning"
  const lastActiveCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : COURSES_CATALOG[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* 1. Header & Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                JOXIQ Learning Academy
              </h1>

              {/* Membership Access Status Badge */}
              {isProMember ? (
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-500/20">
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>PRO MEMBER</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Free Trial (5 Classes/Course)
                  </span>
                  <button
                    onClick={() => {
                      setUpgradeReasonText("Upgrade to Pro to unlock all 100 classes across Python, AI Engineering, Web Dev & Business!");
                      setIsUpgradeModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    <Crown className="w-3 h-3 fill-amber-300" />
                    <span>Upgrade to Pro</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-3">
              <span>Structured Curriculum • 100 Classes per Course</span>
              <button
                onClick={toggleProMember}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 underline cursor-pointer"
                title="Toggle Pro membership state for testing"
              >
                ({isProMember ? "Switch to Free View" : "Simulate Pro View"})
              </button>
            </p>
          </div>
        </div>

        {/* Header Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "dashboard" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("catalog");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "catalog" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Library ({COURSES_CATALOG.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("mylearning");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "mylearning" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Learning ({enrolledCourses.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("planner");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "planner" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>Curriculum Planner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("codestudio");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "codestudio" && !selectedCourse
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>AI Code Studio</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("projectbuilder");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "projectbuilder" && !selectedCourse
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span>AI Project Builder</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("recommendations");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "recommendations" && !selectedCourse
                ? "bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>AI Recommendations</span>
          </button>
        </div>
      </div>

      {/* 2. CLASS VIEWER (If an unlocked class is currently active) */}
      {activeClassView && selectedCourse ? (
        <ClassViewer
          course={selectedCourse}
          currentModule={activeClassView.module}
          currentClass={activeClassView.classItem}
          userProgress={userProgressMap[selectedCourse.id]}
          isProUser={isProMember}
          onToggleClassCompleted={handleToggleClassCompleted}
          onSelectClass={(mod, cls) => handleSelectClass(selectedCourse, mod, cls)}
          onLockedClassClick={(mod, cls) => setPreviewLockedClass({ course: selectedCourse, module: mod, classItem: cls })}
          onBackToCourse={() => setActiveClassView(null)}
          onSaveQuizScore={handleSaveQuizScore}
          onSavePracticeSubmission={handleSavePracticeSubmission}
          onOpenAIEvaluation={handleOpenAIEvaluation}
          onOpenCodeStudio={() => setActiveTab("codestudio")}
          onOpenProjectBuilder={() => setActiveTab("projectbuilder")}
        />
      ) : selectedCourse ? (
        
        /* 3. COURSE SYLLABUS & LEVEL DETAILS VIEW */
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl"
          >
            ← Back to Course Catalog
          </button>

          {/* Course Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl ${selectedCourse.gradientColor} opacity-20 blur-3xl pointer-events-none`} />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  {selectedCourse.category}
                </span>

                <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="text-emerald-400">Class 1-5 FREE</span>
                  <span>•</span>
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Classes 6-100 PRO</span>
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold ml-auto">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {selectedCourse.rating} ({selectedCourse.enrolledCount} Students)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {selectedCourse.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {selectedCourse.fullDescription}
              </p>

              {/* Goal Card */}
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-slate-200">
                <Target className="w-5 h-5 text-violet-400 shrink-0" />
                <div>
                  <span className="font-bold text-violet-300">Course Goal: </span>
                  {selectedCourse.courseGoal}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleContinueCourse(selectedCourse)}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold rounded-2xl shadow-xl shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start / Continue Free Lesson</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("planner");
                  }}
                  className="px-5 py-3 bg-slate-950 hover:bg-slate-850 border border-violet-500/30 text-violet-300 font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4 text-violet-400" />
                  <span>Inspect Pre-Planned AI Curriculum</span>
                </button>

                {!isProMember && (
                  <button
                    onClick={() => {
                      setUpgradeReasonText(`Unlock all 100 classes of ${selectedCourse.name} with JOXIQ Pro Pass!`);
                      setIsUpgradeModalOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 fill-amber-300" />
                    <span>Unlock All 100 Classes with Pro</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Level Selection Breakdown Bar (Beginner 30, Intermediate 30, Advanced 30, Extra 10) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  Level Mastery Breakdown (100 Classes)
                </h3>
                <p className="text-xs text-slate-400">Class 1-5 Free • Class 6-100 Reserved for Pro Members</p>
              </div>

              {/* Level Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setCourseSyllabusLevelTab("All")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    courseSyllabusLevelTab === "All"
                      ? "bg-violet-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All (100)
                </button>
                <button
                  onClick={() => setCourseSyllabusLevelTab("Beginner")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    courseSyllabusLevelTab === "Beginner"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Beginner (30)
                </button>
                <button
                  onClick={() => setCourseSyllabusLevelTab("Intermediate")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    courseSyllabusLevelTab === "Intermediate"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Intermediate (30)
                </button>
                <button
                  onClick={() => setCourseSyllabusLevelTab("Advanced")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    courseSyllabusLevelTab === "Advanced"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Advanced (30)
                </button>
                <button
                  onClick={() => setCourseSyllabusLevelTab("Extra")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    courseSyllabusLevelTab === "Extra"
                      ? "bg-amber-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Extra (10)
                </button>
              </div>
            </div>

            {/* Modules & Classes List */}
            <div className="space-y-4">
              {selectedCourse.modules
                .filter((mod) => courseSyllabusLevelTab === "All" || mod.level === courseSyllabusLevelTab)
                .map((mod) => (
                  <div key={mod.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <span className="text-violet-400">{mod.title}</span>
                          {mod.level !== "Beginner" && !isProMember && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> PRO MODULE
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {mod.classes.length} Classes
                      </span>
                    </div>

                    {/* Classes Grid inside Module */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                      {mod.classes.map((cls) => {
                        const isDone = userProgressMap[selectedCourse.id]?.completedClassIds.includes(cls.id);
                        const locked = isClassLocked(cls, mod, isProMember);

                        return (
                          <div
                            key={cls.id}
                            onClick={() => handleSelectClass(selectedCourse, mod, cls)}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all cursor-pointer ${
                              isDone
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                : locked
                                ? "bg-slate-950/60 border-slate-800/60 text-slate-400 hover:border-amber-500/40"
                                : "bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-violet-500/40"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : locked ? (
                                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <Play className="w-3.5 h-3.5 text-violet-400 shrink-0 fill-violet-400" />
                              )}

                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-white truncate">{cls.title}</h5>
                                  
                                  {/* Free vs Pro Pill Badge */}
                                  {mod.level === "Beginner" && cls.classNumber <= 5 ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      FREE
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                      <Crown className="w-2.5 h-2.5 fill-amber-400" /> PRO
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">{cls.learningObjective}</p>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                              {cls.duration}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : activeTab === "codestudio" ? (
        
        /* 4. PROGRAMMING CODE LEARNING ENVIRONMENT & AI TEACHER STUDIO */
        <CodeLearningEnvironment
          course={selectedCourse}
          currentClass={activeClassView?.classItem}
          userProgressMap={userProgressMap}
          onUpdateProgress={(courseId, classId) => handleToggleClassCompleted(classId)}
        />
      ) : activeTab === "projectbuilder" ? (

        /* 5. JOXIQ AI PRACTICAL PROJECT BUILDER & PORTFOLIO STUDIO */
        <ProjectBuilder
          course={selectedCourse}
          currentClass={activeClassView?.classItem}
          onNavigateToCourse={(courseId) => {
            const matched = COURSES_CATALOG.find((c) => c.id === courseId);
            if (matched) {
              setSelectedCourse(matched);
              setActiveTab("catalog");
            }
          }}
          onSaveProjectCompletion={handleSaveProjectCompletion}
        />
      ) : activeTab === "recommendations" ? (

        /* 6. JOXIQ AI PERSONALIZED LEARNING RECOMMENDATION SYSTEM */
        <AIRecommendationHub
          userProgressMap={userProgressMap}
          allCourses={COURSES_CATALOG}
          languagePreference="English"
          onNavigateToCourseClass={(courseId, classId) => {
            const matchedCourse = COURSES_CATALOG.find((c) => c.id === courseId);
            if (matchedCourse) {
              setSelectedCourse(matchedCourse);
              if (classId) {
                for (const mod of matchedCourse.modules) {
                  const cl = mod.classes.find((item) => item.id === classId);
                  if (cl) {
                    setActiveClassView({ module: mod, classItem: cl });
                    break;
                  }
                }
              } else {
                setActiveTab("catalog");
              }
            }
          }}
          onOpenProjectBuilder={() => {
            setActiveTab("projectbuilder");
            setSelectedCourse(null);
            setActiveClassView(null);
          }}
          onOpenCodeStudio={() => {
            setActiveTab("codestudio");
            setSelectedCourse(null);
            setActiveClassView(null);
          }}
        />
      ) : activeTab === "planner" ? (
        
        /* 5. AI COURSE CURRICULUM PLANNING SYSTEM VIEW */
        <CurriculumPlanner
          courses={COURSES_CATALOG}
          onSelectCourseToStart={(course) => {
            setSelectedCourse(course);
          }}
        />
      ) : activeTab === "dashboard" ? (
        
        /* 4. STUDENT PROGRESS & EVALUATION DASHBOARD VIEW */
        <StudentProgressDashboard
          courses={COURSES_CATALOG}
          userProgressMap={userProgressMap}
          onSelectCourse={handleSelectCourse}
          onOpenCertificate={(cert) => {
            setSelectedCertificate(cert);
            setIsCertificateModalOpen(true);
          }}
          userName={userProfile?.name || "JOXIQ Scholar"}
        />
      ) : (

        /* 5. MAIN CATALOG / MY LEARNING VIEW */
        <div className="space-y-8">
          
          {/* Progress Overview & Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{enrolledCourses.length}</div>
                <div className="text-xs font-semibold text-slate-400">Enrolled Courses</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{totalClassesCompleted}</div>
                <div className="text-xs font-semibold text-slate-400 font-mono">Classes Completed</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">5 Days</div>
                <div className="text-xs font-semibold text-slate-400">Learning Streak</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">44 Courses</div>
                <div className="text-xs font-semibold text-slate-400">Complete Catalog</div>
              </div>
            </div>
          </div>

          {/* Continue Learning Banner */}
          {lastActiveCourse && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-violet-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  <Play className="w-3.5 h-3.5 fill-current" /> Continue Learning
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {lastActiveCourse.name}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {lastActiveCourse.shortDescription}
                </p>
              </div>

              <button
                onClick={() => handleContinueCourse(lastActiveCourse)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Resume Class</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Course Categories Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                Course Categories
              </h2>
              {selectedCategory !== "All" && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="text-xs font-bold text-violet-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Show All Categories
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(isSelected ? "All" : cat.name);
                      setActiveTab("catalog");
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-500 shadow-xl shadow-violet-600/20"
                        : "bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl w-fit ${isSelected ? "bg-white/20 text-white" : "bg-slate-950"}`}>
                      {getCategoryIcon(cat.name)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight mb-0.5">{cat.name}</h4>
                      <p className={`text-[10px] line-clamp-2 ${isSelected ? "text-violet-100" : "text-slate-500"}`}>
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar & Level Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Python, React, AI, Cybersecurity..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-500"
              />
            </div>

            {/* Level Selection Pills */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-violet-400" /> Filter Level:
              </span>
              {(["All", "Beginner", "Intermediate", "Advanced", "Extra"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedLevelFilter === lvl
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/50 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

          </div>

          {/* Course Cards Grid Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {activeTab === "mylearning" ? "My Enrolled Courses" : "Academy Course Library"}
              </h2>
              <span className="text-xs font-mono font-bold text-slate-400">
                {filteredCourses.length} Courses Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === "mylearning" ? enrolledCourses : filteredCourses).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userProgress={userProgressMap[course.id]}
                  onSelectCourse={handleSelectCourse}
                  onContinueCourse={handleContinueCourse}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgradeSuccess={() => {
          setIsProMember(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("joxiq_pro_access", "true");
          }
        }}
        reasonText={upgradeReasonText}
      />

      {/* Locked Class Preview Modal */}
      {previewLockedClass && (
        <LockedClassPreviewModal
          isOpen={!!previewLockedClass}
          course={previewLockedClass.course}
          module={previewLockedClass.module}
          classItem={previewLockedClass.classItem}
          onClose={() => setPreviewLockedClass(null)}
          onOpenUpgradeModal={() => {
            setUpgradeReasonText(`Unlock Class #${previewLockedClass.classItem.classNumber}: "${previewLockedClass.classItem.title}" with JOXIQ Pro!`);
            setIsUpgradeModalOpen(true);
          }}
        />
      )}

      {/* Course Completion Verified Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          certificate={selectedCertificate}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}

      {/* AI Performance Evaluation & Diagnostic Feedback Modal */}
      {activeEvaluation && evaluationClass && evaluationModule && (
        <AIEvaluationModal
          isOpen={isEvaluationModalOpen}
          currentClass={evaluationClass}
          currentModule={evaluationModule}
          evaluation={activeEvaluation}
          quizScorePercentage={evaluationQuizScore}
          onClose={() => setIsEvaluationModalOpen(false)}
        />
      )}

      {/* Motivational Reward & Milestone Notification Modal */}
      <RewardNotificationModal
        isOpen={isRewardModalOpen}
        reward={activeReward}
        onClose={() => setIsRewardModalOpen(false)}
        onViewAchievements={() => {
          setActiveTab("dashboard");
          setSelectedCourse(null);
          setActiveClassView(null);
        }}
      />

    </div>
  );
};
