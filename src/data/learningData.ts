import { Course, CourseCategory } from "../types/learning";
import { buildCourseCurriculum } from "./curriculumGenerator";

export const CATEGORIES: { name: CourseCategory; icon: string; description: string; color: string }[] = [
  {
    name: "Programming Languages",
    icon: "Code2",
    description: "Master Python, JS, TS, Java, C++, C#, Rust, Go, Kotlin, Swift, Dart, and PHP.",
    color: "from-blue-600 to-indigo-700"
  },
  {
    name: "AI Engineering",
    icon: "BrainCircuit",
    description: "Build LLM applications, RAG pipelines, fine-tuning, Neural Nets, and AI Agents.",
    color: "from-violet-600 to-purple-800"
  },
  {
    name: "Web Development",
    icon: "Globe",
    description: "HTML, CSS, React, Next.js, Modern Backend, Databases, and Full Stack Architecture.",
    color: "from-cyan-600 to-blue-700"
  },
  {
    name: "App Development",
    icon: "Smartphone",
    description: "Android, iOS Native, Flutter, and React Native mobile app development.",
    color: "from-emerald-600 to-teal-700"
  },
  {
    name: "Business Courses",
    icon: "Briefcase",
    description: "Entrepreneurship, Growth Marketing, Branding, E-commerce, Sales, and Startups.",
    color: "from-amber-600 to-orange-700"
  },
  {
    name: "Other Skills",
    icon: "ShieldCheck",
    description: "English, Communication, UI/UX Design, Cybersecurity, Cloud, and Data Science.",
    color: "from-rose-600 to-pink-700"
  }
];

