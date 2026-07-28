import { db, doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "../lib/firebase";
import {
  CMSLessonPackage,
  CMSLessonVersionRecord,
  CMSContentStatus
} from "../types/courseCMS";
import { CourseCategory, CourseLevel } from "../types/learning";
import { AutomationLogger } from "../lib/automationLogger";

const FIRESTORE_COLLECTION = "course_lessons";
const LOCAL_STORAGE_KEY = "joxiq_cms_lessons_cache";

/**
 * In-memory fallback / quick cache for instant UI rendering
 */
let lessonsCache: Map<string, CMSLessonPackage> = new Map();

/**
 * Helper to generate default empty or blueprint CMS Lesson Package
 */
export function createEmptyCMSLessonPackage(
  category: CourseCategory = "Programming Languages",
  courseId = "py-course",
  courseName = "Python Programming Masterclass",
  level: CourseLevel = "Beginner",
  moduleId = "mod-py-1",
  moduleTitle = "Python Fundamentals & Syntax",
  lessonNumber = 1
): CMSLessonPackage {
  const lessonId = `lesson-${courseId}-${moduleId}-l${lessonNumber}-${Date.now()}`;
  return {
    category,
    courseId,
    courseName,
    level,
    moduleId,
    moduleTitle,

    lessonId,
    lessonNumber,
    title: `New Lesson ${lessonNumber}`,
    objective: "Master core principles and practical application of this topic.",
    learningOutcomes: [
      "Understand foundational concepts",
      "Implement real-world code or solution",
      "Pass assessment quiz and practice tasks"
    ],
    duration: "25 mins",
    difficulty: level,
    prerequisites: ["Basic computer operation", "Curiosity to learn"],

    // Teaching Content
    aiTeacherScript:
      "Welcome to this lesson! Today we will break down the essential concepts step-by-step with practical examples and live board demonstrations.",
    voiceScript:
      "Hello learner! Stay focused as we walk through the core topic and see how it applies to real production systems.",
    boardScript:
      "[BOARD DIAGRAM]: Concept Flowchart -> Execution Model -> Practical Output",
    screenText:
      "Topic Key Concepts:\n1. Core Definition\n2. Implementation Syntax\n3. Best Practices & Common Pitfalls",
    codeExamples: [
      {
        id: `ex-${Date.now()}-1`,
        title: "Standard Implementation",
        language: "python",
        code: `# Standard Implementation Example\ndef process_data(input_val):\n    print("Processing:", input_val)\n    return input_val * 2\n\nresult = process_data(10)\nprint("Result:", result)`,
        explanation:
          "This code demonstrates standard input processing, returning calculated results cleanly."
      }
    ],
    realLifeExamples: [
      {
        id: `rl-${Date.now()}-1`,
        scenario: "E-Commerce Checkout Flow",
        application: "Validating user input and processing payment payloads asynchronously.",
        impact: "Ensures error-free transactions and high system throughput."
      }
    ],
    visualInstructions: {
      highlightInstructions: "Highlight key variable declarations and return values in yellow.",
      underlineInstructions: "Underline crucial conditional logic statements.",
      circleInstructions: "Circle function parameter inputs on the virtual board.",
      arrowInstructions: "Draw arrows from input payload to output transformation node.",
      virtualPenInstructions: "Annotate memory allocation steps step-by-step during script playback."
    },

    // Student Activities
    practiceTasks: [
      {
        id: `pt-${Date.now()}-1`,
        title: "Hands-on Exercise",
        instructions: "Write a function that accepts an array of numbers and returns only even numbers.",
        starterCode: "def filter_evens(nums):\n    # Write your solution here\n    pass",
        expectedOutcome: "filter_evens([1, 2, 3, 4, 5, 6]) should return [2, 4, 6]"
      }
    ],
    quiz: [
      {
        id: `qz-${Date.now()}-1`,
        question: "What is the main advantage of modular code architecture?",
        options: [
          "Improves code readability and reusability",
          "Makes execution 100x slower",
          "Removes the need for variables",
          "Requires no memory"
        ],
        correctOptionIndex: 0,
        explanation: "Modular code separates concerns into distinct reusable functions or modules."
      }
    ],
    homework: {
      title: "Module Application Challenge",
      instructions: "Build a small script utilizing the concepts covered in this lesson and submit your code repository link.",
      submissionGuidelines: "Submit via the AI Academy Practice Playground."
    },
    miniChallenge: {
      title: "Speed Debugging",
      challengePrompt: "Fix 3 syntax bugs in under 2 minutes to earn 50 bonus XP!",
      bonusPoints: 50
    },
    aiFeedbackConfig: {
      criteria: ["Code correctness", "Syntax formatting", "Edge case handling"],
      promptInstructions: "Evaluate the student code line-by-line and provide constructive feedback.",
      autoEvaluate: true
    },
    lessonSummary: [
      "Core definitions and syntactical rules learned",
      "Real-world application scenarios identified",
      "Completed practical challenge and assessment quiz"
    ],

    // Lesson Assets
    assets: {
      textAssets: [
        {
          title: "Lesson Cheat Sheet",
          contentMarkdown: "### Key Principles\n- Keep functions pure\n- Avoid global mutable state\n- Write clear inline documentation"
        }
      ],
      images: [
        {
          id: `img-${Date.now()}-1`,
          url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
          caption: "System Execution Architecture Flow",
          altText: "Diagram illustrating process pipeline"
        }
      ],
      diagrams: [
        {
          id: `diag-${Date.now()}-1`,
          title: "Execution Flowchart",
          type: "mermaid",
          content: "graph TD;\n    A[User Input] --> B[Validation];\n    B --> C[Processing Engine];\n    C --> D[Response Output];"
        }
      ],
      codeSnippets: [
        {
          id: `snip-${Date.now()}-1`,
          language: "python",
          filename: "main.py",
          code: "# Core Lesson Snippet\nif __name__ == '__main__':\n    print('JOXIQ AI Learning Academy Core Engine')"
        }
      ],
      tables: [
        {
          id: `tbl-${Date.now()}-1`,
          title: "Complexity Comparison",
          headers: ["Method", "Time Complexity", "Space Complexity"],
          rows: [
            ["Linear Search", "O(N)", "O(1)"],
            ["Binary Search", "O(log N)", "O(1)"],
            ["Hash Map Lookup", "O(1)", "O(N)"]
          ]
        }
      ],
      flowcharts: [
        {
          id: `flow-${Date.now()}-1`,
          title: "Data Pipeline Decision Tree",
          flowchartData: "Start -> Validate -> Sanitize -> Save -> Respond"
        }
      ],
      videoUrl: ""
    },

    status: "Draft",
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: "System Admin",
    commitNotes: "Initial lesson creation package initialized.",
    versionHistory: []
  };
}

/**
 * Save / Update a lesson package in Firestore & Local Sync
 */
export async function saveCMSLessonToFirestore(
  lesson: CMSLessonPackage,
  updatedBy = "Admin",
  commitNotes = "Updated lesson package content"
): Promise<{ success: boolean; lesson: CMSLessonPackage; error?: string }> {
  try {
    const lessonRef = doc(db, FIRESTORE_COLLECTION, lesson.lessonId);
    let existingDocSnap: CMSLessonPackage | null = null;

    try {
      const snap = await getDoc(lessonRef);
      if (snap.exists()) {
        existingDocSnap = snap.data() as CMSLessonPackage;
      }
    } catch (fetchErr) {
      console.warn("Firestore fetch existing doc failed, using memory fallback:", fetchErr);
      existingDocSnap = lessonsCache.get(lesson.lessonId) || null;
    }

    // Version control snapshot handling
    const currentVersion = existingDocSnap ? existingDocSnap.version || 1 : 1;
    const nextVersion = existingDocSnap ? currentVersion + 1 : 1;

    const history = existingDocSnap?.versionHistory ? [...existingDocSnap.versionHistory] : [];

    if (existingDocSnap) {
      // Archive existing state before applying update
      const { versionHistory: _hist, ...snapshotWithoutHistory } = existingDocSnap;
      const historyEntry: CMSLessonVersionRecord = {
        versionNumber: existingDocSnap.version || 1,
        updatedAt: existingDocSnap.updatedAt || new Date().toISOString(),
        updatedBy: existingDocSnap.updatedBy || "Admin",
        commitNotes: existingDocSnap.commitNotes || "Version archived before update",
        snapshot: snapshotWithoutHistory
      };
      history.unshift(historyEntry); // Put latest archived version at top
    }

    const updatedPackage: CMSLessonPackage = {
      ...lesson,
      version: nextVersion,
      status: lesson.status || "Updated",
      updatedAt: new Date().toISOString(),
      updatedBy,
      commitNotes,
      versionHistory: history
    };

    // Save to Firestore
    await setDoc(lessonRef, updatedPackage);

    // Update local cache & localStorage
    lessonsCache.set(lesson.lessonId, updatedPackage);
    saveCacheToLocalStorage();

    // Log automation activity
    AutomationLogger.logActivity(
      "Course CMS Engine",
      `Saved lesson '${updatedPackage.title}' (v${updatedPackage.version}, Status: ${updatedPackage.status}) to Firestore.`
    );

    return { success: true, lesson: updatedPackage };
  } catch (err: any) {
    console.error("Error saving lesson package to Firestore:", err);

    // Fallback save to memory cache
    const fallbackPackage: CMSLessonPackage = {
      ...lesson,
      version: (lesson.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy,
      commitNotes: commitNotes + " (Saved locally)"
    };
    lessonsCache.set(lesson.lessonId, fallbackPackage);
    saveCacheToLocalStorage();

    return {
      success: true,
      lesson: fallbackPackage,
      error: `Firestore offline fallback used: ${err.message || err}`
    };
  }
}

/**
 * Fetch a single lesson package from Firestore
 */
export async function getCMSLessonFromFirestore(
  lessonId: string
): Promise<CMSLessonPackage | null> {
  try {
    const lessonRef = doc(db, FIRESTORE_COLLECTION, lessonId);
    const snap = await getDoc(lessonRef);
    if (snap.exists()) {
      const data = snap.data() as CMSLessonPackage;
      lessonsCache.set(lessonId, data);
      return data;
    }
  } catch (err) {
    console.warn(`Firestore read failed for lesson ${lessonId}, checking cache:`, err);
  }

  return lessonsCache.get(lessonId) || null;
}

/**
 * Fetch all lessons from Firestore
 */
export async function getAllCMSLessonsFromFirestore(): Promise<CMSLessonPackage[]> {
  try {
    const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));
    const results: CMSLessonPackage[] = [];
    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data() as CMSLessonPackage;
      if (item && item.lessonId) {
        results.push(item);
        lessonsCache.set(item.lessonId, item);
      }
    });

    if (results.length > 0) {
      saveCacheToLocalStorage();
      return results;
    }
  } catch (err) {
    console.warn("Firestore fetch all lessons failed, loading from local cache:", err);
  }

  // Load local cache fallback
  loadCacheFromLocalStorage();
  return Array.from(lessonsCache.values());
}

