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

export const ALL_COURSES: Course[] = languages.map((lang) => {
  const code = lang.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  return {
    id: code,
    academyId: "coding",
    name: lang.name,
    icon: lang.icon,
    category: lang.category,
    description: lang.desc,
    
    beginnerLessons: [
      {
        id: `${code}-b1`,
        title: `Lesson 1 - Introduction to ${lang.name}`,
        content: `${lang.name} is a highly requested technology in modern software engineering. Used worldwide across global teams, mastering its core syntax and execution flow represents your first step toward professional developer certification. Under the hood, this system parses and executes tasks efficiently, adapting to both simple scripts and massive distributed environments.`,
        quiz: {
          question: `What represents a primary benefit of using ${lang.name}?`,
          options: [
            "It automatically writes all application logic for you with zero manual input",
            "It is highly supported, has rich developer ecosystems, and solves real-world engineering issues",
            "It runs on special hardware only and cannot be installed on standard laptops",
            "It was invented strictly as a minor text editing tool with no logic capabilities"
          ],
          answer: 1,
          explanation: `${lang.name} is standard because of its active community, robust documentation, and practical problem-solving capabilities in commercial engineering.`
        }
      },
      {
        id: `${code}-b2`,
        title: `Lesson 2 - Installing & Setting Up ${lang.name}`,
        content: `Before writing professional statements, you must establish an isolated environment. Install the runtime or framework tools, verify your current active shell versions via your system command terminal with '${lang.name.toLowerCase()} --version', and prepare your primary directory workspace. Running a standard 'Hello, World!' demonstrates full environment viability.`,
        quiz: {
          question: "Why do we verify the installation version using terminal commands?",
          options: [
            "To prove to our ISP that we have internet routing access",
            "To confirm the environment is correctly path-mapped and active for compiling code",
            "To increase the processing power of our core computer hardware",
            "To register our software directly with Microsoft or Google corporate servers"
          ],
          answer: 1,
          explanation: "Running version queries in shell terminals confirms the path environmental parameters are correct and ready for compiler execution."
        }
      },
      {
        id: `${code}-b3`,
        title: "Lesson 3 - Basic Variables and Memory",
        content: "Variables are named storage locations in your computer's RAM. They allow programmers to capture values, perform mathematical operations, and retain system states throughout application execution. Depending on whether your system uses strict static types or dynamic interpreter structures, your declarations will adapt to secure and structured memory slots.",
        quiz: {
          question: "What is the primary role of a variable in software logic?",
          options: [
            "To display colorful graphic styles on external visual monitors",
            "To reserve a secure memory cell in RAM for storing and manipulating data elements",
            "To encrypt the entire source code file before exporting to public folders",
            "To run server-side requests across network protocol environments"
          ],
          answer: 1,
          explanation: "Variables act as labeled containers that reference memory blocks in active RAM, holding data for fast computational usage."
        }
      },
      {
        id: `${code}-b4`,
        title: "Lesson 4 - Advanced Primitive Data Types",
        content: "Data types tell the compiler or runtime environment how to interpret binary data stored in memory. Main categories include numeric data (such as floating-point decimals and standard signed integers), character sequences (commonly referred to as strings), and simple boolean values representing true or false logical states.",
        quiz: {
          question: "Which of these represents a basic Boolean logic value?",
          options: ["A numeric integer like 42", "A true or false state", "An array or list of key-values", "A multi-paragraph text block"],
          answer: 1,
          explanation: "Booleans represent pure binary decisions: positive/negative, yes/no, or true/false."
        }
      },
      {
        id: `${code}-b5`,
        title: "Lesson 5 - Standard Operators and Expressions",
        content: "Operators are special mathematical symbols that manipulate variables and values. Arithmetical operators handle basic calculations (+, -, *, /), comparison operators determine numeric differences (>, <, ==, !=), and logical operators connect multi-conditional paths (and, or, not) to form complex expressions.",
        quiz: {
          question: "What is the result of a comparison operator like (5 > 3)?",
          options: ["The number 8", "A boolean value of true", "A syntax error", "The string '5 is bigger'"],
          answer: 1,
          explanation: "Comparison expressions evaluate to boolean values (true or false) indicating the result of the comparison."
        }
      },
      {
        id: `${code}-b6`,
        title: "Lesson 6 - Conditional Decision Flow",
        content: "Control flow defines the order in which statements are executed. Conditional structures evaluate a boolean expression, directing the execution path into separate branching channels. By utilizing cascading logic, software applications handle user scenarios dynamically rather than executing in a straight vertical line.",
        quiz: {
          question: "How does conditional branching enhance software capabilities?",
          options: [
            "It speeds up compilation by skipping comments",
            "It allows applications to execute different blocks of code depending on variable values",
            "It stores infinite user records in relational database servers",
            "It turns desktop monitors into highly responsive screen layouts"
          ],
          answer: 1,
          explanation: "Conditionals enable the system to make decisions dynamically based on changing user inputs or active data states."
        }
      }
    ],
    
    intermediateLessons: [
      {
        id: `${code}-i1`,
        title: "Lesson 7 - Object-Oriented Principles (OOP)",
        content: "Object-Oriented Programming (OOP) is an engineering paradigm that models software components as real-world objects. Classes act as blueprints, while Objects are real instances. Encapsulation hides private variables, Inheritance shares reusable logic, and Polymorphism lets components adapt to different contexts.",
        quiz: {
          question: "Which OOP concept is responsible for hiding internal variables from outside modification?",
          options: ["Inheritance", "Polymorphism", "Encapsulation", "Compilation"],
          answer: 2,
          explanation: "Encapsulation bundles data and methods together, exposing only what is safe and hiding raw state details."
        }
      },
      {
        id: `${code}-i2`,
        title: "Lesson 8 - Custom Modular Architecture",
        content: "Monolithic, single-file scripts are impossible to maintain at scale. Modular design breaks your software into small, highly cohesive files that communicate across import and export declarations. This allows global engineering teams to divide labor, write unit tests, and maintain clean directory separations.",
        quiz: {
          question: "What is the primary motivation for adopting modular file architectures?",
          options: [
            "To increase file sizes and make compile scripts run longer",
            "To promote reusability, testing, and team-based parallel development",
            "To enforce strict licensing rules on commercial platforms",
            "To prevent standard computers from inspecting our source logic"
          ],
          answer: 1,
          explanation: "Modularity divides complex programs into manageable, reusable chunks, dramatically simplifying testing and team collaboration."
        }
      },
      {
        id: `${code}-i3`,
        title: "Lesson 9 - File Handling & Operating Systems I/O",
        content: "Most practical programs must interact with local or remote file systems. This intermediate section explores opening streams, writing textual or binary contents, and closing handles cleanly. Utilizing context managers is essential to prevent system resource leaks or blocking thread states.",
        quiz: {
          question: "Why must file handles be closed after operations complete?",
          options: [
            "To clear the computer's motherboard BIOS memory",
            "To release operating system locks and prevent memory/resource leaks",
            "To verify our user permissions with cloud cloud providers",
            "To encrypt the documents inside the local user download folders"
          ],
          answer: 1,
          explanation: "Open file handles consume file descriptors in the OS kernel. Closing them releases those descriptors, avoiding file access locks."
        }
      },
      {
        id: `${code}-i4`,
        title: "Lesson 10 - Robust Exception Handling & Defensive Coding",
        content: "Errors are an inevitable reality of production software. Rather than allowing your app to crash, exception blocks catch runtime errors gracefully. By using try, catch, and finally expressions, you can log exceptions, clear temporary database buffers, and present friendly instructions to the end-user.",
        quiz: {
          question: "What is the main role of a 'finally' block in exception handling?",
          options: [
            "To execute statements ONLY if an error actually happens",
            "To guarantee cleanup code runs regardless of whether an error was raised or caught",
            "To stop the program immediately and report to global admins",
            "To compile the source files into standalone machine instructions"
          ],
          answer: 1,
          explanation: "A finally block always runs at the end of exception processing, making it the perfect spot for closing connections or releasing files."
        }
      }
    ],
    
    advancedLessons: [
      {
        id: `${code}-a1`,
        title: "Lesson 11 - Functional Paradigms, Decorators, and Generators",
        content: "Advanced development leverages elegant abstractions. Decorators wrap other functions to inject telemetry, authentication, or caching dynamically without modifying original definitions. Meanwhile, Generators yield values lazily, enabling apps to stream gigabytes of files without overloading RAM.",
        quiz: {
          question: "How do Generators differ from standard Array return values?",
          options: [
            "They double the execution speed of computer systems",
            "They evaluate and yield values lazily one at a time, conserving huge amounts of RAM",
            "They require relational database integrations to process simple values",
            "They cannot be modified once they are imported into other scripts"
          ],
          answer: 1,
          explanation: "Generators return iterators that produce values on demand (yield) rather than instantiating entire collections in memory."
        }
      },
      {
        id: `${code}-a2`,
        title: "Lesson 12 - Advanced Asynchronous Programming Models",
        content: "Modern environments are heavily network-bound. Waiting synchronously for database queries or API payloads blocks execution threads, freezing user interfaces. Asynchronous engines handle thousands of concurrent transactions using event loops, promises, callbacks, and simple async/await syntaxes.",
        quiz: {
          question: "What does asynchronous programming resolve?",
          options: [
            "It allows the CPU to process basic mathematical formulas twice as fast",
            "It prevents I/O-bound tasks from blocking the primary execution thread",
            "It secures local files against cyber threats and database errors",
            "It translates raw coding statements into different languages"
          ],
          answer: 1,
          explanation: "Async programming delegates slow I/O tasks to background processes, allowing the main runtime thread to keep processing other actions."
        }
      },
      {
        id: `${code}-a3`,
        title: "Lesson 13 - Developing High-Performance API Systems",
        content: "Connect your systems to the world. Architect robust REST or GraphQL API servers that communicate structured JSON messages securely. Implement route parameters, robust request validations, custom middlewares, and secure access headers to ensure your services run with extreme reliability under load.",
        quiz: {
          question: "What is the standard format for exchanging data in modern web APIs?",
          options: ["Raw plain text blocks", "JSON (JavaScript Object Notation)", "Microsoft Word documents", "Compiled bytecode executables"],
          answer: 1,
          explanation: "JSON is the universal, lightweight, human-readable standard format used to serialize structured data across internet APIs."
        }
      },
      {
        id: `${code}-a4`,
        title: "Lesson 14 - Capstone Project Architecture & Interview Preparation",
        content: "Combine all lessons into a professional capstone system. This final lesson guides you through constructing a robust, scalable, and fully tested production application. We will also analyze common senior technical interview algorithms, system architecture design problems, and best coding practices.",
        quiz: {
          question: "What is a major focus during system architecture interviews?",
          options: [
            "Proving you can type code faster than any other candidate",
            "Demonstrating scalability, modular separations, error handling, and logical reasoning",
            "Memorizing every single built-in keyword of a language",
            "Writing entire applications in a single monolithic script"
          ],
          answer: 1,
          explanation: "Interviewers look for robust architecture, clean coding practices, and structured problem-solving under scale and load."
        }
      }
    ],
    
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
