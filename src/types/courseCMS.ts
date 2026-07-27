import { CourseCategory, CourseLevel } from "./learning";

export type CMSContentStatus = "Draft" | "Under Review" | "Published" | "Updated";

export interface CMSCodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
}

export interface CMSRealLifeExample {
  id: string;
  scenario: string;
  application: string;
  impact: string;
}

export interface CMSVisualInstructions {
  highlightInstructions: string;
  underlineInstructions: string;
  circleInstructions: string;
  arrowInstructions: string;
  virtualPenInstructions: string;
}

export interface CMSPracticeTask {
  id: string;
  title: string;
  instructions: string;
  starterCode?: string;
  expectedOutcome?: string;
}

export interface CMSQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CMSHomework {
  title: string;
  instructions: string;
  submissionGuidelines?: string;
}

export interface CMSMiniChallenge {
  title: string;
  challengePrompt: string;
  bonusPoints: number;
}

export interface CMSAIFeedbackConfig {
  criteria: string[];
  promptInstructions: string;
  autoEvaluate: boolean;
}

export interface CMSImageAsset {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

export interface CMSDiagramAsset {
  id: string;
  title: string;
  type: "mermaid" | "svg" | "ascii";
  content: string;
}

export interface CMSCodeAsset {
  id: string;
  language: string;
  filename: string;
  code: string;
}

export interface CMSTableAsset {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
}

export interface CMSFlowchartAsset {
  id: string;
  title: string;
  flowchartData: string;
}

export interface CMSLessonAssets {
  textAssets: { title: string; contentMarkdown: string }[];
  images: CMSImageAsset[];
  diagrams: CMSDiagramAsset[];
  codeSnippets: CMSCodeAsset[];
  tables: CMSTableAsset[];
  flowcharts: CMSFlowchartAsset[];
  videoUrl?: string;
}

export interface CMSLessonPackage {
  // Structure Hierarchy
  category: CourseCategory;
  courseId: string;
  courseName: string;
  level: CourseLevel;
  moduleId: string;
  moduleTitle: string;

  // Lesson Metadata Package
  lessonId: string;
  lessonNumber: number;
  title: string;
  objective: string;
  learningOutcomes: string[];
  duration: string; // e.g. "25 mins"
  difficulty: CourseLevel;
  prerequisites: string[];

  // Teaching Content
  aiTeacherScript: string;
  voiceScript: string;
  boardScript: string;
  screenText: string;
  codeExamples: CMSCodeExample[];
  realLifeExamples: CMSRealLifeExample[];
  visualInstructions: CMSVisualInstructions;

  // Student Activities
  practiceTasks: CMSPracticeTask[];
  quiz: CMSQuizQuestion[];
  homework: CMSHomework;
  miniChallenge: CMSMiniChallenge;
  aiFeedbackConfig: CMSAIFeedbackConfig;
  lessonSummary: string[];

  // Lesson Assets
  assets: CMSLessonAssets;

  // Status & Version Control
  status: CMSContentStatus;
  version: number;
  updatedAt: string;
  updatedBy: string;
  commitNotes?: string;
  versionHistory?: CMSLessonVersionRecord[];
}

export interface CMSLessonVersionRecord {
  versionNumber: number;
  updatedAt: string;
  updatedBy: string;
  commitNotes: string;
  snapshot: Omit<CMSLessonPackage, "versionHistory">;
}
