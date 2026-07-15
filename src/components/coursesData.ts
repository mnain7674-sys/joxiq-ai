export interface CareerCard {
  title: string;
  description: string;
  technologies: string[];
  salary: string;
  demand: "Extremely High" | "Very High" | "High";
  icon: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
}

export interface Course {
  id: string;
  academyId: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  beginnerLessons: Lesson[];
  intermediateLessons: Lesson[];
  advancedLessons: Lesson[];
  projects: {
    title: string;
    description: string;
    guidance: string[];
    difficulty: "Beginner" | "Intermediate" | "Advanced";
  }[];
}

export const CAREER_CARDS: CareerCard[] = [
  {
    title: "Web Developer",
    description: "Build, deploy, and maintain modern websites and basic interactive web experiences for brands and local businesses.",
    technologies: ["HTML5", "CSS3", "JavaScript", "Git", "Tailwind CSS"],
    salary: "$75,000 - $110,000",
    demand: "High",
    icon: "🌐"
  },
  {
    title: "Frontend Developer",
    description: "Craft stunning, responsive, highly interactive visual interfaces and user experiences using modern framework systems.",
    technologies: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Figma"],
    salary: "$90,000 - $140,000",
    demand: "Very High",
    icon: "⚛️"
  },
  {
    title: "Backend Developer",
    description: "Architect robust server architectures, design API communications, structure databases, and optimize backend execution speed.",
    technologies: ["Node.js", "Express.js", "Python", "SQL", "MongoDB", "PostgreSQL"],
    salary: "$95,000 - $150,000",
    demand: "Very High",
    icon: "⚙️"
  },
  {
    title: "Full Stack Developer",
    description: "The complete package. Build both visually rich client-side applications and high-speed, secure backend architectures.",
    technologies: ["React", "Next.js", "Node.js", "Express.js", "MongoDB", "SQL", "Docker"],
    salary: "$110,000 - $170,000",
    demand: "Extremely High",
    icon: "🥞"
  },
  {
    title: "Mobile App Developer",
    description: "Build beautiful, native or cross-platform mobile apps for iOS and Android platforms from a single clean codebase.",
    technologies: ["Flutter", "Dart", "Swift", "Kotlin", "React Native"],
    salary: "$95,000 - $145,000",
    demand: "Very High",
    icon: "📱"
  },
  {
    title: "AI Engineer",
    description: "Integrate intelligence into software systems by building agent architectures, prompt pipelines, and orchestrating LLMs.",
    technologies: ["Gemini SDK", "Python", "LangChain", "Vector Databases", "Hugging Face"],
    salary: "$130,000 - $210,000",
    demand: "Extremely High",
    icon: "🧠"
  },
  {
    title: "Machine Learning Engineer",
    description: "Train predictive data engines, fine-tune neural nets, and implement statistical algorithms on enterprise GPU structures.",
    technologies: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NumPy", "Pandas"],
    salary: "$135,000 - $220,000",
    demand: "Extremely High",
    icon: "🤖"
  },
  {
    title: "Data Scientist",
    description: "Analyze vast data warehouses, find hidden patterns, create executive visual dashboards, and predict business trajectories.",
    technologies: ["Python", "R", "SQL", "Pandas", "Matplotlib", "Tableau", "Jupyter"],
    salary: "$105,000 - $165,000",
    demand: "Very High",
    icon: "📊"
  },
  {
    title: "Game Developer",
    description: "Code immersive 2D/3D physics environments, rendering pipelines, multiplayer logic, and beautiful interactive games.",
    technologies: ["C++", "C#", "Unity", "Unreal Engine", "Godot"],
    salary: "$85,000 - $135,000",
    demand: "High",
    icon: "🎮"
  },
  {
    title: "Software Engineer",
    description: "Design general systems architecture, memory handling, object-oriented systems, and solve complex algorithms for scale.",
    technologies: ["Java", "C++", "Python", "Design Patterns", "Data Structures", "Algorithms"],
    salary: "$110,000 - $180,000",
    demand: "Very High",
    icon: "💻"
  },
  {
    title: "Cybersecurity Engineer",
    description: "Audit network environments, patch software vulnerabilities, implement end-to-end encryption protocols, and prevent attacks.",
    technologies: ["Linux", "Python", "Wireshark", "Metasploit", "Cryptography", "Network Security"],
    salary: "$115,000 - $180,000",
    demand: "Extremely High",
    icon: "🛡️"
  },
  {
    title: "Cloud Engineer",
    description: "Deploy scalable global application infrastructure, configure load balancers, and manage cloud computing networks.",
    technologies: ["GCP", "AWS", "Docker", "Kubernetes", "Linux", "Terraform"],
    salary: "$110,000 - $175,000",
    demand: "Extremely High",
    icon: "☁️"
  },
  {
    title: "DevOps Engineer",
    description: "Bridge coding and deployment by building robust automated CI/CD deployment pipelines, system logs, and health monitors.",
    technologies: ["Docker", "Kubernetes", "GitHub Actions", "Git", "Linux", "Shell Scripting"],
    salary: "$115,000 - $185,000",
    demand: "Extremely High",
    icon: "♾️"
  },
  {
    title: "Automation Engineer",
    description: "Write automated web scrapers, data parsers, hardware test engines, and cron actions to eliminate manual processes.",
    technologies: ["Python", "Selenium", "Playwright", "Bash Scripting", "Cron Jobs", "Git"],
    salary: "$90,000 - $140,000",
    demand: "Very High",
    icon: "⚡"
  }
];

