import { CourseCategory } from "../types/learning";

export type ProgrammingLanguage =
  | "Python"
  | "JavaScript"
  | "TypeScript"
  | "Java"
  | "C++"
  | "C#"
  | "Kotlin"
  | "Swift"
  | "Dart"
  | "PHP"
  | "Go"
  | "Rust";

export interface LanguageMeta {
  id: ProgrammingLanguage;
  name: string;
  icon: string; // Lucide icon or emoji / badge
  color: string;
  extension: string;
  category: string;
  description: string;
  starterTemplate: string;
  syntaxHighlights: {
    title: string;
    description: string;
    snippet: string;
  }[];
}

export interface CodingExercise {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  courseId?: string;
  classNumber?: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  topic: string;
  description: string;
  learningObjective: string;
  starterCode: string;
  exampleSolution: string;
  hints: string[];
  lineByLineExplanation: { line: number; snippet: string; explanation: string }[];
  testCases: { input: string; expectedOutput: string; description: string }[];
}

export interface PracticeProject {
  id: string;
  title: string;
  type: "Mini Project" | "Final Project" | "Portfolio Project";
  language: ProgrammingLanguage;
  courseId?: string;
  description: string;
  specifications: string[];
  starterCode: string;
  sampleSolution: string;
  rubric: string[];
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    id: "Python",
    name: "Python 3",
    icon: "🐍",
    color: "from-blue-500 to-cyan-500",
    extension: ".py",
    category: "General & AI",
    description: "Clean, high-level language popular for AI, backend, data science, and scripting.",
    starterTemplate: `# Python 3 Learning Starter
def calculate_learning_streak(days_active: int, completed_tasks: int) -> dict:
    """Calculates student streak bonus points and level status."""
    total_score = (days_active * 10) + (completed_tasks * 25)
    
    if total_score >= 100:
        level = "Master Learner"
    elif total_score >= 50:
        level = "Intermediate Scholar"
    else:
        level = "Beginner Explorer"
        
    return {
        "score": total_score,
        "level": level,
        "bonus_multiplier": 1.5 if days_active > 7 else 1.0
    }

# Test the function
result = calculate_learning_streak(days_active=10, completed_tasks=5)
print(f"Student Level: {result['level']}")
print(f"Total XP Score: {result['score']}")
`,
    syntaxHighlights: [
      {
        title: "Variables & Functions",
        description: "Defines reusable logic with type hints.",
        snippet: "def greet(name: str) -> str:\n    return f'Hello, {name}!'"
      },
      {
        title: "List Comprehension",
        description: "Concise way to create lists.",
        snippet: "squares = [x**2 for x in range(10) if x % 2 == 0]"
      }
    ]
  },
  {
    id: "JavaScript",
    name: "JavaScript (ES6+)",
    icon: "🟨",
    color: "from-amber-400 to-yellow-500",
    extension: ".js",
    category: "Web & Node.js",
    description: "The core dynamic language powering browsers, Node.js servers, and web applications.",
    starterTemplate: `// JavaScript ES6+ Learning Starter
function analyzeStudentProgress(studentName, scores) {
  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  
  const status = average >= 80 ? "Passed with Honors" : "Good Progress";
  
  return {
    studentName,
    average: average.toFixed(1),
    status,
    totalModules: scores.length
  };
}

const report = analyzeStudentProgress("Rahim Ahmed", [85, 92, 78, 90]);
console.log("Student Name:", report.studentName);
console.log("Average Score:", report.average);
console.log("Status:", report.status);
`,
    syntaxHighlights: [
      {
        title: "Arrow Functions",
        description: "Modern concise function expression syntax.",
        snippet: "const add = (a, b) => a + b;"
      },
      {
        title: "Async / Await",
        description: "Handling asynchronous promises cleanly.",
        snippet: "async function fetchData() {\n  const res = await fetch(url);\n  return res.json();\n}"
      }
    ]
  },
  {
    id: "TypeScript",
    name: "TypeScript",
    icon: "🔷",
    color: "from-blue-600 to-indigo-600",
    extension: ".ts",
    category: "Web & Enterprise",
    description: "Typed superset of JavaScript providing static types, interfaces, and enterprise safety.",
    starterTemplate: `// TypeScript Enterprise Starter
interface CourseLesson {
  id: string;
  title: string;
  durationMins: number;
  isCompleted: boolean;
}

class LearningTracker<T extends CourseLesson> {
  private lessons: T[] = [];

  public addLesson(lesson: T): void {
    this.lessons.push(lesson);
  }

  public getCompletionPercentage(): number {
    if (this.lessons.length === 0) return 0;
    const completed = this.lessons.filter(l => l.isCompleted).length;
    return Math.round((completed / this.lessons.length) * 100);
  }
}

const tracker = new LearningTracker<CourseLesson>();
tracker.addLesson({ id: "1", title: "TypeScript Types", durationMins: 20, isCompleted: true });
tracker.addLesson({ id: "2", title: "Generics & Utility Types", durationMins: 25, isCompleted: false });

console.log(\`Course Completion: \${tracker.getCompletionPercentage()}%\`);
`,
    syntaxHighlights: [
      {
        title: "Interfaces & Types",
        description: "Shape object structures statically.",
        snippet: "interface User {\n  id: number;\n  name: string;\n  role: 'admin' | 'student';\n}"
      },
      {
        title: "Generics",
        description: "Reusable type-safe components.",
        snippet: "function identity<T>(arg: T): T {\n  return arg;\n}"
      }
    ]
  },
  {
    id: "Java",
    name: "Java 21",
    icon: "☕",
    color: "from-red-600 to-amber-700",
    extension: ".java",
    category: "Backend & Enterprise",
    description: "Strongly typed, object-oriented language for enterprise backends and Android systems.",
    starterTemplate: `// Java 21 Class Starter
import java.util.List;
import java.util.ArrayList;

public class StudentAcademy {
    public static class CourseProgress {
        private String courseName;
        private int completedClasses;

        public CourseProgress(String courseName, int completedClasses) {
            this.courseName = courseName;
            this.completedClasses = completedClasses;
        }

        public String getSummary() {
            return "Course: " + courseName + " | Completed: " + completedClasses + " classes";
        }
    }

    public static void main(String[] args) {
        CourseProgress progress = new CourseProgress("Java Enterprise Masterclass", 15);
        System.out.println(progress.getSummary());
    }
}
`,
    syntaxHighlights: [
      {
        title: "Classes & Objects",
        description: "Encapsulate data and behavior.",
        snippet: "public class Person {\n    private String name;\n    public Person(String name) { this.name = name; }\n}"
      }
    ]
  },
  {
    id: "C++",
    name: "C++ 20",
    icon: "⚡",
    color: "from-blue-700 to-slate-800",
    extension: ".cpp",
    category: "Systems & Gaming",
    description: "High-performance language used in OS kernels, game engines, compilers, and competitive coding.",
    starterTemplate: `// C++20 Learning Starter
#include <iostream>
#include <vector>
#include <string>
#include <numeric>

struct StudentGrade {
    std::string name;
    std::vector<int> scores;

    double calculateAverage() const {
        if (scores.empty()) return 0.0;
        double sum = std::accumulate(scores.begin(), scores.end(), 0.0);
        return sum / scores.size();
    }
};

int main() {
    StudentGrade student{"Sumiya Akter", {88, 94, 90, 85}};
    std::cout << "Student: " << student.name << std::endl;
    std::cout << "Average Score: " << student.calculateAverage() << std::endl;
    return 0;
}
`,
    syntaxHighlights: [
      {
        title: "Pointers & Memory",
        description: "Direct memory access and pointers.",
        snippet: "int val = 42;\nint* ptr = &val;\nstd::cout << *ptr;"
      }
    ]
  },
  {
    id: "C#",
    name: "C# .NET 8",
    icon: "💜",
    color: "from-purple-600 to-indigo-800",
    extension: ".cs",
    category: "Backend & Unity",
    description: "Modern component-oriented language powering .NET web APIs, microservices, and Unity games.",
    starterTemplate: `// C# .NET 8 Learning Starter
using System;
using System.Collections.Generic;
using System.Linq;

public class Program {
    public record CourseInfo(string Title, int DurationHours, bool IsActive);

    public static void Main() {
        var courses = new List<CourseInfo> {
            new("C# Web APIs", 25, true),
            new("Unity Game Dev", 30, true),
            new("Legacy Systems", 10, false)
        };

        var activeCourses = courses.Where(c => c.IsActive);
        foreach (var course in activeCourses) {
            Console.WriteLine($"Active Course: {course.Title} ({course.DurationHours} hours)");
        }
    }
}
`,
    syntaxHighlights: [
      {
        title: "LINQ Queries",
        description: "Language Integrated Query for collection manipulation.",
        snippet: "var evens = numbers.Where(n => n % 2 == 0).ToList();"
      }
    ]
  },
  {
    id: "Kotlin",
    name: "Kotlin",
    icon: "🟣",
    color: "from-purple-500 to-pink-600",
    extension: ".kt",
    category: "Android & Multiplatform",
    description: "Modern, concise language official for Android development and Kotlin Multiplatform.",
    starterTemplate: `// Kotlin Learning Starter
data class Student(val name: String, val score: Int, val isPro: Boolean)

fun calculateBonus(student: Student): Int {
    return when {
        student.score >= 90 && student.isPro -> 100
        student.score >= 75 -> 50
        else -> 10
    }
}

fun main() {
    val learner = Student("Tariqul Islam", 92, true)
    val bonusXP = calculateBonus(learner)
    println("\${learner.name} earned \${bonusXP} bonus XP!")
}
`,
    syntaxHighlights: [
      {
        title: "Null Safety",
        description: "Prevents NullPointerExceptions natively.",
        snippet: "val name: String? = null\nprintln(name?.length ?: 0)"
      }
    ]
  },
  {
    id: "Swift",
    name: "Swift 5.9",
    icon: "🍊",
    color: "from-orange-500 to-rose-600",
    extension: ".swift",
    category: "iOS & macOS",
    description: "Fast, modern, and safe language designed by Apple for iOS, iPadOS, macOS, and visionOS.",
    starterTemplate: `// Swift Learning Starter
import Foundation

struct CourseProgress {
    let title: String
    var completedClasses: Int
    let totalClasses: Int = 100

    var percentage: Double {
        return (Double(completedClasses) / Double(totalClasses)) * 100.0
    }
}

let myProgress = CourseProgress(title: "iOS App Development", completedClasses: 45)
print("Course: \\(myProgress.title)")
print("Progress: \\(String(format: "%.1f", myProgress.percentage))%")
`,
    syntaxHighlights: [
      {
        title: "Structs & Optionals",
        description: "Safe value types and optional binding.",
        snippet: "if let name = optionalName {\n    print(\"Hello \\(name)\")\n}"
      }
    ]
  },
  {
    id: "Dart",
    name: "Dart 3",
    icon: "🎯",
    color: "from-cyan-500 to-blue-600",
    extension: ".dart",
    category: "Flutter & Apps",
    description: "Client-optimized language for multi-platform apps built with Flutter.",
    starterTemplate: `// Dart 3 Learning Starter
class StudentBadge {
  final String title;
  final String category;

  StudentBadge({required this.title, required this.category});

  void display() {
    print('🏆 Badge Unlocked: $title ($category)');
  }
}

void main() {
  final badge = StudentBadge(title: 'Top Coder', category: 'Programming');
  badge.display();
}
`,
    syntaxHighlights: [
      {
        title: "Null Safety & Records",
        description: "Sound null safety and pattern matching.",
        snippet: "final (name, age) = ('Sadia', 22);\nprint('$name is $age');"
      }
    ]
  },
  {
    id: "PHP",
    name: "PHP 8.3",
    icon: "🐘",
    color: "from-indigo-500 to-purple-600",
    extension: ".php",
    category: "Web Backends & CMS",
    description: "Popular server-side scripting language powering WordPress, Laravel, and millions of web apps.",
    starterTemplate: `<?php
// PHP 8.3 Learning Starter
readonly class StudentReport {
    public function __construct(
        public string $studentName,
        public array $classScores
    ) {}

    public function getAverageScore(): float {
        if (empty($this->classScores)) return 0.0;
        return array_sum($this->classScores) / count($this->classScores);
    }
}

$report = new StudentReport("Farhana Yeasmin", [88, 92, 95]);
echo "Student: " . $report->studentName . "\n";
echo "Average Score: " . number_format($report->getAverageScore(), 2) . "%\n";
`,
    syntaxHighlights: [
      {
        title: "Constructor Promotion",
        description: "Clean class property definitions.",
        snippet: "public function __construct(public string $title) {}"
      }
    ]
  },
  {
    id: "Go",
    name: "Go (Golang)",
    icon: "🐹",
    color: "from-teal-500 to-cyan-600",
    extension: ".go",
    category: "Cloud & Microservices",
    description: "Simple, fast, concurrent language built by Google for microservices and cloud infrastructure.",
    starterTemplate: `// Go Learning Starter
package main

import (
	"fmt"
)

type Student struct {
	Name      string
	Completed int
	Total     int
}

func (s Student) CompletionRate() float64 {
	if s.Total == 0 {
		return 0
	}
	return (float64(s.Completed) / float64(s.Total)) * 100
}

func main() {
	s := Student{Name: "Tanvir Hossain", Completed: 28, Total: 100}
	fmt.Printf("Student: %s\\n", s.Name)
	fmt.Printf("Completion: %.1f%%\\n", s.CompletionRate())
}
`,
    syntaxHighlights: [
      {
        title: "Goroutines & Channels",
        description: "Lightweight concurrent thread handling.",
        snippet: "go func() {\n    fmt.Println(\"Running in parallel\")\n}()"
      }
    ]
  },
  {
    id: "Rust",
    name: "Rust 2021",
    icon: "🦀",
    color: "from-amber-600 to-orange-700",
    extension: ".rs",
    category: "Systems & Security",
    description: "Empowering everyone to build reliable, memory-safe, and efficient systems software without garbage collection.",
    starterTemplate: `// Rust Learning Starter
struct StudentProgress {
    name: String,
    completed_lessons: u32,
}

impl StudentProgress {
    fn new(name: &str, completed: u32) -> Self {
        Self {
            name: name.to_string(),
            completed_lessons: completed,
        }
    }

    fn calculate_xp(&self) -> u32 {
        self.completed_lessons * 50
    }
}

fn main() {
    let student = StudentProgress::new("Mahmud Hasan", 12);
    println!("Student: {}", student.name);
    println!("Total XP: {}", student.calculate_xp());
}
`,
    syntaxHighlights: [
      {
        title: "Ownership & Borrowing",
        description: "Memory safety guaranteed at compile time.",
        snippet: "let s1 = String::from(\"hello\");\nlet len = calculate_length(&s1);"
      }
    ]
  }
];

