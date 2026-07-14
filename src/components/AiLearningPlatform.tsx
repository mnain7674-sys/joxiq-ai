import React, { useState } from "react";
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
  Cpu,
  Globe,
  Smartphone,
  Shield,
  Cloud,
  Database,
  BarChart,
  FileCode,
  Star,
  Crown,
  BookMarked,
  Layers,
  CheckSquare,
  Palette,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import Markdown from "react-markdown";

interface AiLearningPlatformProps {
  theme: string;
  userProfile: { name: string; email: string } | null;
  isProUser: boolean;
  onOpenProModal: () => void;
}

export interface Academy {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  badge: string;
  coursesCount: number;
}

export const ACADEMIES: Academy[] = [
  {
    id: "coding",
    title: "Coding Academy",
    description: "Master Python, JavaScript, React, SQL, and enterprise software engineering from scratch.",
    icon: Code2,
    color: "from-violet-600 to-indigo-600",
    badge: "Most Popular",
    coursesCount: 24
  },
  {
    id: "ai",
    title: "AI & Machine Learning Academy",
    description: "Learn generative AI, prompt engineering, LLM fine-tuning, PyTorch, and LangChain.",
    icon: Sparkles,
    color: "from-purple-600 to-pink-600",
    badge: "High Demand",
    coursesCount: 16
  },
  {
    id: "business",
    title: "Business & Startup Academy",
    description: "Master startup strategy, financial modeling, SaaS metrics, and agile product management.",
    icon: Briefcase,
    color: "from-emerald-600 to-teal-600",
    badge: "Entrepreneur",
    coursesCount: 18
  },
  {
    id: "design",
    title: "UI/UX Design Academy",
    description: "Craft world-class digital user experiences, Figma design systems, and visual interfaces.",
    icon: Palette,
    color: "from-amber-600 to-orange-600",
    badge: "Creative",
    coursesCount: 14
  },
  {
    id: "marketing",
    title: "Growth Marketing Academy",
    description: "Master SEO, content growth, conversion optimization, performance ads, and copywriting.",
    icon: TrendingUp,
    color: "from-blue-600 to-cyan-600",
    badge: "Growth",
    coursesCount: 15
  },
  {
    id: "language",
    title: "Language & Communication Academy",
    description: "Master real-world conversational fluency in English, Spanish, French, and Japanese.",
    icon: MessageSquare,
    color: "from-rose-600 to-red-600",
    badge: "Fluent",
    coursesCount: 12
  }
];

export interface Course {
  id: string;
  academyId: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  beginnerLessons: { id: string; title: string; content: string; quiz: { question: string; options: string[]; answer: number } }[];
  intermediateLessons: { id: string; title: string; content: string; quiz: { question: string; options: string[]; answer: number } }[];
  advancedLessons: { id: string; title: string; content: string; quiz: { question: string; options: string[]; answer: number } }[];
}

