// Academies and Courses Curriculum Database for Mobile App

export const ACADEMIES = [
  {
    id: "coding",
    title: "Coding Academy",
    description: "Master Python, JavaScript, React, SQL, and enterprise software engineering from scratch.",
    icon: "💻",
    color: "#6366f1",
    badge: "Most Popular",
    coursesCount: 24
  },
  {
    id: "ai",
    title: "AI & Machine Learning Academy",
    description: "Learn generative AI, prompt engineering, LLM fine-tuning, PyTorch, and LangChain.",
    icon: "✨",
    color: "#a855f7",
    badge: "High Demand",
    coursesCount: 16
  },
  {
    id: "business",
    title: "Business & Startup Academy",
    description: "Master startup strategy, financial modeling, SaaS metrics, and agile product management.",
    icon: "💼",
    color: "#10b981",
    badge: "Entrepreneur",
    coursesCount: 18
  },
  {
    id: "design",
    title: "UI/UX Design Academy",
    description: "Craft world-class digital user experiences, Figma design systems, and visual interfaces.",
    icon: "🎨",
    color: "#f59e0b",
    badge: "Creative",
    coursesCount: 14
  },
  {
    id: "marketing",
    title: "Growth Marketing Academy",
    description: "Master SEO, content growth, conversion optimization, performance ads, and copywriting.",
    icon: "📈",
    color: "#3b82f6",
    badge: "Growth",
    coursesCount: 15
  },
  {
    id: "language",
    title: "Language & Communication Academy",
    description: "Master real-world conversational fluency in English, Spanish, French, and Japanese.",
    icon: "🗣️",
    color: "#f43f5e",
    badge: "Fluent",
    coursesCount: 12
  }
];

export const ALL_COURSES = [
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

export const LESSON_SECTIONS_DATA = {
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
        question: "What is the primary indicator of Product-Market Fit?",
        options: ["Having a fully customized logo and color scheme", "High demand and retention from users who get deep value", "Successfully completing a seed investment round", "Registering a company name in multiple jurisdictions"],
        answer: 1,
        explanation: "Product-Market Fit is present when users derive high, recurring value, resulting in strong retention and demand."
      }
    }
  ]
};

export function getSectionsForLesson(lessonId, lessonTitle, lessonContent) {
  if (LESSON_SECTIONS_DATA[lessonId]) {
    return LESSON_SECTIONS_DATA[lessonId];
  }
  return [
    {
      title: `1. Foundations of ${lessonTitle}`,
      content: lessonContent,
      proTip: `Focus on mastering the underlying patterns of ${lessonTitle} first. Consistency beats intensity when learning complex material.`,
      realWorldScenario: `Professionals apply the concepts of ${lessonTitle} to solve scalable architecture demands in enterprise clouds.`,
      sectionQuiz: {
        question: `What is the core takeaway of ${lessonTitle}?`,
        options: ["Developing muscle memory through practice", "Rushing to memorize code blocks", "Avoiding real-world projects", "Relying on mock configurations"],
        answer: 0,
        explanation: "Practical application and developing structural understanding are the gold standards of real-world mastery."
      }
    },
    {
      title: `2. Practical Mechanics of ${lessonTitle}`,
      content: `Let's deep dive into implementing ${lessonTitle}. In production, this requires structured data flow, proper error handlers, and modular components that keep code clean and maintainable.`,
      proTip: "Write simple, readable routines first, and refactor for optimization only after validating correctness.",
      realWorldScenario: `Engineering teams use ${lessonTitle} principles to deploy responsive user modules under rapid agile release schedules.`,
      sectionQuiz: {
        question: "How should you approach optimization?",
        options: ["Optimize prematurely during initial drafts", "Write clean, readable code and optimize after verifying functionality", "Never optimize under any circumstance", "Write complex code to look expert"],
        answer: 1,
        explanation: "Premature optimization is the root of all evil. Keep code simple and reliable first."
      }
    }
  ];
}
