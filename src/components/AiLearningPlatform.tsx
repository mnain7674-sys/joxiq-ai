import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Code2,
  Terminal,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Play,
  RotateCcw,
  Check,
  Send,
  HelpCircle,
  Briefcase,
  Layers,
  Palette,
  TrendingUp,
  MessageSquare,
  Crown,
  X,
  Clock,
  Download,
  Search,
  BookMarked,
  FileCode,
  Laptop,
  CheckSquare,
  Shield,
  Star,
  ChevronDown,
  UserCheck,
  Loader2
} from "lucide-react";
import Markdown from "react-markdown";
import { CAREER_CARDS, ALL_COURSES, Course, CareerCard, Lesson } from "./coursesData";

interface AiLearningPlatformProps {
  theme: string;
  userProfile: { name: string; email: string } | null;
  isProUser: boolean;
  onOpenProModal: () => void;
}

export const ACADEMIES = [
  {
    id: "coding",
    title: "Coding Academy",
    description: "Master 25+ languages, algorithms, frontend frameworks, database designs, and machine learning models.",
    icon: Code2,
    color: "from-violet-600 to-indigo-600",
    badge: "100% Active Mentor",
    coursesCount: 25
  },
  {
    id: "ai",
    title: "AI & Neural Net Academy",
    description: "Deep dive into model architectures, weights, fine-tuning techniques, and intelligent agent structures.",
    icon: Sparkles,
    color: "from-purple-600 to-pink-600",
    badge: "Future Ready",
    coursesCount: 8,
    isLocked: true
  },
  {
    id: "business",
    title: "Business & Startup Academy",
    description: "Master startup metrics, pricing matrices, term sheets, unit economics, and executive pitch formats.",
    icon: Briefcase,
    color: "from-emerald-600 to-teal-600",
    badge: "SaaS & VC Track",
    coursesCount: 12,
    isLocked: true
  },
  {
    id: "design",
    title: "UI/UX Design Academy",
    description: "Craft pixel-perfect user interfaces, Figma systems, interactive micro-animations, and typographic structures.",
    icon: Palette,
    color: "from-amber-600 to-orange-600",
    badge: "Visual Craft",
    coursesCount: 10,
    isLocked: true
  }
];