// Blueprints for all requested courses
const ALL_COURSE_BLUEPRINTS = [
  // --- 1. PROGRAMMING LANGUAGES (12 Courses) ---
  {
    id: "py-course",
    name: "Python Programming Masterclass",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Complete Python track from syntax basics to async, OOP, and systems design.",
    fullDescription: "Master Python 3 with 100 structured classes covering fundamentals, object-oriented design, async IO, metaprogramming, and enterprise development.",
    courseGoal: "Become a proficient Python software engineer capable of writing enterprise-grade scripts, backends, and data tools.",
    requiredLevel: "Beginner to Advanced (All Levels)",
    icon: "Terminal",
    gradientColor: "from-blue-600 to-cyan-600",
    rating: 4.9,
    enrolledCount: 2400,
    estimatedHours: 40,
    keyTopics: {
      beginner: ["Syntax & Variables", "Control Flow & Conditionals", "Functions & Scope", "Data Structures (Lists, Dicts, Sets)", "File I/O & Modules"],
      intermediate: ["Object-Oriented Programming", "Decorators & Generators", "Error & Exception Handling", "Iterators & Context Managers", "Modules & Package Management"],
      advanced: ["Asynchronous Programming (asyncio)", "Metaprogramming & Type Hints", "Concurrency & Multiprocessing", "Memory Management & CExtensions", "Performance Optimization"],
      extra: ["Building CLI Frameworks", "Production Code Quality & Testing", "Enterprise Architecture Case Studies"]
    }
  },
  {
    id: "js-course",
    name: "JavaScript Modern & Core Mechanics",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "ES6+, event loops, closures, prototypes, async/await, and browser DOM engine.",
    fullDescription: "Deep dive into JavaScript engine execution, call stack, V8 memory models, async patterns, ESNext features, and event loop mechanics.",
    courseGoal: "Master JavaScript's asynchronous nature, prototypes, and event-driven architecture.",
    requiredLevel: "Beginner to Advanced",
    icon: "Code2",
    gradientColor: "from-yellow-500 to-amber-600",
    rating: 4.88,
    enrolledCount: 3100,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["JS Basics & Variables", "Functions & Scope Chains", "Arrays & Objects Manipulation", "DOM Manipulation Basics", "Event Listeners"],
      intermediate: ["Closures & Lexical Scope", "Prototypal Inheritance", "Promises & Async/Await", "Fetch API & Network Handling", "ES6+ Modern Syntax"],
      advanced: ["Event Loop & Microtask Queue", "V8 Engine Memory & Garbage Collection", "Web Workers & Parallelism", "Design Patterns in JS", "Custom Modules & Bundlers"],
      extra: ["Build a JavaScript Engine Sandbox", "Performance Profiling in Chrome DevTools"]
    }
  },
  {
    id: "ts-course",
    name: "TypeScript Enterprise Engineering",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Static typing, generics, utility types, conditional types, and strict mode.",
    fullDescription: "Scale JavaScript applications safely with TypeScript's powerful type system, generics, type guards, and design patterns.",
    courseGoal: "Build type-safe, error-free full-stack applications with advanced TypeScript design.",
    requiredLevel: "Intermediate",
    icon: "FileCode",
    gradientColor: "from-blue-500 to-indigo-600",
    rating: 4.92,
    enrolledCount: 1950,
    estimatedHours: 35,
    keyTopics: {
      beginner: ["Basic Types & Interfaces", "Type Aliases vs Interfaces", "Functions & Optional Parameters", "Literal Types & Enums", "Compiler Configuration"],
      intermediate: ["Generics & Type Constraints", "Utility Types (Partial, Record, Readonly)", "Type Guards & Narrowing", "Union & Intersection Types", "Decorators"],
      advanced: ["Conditional Types & Infer", "Mapped Types & Keyof Operators", "Template Literal Types", "Monorepo Setup with TS", "Strict Mode Optimizations"],
      extra: ["Building Type-Safe API Client Libraries", "Compiler AST Transformations"]
    }
  },
  {
    id: "java-course",
    name: "Java Platform & Enterprise Software",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "JVM internals, Spring Boot, OOP design patterns, and concurrency.",
    fullDescription: "Comprehensive Java development path covering core JVM memory models, multithreading, Spring framework, and enterprise backends.",
    courseGoal: "Master enterprise Java development, JVM tuning, and high-concurrency microservices.",
    requiredLevel: "Beginner to Advanced",
    icon: "Coffee",
    gradientColor: "from-orange-600 to-red-600",
    rating: 4.85,
    enrolledCount: 1620,
    estimatedHours: 42,
    keyTopics: {
      beginner: ["Java Syntax & Object Fundamentals", "Classes, Interfaces & Packages", "Collections Framework", "Exception Handling", "File Streams & I/O"],
      intermediate: ["Java Lambdas & Streams API", "Concurrency & Thread Pools", "Maven/Gradle Build Tools", "JDBC & Database Connectivity", "Design Patterns"],
      advanced: ["JVM Memory Management & Garbage Collection", "Spring Boot Microservices", "Spring Security & OAuth", "Reactive Java (Project Reactor)", "Performance Benchmarking"],
      extra: ["Building Fault-Tolerant Distributed Backends", "Java Native Image (GraalVM)"]
    }
  },
  {
    id: "cpp-course",
    name: "C++ Systems & Memory Architecture",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Pointers, memory management, STL, template metaprogramming, and C++20.",
    fullDescription: "Master low-level programming with C++, covering pointer arithmetic, manual memory management, RAII, move semantics, and STL containers.",
    courseGoal: "Engineer ultra-fast, low-latency applications with hardware-level memory control.",
    requiredLevel: "Intermediate to Advanced",
    icon: "Cpu",
    gradientColor: "from-blue-700 to-slate-800",
    rating: 4.91,
    enrolledCount: 1100,
    estimatedHours: 45,
    keyTopics: {
      beginner: ["Variables, Data Types & Pointers", "References & Memory Layout", "Functions & Pass-by-Value/Ref", "Arrays & C-Strings", "Structs & Basic Classes"],
      intermediate: ["RAII & Smart Pointers", "Move Semantics & Rvalue References", "Standard Template Library (STL)", "Operator Overloading", "File I/O"],
      advanced: ["Template Metaprogramming", "Multithreading & Atomics", "C++20 Concepts & Coroutines", "Memory Profiling & Valgrind", "Custom Memory Allocators"],
      extra: ["Building High-Frequency Trading Engines", "Game Engine Subsystems"]
    }
  },
  {
    id: "cs-course",
    name: "C# & .NET Core Backend Systems",
    category: "Programming Languages" as CourseCategory,
    shortDescription: ".NET 8, LINQ, Async/Await, ASP.NET Core, and Entity Framework.",
    fullDescription: "Master modern C# and .NET Core to create high-performance Web APIs, microservices, and cross-platform backend services.",
    courseGoal: "Build enterprise Web APIs and distributed backends using C# and .NET.",
    requiredLevel: "Beginner to Advanced",
    icon: "Code",
    gradientColor: "from-purple-600 to-indigo-800",
    rating: 4.87,
    enrolledCount: 1340,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["C# Syntax & Type System", "Classes, Records & Structs", "Methods & Parameter Modifiers", "Collections & Generics", "Exception Handling"],
      intermediate: ["LINQ Data Queries", "Async/Await Execution Flow", "ASP.NET Core Web API", "Entity Framework Core ORM", "Dependency Injection"],
      advanced: ["gRPC Services in .NET", "Middleware Architecture", "Memory<T> & Span<T> Optimization", "Microservices with SignalR", "Unit Testing & XUnit"],
      extra: ["Building High-Throughput Event Streams", "Cloud Native .NET Deployments"]
    }
  },
  {
    id: "kt-course",
    name: "Kotlin Modern Android & Server-Side",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Coroutines, Null Safety, Jetpack Compose, and Ktor server framework.",
    fullDescription: "Master Kotlin for clean Android app development and concise server-side programming with Coroutines and Compose.",
    courseGoal: "Build modern Android applications and reactive backends with Kotlin.",
    requiredLevel: "Beginner to Advanced",
    icon: "Smartphone",
    gradientColor: "from-purple-500 to-pink-600",
    rating: 4.89,
    enrolledCount: 1450,
    estimatedHours: 36,
    keyTopics: {
      beginner: ["Kotlin Syntax & Null Safety", "Functions & Extension Functions", "Data Classes & Sealed Classes", "Control Flow & Expressions", "Collections & Transformations"],
      intermediate: ["Kotlin Coroutines & Flow", "Delegates & High-Order Functions", "Ktor HTTP Client", "Android Jetpack Integration", "State Management"],
      advanced: ["DSL Creation in Kotlin", "Multiplatform Development (KMP)", "Concurrent Flow Pipelines", "Memory Profiling", "Reflection & Annotations"],
      extra: ["Full-Stack Kotlin with Ktor & Compose Multiplatform"]
    }
  },
  {
    id: "swift-course",
    name: "Swift & iOS Native Development",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "SwiftUI, Swift Concurrency, Combine, CoreData, and iOS App Store architecture.",
    fullDescription: "Learn native iOS app development with Swift 5+, SwiftUI, async concurrency, and clean architecture patterns.",
    courseGoal: "Build polished, responsive iOS applications ready for the Apple App Store.",
    requiredLevel: "Beginner to Advanced",
    icon: "Apple",
    gradientColor: "from-orange-500 to-red-500",
    rating: 4.93,
    enrolledCount: 1780,
    estimatedHours: 40,
    keyTopics: {
      beginner: ["Swift Syntax & Optionals", "Structs vs Classes", "Control Flow & Enums", "Functions & Closures", "Protocols & Extensions"],
      intermediate: ["SwiftUI Layout Engine", "State & Environment Objects", "Swift Concurrency (async/await)", "URLSession & REST API Integration", "CoreData & SwiftData"],
      advanced: ["Combine Reactive Framework", "Custom SwiftUI Modifiers & Animations", "Modular Architecture & SPM", "App Performance Tuning", "XCTest & UI Testing"],
      extra: ["Publishing to Apple App Store", "WidgetKit & Live Activities"]
    }
  },
  {
    id: "dart-course",
    name: "Dart Programming & Reactive Systems",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Sound null safety, streams, isolates, asynchronous programming, and Flutter core.",
    fullDescription: "Deep dive into Dart language constructs powering cross-platform mobile, desktop, and web applications.",
    courseGoal: "Master Dart language mechanics and reactive asynchronous streams.",
    requiredLevel: "Beginner to Intermediate",
    icon: "Zap",
    gradientColor: "from-teal-500 to-blue-600",
    rating: 4.82,
    enrolledCount: 1120,
    estimatedHours: 30,
    keyTopics: {
      beginner: ["Dart Syntax & Null Safety", "Functions & Named Arguments", "Classes & Mixins", "Collections & Generics", "Control Flow"],
      intermediate: ["Futures & Async/Await", "Streams & StreamControllers", "Isolates & Multithreading", "Dart Packages & Pub.dev", "Functional Dart Patterns"],
      advanced: ["Custom Code Generators & Macros", "Dart FFI (C-Interoperability)", "Memory Benchmarking", "Server-Side Dart Frameworks", "Reflection"],
      extra: ["Building Native CLI Utilities with Dart"]
    }
  },
  {
    id: "php-course",
    name: "PHP Modern 8+ & Laravel Architecture",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "PHP 8 Attributes, JIT compiler, Laravel 11 framework, and REST APIs.",
    fullDescription: "Learn modern object-oriented PHP 8+, PSR standards, and build scalable Web applications with Laravel.",
    courseGoal: "Engineer full-stack Web applications using modern PHP and Laravel.",
    requiredLevel: "Beginner to Advanced",
    icon: "Server",
    gradientColor: "from-indigo-600 to-purple-700",
    rating: 4.79,
    enrolledCount: 1510,
    estimatedHours: 34,
    keyTopics: {
      beginner: ["PHP 8 Syntax & Type Declarations", "Functions & Arrays Manipulation", "Object-Oriented PHP Basics", "Composer Package Manager", "Form Handling & Security"],
      intermediate: ["Laravel Framework Core Concepts", "Eloquent ORM & Migrations", "Routing & Middleware", "Authentication & Sanctum APIs", "Blade & Livewire"],
      advanced: ["Queues, Jobs & Redis Integration", "Custom Service Providers", "PHP JIT Tuning", "RESTful API Best Practices", "PHPUnit Automated Testing"],
      extra: ["Deploying Laravel Applications with Docker & Forge"]
    }
  },
  {
    id: "go-course",
    name: "Go (Golang) Cloud Systems & Concurrency",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Goroutines, channels, interfaces, microservices, and Docker/K8s tooling.",
    fullDescription: "Master Golang for building cloud-native infrastructure, high-throughput microservices, and concurrent networking tools.",
    courseGoal: "Build blazing-fast distributed systems and microservices with Go.",
    requiredLevel: "Beginner to Advanced",
    icon: "Box",
    gradientColor: "from-cyan-500 to-blue-600",
    rating: 4.95,
    enrolledCount: 2200,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["Go Syntax & Data Types", "Structs, Pointers & Receivers", "Functions & Error Return Values", "Slices & Maps", "Packages & Modules"],
      intermediate: ["Interfaces & Implicit Satisfaction", "Goroutines & Channels", "Select Statement & Concurrency Patterns", "Standard HTTP Library", "JSON Encoding"],
      advanced: ["Context Package & Deadlines", "gRPC & Protocol Buffers", "Memory Management & Pprof Profiling", "Distributed Systems in Go", "Custom CLI Engines"],
      extra: ["Building Kubernetes Operators in Go"]
    }
  },
  {
    id: "rust-course",
    name: "Rust Systems Programming & Memory Safety",
    category: "Programming Languages" as CourseCategory,
    shortDescription: "Ownership, borrowing, lifetimes, async Tokio, and WebAssembly.",
    fullDescription: "Master Rust's zero-cost abstractions, borrow checker, memory safety without garbage collection, and async ecosystem.",
    courseGoal: "Engineer memory-safe, ultra-high-performance systems and WebAssembly modules.",
    requiredLevel: "Intermediate to Advanced",
    icon: "Shield",
    gradientColor: "from-amber-700 to-stone-900",
    rating: 4.96,
    enrolledCount: 1850,
    estimatedHours: 42,
    keyTopics: {
      beginner: ["Ownership, Borrowing & References", "Structs & Enums", "Pattern Matching with Match", "Error Handling (Result/Option)", "Cargo Package Manager"],
      intermediate: ["Lifetimes & Generics", "Traits & Trait Objects", "Iterators & Closures", "Smart Pointers (Box, Rc, Arc)", "Module Organization"],
      advanced: ["Async Rust with Tokio", "Unsafe Rust & FFI", "Macro Programming (Declarative & Procedural)", "WebAssembly (Wasm) Integration", "Zero-Copy Parsing"],
      extra: ["Building Blockchain Protocols / High-Performance Servers in Rust"]
    }
  },

  // --- 2. AI ENGINEERING (8 Courses) ---
  {
    id: "ai-fund-course",
    name: "AI Engineering Fundamentals",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "Mathematics for AI, vector spaces, regression, classification, and neural nets.",
    fullDescription: "Foundational entry into Artificial Intelligence covering linear algebra, probability, loss functions, optimization algorithms, and core model architectures.",
    courseGoal: "Gain a complete mathematical and practical foundation in Artificial Intelligence.",
    requiredLevel: "Beginner",
    icon: "BrainCircuit",
    gradientColor: "from-violet-600 to-indigo-800",
    rating: 4.91,
    enrolledCount: 3400,
    estimatedHours: 35,
    keyTopics: {
      beginner: ["Introduction to AI & Data Pipelines", "Vectors, Matrices & Linear Algebra", "Probability & Statistics Basics", "Supervised vs Unsupervised Learning", "Loss Functions & Optimization"],
      intermediate: ["Gradient Descent Algorithms", "Feature Engineering & Scaling", "Classification & Regression Models", "Model Evaluation Metrics (Precision, Recall, F1)", "Overfitting & Regularization"],
      advanced: ["Introduction to Neural Networks", "Backpropagation Calculus", "Tensor Operations with NumPy/PyTorch", "Hyperparameter Tuning", "AI Ethics & Safety"],
      extra: ["Building a Neural Network from Scratch in Plain Code"]
    }
  },
  {
    id: "ml-course",
    name: "Machine Learning Engineering in Production",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "Scikit-Learn, XGBoost, MLOps, feature stores, model deployment, and tracking.",
    fullDescription: "End-to-end Machine Learning path from data preprocessing and model training to automated MLOps deployment pipelines.",
    courseGoal: "Train, evaluate, and deploy production machine learning models at scale.",
    requiredLevel: "Beginner to Advanced",
    icon: "Activity",
    gradientColor: "from-purple-600 to-blue-700",
    rating: 4.88,
    enrolledCount: 2600,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["Data Cleaning & Preprocessing", "Scikit-Learn Pipeline Design", "Decision Trees & Random Forests", "Cross-Validation Techniques", "Handling Missing Data"],
      intermediate: ["Gradient Boosting with XGBoost/LightGBM", "Feature Engineering & Selection", "Unsupervised Clustering (K-Means, PCA)", "MLflow Model Experiment Tracking", "FastAPI Model Serving"],
      advanced: ["MLOps & Automated Retraining Pipelines", "Feature Stores (Feast)", "Model Monitoring & Drift Detection", "Data Pipeline Automation", "Model Compression & Quantization"],
      extra: ["Building Production Real-Time Fraud Detection ML Pipeline"]
    }
  },
  {
    id: "dl-course",
    name: "Deep Learning & Neural Networks",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "PyTorch, CNNs, RNNs, Transformers, GPU acceleration, and TensorBoard.",
    fullDescription: "Master deep neural networks with PyTorch, covering computer vision (CNNs), sequence modeling (RNNs/LSTMs), and Transformer backbones.",
    courseGoal: "Design, train, and fine-tune complex deep learning models using PyTorch.",
    requiredLevel: "Intermediate to Advanced",
    icon: "Layers",
    gradientColor: "from-indigo-600 to-violet-900",
    rating: 4.93,
    enrolledCount: 2100,
    estimatedHours: 40,
    keyTopics: {
      beginner: ["PyTorch Tensors & Autograd", "Multi-Layer Perceptrons (MLP)", "Activation Functions & Loss Functions", "DataLoader & Dataset Utilities", "GPU Acceleration Setup"],
      intermediate: ["Convolutional Neural Networks (CNNs)", "Transfer Learning (ResNet, EfficientNet)", "Recurrent Neural Networks (RNN/LSTM)", "Attention Mechanisms", "Hyperparameter Search"],
      advanced: ["Transformer Architecture Details", "Distributed Data Parallel Training", "Generative Adversarial Networks (GANs)", "Model Distillation", "ONNX Model Export"],
      extra: ["Training a Custom Transformer Model for Language Translation"]
    }
  },
  {
    id: "genai-course",
    name: "Generative AI & Multimodal Models",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "Diffusion models, multimodal AI, audio synthesis, text-to-image, and Gemini.",
    fullDescription: "Explore state-of-the-art Generative AI across text, image, audio, and video modalities using modern foundation models.",
    courseGoal: "Build innovative applications leveraging Generative AI and multimodal synthesis.",
    requiredLevel: "Intermediate",
    icon: "Sparkles",
    gradientColor: "from-pink-600 to-purple-800",
    rating: 4.94,
    enrolledCount: 3800,
    estimatedHours: 32,
    keyTopics: {
      beginner: ["Generative AI Ecosystem Overview", "Prompt Tuning & Conditioned Generation", "Text-to-Image Diffusion Mechanics", "Multimodal Input Processing", "API Integration Basics"],
      intermediate: ["Stable Diffusion & ControlNet", "Image Inpainting & Outpainting", "Audio Generation & Speech Models", "Multimodal Embeddings (CLIP)", "Synthetic Data Generation"],
      advanced: ["Fine-Tuning Diffusion Models (LoRA)", "Custom Pipeline Orchestration", "Safety & Watermarking Techniques", "Latency Optimization for GenAI", "Real-Time Streaming Systems"],
      extra: ["Building an AI Multimodal Content Creation Studio"]
    }
  },
  {
    id: "llm-course",
    name: "LLM Systems & RAG Architecture",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "Vector search, dense embeddings, semantic retrieval, RAG, and fine-tuning.",
    fullDescription: "Build production Large Language Model applications, vector database indexes, RAG pipelines, semantic caching, and evaluation metrics.",
    courseGoal: "Architect enterprise RAG systems and domain-adapted LLM platforms.",
    requiredLevel: "Advanced",
    icon: "Database",
    gradientColor: "from-violet-600 to-cyan-700",
    rating: 4.97,
    enrolledCount: 4100,
    estimatedHours: 42,
    keyTopics: {
      beginner: ["LLM Architecture & Tokenization", "Dense Vector Embeddings", "Vector Databases (Pinecone, Qdrant, Chroma)", "Cosine Similarity & Indexing", "Basic RAG Pipeline Setup"],
      intermediate: ["Advanced Chunking Strategies", "Hybrid Keyword + Vector Search", "Reranking Retrieved Context", "Context Window Management", "Structured JSON Outputs"],
      advanced: ["PEFT & LoRA Fine-Tuning", "Semantic Caching & Cost Reduction", "RAG Evaluation Frameworks (Ragas)", "Guardrails & Hallucination Suppression", "LLM Fine-Tuning on Custom Corpus"],
      extra: ["Building Enterprise Knowledge Search System for Fortune 500"]
    }
  },
  {
    id: "pe-course",
    name: "Prompt Engineering & System Instruction",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "Chain-of-Thought, Few-shot, ReAct, System Instruction design, and output constraints.",
    fullDescription: "Master prompt orchestration to control AI model outputs, eliminate hallucinations, enforce structured JSON schemas, and automate workflows.",
    courseGoal: "Design robust, deterministic system prompts for production AI applications.",
    requiredLevel: "Beginner to Intermediate",
    icon: "Terminal",
    gradientColor: "from-fuchsia-600 to-violet-700",
    rating: 4.89,
    enrolledCount: 2900,
    estimatedHours: 25,
    keyTopics: {
      beginner: ["System Prompt vs User Prompt", "Zero-Shot & Few-Shot Prompting", "Role & Persona Setting", "Formatting Outputs with Markdown/JSON", "Handling Edge Cases"],
      intermediate: ["Chain-of-Thought (CoT) Prompting", "Self-Consistency & Reasoning Trees", "ReAct (Reason + Act) Framework", "Prompt Templating Engines", "Negative Prompting"],
      advanced: ["Automated Prompt Optimization", "Adversarial Prompt Injection Defense", "Structured Schema Validation", "Context Compression", "Multi-Prompt Chains"],
      extra: ["Building a Prompt Optimization & Evaluation Sandbox"]
    }
  },
  {
    id: "agents-course",
    name: "Autonomous AI Agents & Tool Calling",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "Function calling, multi-agent collaboration, stateful memory, and planning.",
    fullDescription: "Engineer autonomous AI agents capable of tool usage, API execution, multi-step reasoning loops, memory storage, and task orchestration.",
    courseGoal: "Build self-governing multi-agent systems that perform real-world tasks automatically.",
    requiredLevel: "Advanced",
    icon: "Bot",
    gradientColor: "from-purple-700 to-indigo-900",
    rating: 4.96,
    enrolledCount: 3200,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["Agent Architecture Concepts", "Function Calling & Tool Schema Design", "Agent Loop (Observation -> Thought -> Action)", "Memory Management (Short/Long term)", "Basic Tool Binding"],
      intermediate: ["Multi-Agent Coordination", "Stateful Workflow Engines", "Web Search & Code Execution Tools", "Error Recovery & Fallback Tactics", "Human-in-the-Loop Supervision"],
      advanced: ["Autonomous Planning Algorithms", "Hierarchical Agent Swarms", "Tool Safety & Execution Sandboxes", "Agent Evaluation Benchmarks", "Distributed Agent Systems"],
      extra: ["Building an Autonomous Software Development AI Agent"]
    }
  },
  {
    id: "ai-api-course",
    name: "AI API Development & Model Serving",
    category: "AI Engineering" as CourseCategory,
    shortDescription: "FastAPI, vLLM, streaming responses, rate limiting, and GPU server deployments.",
    fullDescription: "Build high-throughput, low-latency API backends to serve AI models with Server-Sent Events (SSE) streaming, token rate limiting, and GPU scaling.",
    courseGoal: "Deploy secure, scalable production API gateways for AI model inference.",
    requiredLevel: "Intermediate to Advanced",
    icon: "Cpu",
    gradientColor: "from-indigo-600 to-cyan-600",
    rating: 4.86,
    enrolledCount: 1800,
    estimatedHours: 30,
    keyTopics: {
      beginner: ["FastAPI Framework Fundamentals", "Async Request Handlers", "Pydantic Schema Validation", "API Key Authentication", "CORS & Error Handling"],
      intermediate: ["Streaming Text Responses (SSE)", "Integrating Google Gemini & OpenAI SDKs", "Rate Limiting & Token Buckets", "Caching AI Responses with Redis", "Background Worker Queues"],
      advanced: ["Serving Open Source LLMs with vLLM/TGI", "GPU Instance Scaling on Cloud", "Load Balancing Inference Requests", "Telemetry & Latency Monitoring", "Security Auditing AI APIs"],
      extra: ["Deploying Global Production AI Gateway Architecture"]
    }
  },

  // --- 3. WEB DEVELOPMENT (8 Courses) ---
  {
    id: "html-course",
    name: "HTML5 Semantic Web Architecture",
    category: "Web Development" as CourseCategory,
    shortDescription: "Semantic markup, accessibility (a11y), DOM structure, SEO, and web forms.",
    fullDescription: "Master HTML5 semantics, accessible web design (WCAG), metadata optimization, microdata, and structured document standards.",
    courseGoal: "Create perfectly structured, accessible, and SEO-optimized HTML documents.",
    requiredLevel: "Beginner",
    icon: "Layout",
    gradientColor: "from-orange-500 to-amber-600",
    rating: 4.81,
    enrolledCount: 2900,
    estimatedHours: 20,
    keyTopics: {
      beginner: ["HTML Document Structure", "Headings, Paragraphs & Text Formatting", "Links, Images & Assets", "Lists & Tables", "Forms & Input Types"],
      intermediate: ["Semantic HTML5 Elements", "ARIA Roles & Accessibility (a11y)", "Media Elements (Audio & Video)", "HTML5 Canvas Basics", "Web Storage API"],
      advanced: ["SEO Meta Tags & OpenGraph Data", "Structured Data (Schema.org / JSON-LD)", "Shadow DOM & Custom Elements", "Iframe Security & Sandbox", "Web Components"],
      extra: ["Auditing Web Accessibility to Pass WCAG 2.1 AAA Standards"]
    }
  },
  {
    id: "css-course",
    name: "CSS3, Flexbox, Grid & Modern Styling",
    category: "Web Development" as CourseCategory,
    shortDescription: "Flexbox, CSS Grid, animations, Tailwind CSS, responsive design, and CSS variables.",
    fullDescription: "Master modern layout engines with Flexbox and CSS Grid, fluid typography, animations, Tailwind CSS, and component design systems.",
    courseGoal: "Build responsive, beautiful user interfaces with modern CSS.",
    requiredLevel: "Beginner to Intermediate",
    icon: "Palette",
    gradientColor: "from-cyan-500 to-blue-600",
    rating: 4.87,
    enrolledCount: 3100,
    estimatedHours: 32,
    keyTopics: {
      beginner: ["CSS Selectors & Specificity", "Box Model & Sizing Rules", "Colors, Fonts & Typography", "Flexbox Layout Mechanics", "Responsive Media Queries"],
      intermediate: ["CSS Grid Deep Dive", "Transitions & Keyframe Animations", "CSS Custom Properties (Variables)", "Tailwind CSS Utility Design", "Custom Scrollbars & Overlays"],
      advanced: ["Container Queries & Subgrid", "CSS Architecture (BEM, Utility-First)", "Performance & Repaint/Reflow Tuning", "3D Transforms & Perspective", "Dark Mode Theming Strategies"],
      extra: ["Building a Bespoke Responsive UI Component Library"]
    }
  },
  {
    id: "web-js-course",
    name: "Web JavaScript & DOM Manipulation",
    category: "Web Development" as CourseCategory,
    shortDescription: "Event handling, Async DOM updates, Fetch API, LocalStorage, and Web APIs.",
    fullDescription: "Learn to make websites dynamic and interactive with vanilla JavaScript DOM manipulation, event delegation, and asynchronous network requests.",
    courseGoal: "Master front-end JavaScript for dynamic interactive web interfaces.",
    requiredLevel: "Beginner to Intermediate",
    icon: "Globe",
    gradientColor: "from-amber-500 to-yellow-600",
    rating: 4.85,
    enrolledCount: 2800,
    estimatedHours: 30,
    keyTopics: {
      beginner: ["Selecting & Modifying Elements", "Handling User Click/Input Events", "Dynamic Element Creation", "Form Validation with JS", "Basic Timers & Intervals"],
      intermediate: ["Event Delegation & Bubbling", "Fetch API & Async Data Rendering", "LocalStorage & SessionStorage", "Intersection Observer API", "Custom Event Dispatching"],
      advanced: ["Virtual DOM Concepts", "Drag & Drop API Integration", "IndexedDB Client Database", "Performance Benchmarking DOM Operations", "Single Page App Routing in Plain JS"],
      extra: ["Building an Interactive Client Dashboard Without Frameworks"]
    }
  },
  {
    id: "react-course",
    name: "React 19 & Component Architecture",
    category: "Web Development" as CourseCategory,
    shortDescription: "JSX, Hooks (useState, useEffect, useMemo), Context API, and state management.",
    fullDescription: "Master modern React 19 component architecture, custom hooks, state optimization, context providers, and UI performance.",
    courseGoal: "Build high-performance, modular React applications.",
    requiredLevel: "Intermediate",
    icon: "Atom",
    gradientColor: "from-cyan-600 to-indigo-700",
    rating: 4.95,
    enrolledCount: 4500,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["JSX Syntax & Component Basics", "Props & State Management", "Event Handling in React", "Rendering Lists & Keys", "Conditional Rendering"],
      intermediate: ["Essential React Hooks (useState, useEffect, useRef)", "Custom Hooks Creation", "Context API & Global State", "Form Handling & Validation", "Component Composition"],
      advanced: ["React 19 Actions & Optimistic UI", "Performance Tuning (useMemo, useCallback)", "Code Splitting & React.lazy", "Error Boundaries", "State Machines with XState"],
      extra: ["Building a Production Enterprise Dashboard in React"]
    }
  },
  {
    id: "nextjs-course",
    name: "Full-Stack Next.js 15 App Router",
    category: "Web Development" as CourseCategory,
    shortDescription: "Server Components, Server Actions, Dynamic Routing, SSR, and ISR.",
    fullDescription: "Build production full-stack web applications with Next.js 15 App Router, React Server Components, Server Actions, and database integration.",
    courseGoal: "Master full-stack web development with Next.js 15.",
    requiredLevel: "Intermediate to Advanced",
    icon: "Zap",
    gradientColor: "from-slate-800 to-black",
    rating: 4.96,
    enrolledCount: 3900,
    estimatedHours: 40,
    keyTopics: {
      beginner: ["App Router Directory Structure", "Pages, Layouts & Templates", "Client vs Server Components", "Link & Image Components", "Basic API Routes"],
      intermediate: ["React Server Components (RSC) Deep Dive", "Server Actions for Mutations", "Data Fetching & Caching Strategies", "Dynamic Routes & Query Params", "NextAuth / OAuth Integration"],
      advanced: ["Incremental Static Regeneration (ISR)", "Middleware & Route Protection", "SEO & Dynamic Metadata Generation", "Edge Runtime Deployment", "Streaming & Suspense"],
      extra: ["Building a SaaS Platform with Next.js, Stripe & Database"]
    }
  },
  {
    id: "backend-course",
    name: "Backend Engineering & Node.js / Express",
    category: "Web Development" as CourseCategory,
    shortDescription: "Node.js runtime, Express REST APIs, Authentication, WebSockets, and Middleware.",
    fullDescription: "Master backend server architecture, RESTful API design, JWT authentication, request validation, middleware pipelines, and error handling.",
    courseGoal: "Build secure, scalable backend server architectures.",
    requiredLevel: "Intermediate",
    icon: "Server",
    gradientColor: "from-emerald-600 to-teal-800",
    rating: 4.88,
    enrolledCount: 2700,
    estimatedHours: 36,
    keyTopics: {
      beginner: ["Node.js Event Loop & Modules", "Express.js Server Setup", "Routing & HTTP Verbs", "Request & Response Objects", "Basic Middleware Setup"],
      intermediate: ["RESTful API Architecture Standards", "JWT & Session Authentication", "Password Hashing (bcrypt)", "File Uploads with Multer", "Rate Limiting & CORS"],
      advanced: ["WebSockets for Real-Time Apps (Socket.io)", "Microservices Architecture", "Background Job Queues (BullMQ)", "Logging & Monitoring (Winston/Datadog)", "API Versioning & OpenAPI Specs"],
      extra: ["Building a High-Concurrency Real-Time Chat Backend"]
    }
  },
  {
    id: "db-course",
    name: "Database Systems: SQL & NoSQL Architecture",
    category: "Web Development" as CourseCategory,
    shortDescription: "PostgreSQL, MongoDB, Redis, Indexing, Transactions, and ORMs (Prisma/Drizzle).",
    fullDescription: "Master relational (PostgreSQL) and document (MongoDB) databases, query optimization, indexing strategies, transactions, and modern ORMs.",
    courseGoal: "Design scalable database schemas and high-speed data pipelines.",
    requiredLevel: "Beginner to Advanced",
    icon: "Database",
    gradientColor: "from-blue-600 to-cyan-800",
    rating: 4.92,
    enrolledCount: 2300,
    estimatedHours: 35,
    keyTopics: {
      beginner: ["Relational Database Concepts", "SQL Basics (SELECT, INSERT, UPDATE, DELETE)", "Table Schema & Primary/Foreign Keys", "MongoDB Document Model", "Basic Queries"],
      intermediate: ["SQL Joins, Aggregations & Grouping", "Database Normalization (1NF - 3NF)", "ORMs (Prisma & Drizzle)", "MongoDB Aggregation Framework", "Redis Caching Basics"],
      advanced: ["B-Tree & Hash Indexing Optimization", "ACID Transactions & Locking", "Database Sharding & Replication", "Query Execution Plan Analysis", "Data Migrations"],
      extra: ["Designing High-Scale Distributed Database Architecture"]
    }
  },
  {
    id: "fullstack-course",
    name: "Full Stack Software Architecture",
    category: "Web Development" as CourseCategory,
    shortDescription: "Monorepos, CI/CD, Docker, API Gateways, Security, and Cloud Architecture.",
    fullDescription: "Connect frontend, backend, database, and cloud infrastructure into cohesive, production-ready full-stack enterprise architectures.",
    courseGoal: "Architect and lead full-stack web applications from idea to cloud deployment.",
    requiredLevel: "Advanced",
    icon: "Layers",
    gradientColor: "from-indigo-600 to-purple-800",
    rating: 4.97,
    enrolledCount: 3100,
    estimatedHours: 45,
    keyTopics: {
      beginner: ["Full Stack Architecture Overview", "Connecting React Frontend to Node API", "Environment Variables & Config Management", "Git Monorepo Setup", "Basic Cloud Hosting"],
      intermediate: ["Docker Containerization", "CI/CD Pipelines with GitHub Actions", "API Gateway & Reverse Proxy (Nginx)", "Security Best Practices (OWASP)", "State Synchronization"],
      advanced: ["Serverless Architecture & Cloud Functions", "Micro-Frontends Design", "Distributed Tracing & Monitoring", "Disaster Recovery & Backups", "Zero-Downtime Deployments"],
      extra: ["Building a Production Monorepo Platform with Automated CI/CD"]
    }
  },

  // --- 4. APP DEVELOPMENT (4 Courses) ---
  {
    id: "android-course",
    name: "Android Native Development (Kotlin & Jetpack Compose)",
    category: "App Development" as CourseCategory,
    shortDescription: "Jetpack Compose, MVVM Architecture, Room Database, and Material Design 3.",
    fullDescription: "Master modern native Android development using Kotlin, declarative Jetpack Compose UI, Coroutines, Room, and MVVM design patterns.",
    courseGoal: "Build native Android apps using modern Kotlin and Jetpack Compose.",
    requiredLevel: "Beginner to Advanced",
    icon: "Smartphone",
    gradientColor: "from-emerald-500 to-teal-700",
    rating: 4.89,
    enrolledCount: 2100,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["Android Studio & Project Structure", "Jetpack Compose UI Basics", "Modifiers, Columns & Rows", "State in Compose (remember/mutableStateOf)", "Basic Navigation"],
      intermediate: ["MVVM Architecture Pattern", "Room Database for Offline Storage", "Retrofit REST API Calls", "ViewModel & StateFlow", "Material Design 3 Components"],
      advanced: ["Hilt Dependency Injection", "WorkManager for Background Tasks", "Custom Compose Animations", "App Performance & Memory Leaks", "Play Store Publishing"],
      extra: ["Building an Offline-First Android Productivity Application"]
    }
  },
  {
    id: "ios-course",
    name: "iOS Native App Mastery (Swift & SwiftUI)",
    category: "App Development" as CourseCategory,
    shortDescription: "SwiftUI, SwiftData, Async/Await, Core Animation, and App Store Launch.",
    fullDescription: "Build native iOS applications with Swift 5, SwiftUI layouts, async network handling, state management, and iOS design guidelines.",
    courseGoal: "Develop native iOS applications for iPhone and iPad.",
    requiredLevel: "Beginner to Advanced",
    icon: "Apple",
    gradientColor: "from-blue-600 to-indigo-600",
    rating: 4.92,
    enrolledCount: 2400,
    estimatedHours: 40,
    keyTopics: {
      beginner: ["Xcode Setup & SwiftUI Basics", "Views, Modifiers & Layout Containers", "State & Binding Properties", "Lists & NavigationStack", "Basic User Inputs"],
      intermediate: ["MVVM Design Pattern in SwiftUI", "SwiftData Persistence", "Async/Await API Integration", "Custom UI Components", "Gestures & Animations"],
      advanced: ["Combine Framework Integration", "App Extensions & Widgets", "Memory Management & ARC", "XCTest Automated UI Testing", "App Store Connect & TestFlight"],
      extra: ["Building a Native iOS Health & Fitness Tracking App"]
    }
  },
  {
    id: "flutter-course",
    name: "Flutter & Dart Cross-Platform Mobile Apps",
    category: "App Development" as CourseCategory,
    shortDescription: "Widgets, Riverpod / BLoC State Management, Native Plugins, and Animations.",
    fullDescription: "Build cross-platform iOS, Android, and Web apps from a single codebase with Flutter and Dart, utilizing Riverpod or BLoC state management.",
    courseGoal: "Deploy high-performance cross-platform mobile apps using Flutter.",
    requiredLevel: "Beginner to Advanced",
    icon: "Tablet",
    gradientColor: "from-cyan-500 to-blue-600",
    rating: 4.91,
    enrolledCount: 2900,
    estimatedHours: 38,
    keyTopics: {
      beginner: ["Flutter Widget Architecture", "Stateless vs Stateful Widgets", "Layouts (Row, Column, Stack)", "Material & Cupertino UI", "Basic Form Inputs"],
      intermediate: ["Riverpod / BLoC State Management", "HTTP REST API Integration", "Local Storage (Hive / SharedPrefs)", "Custom Page Route Animations", "Handling Assets & Fonts"],
      advanced: ["Method Channels for Native Code", "Push Notifications (Firebase FCM)", "Performance Tuning & Repaint Boundary", "Unit & Widget Testing", "CI/CD for Flutter"],
      extra: ["Building a Multi-Platform E-Commerce Mobile App"]
    }
  },
  {
    id: "rn-course",
    name: "React Native & Expo Ecosystem",
    category: "App Development" as CourseCategory,
    shortDescription: "Expo Router, Native Modules, Reanimated 3, and Mobile Performance.",
    fullDescription: "Leverage your React knowledge to build native mobile apps for iOS and Android using React Native, Expo Router, and Reanimated.",
    courseGoal: "Create native iOS and Android apps using React and JavaScript.",
    requiredLevel: "Intermediate",
    icon: "Smartphone",
    gradientColor: "from-violet-600 to-purple-800",
    rating: 4.87,
    enrolledCount: 2200,
    estimatedHours: 35,
    keyTopics: {
      beginner: ["React Native Core Components", "Styling with StyleSheet & Tailwind", "Flexbox Mobile Layouts", "Expo CLI & Project Setup", "Basic Navigation"],
      intermediate: ["Expo Router File-Based Navigation", "State Management in Mobile", "AsyncStorage & Local Persistence", "Camera & Device Sensors", "Handling Keyboard & Insets"],
      advanced: ["React Native Reanimated 3 & Gesture Handler", "Native Modules Bridge", "Offline First Data Sync", "Performance Benchmarking", "App Store & Play Store Submissions"],
      extra: ["Building a High-Performance Mobile Social Feed App"]
    }
  },

  // --- 5. BUSINESS COURSES (6 Courses) ---
  {
    id: "ent-course",
    name: "Entrepreneurship & Technology Product Creation",
    category: "Business Courses" as CourseCategory,
    shortDescription: "Idea validation, product-market fit, Lean Startup methodology, and pitching.",
    fullDescription: "Turn technical innovation into viable businesses. Learn problem discovery, customer interviews, MVP creation, unit economics, and fundraising.",
    courseGoal: "Launch and scale sustainable technology ventures.",
    requiredLevel: "Beginner to Intermediate",
    icon: "Briefcase",
    gradientColor: "from-amber-600 to-orange-700",
    rating: 4.93,
    enrolledCount: 1900,
    estimatedHours: 28,
    keyTopics: {
      beginner: ["Foundational Entrepreneurship Mindset", "Identifying High-Value Problems", "Lean Canvas Model", "Conducting Customer Discovery Interviews", "Defining Your Value Proposition"],
      intermediate: ["Building Minimum Viable Products (MVPs)", "Evaluating Product-Market Fit (PMF)", "Unit Economics (CAC, LTV, Churn)", "Go-To-Market (GTM) Strategy", "Pivoting vs Persevering"],
      advanced: ["Fundraising & Pitch Deck Design", "Venture Capital & Angel Terms", "Equity Allocation & Cap Tables", "Building & Managing Founding Teams", "Scaling Business Operations"],
      extra: ["Building a Complete Investor Pitch Deck & Financial Model"]
    }
  },
  {
    id: "mkt-course",
    name: "Growth Marketing & Customer Acquisition",
    category: "Business Courses" as CourseCategory,
    shortDescription: "SEO, Performance Marketing, Conversion Rate Optimization (CRO), and Viral Loops.",
    fullDescription: "Master growth marketing frameworks, paid acquisition channels, organic SEO, content funnels, conversion optimization, and analytics.",
    courseGoal: "Drive scalable user acquisition, conversion, and retention.",
    requiredLevel: "Beginner to Advanced",
    icon: "TrendingUp",
    gradientColor: "from-emerald-600 to-green-700",
    rating: 4.88,
    enrolledCount: 1750,
    estimatedHours: 26,
    keyTopics: {
      beginner: ["Growth Marketing vs Traditional Marketing", "Marketing Funnel (AARRR Framework)", "Defining Target Buyer Personas", "Content Marketing Basics", "Social Media Channel Strategy"],
      intermediate: ["Search Engine Optimization (SEO) Masterclass", "Paid Ads (Google Ads, Meta Ads)", "Email Marketing Automation", "Conversion Rate Optimization (CRO)", "A/B Testing Frameworks"],
      advanced: ["Viral Loops & Referral Engine Design", "Attribution Modeling & Analytics", "Retention & Churn Reduction Tactics", "Growth Experimentation Frameworks", "Marketing Data Automation"],
      extra: ["Executing a Complete 90-Day Tech Startup Growth Campaign"]
    }
  },
  {
    id: "brand-course",
    name: "Brand Strategy, Identity & Positioning",
    category: "Business Courses" as CourseCategory,
    shortDescription: "Brand story, visual identity, market positioning, messaging, and reputation.",
    fullDescription: "Craft unforgettable brand identities, clear market positioning statements, messaging frameworks, and long-term brand equity.",
    courseGoal: "Build iconic brands that command trust and market authority.",
    requiredLevel: "Beginner",
    icon: "Award",
    gradientColor: "from-purple-600 to-pink-600",
    rating: 4.85,
    enrolledCount: 1400,
    estimatedHours: 24,
    keyTopics: {
      beginner: ["What is a Brand Strategy?", "Defining Core Brand Values & Vision", "Target Audience & Competitor Analysis", "Brand Voice & Personality", "Visual Brand Identity Fundamentals"],
      intermediate: ["Crafting Brand Positioning Statements", "Brand Messaging Architecture", "Storytelling in Business & Product", "Brand Style Guide Creation", "Customer Touchpoint Consistency"],
      advanced: ["Rebranding Tactics & Repositioning", "Brand Equity Measurement", "Employer Branding & Culture", "Crisis Communication & Reputation", "Global Brand Scaling"],
      extra: ["Creating a Complete Brand Guidelines Book for a Tech Company"]
    }
  },
  {
    id: "ecom-course",
    name: "E-Commerce Strategy & Operations",
    category: "Business Courses" as CourseCategory,
    shortDescription: "Shopify platforms, inventory logistics, payment gateways, and conversion.",
    fullDescription: "Learn end-to-end e-commerce management: store setup, product sourcing, payment processing, inventory management, and store optimization.",
    courseGoal: "Launch and manage profitable e-commerce platforms.",
    requiredLevel: "Beginner to Intermediate",
    icon: "ShoppingBag",
    gradientColor: "from-blue-600 to-indigo-700",
    rating: 4.82,
    enrolledCount: 1600,
    estimatedHours: 25,
    keyTopics: {
      beginner: ["E-Commerce Business Models", "Setting Up E-Commerce Platforms (Shopify, Custom)", "Product Sourcing & Catalog Setup", "Payment Gateway Integration", "Basic Store UX Design"],
      intermediate: ["Checkout Flow Optimization", "Supply Chain & Fulfillment Logistics", "Customer Support Systems", "Cross-Selling & Upselling Strategies", "E-Commerce Analytics"],
      advanced: ["Headless E-Commerce Architecture", "International Tax & Cross-Border Sales", "Automated Inventory Forecasting", "Subscription Commerce Models", "Fraud Prevention"],
      extra: ["Building a High-Converting Custom E-Commerce Store"]
    }
  },
  {
    id: "sales-course",
    name: "B2B Tech Sales & Enterprise Deals",
    category: "Business Courses" as CourseCategory,
    shortDescription: "Sales funnels, cold outreach, objection handling, closing, and CRM systems.",
    fullDescription: "Master high-ticket B2B tech sales, consultative selling methodologies (SPIN, Challenger), qualification, pipeline management, and closing.",
    courseGoal: "Close high-value enterprise software deals and manage sales teams.",
    requiredLevel: "Beginner to Advanced",
    icon: "Target",
    gradientColor: "from-rose-600 to-red-700",
    rating: 4.91,
    enrolledCount: 1300,
    estimatedHours: 26,
    keyTopics: {
      beginner: ["Foundations of Consultative Selling", "Prospecting & Cold Outreach Tactics", "Qualifying Prospects (BANT Framework)", "Discovery Calls Mastery", "CRM Pipeline Setup"],
      intermediate: ["Product Demonstrations & Presentations", "Handling Customer Objections", "Negotiation & Contracting", "Sales Email & Call Scripts", "Building Sales Collateral"],
      advanced: ["Enterprise Multi-Stakeholder Deals", "Sales Operations & Compensation Plans", "Account-Based Marketing & Sales (ABM)", "Sales Forecasting & Metrics", "Managing Sales Teams"],
      extra: ["Running a Simulated Enterprise B2B Sales Negotiation"]
    }
  },
  {
    id: "startup-course",
    name: "Startup Operations, Legal & Finance",
    category: "Business Courses" as CourseCategory,
    shortDescription: "Company incorporation, cap tables, legal agreements, accounting, and runway.",
    fullDescription: "Essential operational, legal, and financial management for tech founders: incorporation, NDAs, SAFE notes, financial modeling, and burn rate management.",
    courseGoal: "Manage legal, financial, and operational foundations of a startup.",
    requiredLevel: "Beginner to Intermediate",
    icon: "DollarSign",
    gradientColor: "from-amber-600 to-yellow-700",
    rating: 4.89,
    enrolledCount: 1500,
    estimatedHours: 25,
    keyTopics: {
      beginner: ["Startup Legal Structures & Incorporation", "Co-Founder Agreements & Vesting", "Basic Business Accounting", "Budgeting & Runway Management", "Essential Contracts & NDAs"],
      intermediate: ["Understanding Term Sheets & SAFE Notes", "Capitalization Tables (Cap Tables)", "Intellectual Property (IP) Protection", "Financial Modeling & Forecasting", "Compliance & Privacy (GDPR/CCPA)"],
      advanced: ["Post-Fundraising Financial Governance", "M&A Basics & Exit Strategies", "Board of Directors Management", "International Expansion Legalities", "Option Pool Management"],
      extra: ["Building a Startup Financial Model & Cap Table Simulator"]
    }
  },

  // --- 6. OTHER SKILLS (6 Courses) ---
  {
    id: "eng-course",
    name: "Professional English for Tech Professionals",
    category: "Other Skills" as CourseCategory,
    shortDescription: "Technical writing, pitch presentations, engineering terminology, and discussions.",
    fullDescription: "Master professional English communication tailored for developers, product managers, and remote engineering teams.",
    courseGoal: "Communicate fluently and professionally in global tech teams.",
    requiredLevel: "Beginner to Intermediate",
    icon: "MessageSquare",
    gradientColor: "from-blue-600 to-indigo-700",
    rating: 4.92,
    enrolledCount: 2800,
    estimatedHours: 24,
    keyTopics: {
      beginner: ["Technical Vocabulary & Key Terms", "Writing Clear Professional Emails", "Introducing Yourself & Your Projects", "Daily Standup Communication", "Asking Technical Questions"],
      intermediate: ["Writing Technical Documentation & Specs", "Conducting Code Reviews in English", "Presenting Demos & Sprint Reviews", "Handling Technical Discussions", "Writing Product Requirements"],
      advanced: ["Leading Engineering Meetings", "Technical Public Speaking & Talks", "Job Interview Preparation for Tech Roles", "Executive Stakeholder Communication", "Cross-Cultural Communication"],
      extra: ["Delivering a Simulated Technical Product Presentation"]
    }
  },
  {
    id: "comm-course",
    name: "Communication & Technical Leadership",
    category: "Other Skills" as CourseCategory,
    shortDescription: "Active listening, conflict resolution, feedback loops, and team leadership.",
    fullDescription: "Elevate your career with essential soft skills: clear articulation, active listening, managing conflicts, giving constructive feedback, and leading teams.",
    courseGoal: "Lead engineering projects with empathetic, high-impact communication.",
    requiredLevel: "Beginner to Advanced",
    icon: "Users",
    gradientColor: "from-teal-600 to-emerald-700",
    rating: 4.89,
    enrolledCount: 1900,
    estimatedHours: 22,
    keyTopics: {
      beginner: ["Principles of Clear Communication", "Active Listening Techniques", "Body Language & Non-Verbal Signals", "Structuring Ideas for Clarity", "Giving Constructive Feedback"],
      intermediate: ["Conflict Resolution Strategies", "Negotiating Deadlines & Scope", "Empathy in Leadership", "Influence Without Authority", "Asynchronous Team Communication"],
      advanced: ["Building High-Trust Team Cultures", "Mentoring & Coaching Junior Engineers", "Managing Crisis & Bad News", "Executive Communication & Buy-In", "Remote Team Leadership"],
      extra: ["Managing a Complex Team Conflict Scenario"]
    }
  },
  {
    id: "design-course",
    name: "UI/UX Design Systems & Figma",
    category: "Other Skills" as CourseCategory,
    shortDescription: "Wireframing, prototyping, design systems, visual hierarchy, and Figma.",
    fullDescription: "Master digital product design: wireframing, user research, typography, color theory, component design systems, and interactive Figma prototypes.",
    courseGoal: "Design modern, user-friendly digital products and design systems.",
    requiredLevel: "Beginner to Advanced",
    icon: "Layout",
    gradientColor: "from-purple-600 to-indigo-700",
    rating: 4.94,
    enrolledCount: 3200,
    estimatedHours: 35,
    keyTopics: {
      beginner: ["UI vs UX Fundamentals", "Figma Interface & Canvas Tools", "Typography & Color Theory", "Auto Layout Mechanics", "Wireframing Basics"],
      intermediate: ["User Journey Mapping & Personas", "Figma Components & Variants", "Interactive Prototyping", "Usability Testing & Feedback", "Mobile vs Desktop Responsive Design"],
      advanced: ["Building Scalable Design Systems", "Design Tokens & Variables", "Micro-Interactions & Motion Design", "Developer Handoff Workflows", "Design System Governance"],
      extra: ["Designing a Complete SaaS Platform UI Kit in Figma"]
    }
  },
  {
    id: "sec-course",
    name: "Cybersecurity & Ethical Hacking Basics",
    category: "Other Skills" as CourseCategory,
    shortDescription: "OWASP Top 10, penetration testing, cryptography, network defense, and IAM.",
    fullDescription: "Understand modern cybersecurity postures: network defense, web application vulnerabilities, encryption protocols, and incident response.",
    courseGoal: "Secure software applications and defend against cyber threats.",
    requiredLevel: "Beginner to Advanced",
    icon: "Shield",
    gradientColor: "from-rose-600 to-red-800",
    rating: 4.91,
    enrolledCount: 2700,
    estimatedHours: 32,
    keyTopics: {
      beginner: ["Cybersecurity Core Principles (CIA Triad)", "Common Attack Vectors & Malware", "Network Security Fundamentals", "Password Security & Multi-Factor Auth", "Basic Command Line Tools"],
      intermediate: ["OWASP Top 10 Web Vulnerabilities", "SQL Injection & XSS Exploits", "Symmetric & Asymmetric Cryptography", "Identity & Access Management (IAM)", "Security Auditing Tools"],
      advanced: ["Penetration Testing Methodology", "Secure Code Review Practices", "Cloud Infrastructure Security", "Incident Response & Forensics", "Threat Modeling Frameworks"],
      extra: ["Conducting a Web Application Vulnerability Audit"]
    }
  },
  {
    id: "cloud-course",
    name: "Cloud Computing & DevOps Engineering",
    category: "Other Skills" as CourseCategory,
    shortDescription: "AWS/GCP infrastructure, Docker, Kubernetes, Terraform, and CI/CD.",
    fullDescription: "Master cloud infrastructure and DevOps practices: cloud hosting (AWS/GCP), container orchestration (Kubernetes), Infrastructure as Code (Terraform), and automated CI/CD.",
    courseGoal: "Build automated, resilient cloud infrastructure and DevOps pipelines.",
    requiredLevel: "Intermediate to Advanced",
    icon: "Cloud",
    gradientColor: "from-cyan-600 to-blue-800",
    rating: 4.95,
    enrolledCount: 3500,
    estimatedHours: 40,
    keyTopics: {
      beginner: ["Cloud Computing Overview (IaaS, PaaS, SaaS)", "AWS / GCP Virtual Machines & Networking", "Cloud Storage (S3 / Cloud Storage)", "Command Line Cloud Tools", "Basic IAM Roles"],
      intermediate: ["Docker Containerization Deep Dive", "CI/CD Pipelines with GitHub Actions", "Infrastructure as Code with Terraform", "Serverless Functions (Lambda/Cloud Run)", "Domain & SSL Management"],
      advanced: ["Kubernetes Cluster Management (EKS/GKE)", "Site Reliability Engineering (SRE) Principles", "Cloud Cost Optimization Tactics", "Zero-Downtime Deployment Strategies", "Observability (Prometheus/Grafana)"],
      extra: ["Deploying a Multi-Region Production Kubernetes Cluster with CI/CD"]
    }
  },
  {
    id: "data-course",
    name: "Data Science & Exploratory Analysis",
    category: "Other Skills" as CourseCategory,
    shortDescription: "Pandas, NumPy, Matplotlib, Seaborn, SQL, and Statistical Modeling.",
    fullDescription: "Master data manipulation, exploratory data analysis, statistical modeling, data visualization, and insights extraction with Python data science tools.",
    courseGoal: "Analyze complex datasets and derive actionable insights using data science.",
    requiredLevel: "Beginner to Advanced",
    icon: "PieChart",
    gradientColor: "from-indigo-600 to-violet-800",
    rating: 4.88,
    enrolledCount: 2600,
    estimatedHours: 36,
    keyTopics: {
      beginner: ["Python Data Science Stack Setup", "NumPy Array Operations", "Pandas DataFrames & Series", "Data Importing & Cleaning", "Basic Data Visualization"],
      intermediate: ["Exploratory Data Analysis (EDA)", "Advanced Data Aggregations & Merging", "Statistical Hypothesis Testing", "Matplotlib & Seaborn Styling", "Working with Time Series Data"],
      advanced: ["Predictive Analytics & Regression", "Feature Engineering for Analytics", "Data Storytelling & Dashboards", "Big Data Basics (PySpark)", "Automated Report Generation"],
      extra: ["Conducting End-to-End Market Data Analysis & Dashboard"]
    }
  }
];

// Build full 100-class curriculum courses for catalog
export const COURSES_CATALOG: Course[] = ALL_COURSE_BLUEPRINTS.map((bp) =>
  buildCourseCurriculum(bp)
);