/**
 * Delete a lesson from Firestore
 */
export async function deleteCMSLessonFromFirestore(
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, FIRESTORE_COLLECTION, lessonId));
    lessonsCache.delete(lessonId);
    saveCacheToLocalStorage();

    AutomationLogger.logActivity(
      "Course CMS Engine",
      `Deleted lesson '${lessonId}' from Firestore database.`
    );
    return { success: true };
  } catch (err: any) {
    console.error(`Error deleting lesson ${lessonId}:`, err);
    lessonsCache.delete(lessonId);
    saveCacheToLocalStorage();
    return { success: true, error: err.message };
  }
}

/**
 * Duplicate a lesson package in Firestore
 */
export async function duplicateCMSLessonInFirestore(
  sourceLessonId: string,
  targetModuleId?: string,
  targetModuleTitle?: string
): Promise<{ success: boolean; duplicatedLesson?: CMSLessonPackage; error?: string }> {
  const original = await getCMSLessonFromFirestore(sourceLessonId);
  if (!original) {
    return { success: false, error: "Source lesson package not found." };
  }

  const newLessonId = `lesson-${original.courseId}-${targetModuleId || original.moduleId}-dup-${Date.now()}`;
  const duplicated: CMSLessonPackage = {
    ...JSON.parse(JSON.stringify(original)),
    lessonId: newLessonId,
    title: `${original.title} (Copy)`,
    moduleId: targetModuleId || original.moduleId,
    moduleTitle: targetModuleTitle || original.moduleTitle,
    status: "Draft",
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: "Admin",
    commitNotes: `Duplicated from lesson '${original.title}' (${original.lessonId})`,
    versionHistory: []
  };

  const res = await saveCMSLessonToFirestore(
    duplicated,
    "Admin",
    `Duplicated from '${original.title}'`
  );
  return {
    success: res.success,
    duplicatedLesson: res.lesson,
    error: res.error
  };
}

