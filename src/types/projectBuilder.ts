export type ProjectCategory =
  | "Programming"
  | "AI Engineering"
  | "Web Development"
  | "App Development"
  | "Business";

export type ProjectDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface ProjectStep {
  stepNumber: number;
  title: string;
  description: string;
  tasks: string[];
  codeTemplateOrHint?: string;
}

export interface ProjectRequirement {
  id: string;
  title: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  courseId?: string;
  courseName?: string;
  moduleId?: string;
  moduleTitle?: string;
  connectedClassNumber?: number;
  description: string;
  skillsUsed: string[];
  estimatedHours: number;
  prerequisites: string[];
  deliverables: string[];
  steps: ProjectStep[];
  starterCodeOrPlan: string;
  testCases: string[];
  improvementPrompts: string[];
}

export interface StudentPortfolioProject {
  id: string;
  projectId: string;
  title: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  description: string;
  skillsUsed: string[];
  courseName?: string;
  completedAt: number;
  submissionCodeOrPlan: string;
  aiMentorFeedback?: string;
  status: "In Progress" | "Completed";
  currentWorkflowStep: number; // 1 to 7
}
