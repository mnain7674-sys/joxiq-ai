import React, { useState } from "react";
import { Course, UserCourseProgress, CourseCertificate } from "../../types/learning";
import { ALL_ACHIEVEMENT_BADGES } from "../../lib/learningBadges";
import {
  Flame,
  Award,
  CheckCircle2,
  BookOpen,
  Sparkles,
  BarChart3,
  GraduationCap,
  Play,
  Zap,
  Target,
  Code2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Trophy,
  Rocket,
  BrainCircuit,
  Filter,
  Check
} from "lucide-react";

interface StudentProgressDashboardProps {
  courses: Course[];
  userProgressMap: Record<string, UserCourseProgress>;
  onSelectCourse: (course: Course) => void;
  onOpenCertificate: (cert: CourseCertificate) => void;
  userName?: string;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({
  courses,
  userProgressMap,
  onSelectCourse,
  onOpenCertificate,
  userName = "JOXIQ Learner"
}) => {
  const [badgeFilter, setBadgeFilter] = useState<string>("all");

  // Aggregate statistics across all courses
  const allProgressEntries = Object.values(userProgressMap);

  const totalCompletedClasses = allProgressEntries.reduce(
    (acc, p) => acc + (p.completedClassIds?.length || 0),
    0
  );

  const totalCompletedPractices = allProgressEntries.reduce(
    (acc, p) => acc + (p.completedPracticeTaskIds?.length || 0),
    0
  );

  const totalProjectsCompleted = allProgressEntries.reduce(
    (acc, p) => acc + (p.completedProjectIds?.length || 0),
    0
  );

  // Calculate overall Quiz Average Percentage
  let totalQuizScorePercentageSum = 0;
  let totalQuizzesAttempted = 0;

  allProgressEntries.forEach((p) => {
    if (p.quizScores) {
      Object.values(p.quizScores).forEach((q) => {
        totalQuizScorePercentageSum += q.percentage;
        totalQuizzesAttempted += 1;
      });
    }
  });

  const averageQuizScore = totalQuizzesAttempted > 0
    ? Math.round(totalQuizScorePercentageSum / totalQuizzesAttempted)
    : 100;

  // Active Learning Streak
  const activeStreak = Math.max(
    1,
    ...allProgressEntries.map((p) => p.streakDays || 1)
  );

  // Unlocked Badges Set
  const unlockedBadgeSet = new Set<string>();
  allProgressEntries.forEach((p) => {
    (p.unlockedBadgeIds || []).forEach((bId) => unlockedBadgeSet.add(bId));
  });

  // Calculate total XP Points
  const totalXP = (totalCompletedClasses * 50) + (totalCompletedPractices * 100) + (totalProjectsCompleted * 300) + (unlockedBadgeSet.size * 200);

  // Calculate Learner Level
  const learnerLevel = Math.max(1, Math.floor(totalXP / 500) + 1);

  // Collect Courses In Progress & Completed Courses
  const coursesWithProgress = courses.map((course) => {
    const prog = userProgressMap[course.id] || {
      courseId: course.id,
      completedClassIds: [],
      enrolledAt: Date.now()
    };
    const completedCount = prog.completedClassIds?.length || 0;
    const percentage = Math.round((completedCount / 100) * 100);
    return {
      course,
      prog,
      completedCount,
      percentage
    };
  });

  const activeCourses = coursesWithProgress.filter((item) => item.completedCount > 0);

  // Collect skills gained from completed classes
  const skillsGained = new Set<string>();
  courses.forEach((course) => {
    const prog = userProgressMap[course.id];
    if (prog && prog.completedClassIds && prog.completedClassIds.length > 0) {
      course.modules.forEach((mod) => {
        mod.classes.forEach((cls) => {
          if (prog.completedClassIds.includes(cls.id)) {
            cls.whatYouWillLearn?.forEach((s) => skillsGained.add(s));
            if (cls.topic) skillsGained.add(cls.topic);
          }
        });
      });
    }
  });

  const skillsList = Array.from(skillsGained).slice(0, 16);

  // Filter badges
  const filteredBadges = ALL_ACHIEVEMENT_BADGES.filter((b) => {
    if (badgeFilter === "all") return true;
    return b.category === badgeFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-violet-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                Level {learnerLevel} Scholar
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{activeStreak}-Day Active Streak</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {userName}'s Learning Achievements & Profile
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track your course completion milestones, verified certificates, earned achievement badges, and mastered skills.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="text-xl font-black text-white">{totalXP.toLocaleString()} XP</div>
              <div className="text-[11px] text-slate-400">Total Learning Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Learning Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{activeStreak} Days</div>
          <p className="text-[11px] text-slate-400">Consistent daily momentum</p>
        </div>

        {/* Metric 2: Classes Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classes Finished</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalCompletedClasses}</div>
          <p className="text-[11px] text-slate-400">Across catalog courses</p>
        </div>

        {/* Metric 3: Quiz Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Quiz Score</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{averageQuizScore}%</div>
          <p className="text-[11px] text-slate-400">{totalQuizzesAttempted} Quizzes Completed</p>
        </div>

        {/* Metric 4: Projects & Practice */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects & Tasks</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalProjectsCompleted + totalCompletedPractices}</div>
          <p className="text-[11px] text-slate-400">Projects & Exercises finished</p>
        </div>

      </div>

      {/* 3. Course Progress & Milestones (25%, 50%, 75%, 100%) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Course Progress & Milestones Tracker
          </h3>
          <span className="text-xs font-mono text-slate-400 font-semibold">
            {activeCourses.length} Active Enrolments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const prog = userProgressMap[course.id];
            const completedCount = prog?.completedClassIds?.length || 0;
            const percentage = Math.round((completedCount / 100) * 100);

            // Milestones: 25, 50, 75, 100
            const milestones = [
              { target: 25, label: "25%", title: "Quarter Master" },
              { target: 50, label: "50%", title: "Halfway Hero" },
              { target: 75, label: "75%", title: "Almost There" },
              { target: 100, label: "100%", title: "Course Graduate" }
            ];

            const cert = prog?.certificate || (completedCount >= 100 ? {
              certificateId: `JX-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
              studentName: userName,
              courseId: course.id,
              courseName: course.name,
              courseCategory: course.category,
              level: course.requiredLevel || "All Levels",
              issuedAt: Date.now(),
              completionScoreAverage: averageQuizScore,
              verifiedUrl: window.location.href,
              skillsLearned: course.learningOutcomes || ["Core Syntax", "Practical Problem Solving"]
            } : null);

            return (
              <div
                key={course.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-violet-500/40 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {course.category}
                    </span>
                    <h4 className="text-base font-black text-white mt-1.5">{course.name}</h4>
                  </div>

                  <button
                    onClick={() => onSelectCourse(course)}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Open</span>
                  </button>
                </div>

                {/* Progress Bar & Class Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{completedCount} / 100 Classes</span>
                    <span className="font-mono font-black text-amber-400">{percentage}% Complete</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 relative">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Visual Milestone Nodes (25%, 50%, 75%, 100%) */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {milestones.map((m) => {
                    const isPassed = percentage >= m.target;
                    return (
                      <div
                        key={m.target}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isPassed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold">
                          {isPassed ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Lock className="w-3 h-3 text-slate-600" />
                          )}
                          <span>{m.label}</span>
                        </div>
                        <div className="text-[9px] font-medium text-slate-400 truncate mt-0.5">
                          {m.title}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Row / Certificate Claim */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {completedCount >= 100 || cert ? (
                    <button
                      onClick={() => cert && onOpenCertificate(cert)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Verified Completion Certificate</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      {100 - completedCount} classes remaining to earn official certificate
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Achievement Badges Gallery */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Achievement Badges ({unlockedBadgeSet.size} / {ALL_ACHIEVEMENT_BADGES.length} Unlocked)
            </h3>
            <p className="text-xs text-slate-400">Earn badges for completing classes, quizzes, projects, and learning streaks.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto">
            {["all", "progress", "mastery", "streak", "project", "certificate"].map((cat) => (
              <button
                key={cat}
                onClick={() => setBadgeFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  badgeFilter === cat
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedBadgeSet.has(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center space-y-2.5 transition-all relative ${
                  isUnlocked
                    ? "bg-gradient-to-b from-amber-500/15 via-slate-900 to-indigo-950 border-amber-500/40 text-white shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60"
                }`}
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-transform ${
                  isUnlocked ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner" : "bg-slate-900 text-slate-600 border border-slate-800"
                }`}>
                  {isUnlocked ? (
                    <Award className="w-6 h-6 text-amber-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div>
                  <div className={`text-xs font-black ${isUnlocked ? "text-amber-300" : "text-slate-400"}`}>
                    {badge.title}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight mt-1 font-medium">
                    {badge.description}
                  </p>
                </div>

                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 block">
                    Locked Badge
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Mastered Skills Showcase */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          Mastered Skills Portfolio
        </h3>

        {skillsList.length > 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <p className="text-xs text-slate-400">
              Verified competencies acquired from your completed lessons, practice tasks, and quizzes:
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            Complete classes to automatically unlock and showcase your verified skills portfolio!
          </div>
        )}
      </div>

    </div>
  );
};
