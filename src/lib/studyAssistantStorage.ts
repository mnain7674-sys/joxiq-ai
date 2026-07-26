import {
  SmartNote,
  AIMemoryProfile,
  LearningGoal,
  AfterClassSummary,
  NoteCategory
} from "../types/studyAssistant";

const STORAGE_KEYS = {
  NOTES: "joxiq_study_smart_notes",
  GOALS: "joxiq_study_learning_goals",
  MEMORY: "joxiq_study_ai_memory",
  SUMMARIES: "joxiq_study_lesson_summaries",
};

// Default initial learning goals
const DEFAULT_GOALS: LearningGoal[] = [
  {
    id: "goal-1",
    type: "daily_class",
    title: "Finish 1 Class Today",
    targetCount: 1,
    currentCount: 0,
    unit: "classes",
    deadlineDays: 1,
    createdAt: new Date().toISOString(),
    completed: false,
  },
  {
    id: "goal-2",
    type: "weekly_module",
    title: "Finish 1 Module This Week",
    targetCount: 1,
    currentCount: 0,
    unit: "modules",
    deadlineDays: 7,
    createdAt: new Date().toISOString(),
    completed: false,
  },
  {
    id: "goal-3",
    type: "monthly_course",
    title: "Complete 1 Full Course This Month",
    targetCount: 1,
    currentCount: 0,
    unit: "courses",
    deadlineDays: 30,
    createdAt: new Date().toISOString(),
    completed: false,
  },
];

// Default initial AI memory
const DEFAULT_MEMORY: AIMemoryProfile = {
  completedLessonsCount: 0,
  completedLessonIds: [],
  weakTopics: ["Async JavaScript & Promises", "Neural Network Loss Functions"],
  strongTopics: ["HTML Syntax", "Python Variables", "React Components"],
  pastMistakes: [
    "Forgot return statement in array map function",
    "Confused state immutability in React useEffect hook",
    "Missing learning rate tuning in gradient descent"
  ],
  totalStudyTimeMinutes: 45,
  savedNotesCount: 0,
  lastActiveDate: new Date().toISOString().split("T")[0],
};

// Helper to notify active state listeners across components
function emitStorageEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("joxiq_study_assistant_updated"));
  }
}

// ------------------- SMART NOTES -------------------
export function getSmartNotes(): SmartNote[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) return getInitialDemoNotes();
    return JSON.parse(data);
  } catch {
    return getInitialDemoNotes();
  }
}

export function saveSmartNote(note: Omit<SmartNote, "id" | "createdAt"> & { id?: string }): SmartNote {
  const existing = getSmartNotes();
  const newNote: SmartNote = {
    ...note,
    id: note.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newNote, ...existing.filter((n) => n.id !== newNote.id)];
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
  
  // Also increment note count in AI Memory
  const mem = getAIMemory();
  updateAIMemory({ savedNotesCount: updated.length });
  emitStorageEvent();
  return newNote;
}

export function deleteSmartNote(id: string): SmartNote[] {
  const existing = getSmartNotes();
  const updated = existing.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
  
  updateAIMemory({ savedNotesCount: updated.length });
  emitStorageEvent();
  return updated;
}

// ------------------- LEARNING GOALS -------------------
export function getLearningGoals(): LearningGoal[] {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
      return DEFAULT_GOALS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_GOALS;
  }
}

export function updateGoalProgress(type: "daily_class" | "weekly_module" | "monthly_course", incrementBy = 1): LearningGoal[] {
  const goals = getLearningGoals();
  const updated = goals.map((g) => {
    if (g.type === type) {
      const nextCount = g.currentCount + incrementBy;
      const isComplete = nextCount >= g.targetCount;
      return { ...g, currentCount: nextCount, completed: isComplete };
    }
    return g;
  });

  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  emitStorageEvent();
  return updated;
}

export function setCustomGoal(goal: Omit<LearningGoal, "id" | "createdAt" | "currentCount" | "completed">): LearningGoal[] {
  const goals = getLearningGoals();
  const newGoal: LearningGoal = {
    ...goal,
    id: `goal-${Date.now()}`,
    createdAt: new Date().toISOString(),
    currentCount: 0,
    completed: false,
  };

  const updated = [newGoal, ...goals];
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  emitStorageEvent();
  return updated;
}