/**
 * Move a lesson to another module or course
 */
export async function moveCMSLessonInFirestore(
  lessonId: string,
  targetCourseId: string,
  targetCourseName: string,
  targetCategory: CourseCategory,
  targetModuleId: string,
  targetModuleTitle: string
): Promise<{ success: boolean; movedLesson?: CMSLessonPackage; error?: string }> {
  const lesson = await getCMSLessonFromFirestore(lessonId);
  if (!lesson) {
    return { success: false, error: "Lesson package not found." };
  }

  const updated: CMSLessonPackage = {
    ...lesson,
    category: targetCategory,
    courseId: targetCourseId,
    courseName: targetCourseName,
    moduleId: targetModuleId,
    moduleTitle: targetModuleTitle,
    status: "Updated",
    commitNotes: `Moved lesson to Course '${targetCourseName}' -> Module '${targetModuleTitle}'`
  };

  const res = await saveCMSLessonToFirestore(
    updated,
    "Admin",
    `Moved to module '${targetModuleTitle}'`
  );
  return { success: res.success, movedLesson: res.lesson, error: res.error };
}

/**
 * Restore a previous version from versionHistory
 */
export async function restoreCMSLessonVersionInFirestore(
  lessonId: string,
  targetVersionNumber: number
): Promise<{ success: boolean; restoredLesson?: CMSLessonPackage; error?: string }> {
  const current = await getCMSLessonFromFirestore(lessonId);
  if (!current || !current.versionHistory || current.versionHistory.length === 0) {
    return { success: false, error: "No version history available for this lesson." };
  }

  const targetRecord = current.versionHistory.find(
    (v) => v.versionNumber === targetVersionNumber
  );

  if (!targetRecord) {
    return {
      success: false,
      error: `Version v${targetVersionNumber} snapshot not found in history.`
    };
  }

  const snapshot = targetRecord.snapshot;
  const restored: CMSLessonPackage = {
    ...snapshot,
    lessonId: current.lessonId,
    versionHistory: current.versionHistory, // keep entire history intact
    status: "Updated",
    commitNotes: `Restored back to Version v${targetVersionNumber} snapshot (from ${targetRecord.updatedAt})`
  };

  const res = await saveCMSLessonToFirestore(
    restored,
    "Admin",
    `Restored v${targetVersionNumber} snapshot`
  );

  AutomationLogger.logActivity(
    "Course CMS Version Control",
    `Restored lesson '${current.title}' (${current.lessonId}) back to Version v${targetVersionNumber}.`
  );

  return { success: res.success, restoredLesson: res.lesson, error: res.error };
}

