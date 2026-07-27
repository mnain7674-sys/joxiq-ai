import { CourseCategory, CourseLevel } from "./learning";
import { CMSLessonPackage } from "./courseCMS";

export interface QualityScoreBreakdown {
  explanationScore: number; // 0 - 100
  exampleScore: number;     // 0 - 100
  practiceScore: number;    // 0 - 100
  quizScore: number;        // 0 - 100
  usefulnessScore: number;  // 0 - 100
  overallScore: number;     // Weighted composite 0 - 100
  passesThreshold: boolean; // overallScore >= 80
}

export interface TeachingStyleCheck {
  hasSimpleExplanationFirst: boolean;
  hasStepByStepTeaching: boolean;
  hasRealWorldExamples: boolean;
  hasPracticalApplication: boolean;
  hasSummary: boolean;
  hasPracticeTask: boolean;
  hasQuiz: boolean;
  score: number; // 0 - 100
  passed: boolean;
  missingElements: string[];
}

export interface FactCheckResult {
  passed: boolean;
  codeSyntaxValid: boolean;
  codeErrors: string[];
  outdatedOrIncorrectInfo: string[];
  notes: string;
}

export interface DuplicateContentCheck {
  isDuplicate: boolean;
  duplicateRatio: number; // 0 - 1.0
  similarLessonIds: string[];
  warnings: string[];
}

export interface StudentLevelMatchResult {
  targetLevel: CourseLevel;
  detectedComplexity: CourseLevel;
  isMatched: boolean;
  complexityScore: number; // 0 - 100
  notes: string;
}

export interface LessonValidationReport {
  id: string;
  lessonId: string;
  courseId: string;
  courseName: string;
  category: CourseCategory;
  level: CourseLevel;
  lessonTitle: string;
  
  scores: QualityScoreBreakdown;
  teachingStyleCheck: TeachingStyleCheck;
  factCheck: FactCheckResult;
  duplicateCheck: DuplicateContentCheck;
  levelMatch: StudentLevelMatchResult;

  suggestedImprovements: string[];
  status: "Passed" | "Requires Revision" | "Blocked";
  auditedAt: string;
  auditedBy: string;
}

export interface CourseCurriculumValidationReport {
  id: string;
  courseId: string;
  courseName: string;
  category: CourseCategory;
  totalClassesFound: number;
  
  levelDistribution: {
    beginnerCount: number;
    intermediateCount: number;
    advancedCount: number;
    extraCount: number;
  };

  properOrderCheck: {
    isValid: boolean;
    issues: string[];
  };

  duplicateTopicsFound: string[];
  missingConcepts: string[];
  overallCourseQualityScore: number;
  isCoursePublishedReady: boolean;
  validatedAt: string;
}

export interface AITeacherFeedbackInsight {
  courseId: string;
  courseName: string;
  difficultTopics: string[];
  commonMistakes: string[];
  quizFailureRateAlerts: {
    lessonId: string;
    lessonTitle: string;
    failureRatePercentage: number;
  }[];
  recommendedRevisions: {
    lessonId: string;
    lessonTitle: string;
    recommendation: string;
    priority: "High" | "Medium" | "Low";
  }[];
  lastAnalyzedAt: string;
}

export interface QualityMetricsSummary {
  totalAuditedLessons: number;
  passedLessonsCount: number;
  revisionRequiredCount: number;
  blockedLessonsCount: number;
  averageQualityScore: number;
  factCheckAccuracyRate: number;
  curriculumCoveragePercentage: number;
}
