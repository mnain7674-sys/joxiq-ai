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
  }
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

function getTopicsForCourse(courseName: string, level: "beginner" | "intermediate" | "advanced"): string[] {
  const isLanguage = courseName.toLowerCase().includes("coach") || courseName.toLowerCase().includes("language");
  const isDesign = courseName.toLowerCase().includes("design") || courseName.toLowerCase().includes("visual") || courseName.toLowerCase().includes("typography");
  const isBusiness = courseName.toLowerCase().includes("startup") || courseName.toLowerCase().includes("capital") || courseName.toLowerCase().includes("product") || courseName.toLowerCase().includes("growth") || courseName.toLowerCase().includes("business");
  const isMarketing = courseName.toLowerCase().includes("seo") || courseName.toLowerCase().includes("social") || courseName.toLowerCase().includes("marketing");
  const isFinance = courseName.toLowerCase().includes("wealth") || courseName.toLowerCase().includes("modeling") || courseName.toLowerCase().includes("finance");

  if (isLanguage) {
    if (level === "beginner") {
      return [
        "Welcome & Course Overview",
        "Alphabet & Phonetics Foundations",
        "Basic Accent & Pronunciation Rules",
        "Essential Greetings & Introductions",
        "Polite Expressions & Courtesy",
        "Everyday Objects & Vocabulary",
        "Counting from 1 to 100",
        "Describing Colors & Visual Shapes",
        "Family Members & Relationships",
        "Telling Time, Days, and Months",
        "Subject Pronouns & Present Tense Verbs",
        "Creating Simple Declarative Sentences",
        "Formulating Questions & Inquiries",
        "Negative Sentence Structures",
        "Everyday Foods & Dining Vocabulary",
        "Direction Terms & Basic Travel Vocabulary",
        "Hobbies, Sports, and Leisure Words",
        "Describing the Weather & Seasons",
        "Common Adjectives for Simple Descriptions",
        "Modal Verbs of Ability & Permission",
        "Present Continuous Action Verbs",
        "Possessive Adjectives & Pronouns",
        "Shopping, Prices, and Transaction Words",
        "Body Parts & Basic Health Terms",
        "Home Environments & Household Chores",
        "Basic Listening & Ear Training",
        "Beginner Reading Comprehension Check",
        "Correct Spelling & Dictation Drills",
        "Consolidating Beginner Vocabulary",
        "Beginner Milestone: Complete Conversation Challenge"
      ];
    } else if (level === "intermediate") {
      return [
        "Transitioning to Intermediate Communication",
        "Narrating Past Events (Simple Past Tense)",
        "Describing Future Plans (Future Tenses)",
        "Conditional Sentences: Real Possibilities",
        "Connecting Ideas with Advanced Conjunctions",
        "Relative Pronouns & Descriptive Clauses",
        "Reading News Articles & Summarizing",
        "Following Fast Conversations & Accents",
        "Expressing Personal Opinions on Hot Topics",
        "Writing Structured Paragraphs & Essays",
        "Discussing Workplace Roles & Professions",
        "Describing Past Experiences (Present Perfect)",
        "Using Expressive Idiomatic Phrases",
        "Collocations & Dynamic Natural Word Pairings",
        "Polite Workplace Telephone Correspondence",
        "Giving Direct Commands & Soft Suggestions",
        "Describing Shapes, Textures, and Dimensions",
        "Phrasal Verbs of Motion & Transition",
        "Narrating Multi-Part Story Plots",
        "Speculating About Abstract Scenarios",
        "Reporting What Others Said (Indirect Speech)",
        "Refining Intermediate Reading Fluency",
        "Expressing Agreement, Disagreement, and Doubts",
        "Talking About Technology & Future Trends",
        "Expressing Needs, Desires, and Obligations",
        "Intermediate Pronunciation & Word Stress",
        "Describing Travel Itineraries & Booking Flights",
        "Comparing Similar Objects & Quantities",
        "Refactoring Sentence Structure for Clarity",
        "Intermediate Milestone: Professional Business Interview Sim"
      ];
    } else {
      return [
        "Entering Advanced Language Mastery",
        "Fluent Impromptu Speech & Rapid Response",
        "Decoding Native Regional Slang & Humor",
        "Structuring High-Level Corporate Talks",
        "Academic Register & Sophisticated Writing",
        "Drafting Professional Emails & Reports",
        "Debating Techniques & Logical Argumentation",
        "Delivering Dynamic Presentations under Pressure",
        "Roleplaying Complex Client Negotiations",
        "Advanced Phrasal Verbs & Literary Idioms",
        "Polishing Accent & Intonation Nuances",
        "Reading Complex Literary Texts & Poetry",
        "Understanding Contractual and Legal Terms",
        "Advanced Conditional Structures (Hypotheticals)",
        "The Passive Voice in Formal Correspondence",
        "Advanced Medical & Wellness Terminology",
        "Rhetorical Devices & Persuasive Speaking",
        "Writing Narrative Fiction and Creative Essays",
        "Simultaneous Listening & Multi-Tasking Exercises",
        "Subtle Social Coding: Politeness vs. Directness",
        "Explaining Complex Scientific Concepts simply",
        "Understanding Financial and Stock Market Talk",
        "Writing Advanced Abstract Summaries",
        "Humorous Storytelling and Quick Banter",
        "Addressing Large Audiences & Public Relations",
        "Cross-Cultural Etiquette & Sensitive Topics",
        "Reviewing and Editing Others' Writing",
        "Advanced Syntax & Dynamic Sentence Inversion",
        "Mastering Speed Reading & High Retention",
        "Senior Capstone: Fluent Master Thesis Defense"
      ];
    }
  }

  if (isDesign) {
    if (level === "beginner") {
      return [
        "Welcome to UI/UX Design",
        "The Core Purpose of Human Interfaces",
        "Visual Hierarchy: The F and Z Patterns",
        "Introduction to Figma & Canvas Setup",
        "Working with Vector Shapes & Paths",
        "The Power of Negative Space & Margins",
        "Primary, Secondary, and Neutral Colors",
        "Understanding Visual Contrast Rules",
        "Typography Basics: Serif vs. Sans-Serif",
        "Establishing an Elegant Type Scale",
        "Alignments, Grids, and Column Guidelines",
        "The Anatomy of Buttons & Call-to-Actions",
        "Designing Modern Card Components",
        "Creating Your First Layout Mockup",
        "Introduction to Wireframing & Sketching",
        "Understanding Mobile vs. Desktop Viewports",
        "Input Fields, Forms, and Error States",
        "The Psychology of User Interaction Flow",
        "Consistency in Spacing & Sizing Tokens",
        "Working with Icons & Vector Graphics",
        "Designing Clean Navigation Bars",
        "Basic Prototyping: Linking Artboards",
        "Transition Animations: Dissolving & Sliding",
        "The Rules of Visual Balance & Symmetry",
        "Designing Clean Footers & Margins",
        "Collecting and Applying Design Feedback",
        "Common Beginner Design Pitfalls",
        "Introduction to Moodboards & Theme Curation",
        "Structuring a Single-Screen Web Interface",
        "Beginner Milestone: Portfolio landing page wireframe"
      ];
    } else if (level === "intermediate") {
      return [
        "Transitioning to Modular Design Systems",
        "Creating Reusable Components in Figma",
        "Designing Auto-Layouts for Dynamic Sizes",
        "Establishing a Structured Design Token Model",
        "Variables for Dark Mode & Responsive Layouts",
        "Interactive Components & Micro-States",
        "Interactive Hover & Active Press States",
        "Designing Complex Multi-Step Form Steppers",
        "Constructing Mobile Navigation Drawers",
        "Principles of Gestalt and Grouping",
        "Advanced Alignment and Complex Tables",
        "Crafting Data Visualization Charts",
        "Designing Interactive Search dropdowns",
        "Aesthetic Rhythm through Content Variation",
        "Working with Dynamic Images & Rich Media",
        "Designing Responsive Navigation Systems",
        "Collaborative Design Workflows & Hand-off",
        "User Testing and Heatmap Analysis",
        "Creating Interactive Slider Inputs",
        "Figma Auto-Layout Wrapping Techniques",
        "Designing Toast Notifications & Alerts",
        "Creating Fluid Spring Motion Prototypes",
        "A/B Testing Visual Variants for Growth",
        "Accessibility Guidelines (WCAG AAA)",
        "Designing Settings & Profile Interfaces",
        "Typography Hierarchy in Complex Dashboards",
        "Figma Constraints & Resizing Behaviors",
        "Establishing Grid Frameworks for Web",
        "Refactoring Messy Artboards for Collaboration",
        "Intermediate Milestone: Multi-view Dashboard Prototype"
      ];
    } else {
      return [
        "Entering Professional Design Systems",
        "Architecting Global Design Systems from Scratch",
        "Design Tokens for Multi-Platform (iOS, Android, Web)",
        "Advanced Figma Variables and Modes",
        "Complex Component State Machines",
        "Motion Design: High-Fidelity Transitions",
        "Spring-based Animation Models & Physics",
        "Micro-Animations for Interaction Delight",
        "Designing Complex Analytics Dashboards",
        "Accessibility Auditing and Color Deficiencies",
        "Responsive Reflow & Screen Adaptation",
        "Design Thinking and Problem Definition",
        "Information Architecture & Sitemap Mapping",
        "UX Writing: Words as Design Elements",
        "Designing for Foldables & Unusual Aspect Ratios",
        "Advanced Figma Prototyping with Variables",
        "User Research Methodologies & Interviewing",
        "Analyzing Interaction Analytics & Dropoffs",
        "Designing Enterprise Admin Console UI",
        "Heuristic Evaluation of Live Websites",
        "Design Leadership: Mentoring and Critiquing",
        "HTML/CSS Hand-off & Code Interoperability",
        "Designing High-Performance Vector Graphics",
        "Visual Branding: Cohesive Style Guides",
        "Design Systems Governance & Versioning",
        "Creating Complex Dynamic Visual Filters",
        "Psychology of Color Harmonies in Product",
        "Optimizing Assets for Production Load Time",
        "Designing Secure Checkout and Flow Traps",
        "Senior Capstone: Complete Responsive SaaS Interface Design"
      ];
    }
  }

  if (isBusiness || isMarketing || isFinance) {
    if (level === "beginner") {
      return [
        "Welcome & Foundational Overview",
        "The Core Purpose and Value Creation",
        "Understanding Your Audience & Market",
        "Introduction to Business Metrics",
        "The Power of Clear Messaging & Copy",
        "Essential Strategy and Goals",
        "Budgeting, Pricing, and Income Basics",
        "Establishing Brand Identity",
        "Defining Your Unique Selling Proposition",
        "Introduction to Marketing Channels",
        "Creating Your First Campaign/Pitch",
        "Understanding Unit Economics",
        "Customer Acquisition Basics",
        "The Visual Presentation of Data",
        "Fundamentals of Corporate Structures",
        "Personal Finance & Resource Handling",
        "Risk Identification and Traps",
        "Building a Lean Canvas Model",
        "Competitive Research & Benchmarking",
        "Effective Communication with Stakeholders",
        "Writing Professional Pitches & Hooks",
        "Basic Sales Funnel Design",
        "Analyzing Basic Profit and Loss Statements",
        "The Power of Email Curation",
        "Establishing Trust with Early Users",
        "Simple Survey & Feedback Pipelines",
        "Common Beginner Pitfalls",
        "Building a Standard Outreach Campaign",
        "Structuring a Single-Page Business Model",
        "Beginner Milestone: Building a Mini Plan Pitch"
      ];
    } else if (level === "intermediate") {
      return [
        "Transitioning to Scale Operations",
        "Designing Reusable Operations playbooks",
        "Setting Up Key Performance Indicators (KPIs)",
        "Analyzing Customer Lifetime Value (LTV)",
        "Optimizing Customer Acquisition Cost (CAC)",
        "Formulating Competitive Strategies",
        "Writing High-Conversion Sales Copy",
        "Constructing Marketing Funnels",
        "Interpreting Financial Statements",
        "A/B Testing Campaigns for Growth",
        "Designing Pricing Matrices",
        "Understanding Venture Financing Rounds",
        "Product Discovery & Management",
        "Growth Hacking and Organic Viral Loops",
        "Automating Standard Marketing Flows",
        "Interpreting Web Traffic & Conversion Rates",
        "Managing Partnerships and Integrations",
        "Establishing Brand Guidelines",
        "Designing Loyalty Programs",
        "Analyzing Multi-Channel Ad Spending",
        "Managing Budgets & Projected Forecasts",
        "Structuring Team Hand-offs and Sprints",
        "Pitching to Angel Investors and Clients",
        "Implementing Legal & Compliance Safety",
        "Designing Complex Business Checkouts",
        "Analyzing Churn Rates & Retentions",
        "Customer Feedback Integration Loop",
        "Developing Strategic Roadmaps",
        "Refactoring Inefficient Workflows",
        "Intermediate Milestone: Executing a Product Launch Plan"
      ];
    } else {
      return [
        "Entering Professional Enterprise Scaling",
        "Architecting Global Growth Frameworks",
        "Designing Multi-Platform Monetization Models",
        "Advanced Cap Table Dilutions & Term Sheets",
        "Complex Corporate Valuation & Modelling",
        "Motion Design: High-Conversion Campaign Ads",
        "Predictive Financial Forecasting Engines",
        "Automated CRM Integration Architectures",
        "Designing Enterprise Analytical Dashboards",
        "Regulatory and Compliance Auditing",
        "Responsive Reflow & Screen Adaptation",
        "Strategic Negotiation and Closing Deals",
        "Information Architecture in Growth Hubs",
        "UX Writing: Driving SaaS conversions",
        "Designing Business Operations for IPOs",
        "Advanced Analytics & Attribution Models",
        "User Cohort Analysis & Retention Grids",
        "Designing Enterprise Partner Ecosystems",
        "Evaluating Corporate Mergers & Acquisitions",
        "Heuristic Evaluation of Marketing Funnels",
        "Leadership: Building and Inspiring Big Teams",
        "Data Encryption & Security in Transactions",
        "Designing High-Performance Scalable Brands",
        "Strategic PR & Brand Crisis Management",
        "Corporate Governance & Ethics in Scaling",
        "Creating Complex Dynamic Cohort Filters",
        "Capital Allocation & Strategic Reinvestment",
        "Optimizing Customer Service with AI Tools",
        "Designing Secure Enterprise Portals",
        "Senior Capstone: Complete Pitch deck & Business model"
      ];
    }
  }

  // Fallback to standard coding topics
  if (level === "beginner") {
    return BEGINNER_TOPICS;
  } else if (level === "intermediate") {
    return INTERMEDIATE_TOPICS;
  } else {
    return ADVANCED_TOPICS;
  }
}