// Helper to generate courses dynamically to prevent code bloat while keeping 100% independent robust structure.
const languages = [
  { name: "Python", icon: "🐍", category: "Languages", desc: "The world's most versatile language for AI, backend engineering, data science, and automation." },
  { name: "JavaScript", icon: "🟨", category: "Languages", desc: "The interactive language of the web. Essential for front-end visual states, interfaces, and server-side runtimes." },
  { name: "TypeScript", icon: "🔷", category: "Languages", desc: "Supercharged JavaScript with strict compile-time type safety. Perfect for enterprise-scale engineering." },
  { name: "Java", icon: "☕", category: "Languages", desc: "A robust, class-based object-oriented language. Standard for enterprise backend architectures and Android apps." },
  { name: "C", icon: "⚙️", category: "Languages", desc: "The low-level foundation of modern computing. Master hardware controls, memory allocation, and OS engines." },
  { name: "C++", icon: "👾", category: "Languages", desc: "High-performance object-oriented language. Standard for gaming systems, graphics engines, and high-speed financial systems." },
  { name: "C#", icon: "🎸", category: "Languages", desc: "Microsoft's elegant enterprise-grade language. Powers the Unity game engine and Windows application ecosystem." },
  { name: "PHP", icon: "🐘", category: "Languages", desc: "A classic server-side scripting language powering WordPress, e-commerce, and millions of active dynamic sites." },
  { name: "Go", icon: "🐹", category: "Languages", desc: "Google's minimalist language built for maximum network concurrency, simple compile setups, and microservices." },
  { name: "Rust", icon: "🦀", category: "Languages", desc: "Modern memory-safe system programming language without a garbage collector. The darling of modern systems engineers." },
  { name: "Swift", icon: "🦅", category: "Languages", desc: "Apple's modern, safe, and lightning-fast programming language for native iOS, macOS, watchOS, and tvOS apps." },
  { name: "Kotlin", icon: "🎯", category: "Languages", desc: "The modern, expressive official language for native Android application engineering, 100% interoperable with Java." },
  { name: "HTML", icon: "🌐", category: "Frontend", desc: "HyperText Markup Language. The absolute structural skeleton of every single web page on the internet." },
  { name: "CSS", icon: "🎨", category: "Frontend", desc: "Cascading Style Sheets. Master layout grids, colors, typography pairings, and complex responsive device visual rules." },
  { name: "React", icon: "⚛️", category: "Frontend", desc: "Facebook's industry-standard library for building modular, high-speed, dynamic components and visual user interfaces." },
  { name: "Next.js", icon: "▲", category: "Frontend", desc: "The production React framework for full-stack server-side rendering, search-engine optimization, and rapid routing." },
  { name: "Node.js", icon: "🟢", category: "Backend", desc: "High-speed asynchronous JavaScript runtime. Run robust production servers and terminal tools outside of web browsers." },
  { name: "Express.js", icon: "⚡", category: "Backend", desc: "The classic minimalist server router library for Node.js. Build lightning-fast JSON API servers with ease." },
  { name: "SQL", icon: "🛢️", category: "Databases", desc: "Structured Query Language. Design relational tables, write efficient data filters, and manage secure transactions." },
  { name: "MongoDB", icon: "🍃", category: "Databases", desc: "NoSQL document database. Store dynamic JSON records effortlessly for high-performance and scalable web apps." },
  { name: "Flutter", icon: "📱", category: "Mobile", desc: "Google's UI software system for compile-native, high-speed apps on iOS, Android, web, and desktop from a single codebase." },
  { name: "Dart", icon: "🎯", category: "Mobile", desc: "The strongly-typed object-oriented language powering Flutter, optimized for lightning-fast visual graphics." },
  { name: "AI & Machine Learning", icon: "🧠", category: "Advanced", desc: "Connect generative AI endpoints, design prompt frameworks, orchestrate LLM agents, and build intelligent apps." },
  { name: "Git & GitHub", icon: "🐙", category: "DevOps", desc: "Master code branching, merge conflicts, pull requests, and collaborative global open-source software structures." },
  { name: "Data Structures & Algorithms", icon: "🌲", category: "Computer Science", desc: "Crack the coding interview. Master binary trees, sorting algorithms, dynamic paths, arrays, hash maps, and stacks." }
];

