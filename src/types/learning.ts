export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | "Extra";

export type CourseCategory =
  | "Programming Languages"
  | "AI Engineering"
  | "Web Development"
  | "App Development"
  | "Business Courses"
  | "Other Skills";

export interface ClassQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ClassExample {
  title: string;
  codeOrText: string;
  explanation: string;
}

export interface RealLifeUsage {
  whyNeeded: string;
  realWorldApplication: string;
  skillImpact: string;
}

export interface ClassItem {
  id: string;
  classNumber: number; // 1 to 100
  title: string;
  topic?: string;
  whyImportant?: string; // Why this topic is important & solves a real learning problem
  duration: string; // e.g. "20 mins"
  learningObjective: string;
  whatYouWillLearn: string[];
  realLifeUsage: RealLifeUsage;
  explanationTopic: string;
  examples: ClassExample[];
  practiceTask: string;
  quizPlan?: string; // Overview/plan of quiz questions
  quiz: ClassQuizQuestion[];
  homework: string;
  projectConnection?: string; // How this class connects to module capstone project
  isProOnly?: boolean;
  status?: "Draft" | "Published" | "Updated";
}

export interface CurriculumRoadmapGoals {
  beginnerGoals: string[];
  intermediateGoals: string[];
  advancedGoals: string[];
  extraCareerGoals: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  level: CourseLevel;
  description: string;
  classes: ClassItem[];
  isProOnly?: boolean;
}

export interface Course {
  id: string;
  name: string;
  category: CourseCategory;
  courseGoal: string;
  shortDescription: string;
  fullDescription: string;
  requiredLevel: string;
  targetStudentLevel?: string;
  requiredSkills?: string[];
  learningOutcomes?: string[];
  curriculumRoadmap?: CurriculumRoadmapGoals;
  icon: string; // Lucide icon key
  gradientColor: string; // Tailwind gradient
  rating: number;
  enrolledCount: number;
  estimatedHours: number;
  totalClasses: number; // Exactly 100 classes per course
  modules: CourseModule[];
  freeClassesCount?: number; // Number of free trial classes (e.g. 5)
}

export interface QuizAttempt {
  classId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: number;
  answers: Record<string, number>;
}

export interface PracticeSubmission {
  classId: string;
  solutionText: string;
  completedAt: number;
}

export interface AIFeedbackResult {
  classId: string;
  strengths: string[];
  weakAreas: string[];
  suggestions: string[];
  recommendedNextSteps: string[];
  evaluationSummary: string;
  evaluatedAt: number;
}

export interface CourseCertificate {
  certificateId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  courseCategory: string;
  level: string;
  issuedAt: number;
  completionScoreAverage: number;
  verifiedUrl: string;
  skillsLearned?: string[];
  totalClassesCompleted?: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: "streak" | "progress" | "mastery" | "certificate" | "project";
  unlockedAt?: number;
  requiredCount?: number;
  currentCount?: number;
}

export interface UserCourseProgress {
  courseId: string;
  completedClassIds: string[];
  completedPracticeTaskIds?: string[];
  completedProjectIds?: string[];
  quizScores?: Record<string, QuizAttempt>;
  practiceSubmissions?: Record<string, PracticeSubmission>;
  aiEvaluations?: Record<string, AIFeedbackResult>;
  lastAccessedClassId?: string;
  enrolledAt: number;
  lastActiveAt?: number;
  streakDays?: number;
  unlockedBadgeIds?: string[];
  certificate?: CourseCertificate;
  milestonesReached?: ("25" | "50" | "75" | "100")[];
}