function generateLessons(
  courseName: string,
  code: string,
  level: "beginner" | "intermediate" | "advanced"
): Lesson[] {
  const topics = getTopicsForCourse(courseName, level);
  const prefix = level === "beginner" ? "b" : level === "intermediate" ? "i" : "a";
  const startNum = level === "beginner" ? 1 : level === "intermediate" ? 31 : 61;
  
  return topics.map((topic, index) => {
    const lessonNum = startNum + index;
    const ansIdx = (index % 3);
    
    let options = [];
    if (ansIdx === 0) {
      options = [
        `It enables learners to master concepts, reduce complexity, and apply practical skills in ${courseName}.`,
        `It disables all performance and safety structures in ${courseName} to run raw trials.`,
        `It forces the surrounding system environment to fail with multiple alert dialogs.`,
        `It is a deprecated and useless convention that is no longer used in standard ${courseName} domains.`
      ];
    } else if (ansIdx === 1) {
      options = [
        `It requires paid certification fees for every simple interactive question.`,
        `It promotes deep mental structures, practical logic, and professional standards in ${courseName}.`,
        `It makes interactive teaching simulations take significantly longer with no real learning value.`,
        `It forces all data inputs to be encrypted using obsolete key files.`
      ];
    } else {
      options = [
        `It is an experimental concept that can only be tested inside special sandbox servers.`,
        `It requires heavy computational overhead and crashes on mobile screens.`,
        `It is a fundamental ${level}-level concept in ${courseName} that enhances retention and speed.`,
        `It translates standard theoretical elements into simple automatic audio playbacks.`
      ];
    }

    const content = `${courseName} masteries leverage ${topic} as a critical milestone. In professional applications, mastering this concept represents a major step toward real-world performance. By fully understanding ${topic}, learners can construct and execute projects with confidence, adapting to both simple exercises and massive distributed production environments. We cover the core logic, real-life applications, common mistakes, and industry standard execution patterns of ${topic} in ${courseName}. Make sure to experiment with this in your interactive workspace!`;

    return {
      id: `${code}-${prefix}${index + 1}`,
      title: `Lesson ${lessonNum} - ${topic}`,
      content,
      quiz: {
        question: `Why is mastering '${topic}' considered a crucial pillar in ${courseName}?`,
        options,
        answer: ansIdx,
        explanation: `Mastering '${topic}' in ${courseName} allows learners to build highly structured, efficient, and professional workflows by aligning with standard production best practices.`
      }
    };
  });
}

