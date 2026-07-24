import { AchievementBadge, UserCourseProgress } from "../types/learning";

export const ALL_ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: "first_class",
    title: "First Class Completed",
    description: "Completed your first lesson in JOXIQ AI Academy",
    iconName: "Zap",
    category: "progress",
    requiredCount: 1
  },
  {
    id: "first_quiz",
    title: "First Quiz Passed",
    description: "Passed your first knowledge check quiz with >=70% score",
    iconName: "Award",
    category: "mastery",
    requiredCount: 1
  },
  {
    id: "class_10",
    title: "10 Classes Completed",
    description: "Finished 10 classes across your learning catalog",
    iconName: "BookOpen",
    category: "progress",
    requiredCount: 10
  },
  {
    id: "class_50",
    title: "50 Classes Completed",
    description: "Mastered 50 classes with dedication and consistency",
    iconName: "Target",
    category: "progress",
    requiredCount: 50
  },
  {
    id: "first_project",
    title: "First Project Completed",
    description: "Successfully built and verified a project in AI Project Builder",
    iconName: "Rocket",
    category: "project",
    requiredCount: 1
  },
  {
    id: "course_completed",
    title: "Course Completed",
    description: "Finished a full 100-class course & earned a verified certificate",
    iconName: "GraduationCap",
    category: "certificate",
    requiredCount: 100
  },
  {
    id: "coding_master",
    title: "Coding Challenge Master",
    description: "Completed 5+ hands-on coding exercises or scored 100% on a hard quiz",
    iconName: "Code2",
    category: "mastery",
    requiredCount: 5
  },
  {
    id: "streak_3",
    title: "3-Day Streak Achieved",
    description: "Learned on JOXIQ for 3 consecutive days",
    iconName: "Flame",
    category: "streak",
    requiredCount: 3
  },
  {
    id: "streak_7",
    title: "7-Day Power Learner",
    description: "Maintained a week-long active learning streak",
    iconName: "Sparkles",
    category: "streak",
    requiredCount: 7
  },
  {
    id: "streak_30",
    title: "30-Day Legend Streak",
    description: "Unstoppable! Maintained a 30-day continuous learning streak",
    iconName: "Crown",
    category: "streak",
    requiredCount: 30
  }
];

export function checkAndCalculateBadges(
  progress: UserCourseProgress,
  allProgresses: UserCourseProgress[] = []
): { updatedUnlockedIds: string[]; newlyUnlocked: AchievementBadge[] } {
  const currentUnlocked = new Set(progress.unlockedBadgeIds || []);
  const newlyUnlocked: AchievementBadge[] = [];

  const combinedProgresses = allProgresses.length > 0 ? allProgresses : [progress];

  // Total Metrics across all enrolled courses
  const totalClassesCompleted = combinedProgresses.reduce(
    (sum, p) => sum + (p.completedClassIds?.length || 0),
    0
  );

  const totalPracticesCompleted = combinedProgresses.reduce(
    (sum, p) => sum + (p.completedPracticeTaskIds?.length || 0),
    0
  );

  const totalProjectsCompleted = combinedProgresses.reduce(
    (sum, p) => sum + (p.completedProjectIds?.length || 0),
    0
  );

  // Collect all quiz scores
  const allQuizzesPassed = combinedProgresses.flatMap((p) =>
    Object.values(p.quizScores || {}).filter((q) => q.percentage >= 70)
  );

  const hasPerfectQuiz = combinedProgresses.some((p) =>
    Object.values(p.quizScores || {}).some((q) => q.percentage === 100)
  );

  // Highest streak across all
  const maxStreak = Math.max(
    progress.streakDays || 1,
    ...combinedProgresses.map((p) => p.streakDays || 1)
  );

  // Check 1: First Class Completed
  if (totalClassesCompleted >= 1 && !currentUnlocked.has("first_class")) {
    currentUnlocked.add("first_class");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "first_class");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 2: First Quiz Passed
  if (allQuizzesPassed.length >= 1 && !currentUnlocked.has("first_quiz")) {
    currentUnlocked.add("first_quiz");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "first_quiz");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 3: 10 Classes Completed
  if (totalClassesCompleted >= 10 && !currentUnlocked.has("class_10")) {
    currentUnlocked.add("class_10");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "class_10");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 4: 50 Classes Completed
  if (totalClassesCompleted >= 50 && !currentUnlocked.has("class_50")) {
    currentUnlocked.add("class_50");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "class_50");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 5: First Project Completed
  if (totalProjectsCompleted >= 1 && !currentUnlocked.has("first_project")) {
    currentUnlocked.add("first_project");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "first_project");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 6: Course Completed
  const hasCourseCompleted = combinedProgresses.some(
    (p) => (p.completedClassIds?.length || 0) >= 100 || !!p.certificate
  );
  if (hasCourseCompleted && !currentUnlocked.has("course_completed")) {
    currentUnlocked.add("course_completed");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "course_completed");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 7: Coding Challenge Master (5+ practices or perfect quiz score)
  if ((totalPracticesCompleted >= 5 || hasPerfectQuiz) && !currentUnlocked.has("coding_master")) {
    currentUnlocked.add("coding_master");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "coding_master");
    if (badge) newlyUnlocked.push(badge);
  }

  // Check 8, 9, 10: Streaks
  if (maxStreak >= 3 && !currentUnlocked.has("streak_3")) {
    currentUnlocked.add("streak_3");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "streak_3");
    if (badge) newlyUnlocked.push(badge);
  }
  if (maxStreak >= 7 && !currentUnlocked.has("streak_7")) {
    currentUnlocked.add("streak_7");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "streak_7");
    if (badge) newlyUnlocked.push(badge);
  }
  if (maxStreak >= 30 && !currentUnlocked.has("streak_30")) {
    currentUnlocked.add("streak_30");
    const badge = ALL_ACHIEVEMENT_BADGES.find((b) => b.id === "streak_30");
    if (badge) newlyUnlocked.push(badge);
  }

  return {
    updatedUnlockedIds: Array.from(currentUnlocked),
    newlyUnlocked
  };
}