// Curated Exercises for Programming Languages
export const DEFAULT_CODING_EXERCISES: CodingExercise[] = [
  {
    id: "ex-py-1",
    title: "1. Sum of Evens & Odd Filtering",
    language: "Python",
    courseId: "py-course",
    classNumber: 1,
    difficulty: "Beginner",
    topic: "Control Flow & Loops",
    learningObjective: "Write a function that calculates the sum of all even numbers in a given list.",
    description: "Given a list of integers, compute the sum of all even numbers and return the count of odd numbers as a tuple `(sum_evens, count_odds)`.",
    starterCode: `def process_numbers(numbers: list[int]) -> tuple[int, int]:
    # Write your solution here
    sum_evens = 0
    count_odds = 0
    
    # Loop through numbers and check even/odd
    
    return (sum_evens, count_odds)

# Test your code
print(process_numbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
`,
    exampleSolution: `def process_numbers(numbers: list[int]) -> tuple[int, int]:
    sum_evens = sum(x for x in numbers if x % 2 == 0)
    count_odds = sum(1 for x in numbers if x % 2 != 0)
    return (sum_evens, count_odds)
`,
    hints: [
      "Use the modulo operator % to check if a number is even: `num % 2 == 0`.",
      "You can iterate using a `for num in numbers:` loop.",
      "Keep track of two variables: `sum_evens` and `count_odds`."
    ],
    lineByLineExplanation: [
      { line: 1, snippet: "def process_numbers(numbers: list[int]):", explanation: "Defines function process_numbers taking a list of integers." },
      { line: 2, snippet: "sum_evens = 0", explanation: "Initializes accumulator variable sum_evens to zero." },
      { line: 5, snippet: "if num % 2 == 0:", explanation: "Checks if number leaves remainder 0 when divided by 2 (even)." }
    ],
    testCases: [
      { input: "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]", expectedOutput: "(30, 5)", description: "Sum evens = 30, Count odds = 5" },
      { input: "[2, 4, 6]", expectedOutput: "(12, 0)", description: "All evens" }
    ]
  },
  {
    id: "ex-js-1",
    title: "2. Array Filtering & Map Transformation",
    language: "JavaScript",
    courseId: "js-course",
    classNumber: 1,
    difficulty: "Beginner",
    topic: "Functional Array Methods",
    learningObjective: "Transform and filter an array of student objects using modern JS methods.",
    description: "Write a function `getHonorStudents(students)` that takes an array of student objects `{ name, gpa }` and returns an array of names for students with GPA >= 3.5 in UPPERCASE.",
    starterCode: `function getHonorStudents(students) {
  // Your code here: filter students with gpa >= 3.5 and return uppercase names
  return students
    .filter(s => s.gpa >= 3.5)
    .map(s => s.name.toUpperCase());
}

// Test example
const sampleStudents = [
  { name: "Rahim", gpa: 3.8 },
  { name: "Karim", gpa: 3.2 },
  { name: "Sumiya", gpa: 3.9 }
];

console.log(getHonorStudents(sampleStudents));
`,
    exampleSolution: `function getHonorStudents(students) {
  return students
    .filter(student => student.gpa >= 3.5)
    .map(student => student.name.toUpperCase());
}
`,
    hints: [
      "Use `.filter()` to select students where `gpa >= 3.5`.",
      "Use `.map()` to convert each student object into `student.name.toUpperCase()`."
    ],
    lineByLineExplanation: [
      { line: 2, snippet: "students.filter(s => s.gpa >= 3.5)", explanation: "Filters array elements matching the GPA condition." },
      { line: 3, snippet: ".map(s => s.name.toUpperCase())", explanation: "Transforms each student into an uppercase string name." }
    ],
    testCases: [
      { input: "sampleStudents", expectedOutput: "['RAHIM', 'SUMIYA']", description: "Honor student names" }
    ]
  },
  {
    id: "ex-ts-1",
    title: "3. Generic Stack Implementation",
    language: "TypeScript",
    courseId: "ts-course",
    classNumber: 1,
    difficulty: "Intermediate",
    topic: "Generics & Data Structures",
    learningObjective: "Build a type-safe generic Stack class supporting push, pop, peek, and isEmpty.",
    description: "Implement a generic `Stack<T>` class with methods `push(item: T)`, `pop(): T | undefined`, `peek(): T | undefined`, and `size(): number`.",
    starterCode: `class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    // Implement push
  }

  pop(): T | undefined {
    // Implement pop
    return undefined;
  }

  peek(): T | undefined {
    // Implement peek
    return undefined;
  }

  size(): number {
    return this.items.length;
  }
}

// Test
const numStack = new Stack<number>();
numStack.push(10);
numStack.push(20);
console.log("Popped:", numStack.pop());
`,
    exampleSolution: `class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }
}
`,
    hints: [
      "Use internal array methods like `.push()` and `.pop()`.",
      "For `peek()`, access `this.items[this.items.length - 1]`."
    ],
    lineByLineExplanation: [
      { line: 1, snippet: "class Stack<T>", explanation: "Declares a generic class parameterized by type T." }
    ],
    testCases: [
      { input: "numStack.push(10); numStack.push(20); numStack.pop()", expectedOutput: "20", description: "LIFO order verification" }
    ]
  }
];