const academiesData = {
  coding: [
    { name: "Python", icon: "🐍", category: "Languages", desc: "The world's most versatile language for AI, backend engineering, data science, and automation." },
    { name: "JavaScript", icon: "🟨", category: "Languages", desc: "The interactive language of the web. Essential for front-end visual states, interfaces, and server-side runtimes." },
    { name: "TypeScript", icon: "🔷", category: "Languages", desc: "Supercharged JavaScript with strict type safety. Perfect for enterprise-scale engineering." },
    { name: "Java", icon: "☕", category: "Languages", desc: "A robust, class-based object-oriented language. Standard for enterprise backend architectures and Android apps." },
    { name: "C", icon: "⚙️", category: "Languages", desc: "The low-level foundation of modern computing. Master hardware controls, memory allocation, and OS engines." },
    { name: "C++", icon: "👾", category: "Languages", desc: "High-performance object-oriented language. Standard for gaming systems, graphics engines, and financial systems." },
    { name: "C#", icon: "🎸", category: "Languages", desc: "Microsoft's elegant enterprise-grade language. Powers the Unity game engine and Windows application ecosystem." },
    { name: "PHP", icon: "🐘", category: "Languages", desc: "A classic server-side scripting language powering WordPress, e-commerce, and millions of active dynamic sites." },
    { name: "Go", icon: "🐹", category: "Languages", desc: "Google's minimalist language built for maximum network concurrency, simple compile setups, and microservices." },
    { name: "Rust", icon: "🦀", category: "Languages", desc: "Modern memory-safe system programming language without a garbage collector. The darling of systems engineers." },
    { name: "Swift", icon: "🦅", category: "Languages", desc: "Apple's modern, safe, and lightning-fast programming language for native iOS, macOS, watchOS, and tvOS apps." },
    { name: "Kotlin", icon: "🎯", category: "Languages", desc: "The modern, official language for native Android application engineering, 100% interoperable with Java." },
    { name: "HTML", icon: "🌐", category: "Frontend", desc: "HyperText Markup Language. The absolute structural skeleton of every single web page on the internet." },
    { name: "CSS", icon: "🎨", category: "Frontend", desc: "Cascading Style Sheets. Master layout grids, colors, typography pairings, and responsive visual rules." },
    { name: "React", icon: "⚛️", category: "Frontend", desc: "Facebook's industry-standard library for building modular, high-speed, dynamic components and visual user interfaces." },
    { name: "Next.js", icon: "▲", category: "Frontend", desc: "The production React framework for full-stack server-side rendering, SEO, and rapid routing." },
    { name: "Node.js", icon: "🟢", category: "Backend", desc: "High-speed asynchronous JavaScript runtime. Run robust production servers outside of web browsers." },
    { name: "Express.js", icon: "⚡", category: "Backend", desc: "The classic minimalist server router library for Node.js. Build lightning-fast JSON API servers with ease." },
    { name: "SQL", icon: "🛢️", category: "Databases", desc: "Structured Query Language. Design relational tables, write efficient data filters, and manage secure transactions." },
    { name: "MongoDB", icon: "🍃", category: "Databases", desc: "NoSQL document database. Store dynamic JSON records effortlessly for high-performance and scalable web apps." },
    { name: "Flutter", icon: "📱", category: "Mobile", desc: "Google's UI software system for compile-native apps on iOS, Android, web, and desktop from a single codebase." },
    { name: "Dart", icon: "🎯", category: "Mobile", desc: "The strongly-typed object-oriented language powering Flutter, optimized for lightning-fast visual graphics." },
    { name: "AI & Machine Learning", icon: "🧠", category: "Advanced", desc: "Connect generative AI endpoints, design prompt frameworks, orchestrate LLM agents, and build intelligent apps." },
    { name: "Git & GitHub", icon: "🐙", category: "DevOps", desc: "Master code branching, merge conflicts, pull requests, and collaborative global open-source software structures." },
    { name: "Data Structures & Algorithms", icon: "🌲", category: "Computer Science", desc: "Crack the coding interview. Master binary trees, sorting algorithms, dynamic paths, arrays, hash maps, and stacks." }
  ],
  language: [
    { name: "English Coach", icon: "🇺🇸", category: "Languages", desc: "Master professional spoken English, vocabulary, corporate communication, and accent reduction." },
    { name: "Spanish Coach", icon: "🇪🇸", category: "Languages", desc: "Learn Spanish conversational fluency, daily vocabulary, grammar rules, and cultural dialects." },
    { name: "French Coach", icon: "🇫🇷", category: "Languages", desc: "Succeed in French pronunciation, basic and advanced vocabulary, expressions, and grammar rules." },
    { name: "German Coach", icon: "🇩🇪", category: "Languages", desc: "Master German word orders, compound nouns, professional greetings, and business communication." },
    { name: "Japanese Coach", icon: "🇯🇵", category: "Languages", desc: "Master Japanese Hiragana, Katakana, Kanji contexts, polite Keigo structures, and conversation." }
  ],
  ai: [
    { name: "Neural Networks & Deep Learning", icon: "🧠", category: "Neural Nets", desc: "Build multi-layer perceptrons, master backpropagation, loss functions, optimization, and weights." },
    { name: "Generative AI & LLMs", icon: "✨", category: "Generative", desc: "Learn to prompt, fine-tune, and orchestrate Large Language Models using modern framework pipelines." },
    { name: "Computer Vision Systems", icon: "👁️", category: "Vision", desc: "Process visual data using Convolutional Neural Networks, object detection, and segmentation." },
    { name: "AI Agent Architectures", icon: "🤖", category: "Agents", desc: "Design self-correcting autonomous multi-agent loops, tool use protocols, and memory hierarchies." }
  ],
  business: [
    { name: "SaaS Startup Fundamentals", icon: "🚀", category: "Entrepreneurship", desc: "Learn how to build, launch, price, and scale high-growth software-as-a-service enterprises." },
    { name: "Venture Capital & Term Sheets", icon: "💼", category: "Finance", desc: "Deconstruct cap tables, dilution formulas, valuation metrics, liquidation preferences, and VC pitches." },
    { name: "Product Management Mastery", icon: "📋", category: "Product", desc: "Master product discovery, prioritization matrices, user journeys, agile sprints, and metrics trackers." },
    { name: "Growth Marketing & Funnels", icon: "📈", category: "Growth", desc: "Design customer acquisition loops, A/B test conversion funnels, and viral optimization parameters." }
  ],
  design: [
    { name: "UI/UX Design Systems", icon: "📐", category: "Product Design", desc: "Build pixel-perfect responsive components, design tokens, and scalable layouts in Figma." },
    { name: "Typography & Visual Craft", icon: "✍️", category: "Aesthetics", desc: "Master type scales, readability rules, pairing strategies, and balanced layout negative space." },
    { name: "Interaction & Motion Design", icon: "🔄", category: "Animation", desc: "Craft engaging micro-interactions, spring transitions, state transformations, and spatial UI paths." }
  ],
  marketing: [
    { name: "SEO & Digital Marketing", icon: "🔍", category: "Acquisition", desc: "Rank high on search engines, run targeted keyword strategies, and write highly converting copy." },
    { name: "Social Media Strategy", icon: "📱", category: "Social", desc: "Orchestrate high-engagement visual campaigns, viral hook formats, and community-building loops." }
  ],
  finance: [
    { name: "Personal Wealth & Investing", icon: "💰", category: "Personal", desc: "Build bulletproof budgets, compound interest engines, tax-sheltered portfolios, and asset allocations." },
    { name: "Financial Modeling & Analysis", icon: "📊", category: "Corporate", desc: "Construct multi-statement Excel/Google Sheets models, discounted cash flows, and scenario matrices." }
  ]
};

