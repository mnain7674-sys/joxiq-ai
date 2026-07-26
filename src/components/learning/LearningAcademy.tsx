import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
import { ProjectRequirement } from "../../types/projectBuilder";
import { SAMPLE_BUILDER_PROJECTS } from "../../data/projectBuilderData";
import { CourseCard } from "./CourseCard";
import { ClassViewer } from "./ClassViewer";
import { AcademyErrorBoundary } from "./AcademyErrorBoundary";
import { AcademyLoadingFallback } from "./AcademyLoadingFallback";
import { isClassLocked, getClassAccessBadge } from "../../lib/learningAccess";
import { checkAndCalculateBadges } from "../../lib/learningBadges";
import { isAcademyProActive } from "../../lib/academySubscription";
import { RewardNotificationData } from "./RewardNotificationModal";
import {
  fetchCoursesFromFirebase,
  fetchUserProgressFromFirebase,
  saveUserProgressToFirebase,
  saveCertificateToFirebase,
  saveProjectToFirebase
} from "../../lib/learningFirebase";
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
  Brain,
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

// Lazy-loaded sub-modules & modals for low memory footprint and high load performance
const CodeLearningEnvironment = lazy(() => import("./CodeLearningEnvironment").then((m) => ({ default: m.CodeLearningEnvironment })));
const ProjectBuilder = lazy(() => import("./ProjectBuilder").then((m) => ({ default: m.ProjectBuilder })));
const AIRecommendationHub = lazy(() => import("./AIRecommendationHub").then((m) => ({ default: m.AIRecommendationHub })));
const AIStudyAssistant = lazy(() => import("./AIStudyAssistant").then((m) => ({ default: m.AIStudyAssistant })));
const CurriculumPlanner = lazy(() => import("./CurriculumPlanner").then((m) => ({ default: m.CurriculumPlanner })));
const StudentProgressDashboard = lazy(() => import("./StudentProgressDashboard").then((m) => ({ default: m.StudentProgressDashboard })));
const AcademySubscriptionPanel = lazy(() => import("./AcademySubscriptionPanel").then((m) => ({ default: m.AcademySubscriptionPanel })));
const CertificateModal = lazy(() => import("./CertificateModal").then((m) => ({ default: m.CertificateModal })));
const AIEvaluationModal = lazy(() => import("./AIEvaluationModal").then((m) => ({ default: m.AIEvaluationModal })));
const RewardNotificationModal = lazy(() => import("./RewardNotificationModal").then((m) => ({ default: m.RewardNotificationModal })));
const ProUpgradeModal = lazy(() => import("./ProUpgradeModal").then((m) => ({ default: m.ProUpgradeModal })));
const LockedClassPreviewModal = lazy(() => import("./LockedClassPreviewModal").then((m) => ({ default: m.LockedClassPreviewModal })));

interface LearningAcademyProps {
  theme?: string;
  userProfile?: any;
  onOpenAdmin?: () => void;
}