const BEGINNER_TOPICS = [
  "Introduction & Overview",
  "Environment Setup & Configuration",
  "Your First 'Hello World' Code",
  "Variables, Constants, and Scope",
  "Understanding RAM & Computer Memory",
  "Primitive Data Types: Numbers and Floats",
  "Char Sequences and String Manipulation",
  "Boolean Logic & Truth Tables",
  "Basic Arithmetic Operators",
  "Relational and Comparison Operators",
  "Connecting Multi-Conditions with Logic Operators",
  "Single Alternative Decisions (if Statement)",
  "Dual Alternative Decisions (if-else Statement)",
  "Nested Decisions & Multi-way Branching",
  "Switched Execution & Pattern Matching",
  "The Concept of Loops & Iteration",
  "Pre-test Iteration (While Loops)",
  "Count-Controlled Iteration (For Loops)",
  "Post-test Iteration (do-while Loops)",
  "Loop Controls: break & continue",
  "Nested Loops & Multidimensional Iteration",
  "Introduction to Functions & Modular Blocks",
  "Function Parameters & Input Arguments",
  "Return Values & Exiting Functions",
  "Local vs. Global Variable Scope",
  "Standard Output Formatting & Escape Characters",
  "Basic User Inputs & Interactive Interfaces",
  "Code Comments & Documentation Standards",
  "Syntax Errors vs. Logic Errors",
  "Beginner Milestone: Building a CLI Application"
];

const INTERMEDIATE_TOPICS = [
  "Object-Oriented Principles (OOP): Overview",
  "Creating Classes & Instantiating Objects",
  "Encapsulation: Access Modifiers & Private States",
  "Inheritance: Sharing Reusable Class Logic",
  "Polymorphism: Method Overloading & Overriding",
  "Abstract Classes & Interfaces",
  "Custom Modular Architecture & Directories",
  "Importing and Exporting Modular Components",
  "Operating Systems I/O and File Streams",
  "File Handling: Reading and Parsing Raw Files",
  "File Handling: Writing and Appending Log Records",
  "Safe Buffer Flushing & Context Managers",
  "Robust Exception Handling (try-catch)",
  "Catching Specific Exceptions vs. Generic Errors",
  "Throwing Custom Exceptions & Guard Assertions",
  "Resources Cleanup using finally Blocks",
  "Linear Data Structures: Custom Arrays",
  "Key-Value Mapping: Hash Maps & Dictionaries",
  "Structured Lists: Linked Lists under the hood",
  "LIFO Structures: Custom Stacks & Execution Stack",
  "FIFO Structures: Queues & Event Handlers",
  "Simple Sorting Algorithms: Bubble Sort",
  "Searching Algorithms: Linear Search vs. Binary Search",
  "Introduction to Recursion & Base Cases",
  "Parsing Structured JSON String Payloads",
  "Manipulating Dates, Timestamps, and Timezones",
  "Regular Expressions (Regex) for Text Parsing",
  "Code Debugging: Breakpoints & Call Stacks",
  "Code Refactoring: DRY and SOLID Principles",
  "Intermediate Milestone: Structuring a Multimodal Library DB"
];

const ADVANCED_TOPICS = [
  "Functional Paradigms & Lambda Expressions",
  "Higher-Order Functions: map, filter, reduce",
  "Function Decorators & Metadata Wrapper Engines",
  "Lazy Evaluation & Generator Functions",
  "Deep vs. Shallow Copying & Memory References",
  "Advanced Garbage Collection & Memory Management",
  "Threading vs. Multiprocessing Concepts",
  "Asynchronous Programming Model & Event Loops",
  "Working with Promises, Futures, and Callbacks",
  "Modern async-await Execution Flows",
  "Concurrent Queue Processing & Semaphore Locks",
  "Network Protocols: TCP/IP vs. HTTP/HTTPS",
  "Building Robust REST API Endpoints",
  "Designing Secure API Routes with Middlewares",
  "Request Validation & Status Codes Best Practices",
  "Data Serialization and Compression",
  "Relational Queries vs. Non-Relational Data Storage",
  "Understanding WebSockets & Bidirectional Streams",
  "Working with Third-Party APIs & OAuth Access",
  "Microservices Architecture & System Isolation",
  "Building Secure Cryptographic Hashes & Auth Salt",
  "Securing Apps against SQL Injection & XSS Attacks",
  "Advanced Caching Strategies: Memory Cache vs. CDN",
  "Containerization Concepts: Docker & Kubernetes",
  "CI/CD Pipelines: Automated Lint, Test & Deploy",
  "System Scalability & High-Availability Load Balancers",
  "Senior Code Optimization & Performance Profiling",
  "Whiteboarding: Complex Tree & Graph Traversals",
  "Advanced System Design: Scalable Message Queues",
  "Senior Capstone Project: High-Performance Concurrent API"
];