export const ALL_COURSES: Course[] = [];

Object.entries(academiesData).forEach(([academyId, coursesList]) => {
  coursesList.forEach((crs) => {
    const code = crs.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    ALL_COURSES.push({
      id: code,
      academyId,
      name: crs.name,
      icon: crs.icon,
      category: crs.category,
      description: crs.desc,
      beginnerLessons: generateLessons(crs.name, code, "beginner"),
      intermediateLessons: generateLessons(crs.name, code, "intermediate"),
      advancedLessons: generateLessons(crs.name, code, "advanced"),
      projects: [
        {
          title: `${crs.name} Beginner Project`,
          description: `Develop a practical foundation project for ${crs.name} that implements core beginner-level principles.`,
          difficulty: "Beginner",
          guidance: [
            "Establish the core functional layout of the system.",
            "Write basic data validations and error trap guards.",
            "Save user state inputs locally inside the local sandbox."
          ]
        },
        {
          title: `${crs.name} Intermediate Challenge`,
          description: `Create an advanced integrated application utilizing API integrations and structured modules.`,
          difficulty: "Intermediate",
          guidance: [
            "Incorporate modular imports and robust file operations.",
            "Implement high-speed asynchronous promise or fetch states.",
            "Add detailed visual data filters and query controllers."
          ]
        },
        {
          title: `${crs.name} Advanced Enterprise System`,
          description: `Construct a professional production-grade enterprise platform utilizing high-performance charting and secure DB storage.`,
          difficulty: "Advanced",
          guidance: [
            "Integrate dynamic charting engines like Recharts or D3.",
            "Build complete data sorting, filtering, and indexing across dynamic records.",
            "Connect user preferences to durable cloud collections."
          ]
        }
      ]
    });
  });
});
