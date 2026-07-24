import {
  Course,
  CourseCategory,
  CourseLevel,
  CourseModule,
  ClassItem,
  ClassExample,
  ClassQuizQuestion
} from "../types/learning";

interface CourseBlueprint {
  id: string;
  name: string;
  category: CourseCategory;
  shortDescription: string;
  fullDescription: string;
  courseGoal: string;
  requiredLevel: string;
  icon: string;
  gradientColor: string;
  rating: number;
  enrolledCount: number;
  estimatedHours: number;
  keyTopics: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    extra: string[];
  };
}

export function buildCourseCurriculum(bp: CourseBlueprint): Course {
  const modules: CourseModule[] = [];

  // Helper to generate a class
  const createClass = (
    num: number,
    level: CourseLevel,
    topicName: string,
    modTitle: string
  ): ClassItem => {
    const classId = `${bp.id}-cls-${num}`;

    // Domain tailored code sample generator
    const codeSnippet = generateDomainCodeSnippet(bp.name, topicName, num);

    const examples: ClassExample[] = [
      {
        title: `Practical Implementation of ${topicName}`,
        codeOrText: codeSnippet,
        explanation: `This example demonstrates core usage of ${topicName} in real production environments.`
      }
    ];

    const quiz: ClassQuizQuestion[] = [
      {
        id: `q1-${num}`,
        question: `What is the primary architectural purpose of ${topicName} in ${bp.name}?`,
        options: [
          `To enforce scalability, clean design, and predictable behavior`,
          `To bypass compiler checks and memory allocation`,
          `To reduce network latency by converting code to plain HTML`,
          `To replace database transactions entirely`
        ],
        correctOptionIndex: 0,
        explanation: `${topicName} provides structured patterns to ensure scalability, robust execution, and maintainability in ${bp.name}.`
      },
      {
        id: `q2-${num}`,
        question: `When applying ${topicName} in real-life applications, which principle should be prioritized?`,
        options: [
          `Separation of concerns and fault tolerance`,
          `Writing all logic in a single global variable`,
          `Ignoring error handling for speed`,
          `Hardcoding production credentials`
        ],
        correctOptionIndex: 0,
        explanation: `Separation of concerns and fault tolerance ensure code remains maintainable and safe in enterprise systems.`
      }
    ];

    return {
      id: classId,
      classNumber: num,
      title: `Class ${num}: ${topicName}`,
      topic: topicName,
      whyImportant: `${topicName} is crucial because it solves the fundamental challenge of building robust, scalable applications in ${bp.name}. Mastering this eliminates guesswork and prevents common production bugs.`,
      duration: `${15 + (num % 10)} mins`,
      learningObjective: `Master ${topicName} in ${bp.name}, understanding its underlying principles, syntax, and enterprise application.`,
      whatYouWillLearn: [
        `Core mechanics and syntax of ${topicName}`,
        `Best practices and avoiding common anti-patterns in ${bp.name}`,
        `Real-world implementation strategies and performance optimization`
      ],
      realLifeUsage: {
        whyNeeded: `${topicName} is a foundational requirement in modern ${bp.category.toLowerCase()} applications to write efficient, clean code.`,
        realWorldApplication: `Used by engineering teams at top tech companies to build high-concurrency, resilient, and maintainable software systems.`,
        skillImpact: `Adds critical professional expertise to your portfolio, preparing you for technical interviews and production project delivery.`
      },
      explanationTopic: `### ${topicName} in ${bp.name}\n\nIn this class, we dive deep into **${topicName}**. Understanding this topic is essential for mastering **${bp.name}**.\n\n#### Key Concepts:\n- **Core Definition**: ${topicName} provides essential tools for managing data, control flow, and system architecture.\n- **Why It Matters**: Without proper mastery of ${topicName}, applications can suffer from bugs, performance bottlenecks, or unmaintainable codebases.\n- **Best Practices**: Keep implementations modular, follow standard naming conventions, and thoroughly test edge cases.`,
      examples,
      practiceTask: `Implement a mini-module in ${bp.name} incorporating ${topicName}. Verify output correctness and handle edge cases gracefully.`,
      quizPlan: `Knowledge check containing 2 targeted questions on ${topicName} principles and real-world failure modes.`,
      quiz,
      homework: `Build a small repository feature demonstrating ${topicName}. Add inline comments explaining your architectural choices.`,
      projectConnection: `Connects directly to Module ${Math.ceil(num / 10)} capstone project by providing key underlying mechanics for ${topicName}.`
    };
  };

  // 1. Beginner Level (Classes 1 to 30) - 3 Modules
  const bgTopics = bp.keyTopics.beginner;
  for (let m = 0; m < 3; m++) {
    const startNum = m * 10 + 1;
    const endNum = startNum + 9;
    const modClasses: ClassItem[] = [];

    for (let c = startNum; c <= endNum; c++) {
      const topicIndex = (c - 1) % bgTopics.length;
      const topicName = `${bgTopics[topicIndex]} (Part ${(c - 1) % 3 + 1})`;
      modClasses.push(createClass(c, "Beginner", topicName, `Module ${m + 1}: Beginner Foundations`));
    }

    modules.push({
      id: `${bp.id}-mod-${m + 1}`,
      title: `Module ${m + 1}: Beginner Foundations (Part ${m + 1})`,
      level: "Beginner",
      description: `Classes ${startNum} - ${endNum}: Essential fundamentals, setup, syntax, and foundational concepts for ${bp.name}.`,
      classes: modClasses
    });
  }

  // 2. Intermediate Level (Classes 31 to 60) - 3 Modules
  const intTopics = bp.keyTopics.intermediate;
  for (let m = 3; m < 6; m++) {
    const startNum = m * 10 + 1;
    const endNum = startNum + 9;
    const modClasses: ClassItem[] = [];

    for (let c = startNum; c <= endNum; c++) {
      const topicIndex = (c - 31) % intTopics.length;
      const topicName = `${intTopics[topicIndex]} (Part ${(c - 31) % 3 + 1})`;
      modClasses.push(createClass(c, "Intermediate", topicName, `Module ${m + 1}: Intermediate Mastery`));
    }

    modules.push({
      id: `${bp.id}-mod-${m + 1}`,
      title: `Module ${m + 1}: Intermediate Application (Part ${m - 2})`,
      level: "Intermediate",
      description: `Classes ${startNum} - ${endNum}: Deepening architectural patterns, async workflows, and state design in ${bp.name}.`,
      classes: modClasses
    });
  }

  // 3. Advanced Level (Classes 61 to 90) - 3 Modules
  const advTopics = bp.keyTopics.advanced;
  for (let m = 6; m < 9; m++) {
    const startNum = m * 10 + 1;
    const endNum = startNum + 9;
    const modClasses: ClassItem[] = [];

    for (let c = startNum; c <= endNum; c++) {
      const topicIndex = (c - 61) % advTopics.length;
      const topicName = `${advTopics[topicIndex]} (Part ${(c - 61) % 3 + 1})`;
      modClasses.push(createClass(c, "Advanced", topicName, `Module ${m + 1}: Advanced Engineering`));
    }

    modules.push({
      id: `${bp.id}-mod-${m + 1}`,
      title: `Module ${m + 1}: Advanced Systems Engineering (Part ${m - 5})`,
      level: "Advanced",
      description: `Classes ${startNum} - ${endNum}: Performance tuning, low-level optimization, security, and enterprise integration.`,
      classes: modClasses
    });
  }

  // 4. Extra / Masterclass Level (Classes 91 to 100) - 1 Module
  const extraTopics = bp.keyTopics.extra;
  const extraClasses: ClassItem[] = [];
  for (let c = 91; c <= 100; c++) {
    const topicIndex = (c - 91) % extraTopics.length;
    const topicName = `${extraTopics[topicIndex]} (Specialization ${c - 90})`;
    extraClasses.push(createClass(c, "Extra", topicName, `Module 10: Specialization & Capstone`));
  }

  modules.push({
    id: `${bp.id}-mod-10`,
    title: `Module 10: Masterclass Specialization & Capstone`,
    level: "Extra",
    description: `Classes 91 - 100: Capstone project, industry secrets, real-world case studies, and career acceleration.`,
    classes: extraClasses
  });

  return {
    id: bp.id,
    name: bp.name,
    category: bp.category,
    courseGoal: bp.courseGoal,
    shortDescription: bp.shortDescription,
    fullDescription: bp.fullDescription,
    requiredLevel: bp.requiredLevel,
    targetStudentLevel: bp.requiredLevel,
    requiredSkills: [
      "Basic computer literacy & command line access",
      `Interest in mastering ${bp.category}`,
      "Problem-solving mindset and dedication to complete 100 classes"
    ],
    learningOutcomes: [
      `Build industry-ready production applications using ${bp.name}`,
      `Master problem-solving from basic syntax to advanced architecture`,
      `Complete hands-on practical exercises and capstone portfolio projects`,
      `Earn an official JOXIQ AI Learning Academy verified certificate`
    ],
    curriculumRoadmap: {
      beginnerGoals: bp.keyTopics.beginner,
      intermediateGoals: bp.keyTopics.intermediate,
      advancedGoals: bp.keyTopics.advanced,
      extraCareerGoals: bp.keyTopics.extra
    },
    icon: bp.icon,
    gradientColor: bp.gradientColor,
    rating: bp.rating,
    enrolledCount: bp.enrolledCount,
    estimatedHours: bp.estimatedHours,
    totalClasses: 100, // Exactly 100 classes per course
    modules
  };
}