export const AiLearningPlatform: React.FC<AiLearningPlatformProps> = ({
  theme,
  userProfile,
  isProUser,
  onOpenProModal
}) => {
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>("coding");
  const [activeTab, setActiveTab] = useState<"home" | "catalog" | "projects" | "certificates" | "progress">("home");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<{ courseId: string; level: "beginner" | "intermediate" | "advanced"; lesson: Lesson } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [selectedCareer, setSelectedCareer] = useState<CareerCard | null>(null);
  const [careerMessages, setCareerMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [careerChatInput, setCareerChatInput] = useState("");
  const [isCareerAiLoading, setIsCareerAiLoading] = useState(false);

  useEffect(() => {
    setCareerMessages([]);
    setCareerChatInput("");
  }, [selectedCareer]);

  const getMatchedCoursesForCareer = (career: CareerCard): Course[] => {
    const title = career.title.toLowerCase();
    let courseIds: string[] = [];

    if (title.includes("web developer")) {
      courseIds = ["html", "css", "javascript", "gitgithub"];
    } else if (title.includes("frontend developer")) {
      courseIds = ["html", "css", "javascript", "typescript", "react", "nextjs"];
    } else if (title.includes("backend developer")) {
      courseIds = ["javascript", "typescript", "nodejs", "expressjs", "sql", "mongodb"];
    } else if (title.includes("full stack developer") || title.includes("fullstack")) {
      courseIds = ["html", "css", "javascript", "typescript", "react", "nextjs", "nodejs", "expressjs", "sql", "mongodb", "gitgithub"];
    } else if (title.includes("mobile")) {
      courseIds = ["flutter", "dart", "swift", "kotlin", "javascript"];
    } else if (title.includes("ai engineer") || title.includes("artificial intelligence")) {
      courseIds = ["python", "aimachinelearning", "typescript", "nodejs"];
    } else if (title.includes("machine learning")) {
      courseIds = ["python", "aimachinelearning", "datastructuresalgorithms"];
    } else if (title.includes("data scientist") || title.includes("data science")) {
      courseIds = ["python", "sql", "aimachinelearning", "datastructuresalgorithms"];
    } else if (title.includes("game")) {
      courseIds = ["cpp", "csharp", "datastructuresalgorithms"];
    } else if (title.includes("software engineer")) {
      courseIds = ["java", "cpp", "python", "datastructuresalgorithms"];
    } else if (title.includes("cybersecurity")) {
      courseIds = ["python", "gitgithub", "datastructuresalgorithms"];
    } else if (title.includes("cloud")) {
      courseIds = ["gitgithub", "sql", "go", "rust"];
    } else if (title.includes("devops")) {
      courseIds = ["gitgithub", "go", "rust"];
    } else if (title.includes("automation")) {
      courseIds = ["python", "javascript", "gitgithub"];
    } else {
      const techList = career.technologies.map(t => t.toLowerCase());
      return ALL_COURSES.filter(course => {
        const courseName = course.name.toLowerCase();
        return techList.some(tech => courseName.includes(tech) || tech.includes(courseName));
      });
    }

    return courseIds
      .map(id => ALL_COURSES.find(c => c.id === id))
      .filter((c): c is Course => c !== undefined);
  };

  const handleSendCareerChat = async () => {
    if (!selectedCareer || !careerChatInput.trim()) return;
    const userMsg = careerChatInput.trim();
    setCareerChatInput("");

    const updated = [...careerMessages, { role: "user" as const, content: userMsg }];
    setCareerMessages(updated);
    setIsCareerAiLoading(true);

    try {
      const prompt = `You are an elite, highly experienced software engineering career coach and tech advisor.
Career Track: "${selectedCareer.title}"
Career Description: "${selectedCareer.description}"
Required Technologies: ${selectedCareer.technologies.join(", ")}
Average Industry Salary: ${selectedCareer.salary}
Current Market Demand: ${selectedCareer.demand}

The user's query: "${userMsg}"

YOUR GOALS:
1. Provide extremely high-detail, encouraging, and clear career advice.
2. Explain how to learn the courses on this path step-by-step to build a powerful portfolio.
3. Walk through actual industry expectations, interview questions, and tips for this specific role.
4. Keep the explanation engaging, friendly, and structured using clean markdown headers and lists.`;

      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, jsonMode: false })
      });
      const data = await res.json();
      const aiReply = data.result || "Keep studying and working on your projects! Let me know if you want tips on how to prepare for interviews.";

      setCareerMessages([...updated, { role: "assistant" as const, content: aiReply }]);
    } catch (err) {
      console.error(err);
      setCareerMessages([...updated, { role: "assistant" as const, content: "I encountered a processing anomaly. Please verify your connection or ask again!" }]);
    } finally {
      setIsCareerAiLoading(false);
    }
  };

  // Stepper state for sections inside active lesson
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [sectionQuizAnswer, setSectionQuizAnswer] = useState<number | null>(null);
  const [sectionQuizSubmitted, setSectionQuizSubmitted] = useState<boolean>(false);
  const [sectionQuizPassed, setSectionQuizPassed] = useState<boolean>(false);
  const [showFinalQuiz, setShowFinalQuiz] = useState<boolean>(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Lesson Completion Screen States
  const [showLessonCompletedScreen, setShowLessonCompletedScreen] = useState<boolean>(false);
  const [completedLessonSummary, setCompletedLessonSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

  // Playground state
  const [playgroundLang, setPlaygroundLang] = useState<"javascript" | "python" | "html">("javascript");
  const [playgroundCode, setPlaygroundCode] = useState<string>('// Welcome to your AI Coding Sandbox!\nconsole.log("Write, edit, and run your program code here.");\n\nfunction verifyMentorResult() {\n  let items = [1, 2, 3];\n  return items.map(n => n * 2);\n}\n\nconsole.log("Processed List:", verifyMentorResult());');
  const [playgroundOutput, setPlaygroundOutput] = useState<string>("Ready to run...");

  // Progress Metrics in state and synced with localStorage
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem("joxiq_completed_lessons");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("joxiq_streak");
    return saved ? parseInt(saved, 10) : 5; // Default starter streak
  });

  const [codingTime, setCodingTime] = useState<number>(() => {
    const saved = localStorage.getItem("joxiq_coding_time");
    return saved ? parseInt(saved, 10) : 180; // Default minutes
  });

  const [completedProjects, setCompletedProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("joxiq_completed_projects");
    return saved ? JSON.parse(saved) : [];
  });

  const [resumeLessonInfo, setResumeLessonInfo] = useState<{ courseId: string; lessonId: string; title: string } | null>(() => {
    const saved = localStorage.getItem("joxiq_resume_lesson");
    return saved ? JSON.parse(saved) : null;
  });

  // Dedicated Learning Chat messages (stored per lessonId in state, loaded from local storage for persistency)
  const [lessonChats, setLessonChats] = useState<{ [lessonId: string]: { role: "user" | "assistant"; content: string }[] }>(() => {
    const saved = localStorage.getItem("joxiq_lesson_chats");
    return saved ? JSON.parse(saved) : {};
  });

  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync lesson chats and achievements to local storage
  useEffect(() => {
    localStorage.setItem("joxiq_lesson_chats", JSON.stringify(lessonChats));
  }, [lessonChats]);

  // Sync completed projects
  useEffect(() => {
    localStorage.setItem("joxiq_completed_projects", JSON.stringify(completedProjects));
  }, [completedProjects]);

  // Generate dynamic custom section-by-section breakdown of a lesson to simulate 3 detailed stages + final quiz
  const getLessonSections = (lesson: Lesson) => {
    return [
      {
        title: `1. Core Philosophy of ${lesson.title.replace(/Lesson \d+ - /, "")}`,
        content: `${lesson.content} In professional software architecture, understanding the theoretical 'why' behind this concept allows engineers to construct reliable systems and prevent systemic integration bugs.`,
        proTip: `Always use descriptive, self-documenting naming rules when declaring variables or structures associated with ${lesson.title.replace(/Lesson \d+ - /, "")}. Avoid single-letter variables except in simple index loops.`,
        realWorldScenario: `Major SaaS applications rely heavily on this. For example, Netflix utilizes this pattern in their video catalog ingest layer to ensure stable data formatting before encoding operations run.`,
        sectionQuiz: {
          question: `What represents the main architectural benefit of mastering ${lesson.title.replace(/Lesson \d+ - /, "")}?`,
          options: [
            "It eliminates the need to compile any code or set up secure server ports",
            "It creates highly reusable, predictable structures that improve codebase hygiene",
            "It turns basic local computers into heavy GPU rendering units automatically",
            "It forces databases to drop relational constraints and run without schemas"
          ],
          answer: 1,
          explanation: "Mastering these foundations builds predictable, scalable structures that prevent system bugs as software grows."
        }
      },
      {
        title: "2. Real-World Execution Flow & Best Practices",
        content: "Let's explore how engineers write and evaluate these statements in development workspaces. Best practices dictate dividing long files into small, highly cohesive modules that can be written, analyzed, and unit-tested in parallel across global development groups.",
        proTip: "Never hardcode secret keys or API credentials inside your code blocks! Always store them in secure environmental variables like `.env` and load them on startup.",
        realWorldScenario: "During high-traffic shopping cycles (like Black Friday), robust modularity and clear error logging prevent standard payment routers from crashing completely.",
        sectionQuiz: {
          question: "What is a major danger of hardcoding keys or configurations inside raw source code files?",
          options: [
            "It slows down file reading speed inside high-performance CPU architectures",
            "It exposes private keys, secrets, and credentials directly to open repositories, posing severe security risks",
            "It causes standard visual layout frameworks to distort across mobile screens",
            "It requires developers to re-install their primary operating systems"
          ],
          answer: 1,
          explanation: "Hardcoding secrets inside your repository is a critical security vulnerability, as anyone with code access can exploit those credentials."
        }
      },
      {
        title: "3. Common Design Pitfalls & Memory Management",
        content: "Even principal programmers encounter design failures when dealing with resource handles, open database pipelines, or async scopes. Defensive coding structures require setting up fallback channels, closing idle connections immediately, and utilizing strict sanitization on incoming user parameters.",
        proTip: "Before optimizing for performance, prioritize absolute clarity and readability. Premature optimization is the root of many software bugs.",
        realWorldScenario: "Enterprise database drivers configure automatic timeout limits. If a query hangs, the pool releases that socket cleanly rather than starving incoming requests.",
        sectionQuiz: {
          question: "How does defensive coding handle potential application runtime failures?",
          options: [
            "By letting the application crash immediately so users can reboot their hardware",
            "By preemptively catching, sanitizing, and gracefully handling exceptions using structured fallbacks",
            "By writing code that executes without any memory consumption in RAM",
            "By ignoring error outputs completely and letting systems run uninterrupted"
          ],
          answer: 1,
          explanation: "Defensive coding integrates try-catch blocks and checks that shield applications from unexpected conditions, allowing graceful recoveries."
        }
      }
    ];
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
  };

  const handleSelectLesson = (courseId: string, level: "beginner" | "intermediate" | "advanced", lesson: Lesson, isLocked: boolean) => {
    if (isLocked) {
      onOpenProModal();
      return;
    }
    setSelectedLesson({ courseId, level, lesson });
    setCurrentSectionIndex(0);
    setSectionQuizAnswer(null);
    setSectionQuizSubmitted(false);
    setSectionQuizPassed(false);
    setShowFinalQuiz(false);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);

    // Track for Resume Learning feature
    const resumeInfo = { courseId, lessonId: lesson.id, title: lesson.title };
    setResumeLessonInfo(resumeInfo);
    localStorage.setItem("joxiq_resume_lesson", JSON.stringify(resumeInfo));
  };

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const isAlreadyDone = prev.includes(lessonId);
      const updated = isAlreadyDone ? prev : [...prev, lessonId];
      localStorage.setItem("joxiq_completed_lessons", JSON.stringify(updated));
      
      // Award extra simulated coding time upon lesson mastery!
      if (!isAlreadyDone) {
        const nextTime = codingTime + 15;
        setCodingTime(nextTime);
        localStorage.setItem("joxiq_coding_time", nextTime.toString());
      }
      return updated;
    });
  };

  const handleLessonFinalize = async (lessonId: string) => {
    toggleLessonComplete(lessonId);
    setShowLessonCompletedScreen(true);
    setIsGeneratingSummary(true);
    setCompletedLessonSummary("");

    try {
      const promptText = `You are an expert computer science teacher. 
Please write an encouraging, concise 3-sentence summary in **Bangla (Bengali)** with clean, beginner-friendly language, outlining the core programming concepts the student has successfully mastered in the lesson "${selectedLesson?.lesson.title}" of the course "${selectedCourse?.name}". 
Use English terms in brackets for programming jargon (e.g., ভেরিয়েবল [Variables]). Do not include preambles, output the bullet points directly.`;

      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, jsonMode: false })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) {
          setCompletedLessonSummary(data.result);
        } else {
          setCompletedLessonSummary(`অসাধারণ কাজ! আপনি সফলভাবে "${selectedLesson?.lesson.title}" লেসনটি সম্পন্ন করেছেন। আপনি এই পাঠের মূল কোডিং নিয়মাবলী এবং বাস্তব জীবনের প্রোগ্রামিং কৌশলসমূহ আয়ত্ত করেছেন।`);
        }
      } else {
        setCompletedLessonSummary(`অসাধারণ কাজ! আপনি সফলভাবে "${selectedLesson?.lesson.title}" লেসনটি সম্পন্ন করেছেন। আপনি এই পাঠের মূল কোডিং নিয়মাবলী এবং বাস্তব জীবনের প্রোগ্রামিং কৌশলসমূহ আয়ত্ত করেছেন।`);
      }
    } catch {
      setCompletedLessonSummary(`অসাধারণ কাজ! আপনি সফলভাবে "${selectedLesson?.lesson.title}" লেসনটি সম্পন্ন করেছেন। আপনি এই পাঠের মূল কোডিং নিয়মাবলী এবং বাস্তব জীবনের প্রোগ্রামিং কৌশলসমূহ আয়ত্ত করেছেন।`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleRunPlaygroundCode = () => {
    setPlaygroundOutput("Compiling and executing code...");
    setTimeout(() => {
      try {
        if (playgroundLang === "javascript") {
          let logs: string[] = [];
          const originalLog = console.log;
          console.log = (...args: any[]) => {
            logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "));
          };
          try {
            const res = new Function(playgroundCode)();
            if (res !== undefined) logs.push(`Returned: ${String(res)}`);
          } catch (e: any) {
            logs.push(`Runtime Error: ${e.message}`);
          } finally {
            console.log = originalLog;
          }
          setPlaygroundOutput(logs.join("\n") || "Executed successfully with no logged outputs.");
        } else if (playgroundLang === "python") {
          // Simulate Python compiler output beautifully based on the written string
          if (playgroundCode.includes("print")) {
            const regex = /print\s*\(\s*["'](.*?)["']\s*\)/g;
            let match;
            let logs: string[] = [];
            while ((match = regex.exec(playgroundCode)) !== null) {
              logs.push(match[1]);
            }
            if (logs.length > 0) {
              setPlaygroundOutput("[Simulated Python 3.11 Compiler]\n" + logs.join("\n"));
            } else {
              setPlaygroundOutput("[Simulated Python 3.11 Compiler]\nScript executed successfully. Exit code: 0");
            }
          } else {
            setPlaygroundOutput("[Simulated Python 3.11 Compiler]\nCompiled 1 module successfully.\nNo printed stdout detected.");
          }
        } else if (playgroundLang === "html") {
          setPlaygroundOutput("[Live Browser Preview Mounted]\nRendered visual template successfully in standard HTML view container.");
        }
      } catch (err: any) {
        setPlaygroundOutput(`Compilation Error: ${err.message}`);
      }
    }, 450);
  };

  const handleResetLessonCode = () => {
    if (playgroundLang === "javascript") {
      setPlaygroundCode('// Welcome to your AI Coding Sandbox!\nconsole.log("Write, edit, and run your program code here.");\n\nfunction verifyMentorResult() {\n  let items = [1, 2, 3];\n  return items.map(n => n * 2);\n}\n\nconsole.log("Processed List:", verifyMentorResult());');
    } else if (playgroundLang === "python") {
      setPlaygroundCode('# Python 3 Mentor Environment\n\ndef calculate_streak_multiplier(streak_days):\n    return streak_days * 1.25\n\ncurrent_streak = 5\nprint(f"Bonus: {calculate_streak_multiplier(current_streak)}")\n');
    } else {
      setPlaygroundCode('<!-- HTML/CSS Visual Canvas -->\n<div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; padding: 24px; border-radius: 16px; text-align: center; font-family: sans-serif; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3)">\n  <h1 style="margin: 0 0 12px 0; font-size: 24px">Personal AI Mentor Active</h1>\n  <p style="margin: 0; opacity: 0.9">Interactive Sandbox Output Canvas</p>\n</div>');
    }
    setPlaygroundOutput("Sandbox code reset successfully.");
  };

  // Dedicated AI Lesson Socratic Tutor Chat System
  const handleSendLessonChat = async () => {
    if (!chatInput.trim() || !selectedLesson) return;
    const lessonId = selectedLesson.lesson.id;
    const userMsg = chatInput.trim();
    setChatInput("");

    const activeChats = lessonChats[lessonId] || [
      {
        role: "assistant",
        content: `Greetings! I am your Socratic AI Programming Instructor for **${selectedLesson.lesson.title}**.
        
I am here to help you master this concept. I explain topics step-by-step, dissect syntax line-by-line, walk through code structures, and review challenges. Ask me any question, or ask for a practice problem to solve!`
      }
    ];

    const updated = [...activeChats, { role: "user" as const, content: userMsg }];
    setLessonChats(prev => ({ ...prev, [lessonId]: updated }));
    setIsAiLoading(true);

    try {
      const activeSections = getLessonSections(selectedLesson.lesson);
      const activeSec = activeSections[currentSectionIndex];
      const sectionContext = activeSec
        ? `The user is on Section "${activeSec.title}". The current theoretical course contents: "${activeSec.content}". Pro-tip is: "${activeSec.proTip}". Real-world application scenario: "${activeSec.realWorldScenario}".`
        : "";

      // Instruct Gemini to behave as an elite socratic coding teacher following strict pedagogical rules
      const prompt = `You are an elite, highly experienced software engineering teacher and computer science mentor.
Current Course: "${selectedCourse?.name || "Software Engineering"}"
Current Lesson: "${selectedLesson.lesson.title}"
${sectionContext}

The user's query/message: "${userMsg}"

CRITICAL PEDAGOGICAL TEACHING RULES:
1. Never start a lesson or introduce a new topic with examples.
2. Always begin by explaining the core concept first in simple, beginner-friendly language.
3. Before giving any example, make sure the learner fully understands:
   - What the topic is.
   - Why it exists.
   - Why it is important.
   - Where it is used.
   - When it is used.
   - How it works.
4. Explain everything using simple, beginner-friendly language. Never assume the learner already knows anything.
5. After the learner understands the concept, gradually introduce examples.
6. Start with exactly one very simple example. Explain that example step by step and line by line with absolute clarity.
7. Only after the learner understands the first example, introduce more examples with increasing difficulty. Never overload the learner with many examples at once.
8. Always focus on understanding before memorization.
9. Continuously evaluate the learner's understanding through thoughtful questions and interactive checkpoints. If understanding is weak, STOP moving forward and spend more time explaining the concepts in different ways instead of rushing to complete the syllabus.
10. Never give information just to finish a lesson. Teach until the learner genuinely and deeply understands. The learner's success is far more important than completing the syllabus.
11. If the learner seems confused or makes a mistake, stop introducing new content. Instead:
    - Explain the concept again in different words.
    - Use a clear analogy or a real-life situation.
    - Ask if the learner understands before continuing.
12. This must feel like a real interactive classroom taught by an excellent, patient teacher. Never rush to finish lessons. The goal is to ensure the learner truly understands the topic.
13. Only after the learner demonstrates understanding or successfully solves a challenge should you proceed to the next section or topic.
14. Ask guided questions or give coding exercises, and invite them to write code in the interactive playground below.
15. If they write code, review their answers carefully and explain WHY mistakes happen. Keep formatting professional with clear markdown headers, bold keywords, and clean bullet lists.`;

      let finalPrompt = prompt;
      if (completedLessons.includes(lessonId)) {
        finalPrompt += `\n\nCRITICAL FOLLOW-UP DIRECTIVE: The user has successfully completed this lesson ("${selectedLesson.lesson.title}"). They have selected the "Ask More Questions About This Lesson" option to continue exploring this topic. You MUST answer unlimited follow-up questions related ONLY to the scope of this lesson. Be extremely encouraging, professional, and patient. At the end of EVERY answer, you MUST politely ask exactly: "Do you have any other questions about this lesson, or would you like to continue to the next lesson?"`;
      }

      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, jsonMode: false })
      });
      const data = await res.json();
      const aiReply = data.result || "Keep coding! Let me know if you need another example or code drill.";

      setLessonChats(prev => ({
        ...prev,
        [lessonId]: [...updated, { role: "assistant" as const, content: aiReply }]
      }));
    } catch (err) {
      console.error(err);
      setLessonChats(prev => ({
        ...prev,
        [lessonId]: [...updated, { role: "assistant" as const, content: "I encountered a processing anomaly. Please verify your connection or ask again!" }]
      }));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStartProject = (title: string) => {
    // Save to completed or active projects
    if (!completedProjects.includes(title)) {
      const updated = [...completedProjects, title];
      setCompletedProjects(updated);
      localStorage.setItem("joxiq_completed_projects", JSON.stringify(updated));
    }
    alert(`🎉 Interactive guide initialized for: ${title}!\nYour Personal AI Mentor is ready to evaluate your architectural layout and review your code block-by-block. Ask questions inside the lesson chat!`);
  };

  // Filter courses by category and search queries
  const filteredCourses = ALL_COURSES.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Progress Percentages
  const totalCodingLessons = ALL_COURSES.reduce((acc, c) => acc + c.beginnerLessons.length + c.intermediateLessons.length + c.advancedLessons.length, 0);
  const totalCompletedLessons = completedLessons.length;
  const codingAcademyProgress = totalCodingLessons > 0 ? Math.round((totalCompletedLessons / totalCodingLessons) * 100) : 0;

  // Render Category Badges dynamically
  const categories = ["All", "Languages", "Frontend", "Backend", "Databases", "Mobile", "DevOps", "Computer Science"];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-y-auto pb-12">
      {/* Academy Premium Top Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950/70 via-indigo-950/60 to-slate-900 border-b border-violet-800/20 px-6 py-8 md:px-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Premium AI Learning Platform
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Socratic Coding Mentor Active
              </span>
              {isProUser && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-amber-400" /> PRO PLAN
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Learn Programming with Your AI Mentor
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Step-by-step masterclasses, quizzes, integrated terminal environments, and custom portfolio projects. Unlock your software engineering credentials.
            </p>
          </div>

          {/* Navigation Control Hub */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl self-stretch lg:self-auto justify-center">
            <button
              onClick={() => { setActiveTab("home"); setSelectedCourse(null); setSelectedLesson(null); setSelectedCareer(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "home" && !selectedCourse && !selectedCareer ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
            >
              Academies
            </button>
            <button
              onClick={() => { setActiveTab("catalog"); setSelectedCourse(null); setSelectedLesson(null); setSelectedCareer(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "catalog" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
            >
              25 Courses
            </button>
            <button
              onClick={() => { setActiveTab("projects"); setSelectedCourse(null); setSelectedLesson(null); setSelectedCareer(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "projects" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
            >
              Portfolio Projects
            </button>
            <button
              onClick={() => { setActiveTab("certificates"); setSelectedCourse(null); setSelectedLesson(null); setSelectedCareer(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "certificates" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
            >
              Certificates
            </button>
            <button
              onClick={() => { setActiveTab("progress"); setSelectedCourse(null); setSelectedLesson(null); setSelectedCareer(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "progress" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
            >
              Progress Tracker
            </button>
          </div>
        </div>
      </div>

      {/* Main View Grid Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 mt-8 space-y-8">
        
        {/* VIEW 1: ACTIVE STEP-BY-STEP LESSON VIEW */}
        {selectedLesson ? (() => {
          const activeSections = getLessonSections(selectedLesson.lesson);
          const activeSec = activeSections[currentSectionIndex];
          const lessonId = selectedLesson.lesson.id;

          if (showLessonCompletedScreen) {
            const allCourseLessons = selectedCourse
              ? [
                  ...selectedCourse.beginnerLessons.map(l => ({ ...l, level: "beginner" as const })),
                  ...selectedCourse.intermediateLessons.map(l => ({ ...l, level: "intermediate" as const })),
                  ...selectedCourse.advancedLessons.map(l => ({ ...l, level: "advanced" as const }))
                ]
              : [];
            const currentLessonIdx = allCourseLessons.findIndex(l => l.id === selectedLesson.lesson.id);
            const nextLesson = currentLessonIdx !== -1 && currentLessonIdx < allCourseLessons.length - 1
              ? allCourseLessons[currentLessonIdx + 1]
              : null;

            const completedInCourse = allCourseLessons.filter(l => completedLessons.includes(l.id)).length;
            const totalInCourse = allCourseLessons.length;
            const progressPercent = totalInCourse > 0 ? Math.round((completedInCourse / totalInCourse) * 100) : 0;

            return (
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn text-center mx-auto my-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl animate-bounce">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">Congratulations!</h2>
                    <p className="text-xs md:text-sm font-semibold text-emerald-400">
                      You have successfully completed Lesson {currentLessonIdx + 1}: {selectedLesson.lesson.title.replace(/Lesson \d+ - /, "")}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-left space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What You Have Learned (লেসন সারসংক্ষেপ)</h3>
                  {isGeneratingSummary ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                      <span>Tutor is writing a bilingual concept summary...</span>
                    </div>
                  ) : (
                    <div className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line prose prose-invert max-w-none font-medium animate-fadeIn">
                      {completedLessonSummary || "অসাধারণ কাজ! আপনি এই লেসনের সকল কোডিং কনসেপ্ট ও অনুশীলন সফলভাবে শেষ করেছেন।"}
                    </div>
                  )}
                </div>

                {/* Progress Tracker */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-semibold">Overall Course Progress</span>
                    <span className="font-extrabold text-white">{completedInCourse} / {totalInCourse} Lessons ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (nextLesson) {
                        const isLocked = nextLesson.level !== "beginner" && !isProUser;
                        handleSelectLesson(selectedCourse.id, nextLesson.level, nextLesson, isLocked);
                      } else {
                        setSelectedLesson(null);
                      }
                      setShowLessonCompletedScreen(false);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm py-3.5 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Play className="w-4 h-4 fill-current animate-pulse" />
                    <span>{nextLesson ? `Continue to Lesson ${currentLessonIdx + 2}` : "Syllabus Completed!"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowLessonCompletedScreen(false);
                    }}
                    className="w-full font-bold text-xs md:text-sm py-3.5 px-5 rounded-xl transition-all border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Ask More Questions About This Lesson</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {/* Lesson Nav Back Bar */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-950/40 px-3.5 py-2 rounded-xl border border-violet-800/30 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Course Syllabus
                </button>
                
                {/* Horizontal Stepper Progress */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                  {activeSections.map((sec, idx) => {
                    const isCompleted = idx < currentSectionIndex;
                    const isActive = idx === currentSectionIndex;
                    return (
                      <React.Fragment key={idx}>
                        <button
                          onClick={() => {
                            setCurrentSectionIndex(idx);
                            setSectionQuizAnswer(null);
                            setSectionQuizSubmitted(false);
                            setSectionQuizPassed(idx < currentSectionIndex);
                            setShowFinalQuiz(false);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all shrink-0 border ${
                            isActive && !showFinalQuiz
                              ? "bg-violet-600 text-white shadow-lg border-violet-500"
                              : isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-950 text-slate-500 border-slate-800/80"
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>Section {idx + 1}</span>
                        </button>
                        {idx < activeSections.length - 1 && (
                          <div className={`h-0.5 w-4 shrink-0 ${idx < currentSectionIndex ? "bg-emerald-500/50" : "bg-slate-800"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                  <div className="h-0.5 w-4 bg-slate-800 shrink-0" />
                  <button
                    disabled={currentSectionIndex < activeSections.length - 1 || (!sectionQuizPassed && currentSectionIndex === activeSections.length - 1)}
                    onClick={() => setShowFinalQuiz(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all shrink-0 border ${
                      showFinalQuiz
                        ? "bg-violet-600 text-white shadow-lg border-violet-500"
                        : "bg-slate-950 text-slate-500 border-slate-800/80 disabled:opacity-50"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Final Quiz</span>
                  </button>
                </div>
              </div>

              {/* Two Column Layout: Material + Playground on Left, AI Mentor Chat on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Course content reading and code playground */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {!showFinalQuiz ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Section {currentSectionIndex + 1} of {activeSections.length}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-violet-400" /> 10 mins reading</span>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold text-white">{activeSec.title}</h2>
                        <div className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                          {activeSec.content}
                        </div>
                      </div>

                      {/* Professional Mentorship Pro-Tip */}
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>Professional Mentorship Pro-Tip:</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {activeSec.proTip}
                        </p>
                      </div>

                      {/* Real-World Use Case Scenario */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          <span>Real-World Scenario & Impact:</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {activeSec.realWorldScenario}
                        </p>
                      </div>

                      {/* Section Understanding Quiz */}
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <HelpCircle className="w-4.5 h-4.5 text-violet-400" /> Concept Checkpoint
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">Q{currentSectionIndex + 1}</span>
                        </div>
                        
                        <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                          {activeSec.sectionQuiz.question}
                        </p>

                        <div className="space-y-2.5 pt-2">
                          {activeSec.sectionQuiz.options.map((opt, idx) => {
                            const isSelected = sectionQuizAnswer === idx;
                            const isCorrect = idx === activeSec.sectionQuiz.answer;
                            const showResult = sectionQuizSubmitted || sectionQuizPassed;

                            return (
                              <button
                                key={idx}
                                disabled={sectionQuizPassed}
                                onClick={() => { setSectionQuizAnswer(idx); setSectionQuizSubmitted(false); }}
                                className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                                  showResult
                                    ? isCorrect
                                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                      : isSelected
                                      ? "bg-rose-500/10 border-rose-500 text-rose-300"
                                      : "bg-slate-900 border-slate-850 text-slate-500"
                                    : isSelected
                                    ? "bg-violet-600/15 border-violet-500 text-white"
                                    : "bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                                }`}
                              >
                                <span>{opt}</span>
                                {showResult && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {!sectionQuizPassed && !sectionQuizSubmitted ? (
                          <button
                            onClick={() => {
                              setSectionQuizSubmitted(true);
                              if (sectionQuizAnswer === activeSec.sectionQuiz.answer) {
                                setSectionQuizPassed(true);
                              }
                            }}
                            disabled={sectionQuizAnswer === null}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
                          >
                            Verify Understanding
                          </button>
                        ) : sectionQuizPassed ? (
                          <div className="space-y-4 pt-2">
                            <div className="text-xs font-semibold p-4 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              🎉 **Correct!** {activeSec.sectionQuiz.explanation}
                            </div>
                            
                            {currentSectionIndex < activeSections.length - 1 ? (
                              <button
                                onClick={() => {
                                  setCurrentSectionIndex(prev => prev + 1);
                                  setSectionQuizAnswer(null);
                                  setSectionQuizSubmitted(false);
                                  setSectionQuizPassed(false);
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                Unlock & Proceed to Section {currentSectionIndex + 2} <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowFinalQuiz(true)}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                Go to Final Mastery Evaluation <Award className="w-4 h-4 text-amber-400" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            <div className="text-xs font-semibold p-4 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30">
                              ❌ Not quite right. Review the sections above, check with your AI Socratic Tutor, and try again!
                            </div>
                            <button
                              onClick={() => {
                                setSectionQuizAnswer(null);
                                setSectionQuizSubmitted(false);
                              }}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                            >
                              Try Quiz Again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* THE FINAL EXAM/MASTERY CARD FOR LESSON COMPLETE */
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
                      <div className="text-center space-y-3 py-6">
                        <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-300 mx-auto">
                          <Award className="w-9 h-9 text-yellow-400 animate-bounce" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-extrabold text-white">Lesson Mastery Evaluation</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Verify your absolute understanding of **{selectedLesson.lesson.title.replace(/Lesson \d+ - /, "")}** to complete the module and log your developer points.
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4">
                        <h4 className="text-xs font-extrabold text-violet-400 uppercase tracking-widest">Final Mastery Query</h4>
                        <p className="text-sm font-semibold text-slate-200">{selectedLesson.lesson.quiz.question}</p>

                        <div className="space-y-2 pt-2">
                          {selectedLesson.lesson.quiz.options.map((opt, idx) => {
                            const isSelected = selectedQuizAnswer === idx;
                            const isCorrect = idx === selectedLesson.lesson.quiz.answer;
                            const showResult = quizSubmitted;

                            return (
                              <button
                                key={idx}
                                onClick={() => { setSelectedQuizAnswer(idx); setQuizSubmitted(false); }}
                                className={`w-full text-left px-4 py-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                                  showResult
                                    ? isCorrect
                                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                      : isSelected
                                      ? "bg-rose-500/10 border-rose-500 text-rose-300"
                                      : "bg-slate-900 border-slate-850 text-slate-500"
                                    : isSelected
                                    ? "bg-violet-600/15 border-violet-500 text-white"
                                    : "bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850"
                                }`}
                              >
                                <span>{opt}</span>
                                {showResult && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {!quizSubmitted ? (
                          <button
                            onClick={() => setQuizSubmitted(true)}
                            disabled={selectedQuizAnswer === null}
                            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg cursor-pointer"
                          >
                            Submit Final Answer
                          </button>
                        ) : (
                          <div className="space-y-4 pt-2">
                            {selectedQuizAnswer === selectedLesson.lesson.quiz.answer ? (
                              <div className="space-y-4">
                                <div className="text-xs font-semibold p-4 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                  🎉 **Exceptional Work!** You have passed the Lesson Mastery Check successfully! This module is marked complete.
                                </div>
                                <button
                                  onClick={() => {
                                    handleLessonFinalize(lessonId);
                                  }}
                                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" /> Finalize Lesson & Show Completion Progress
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-xs font-semibold p-4 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30">
                                  ❌ That answer wasn't correct. Review your notes, seek clarification from your socratic tutor, and retry!
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedQuizAnswer(null);
                                    setQuizSubmitted(false);
                                  }}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                                >
                                  Retry Evaluation
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* INTEGRATED CODING PLAYGROUND */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Terminal className="w-5 h-5 text-violet-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Interactive Socratic Playground</h3>
                          <p className="text-[10px] text-slate-400">Run sandbox tests without breaking production</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <select
                          value={playgroundLang}
                          onChange={(e) => setPlaygroundLang(e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-violet-500"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML Canvas</option>
                        </select>
                        <button
                          onClick={handleRunPlaygroundCode}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" /> Compile & Run
                        </button>
                        <button
                          onClick={handleResetLessonCode}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg cursor-pointer"
                          title="Reset Code Template"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={playgroundCode}
                      onChange={(e) => setPlaygroundCode(e.target.value)}
                      rows={7}
                      className="w-full bg-slate-950 font-mono text-xs text-violet-200 p-4 rounded-2xl border border-slate-800/80 focus:border-violet-500 outline-none resize-none"
                      placeholder="Write your dynamic program statements here..."
                    />

                    {/* Output Screen */}
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 font-mono text-xs space-y-2">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Terminal Shell Logs</div>
                      <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{playgroundOutput}</pre>
                      
                      {playgroundLang === "html" && playgroundCode.trim() !== "" && (
                        <div className="mt-3 border-t border-slate-800 pt-3 space-y-2">
                          <div className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Iframe Real-Time Preview</div>
                          <div className="bg-white rounded-xl p-3 h-28 overflow-auto border border-slate-200">
                            <div dangerouslySetInnerHTML={{ __html: playgroundCode }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Side: Persistent Lesson Chat Box with AI Teacher */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[740px] sticky top-6">
                    <div className="flex items-center gap-3 pb-3.5 border-b border-slate-800">
                      <div className="w-10 h-10 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">Socratic Coding Mentor</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lesson 1-on-1 Session</span>
                        </div>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                      {(lessonChats[lessonId] || [
                        {
                          role: "assistant",
                          content: `Greetings! I am your Socratic AI Programming Instructor for **${selectedLesson.lesson.title}**.
                          
I am here to help you master this concept. I explain topics step-by-step, dissect syntax line-by-line, walk through code structures, and review challenges. Ask me any question, or ask for a practice problem to solve!`
                        }
                      ]).map((msg, idx) => (
                        <div key={idx} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          {msg.role === "assistant" && (
                            <div className="w-7 h-7 rounded-lg bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs shadow-md shadow-violet-600/10">
                              AI
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10 rounded-tr-none font-medium"
                              : "bg-slate-950 text-slate-200 border border-slate-850 rounded-tl-none prose prose-invert max-w-none"
                          }`}>
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        </div>
                      ))}
                      
                      {isAiLoading && (
                        <div className="flex gap-2.5 justify-start">
                          <div className="w-7 h-7 rounded-lg bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                            AI
                          </div>
                          <div className="bg-slate-950 border border-slate-850 px-4 py-3 rounded-2xl rounded-tl-none animate-pulse text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
                            <span>AI Instructor is structuring explanation...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Footer Input */}
                    <div className="pt-3 border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendLessonChat()}
                        placeholder="Ask mentor to review code, explain line-by-line, etc..."
                        className="flex-1 bg-slate-950 border border-slate-805 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-500 transition-colors"
                      />
                      <button
                        onClick={handleSendLessonChat}
                        disabled={isAiLoading || !chatInput.trim()}
                        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/10"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })() : selectedCourse ? (
          /* VIEW 2: SYLLABUS / COURSE DETAIL VIEW */
          <div className="space-y-8">
            <button
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-950/40 px-3.5 py-2 rounded-xl border border-violet-800/30 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to {selectedCareer ? `${selectedCareer.title} Roadmap` : "Academies"}
            </button>

            {/* Course Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="text-4xl md:text-5xl bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                  {selectedCourse.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {selectedCourse.category} Curriculum
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5">{selectedCourse.name} Masterclass</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">{selectedCourse.description}</p>
                </div>
              </div>
            </div>

            {/* Beginner, Intermediate, Advanced Levels Layout */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Beginner Levels */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Beginner Syllabus</h3>
                      <p className="text-[10px] text-slate-400">Core foundations and syntax basics (First 3 Free)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 self-start sm:self-auto">
                    Lessons 1-3 Free
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCourse.beginnerLessons.map((lesson, idx) => {
                    const isLocked = idx >= 3 && !isProUser;
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleSelectLesson(selectedCourse.id, "beginner", lesson, isLocked)}
                        className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isLocked 
                            ? "bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100" 
                            : "bg-slate-950 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">{lesson.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{lesson.content}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Lock className="w-3 h-3" /> PRO
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Intermediate Levels */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-base font-bold text-white">Intermediate Curriculum</h3>
                      <p className="text-[10px] text-slate-400">Object oriented models, imports, exception blocks, and robust parameters</p>
                    </div>
                  </div>
                  {!isProUser && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1 self-start sm:self-auto">
                      <Crown className="w-3.5 h-3.5 text-amber-400" /> Subscription Required
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCourse.intermediateLessons.map((lesson, idx) => {
                    const isLocked = !isProUser;
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleSelectLesson(selectedCourse.id, "intermediate", lesson, isLocked)}
                        className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isLocked 
                            ? "bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100" 
                            : "bg-slate-950 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            {isDone ? <Check className="w-4 h-4" /> : idx + 7}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">{lesson.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{lesson.content}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Lock className="w-3 h-3" /> PRO
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Levels */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                    <div>
                      <h3 className="text-base font-bold text-white">Advanced Professional Track</h3>
                      <p className="text-[10px] text-slate-400">Decorators, generators, asynchronous models, custom APIs, and interview preparation</p>
                    </div>
                  </div>
                  {!isProUser && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1 self-start sm:self-auto">
                      <Crown className="w-3.5 h-3.5 text-amber-400" /> Subscription Required
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCourse.advancedLessons.map((lesson, idx) => {
                    const isLocked = !isProUser;
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleSelectLesson(selectedCourse.id, "advanced", lesson, isLocked)}
                        className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isLocked 
                            ? "bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100" 
                            : "bg-slate-950 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            {isDone ? <Check className="w-4 h-4" /> : idx + 11}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">{lesson.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{lesson.content}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Lock className="w-3 h-3" /> PRO
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ) : selectedCareer ? (
          /* VIEW 2.5: CAREER ROADMAP DETAIL VIEW */
          <div className="space-y-8 animate-fadeIn" id="career-roadmap-view">
            <button
              onClick={() => setSelectedCareer(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-950/40 px-3.5 py-2 rounded-xl border border-violet-800/30 transition-colors cursor-pointer"
              id="back-to-careers-btn"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Career Paths
            </button>

            {/* Career Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" id="career-overview-card">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-2xl animate-pulse" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="text-4xl md:text-5xl bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center shrink-0 w-20 h-20">
                  <span className="leading-none">{selectedCareer.icon}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {selectedCareer.demand} Demand • Average Salary: {selectedCareer.salary}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5">{selectedCareer.title} Career Roadmap</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">{selectedCareer.description}</p>
                </div>
              </div>
            </div>

            {/* Curated Syllabus Classes */}
            <div className="space-y-4" id="curated-classes-section">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-violet-400" /> Curated Syllabus Classes ({getMatchedCoursesForCareer(selectedCareer).length})
                </h3>
                <p className="text-xs text-slate-400">Master these progressive classes sequentially. Click on any class to start learning with the AI Mentor!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getMatchedCoursesForCareer(selectedCareer).map((course, idx) => {
                  const beginners = course.beginnerLessons.map(l => l.id);
                  const intermediates = course.intermediateLessons.map(l => l.id);
                  const advanceds = course.advancedLessons.map(l => l.id);
                  const allLessonIds = [...beginners, ...intermediates, ...advanceds];
                  const completedInCourse = allLessonIds.filter(id => completedLessons.includes(id)).length;
                  const progressPct = allLessonIds.length > 0 ? Math.round((completedInCourse / allLessonIds.length) * 100) : 0;

                  return (
                    <div
                      key={course.id}
                      id={`career-course-card-${course.id}`}
                      onClick={() => handleSelectCourse(course)}
                      className="bg-slate-950/80 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/40 rounded-2xl p-5 transition-all cursor-pointer flex items-start gap-4 relative group"
                    >
                      <div className="text-3xl bg-slate-900 p-3 rounded-xl border border-slate-850 group-hover:bg-slate-950 transition-colors flex items-center justify-center shrink-0 w-14 h-14">
                        <span className="leading-none">{course.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-extrabold text-violet-400 uppercase tracking-wider">Step {idx + 1}</span>
                          {completedInCourse > 0 && (
                            <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {progressPct}% Mastery
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors mt-1">
                          {course.name} Masterclass
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal mt-1 line-clamp-2">
                          {course.description}
                        </p>
                        
                        {completedInCourse > 0 && (
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-850 mt-3">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 self-center transition-all group-hover:translate-x-1" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Career Mentor Coach Q&A Section */}
            <div className="bg-gradient-to-br from-[#100c2a] via-[#090b1e] to-slate-950 border border-violet-800/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden" id="ai-career-coach-section">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-extrabold flex items-center justify-center text-sm shadow-lg shadow-violet-600/20">
                    AI
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Socratic Career Path Guide</h3>
                    <p className="text-[10px] text-slate-400">Ask your AI Career Coach anything about how to study this path and excel in the industry.</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl h-48 overflow-y-auto space-y-4 text-xs scrollbar-thin" id="career-coach-chat-history">
                  {careerMessages.length === 0 ? (
                    <div className="text-slate-500 italic text-center pt-12">
                      "I am your dedicated AI Coach for the {selectedCareer.title} career track. Ask me about the learning structure, market demands, or how to tackle these classes, and I will explain comprehensively!"
                    </div>
                  ) : (
                    careerMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && (
                          <div className="w-6 h-6 rounded-lg bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                            AI
                          </div>
                        )}
                        <div className={`px-3.5 py-2.5 rounded-2xl max-w-md ${
                          msg.role === 'user' 
                            ? 'bg-violet-600 text-white rounded-tr-none' 
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
                        }`}>
                          <div className="markdown-body text-[11px]">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isCareerAiLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-6 h-6 rounded-lg bg-violet-600 text-white font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                        AI
                      </div>
                      <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none animate-pulse text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-violet-500 animate-bounce" />
                        <span className="w-1 h-1 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
                        <span>AI Coach is compiling career advice...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={careerChatInput}
                    id="career-chat-input-field"
                    onChange={(e) => setCareerChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCareerChat()}
                    placeholder={`Ask about starting salary, which class to learn first, interview prep for ${selectedCareer.title}...`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-500 transition-colors"
                  />
                  <button
                    onClick={handleSendCareerChat}
                    id="career-chat-send-btn"
                    disabled={isCareerAiLoading || !careerChatInput.trim()}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-violet-600/10 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "home" ? (
          /* VIEW 3: MAIN ACADEMIES HUB & CODING DASHBOARD */
          <div className="space-y-10">
            {/* Academies Row */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Select Academic Discipline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACADEMIES.map((ac) => {
                  const IconComp = ac.icon;
                  const isSelected = selectedAcademyId === ac.id;
                  return (
                    <div
                      key={ac.id}
                      onClick={() => {
                        if (ac.isLocked) {
                          alert(`AI ${ac.title} is being structured by generative teachers right now. Choose "Coding Academy" for the live interactive curriculum!`);
                          return;
                        }
                        setSelectedAcademyId(ac.id);
                      }}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-40 shadow-lg ${
                        isSelected
                          ? "bg-gradient-to-br from-[#120f26] to-[#15123a] border-violet-500 shadow-violet-500/5 ring-1 ring-violet-500/30"
                          : ac.isLocked
                          ? "bg-slate-900/40 border-slate-900 opacity-60"
                          : "bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-slate-200 border border-slate-850`}>
                            <IconComp className="w-4.5 h-4.5 text-violet-400" />
                          </div>
                          {ac.isLocked ? (
                            <span className="text-[8px] uppercase tracking-wider bg-slate-950 text-slate-500 px-2 py-0.5 rounded-full border border-slate-800">Soon</span>
                          ) : (
                            <span className="text-[8px] uppercase tracking-widest font-extrabold bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">{ac.badge}</span>
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold text-white mt-3.5">{ac.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-normal">{ac.description}</p>
                      </div>
                      
                      <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-2">
                        <span>{ac.coursesCount} Courses</span>
                        {!ac.isLocked && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CODING ACADEMY SPECIFIC SUB-DASHBOARD (The requested first academy) */}
            {selectedAcademyId === "coding" && (
              <div className="space-y-10 animate-fadeIn">
                
                {/* Visual Premium Coding Hero */}
                <div className="relative bg-gradient-to-br from-[#100c2a] via-[#090b1e] to-slate-950 border border-violet-800/15 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl -z-10" />
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 max-w-xl">
                      <span className="px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Become a Professional Programmer with Your Personal AI Mentor
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                        Double Your Developer Speed & Pass Senior Interviews
                      </h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Master the structural syntax of 25 languages. Solve interactive checkpoints, get line-by-line code reviews from our Socratic mentor, and compile programs inside your dashboard.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setActiveTab("catalog")}
                          className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
                        >
                          Browse 25 Syllabus Paths
                        </button>
                        {resumeLessonInfo && (
                          <button
                            onClick={() => {
                              const crs = ALL_COURSES.find(c => c.id === resumeLessonInfo.courseId);
                              if (crs) {
                                const level = "beginner"; // resolve correctly
                                const allLsn = [...crs.beginnerLessons, ...crs.intermediateLessons, ...crs.advancedLessons];
                                const lsn = allLsn.find(l => l.id === resumeLessonInfo.lessonId);
                                if (lsn) {
                                  setSelectedCourse(crs);
                                  setSelectedLesson({ courseId: crs.id, level: "beginner", lesson: lsn });
                                }
                              }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <BookMarked className="w-3.5 h-3.5 text-violet-400" /> Resume: {resumeLessonInfo.title.replace(/Lesson \d+ - /, "")}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Simple dynamic stats block */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-850 max-w-sm w-full">
                      <div className="text-center p-3 border-r border-b border-slate-800">
                        <div className="text-xl font-black text-violet-400">{totalCompletedLessons}</div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Lessons Done</p>
                      </div>
                      <div className="text-center p-3 border-b border-slate-800">
                        <div className="text-xl font-black text-emerald-400">{streak} Days</div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Learning Streak</p>
                      </div>
                      <div className="text-center p-3 border-r border-slate-800">
                        <div className="text-xl font-black text-amber-400">{codingTime}m</div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Coding Duration</p>
                      </div>
                      <div className="text-center p-3">
                        <div className="text-xl font-black text-indigo-400">{completedProjects.length}</div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">SaaS Projects</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CAREER CARDS GRID - What users can become after learning coding */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Briefcase className="w-4.5 h-4.5 text-violet-400" /> 14 Custom Coding Career Paths
                    </h3>
                    <p className="text-xs text-slate-400">Discover what software engineering role you can achieve and the specific tools you need to master.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {CAREER_CARDS.map((career) => (
                      <div
                        key={career.title}
                        id={`career-card-${career.title.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => {
                          setSelectedCareer(career);
                          setSelectedCourse(null);
                          setSelectedLesson(null);
                        }}
                        className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-violet-500/50 hover:bg-slate-900/90 hover:scale-[1.01] transition-all duration-300 shadow-md flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl bg-slate-950 p-2.5 rounded-xl border border-slate-850 group-hover:scale-110 transition-transform">{career.icon}</span>
                            <span className="text-[9px] uppercase tracking-widest font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md">
                              Salary: {career.salary}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-3.5 group-hover:text-violet-300 transition-colors">{career.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{career.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {career.technologies.map(t => (
                              <span key={t} className="text-[8px] font-extrabold bg-slate-950 text-slate-300 border border-slate-850 px-2 py-0.5 rounded-md">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-800/80 pt-3 mt-4 flex items-center justify-between text-[9px] font-bold">
                          <span className="text-slate-500 uppercase tracking-wider">Demand: <span className="text-emerald-400 font-extrabold">{career.demand}</span></span>
                          <span className="text-violet-400 group-hover:text-violet-300 flex items-center gap-0.5 transition-colors">
                            Enter Classes <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POPULAR SYLLABUS SAMPLER */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-white">Popular Course Masterclasses</h3>
                      <p className="text-xs text-slate-400">Begin with high-demand technologies, master functional paradigms, and build portfolios.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("catalog")}
                      className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      See All 25 Courses
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ALL_COURSES.slice(0, 6).map((course) => (
                      <div
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/40 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col justify-between shadow-lg group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl bg-slate-950 p-2.5 rounded-xl border border-slate-850">{course.icon}</span>
                            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-md border border-violet-500/20">
                              {course.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{course.name}</h4>
                          <p className="text-[10px] text-slate-400 leading-normal mt-1 line-clamp-2">{course.description}</p>
                        </div>
                        
                        <div className="border-t border-slate-800/80 pt-3 mt-5 flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-500">14 Full Syllabus Lessons</span>
                          <span className="text-violet-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                            Open Path <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : activeTab === "catalog" ? (
          /* VIEW 4: THE ALL 25 PROGRAMMING LANGUAGES CATALOG */
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Full Developer Catalog (25 Independent Paths)</h2>
              <p className="text-xs text-slate-400 mt-1">Browse, search, and jump into any course. Each course features isolated beginner, intermediate, and advanced curricula.</p>
            </div>

            {/* Catalog Filter Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 border border-slate-850 p-4 rounded-2xl shadow-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programming languages, frameworks, databases, Git..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-violet-500 placeholder:text-slate-500 transition-colors"
                />
              </div>

              {/* Responsive Category Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none max-w-full md:max-w-md lg:max-w-xl">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-violet-600 text-white shadow-lg"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Master Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                // Calculate individual course progress dynamically
                const beginners = course.beginnerLessons.map(l => l.id);
                const intermediates = course.intermediateLessons.map(l => l.id);
                const advanceds = course.advancedLessons.map(l => l.id);
                const allLessonIds = [...beginners, ...intermediates, ...advanceds];
                const completedInCourse = allLessonIds.filter(id => completedLessons.includes(id)).length;
                const progressPct = allLessonIds.length > 0 ? Math.round((completedInCourse / allLessonIds.length) * 100) : 0;

                return (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col justify-between shadow-lg group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl -z-10" />
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl bg-slate-950 p-2.5 rounded-xl border border-slate-850 shadow-inner">{course.icon}</span>
                        <span className="text-[9px] uppercase font-extrabold tracking-widest bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-md border border-violet-500/20">
                          {course.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{course.name} Masterclass</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="mt-5 space-y-3 pt-3 border-t border-slate-850">
                      {/* Dynamic visual progress line */}
                      {completedInCourse > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>Mastery Progress</span>
                            <span className="text-emerald-400">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">{allLessonIds.length} Socratic Lessons</span>
                        <span className="text-violet-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          Open Curriculum <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "projects" ? (
          /* VIEW 5: PORTFOLIO GUIDED PRACTICAL PROJECTS */
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Production Portfolio Capstones</h2>
              <p className="text-xs text-slate-400 mt-1">Unlock practical guided software challenges. Build complete code setups and receive evaluative grading from your Socratic AI Instructor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Interactive Calculator",
                  academy: "Coding Academy",
                  difficulty: "Beginner",
                  desc: "Assemble a responsive local parsing calculator. Handles decimal points, complex math inputs, backspaces, and zero bounds checks.",
                  guideline: ["Write robust parser structures", "Configure input state limits", "Prevent standard divide-by-zero crashes"]
                },
                {
                  title: "Real-Time Weather Monitor",
                  academy: "Coding Academy",
                  difficulty: "Intermediate",
                  desc: "Integrate asynchronous RESTful weather queries. Handles fetch states, dynamic graphics, and search-query delay filters.",
                  guideline: ["Utilize asynchronous promises cleanly", "Configure custom weather state classes", "Store local city searches in storage"]
                },
                {
                  title: "Verifiable Enterprise Dashboard",
                  academy: "Coding Academy",
                  difficulty: "Advanced",
                  desc: "Construct a complex enterprise dashboard featuring multi-user charts, paginated records, custom filters, and robust state updates.",
                  guideline: ["Integrate charting engines like Recharts", "Configure advanced pagination states", "Implement sorting actions on arrays"]
                },
                {
                  title: "Prompt Pipeline Generator",
                  academy: "AI Neural Net",
                  difficulty: "Intermediate",
                  desc: "Orchestrate structural prompts, multi-persona loops, and fine-tune response payloads using system variables.",
                  guideline: ["Write multi-persona system roles", "Sanitize user parameters strictly", "Configure vector search index references"]
                }
              ].map((proj) => {
                const isDone = completedProjects.includes(proj.title);
                return (
                  <div key={proj.title} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative">
                    {isDone && (
                      <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase tracking-widest font-extrabold border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Project Active
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-md">{proj.academy}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-md ${
                          proj.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          proj.difficulty === "Intermediate" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        }`}>{proj.difficulty}</span>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-white mt-3">{proj.title}</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">{proj.desc}</p>
                      
                      <div className="mt-4 pt-3.5 border-t border-slate-850 space-y-2">
                        <div className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500">Core Guidance Checklist</div>
                        <ul className="space-y-1.5">
                          {proj.guideline.map((g, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[10px] text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartProject(proj.title)}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/10 cursor-pointer mt-4"
                    >
                      Initialize Project Workspace
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "certificates" ? (
          /* VIEW 6: EARNED CERTIFICATE VERIFICATIONS */
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Verifiable Academy Credentials</h2>
              <p className="text-xs text-slate-400 mt-1">Awarded upon milestone mastery achievements. Print and verify your professional status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Beginner Certificate", level: "beginner", requiredCount: 3, icon: "📜", description: "Successfully mastered basic syntax commands, installation checks, variable allocations, and logical loops." },
                { title: "Intermediate Certificate", level: "intermediate", requiredCount: 7, icon: "🎖️", description: "Successfully mastered class-based objects, modular separation models, file system streams, and try-catch defenses." },
                { title: "Professional Certificate", level: "advanced", requiredCount: 14, icon: "👑", description: "Successfully mastered memory-efficient generators, asynchronous operations, REST JSON APIs, and complex algorithm structures." }
              ].map((cert) => {
                const totalCompleted = completedLessons.length;
                const isEligible = totalCompleted >= cert.requiredCount;

                return (
                  <div
                    key={cert.title}
                    className={`bg-gradient-to-br from-slate-900 via-[#0b0f24] to-slate-950 border rounded-3xl p-6 shadow-xl flex flex-col justify-between text-center relative ${
                      isEligible ? "border-amber-500/30" : "border-slate-800/80 opacity-70"
                    }`}
                  >
                    {isEligible && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] uppercase tracking-widest font-black px-3.5 py-1 rounded-full shadow-lg">
                        CREDENTIAL EARNED
                      </span>
                    )}

                    <div className="space-y-4 py-3">
                      <div className="text-4xl">{cert.icon}</div>
                      <div>
                        <h3 className="text-base font-extrabold text-white">{cert.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{cert.description}</p>
                      </div>

                      {/* Achievement Bar */}
                      <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 text-left space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500">
                          <span>Syllabus Completion</span>
                          <span className={isEligible ? "text-emerald-400" : "text-amber-400"}>{Math.min(totalCompleted, cert.requiredCount)} / {cert.requiredCount} Lessons</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${isEligible ? "bg-emerald-500" : "bg-violet-500"}`} style={{ width: `${Math.min(100, (totalCompleted / cert.requiredCount) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!isEligible}
                      onClick={() => alert(`Official verification certificate created for ${userProfile?.name || "Premium Student"} on ${new Date().toLocaleDateString()}!\nVerifiable Credential Hash: SHA-256 [${Math.random().toString(36).substring(2, 18).toUpperCase()}]`)}
                      className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        isEligible
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/10 cursor-pointer"
                          : "bg-slate-850 text-slate-500 border border-slate-800"
                      }`}
                    >
                      <Download className="w-4 h-4" /> Download Certificate
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "progress" ? (
          /* VIEW 7: EXTENSIVE PROGRESS TRACKER */
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Your Developer Profile & Analytics</h2>
              <p className="text-xs text-slate-400 mt-1">Review live learning streaks, achievements completed, and masterclass coverage percentages.</p>
            </div>

            {/* Overall Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">{totalCompletedLessons}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lessons Finished</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">{streak} Days</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Learning Streak</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">{codingTime} mins</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Coding Time</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white">{completedProjects.length} Completed</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Guided Capstones</div>
                </div>
              </div>
            </div>

            {/* Achievements and Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Academic Milestone Badges</h3>
                <div className="space-y-3">
                  {[
                    { title: "First Variable Compiled", condition: totalCompletedLessons >= 1, desc: "Successfully completed Lesson 1 and solved your first concept checkpoint." },
                    { title: "Mastery Enthusiast", condition: totalCompletedLessons >= 3, desc: "Mastered the complete free syllabus tracks of a language course." },
                    { title: "Streak Champion", condition: streak >= 5, desc: "Maintained a continuous daily learning block for 5 consecutive days." },
                    { title: "Project Architect", condition: completedProjects.length >= 1, desc: "Successfully finalized aguided practical portfolio capstone challenge." }
                  ].map((ach) => (
                    <div
                      key={ach.title}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        ach.condition
                          ? "bg-violet-950/15 border-violet-500/30 text-slate-200 shadow-md"
                          : "bg-slate-950/40 border-slate-850 opacity-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${
                        ach.condition ? "bg-violet-600/20 border-violet-500/40 text-violet-400" : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}>
                        {ach.condition ? <Check className="w-4 h-4 text-emerald-400" /> : "🔒"}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Study Planner Cards */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Weekly Socratic Target</h3>
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-center space-y-3">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Mastery target: 10 lessons</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1">Review 10 concepts socratic-style and score perfect checkpoint results on section quizzes.</p>
                  </div>
                  
                  <div className="space-y-1.5 text-left pt-2">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>Target Level Progress</span>
                      <span className="text-violet-400">{Math.round((totalCompletedLessons / 10) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full" style={{ width: `${Math.min(100, (totalCompletedLessons / 10) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};