// Curated Projects across languages
export const SAMPLE_PRACTICE_PROJECTS: PracticeProject[] = [
  {
    id: "proj-1",
    title: "CLI Student Management System",
    type: "Mini Project",
    language: "Python",
    courseId: "py-course",
    description: "Build an interactive CLI tool in Python to manage student enrollments, calculate GPA, and export reports.",
    specifications: [
      "Define a `Student` class with attributes (id, name, enrolled_courses, grades).",
      "Implement methods to add course, record score, and calculate cumulative GPA.",
      "Support saving student data to a JSON file and loading on startup.",
      "Handle error cases gracefully (e.g. invalid score inputs)."
    ],
    starterCode: `import json

class Student:
    def __init__(self, student_id: str, name: str):
        self.student_id = student_id
        self.name = name
        self.grades = {} # course_name: score

    def add_grade(self, course: str, score: float):
        if 0 <= score <= 100:
            self.grades[course] = score

    def get_gpa(self) -> float:
        if not self.grades:
            return 0.0
        return sum(self.grades.values()) / len(self.grades)

# Add CLI loop logic here
`,
    sampleSolution: `# Complete CLI solution with JSON persistence...`,
    rubric: [
      "Clean Class OOP structure",
      "Robust Input Handling",
      "JSON File I/O persistence",
      "Clear Console Menu UI"
    ]
  },
  {
    id: "proj-2",
    title: "Full-Stack Task Manager API Engine",
    type: "Final Project",
    language: "TypeScript",
    courseId: "ts-course",
    description: "Build a robust, fully-typed Express REST API controller with request validation, JWT authentication types, and task filtering.",
    specifications: [
      "Define strict TypeScript interfaces for Task, User, and AuthTokens.",
      "Build CRUD routes: GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id.",
      "Implement middleware for type validation.",
      "Write unit test assertions for endpoint response schemas."
    ],
    starterCode: `// Express REST API Engine Starter
import express, { Request, Response } from "express";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const app = express();
app.use(express.json());

const tasks: Task[] = [];

app.get("/api/tasks", (req: Request, res: Response) => {
  res.json({ success: true, count: tasks.length, data: tasks });
});

// Add POST, PUT, DELETE routes
`,
    sampleSolution: `# Fully implemented Express TS API...`,
    rubric: [
      "Strict Type Definitions without `any`",
      "Restful Route Conventions",
      "Validation Middleware",
      "Error Handling Middleware"
    ]
  },
  {
    id: "proj-3",
    title: "Real-Time Chat & Multiplayer Messaging Protocol",
    type: "Portfolio Project",
    language: "Go",
    courseId: "go-course",
    description: "Build a high-concurrency WebSocket messaging room server in Go utilizing goroutines and channel broadcasting.",
    specifications: [
      "Create a Hub struct managing active client connections.",
      "Use Go channels for message broadcasting across concurrent clients.",
      "Include thread-safe mutex locking for state operations.",
      "Implement ping/pong heartbeat for connection keepalive."
    ],
    starterCode: `package main

import (
	"fmt"
	"sync"
)

type Client struct {
	ID   string
	Send chan string
}

type Hub struct {
	clients    map[string]*Client
	broadcast  chan string
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		broadcast:  make(chan string),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func main() {
	fmt.Println("Go WebSocket Chat Engine Initialized")
}
`,
    sampleSolution: `# Complete Go concurrent chat hub solution...`,
    rubric: [
      "Thread Safety & Mutex Usage",
      "Proper Channel Unbuffering",
      "Goroutine Lifecycle Management",
      "Clean Concurrency Design"
    ]
  }
];
