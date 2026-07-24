export type StudentSpeedCategory = "Fast Learner" | "Steady Pace" | "Needs Guided Practice";

export type AdaptiveDifficultyLevel = "Beginner Fundamentals" | "Intermediate Problem Solver" | "Advanced Mastery";

export interface StudentTopicAnalysis {
  topic: string;
  category: string;
  status: "Strong" | "Weak" | "Needs Practice" | "Mastered";
  averageQuizScore?: number;
  lastClassId?: string;
  lastCourseId?: string;
}

export interface AITeacherSummaryFeedback {
  whatYouLearned: string;
  whatYouNeedToImprove: string;
  whatYouShouldLearnNext: string;
  encouragingQuote?: string;
}

export interface DailyLearningSupportGoal {
  dailyGoalTitle: string;
  recommendedClassId: string;
  recommendedClassTitle: string;
  recommendedCourseId: string;
  recommendedCourseName: string;
  practiceReminderText: string;
  targetMinutes: number;
  completedMinutesToday?: number;
  streakCount: number;
}

export interface RecommendedActionItem {
  id: string;
  type: "next_lesson" | "revision_topic" | "practice_task" | "extra_exercise" | "hard_challenge" | "project_build";
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  classId?: string;
  classNumber?: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  reason: string;
  actionText: string;
}

export interface CourseRecommendation {
  courseId: string;
  courseName: string;
  category: string;
  requiredLevel: string;
  matchScorePercentage: number;
  reason: string;
  skillsYouWillGain: string[];
}

export interface StudentLearningProfileAnalysis {
  totalClassesCompleted: number;
  completedCoursesCount: number;
  averageQuizScore: number;
  practiceTaskCount: number;
  learningSpeed: StudentSpeedCategory;
  adaptiveDifficulty: AdaptiveDifficultyLevel;
  strongTopics: StudentTopicAnalysis[];
  weakTopics: StudentTopicAnalysis[];
  aiTeacherFeedback: AITeacherSummaryFeedback;
  dailyGoal: DailyLearningSupportGoal;
  recommendedActions: RecommendedActionItem[];
  suggestedCourses: CourseRecommendation[];
}
