import { ProjectRequirement } from "../types/projectBuilder";

export const SAMPLE_BUILDER_PROJECTS: ProjectRequirement[] = [
  // 1. PROGRAMMING
  {
    id: "proj-prog-1",
    title: "Smart Task & Habit Automation Tool",
    category: "Programming",
    difficulty: "Beginner",
    courseId: "course-python-master",
    courseName: "Python Programming Masterclass",
    moduleId: "mod-1",
    moduleTitle: "Module 1: Fundamentals & Functions",
    connectedClassNumber: 5,
    description: "Build an automated Python task manager that reads daily to-dos, calculates priority scores, logs progress to text files, and sends summary reports.",
    skillsUsed: ["Python 3", "Data Structures", "File Handling", "CLI Logic", "Functions"],
    estimatedHours: 3,
    prerequisites: ["Basic variables & loops", "Functions and dictionaries"],
    deliverables: ["CLI app main.py", "Sample data storage tasks.json", "Automated summary generator"],
    starterCodeOrPlan: `# Smart Task & Habit Automation Tool
import json
import datetime

tasks = []

def add_task(title, priority, category):
    task = {
        "id": len(tasks) + 1,
        "title": title,
        "priority": priority, # High, Medium, Low
        "category": category,
        "created_at": str(datetime.date.today()),
        "completed": False
    }
    tasks.append(task)
    print(f"Task '{title}' added successfully!")

def generate_report():
    print("=== DAILY TASK REPORT ===")
    for t in tasks:
        status = "DONE" if t["completed"] else "PENDING"
        print(f"[{status}] {t['id']}. {t['title']} ({t['priority']} Priority)")

# TODO: Add function to save tasks to tasks.json and mark tasks as complete!
add_task("Review Python Functions", "High", "Learning")
generate_report()
`,
    testCases: [
      "Task creation adds valid dictionary to tasks list",
      "Priority calculation orders High priority items first",
      "JSON storage persists data across program runs"
    ],
    improvementPrompts: [
      "Add deadline reminders",
      "Implement streak counter for daily habit tracking",
      "Export summary as markdown file"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Choose Project",
        description: "Select Smart Task Automation Tool as your practical programming project.",
        tasks: ["Review project scope", "Verify required Python environment"]
      },
      {
        stepNumber: 2,
        title: "Understand Requirements",
        description: "Understand data structure for tasks, file storage, and priority scoring.",
        tasks: ["Define JSON schema", "Map out CLI menu commands"]
      },
      {
        stepNumber: 3,
        title: "Create Plan",
        description: "Structure modular functions for CRUD operations and report generation.",
        tasks: ["Write pseudocode for load/save logic", "Plan priority sorting algorithm"]
      },
      {
        stepNumber: 4,
        title: "Build Project Step by Step",
        description: "Implement function by function in the interactive code editor.",
        tasks: ["Build add_task() and list_tasks()", "Implement save_to_file() and load_from_file()"]
      },
      {
        stepNumber: 5,
        title: "Test Project",
        description: "Run simulator tests to confirm task creation, state updates, and file persistence.",
        tasks: ["Test adding 3 tasks with different priorities", "Verify completed status toggle"]
      },
      {
        stepNumber: 6,
        title: "Improve Project",
        description: "Ask AI Project Mentor for refactoring ideas, error handling, and performance boosts.",
        tasks: ["Add try-except file error handling", "Refactor print outputs with clean borders"]
      },
      {
        stepNumber: 7,
        title: "Complete & Add to Portfolio",
        description: "Finalize submission, receive AI mentor badge, and save project to portfolio.",
        tasks: ["Generate portfolio certificate entry", "Review final summary"]
      }
    ]
  },

  // 2. AI ENGINEERING
  {
    id: "proj-ai-1",
    title: "AI Personal Study & Course Assistant",
    category: "AI Engineering",
    difficulty: "Intermediate",
    courseId: "course-ai-eng",
    courseName: "AI Engineering & LLM Masterclass",
    moduleId: "mod-2",
    moduleTitle: "Module 2: Prompt Engineering & Gemini API",
    connectedClassNumber: 12,
    description: "Develop a custom AI Study Assistant using Gemini API that summarizes lecture notes, creates study flashcards, and quizzes students on course topics.",
    skillsUsed: ["Gemini API", "Prompt Engineering", "TypeScript", "JSON Schema", "AI Context Management"],
    estimatedHours: 4,
    prerequisites: ["API Key usage", "Async JavaScript/TypeScript", "JSON manipulation"],
    deliverables: ["AI Study Assistant Service", "Flashcard Generator Prompt", "Interactive Quiz Evaluator"],
    starterCodeOrPlan: `// AI Personal Study Assistant
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateStudyFlashcards(topic, lectureNotes) {
  const prompt = \`Act as an expert AI Study Tutor. 
Analyze these lecture notes on "\${topic}":
\${lectureNotes}

Generate 3 high-yield study flashcards in JSON format with "question", "answer", and "keyConcept".\`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text);
}

// TODO: Implement interactive quiz evaluator function!
`,
    testCases: [
      "Gemini returns valid structured JSON with questions and answers",
      "Flashcards capture main lecture concepts accurately",
      "Quiz evaluator gives constructive score feedback"
    ],
    improvementPrompts: [
      "Add difficulty levels (Easy, Medium, Hard) to flashcards",
      "Integrate spaced-repetition timer for active recall",
      "Support multi-language translation (English & Bangla)"
    ],
    steps: [
      { stepNumber: 1, title: "Choose Project", description: "Select AI Study Assistant project.", tasks: ["Review API requirements", "Check Gemini SDK setup"] },
      { stepNumber: 2, title: "Understand Requirements", description: "Map LLM prompt structure and JSON output specs.", tasks: ["Design flashcard schema", "Define system instructions"] },
      { stepNumber: 3, title: "Create Plan", description: "Design workflow: Lecture Input -> Gemini API -> Flashcard JSON -> Quiz UI.", tasks: ["Draft prompt template", "Plan error fallback"] },
      { stepNumber: 4, title: "Build Project Step by Step", description: "Code Gemini API integration and response parser.", tasks: ["Implement generateStudyFlashcards()", "Build quiz checker"] },
      { stepNumber: 5, title: "Test Project", description: "Test API call with sample course lecture text.", tasks: ["Verify JSON parsing", "Check response latency"] },
      { stepNumber: 6, title: "Improve Project", description: "Refine system prompt for higher accuracy and friendly tone.", tasks: ["Add temperature tuning", "Enhance feedback wording"] },
      { stepNumber: 7, title: "Complete & Add to Portfolio", description: "Save completed AI app project to student portfolio.", tasks: ["Claim AI Engineering badge", "Export project showcase"] }
    ]
  },

  // 3. WEB DEVELOPMENT
  {
    id: "proj-web-1",
    title: "Responsive Learning Dashboard & Portfolio",
    category: "Web Development",
    difficulty: "Intermediate",
    courseId: "course-fullstack-dev",
    courseName: "Full Stack Web Development (React & Node)",
    moduleId: "mod-3",
    moduleTitle: "Module 3: React State & UI Design",
    connectedClassNumber: 18,
    description: "Build a sleek responsive web dashboard featuring active course progress bars, dark mode toggle, recent assignments list, and interactive stats charts.",
    skillsUsed: ["React 18", "Tailwind CSS", "TypeScript", "Lucide Icons", "Responsive Design"],
    estimatedHours: 5,
    prerequisites: ["React Hooks (useState, useEffect)", "Tailwind utilities"],
    deliverables: ["Dashboard UI Component", "Filterable course list", "Stats summary cards"],
    starterCodeOrPlan: `// Responsive Learning Dashboard Component
import React, { useState } from 'react';

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  
  const courses = [
    { id: 1, title: "Python Programming", progress: 75, category: "Programming" },
    { id: 2, title: "AI Engineering", progress: 40, category: "AI Engineering" },
    { id: 3, title: "Full Stack Web", progress: 90, category: "Web Dev" }
  ];

  return (
    <div className="p-6 bg-slate-900 text-white rounded-3xl min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome back, Student!</h1>
      
      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c.id} className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <h3 className="font-bold">{c.title}</h3>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: \`\${c.progress}%\` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">{c.progress}% Completed</p>
          </div>
        ))}
      </div>
    </div>
  );
};
`,
    testCases: [
      "Dashboard renders smoothly on mobile, tablet, and desktop viewports",
      "Progress bar width accurately matches course state percentage",
      "Tabs switch active content without page reload"
    ],
    improvementPrompts: [
      "Add subtle entry animations using Framer Motion",
      "Integrate local storage persistence for user theme preference",
      "Add interactive search filter for course list"
    ],
    steps: [
      { stepNumber: 1, title: "Choose Project", description: "Select Responsive Learning Dashboard.", tasks: ["Set up React layout", "Define color palette"] },
      { stepNumber: 2, title: "Understand Requirements", description: "Determine responsive grid breakpoints and component hierarchy.", tasks: ["Design mobile vs desktop views", "List state variables"] },
      { stepNumber: 3, title: "Create Plan", description: "Break dashboard into Sidebar, Header, Stat Cards, and Main Grid.", tasks: ["Sketch UI wireframe", "Plan prop interfaces"] },
      { stepNumber: 4, title: "Build Project Step by Step", description: "Develop layout components and apply Tailwind styling.", tasks: ["Build stat cards", "Build course list component"] },
      { stepNumber: 5, title: "Test Project", description: "Verify layout responsiveness across screen sizes.", tasks: ["Test mobile navbar toggle", "Check contrast accessibility"] },
      { stepNumber: 6, title: "Improve Project", description: "Optimize spacing, shadows, and glassmorphism visual polish.", tasks: ["Refine border radii", "Polish active tab states"] },
      { stepNumber: 7, title: "Complete & Add to Portfolio", description: "Publish completed Web Dev project to student portfolio.", tasks: ["Generate showcase link", "Add to profile"] }
    ]
  },

  // 4. APP DEVELOPMENT
  {
    id: "proj-app-1",
    title: "Cross-Platform Habit & Focus Mobile App",
    category: "App Development",
    difficulty: "Advanced",
    courseId: "course-flutter-app",
    courseName: "Cross-Platform App Development (Flutter/React Native)",
    moduleId: "mod-4",
    moduleTitle: "Module 4: Mobile State Management & Local Storage",
    connectedClassNumber: 22,
    description: "Design and build a mobile app layout for habit tracking with focus pomodoro timer, streak badges, and local notification alerts.",
    skillsUsed: ["React Native / Mobile UI", "State Management", "AsyncStorage", "Timer Hooks", "Touch Feedback"],
    estimatedHours: 6,
    prerequisites: ["Mobile UI principles", "State management hooks", "Timers in JavaScript"],
    deliverables: ["Mobile Screen Layouts", "Pomodoro Focus Timer Logic", "Habit Streak Tracker"],
    starterCodeOrPlan: `// Mobile Focus & Habit Tracker Logic
import React, { useState, useEffect } from 'react';

export const MobileFocusApp = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min pomodoro
  const [isActive, setIsActive] = useState(false);
  const [streakCount, setStreakCount] = useState(5);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setStreakCount(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="max-w-sm mx-auto bg-slate-950 p-6 rounded-[3rem] border-4 border-slate-800 text-center shadow-2xl">
      <div className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-2">🔥 Streak: {streakCount} Days</div>
      <h2 className="text-xl font-extrabold text-white mb-6">Focus Session</h2>
      <div className="text-5xl font-mono font-black text-blue-400 my-8">{formatTime(timeLeft)}</div>
      <button 
        onClick={() => setIsActive(!isActive)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg"
      >
        {isActive ? "PAUSE" : "START FOCUS"}
      </button>
    </div>
  );
};
`,
    testCases: [
      "Timer counts down accurately second by second",
      "Pause and resume preserve exact remaining time",
      "Completing a session automatically increments streak counter"
    ],
    improvementPrompts: [
      "Add custom sound effect upon session completion",
      "Support customizable session lengths (15m, 25m, 45m)",
      "Add weekly habit completion chart"
    ],
    steps: [
      { stepNumber: 1, title: "Choose Project", description: "Select Habit & Focus Mobile App.", tasks: ["Review mobile wireframes", "Confirm screen specs"] },
      { stepNumber: 2, title: "Understand Requirements", description: "Map state for pomodoro timer, breaks, and streak records.", tasks: ["Define timer states", "Design touch targets"] },
      { stepNumber: 3, title: "Create Plan", description: "Plan component hierarchy: Timer, Habit List, Stats Widget.", tasks: ["Draft component tree", "Define prop types"] },
      { stepNumber: 4, title: "Build Project Step by Step", description: "Implement timer interval logic and mobile styling.", tasks: ["Code timer engine", "Build streak display"] },
      { stepNumber: 5, title: "Test Project", description: "Test start, pause, reset, and session completion triggers.", tasks: ["Test timer accuracy", "Check button feedback"] },
      { stepNumber: 6, title: "Improve Project", description: "Enhance mobile ergonomics, haptics, and dark mode UI.", tasks: ["Add progress ring", "Refine button animations"] },
      { stepNumber: 7, title: "Complete & Add to Portfolio", description: "Save finished Mobile App project to student portfolio.", tasks: ["Award Mobile Dev badge", "Record completion"] }
    ]
  },

  // 5. BUSINESS & E-COMMERCE
  {
    id: "proj-biz-1",
    title: "E-Commerce Business & Digital Marketing Plan",
    category: "Business",
    difficulty: "Beginner",
    courseId: "course-biz-mastery",
    courseName: "Digital Business & Entrepreneurship",
    moduleId: "mod-1",
    moduleTitle: "Module 1: Business Models & Value Proposition",
    connectedClassNumber: 8,
    description: "Create a complete e-commerce business model canvas, target audience persona, pricing matrix, and 90-day digital marketing campaign strategy.",
    skillsUsed: ["Business Model Canvas", "Market Research", "Financial Projection", "Digital Marketing", "Value Proposition"],
    estimatedHours: 4,
    prerequisites: ["Basic business concepts", "Target customer analysis"],
    deliverables: ["Business Plan Executive Summary", "Customer Persona Canvas", "90-Day Marketing Roadmap"],
    starterCodeOrPlan: `# E-Commerce Business & Marketing Strategy Blueprint

## 1. Executive Summary
- **Business Name**: EcoCraft Goods
- **Value Proposition**: Affordable, eco-friendly hand-crafted lifestyle items delivered directly to consumers.
- **Target Market**: Eco-conscious professionals aged 22-45 in urban centers.

## 2. Customer Persona
- **Name**: Sarah (Digital Nomad & Sustainability Enthusiast)
- **Pain Point**: Finds standard plastic goods wasteful; wants sustainable products that look modern and premium.
- **Preferred Channels**: Instagram, LinkedIn, Pinterest, Search Engine Ads.

## 3. Financial & Pricing Matrix
- Product Cost: $12
- Retail Price: $35
- Gross Margin: 65%
- Break-even Volume: 150 units/month

## 4. 90-Day Digital Marketing Campaign
- Month 1: Brand launch, influencer gifting, social teaser content
- Month 2: Targeted Facebook/Instagram ads, SEO blog publishing
- Month 3: Email newsletter automated funnel, customer review incentives
`,
    testCases: [
      "Value proposition clearly addresses customer pain points",
      "Financial calculations show realistic break-even volume",
      "Marketing timeline covers launch, acquisition, and retention phases"
    ],
    improvementPrompts: [
      "Add competitor SWOT analysis section",
      "Incorporate customer acquisition cost (CAC) vs lifetime value (LTV) estimates",
      "Draft sample email marketing welcome series template"
    ],
    steps: [
      { stepNumber: 1, title: "Choose Project", description: "Select E-Commerce Business & Marketing Plan.", tasks: ["Review project template", "Identify target industry"] },
      { stepNumber: 2, title: "Understand Requirements", description: "Analyze market segments, cost structures, and channel tactics.", tasks: ["Define core value prop", "Outline financial metrics"] },
      { stepNumber: 3, title: "Create Plan", description: "Outline sections: Summary, Persona, Financials, Marketing.", tasks: ["Structure document sections", "Draft key formulas"] },
      { stepNumber: 4, title: "Build Project Step by Step", description: "Fill in business details and marketing campaign milestones.", tasks: ["Write customer persona", "Draft 90-day roadmap"] },
      { stepNumber: 5, title: "Test Project", description: "Review business plan with AI Project Mentor for feasibility.", tasks: ["Validate profit margins", "Check marketing channels"] },
      { stepNumber: 6, title: "Improve Project", description: "Incorporate AI mentor suggestions to optimize growth metrics.", tasks: ["Add CAC projections", "Refine brand messaging"] },
      { stepNumber: 7, title: "Complete & Add to Portfolio", description: "Save completed Business Strategy project to student portfolio.", tasks: ["Claim Entrepreneurship badge", "Export PDF blueprint"] }
    ]
  }
];