export const ALL_COURSES: Course[] = [
  {
    id: "python",
    academyId: "coding",
    name: "Python Programming",
    icon: "🐍",
    category: "Languages",
    description: "The world's most versatile language for AI, backend engineering, data science, and automation.",
    beginnerLessons: [
      {
        id: "py-b1",
        title: "Lesson 1 - Introduction to Python",
        content: "Python is a high-level, interpreted programming language known for its clean, readable syntax. Created by Guido van Rossum in 1991, Python emphasizes code readability with significant indentation. It's used by Google, Netflix, and NASA for backend systems and AI research.",
        quiz: { question: "Who created Python?", options: ["Guido van Rossum", "Brendan Eich", "Bill Gates", "Mark Zuckerberg"], answer: 0 }
      },
      {
        id: "py-b2",
        title: "Lesson 2 - Installing Python & Setup",
        content: "Setting up Python is effortless. Download the installer from python.org, verify via terminal with `python --version`, and run your first script using `print('Hello, Python!')`.",
        quiz: { question: "Which command prints output in Python?", options: ["echo()", "print()", "console.log()", "printf()"], answer: 1 }
      },
      {
        id: "py-b3",
        title: "Lesson 3 - Variables and Data Types",
        content: "Variables store data in computer memory. Python has dynamic typing: integers (`int`), floating-point numbers (`float`), strings (`str`), and booleans (`bool`).",
        quiz: { question: "What data type is `3.14`?", options: ["int", "str", "float", "bool"], answer: 2 }
      },
      {
        id: "py-b4",
        title: "Lesson 4 - Operators and Expressions",
        content: "Perform mathematical calculations (`+`, `-`, `*`, `/`, `**`), comparisons (`==`, `<`, `>`), and logical operations (`and`, `or`, `not`).",
        quiz: { question: "What does `2 ** 3` evaluate to in Python?", options: ["5", "6", "8", "9"], answer: 2 }
      },
      {
        id: "py-b5",
        title: "Lesson 5 - Conditional Statements",
        content: "Make decisions in code using `if`, `elif`, and `else` blocks based on boolean conditions.",
        quiz: { question: "Which keyword is used for alternative conditions in Python?", options: ["else if", "elseif", "elif", "case"], answer: 2 }
      },
      {
        id: "py-b6",
        title: "Lesson 6 - Loops (for & while)",
        content: "Automate repetitive tasks by iterating over sequences with `for` loops or running until a condition changes with `while` loops.",
        quiz: { question: "Which loop runs as long as a condition remains true?", options: ["for loop", "while loop", "repeat loop", "foreach loop"], answer: 1 }
      }
    ],
    intermediateLessons: [
      {
        id: "py-i1",
        title: "Lesson 7 - Functions and Scope",
        content: "Encapsulate reusable logic into functions using `def keyword`, parameters, return values, and understand local vs global scope.",
        quiz: { question: "Which keyword defines a function in Python?", options: ["func", "def", "function", "lambda"], answer: 1 }
      },
      {
        id: "py-i2",
        title: "Lesson 8 - Data Structures (Lists, Dictionaries)",
        content: "Organize collections using mutable Lists `[]` and key-value Dictionaries `{}`.",
        quiz: { question: "How do you define a dictionary in Python?", options: ["[]", "()", "{}", "<>"], answer: 2 }
      },
      {
        id: "py-i3",
        title: "Lesson 9 - Object-Oriented Programming (OOP)",
        content: "Model real-world entities using Classes, Objects, inheritance, and encapsulation.",
        quiz: { question: "What function initializes a Python class instance?", options: ["__init__", "__start__", "constructor", "setup"], answer: 0 }
      },
      {
        id: "py-i4",
        title: "Lesson 10 - File Handling and I/O",
        content: "Read and write text or CSV files securely using context managers (`with open(...) as f:`).",
        quiz: { question: "What is the recommended way to open files in Python?", options: ["open() alone", "with open()", "file.open()", "read.open()"], answer: 1 }
      }
    ],
    advancedLessons: [
      {
        id: "py-a1",
        title: "Lesson 11 - Decorators and Generators",
        content: "Write advanced Pythonic code using function wrappers (decorators) and memory-efficient generators (`yield`).",
        quiz: { question: "Which keyword is used in generator functions instead of return?", options: ["yield", "emit", "produce", "return"], answer: 0 }
      },
      {
        id: "py-a2",
        title: "Lesson 12 - Asynchronous Programming",
        content: "Handle concurrent network requests and high-speed I/O using `async` and `await`.",
        quiz: { question: "Which keyword pauses execution in an async function until a promise resolves?", options: ["wait", "await", "pause", "delay"], answer: 1 }
      },
      {
        id: "py-a3",
        title: "Lesson 13 - Building REST APIs with FastAPI",
        content: "Create lightning-fast production REST APIs with automatic documentation and type validation.",
        quiz: { question: "What library provides automatic Swagger UI docs for FastAPI?", options: ["Pydantic", "Starlette", "Swagger", "Uvicorn"], answer: 1 }
      },
      {
        id: "py-a4",
        title: "Lesson 14 - Capstone Project & Interview Prep",
        content: "Build a complete asynchronous web scraper and backend service. Prepare for senior Python interviews.",
        quiz: { question: "What is the standard testing library in Python?", options: ["Jest", "PyTest", "Mocha", "JUnit"], answer: 1 }
      }
    ]
  },
  {
    id: "ai-prompt",
    academyId: "ai",
    name: "Generative AI & Prompt Engineering",
    icon: "✨",
    category: "AI & LLMs",
    description: "Master prompt crafting, LLM system instructions, few-shot prompting, and AI application architectures.",
    beginnerLessons: [
      {
        id: "ai-b1",
        title: "Lesson 1 - Introduction to Large Language Models",
        content: "Understand transformer architectures, attention mechanisms, and how LLMs predict the next token based on training data.",
        quiz: { question: "What core architecture powers modern LLMs?", options: ["Transformer", "Recurrent Net", "Convolutional Net", "Decision Tree"], answer: 0 }
      },
      {
        id: "ai-b2",
        title: "Lesson 2 - Anatomy of an Effective Prompt",
        content: "Learn the four pillars of prompt engineering: Role/Persona, Context, Task Instructions, and Output Format.",
        quiz: { question: "Which component defines the AI's perspective?", options: ["Role / Persona", "Length", "Font size", "API key"], answer: 0 }
      },
      {
        id: "ai-b3",
        title: "Lesson 3 - Few-Shot Prompting",
        content: "Provide input-output examples inside prompts to guide LLMs toward precise formatting and tone.",
        quiz: { question: "What is zero-shot prompting?", options: ["Prompting with no examples", "Prompting with 10 examples", "Prompting with images", "Prompting without API"], answer: 0 }
      }
    ],
    intermediateLessons: [
      {
        id: "ai-i1",
        title: "Lesson 4 - Chain-of-Thought (CoT) Reasoning",
        content: "Instruct models to 'think step by step' before answering complex math, logic, or coding problems.",
        quiz: { question: "Why is Chain-of-Thought effective?", options: ["It reduces speed", "It breaks down reasoning into steps", "It uses more memory", "It compresses text"], answer: 1 }
      },
      {
        id: "ai-i2",
        title: "Lesson 5 - Function Calling & Tool Use",
        content: "Connect LLMs to external APIs, databases, and calculators by defining structured function schemas.",
        quiz: { question: "What does function calling enable LLMs to do?", options: ["Execute external tools and retrieve structured data", "Draw images directly", "Run local games", "Format HTML"], answer: 0 }
      }
    ],
    advancedLessons: [
      {
        id: "ai-a1",
        title: "Lesson 6 - RAG (Retrieval-Augmented Generation)",
        content: "Embed private documents into vector databases and retrieve relevant context for grounded AI answers.",
        quiz: { question: "What is the primary benefit of RAG?", options: ["Reduces hallucinations with verified context", "Increases model size", "Speeds up token generation", "Removes API costs"], answer: 0 }
      }
    ]
  },
  {
    id: "startup-strategy",
    academyId: "business",
    name: "Startup Strategy & SaaS Growth",
    icon: "🚀",
    category: "Business",
    description: "Build, launch, and scale high-growth tech startups from idea to venture-backed enterprise.",
    beginnerLessons: [
      {
        id: "bus-b1",
        title: "Lesson 1 - Finding Product-Market Fit",
        content: "Identify painful customer problems, validate demand before writing code, and interview target users.",
        quiz: { question: "What is product-market fit?", options: ["When customers eagerly buy and use your product", "Having a logo", "Registering an LLC", "Raising venture capital"], answer: 0 }
      },
      {
        id: "bus-b2",
        title: "Lesson 2 - Lean Startup Methodology",
        content: "Build Minimum Viable Products (MVPs), measure user feedback, and pivot or persevere rapidly.",
        quiz: { question: "What is the core Lean Startup loop?", options: ["Build-Measure-Learn", "Design-Test-Quit", "Fund-Spend-Close", "Hire-Fire-Repeat"], answer: 0 }
      }
    ],
    intermediateLessons: [
      {
        id: "bus-i1",
        title: "Lesson 3 - SaaS Unit Economics (CAC & LTV)",
        content: "Calculate Customer Acquisition Cost (CAC), Lifetime Value (LTV), Churn, and MRR growth.",
        quiz: { question: "What does LTV stand for?", options: ["Lifetime Value", "Long Term Venture", "Last Transaction Value", "Local Tax Variable"], answer: 0 }
      }
    ],
    advancedLessons: [
      {
        id: "bus-a1",
        title: "Lesson 4 - Venture Capital Fundraising & Pitch Decks",
        content: "Craft winning pitch decks, financial models, and negotiate term sheets with angel investors and VCs.",
        quiz: { question: "What is a term sheet?", options: ["Summary of investment terms and valuation", "Employee contract", "Invoice template", "Marketing plan"], answer: 0 }
      }
    ]
  },
  {
    id: "uiux-design",
    academyId: "design",
    name: "UI/UX Design Systems",
    icon: "🎨",
    category: "Design",
    description: "Design stunning digital user interfaces, accessible color systems, and scalable Figma component libraries.",
    beginnerLessons: [
      {
        id: "des-b1",
        title: "Lesson 1 - Fundamentals of Visual Hierarchy",
        content: "Guide users' eyes using size, contrast, spacing, and typography to create intuitive digital experiences.",
        quiz: { question: "What is visual hierarchy?", options: ["Arranging elements to show importance", "Choosing font colors", "Adding shadows", "Designing logos"], answer: 0 }
      },
      {
        id: "des-b2",
        title: "Lesson 2 - Color Theory & Accessibility (WCAG)",
        content: "Select harmonious color palettes and ensure sufficient contrast ratios for visually impaired users.",
        quiz: { question: "What does WCAG stand for?", options: ["Web Content Accessibility Guidelines", "World Color And Graphics", "Window Contrast Application Group", "Web Coding Guide"], answer: 0 }
      }
    ],
    intermediateLessons: [
      {
        id: "des-i1",
        title: "Lesson 3 - Figma Design Systems & Auto Layout",
        content: "Build responsive components, design tokens, and scalable auto-layout frames in Figma.",
        quiz: { question: "What feature in Figma handles responsive padding and wrapping?", options: ["Auto Layout", "Constraints", "Grid", "Prototype"], answer: 0 }
      }
    ],
    advancedLessons: [
      {
        id: "des-a1",
        title: "Lesson 4 - Micro-Interactions & Motion Design",
        content: "Enhance user feedback and delight with purposeful UI animations and smooth state transitions.",
        quiz: { question: "What is the primary purpose of UI micro-interactions?", options: ["Provide immediate feedback and delight", "Slow down app loading", "Increase code size", "Drain battery"], answer: 0 }
      }
    ]
  },
  {
    id: "growth-marketing",
    academyId: "marketing",
    name: "Growth Marketing & SEO",
    icon: "📈",
    category: "Marketing",
    description: "Drive organic search traffic, high-converting social campaigns, and viral growth loops.",
    beginnerLessons: [
      {
        id: "mkt-b1",
        title: "Lesson 1 - Search Engine Optimization (SEO) Basics",
        content: "Rank #1 on Google using keyword research, meta tags, semantic HTML, and high-quality backlinks.",
        quiz: { question: "What does SEO stand for?", options: ["Search Engine Optimization", "Social Engagement Online", "System Error Output", "Sales Execution Operations"], answer: 0 }
      }
    ],
    intermediateLessons: [
      {
        id: "mkt-i1",
        title: "Lesson 2 - Conversion Rate Optimization (CRO)",
        content: "A/B test landing page headlines, call-to-action buttons, and checkout funnels to maximize conversion.",
        quiz: { question: "What is A/B testing?", options: ["Comparing two versions of a webpage for performance", "Testing two apps", "Writing two emails", "Calling two clients"], answer: 0 }
      }
    ],
    advancedLessons: [
      {
        id: "mkt-a1",
        title: "Lesson 3 - Viral Growth Loops & Referral Engines",
        content: "Design product features that naturally encourage users to invite friends and colleagues.",
        quiz: { question: "What is a viral coefficient (K-factor)?", options: ["Average number of new users invited by each existing user", "Ad budget", "Email open rate", "Server uptime"], answer: 0 }
      }
    ]
  },
  {
    id: "language-coach",
    academyId: "language",
    name: "Conversational English & Languages",
    icon: "🗣️",
    category: "Languages",
    description: "Master real-world fluency, professional idioms, pronunciation, and confident public speaking.",
    beginnerLessons: [
      {
        id: "lang-b1",
        title: "Lesson 1 - Everyday Greetings and Introductions",
        content: "Master natural conversational openings, polite phrases, and self-introductions in professional settings.",
        quiz: { question: "Which greeting is most appropriate in a business meeting?", options: ["Hello, pleasure to meet you", "Yo!", "What's up dude?", "Sup"], answer: 0 }
      }
    ],
    intermediateLessons: [
      {
        id: "lang-i1",
        title: "Lesson 2 - Business Negotiation & Small Talk",
        content: "Build rapport, express polite disagreements, and negotiate terms successfully.",
        quiz: { question: "How do you politely disagree in negotiation?", options: ["I see your point, however...", "You are completely wrong", "No way", "Shut up"], answer: 0 }
      }
    ],
    advancedLessons: [
      {
        id: "lang-a1",
        title: "Lesson 3 - Public Speaking & Executive Presence",
        content: "Deliver captivating keynote presentations, handle difficult Q&A sessions, and master vocal tone.",
        quiz: { question: "What is key to executive presence?", options: ["Confidence, clarity, and composure", "Speaking as fast as possible", "Reading notes word-for-word", "Shouting"], answer: 0 }
      }
    ]
  }
];

