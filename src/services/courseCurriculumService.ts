import { db, doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "../lib/firebase";
import {
  Course,
  CourseCategory,
  CourseLevel,
  CourseModule,
  ClassItem,
  ClassExample,
  ClassQuizQuestion
} from "../types/learning";
import { AutomationLogger } from "./adminAutomationService";

const COURSES_COLLECTION = "courses";
const CURRICULUMS_COLLECTION = "course_curriculums";
const LOCAL_STORAGE_KEY = "joxiq_curriculums_cache";

/**
 * Generates 100 distinct, non-repetitive, step-by-step topics for a given course & category.
 * Exactly 30 Beginner, 30 Intermediate, 30 Advanced, and 10 Extra classes.
 */
export function generate100ClassTopics(
  courseName: string,
  category: CourseCategory
): {
  beginner: string[];
  intermediate: string[];
  advanced: string[];
  extra: string[];
} {
  const isAI = courseName.includes("AI") || category === "AI Engineering" || courseName.includes("LLM") || courseName.includes("Machine Learning");
  const isWeb = courseName.includes("Web") || category === "Web Development" || courseName.includes("React") || courseName.includes("Node") || courseName.includes("HTML");
  const isMobile = courseName.includes("App") || category === "App Development" || courseName.includes("Flutter") || courseName.includes("Android") || courseName.includes("iOS");
  const isBusiness = category === "Business Courses" || courseName.includes("Marketing") || courseName.includes("Startup") || courseName.includes("Business");
  const isDesignOrOther = category === "Other Skills" || courseName.includes("Design") || courseName.includes("Cyber") || courseName.includes("Communication");

  // 1. Beginner Topics (30 Classes)
  let beginner: string[] = [];
  if (isAI) {
    beginner = [
      "Introduction to Artificial Intelligence & Modern LLM Ecosystems",
      "Setting Up Python, Virtual Environments & AI SDK Dependencies",
      "Understanding Tokens, Embeddings & Vector Representations",
      "Prompt Engineering Fundamentals & System Persona Design",
      "Zero-Shot, Few-Shot & Chain-of-Thought Prompting Strategies",
      "Working with OpenAI & Google Gemini API Endpoints",
      "API Key Management, Environment Variables & Security Guards",
      "Handling JSON Output Structures & Schema Enforcements",
      "Temperature, Top-P, Top-K & Sampling Hyperparameters",
      "Basic Error Handling & Rate Limit Management in AI APIs",
      "Text Processing, Token Counting & Context Window Boundaries",
      "Introduction to Vector Databases & Similarity Searching",
      "Storing & Querying Text Embeddings with Pinecone / Chroma",
      "Cosine Similarity, Euclidean Distance & Dot Product Mechanics",
      "Document Chunking Strategies (Fixed-size, Recursive, Semantic)",
      "Building Your First Retrieval-Augmented Generation (RAG) Script",
      "Query Expansion & HyDE (Hypothetical Document Embeddings)",
      "Multi-Modal AI Inputs (Text, Image & Audio API Calls)",
      "Streaming Responses & Real-Time UI Text Rendering",
      "AI Safety Filters, Content Moderation & Guardrails",
      "Function Calling & Tool Use Basics in Gemini / GPT Models",
      "Structuring External Tool Schemas with Pydantic & JSON Schema",
      "Building a Simple Weather & Search AI Assistant Tool",
      "Memory Management in AI Chatbots (Buffer Memory & Summary Memory)",
      "Conversational Context Window Truncation & Summarization",
      "Evaluating AI Output Quality & Hallucination Prevention",
      "Unit Testing AI Prompts & Edge Case Handling",
      "Building a Simple AI Terminal CLI Chat Tool",
      "Refactoring AI Integration Scripts for Clean Code",
      "Beginner Capstone Review: Interactive Single-Turn AI Assistant"
    ];
  } else if (isWeb) {
    beginner = [
      "Web Architecture, Client-Server Model & HTTP Basics",
      "HTML5 Document Structure, Semantic Elements & Accessibility",
      "CSS3 Fundamentals, Selectors, Box Model & Spacing Math",
      "Flexbox Layout Engine: Alignment, Justification & Responsiveness",
      "CSS Grid Layouts: Columns, Rows & Bento Box UIs",
      "Responsive Web Design, Media Queries & Mobile-First Styling",
      "Tailwind CSS Setup, Utility Classes & Modern Design Systems",
      "JavaScript Fundamentals: Variables, Data Types & Operations",
      "Control Flow: Conditionals, Switch Statements & Logical Operators",
      "Loops, Iteration & Array High-Order Methods (map, filter, reduce)",
      "Functions, Arrow Functions, Parameters & Return Values",
      "DOM Traversal, Selecting Elements & Manipulating Classes/Styles",
      "Handling DOM Events, Event Listeners & Event Delegation",
      "Form Validation, Input Controls & Client-Side Handling",
      "Asynchronous JS: Callbacks, Promises & Async/Await Syntax",
      "Fetching External Data with Fetch API & Axios",
      "Parsing JSON, Handling HTTP Response Codes & Error Handling",
      "Browser Storage: LocalStorage, SessionStorage & Cookies",
      "Git Version Control Basics: Init, Commit, Branch & Merge",
      "Connecting to GitHub & Managing Remote Repositories",
      "Introduction to React: Components, JSX & Virtual DOM",
      "React Props, Component Hierarchy & Data Passing",
      "React State Management with useState Hook",
      "Side Effects & Data Fetching with useEffect Hook",
      "Handling Form Input State & Controlled Components in React",
      "Conditional Rendering & Rendering Lists with Keys",
      "Component Styling with Tailwind CSS & Lucide Icons",
      "Building Reusable UI Cards, Modals & Navigation Bars",
      "Debugging React Apps with React DevTools & Browser Console",
      "Beginner Capstone Review: Fully Interactive Personal Portfolio Web App"
    ];
  } else if (isMobile) {
    beginner = [
      "Mobile App Ecosystems: Native vs Cross-Platform Paradigms",
      "Development Environment Setup (IDE, Emulators & CLI)",
      "Core Programming Language Syntax & Variable Declarations",
      "Control Flow, Loops & Conditionals in Mobile Code",
      "Functions, Scope & Object-Oriented Principles for Mobile",
      "Mobile Layout Systems: Rows, Columns & Stacks",
      "Designing Responsive Mobile Views across Screen Sizes",
      "Text Typography, Colors & Custom Mobile Styling",
      "Buttons, Touch Targets & Gesture Detection (Tap, Long Press)",
      "Building Scrollable Lists & Grid Views Efficiently",
      "State Management Basics in Mobile User Interfaces",
      "Form Input Controls, Text Fields & Input Validation",
      "Navigation Patterns: Stack Navigation & Tab Bars",
      "Passing Parameters between Mobile Screens & Route State",
      "Assets Management: Custom Images, Fonts & Vector Icons",
      "Theme Engine: Light Mode & Dark Mode Configuration",
      "Handling Mobile Device Orientation Changes & SafeArea Views",
      "Local Storage on Mobile Devices (SharedPreferences / AsyncStore)",
      "Connecting to REST APIs & Asynchronous Data Fetching",
      "Parsing Remote JSON Data into Typed Data Models",
      "Displaying Loading Indicators, Empty States & Error Banners",
      "Mobile App Lifecycle States (Foreground, Background, Inactive)",
      "Debugging Mobile Apps with Breakpoints & Native Logs",
      "Handling Device Camera & Photo Gallery Picker Permissions",
      "Location Services Basics & Maps Integration Concept",
      "Push Notifications Conceptual Architecture & Setup",
      "Refactoring Mobile Components for Reusability",
      "Unit Testing Core Business Logic in Mobile Code",
      "Building a Clean Task Tracker Mobile App UI",
      "Beginner Capstone Review: Functional Multi-Screen Mobile App"
    ];
  } else if (isBusiness) {
    beginner = [
      "Fundamentals of Modern Business & Entrepreneurial Mindset",
      "Identifying Market Opportunities, Problems & Solution Fits",
      "Conducting Customer Interviews & Market Research",
      "Defining Unique Value Proposition (UVP) & Brand Position",
      "Business Model Canvas (BMC) Framework & Revenue Streams",
      "Understanding Unit Economics: CAC, LTV & Gross Margins",
      "Financial Literacy for Founders: Income Statements & Cash Flow",
      "Product-Market Fit (PMF) Metrics & Traction Validation",
      "Digital Marketing Foundations: Channels & Content Strategy",
      "Search Engine Optimization (SEO) Principles & Keyword Intent",
      "Social Media Brand Presence & Audience Growth Tactics",
      "Email Marketing Basics: Lead Magnets & Subscriber Lists",
      "Conversion Rate Optimization (CRO) & Landing Page Principles",
      "Copywriting Fundamentals: Headlines, Benefits & Call-to-Actions",
      "Sales Funnel Architecture: Top, Middle & Bottom Funnel",
      "B2B Sales Basics: Cold Outreach, Discovery Calls & Demos",
      "Customer Relationship Management (CRM) Pipeline Setup",
      "Pricing Strategies: Cost-Plus, Value-Based & Freemium",
      "Competitive Intelligence & Market Positioning Matrix",
      "Intellectual Property, Business Naming & Legal Entities",
      "Bootstrapping vs Venture Capital Financing Fundamentals",
      "Pitch Deck Creation: Problem, Solution, Traction & Ask",
      "Basic Business Metrics Dashboard: Tracking KPIs",
      "Customer Onboarding & Retaining Early Adopters",
      "Negotiation Fundamentals for Founders & Business Leaders",
      "Time Management, Prioritization & Founder Productivity",
      "Building an Initial Minimum Viable Product (MVP) Scope",
      "Gathering User Feedback & Iterating Product Features",
      "Business Ethics, Compliance & Customer Trust",
      "Beginner Capstone Review: Complete MVP Business Plan & Pitch Deck"
    ];
  } else {
    // General / Programming Languages / Other Skills
    beginner = [
      `Introduction to ${courseName}: Foundations & Domain Overview`,
      "Environment Setup, Tools Installation & Workspace Configuration",
      "Core Syntax, Data Types & Memory Conventions",
      "Variables, Mutability & Scope Declarations",
      "Operators: Arithmetic, Relational, Logical & Bitwise",
      "Control Flow: Conditional Statements & Logical Decision Trees",
      "Looping Constructs: Iteration Patterns & Performance Considerations",
      "Functions Definition, Arguments, Parameters & Return Types",
      "Working with Standard Data Structures (Arrays, Lists, Maps)",
      "String Processing, Manipulation & Pattern Matching",
      "Modular Architecture: Importing, Exporting & Namespace Organization",
      "Error Handling: Try-Catch Blocks, Custom Exceptions & Stack Traces",
      "File System I/O: Reading, Writing & Parsing Data Records",
      "Object-Oriented Fundamentals: Classes, Instances & Properties",
      "Encapsulation & Access Control Modifiers",
      "Inheritance & Polymorphism in Domain Software",
      "Data Abstraction & Interface Declarations",
      "Debugging Techniques: Breakpoints, Inspection & Logging",
      "Working with External Libraries & Package Dependencies",
      "Asynchronous Execution Fundamentals & Event Callbacks",
      "Working with Dates, Timestamps & Timezones accurately",
      "Input Validation & Data Sanitization Principles",
      "Clean Code Principles: Naming Conventions & Code Style Guidelines",
      "Git & Version Control Integration for Daily Workflows",
      "Building Utility Functions & Helper Libraries",
      "Solving Classic Algorithmic Problems using Fundamentals",
      "Code Refactoring Strategies for Readability",
      "Writing Basic Unit Tests for Core Business Logic",
      "Building a Complete Command-Line or Baseline Utility",
      "Beginner Capstone Review: Comprehensive Fundamental Mastery Project"
    ];
  }

  // Ensure exactly 30 beginner items
  while (beginner.length < 30) {
    beginner.push(`${courseName} Fundamental Concept Part ${beginner.length + 1}`);
  }
  beginner = beginner.slice(0, 30);

  // 2. Intermediate Topics (30 Classes)
  let intermediate: string[] = [];
  if (isAI) {
    intermediate = [
      "Advanced RAG Pipelines: Parent-Child Chunking & Context Compression",
      "Re-Ranking Search Results with Cohere & Cross-Encoders",
      "Hybrid Search: Combining BM25 Keyword Search & Vector Search",
      "Multi-Query Generation & Query Rewriting for Higher Recall",
      "LangChain Architecture: Chains, Prompts & Output Parsers",
      "LlamaIndex Framework: Indexing Documents & Custom Knowledge Graphs",
      "Building Multi-Turn Conversational RAG Agents with Memory",
      "Structured Data Extraction from PDFs, Scanned Images & Tables",
      "AI Agent Architecture: ReAct (Reasoning + Acting) Framework",
      "Equipping AI Agents with Custom API Tools & Database Execution",
      "Building Autonomous Research Agents with Web Search Tooling",
      "Multi-Agent Collaboration Networks: Manager & Worker Agents",
      "State Management in Agents with LangGraph / CrewAI Frameworks",
      "Handling Loop Failures, Recursion Limits & Agent Self-Correction",
      "Streaming Agent Thoughts & Execution Logs to Client UIs",
      "Introduction to Fine-Tuning Open Source LLMs (Llama 3, Qwen)",
      "Dataset Preparation, Formatting & Quality Filtering for Training",
      "LoRA (Low-Rank Adaptation) & QLoRA Parameter-Efficient Fine-Tuning",
      "Quantization Techniques (GGUF, AWQ, FP16 vs INT4 Precision)",
      "Self-Hosted LLM Deployment with Ollama & vLLM Inference Engine",
      "Evaluating LLM Benchmarks: BLEU, ROUGE, LLM-as-a-Judge",
      "AI Cost Optimization: Model Routing, Caching & Semantic Cache",
      "Semantic Caching with Redis / GPTCache for Instant Responses",
      "AI Security: Prompt Injection Defense, Jailbreak Prevention & Guardrails",
      "Building Real-Time Voice AI Applications with Gemini Live API",
      "Text-to-Speech (TTS) & Speech-to-Text (STT) Integration Pipeline",
      "AI Synthetic Data Generation for Training & Testing",
      "Building an Enterprise AI Knowledge Base Search Platform",
      "Monitoring AI Latency, Token Throughput & Error Analytics",
      "Intermediate Capstone Review: Full-Stack RAG & Agent Search System"
    ];
  } else if (isWeb) {
    intermediate = [
      "Advanced React Patterns: Custom Hooks, Compound Components & Render Props",
      "React Context API for Global Application State Management",
      "Zustand / Redux Toolkit for Complex Scalable Client State",
      "React Performance Optimization: useMemo, useCallback & React.memo",
      "React Router v6: Dynamic Routes, Nested Layouts & Loaders",
      "Form Management with React Hook Form & Zod Schema Validation",
      "Server-Side Rendering (SSR) vs Static Site Generation (SSG) Concepts",
      "Next.js App Router Architecture: Server & Client Components",
      "Next.js Data Fetching, Caching, Revalidation & Server Actions",
      "Next.js Middleware, Authentication Headers & Route Guards",
      "Node.js Backend Fundamentals: Event Loop, Buffer & Stream APIs",
      "Express.js Framework: Route Architecture, Controllers & Services",
      "Express Middleware: CORS, Helmet Security, Body Parsers & Logging",
      "RESTful API Design Standards: HTTP Verbs, Status Codes & Payloads",
      "Relational Database Design: PostgreSQL, Schema Tables & Foreign Keys",
      "SQL Querying: SELECT, JOINs, Grouping, Aggregations & Indexing",
      "ORM & Query Builders: Prisma / Drizzle ORM Setup & Migrations",
      "CRUD API Development: Connecting Express Backend to PostgreSQL",
      "Authentication Patterns: JWT Tokens, HTTP-Only Cookies & Refresh Logic",
      "Password Hashing with Bcrypt & Security Best Practices",
      "Role-Based Access Control (RBAC): Admin vs User Permissions",
      "File Upload Pipelines: Multer, AWS S3 / Cloud Storage Integration",
      "Real-Time Web Communications with WebSockets & Socket.io",
      "API Rate Limiting, Throttling & DDoS Protection Middleware",
      "Automated Testing: Unit Tests with Vitest/Jest & Integration Testing",
      "End-to-End (E2E) Testing with Playwright / Cypress",
      "CI/CD Automation Pipelines with GitHub Actions",
      "Environment Configuration, Production Build Bundling & Esbuild",
      "Dockerizing Full-Stack Web Applications for Deployment",
      "Intermediate Capstone Review: Production-Ready Full-Stack SaaS Platform"
    ];
  } else if (isMobile) {
    intermediate = [
      "Advanced State Management Architecture (Bloc, Provider, Redux)",
      "Clean Architecture Layers: Data, Domain & Presentation Layers",
      "Dependency Injection & Service Location in Mobile Code",
      "Advanced Reactive Programming & Streams / Observables",
      "Complex Custom UI Animations & Micro-Interactions",
      "Custom Painter & Vector Graphics Rendering on Mobile",
      "Local Database Storage: SQLite / Room / Realm Database Integration",
      "Data Synchronization: Offline-First Caching & Background Sync",
      "Secure Storage on Mobile: Keychain / Encrypted Shared Preferences",
      "OAuth 2.0 & Social Authentication (Google, Apple, Firebase Auth)",
      "RESTful & GraphQL API Integration with Advanced Interceptors",
      "Handling Network Disconnections, Offline Buffering & Retries",
      "Camera Capture, Video Recording & Media Compression Plugins",
      "Audio Playback Engine & Background Sound Streaming",
      "Bluetooth Low Energy (BLE) & Device Hardware Integration",
      "Sensors Integration: Accelerometer, Gyroscope & Biometrics (FaceID/Fingerprint)",
      "Deep Linking & Universal Links Handling in Mobile Apps",
      "Push Notifications Integration with Firebase Cloud Messaging (FCM)",
      "In-App Purchases & Subscription Billing Setup (RevenueCat)",
      "Performance Profiling: CPU Utilization, Memory Leaks & FPS Dropping",
      "Mobile App Accessibility (Screen Readers, Dynamic Text Sizing)",
      "Internationalization (i18n) & Multi-Language Localization",
      "Widget Lifecycle Optimization & Rendering Efficiency",
      "Automated Mobile Unit & Widget Testing Frameworks",
      "Integration Testing Mobile Flows on Emulators",
      "Mobile App Security Hardening: Obfuscation, Anti-Tampering & SSL Pinning",
      "Automated Mobile CI/CD Builds with Fastlane / GitHub Actions",
      "App Store & Google Play Store Submission Guidelines & Metadata",
      "Analytics & Crash Reporting with Firebase Crashlytics",
      "Intermediate Capstone Review: Feature-Rich Offline-First Mobile App"
    ];
  } else if (isBusiness) {
    intermediate = [
      "Advanced Growth Hacking & Viral Loop Mechanics",
      "Paid Acquisition Channels: Google Ads, Meta Ads & TikTok Campaigns",
      "Data-Driven Marketing Analytics: Google Analytics 4 & Attribution Modeling",
      "Email Marketing Automation: Nurture Sequences & Churn Prevention",
      "A/B Testing Frameworks: Hypotheses, Statistical Significance & Execution",
      "Product Management: Prioritization Frameworks (RICE, Kano, MoSCoW)",
      "Agile & Scrum Methodologies for Product Development Teams",
      "User Story Mapping, Epics & Product Backlog Management",
      "Customer Lifetime Value (LTV) Optimization & Retention Strategies",
      "Churn Reduction Tactics, Exit Surveys & Win-Back Campaigns",
      "SaaS Pricing Psychology & Tiered Monetization Strategies",
      "Enterprise Sales Strategy: Account-Based Marketing (ABM) & Procurement",
      "Sales Pitch Mastery & Closing High-Ticket Contracts",
      "Financial Modeling: Forecasting Revenue, Expenses & Burn Rate",
      "Cap Table Management, Equity Allocation & Option Pools",
      "Fundraising Execution: Angel Investors, VCs & Term Sheet Negotiation",
      "Strategic Partnerships & Co-Marketing Deals",
      "PR & Media Relations: Press Release Writing & Tech Media Outreach",
      "Building High-Performance Remote Teams & Hiring Top Talent",
      "Company Culture, Founder Leadership & Conflict Resolution",
      "Operations Scaling: Standard Operating Procedures (SOPs) & Automation",
      "Supply Chain & Logistics Management for Product Businesses",
      "Legal Compliance: GDPR, CCPA, Terms of Service & Privacy Policies",
      "Brand Identity Systems: Visual Language, Voice & Guidelines",
      "Community Building & User-Generated Growth Strategies",
      "International Expansion & Localization for Global Markets",
      "Customer Success Frameworks & Net Promoter Score (NPS) Optimization",
      "Crisis Management, PR Risks & Brand Recovery Plans",
      "Corporate Governance & Advisory Board Management",
      "Intermediate Capstone Review: Scalable Growth Strategy & Operating Blueprint"
    ];
  } else {
    intermediate = [
      `Intermediate ${courseName}: Design Patterns & Architecture`,
      "Object-Oriented Design Patterns: Factory, Singleton, Observer, Decorator",
      "Functional Programming Concepts: Pure Functions, Immutability & Monads",
      "Advanced Data Structures: Trees, Graphs, Hash Tables & Priority Queues",
      "Algorithm Complexity Analysis: Big-O Time & Space Trade-offs",
      "Sorting & Searching Algorithms in Production Code",
      "Asynchronous Event Handling & Non-Blocking Execution",
      "Concurrency Patterns: Multithreading, Thread Pools & Mutex Locking",
      "Database Integration: ORM Mapping & Schema Design",
      "RESTful API Development & Service Integration",
      "Data Validation Frameworks & Schema Enforcement",
      "Authentication & Authorization Mechanisms",
      "Caching Strategies: In-Memory Caching & Distributed Cache",
      "Logging Frameworks, Log Aggregation & Diagnostic Tracing",
      "Automated Unit Testing & Test-Driven Development (TDD)",
      "Integration Testing & Mocking External Dependencies",
      "Code Refactoring Patterns for Enterprise Quality",
      "Memory Profiling, Garbage Collection & Leak Prevention",
      "System Configuration Management & Environment Separation",
      "Building Reusable Software Packages & Libraries",
      "Error Recovery, Circuit Breakers & Resilience Patterns",
      "Message Queues & Event-Driven Pub/Sub Architecture",
      "Working with Binary Data, Buffers & Compression Algorithms",
      "Internationalization (i18n) & Localization Patterns",
      "API Rate Limiting & Throttling Mechanisms",
      "CI/CD Pipeline Setup for Automated Testing & Builds",
      "Containerization Basics for Application Services",
      "Performance Benchmarking & Bottleneck Identification",
      "Building a Modular Enterprise Service Component",
      "Intermediate Capstone Review: High-Performance Modular Application"
    ];
  }

  while (intermediate.length < 30) {
    intermediate.push(`${courseName} Practical Application Topic ${intermediate.length + 1}`);
  }
  intermediate = intermediate.slice(0, 30);

  // 3. Advanced Topics (30 Classes)
  let advanced: string[] = [];
  if (isAI) {
    advanced = [
      "Distributed Model Training & Multi-GPU Acceleration (DeepSpeed, Megatron)",
      "Fine-Tuning Vision-Language Multi-Modal Models (LLaVA, Paligemma)",
      "RLHF (Reinforcement Learning from Human Feedback) & DPO (Direct Preference Optimization)",
      "Custom Loss Functions, Reward Modeling & Policy Gradient Optimization",
      "Building Custom Vector Indexing Algorithms (HNSW, IVF-PQ)",
      "Low-Latency AI Serving Architecture with C++ / CUDA Accelerated Kernels",
      "Edge AI Deployment: ONNX Runtime, TensorRT & Apple CoreML Optimization",
      "LLM Security Vulnerabilities: Indirect Prompt Injection, Data Poisoning & Exfiltration",
      "Building Autonomous Self-Improving AI Agents with Long-Term Episodic Memory",
      "Graph RAG Architecture: Combining Knowledge Graphs & Vector Search",
      "AI Governance, Model Transparency, Bias Mitigation & Explainability (XAI)",
      "High-Concurrency AI Gateway Architecture (Load Balancing & Fallback Model Swapping)",
      "Building Custom Fine-Tuned Embedding Models for Niche Domains",
      "AI Code Generation Engines & Self-Healing Software Systems",
      "Real-Time Multimodal Streaming: Video Feed Processing with AI Models",
      "Distributed Agent Orchestration across Microservice Clusters",
      "LLM Model Compression: Distillation, Pruning & Bit-Level Quantization",
      "Enterprise AI Compliance: HIPAA, SOC2 & Data Privacy Enforcements",
      "Building Custom AI Compiler Pipelines & Execution Graphs",
      "Zero-Knowledge Proofs & Cryptographic Privacy in AI Inference",
      "AI System Chaos Engineering & Failure Mode Simulation",
      "High-Throughput Synthetic Data Pipeline Architectures",
      "Building Custom Search Grounding & Web Crawler Aggregators",
      "AI Infrastructure Cost Modeling for Millions of Requests",
      "Designing Enterprise AI API Gateways with Token Bucket Rate Limits",
      "Self-Hosted Open Source AI Stack Deployment on Kubernetes",
      "Building AI-Driven Predictive Maintenance & Anomaly Detection Systems",
      "Advanced AI Agent Design: Multi-Plan Tree-of-Thoughts Search",
      "AI System Telemetry: Tracing Agent Loops with OpenTelemetry & LangSmith",
      "Advanced Capstone Review: Enterprise Autonomous AI System Architecture"
    ];
  } else if (isWeb) {
    advanced = [
      "Advanced Microfrontend Architecture: Module Federation & Isolation",
      "Server-Driven UI (SDUI) Framework Design & Dynamic Schema Rendering",
      "Custom Webpack / Vite Plugin Development & Build Transformations",
      "Web Workers, Shared Workers & Offloading Heavy Calculations off Main Thread",
      "WebAssembly (Wasm) Integration with Rust / C++ in Web Apps",
      "Browser Rendering Pipeline Optimization: Layout Reflows & Composite Layers",
      "Web Vitals Deep Dive: LCP, CLS, INP Diagnostic & Performance Tuning",
      "Database Sharding, Read Replicas & Connection Pooling in High-Load Systems",
      "Distributed Caching Strategies with Redis Sentinel / Cluster",
      "Event-Driven Microservices Architecture with Apache Kafka / RabbitMQ",
      "GraphQL Subscriptions, Schema Stitching & Federation",
      "Zero-Downtime Database Migrations & Blue-Green Deployments",
      "Custom Authentication Systems: SAML 2.0, Enterprise SSO & OIDC",
      "Advanced Security: Content Security Policy (CSP), CORS Hardening & OWASP Top 10",
      "Building Custom Real-Time Collaborative Canvas (CRDTs & Yjs)",
      "Serverless Architecture: Edge Functions, AWS Lambda & Cold Start Mitigation",
      "Kubernetes Cluster Setup, Pod Auto-scaling & Helm Charts",
      "Infrastructure as Code (IaC) with Terraform / Pulumi",
      "Observability Stack: Prometheus, Grafana & OpenTelemetry Tracing",
      "Chaos Engineering: Testing System Resilience against Failures",
      "High-Availability Load Balancer Configuration (Nginx, HAProxy, Envoy)",
      "Building High-Throughput WebSockets Gateway for Millions of Concurrently Active Users",
      "Web Application Firewall (WAF) & Automated Anti-DDoS Mitigation",
      "Designing Multi-Tenant SaaS Architectures with Schema-per-Tenant Isolation",
      "Search Engine Engineering: Elasticsearch / Meilisearch Engine Tuning",
      "System Design Case Study: Architecting Global Video Streaming Infrastructure",
      "System Design Case Study: Building Real-Time Financial Trading Platform",
      "Advanced Memory Management & Garbage Collection Tuning in Node.js Engine",
      "Enterprise Full-Stack Security Audit & Penetration Testing Workflow",
      "Advanced Capstone Review: Enterprise Distributed Cloud Platform"
    ];
  } else if (isMobile) {
    advanced = [
      "Native C++ / Rust Engine Integration via JNI & C-FFI",
      "Custom Native Plugin Development for iOS (Swift) & Android (Kotlin)",
      "High-Performance Graphics & Shader Programming with Metal / Vulkan",
      "Real-Time Video Processing & AR Kit / AR Core Augmented Reality Integration",
      "Custom Mobile Database Engine Optimization for Large Offline Records",
      "Background Execution Tasks, Alarms & Battery Usage Optimization",
      "Building Custom Cross-Platform UI Frameworks & Rendering Pipelines",
      "Advanced Mobile Security: Whitebox Cryptography & Memory Inspection Protections",
      "Biometric Security Enclaves & Hardware Security Modules (HSM)",
      "Multi-Module Mobile App Architecture for Large Engineering Teams",
      "Dynamic Feature Modules & On-Demand App Component Downloading",
      "Real-Time Streaming Engine for Low-Latency Audio/Video (WebRTC)",
      "Mobile App Memory Leak Detection & Native Heap Profiling",
      "Automated Mobile UI Test Farms (AWS Device Farm / Firebase Test Lab)",
      "Over-the-Air (OTA) Code Updates Architecture & Rollback Safety",
      "Designing SDKs for Third-Party Developers: Versioning & Binary Compatibility",
      "Mobile App Analytics Data Pipelines & Telemetry Privacy Enforcements",
      "Building Custom Push Notification Service Providers with TLS Mutual Auth",
      "Enterprise Mobile Device Management (MDM) & App Wrapping Security",
      "Mobile Game Engine Integration (Unity / Unreal) inside Native Apps",
      "Offline-First Conflict Resolution Protocols (Vector Clocks & CRDTs)",
      "Custom BLE Protocol Design for IoT Hardware Devices",
      "Mobile Accessibility Auditing & Compliance for Governmental Standards",
      "System Design Case Study: Building Real-Time Ride-Sharing Mobile App",
      "System Design Case Study: Architecting Encrypted Messaging App (Signal Protocol)",
      "Mobile App Size Optimization: ProGuard, R8, Split APKs & Bitcode",
      "Advanced Mobile Crash Symbolication & Stack Trace Analysis",
      "Designing Modular Micro-Apps for Enterprise Super-App Ecosystems",
      "Automated Security Scans & OWASP Mobile Top 10 Audit Workflows",
      "Advanced Capstone Review: Enterprise-Grade Mobile Application Architecture"
    ];
  } else if (isBusiness) {
    advanced = [
      "Strategic Corporate Mergers, Acquisitions (M&A) & Joint Ventures",
      "Advanced Venture Capital Deal Structuring, Liquidation Preferences & Term Sheets",
      "Global Expansion Strategy: Regulatory Compliance, Foreign Exchange & Tax Enclaves",
      "Corporate Innovation Frameworks & Internal Venture Building",
      "Enterprise Risk Management, Crisis Leadership & Board Governance",
      "High-Stakes B2B Procurement Negotiations & Enterprise Contracting",
      "Designing Turnaround Strategies for Stagnant or Declining Businesses",
      "Building Algorithmic Financial Models & Monte Carlo Risk Simulations",
      "Strategic Brand Equity Valuation & Intellectual Property Monetization",
      "Scaling Organizational Engineering: Managing 100+ Person Organizations",
      "Executive Compensation Structures, Equity Vesting & Performance Incentives",
      "SaaS Metrics Deep Dive: Net Revenue Retention (NRR), Magic Number & Payback Period",
      "Custom Business Intelligence (BI) Architecture & Enterprise Data Warehousing",
      "Public Relations Strategy for IPOs, SEC Filings & Investor Relations",
      "Designing Sustainable Supply Chains & Environmental Compliance",
      "Enterprise Customer Success Strategies for Multi-Million Dollar Accounts",
      "Advanced Negotiation Psychology: Hostage Tactics applied to Business Crises",
      "Building Monopoly Moats: Network Effects, Switching Costs & Scale Economies",
      "Cross-Border E-commerce Logistics, Customs & International Payment Gateways",
      "Strategic Advisory Board Recruitment & Governance Best Practices",
      "Designing High-Velocity Experimentation Loops for Product & Growth",
      "Corporate Tax Structuring, R&D Tax Credits & International Business Entities",
      "Designing Organizational Incentive Structures to Eliminate Silos",
      "Building Strategic Ecosystem Partnerships & API Monetization",
      "Crisis PR Case Studies: Rebuilding Trust after Public Security Breaches",
      "Macroeconomic Analysis for Business Leaders: Inflation, Interest Rates & Hedging",
      "Case Study Analysis: Lessons from Fortune 500 Failures & Successes",
      "Designing Franchise & Licensing Models for Global Business Scaling",
      "Preparing a Company for Successful Exit or Initial Public Offering (IPO)",
      "Advanced Capstone Review: Enterprise Strategy & Executive Business Blueprint"
    ];
  } else {
    advanced = [
      `Advanced ${courseName}: Enterprise Systems Architecture`,
      "Distributed Systems Principles: CAP Theorem, PACELC & Consensus Protocols",
      "High-Concurrency Performance Tuning & Micro-Benchmarking",
      "Low-Level Memory Optimization, Garbage Collection & Cache Line Alignment",
      "Security Engineering: Cryptographic Standards, TLS & Key Management",
      "Building High-Availability Service Fabrics with Load Balancing",
      "Event Sourcing & CQRS (Command Query Responsibility Segregation) Patterns",
      "Distributed Database Architectures: Sharding, Replication & Partitioning",
      "Building Custom DSLs (Domain Specific Languages) & Parsers",
      "Microservices Orchestration, Service Mesh & Envoy Proxying",
      "Zero-Downtime Deployment Strategies: Blue-Green & Canary Rollouts",
      "Observability Systems: Distributed Tracing, Metrics & Alerting Engine",
      "Fault Tolerance Engineering: Chaos Testing & Circuit Breaker Optimization",
      "High-Throughput Message Queue Architecture & Stream Processing",
      "Enterprise Identity & Access Management: SAML, OAuth2 & OIDC Integration",
      "Building Custom High-Performance Caching Engines",
      "Compiler Theory Basics: Abstract Syntax Trees (AST) & Code Generation",
      "Garbage Collector Internal Mechanics & Memory Pressure Optimization",
      "Building High-Concurrency Async Runtimes & Worker Thread Pools",
      "System Resilience Engineering: Disaster Recovery & Active-Active Failover",
      "Database Query Engine Optimization & Execution Plan Analysis",
      "Custom Network Protocol Design over TCP/UDP Sockets",
      "Zero-Trust Architecture & Network Microsegmentation",
      "Enterprise Code Quality Assurance: Static Analysis & Security Scans",
      "Designing High-Volume Batch Data Pipelines",
      "System Design Case Study: Global Scalable Infrastructure Architecture",
      "System Design Case Study: Real-Time Mission-Critical Platform",
      "Performance Profiling under Peak Load Conditions",
      "Enterprise Compliance, Audit Logging & Security Hardening",
      "Advanced Capstone Review: Enterprise Systems Architecture Project"
    ];
  }

  while (advanced.length < 30) {
    advanced.push(`${courseName} Enterprise Concept Topic ${advanced.length + 1}`);
  }
  advanced = advanced.slice(0, 30);

  // 4. Extra / Career & Capstone Topics (10 Classes)
  const extra: string[] = [
    `Class 91: ${courseName} Portfolio Project Blueprint & Architecture Planning`,
    `Class 92: Building Production-Ready GitHub Repositories with Clean Documentation`,
    `Class 93: CI/CD Automated Pipelines, Linters & Code Quality Gateways`,
    `Class 94: Deploying ${courseName} Applications to Cloud Platforms & Custom Domains`,
    `Class 95: Technical Interview Masterclass: Core Algorithmic & System Design Questions`,
    `Class 96: Resume & LinkedIn Optimization for High-Paying ${courseName} Roles`,
    `Class 97: Mock Technical Screening: Live Coding & Whiteboard Architecture Walkthrough`,
    `Class 98: Industry Workflows: Agile Sprint Execution, Code Reviews & Team Collaboration`,
    `Class 99: Emerging Technology Trends & Future Roadmap for ${courseName}`,
    `Class 100: Final 100-Class Capstone Project Presentation & JOXIQ Academy Certificate`
  ];

  return { beginner, intermediate, advanced, extra };
}

/**
 * Builds a complete, production-grade 100-Class Course Curriculum
 */
export function build100ClassCurriculum(
  courseId: string,
  courseName: string,
  category: CourseCategory,
  courseGoal?: string,
  shortDescription?: string
): Course {
  const topics = generate100ClassTopics(courseName, category);
  const modules: CourseModule[] = [];

  const goalText = courseGoal || `Master ${courseName} from foundational syntax to enterprise production architecture through 100 structured classes.`;
  const descText = shortDescription || `Complete 100-class masterclass covering beginner fundamentals, intermediate application, advanced engineering, and career portfolio capstones in ${courseName}.`;

  let classCounter = 1;

  // Helper to construct a ClassItem with AI Teaching Standards
  const makeClassItem = (
    num: number,
    level: CourseLevel,
    topicName: string,
    modTitle: string
  ): ClassItem => {
    const prevClass = num > 1 ? `Class ${num - 1}` : "Course Overview";
    const nextClass = num < 100 ? `Class ${num + 1}` : "Graduation & Certificate";

    return {
      id: `${courseId}-class-${num}`,
      classNumber: num,
      title: `Class ${num}: ${topicName}`,
      topic: topicName,
      duration: `${15 + (num % 12)} mins`,
      learningObjective: `Master ${topicName} in ${courseName}. Understand what it is, why it exists, how it executes under the hood, and where it is applied in production.`,
      whyImportant: `${topicName} is a fundamental pillar of ${courseName}. Without it, software systems experience logic bugs, unhandled exceptions, and poor maintainability.`,
      whatYouWillLearn: [
        `Syntax, mechanics, and core properties of ${topicName}`,
        `Step-by-step execution flow and line-by-line code dissection`,
        `Real-world production usage, common pitfalls, and fixes`,
        `How ${topicName} connects ${prevClass} to upcoming ${nextClass}`
      ],
      realLifeUsage: {
        whyNeeded: `${topicName} provides reliable logic structures required in real software engineering environments.`,
        realWorldApplication: `Used by engineering teams worldwide to write clean, maintainable, and high-performance ${courseName} code.`,
        skillImpact: `Demonstrates strong problem-solving proficiency and helps you excel in live coding interviews.`
      },
      explanationTopic: `### Class ${num}: ${topicName}

Welcome to **Class ${num}** of **${courseName}**! In this session, we master **${topicName}** through professional step-by-step instruction.

---

### 1. What is ${topicName}?
**${topicName}** is an essential mechanism in ${courseName} that allows software engineers to express logic cleanly, control data flow, and structure resilient code.

### 2. Why is it Important?
- **Solves Real Problems**: Prevents fragile code structures and runtime failures.
- **Code Quality**: Enhances readability, reusability, and team collaboration.
- **Performance**: Optimizes execution path and memory footprint.

### 3. How Does It Work (Under the Hood)?
When the execution engine processes **${topicName}**, it evaluates expressions sequentially, allocates scope memory, and enforces type/runtime constraints before proceeding to the next instruction block.

### 4. When & Where is it Used?
- **Backend APIs & Microservices**: Structuring business logic and request handlers.
- **Data Engineering**: Processing streams, validating payloads, and mapping records.
- **Frontend & Mobile UIs**: Managing application state, user events, and reactive logic.

---

### 5. Syntax & Code Example
\`\`\`${courseName.toLowerCase().includes("python") ? "python" : courseName.toLowerCase().includes("javascript") || courseName.toLowerCase().includes("typescript") ? "typescript" : courseName.toLowerCase().includes("java") ? "java" : courseName.toLowerCase().includes("c++") ? "cpp" : courseName.toLowerCase().includes("go") ? "go" : courseName.toLowerCase().includes("rust") ? "rust" : "clike"}
// Class ${num}: ${topicName} Example
// Production-ready pattern in ${courseName}

function execute${topicName.replace(/[^a-zA-Z0-0]/g, "")}Task(inputVal: string) {
  console.log("Initializing ${topicName} processing...");
  
  if (!inputVal) {
    throw new Error("Invalid input: inputVal cannot be empty.");
  }
  
  const formatted = inputVal.trim().toUpperCase();
  console.log(\`Successfully processed: \${formatted}\`);
  return { success: true, class: ${num}, topic: "${topicName}" };
}

// Test execution
const result = execute${topicName.replace(/[^a-zA-Z0-0]/g, "")}Task("JOXIQ AI Student");
console.log(result);
\`\`\`

---

### 6. Line-by-Line Code Breakdown
- **Line 4**: Defines function signature taking \`inputVal\` as parameter.
- **Line 5**: Logs starting message for execution tracking.
- **Line 7-9**: Validates input boundary, throwing an exception if null or empty.
- **Line 11**: Sanitizes input string using string method chaining.
- **Line 12-13**: Constructs structured return object indicating success.
- **Line 16-17**: Calls the function with test argument and prints output payload.

---

### 7. Common Mistakes & How to Fix Them
- ❌ **Mistake**: Forgetting boundary validation or ignoring edge cases.
  - **Fix**: Always validate parameters before performing transformations.
- ❌ **Mistake**: Mutating global state unexpectedly.
  - **Fix**: Use local variables and return pure, predictable values.

---

### 8. Professional Best Practices
1. Keep functions focused on a single responsibility (Single Responsibility Principle).
2. Write descriptive variable names that communicate intent without comments.
3. Catch specific exceptions rather than suppressing errors silently.`,
      examples: [
        {
          title: `Step-by-Step Code Example: ${topicName}`,
          codeOrText: `// Practical Class ${num} Implementation
function run${topicName.replace(/[^a-zA-Z0-0]/g, "")}() {
  console.log("Executing Class ${num}: ${topicName}");
  return { status: "Success", classNumber: ${num} };
}
run${topicName.replace(/[^a-zA-Z0-0]/g, "")}();`,
          explanation: `Demonstrates clean, runnable execution of ${topicName} in ${courseName}.`
        }
      ],
      practiceTask: `Write a clean ${courseName} function that implements ${topicName}. Handle invalid inputs gracefully, log progress, and return a validated result object.`,
      quizPlan: `Interactive assessment with 2 questions evaluating ${topicName} syntax, execution flow, and edge-case handling.`,
      quiz: [
        {
          id: `q1-cls-${num}`,
          question: `In ${courseName}, what is the main purpose of ${topicName}?`,
          options: [
            `To enforce predictable logic, maintainability, and clean code flow`,
            `To delete system log files automatically`,
            `To bypass compiler and runtime type checks`,
            `To convert source code into raw plain text without validation`
          ],
          correctOptionIndex: 0,
          explanation: `${topicName} provides predictable, maintainable, and reliable logic structure in ${courseName}.`
        },
        {
          id: `q2-cls-${num}`,
          question: `When writing code for ${topicName}, which software engineering practice is recommended?`,
          options: [
            `Validating inputs, handling errors gracefully, and keeping code modular`,
            `Hardcoding test API credentials into public code repos`,
            `Putting all application logic inside a single giant function`,
            `Ignoring exception handling and network error timeouts`
          ],
          correctOptionIndex: 0,
          explanation: `Input validation, modular design, and robust error handling ensure code quality in production.`
        }
      ],
      homework: `Write a small exercise program applying ${topicName} to solve a real-world scenario (e.g., student grade management, e-commerce cart calculation, or text processing).`,
      projectConnection: `Directly builds the core logic required for the Module Mini Project and Level Major Project.`,
      isProOnly: num > 5,
      status: "Published"
    };
  };

  // 1. Beginner Level (30 Classes -> 3 Modules)
  const bgModulesTitles = [
    "Beginner Foundations & Workspace Setup",
    "Core Syntax & Structural Control Flow",
    "Functions, Data Structures & Error Mechanics"
  ];

  for (let m = 0; m < 3; m++) {
    const modClasses: ClassItem[] = [];
    const startNum = m * 10 + 1;
    const endNum = startNum + 9;

    for (let c = 0; c < 10; c++) {
      const clsNum = startNum + c;
      const topicName = topics.beginner[m * 10 + c] || `Beginner Concept ${clsNum}`;
      modClasses.push(makeClassItem(clsNum, "Beginner", topicName, `Module ${m + 1}`));
      classCounter++;
    }

    modules.push({
      id: `${courseId}-mod-${m + 1}`,
      title: `Module ${m + 1}: ${bgModulesTitles[m]} (Classes ${startNum}-${endNum})`,
      level: "Beginner",
      description: `Classes ${startNum} to ${endNum}: Master essential setup, syntax, and fundamental building blocks of ${courseName}.`,
      classes: modClasses,
      miniProject: {
        id: `${courseId}-miniproj-${m + 1}`,
        title: `Module ${m + 1} Mini Project: ${courseName} ${bgModulesTitles[m]} App`,
        description: `Build a complete, working mini-application in ${courseName} incorporating all concepts learned in Classes ${startNum} through ${endNum}.`,
        specifications: [
          `Implement proper variable scope, control flow, and input validation in ${courseName}`,
          `Handle user inputs and edge cases cleanly with descriptive output messages`,
          `Structure code with reusable functions and clear modular organization`
        ]
      }
    });
  }

  // 2. Intermediate Level (30 Classes -> 3 Modules)
  const intModulesTitles = [
    "Practical Application & Design Patterns",
    "Modular Architecture & Async Processing",
    "Database Design & Integration Workflows"
  ];

  for (let m = 0; m < 3; m++) {
    const modClasses: ClassItem[] = [];
    const startNum = 30 + m * 10 + 1;
    const endNum = startNum + 9;

    for (let c = 0; c < 10; c++) {
      const clsNum = startNum + c;
      const topicName = topics.intermediate[m * 10 + c] || `Intermediate Concept ${clsNum}`;
      modClasses.push(makeClassItem(clsNum, "Intermediate", topicName, `Module ${m + 4}`));
      classCounter++;
    }

    modules.push({
      id: `${courseId}-mod-${m + 4}`,
      title: `Module ${m + 4}: ${intModulesTitles[m]} (Classes ${startNum}-${endNum})`,
      level: "Intermediate",
      description: `Classes ${startNum} to ${endNum}: Build practical applications, master reactive state, asynchronous pipelines, and REST APIs.`,
      classes: modClasses,
      miniProject: {
        id: `${courseId}-miniproj-${m + 4}`,
        title: `Module ${m + 4} Mini Project: ${courseName} ${intModulesTitles[m]} Engine`,
        description: `Build an intermediate asynchronous service or REST data pipeline in ${courseName} covering Classes ${startNum} through ${endNum}.`,
        specifications: [
          `Implement object-oriented design patterns and asynchronous request handling`,
          `Connect to local database/file storage and parse structured JSON payloads`,
          `Write comprehensive unit test cases and error boundary checks`
        ]
      }
    });
  }

  // 3. Advanced Level (30 Classes -> 3 Modules)
  const advModulesTitles = [
    "Enterprise Systems & Low-Level Optimization",
    "High Concurrency, Security & Cloud Scaling",
    "Distributed Architecture & Chaos Resilience"
  ];

  for (let m = 0; m < 3; m++) {
    const modClasses: ClassItem[] = [];
    const startNum = 60 + m * 10 + 1;
    const endNum = startNum + 9;

    for (let c = 0; c < 10; c++) {
      const clsNum = startNum + c;
      const topicName = topics.advanced[m * 10 + c] || `Advanced Concept ${clsNum}`;
      modClasses.push(makeClassItem(clsNum, "Advanced", topicName, `Module ${m + 7}`));
      classCounter++;
    }

    modules.push({
      id: `${courseId}-mod-${m + 7}`,
      title: `Module ${m + 7}: ${advModulesTitles[m]} (Classes ${startNum}-${endNum})`,
      level: "Advanced",
      description: `Classes ${startNum} to ${endNum}: Professional enterprise engineering, security hardening, cloud scaling, and low-latency tuning.`,
      classes: modClasses,
      miniProject: {
        id: `${courseId}-miniproj-${m + 7}`,
        title: `Module ${m + 7} Mini Project: ${courseName} ${advModulesTitles[m]} Service`,
        description: `Design and implement an enterprise-grade high-concurrency microservice or system tool in ${courseName} covering Classes ${startNum} through ${endNum}.`,
        specifications: [
          `Architect high-throughput async processing or memory-optimized algorithms`,
          `Incorporate security hardening, rate-limiting, and open telemetry logging`,
          `Achieve zero memory leaks and zero unhandled exception crashes under simulated load`
        ]
      }
    });
  }

  // 4. Extra / Masterclass Level (10 Classes -> 1 Module)
  const extraClasses: ClassItem[] = [];
  for (let c = 0; c < 10; c++) {
    const clsNum = 91 + c;
    const topicName = topics.extra[c] || `Career & Capstone Topic ${clsNum}`;
    extraClasses.push(makeClassItem(clsNum, "Extra", topicName, "Module 10"));
  }

  modules.push({
    id: `${courseId}-mod-10`,
    title: `Module 10: Portfolio Capstone, Interview Prep & Deployment (Classes 91-100)`,
    level: "Extra",
    description: `Classes 91 to 100: Career acceleration, GitHub portfolio project, mock interviews, CI/CD, cloud deployment, and final capstone presentation.`,
    classes: extraClasses,
    miniProject: {
      id: `${courseId}-miniproj-10`,
      title: `Module 10 Mini Project: GitHub Portfolio Repository & CI/CD Pipeline`,
      description: `Publish a clean production GitHub repository with automated linting, unit tests, Docker containerization, and deployment configuration.`,
      specifications: [
        `Write professional README.md with system architecture diagrams and setup guide`,
        `Set up GitHub Actions CI/CD pipeline running automated build and test suites`,
        `Deploy live application or CLI package to production cloud host`
      ]
    }
  });

  return {
    id: courseId,
    name: courseName,
    category,
    courseGoal: goalText,
    shortDescription: descText,
    fullDescription: `${descText} Fully designed with an intentional 100-class progression covering Beginner (30 classes), Intermediate (30 classes), Advanced (30 classes), and Extra Career Capstone (10 classes).`,
    requiredLevel: "Beginner to Advanced (100 Classes)",
    targetStudentLevel: "All Levels (Beginner to Senior)",
    requiredSkills: [
      "Basic computer literacy & command line access",
      `Genuine interest in mastering ${category}`,
      "Dedication to complete all 100 classes"
    ],
    learningOutcomes: [
      `Build production-grade applications using ${courseName}`,
      `Master problem-solving from fundamental syntax to distributed enterprise architecture`,
      `Complete 100 practical exercises and a portfolio-ready capstone project`,
      `Receive an official JOXIQ AI Learning Academy verified certificate`
    ],
    curriculumRoadmap: {
      beginnerGoals: topics.beginner.slice(0, 5),
      intermediateGoals: topics.intermediate.slice(0, 5),
      advancedGoals: topics.advanced.slice(0, 5),
      extraCareerGoals: topics.extra.slice(0, 5)
    },
    icon: category === "AI Engineering" ? "BrainCircuit" : category === "Web Development" ? "Globe" : category === "App Development" ? "Smartphone" : category === "Business Courses" ? "Briefcase" : "Code2",
    gradientColor: category === "AI Engineering" ? "from-purple-600 to-indigo-700" : category === "Web Development" ? "from-cyan-600 to-blue-700" : "from-blue-600 to-violet-700",
    rating: 4.95,
    enrolledCount: 1200,
    estimatedHours: 45,
    totalClasses: 100,
    freeClassesCount: 5,
    modules,
    levelProjects: [
      {
        level: "Beginner",
        title: `Beginner Major Project: ${courseName} Fundamental Core Suite`,
        description: `Comprehensive 30-class capstone project integrating variables, control flow, functions, collections, and error handling in ${courseName}.`,
        specifications: [
          `Build an interactive CLI or GUI utility in ${courseName}`,
          `Implement robust input validation, data storage, and error handling`,
          `Demonstrate clean function structure and modular code separation`
        ]
      },
      {
        level: "Intermediate",
        title: `Intermediate Major Project: ${courseName} Full Application & REST Service`,
        description: `Comprehensive 30-class major project building a multi-module RESTful web service or async data pipeline with database persistence in ${courseName}.`,
        specifications: [
          `Implement full CRUD database persistence and authentication/authorization logic`,
          `Structure code using object-oriented design patterns and service layers`,
          `Write automated integration tests and API documentation`
        ]
      },
      {
        level: "Advanced",
        title: `Advanced Major Project: ${courseName} Enterprise System Architecture`,
        description: `Comprehensive 30-class major project building a high-performance, fault-tolerant enterprise system with microservices or low-latency concurrency in ${courseName}.`,
        specifications: [
          `Architect high-concurrency stream processing or async event broker`,
          `Incorporate security hardening, Docker containerization, and rate limiting`,
          `Conduct load testing, performance profiling, and memory optimization`
        ]
      }
    ],
    portfolioProject: {
      title: `Full 100-Class Professional Portfolio Capstone: Production ${courseName} Ecosystem`,
      description: `Complete, end-to-end professional portfolio project showcasing full-stack ${courseName} mastery across all 100 classes. Ready for resume presentation and technical employer reviews.`,
      specifications: [
        `Production-grade architecture with backend service, database layer, and clean client/CLI interface`,
        `Complete test coverage, continuous integration, Docker container, and cloud deployment`,
        `Verified JOXIQ AI Learning Academy Capstone Badge & Official Certificate`
      ]
    }
  };
}

/**
 * Saves a complete 100-class course curriculum to Firebase Firestore
 */
export async function saveCourseCurriculumToFirestore(
  course: Course
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, course.id);
    await setDoc(docRef, {
      ...course,
      updatedAt: new Date().toISOString()
    });

    // Also persist in secondary curriculum collection for quick audit
    const currRef = doc(db, CURRICULUMS_COLLECTION, course.id);
    await setDoc(currRef, {
      courseId: course.id,
      courseName: course.name,
      category: course.category,
      totalClasses: course.totalClasses || 100,
      courseGoal: course.courseGoal,
      learningOutcomes: course.learningOutcomes,
      modules: course.modules,
      updatedAt: new Date().toISOString()
    });

    AutomationLogger.logActivity(
      "100-Class Curriculum Saved",
      `Saved complete 100-class curriculum for '${course.name}' (${course.id}) to Firestore.`
    );

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save curriculum to Firestore:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches course curriculum from Firestore or generates fallback
 */
export async function fetchCourseCurriculumFromFirestore(
  courseId: string
): Promise<Course | null> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as Course;
    }
    return null;
  } catch (err) {
    console.warn("Failed fetching course curriculum from Firestore:", err);
    return null;
  }
}