// Generate realistic domain code examples per course
function generateDomainCodeSnippet(courseName: string, topicName: string, classNum: number): string {
  if (courseName.includes("Python")) {
    return `import sys
import asyncio

# Class ${classNum}: ${topicName}
class SystemProcessor:
    def __init__(self, name: str):
        self.name = name
        self.is_active = True

    async def execute(self, payload: dict) -> dict:
        print(f"[{self.name}] Processing {topicName}...")
        await asyncio.sleep(0.1)
        return {"status": "success", "processed_by": self.name}

# Usage
async def main():
    processor = SystemProcessor("JOXIQ-Engine")
    result = await processor.execute({"class_num": ${classNum}})
    print("Result:", result)

asyncio.run(main())`;
  }

  if (courseName.includes("JavaScript") || courseName.includes("TypeScript") || courseName.includes("React") || courseName.includes("Next")) {
    return `// Class ${classNum}: ${topicName}
interface ClassPayload<T> {
  id: string;
  classNum: number;
  data: T;
}

export async function handleTopicExecution<T>(payload: ClassPayload<T>): Promise<boolean> {
  console.log(\`Executing ${topicName} for Class \${payload.classNum}\`);
  try {
    // Domain processing logic
    return true;
  } catch (err) {
    console.error("Execution error:", err);
    return false;
  }
}`;
  }

  if (courseName.includes("AI") || courseName.includes("LLM") || courseName.includes("Machine Learning") || courseName.includes("Prompt")) {
    return `# Class ${classNum}: ${topicName} in AI Engineering
import numpy as np

def compute_similarity_score(vector_a: list, vector_b: list) -> float:
    a, b = np.array(vector_a), np.array(vector_b)
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    return float(dot_product / (norm_a * norm_b))

# Example embeddings
vec1 = [0.12, 0.85, 0.43, 0.91]
vec2 = [0.15, 0.82, 0.40, 0.95]
print("Semantic Cosine Similarity:", compute_similarity_score(vec1, vec2))`;
  }

  return `// Class ${classNum}: ${topicName}
// Production implementation structure for ${courseName}

public class Solution {
    public static void main(String[] args) {
        System.out.println("Mastering ${topicName} in ${courseName}");
        // Execute real-world practical exercise
    }
}`;
}