export interface LessonSection {
  title: string;
  content: string;
  proTip: string;
  realWorldScenario: string;
  sectionQuiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
}

export const LESSON_SECTIONS_DATA: Record<string, LessonSection[]> = {
  "py-b1": [
    {
      title: "1. The Philosophy and Origins of Python",
      content: "Python was conceived in the late 1980s by Guido van Rossum at CWI in the Netherlands. Its design philosophy emphasizes code readability, simplicity, and expressive power. Unlike languages like C++ or Java that rely heavily on complex syntax, Python uses English-like keywords and clean indentation to define code blocks, making it highly approachable yet incredibly powerful.",
      proTip: "Python's core philosophy is written in 'The Zen of Python'. You can view it anytime in a Python terminal by running 'import this'. One key tenet is: 'Beautiful is better than ugly.'",
      realWorldScenario: "Tech giants like Google, Netflix, and NASA choose Python because its clean readability allows massive global engineering teams to collaborate on millions of lines of code without getting bogged down in syntax errors.",
      sectionQuiz: {
        question: "What is Python's primary design focus?",
        options: ["Maximum execution speed", "Code readability and simplicity", "Strict memory control like C", "Running exclusively on browsers"],
        answer: 1,
        explanation: "Python was designed with code readability as its core principle, utilizing indentation instead of curly braces."
      }
    },
    {
      title: "2. How Python's Execution Model Works",
      content: "Python is an interpreted, high-level language. When you run a Python script, the Python interpreter compiles your code into intermediate 'bytecode' (.pyc files), which is then executed by the Python Virtual Machine (PVM). This means you don't need a separate compile step like C++, enabling rapid development and interactive debugging.",
      proTip: "Because Python is interpreted, it uses a Global Interpreter Lock (GIL) in its standard implementation (CPython) which ensures only one thread executes Python bytecode at a time.",
      realWorldScenario: "When Netflix recommendations are refreshed, Python scripts orchestrate the underlying machine learning queries, leveraging Compiled C/C++ libraries under the hood for high-speed computing while keeping the API layer simple.",
      sectionQuiz: {
        question: "What converts Python bytecode into machine instructions?",
        options: ["The Web Browser", "The Python Virtual Machine (PVM)", "The operating system kernel directly", "A hardware-level compiler chip"],
        answer: 1,
        explanation: "The Python Virtual Machine (PVM) is the runtime engine that interprets and executes the compiled bytecode."
      }
    },
    {
      title: "3. Writing Your First Python Statements",
      content: "In Python, writing code is as simple as writing down your thoughts. A statement like `print('Hello World')` instantly outputs text. Comments start with `#` and are ignored by the interpreter. Indentation (usually 4 spaces) is strictly enforced to define loops, functions, and conditional blocks, replacing curly braces `{}`.",
      proTip: "Never mix tabs and spaces in Python code! It causes the dreaded 'TabError' at runtime. Configure your IDE to insert spaces when you hit Tab.",
      realWorldScenario: "System administrators write simple 5-line Python scripts to automate backups, parse server log files, and send email alerts on critical resource thresholds.",
      sectionQuiz: {
        question: "How are code blocks (like loops or functions) defined in Python?",
        options: ["Using curly braces {}", "Using indentation/whitespace", "Using semi-colons ;", "Using parentheses ()"],
        answer: 1,
        explanation: "Python uses strict indentation (whitespace) to determine the grouping of statements."
      }
    }
  ],
  "ai-b1": [
    {
      title: "1. Evolution & Concept of LLMs",
      content: "Large Language Models (LLMs) represent a breakthrough in Artificial Intelligence. Unlike rule-based natural language processors of the past, LLMs are trained on massive datasets of text to predict the next token (word or sub-word) in a sequence. By recognizing intricate patterns across billions of parameters, they gain an emergent ability to comprehend context, write code, translate languages, and reason.",
      proTip: "An LLM doesn't actually 'know' facts; it calculates the statistical probability of which words should follow your prompt based on its vast training dataset.",
      realWorldScenario: "Customer support systems use LLMs to immediately analyze the emotional sentiment of incoming support tickets and suggest tailored, polite resolutions to customer care representatives.",
      sectionQuiz: {
        question: "What is the core predictive mechanism behind Large Language Models?",
        options: ["Manually coded grammatical rules", "Predicting the next token in a sequence", "Using Google Search results in real-time", "Storing exact copies of all internet pages"],
        answer: 1,
        explanation: "LLMs are probabilistic model sequence predictors that determine the most likely next word/token based on context."
      }
    },
    {
      title: "2. The Transformer Architecture",
      content: "Introduced in Google's landmark 2017 paper 'Attention Is All You Need', the Transformer architecture revolutionized AI. Its core feature is the 'Self-Attention' mechanism, which allows the model to assess the importance of different words in a sentence, regardless of their distance from each other. This enables deep, contextual understanding that recurrent neural networks (RNNs) could never achieve.",
      proTip: "The key advantage of Transformers over older architectures is parallelization: they can process entire sequences of text all at once, rather than word-by-word, drastically speeding up training.",
      realWorldScenario: "Copilot and other code assistants use multi-headed attention layers to simultaneously analyze your current function definition and imported helper modules to suggest highly context-aware syntax.",
      sectionQuiz: {
        question: "Which breakthrough mechanism allows Transformers to weigh word importance across long sentences?",
        options: ["Gradient Descent", "Backpropagation", "Self-Attention", "Activation Functions"],
        answer: 2,
        explanation: "Self-Attention allows the model to map dependencies between words regardless of where they appear in the text."
      }
    }
  ],
  "bus-b1": [
    {
      title: "1. Core Philosophy of Product-Market Fit",
      content: "Product-Market Fit (PMF) is the single most critical milestone in a startup's lifecycle. Coined by Andy Rachleff, PMF means being in a good market with a product that can satisfy that market. Without PMF, startups bleed cash trying to acquire customers who don't actually get long-term value, leading to high churn and eventual failure.",
      proTip: "To measure PMF, use the Sean Ellis test: ask your active users 'How would you feel if you could no longer use this product?'. If more than 40% answer 'Very disappointed', you have achieved PMF.",
      realWorldScenario: "Slack originally started as an internal communication tool for a gaming startup. When they noticed extreme user excitement for the tool compared to the game, they pivoted entirely to Slack, achieving legendary PMF.",
      sectionQuiz: {
        question: "What does Product-Market Fit signify?",
        options: ["Having a fully certified registered business", "Being in a strong market with a product that satisfies it", "Raising a Series A venture capital round", "Having more than 100 followers on social channels"],
        answer: 1,
        explanation: "PMF represents meeting a real, validated market demand with an effective solution."
      }
    }
  ],
  "des-b1": [
    {
      title: "1. The Power of Visual Hierarchy",
      content: "Visual hierarchy is the arrangement and presentation of design elements in order of their importance. Designers use scale, weight, color, contrast, and spacing to guide the user's eye naturally through an interface, ensuring they absorb key information first and take the intended actions effortlessly.",
      proTip: "The human eye typically scans digital screens in an F-pattern or a Z-pattern. Place your absolute highest priority headers and calls-to-action along these natural scanning pathways.",
      realWorldScenario: "E-commerce giants design product pages with massive, high-contrast 'Add to Cart' buttons, placing less critical details (like specifications or shipping policies) in smaller text lower down.",
      sectionQuiz: {
        question: "What is the primary goal of visual hierarchy in UI design?",
        options: ["To fit as many features as possible onto one screen", "To guide the user's attention in order of importance", "To use the widest variety of colors possible", "To prove the design team is highly creative"],
        answer: 1,
        explanation: "Visual hierarchy helps users digest information easily by structuring element focus clearly."
      }
    }
  ],
  "lang-b1": [
    {
      title: "1. Mastering Everyday Greetings",
      content: "First impressions are vital in communication. Mastering professional greetings, polite gestures, and cultural nuances builds instant rapport. Instead of generic textbook greetings, real-world conversational fluency focuses on confidence, vocal projection, active listening, and open body language.",
      proTip: "Always accompany your verbal greeting with a warm, genuine smile and professional eye contact. This triggers trust and signals confidence.",
      realWorldScenario: "In business meetings or job interviews, starting with an active greeting like 'Good morning, thank you so much for having me today' immediately sets a collaborative, positive atmosphere.",
      sectionQuiz: {
        question: "Which of the following is most critical when greeting someone professionally?",
        options: ["Speaking as quickly as possible", "Displaying open body language and clear eye contact", "Using complex academic vocabulary", "Remaining completely silent and waiting for them to speak"],
        answer: 1,
        explanation: "Confidence is conveyed primarily through clear pronunciation, steady eye contact, and warm open body language."
      }
    }
  ],
  "mkt-b1": [
    {
      title: "1. SEO Core Principles",
      content: "Search Engine Optimization (SEO) is the science and art of ranking highly on search engines like Google. Search engines use complex crawlers and algorithms to index web content, measuring authority, relevance, page speed, mobile friendliness, and backlink networks to deliver the absolute best results to users.",
      proTip: "Do not 'stuff' keywords into pages! Google's modern semantic parser (BERT/MUM) penalizes repetitive, unnatural text. Focus on writing exhaustive, high-value content that fully answers the user's query.",
      realWorldScenario: "A local plumbing SaaS blog ranks #1 on Google for 'how to fix a leaky sink', capturing thousands of high-intent local business leads monthly without paying a single dollar in performance advertisements.",
      sectionQuiz: {
        question: "What is the main driver of modern search engine indexing engines?",
        options: ["Total quantity of repeated keywords", "Content relevance, authority, speed, and helpfulness", "How much a company pays search engines directly", "The amount of images present on the homepage"],
        answer: 1,
        explanation: "Search algorithms prioritize secure, fast, highly relevant, and authorized answers to provide searchers with premium value."
      }
    }
  ]
};