// ------------------- AI MEMORY -------------------
export function getAIMemory(): AIMemoryProfile {
  if (typeof window === "undefined") return DEFAULT_MEMORY;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEMORY);
    if (!data) return DEFAULT_MEMORY;
    return JSON.parse(data);
  } catch {
    return DEFAULT_MEMORY;
  }
}

export function updateAIMemory(partial: Partial<AIMemoryProfile>): AIMemoryProfile {
  const current = getAIMemory();
  const updated: AIMemoryProfile = {
    ...current,
    ...partial,
    lastActiveDate: new Date().toISOString().split("T")[0],
  };
  localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(updated));
  emitStorageEvent();
  return updated;
}

export function recordLessonCompletionMemory(courseId: string, courseName: string, classId: string, className: string, moduleName: string) {
  const mem = getAIMemory();
  const completedIds = Array.from(new Set([...mem.completedLessonIds, classId]));
  
  updateAIMemory({
    completedLessonIds: completedIds,
    completedLessonsCount: completedIds.length,
    currentLesson: {
      courseId,
      courseName,
      classId,
      className,
      moduleName,
    },
    totalStudyTimeMinutes: mem.totalStudyTimeMinutes + 15,
  });

  // Automatically update daily class goal
  updateGoalProgress("daily_class", 1);
}

export function recordPastMistake(mistakeText: string) {
  const mem = getAIMemory();
  const updatedMistakes = Array.from(new Set([mistakeText, ...mem.pastMistakes]));
  updateAIMemory({ pastMistakes: updatedMistakes });
}

// ------------------- LESSON SUMMARIES -------------------
export function getLessonSummaries(): Record<string, AfterClassSummary> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
    if (!data) return {};
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function saveLessonSummary(classId: string, summary: AfterClassSummary) {
  const existing = getLessonSummaries();
  existing[classId] = summary;
  localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(existing));
  emitStorageEvent();
}

// Demo Notes seed
function getInitialDemoNotes(): SmartNote[] {
  return [
    {
      id: "demo-note-1",
      title: "React State vs Props Fundamental Rules",
      content: "State represents internal mutable component state managed via `useState`. Props are read-only external inputs passed down from parent components.",
      category: "Web Development Notes",
      courseName: "Full-Stack Web Development",
      className: "React State & Props Deep Dive",
      createdAt: new Date().toISOString(),
      tags: ["React", "Frontend", "State Management"],
      codeSnippet: "const [count, setCount] = useState<number>(0);\nconst increment = () => setCount(prev => prev + 1);",
      keyTakeaways: [
        "Never mutate state directly — always use the setter function.",
        "Props should be treated as immutable within child components."
      ]
    },
    {
      id: "demo-note-2",
      title: "Loss Functions & Optimization in Deep Learning",
      content: "Cross-Entropy Loss measures performance of classification models. Optimizer algorithms like Adam compute adaptive learning rates for each parameter.",
      category: "AI Engineering Notes",
      courseName: "Generative AI & Machine Learning Masterclass",
      className: "Neural Networks & Loss Functions",
      createdAt: new Date().toISOString(),
      tags: ["AI", "Neural Networks", "PyTorch"],
      codeSnippet: "import torch.nn as nn\ncriterion = nn.CrossEntropyLoss()\noptimizer = torch.optim.Adam(model.parameters(), lr=0.001)",
      keyTakeaways: [
        "Cross entropy penalizes wrong confident predictions exponentially.",
        "Adam optimizer combines Momentum and RMSprop."
      ]
    },
    {
      id: "demo-note-3",
      title: "SaaS Subscription Metrics & Retention Strategy",
      content: "MRR (Monthly Recurring Revenue), Churn Rate, and LTV/CAC ratio are the core health metrics for any tech product launch.",
      category: "Business Notes",
      courseName: "Startup Product & AI Business",
      className: "Product Analytics & Growth Metrics",
      createdAt: new Date().toISOString(),
      tags: ["Business", "SaaS", "Metrics"],
      keyTakeaways: [
        "Healthy LTV to CAC ratio is 3:1 or higher.",
        "Monthly churn below 2% is ideal for B2B SaaS."
      ]
    }
  ];
}