/**
 * Seed initial real lessons into Firestore if empty
 */
export async function seedInitialCMSLessonsToFirestore(): Promise<number> {
  try {
    const existing = await getAllCMSLessonsFromFirestore();
    if (existing.length >= 6) {
      console.log(`Firestore CMS already contains ${existing.length} lessons.`);
      return existing.length;
    }

    const blueprints: {
      category: CourseCategory;
      courseId: string;
      courseName: string;
      level: CourseLevel;
      moduleId: string;
      moduleTitle: string;
      title: string;
      topic: string;
    }[] = [
      {
        category: "Programming Languages",
        courseId: "py-course",
        courseName: "Python Programming Masterclass",
        level: "Beginner",
        moduleId: "mod-py-1",
        moduleTitle: "Python Fundamentals & Syntax",
        title: "Python 3 Syntax, Dynamic Typing & Execution Model",
        topic: "Python Core"
      },
      {
        category: "AI Engineering",
        courseId: "llm-ai-course",
        courseName: "LLM & Generative AI Architecture",
        level: "Intermediate",
        moduleId: "mod-ai-1",
        moduleTitle: "Prompt Engineering & Vector Embeddings",
        title: "Vector Embeddings & Cosine Similarity in Practice",
        topic: "Vector Databases"
      },
      {
        category: "Web Development",
        courseId: "fullstack-react-node",
        courseName: "Full Stack React 18 & Node.js Masterclass",
        level: "Beginner",
        moduleId: "mod-web-1",
        moduleTitle: "React Component Model & Virtual DOM",
        title: "State Management & React Hooks Architecture",
        topic: "React Architecture"
      },
      {
        category: "App Development",
        courseId: "flutter-crossplatform",
        courseName: "Flutter & Dart Mobile Engineering",
        level: "Beginner",
        moduleId: "mod-app-1",
        moduleTitle: "Dart Syntax & Flutter Widget Tree",
        title: "Building Responsive Flutter UI Layouts",
        topic: "Flutter UI"
      },
      {
        category: "Business Courses",
        courseId: "ai-entrepreneurship",
        courseName: "AI Startup & Product Management",
        level: "Intermediate",
        moduleId: "mod-biz-1",
        moduleTitle: "AI Product Design & Market Validation",
        title: "Defining Minimum Viable AI Products (MVP)",
        topic: "AI Product Strategy"
      },
      {
        category: "Other Skills",
        courseId: "cybersecurity-defence",
        courseName: "Cybersecurity & Ethical Hacking",
        level: "Beginner",
        moduleId: "mod-sec-1",
        moduleTitle: "Network Security & Protocol Analysis",
        title: "HTTPS, SSL/TLS Handshake & Encryption Mechanics",
        topic: "Cyber Security"
      }
    ];

    let count = 0;
    for (let i = 0; i < blueprints.length; i++) {
      const bp = blueprints[i];
      const pkg = createEmptyCMSLessonPackage(
        bp.category,
        bp.courseId,
        bp.courseName,
        bp.level,
        bp.moduleId,
        bp.moduleTitle,
        i + 1
      );
      pkg.title = bp.title;
      pkg.status = "Published";
      pkg.lessonId = `lesson-${bp.courseId}-${bp.moduleId}-default-${i + 1}`;

      await saveCMSLessonToFirestore(pkg, "System Initializer", "Seeded foundational course lesson package");
      count++;
    }

    console.log(`Successfully seeded ${count} foundational CMS lesson packages to Firestore.`);
    return count;
  } catch (err) {
    console.error("Error seeding initial CMS lessons:", err);
    return 0;
  }
}

/**
 * Local Cache storage helpers
 */
function saveCacheToLocalStorage() {
  try {
    const obj: Record<string, CMSLessonPackage> = {};
    lessonsCache.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn("Could not write CMS lessons to localStorage:", e);
  }
}

function loadCacheFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, CMSLessonPackage>;
      Object.keys(parsed).forEach((key) => {
        lessonsCache.set(key, parsed[key]);
      });
    }
  } catch (e) {
    console.warn("Could not read CMS lessons from localStorage:", e);
  }
}