export function getSectionsForLesson(lessonId: string, lessonTitle: string, lessonContent: string): LessonSection[] {
  if (LESSON_SECTIONS_DATA[lessonId]) {
    return LESSON_SECTIONS_DATA[lessonId];
  }
  
  return [
    {
      title: "1. Overview & Core Philosophy",
      content: `${lessonContent} Developing a deep theoretical baseline is essential for mastery. This section covers why this concept exists, its core mechanics, and where it fits in the broader industry spectrum.`,
      proTip: "Break down complex topics into smaller, bite-sized components. Mastery comes from understanding basic building blocks.",
      realWorldScenario: "Top industry professionals use this daily to streamline workflows, optimize system performance, and align design frameworks.",
      sectionQuiz: {
        question: `What is the primary focus of ${lessonTitle}?`,
        options: ["To add structural complexity", "To establish robust, scalable foundations", "To replace critical frameworks", "To slow down overall execution"],
        answer: 1,
        explanation: "Establishing solid fundamentals is the key purpose of this introductory stage."
      }
    },
    {
      title: "2. Deep-Dive Concepts & Execution",
      content: "Let's explore how we actually apply this in practice. When constructing real systems, we must understand how to write readable code, design beautiful layouts, or manage complex variables without causing production issues.",
      proTip: "Focus on clean, structured execution and maintain complete separation of concerns in your workflows.",
      realWorldScenario: "Agile teams adopt this exact standard to keep their codebases maintainable across multiple generations of development.",
      sectionQuiz: {
        question: "What represents the best practice during implementation?",
        options: ["Writing large monolithic structures", "Prioritizing readability, maintenance, and logical blocks", "Ignoring comments and guidelines", "Hardcoding secret variables in public code"],
        answer: 1,
        explanation: "Maintainability, scalability, and code hygiene are paramount to production-grade development."
      }
    },
    {
      title: "3. Pitfalls & Best Practices",
      content: "Even world-class experts make mistakes. Common failures include premature optimization, missing edge cases, lacking proper validation, or failing to secure private assets. Adopting defensive strategies keeps your work bulletproof.",
      proTip: "Never trust user inputs or assumptions blindly. Always validate schemas, sanitize strings, and test edge cases exhaustively.",
      realWorldScenario: "Robust error handling and validation structures keep production architectures running securely 24/7 with zero downtime.",
      sectionQuiz: {
        question: "Which of these is a widely acknowledged engineering pitfall?",
        options: ["Writing self-documenting code", "Premature optimization and neglecting edge cases", "Setting up automated backup testing", "Using descriptive names for variables"],
        answer: 1,
        explanation: "Premature optimization and ignoring edge cases are major anti-patterns that frequently cause system failures."
      }
    }
  ];
}