function generateLessons(
  langName: string,
  code: string,
  level: "beginner" | "intermediate" | "advanced"
): Lesson[] {
  const topics = level === "beginner" 
    ? BEGINNER_TOPICS 
    : level === "intermediate" 
      ? INTERMEDIATE_TOPICS 
      : ADVANCED_TOPICS;
  
  const prefix = level === "beginner" ? "b" : level === "intermediate" ? "i" : "a";
  const startNum = level === "beginner" ? 1 : level === "intermediate" ? 31 : 61;
  
  return topics.map((topic, index) => {
    const lessonNum = startNum + index;
    const ansIdx = (index % 3);
    
    let options = [];
    if (ansIdx === 0) {
      options = [
        `It enables developers to manage system state, reduce complexity, and write scalable ${langName} code.`,
        `It disables all performance safety features in ${langName} to run raw binaries.`,
        `It forces the local computer to reboot and update its BIOS settings immediately.`,
        `It is an outdated technique that has been completely deprecated in modern versions.`
      ];
    } else if (ansIdx === 1) {
      options = [
        `It requires connecting to secure external database servers for every simple execution.`,
        `It promotes modularity, testability, and efficient resource handling within ${langName}.`,
        `It converts all source files into encrypted, unreadable binary files.`,
        `It makes compilation scripts take significantly longer with no developer benefit.`
      ];
    } else {
      options = [
        `It is only usable on special server hardware and cannot be tested locally.`,
        `It requires paid licensing terms to compile and run any simple code blocks.`,
        `It is a fundamental ${level}-level concept in ${langName} that enhances performance and structure.`,
        `It automatically translates all standard coding logic into other machine languages.`
      ];
    }

    const content = `${langName} ecosystem leverages ${topic} as a critical architectural element. In professional software engineering, mastering this concept represents a major step toward standard developer certification. Under the hood, this system parses and executes tasks efficiently, adapting to both simple scripts and massive distributed enterprise environments. By understanding ${topic}, developers can write clean, high-performance, and scalable software applications. In this lesson, we cover the exact syntax, common implementation mistakes, and real-world production usage patterns of ${topic} in ${langName}. Make sure to experiment with this code in your interactive sandbox playground!`;

    return {
      id: `${code}-${prefix}${index + 1}`,
      title: `Lesson ${lessonNum} - ${topic}`,
      content,
      quiz: {
        question: `Why is mastering '${topic}' considered crucial in ${langName} development?`,
        options,
        answer: ansIdx,
        explanation: `Mastering '${topic}' in ${langName} allows software engineers to build structured, efficient, and robust applications by aligning with standard programming best practices.`
      }
    };
  });
}

export const ALL_COURSES: Course[] = languages.map((lang) => {
  const code = lang.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  return {
    id: code,
    academyId: "coding",
    name: lang.name,
    icon: lang.icon,
    category: lang.category,
    description: lang.desc,
    
    beginnerLessons: generateLessons(lang.name, code, "beginner"),
    intermediateLessons: generateLessons(lang.name, code, "intermediate"),
    advancedLessons: generateLessons(lang.name, code, "advanced"),
    
    projects: [
      {
        title: "Dynamic Interactive Calculator",
        description: "Develop a functional interactive calculator featuring responsive input states, clean decimal math parsing, and error guards.",
        difficulty: "Beginner",
        guidance: [
          "Establish an isolated modular function to parse mathematical strings.",
          "Implement defensive error traps for divisions by zero.",
          "Add historical logs of past calculations to local cache storage."
        ]
      },
      {
        title: "Real-Time Geo Weather Monitor",
        description: "Create an application that fetches real-time meteorological JSON payloads from external server endpoints dynamically.",
        difficulty: "Intermediate",
        guidance: [
          "Integrate asynchronous promise blocks or async/await syntax cleanly.",
          "Render beautiful dynamic condition states based on wind and temp metrics.",
          "Incorporate visual search bars with debounced API lookup queries."
        ]
      },
      {
        title: "Verifiable Enterprise Dashboard",
        description: "Construct a professional metrics dashboard utilizing live charts, sorting pipelines, and secure data storage.",
        difficulty: "Advanced",
        guidance: [
          "Integrate clean charting libraries like D3 or Recharts.",
          "Build sorting, filtering, and pagination actions across extensive rows of mock records.",
          "Store active user preferences and configurations in durable cloud collections."
        ]
      }
    ]
  };
});
