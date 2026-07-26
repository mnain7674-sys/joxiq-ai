export type NoteCategory =
  | "Class Notes"
  | "Code Notes"
  | "Business Notes"
  | "AI Engineering Notes"
  | "Web Development Notes";

export interface BeforeClassBrief {
  classId: string;
  learningGoal: string;
  skillsGained: string[];
  estimatedDurationMinutes: number;
  requiredKnowledge: string[];
}

export interface ConceptCheckQuestion {
  id: string;
  concept: string;
  explanation: string;
  realLifeExample: string;
  checkQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface ImportantDefinition {
  term: string;
  definition: string;
}

export interface AfterClassSummary {
  classId: string;
  className: string;
  courseName: string;
  summary: string;
  keyPoints: string[];
  importantDefinitions: ImportantDefinition[];
  commonMistakes: string[];
  revisionNotes: string[];
  suggestedCategory: NoteCategory;
  suggestedNextLesson?: { id: string; title: string; courseId: string };
  extraPracticeTask?: string;
  relatedProjectIdea?: string;
}

export interface SmartNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  courseId?: string;
  courseName?: string;
  classId?: string;
  className?: string;
  createdAt: string;
  tags: string[];
  codeSnippet?: string;
  keyTakeaways?: string[];
}

export interface QuickRevision {
  classId: string;
  className: string;
  mode: "2min" | "5min" | "full";
  title: string;
  bullets: string[];
  keyTakeaway: string;
  codeHighlights?: string[];
  formulaOrRule?: string;
}

export interface AIMemoryProfile {
  currentLesson?: {
    courseId: string;
    classId: string;
    className: string;
    courseName: string;
    moduleName: string;
  };
  completedLessonsCount: number;
  completedLessonIds: string[];
  weakTopics: string[];
  strongTopics: string[];
  pastMistakes: string[];
  totalStudyTimeMinutes: number;
  savedNotesCount: number;
  lastActiveDate: string;
}

export interface LearningGoal {
  id: string;
  type: "daily_class" | "weekly_module" | "monthly_course";
  title: string;
  targetCount: number;
  currentCount: number;
  unit: "classes" | "modules" | "courses";
  deadlineDays: number;
  createdAt: string;
  completed: boolean;
}