export const LearningAcademy: React.FC<LearningAcademyProps> = ({
  theme = "dark",
  userProfile,
  onOpenAdmin
}) => {
  // Persistence state key in localStorage
  const LOCAL_STORAGE_KEY = "joxiq_learning_progress_v1";

  // Pro Subscription State
  const [isProMember, setIsProMember] = useState<boolean>(() => {
    if (userProfile?.isPro || userProfile?.subscription === "pro" || userProfile?.plan === "pro") return true;
    return isAcademyProActive(userProfile?.email);
  });

  useEffect(() => {
    const syncSubStatus = () => {
      const active = isAcademyProActive(userProfile?.email) || userProfile?.isPro;
      setIsProMember(Boolean(active));
    };
    syncSubStatus();
    window.addEventListener("joxiq_academy_sub_updated", syncSubStatus);
    return () => window.removeEventListener("joxiq_academy_sub_updated", syncSubStatus);
  }, [userProfile?.email, userProfile?.isPro]);

  const toggleProMember = () => {
    const next = !isProMember;
    setIsProMember(next);
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
    return {};
  });

  // Save progress to localStorage and sync to Firebase on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProgressMap));
    } catch (e) {
      console.error("Failed saving learning progress:", e);
    }
  }, [userProgressMap]);

  // Load real courses and progress from Firebase on mount / profile change
  useEffect(() => {
    let isMounted = true;
    async function syncFirebaseData() {
      try {
        const fbCourses = await fetchCoursesFromFirebase();
        if (isMounted && fbCourses && fbCourses.length > 0) {
          setCoursesList(fbCourses);
        }

        if (userProfile?.email) {
          const fbProgress = await fetchUserProgressFromFirebase(userProfile.email);
          if (isMounted && fbProgress && Object.keys(fbProgress).length > 0) {
            setUserProgressMap((prev) => ({ ...prev, ...fbProgress }));
          }
        }
      } catch (err) {
        console.warn("Firebase sync notice:", err);
      }
    }
    syncFirebaseData();
    return () => {
      isMounted = false;
    };
  }, [userProfile?.email]);

  // Persistent Courses Catalog State (syncs with Admin Course Manager edits)
  const [coursesList, setCoursesList] = useState<Course[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("joxiq_admin_courses_v2");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed loading custom admin courses:", e);
      }
    }
    return COURSES_CATALOG;
  });

  const handleSaveCourses = (updatedCourses: Course[]) => {
    setCoursesList(updatedCourses);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("joxiq_admin_courses_v2", JSON.stringify(updatedCourses));
      } catch (e) {
        console.error("Failed saving custom admin courses:", e);
      }
    }
  };

  // Persistent Builder Projects State (syncs with Admin Course Manager edits)
  const [projectsList, setProjectsList] = useState<ProjectRequirement[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("joxiq_admin_projects_v1");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed loading custom admin projects:", e);
      }
    }
    return SAMPLE_BUILDER_PROJECTS;
  });

  const handleSaveProjects = (updatedProjects: ProjectRequirement[]) => {
    setProjectsList(updatedProjects);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("joxiq_admin_projects_v1", JSON.stringify(updatedProjects));
      } catch (e) {
        console.error("Failed saving custom admin projects:", e);
      }
    }
  };

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog" | "mylearning" | "planner" | "codestudio" | "projectbuilder" | "recommendations" | "studyassistant" | "subscription">("dashboard");
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
      setUpgradeReasonText(`Class #${cls.classNumber}: "${cls.title}" (${mod.level} Level) is a Pro class. Subscribe to JOXIQ AI Learning Academy Pro ($14.99/mo) to access all 100 classes!`);
      setIsUpgradeModalOpen(true);
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

    if (userProfile?.email) {
      saveUserProgressToFirebase(userProfile.email, courseId, updatedProg as any);
      if (updatedProg.certificate) {
        saveCertificateToFirebase(updatedProg.certificate as any);
      }
    }

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

    if (userProfile?.email) {
      saveUserProgressToFirebase(userProfile.email, courseId, updatedProg as any);
    }

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

    if (userProfile?.email) {
      saveUserProgressToFirebase(userProfile.email, courseId, updatedProg as any);
    }

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

    if (userProfile?.email) {
      saveUserProgressToFirebase(userProfile.email, courseId, updatedProg as any);
      saveProjectToFirebase(userProfile.email, projectId, "", true);
    }

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
        setUpgradeReasonText(`Class #${targetClass.classItem.classNumber}: "${targetClass.classItem.title}" is a Pro class. Subscribe to JOXIQ AI Learning Academy Pro ($14.99/mo) to unlock all classes!`);
        setIsUpgradeModalOpen(true);
      } else {
        setActiveClassView(targetClass);
      }
    }
  };

  // Calculate Overall Platform Stats (Memoized)
  const enrolledCourses = useMemo(() => {
    return coursesList.filter((c) => !!userProgressMap[c.id]);
  }, [coursesList, userProgressMap]);

  const totalClassesCompleted = useMemo(() => {
    return Object.values(userProgressMap).reduce(
      (acc, prog) => acc + (prog.completedClassIds?.length || 0),
      0
    );
  }, [userProgressMap]);

  // Filter Catalog Courses (Memoized)
  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return coursesList.filter((course) => {
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      const matchesLevel = selectedLevelFilter === "All" || course.requiredLevel.includes(selectedLevelFilter);
      const matchesSearch =
        query === "" ||
        course.name.toLowerCase().includes(query) ||
        course.shortDescription.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query);
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [coursesList, selectedCategory, selectedLevelFilter, searchQuery]);

  // Highlight Last Active Course for "Continue Learning"
  const lastActiveCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : coursesList[0];

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
        <div
          role="tablist"
          aria-label="Academy Sections"
          className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 w-full lg:w-auto overflow-x-auto scrollbar-none touch-pan-x shrink-0"
        >
          <button
            role="tab"
            aria-selected={activeTab === "dashboard" && !selectedCourse}
            aria-label="Dashboard View"
            onClick={() => {
              setActiveTab("dashboard");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "dashboard" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "catalog" && !selectedCourse}
            aria-label="Course Library"
            onClick={() => {
              setActiveTab("catalog");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "catalog" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Library ({coursesList.length})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "mylearning" && !selectedCourse}
            aria-label="My Learning Courses"
            onClick={() => {
              setActiveTab("mylearning");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "mylearning" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>My Learning ({enrolledCourses.length})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "planner" && !selectedCourse}
            aria-label="Curriculum Planner"
            onClick={() => {
              setActiveTab("planner");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "planner" && !selectedCourse
                ? "bg-violet-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>Curriculum Planner</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "codestudio" && !selectedCourse}
            aria-label="AI Code Studio"
            onClick={() => {
              setActiveTab("codestudio");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "codestudio" && !selectedCourse
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>AI Code Studio</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "projectbuilder" && !selectedCourse}
            aria-label="AI Project Builder"
            onClick={() => {
              setActiveTab("projectbuilder");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "projectbuilder" && !selectedCourse
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span>AI Project Builder</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "recommendations" && !selectedCourse}
            aria-label="AI Recommendations"
            onClick={() => {
              setActiveTab("recommendations");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "recommendations" && !selectedCourse
                ? "bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>AI Recommendations</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "studyassistant" && !selectedCourse}
            aria-label="AI Study Assistant"
            onClick={() => {
              setActiveTab("studyassistant");
              setSelectedCourse(null);
              setActiveClassView(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              activeTab === "studyassistant" && !selectedCourse
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>AI Study Assistant</span>
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
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto">
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
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <CodeLearningEnvironment
              course={selectedCourse}
              currentClass={activeClassView?.classItem}
              userProgressMap={userProgressMap}
              onUpdateProgress={(courseId, classId) => handleToggleClassCompleted(classId)}
            />
          </Suspense>
        </AcademyErrorBoundary>
      ) : activeTab === "projectbuilder" ? (

        /* 5. JOXIQ AI PRACTICAL PROJECT BUILDER & PORTFOLIO STUDIO */
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <ProjectBuilder
              course={selectedCourse}
              currentClass={activeClassView?.classItem}
              projects={projectsList}
              onNavigateToCourse={(courseId) => {
                const matched = coursesList.find((c) => c.id === courseId);
                if (matched) {
                  setSelectedCourse(matched);
                  setActiveTab("catalog");
                }
              }}
              onSaveProjectCompletion={handleSaveProjectCompletion}
            />
          </Suspense>
        </AcademyErrorBoundary>
      ) : activeTab === "recommendations" ? (

        /* 6. JOXIQ AI PERSONALIZED LEARNING RECOMMENDATION SYSTEM */
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <AIRecommendationHub
              userProgressMap={userProgressMap}
              allCourses={coursesList}
              languagePreference="English"
              onNavigateToCourseClass={(courseId, classId) => {
                const matchedCourse = coursesList.find((c) => c.id === courseId);
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
          </Suspense>
        </AcademyErrorBoundary>
      ) : activeTab === "studyassistant" ? (
        
        /* DEDICATED AI STUDY ASSISTANT HUB VIEW */
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <AIStudyAssistant
              courses={coursesList}
              onSelectCourseClass={(course, module, cls) => {
                setSelectedCourse(course);
                setActiveClassView({ module, classItem: cls });
              }}
              onOpenCodeStudio={() => {
                setActiveTab("codestudio");
                setSelectedCourse(null);
                setActiveClassView(null);
              }}
              onOpenProjectBuilder={() => {
                setActiveTab("projectbuilder");
                setSelectedCourse(null);
                setActiveClassView(null);
              }}
            />
          </Suspense>
        </AcademyErrorBoundary>
      ) : activeTab === "subscription" ? (
        
        /* DEDICATED ACADEMY PRO SUBSCRIPTION & BILLING MANAGEMENT */
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <AcademySubscriptionPanel
              userEmail={userProfile?.email}
              userName={userProfile?.name}
              onOpenCheckoutModal={() => {
                setUpgradeReasonText("Subscribe to JOXIQ AI Learning Academy Pro ($14.99/month) for complete 100 classes access & certificates.");
                setIsUpgradeModalOpen(true);
              }}
            />
          </Suspense>
        </AcademyErrorBoundary>
      ) : activeTab === "planner" ? (
        
        /* 5. AI COURSE CURRICULUM PLANNING SYSTEM VIEW */
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <CurriculumPlanner
              courses={coursesList}
              onSelectCourseToStart={(course) => {
                setSelectedCourse(course);
              }}
            />
          </Suspense>
        </AcademyErrorBoundary>
      ) : activeTab === "dashboard" ? (
        
        /* 4. STUDENT PROGRESS & EVALUATION DASHBOARD VIEW */
        <AcademyErrorBoundary>
          <Suspense fallback={<AcademyLoadingFallback />}>
            <StudentProgressDashboard
              courses={coursesList}
              userProgressMap={userProgressMap}
              onSelectCourse={handleSelectCourse}
              onOpenCertificate={(cert) => {
                setSelectedCertificate(cert);
                setIsCertificateModalOpen(true);
              }}
              userName={userProfile?.name || "JOXIQ Scholar"}
            />
          </Suspense>
        </AcademyErrorBoundary>
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
                <div className="text-2xl font-black text-white">{coursesList.length} Courses</div>
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
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {/* Pro Upgrade Modal */}
        <ProUpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          userEmail={userProfile?.email}
          onUpgradeSuccess={() => {
            setIsProMember(true);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("joxiq_pro_access", "true");
              } catch (e) {
                console.error("Failed saving pro access state:", e);
              }
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
      </Suspense>

    </div>
  );
};