export const AiLearningPlatform: React.FC<AiLearningPlatformProps> = ({
  theme,
  userProfile,
  isProUser,
  onOpenProModal
}) => {
  const [selectedAcademyId, setSelectedAcademyId] = useState<string>("coding");
  const [activeTab, setActiveTab] = useState<"home" | "catalog" | "projects" | "certificates" | "progress">("home");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<{ courseId: string; level: "beginner" | "intermediate" | "advanced"; lessonId: string; title: string; content: string; quiz: any } | null>(null);
  
  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Stepper state for lesson detail
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [sectionQuizAnswer, setSectionQuizAnswer] = useState<number | null>(null);
  const [sectionQuizSubmitted, setSectionQuizSubmitted] = useState<boolean>(false);
  const [sectionQuizPassed, setSectionQuizPassed] = useState<boolean>(false);
  const [showFinalQuiz, setShowFinalQuiz] = useState<boolean>(false);

  const handleSelectLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentSectionIndex(0);
    setSectionQuizAnswer(null);
    setSectionQuizSubmitted(false);
    setSectionQuizPassed(false);
    setShowFinalQuiz(false);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };


  // Universal AI Teacher chat state per lesson
  const [lessonMessages, setLessonMessages] = useState<{ [lessonId: string]: { role: "user" | "assistant"; content: string }[] }>({});
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Playground state
  const [playgroundLang, setPlaygroundLang] = useState<"python" | "javascript" | "html">("javascript");
  const [playgroundCode, setPlaygroundCode] = useState<string>('// Universal AI Teaching Engine - Code Sandbox\nconsole.log("Welcome to your interactive lesson!");\n\nfunction calculateScore(points) {\n  return points * 1.5;\n}\n\nconsole.log("Bonus points:", calculateScore(100));');
  const [playgroundOutput, setPlaygroundOutput] = useState<string>("Ready to run code...");

  // Progress in localStorage
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem("joxiq_completed_lessons");
    return saved ? JSON.parse(saved) : [];
  });

  const currentAcademy = ACADEMIES.find(a => a.id === selectedAcademyId) || ACADEMIES[0];
  const academyCourses = ALL_COURSES.filter(c => c.academyId === selectedAcademyId);

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId];
      localStorage.setItem("joxiq_completed_lessons", JSON.stringify(next));
      return next;
    });
  };

  const handleRunPlaygroundCode = () => {
    setPlaygroundOutput("Running code...");
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
            logs.push(`Error: ${e.message}`);
          } finally {
            console.log = originalLog;
          }
          setPlaygroundOutput(logs.join("\n") || "Executed successfully.");
        } else {
          setPlaygroundOutput("[Simulation Output]\nPython script executed successfully with exit code 0.");
        }
      } catch (err: any) {
        setPlaygroundOutput(`Error: ${err.message}`);
      }
    }, 300);
  };

  const handleSendLessonChat = async () => {
    if (!chatInput.trim() || !selectedLesson) return;
    const lessonId = selectedLesson.lessonId;
    const userMsg = chatInput.trim();
    setChatInput("");

    const currentMsgs = lessonMessages[lessonId] || [
      { role: "assistant", content: `Hello! I am your Universal AI Teacher and Mentor for **${selectedLesson.title}**. I am here to teach you step by step, explain real-world use cases, answer your questions, and test your knowledge. What would you like to explore first?` }
    ];

    const updated = [...currentMsgs, { role: "user" as const, content: userMsg }];
    setLessonMessages(prev => ({ ...prev, [lessonId]: updated }));
    setIsAiLoading(true);

    try {
      const activeSections = getSectionsForLesson(selectedLesson.lessonId, selectedLesson.title, selectedLesson.content);
      const activeSection = activeSections[currentSectionIndex];
      const sectionContext = activeSection 
        ? `The student is currently on the section titled "${activeSection.title}". Its content covers: "${activeSection.content}". Pro-tip: "${activeSection.proTip}". Real-world scenario: "${activeSection.realWorldScenario}".`
        : "";

      const prompt = `You are a world-class AI Teacher, mentor, and coach teaching the course "${selectedLesson.title}".
      ${sectionContext}
      
      The student is asking: "${userMsg}". 
      
      GUIDELINES:
      - Never reveal future topics or answers to upcoming quizzes.
      - Teach in highly detailed, patient, and logical stages.
      - Connect the explanation directly to real-world software engineering or industry usage.
      - Use clear, professional, yet friendly language. Give concrete code or practical examples where appropriate.
      - Keep the learner engaged and test their understanding with interactive follow-up questions.`;

      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, jsonMode: false })
      });
      const data = await res.json();
      const aiReply = data.result || "Keep practicing! Let me know if you have any questions about this concept.";

      setLessonMessages(prev => ({
        ...prev,
        [lessonId]: [...updated, { role: "assistant" as const, content: aiReply }]
      }));
    } catch (err: any) {
      setLessonMessages(prev => ({
        ...prev,
        [lessonId]: [...updated, { role: "assistant" as const, content: "I am having trouble connecting to the AI Teacher server. Please try again!" }]
      }));
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Banner / Academies bar */}
      <div className="bg-gradient-to-r from-violet-900/40 via-indigo-950/60 to-slate-900 border-b border-violet-800/30 px-6 py-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Universal AI Learning Platform
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🎓 World-Class AI Teacher Active
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Master Real-World Skills with Your Personal AI Mentor
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Choose an academy below. Learn step-by-step with interactive lessons, quizzes, real-world case studies, and live playground guidance.
          </p>
        </div>

        {/* Global Nav Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab("home"); setSelectedCourse(null); setSelectedLesson(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "home" && !selectedCourse ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Academies
          </button>
          <button
            onClick={() => { setActiveTab("projects"); setSelectedCourse(null); setSelectedLesson(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "projects" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Projects
          </button>
          <button
            onClick={() => { setActiveTab("certificates"); setSelectedCourse(null); setSelectedLesson(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === "certificates" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" : "text-slate-400 hover:text-white"}`}
          >
            Certificates
          </button>
        </div>
      </div>

      {/* Academies Selector Bar (Appears on Home tab) */}
      {activeTab === "home" && !selectedCourse && !selectedLesson && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {ACADEMIES.map((academy) => {
              const IconComp = academy.icon;
              const isSelected = selectedAcademyId === academy.id;
              return (
                <button
                  key={academy.id}
                  onClick={() => setSelectedAcademyId(academy.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    isSelected
                      ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/30"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{academy.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                    {academy.coursesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* LESSON DETAIL VIEW */}
        {selectedLesson ? (() => {
          const activeSections = getSectionsForLesson(selectedLesson.lessonId, selectedLesson.title, selectedLesson.content);
          const activeSection = activeSections[currentSectionIndex];
          return (
            <div className="space-y-6">
              {/* Back Button + Progress Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium bg-violet-950/40 px-3 py-1.5 rounded-lg border border-violet-800/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Course
                </button>
                
                {/* Horizontal Sections Progress Bar */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  {activeSections.map((sec, idx) => {
                    const isCompleted = idx < currentSectionIndex;
                    const isActive = idx === currentSectionIndex;
                    return (
                      <React.Fragment key={idx}>
                        <button
                          disabled={idx > currentSectionIndex && !showFinalQuiz}
                          onClick={() => {
                            setCurrentSectionIndex(idx);
                            setSectionQuizAnswer(null);
                            setSectionQuizSubmitted(false);
                            setSectionQuizPassed(idx < currentSectionIndex);
                            setShowFinalQuiz(false);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            isActive && !showFinalQuiz
                              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-500"
                              : isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-950 text-slate-500 border border-slate-800"
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>Section {idx + 1}</span>
                        </button>
                        {idx < activeSections.length - 1 && (
                          <div className={`h-0.5 w-3 shrink-0 ${idx < currentSectionIndex ? "bg-emerald-500/50" : "bg-slate-800"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                  <div className="h-0.5 w-3 bg-slate-800 shrink-0" />
                  <button
                    disabled={currentSectionIndex < activeSections.length - 1 || (!sectionQuizPassed && currentSectionIndex === activeSections.length - 1)}
                    onClick={() => setShowFinalQuiz(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      showFinalQuiz
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-500"
                        : "bg-slate-950 text-slate-500 border border-slate-800"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Final Quiz</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Lesson Content + Quiz */}
                <div className="lg:col-span-2 space-y-6">
                  {!showFinalQuiz ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" /> Step-by-Step Learning Engine
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Section {currentSectionIndex + 1} of {activeSections.length}</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4">{activeSection.title}</h2>
                        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4 text-sm md:text-base">
                          <p>{activeSection.content}</p>
                        </div>
                      </div>

                      {/* Detailed and engaging pro tip */}
                      {activeSection.proTip && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 space-y-2">
                          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" /> Professional Mentorship Pro-Tip:
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeSection.proTip}</p>
                        </div>
                      )}

                      {/* Real-world Application Scenario */}
                      {activeSection.realWorldScenario && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 space-y-2">
                          <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-400" /> Real-World Application & Impact:
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{activeSection.realWorldScenario}</p>
                        </div>
                      )}

                      {/* Section Understanding Check Quiz */}
                      <div className="bg-slate-950 p-6 rounded-xl border border-violet-900/40 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-violet-400" /> Section Understanding Check
                          </h4>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Section {currentSectionIndex + 1} of {activeSections.length}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{activeSection.sectionQuiz.question}</p>
                        
                        <div className="space-y-2">
                          {activeSection.sectionQuiz.options.map((opt, idx) => {
                            const isSelected = sectionQuizAnswer === idx;
                            const isCorrect = idx === activeSection.sectionQuiz.answer;
                            return (
                              <button
                                key={idx}
                                disabled={sectionQuizPassed}
                                onClick={() => { setSectionQuizAnswer(idx); setSectionQuizSubmitted(false); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                                  sectionQuizSubmitted || sectionQuizPassed
                                    ? isCorrect
                                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                                      : isSelected
                                      ? "bg-rose-500/15 border-rose-500 text-rose-300"
                                      : "bg-slate-900 border-slate-800 text-slate-500"
                                    : isSelected
                                    ? "bg-violet-600/20 border-violet-500 text-white"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                <span>{opt}</span>
                                {(sectionQuizSubmitted || sectionQuizPassed) && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {!sectionQuizPassed && !sectionQuizSubmitted ? (
                          <button
                            onClick={() => {
                              setSectionQuizSubmitted(true);
                              if (sectionQuizAnswer === activeSection.sectionQuiz.answer) {
                                setSectionQuizPassed(true);
                              }
                            }}
                            disabled={sectionQuizAnswer === null}
                            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/30"
                          >
                            Verify Understanding
                          </button>
                        ) : sectionQuizPassed ? (
                          <div className="space-y-4">
                            <div className="text-xs font-semibold p-4 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              🎉 Correct! {activeSection.sectionQuiz.explanation}
                            </div>
                            {currentSectionIndex < activeSections.length - 1 ? (
                              <button
                                onClick={() => {
                                  setCurrentSectionIndex(prev => prev + 1);
                                  setSectionQuizAnswer(null);
                                  setSectionQuizSubmitted(false);
                                  setSectionQuizPassed(false);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                              >
                                Unlock & Continue to Section {currentSectionIndex + 2} <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowFinalQuiz(true)}
                                className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center gap-1.5"
                              >
                                Proceed to Final Course Quiz <Award className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-xs font-semibold p-4 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30">
                              ❌ Not quite right. Let's think about this! Click "Ask AI Teacher" on the right if you'd like a simplified explanation.
                            </div>
                            <button
                              onClick={() => {
                                setSectionQuizAnswer(null);
                                setSectionQuizSubmitted(false);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                            >
                              Try Again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* FINAL EXAM VIEW */
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                      <div className="text-center space-y-2 py-4">
                        <div className="w-16 h-16 rounded-full bg-violet-600/15 border border-violet-500/40 flex items-center justify-center text-violet-300 mx-auto">
                          <Award className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white">Congratulations on Completing the Sections!</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">You have unlocked the final knowledge evaluation. Test your absolute mastery below to earn your completion status.</p>
                      </div>

                      <div className="bg-slate-950 p-6 rounded-xl border border-violet-900/40 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <HelpCircle className="w-4.5 h-4.5 text-violet-400" /> Final Masterclass Quiz
                        </h4>
                        <p className="text-xs text-slate-300 font-medium">{selectedLesson.quiz.question}</p>
                        
                        <div className="space-y-2">
                          {selectedLesson.quiz.options.map((opt: string, idx: number) => {
                            const isSelected = selectedQuizAnswer === idx;
                            const isCorrect = idx === selectedLesson.quiz.answer;
                            return (
                              <button
                                key={idx}
                                onClick={() => { setSelectedQuizAnswer(idx); setQuizSubmitted(false); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                                  quizSubmitted
                                    ? isCorrect
                                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-200"
                                      : isSelected
                                      ? "bg-rose-500/15 border-rose-500 text-rose-200"
                                      : "bg-slate-900 border-slate-800 text-slate-500"
                                    : isSelected
                                    ? "bg-violet-600/30 border-violet-500 text-white"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                                }`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {!quizSubmitted ? (
                          <button
                            onClick={() => setQuizSubmitted(true)}
                            disabled={selectedQuizAnswer === null}
                            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/30"
                          >
                            Submit Final Exam
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className={`text-xs font-semibold p-4 rounded-xl ${selectedQuizAnswer === selectedLesson.quiz.answer ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/10 text-rose-300 border border-rose-500/30"}`}>
                              {selectedQuizAnswer === selectedLesson.quiz.answer 
                                ? "🎉 Excellent! You have passed the final exam with 100% score! This lesson is now completely mastered." 
                                : "❌ Not quite. Review the previous sections or ask the AI Teacher on the right to explain!"}
                            </div>
                            
                            {selectedQuizAnswer === selectedLesson.quiz.answer && (
                              <button
                                onClick={() => {
                                  if (!completedLessons.includes(selectedLesson.lessonId)) {
                                    toggleLessonComplete(selectedLesson.lessonId);
                                  }
                                }}
                                className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-3 rounded-xl border transition-all ${
                                  completedLessons.includes(selectedLesson.lessonId) 
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30" 
                                    : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                }`}
                              >
                                <Check className="w-4 h-4" /> {completedLessons.includes(selectedLesson.lessonId) ? "Completed & Saved" : "Mark Course Completed"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Integrated Playground */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-violet-400" />
                        <h3 className="text-lg font-bold text-white">Interactive Sandbox & Playground</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={playgroundLang}
                          onChange={(e) => setPlaygroundLang(e.target.value as any)}
                          className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 outline-none"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML</option>
                        </select>
                        <button
                          onClick={handleRunPlaygroundCode}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-lg shadow-emerald-600/30"
                        >
                          <Play className="w-3.5 h-3.5" /> Run Code
                        </button>
                        <button
                          onClick={() => setPlaygroundCode("")}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                          title="Clear Code"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={playgroundCode}
                      onChange={(e) => setPlaygroundCode(e.target.value)}
                      rows={8}
                      className="w-full bg-slate-950 font-mono text-xs text-violet-200 p-4 rounded-xl border border-slate-800 focus:border-violet-500 outline-none resize-y"
                      placeholder="Write your code or exercise solution here..."
                    />

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
                      <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Execution Output</div>
                      <pre className="text-emerald-400 whitespace-pre-wrap">{playgroundOutput}</pre>
                    </div>
                  </div>
                </div>

              {/* Right Column: Dedicated AI Teacher Chat */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[700px]">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Universal AI Teacher</h4>
                      <p className="text-[11px] text-slate-400">Step-by-Step Socratic Mentor</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {(lessonMessages[selectedLesson.lessonId] || [
                      { role: "assistant", content: `Hello! I am your Universal AI Teacher and Mentor for **${selectedLesson.title}**. I am here to guide you step by step, explain real-world use cases, and answer any questions. What would you like to explore?` }
                    ]).map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                            AI
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-200 border border-slate-700"}`}>
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex gap-3 items-center text-xs text-slate-400">
                        <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 font-bold">AI</div>
                        <div className="bg-slate-800 px-4 py-2.5 rounded-2xl animate-pulse">AI Teacher is explaining step by step...</div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendLessonChat()}
                      placeholder="Ask AI teacher any question..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={handleSendLessonChat}
                      disabled={isAiLoading || !chatInput.trim()}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
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
          /* COURSE DETAIL VIEW */
          <div className="space-y-8">
            <button
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium bg-violet-950/40 px-3 py-1.5 rounded-lg border border-violet-800/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Academies
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="text-4xl md:text-5xl bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                  {selectedCourse.icon}
                </div>
                <div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {selectedCourse.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mt-1.5">{selectedCourse.name} Masterclass</h2>
                  <p className="text-sm text-slate-400 mt-1 max-w-xl">{selectedCourse.description}</p>
                </div>
              </div>
            </div>

            {/* Beginner, Intermediate, Advanced Levels */}
            <div className="space-y-6">
              {/* Beginner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Beginner Level (Lessons 1-3 Free)</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCourse.beginnerLessons.map((lesson, idx) => {
                    const isLocked = idx >= 3 && !isProUser;
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isLocked) onOpenProModal();
                          else setSelectedLesson({ courseId: selectedCourse.id, level: "beginner", lessonId: lesson.id, title: lesson.title, content: lesson.content, quiz: lesson.quiz });
                        }}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isLocked ? "bg-slate-950/60 border-slate-800/80 opacity-75" : "bg-slate-950 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{lesson.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1">{lesson.content}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            <Crown className="w-3.5 h-3.5" /> PRO
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Intermediate */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Intermediate Level</h3>
                  </div>
                  {!isProUser && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <Crown className="w-3.5 h-3.5" /> Pro Required
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
                        onClick={() => {
                          if (isLocked) onOpenProModal();
                          else setSelectedLesson({ courseId: selectedCourse.id, level: "intermediate", lessonId: lesson.id, title: lesson.title, content: lesson.content, quiz: lesson.quiz });
                        }}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isLocked ? "bg-slate-950/60 border-slate-800/80 opacity-75" : "bg-slate-950 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            {isDone ? <Check className="w-4 h-4" /> : idx + 4}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{lesson.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1">{lesson.content}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            <Crown className="w-3.5 h-3.5" /> PRO
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-bold text-white">Advanced Professional Track</h3>
                  </div>
                  {!isProUser && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <Crown className="w-3.5 h-3.5" /> Pro Required
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
                        onClick={() => {
                          if (isLocked) onOpenProModal();
                          else setSelectedLesson({ courseId: selectedCourse.id, level: "advanced", lessonId: lesson.id, title: lesson.title, content: lesson.content, quiz: lesson.quiz });
                        }}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isLocked ? "bg-slate-950/60 border-slate-800/80 opacity-75" : "bg-slate-950 border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            {isDone ? <Check className="w-4 h-4" /> : idx + 6}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{lesson.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1">{lesson.content}</p>
                          </div>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                            <Crown className="w-3.5 h-3.5" /> PRO
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
        ) : activeTab === "home" ? (
          /* ACADEMY HOME & COURSES GRID */
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {currentAcademy.badge}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{currentAcademy.title}</h2>
                <p className="text-sm text-slate-400 max-w-xl">{currentAcademy.description}</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-center px-4 border-r border-slate-800">
                  <div className="text-xl font-bold text-violet-400">{academyCourses.length}</div>
                  <div className="text-[11px] text-slate-400">Masterclasses</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-xl font-bold text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-400">AI Guided</div>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Available Courses in {currentAcademy.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {academyCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
                          {course.icon}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {course.category}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">{course.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>Interactive Lessons</span>
                      <span className="text-violet-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Start Learning <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "projects" ? (
          /* PROJECTS VIEW */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Real-World Practical Projects</h2>
              <p className="text-xs text-slate-400">Apply what you learn across academies with guided project milestones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: "Full-Stack SaaS Application", academy: "Coding Academy", desc: "Build a production SaaS app with authentication, database, and Stripe billing." },
                { title: "AI-Powered RAG Chatbot", academy: "AI Academy", desc: "Build an intelligent document search assistant using Gemini embeddings." },
                { title: "Startup Pitch & Financial Model", academy: "Business Academy", desc: "Create a 5-year financial forecast and investor pitch deck." },
                { title: "Figma Design System", academy: "Design Academy", desc: "Design a comprehensive component library with dark mode support." }
              ].map((p, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {p.academy}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                  <button
                    onClick={() => alert(`Opening guided workspace for ${p.title}. Your AI Teacher is ready to assist!`)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-violet-600/30"
                  >
                    Start Project Guidance
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "certificates" ? (
          /* CERTIFICATES VIEW */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Official Academy Certificates</h2>
              <p className="text-xs text-slate-400">Earn verifiable certificates upon completing academy masterclasses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ACADEMIES.map((ac) => (
                <div key={ac.id} className="bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-950 border border-violet-800/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{ac.title} Diploma</h3>
                    <p className="text-xs text-slate-400 mt-1">Awarded upon completing all curriculum lessons and quizzes.</p>
                  </div>
                  <button
                    onClick={() => alert(`${ac.title} Diploma verified and ready to download!`)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                  >
                    Download Certificate
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};
