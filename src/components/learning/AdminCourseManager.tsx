import React, { useState } from "react";
import { CourseContentManagementSystem } from "./CourseContentManagementSystem";
import {
  Course,
  CourseCategory,
  CourseLevel,
  CourseModule,
  ClassItem,
  ClassQuizQuestion,
  ClassExample
} from "../../types/learning";
import { build100ClassCurriculum, saveCourseCurriculumToFirestore } from "../../services/courseCurriculumService";
import { ProjectRequirement } from "../../types/projectBuilder";
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Layers,
  BookOpen,
  HelpCircle,
  Rocket,
  Check,
  X,
  Sparkles,
  Search,
  Lock,
  Unlock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  ChevronRight,
  Settings,
  Crown,
  Zap,
  ListOrdered,
  Tag,
  Code2,
  BrainCircuit,
  Globe,
  Smartphone,
  Briefcase,
  Database
} from "lucide-react";

interface AdminCourseManagerProps {
  courses: Course[];
  projects: ProjectRequirement[];
  onSaveCourses: (updatedCourses: Course[]) => void;
  onSaveProjects: (updatedProjects: ProjectRequirement[]) => void;
  onNavigateToCourse: (courseId: string) => void;
  isProMember?: boolean;
}

type AdminTab =
  | "cms"
  | "courses"
  | "curriculum"
  | "classes"
  | "quizzes"
  | "projects"
  | "aigenerator";

export const AdminCourseManager: React.FC<AdminCourseManagerProps> = ({
  courses,
  projects,
  onSaveCourses,
  onSaveProjects,
  onNavigateToCourse,
  isProMember = false
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  // Selected entities for editing
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length > 0 ? courses[0].id : ""
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Modals / Form Drawers
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<CourseModule> | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Partial<ClassItem> | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<ProjectRequirement> | null>(null);

  // Status Notification Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0] || null;
  const currentModule = currentCourse?.modules.find((m) => m.id === selectedModuleId) || currentCourse?.modules[0] || null;
  const currentClass = currentModule?.classes.find((cl) => cl.id === selectedClassId) || currentModule?.classes[0] || null;

  // Filtered courses list
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "All" || c.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Category options
  const categoryList: CourseCategory[] = [
    "Programming Languages",
    "AI Engineering",
    "Web Development",
    "App Development",
    "Business Courses",
    "Other Skills"
  ];

  // Icons list for selection
  const iconOptions = ["Code2", "BrainCircuit", "Globe", "Smartphone", "Briefcase", "ShieldCheck", "Sparkles", "Rocket"];

  // Gradients list for selection
  const gradientOptions = [
    "from-blue-600 to-indigo-700",
    "from-violet-600 to-purple-800",
    "from-cyan-600 to-blue-700",
    "from-emerald-600 to-teal-700",
    "from-amber-600 to-orange-700",
    "from-rose-600 to-pink-700",
    "from-purple-600 to-pink-700"
  ];

  // ==================== COURSE ACTIONS ====================
  const handleOpenNewCourse = () => {
    setEditingCourse({
      id: `course-${Date.now()}`,
      name: "",
      category: "Programming Languages",
      courseGoal: "",
      shortDescription: "",
      fullDescription: "",
      requiredLevel: "Beginner",
      icon: "Code2",
      gradientColor: "from-blue-600 to-indigo-700",
      rating: 4.9,
      enrolledCount: 1,
      estimatedHours: 20,
      totalClasses: 0,
      freeClassesCount: 5,
      modules: []
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse({ ...course });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourseForm = () => {
    if (!editingCourse || !editingCourse.name) {
      showToast("Course name is required.");
      return;
    }

    const courseId = editingCourse.id || `course-${Date.now()}`;
    const exists = courses.some((c) => c.id === courseId);

    const fullCourse: Course = {
      id: courseId,
      name: editingCourse.name || "Untitled Course",
      category: editingCourse.category || "Programming Languages",
      courseGoal: editingCourse.courseGoal || "Master key skills",
      shortDescription: editingCourse.shortDescription || "Comprehensive learning course.",
      fullDescription: editingCourse.fullDescription || "Full course details and curriculum.",
      requiredLevel: editingCourse.requiredLevel || "Beginner",
      icon: editingCourse.icon || "Code2",
      gradientColor: editingCourse.gradientColor || "from-blue-600 to-indigo-700",
      rating: editingCourse.rating || 4.9,
      enrolledCount: editingCourse.enrolledCount || 10,
      estimatedHours: editingCourse.estimatedHours || 20,
      totalClasses: editingCourse.modules?.reduce((acc, m) => acc + m.classes.length, 0) || 0,
      modules: editingCourse.modules || [],
      freeClassesCount: editingCourse.freeClassesCount || 5
    };

    let updatedList: Course[];
    if (exists) {
      updatedList = courses.map((c) => (c.id === courseId ? fullCourse : c));
    } else {
      updatedList = [fullCourse, ...courses];
    }

    onSaveCourses(updatedList);
    setSelectedCourseId(courseId);
    setIsCourseModalOpen(false);
    setEditingCourse(null);
    showToast(exists ? "Course updated successfully!" : "New course created successfully!");
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Are you sure you want to delete this course and all its modules/classes?")) {
      const updated = courses.filter((c) => c.id !== courseId);
      onSaveCourses(updated);
      if (selectedCourseId === courseId && updated.length > 0) {
        setSelectedCourseId(updated[0].id);
      }
      showToast("Course deleted.");
    }
  };

  const handleGenerate100ClassCurriculumForCourse = async (targetCourse: Course) => {
    try {
      const full100Course = build100ClassCurriculum(
        targetCourse.id,
        targetCourse.name,
        targetCourse.category,
        targetCourse.courseGoal,
        targetCourse.shortDescription
      );

      const updatedList = courses.map((c) => (c.id === targetCourse.id ? full100Course : c));
      onSaveCourses(updatedList);

      // Save to Firebase
      await saveCourseCurriculumToFirestore(full100Course);
      showToast(`Generated and saved complete 100-class curriculum for '${targetCourse.name}' to Firebase!`);
    } catch (err: any) {
      showToast(`Error generating curriculum: ${err.message}`);
    }
  };

  const handleSaveCurriculumToFirebase = async (targetCourse: Course) => {
    try {
      await saveCourseCurriculumToFirestore(targetCourse);
      showToast(`100-Class Curriculum for '${targetCourse.name}' saved to Firebase Firestore!`);
    } catch (err: any) {
      showToast(`Firebase save failed: ${err.message}`);
    }
  };

  // ==================== MODULE ACTIONS ====================
  const handleOpenNewModule = () => {
    if (!currentCourse) return;
    setEditingModule({
      id: `mod-${Date.now()}`,
      title: "",
      level: "Beginner",
      description: "",
      classes: [],
      isProOnly: false
    });
    setIsModuleModalOpen(true);
  };

  const handleSaveModuleForm = () => {
    if (!currentCourse || !editingModule || !editingModule.title) return;

    const modId = editingModule.id || `mod-${Date.now()}`;
    const newMod: CourseModule = {
      id: modId,
      title: editingModule.title || "New Module",
      level: editingModule.level || "Beginner",
      description: editingModule.description || "",
      classes: editingModule.classes || [],
      isProOnly: editingModule.isProOnly || false
    };

    const exists = currentCourse.modules.some((m) => m.id === modId);
    let updatedModules: CourseModule[];

    if (exists) {
      updatedModules = currentCourse.modules.map((m) => (m.id === modId ? newMod : m));
    } else {
      updatedModules = [...currentCourse.modules, newMod];
    }

    const updatedCourse: Course = {
      ...currentCourse,
      modules: updatedModules,
      totalClasses: updatedModules.reduce((acc, m) => acc + m.classes.length, 0)
    };

    const updatedCourses = courses.map((c) => (c.id === currentCourse.id ? updatedCourse : c));
    onSaveCourses(updatedCourses);
    setSelectedModuleId(modId);
    setIsModuleModalOpen(false);
    setEditingModule(null);
    showToast("Module saved successfully!");
  };

  const handleMoveModule = (direction: "up" | "down", modIndex: number) => {
    if (!currentCourse) return;
    const modules = [...currentCourse.modules];
    const targetIndex = direction === "up" ? modIndex - 1 : modIndex + 1;

    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const temp = modules[modIndex];
    modules[modIndex] = modules[targetIndex];
    modules[targetIndex] = temp;

    const updatedCourse = { ...currentCourse, modules };
    onSaveCourses(courses.map((c) => (c.id === currentCourse.id ? updatedCourse : c)));
    showToast("Module reordered.");
  };

  const handleDeleteModule = (modId: string) => {
    if (!currentCourse) return;
    if (confirm("Delete this module and all its classes?")) {
      const updatedModules = currentCourse.modules.filter((m) => m.id !== modId);
      const updatedCourse = {
        ...currentCourse,
        modules: updatedModules,
        totalClasses: updatedModules.reduce((acc, m) => acc + m.classes.length, 0)
      };
      onSaveCourses(courses.map((c) => (c.id === currentCourse.id ? updatedCourse : c)));
      showToast("Module deleted.");
    }
  };

  // ==================== CLASS / LESSON ACTIONS ====================
  const handleOpenNewClass = () => {
    if (!currentCourse || !currentModule) return;
    const nextClassNum = (currentModule.classes.length || 0) + 1;
    setEditingClass({
      id: `${currentCourse.id}-cls-${Date.now()}`,
      classNumber: nextClassNum,
      title: "",
      learningObjective: "",
      duration: "25 mins",
      whatYouWillLearn: ["Topic fundamental concept", "Hands-on implementation"],
      realLifeUsage: {
        whyNeeded: "Solves real engineering challenges.",
        realWorldApplication: "Used in enterprise products and apps.",
        skillImpact: "Increases coding efficiency and mastery."
      },
      explanationTopic: "",
      examples: [
        {
          title: "Example Code",
          codeOrText: "// Sample Code Snippet\nconsole.log('Hello JOXIQ Learning');",
          explanation: "Step by step execution explanation."
        }
      ],
      practiceTask: "Implement the exercise described above.",
      homework: "Refactor your code and test edge cases.",
      quiz: [
        {
          id: `q-${Date.now()}`,
          question: "What is the primary benefit of this topic?",
          options: ["Speed & Performance", "Code Organization", "Maintainability", "All of the above"],
          correctOptionIndex: 3,
          explanation: "All listed items are benefits."
        }
      ],
      projectConnection: "Connects directly to the module project capstone.",
      isProOnly: currentModule.level !== "Beginner" || nextClassNum > 5,
      status: "Published"
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cl: ClassItem) => {
    setEditingClass({ ...cl });
    setIsClassModalOpen(true);
  };

  const handleSaveClassForm = () => {
    if (!currentCourse || !currentModule || !editingClass || !editingClass.title) return;

    const classId = editingClass.id || `${currentCourse.id}-cls-${Date.now()}`;

    const fullClass: ClassItem = {
      id: classId,
      classNumber: editingClass.classNumber || 1,
      title: editingClass.title || "Untitled Lesson",
      duration: editingClass.duration || "20 mins",
      learningObjective: editingClass.learningObjective || "Understand key concept.",
      whatYouWillLearn: editingClass.whatYouWillLearn || ["Core concepts"],
      realLifeUsage: editingClass.realLifeUsage || {
        whyNeeded: "Essential for modern projects.",
        realWorldApplication: "Used in real industry software.",
        skillImpact: "Enhances practical capability."
      },
      explanationTopic: editingClass.explanationTopic || editingClass.title || "",
      examples: editingClass.examples || [],
      practiceTask: editingClass.practiceTask || "Practice exercise",
      homework: editingClass.homework || "Self review",
      quiz: editingClass.quiz || [],
      projectConnection: editingClass.projectConnection || "",
      isProOnly: editingClass.isProOnly ?? false,
      status: editingClass.status || "Published"
    };

    const exists = currentModule.classes.some((cl) => cl.id === classId);
    let updatedClasses: ClassItem[];

    if (exists) {
      updatedClasses = currentModule.classes.map((cl) => (cl.id === classId ? fullClass : cl));
    } else {
      updatedClasses = [...currentModule.classes, fullClass];
    }

    const updatedModule = { ...currentModule, classes: updatedClasses };
    const updatedModules = currentCourse.modules.map((m) => (m.id === currentModule.id ? updatedModule : m));
    const updatedCourse = {
      ...currentCourse,
      modules: updatedModules,
      totalClasses: updatedModules.reduce((acc, m) => acc + m.classes.length, 0)
    };

    onSaveCourses(courses.map((c) => (c.id === currentCourse.id ? updatedCourse : c)));
    setSelectedClassId(classId);
    setIsClassModalOpen(false);
    setEditingClass(null);
    showToast("Class saved successfully!");
  };

  const handleMoveClass = (direction: "up" | "down", classIndex: number) => {
    if (!currentCourse || !currentModule) return;
    const classes = [...currentModule.classes];
    const targetIndex = direction === "up" ? classIndex - 1 : classIndex + 1;

    if (targetIndex < 0 || targetIndex >= classes.length) return;

    const temp = classes[classIndex];
    classes[classIndex] = classes[targetIndex];
    classes[targetIndex] = temp;

    // re-number classes sequentially
    const renumbered = classes.map((c, idx) => ({ ...c, classNumber: idx + 1 }));

    const updatedModule = { ...currentModule, classes: renumbered };
    const updatedModules = currentCourse.modules.map((m) => (m.id === currentModule.id ? updatedModule : m));
    const updatedCourse = { ...currentCourse, modules: updatedModules };

    onSaveCourses(courses.map((c) => (c.id === currentCourse.id ? updatedCourse : c)));
    showToast("Class reordered.");
  };

  const handleDeleteClass = (classId: string) => {
    if (!currentCourse || !currentModule) return;
    if (confirm("Delete this lesson class?")) {
      const updatedClasses = currentModule.classes.filter((cl) => cl.id !== classId);
      const updatedModule = { ...currentModule, classes: updatedClasses };
      const updatedModules = currentCourse.modules.map((m) => (m.id === currentModule.id ? updatedModule : m));
      const updatedCourse = {
        ...currentCourse,
        modules: updatedModules,
        totalClasses: updatedModules.reduce((acc, m) => acc + m.classes.length, 0)
      };

      onSaveCourses(courses.map((c) => (c.id === currentCourse.id ? updatedCourse : c)));
      showToast("Class deleted.");
    }
  };

  // ==================== PROJECT ACTIONS ====================
  const handleOpenNewProject = () => {
    setEditingProject({
      id: `proj-${Date.now()}`,
      title: "",
      category: "Programming",
      difficulty: "Beginner",
      description: "",
      courseId: selectedCourseId,
      courseName: currentCourse?.name || "",
      skillsUsed: ["TypeScript", "API Design"],
      estimatedHours: 4,
      prerequisites: ["Basic coding knowledge"],
      deliverables: ["Source code", "Documentation"],
      steps: [
        {
          stepNumber: 1,
          title: "Project Setup",
          description: "Initialize your project workspace.",
          tasks: ["Create repository", "Configure dependencies"]
        }
      ],
      starterCodeOrPlan: "// Starter template code\nconsole.log('Project Start');",
      testCases: ["Test basic initialization"],
      improvementPrompts: ["Add unit tests"]
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProjectForm = () => {
    if (!editingProject || !editingProject.title) return;

    const projId = editingProject.id || `proj-${Date.now()}`;
    const fullProject: ProjectRequirement = {
      id: projId,
      title: editingProject.title || "New Project",
      category: editingProject.category || "Programming",
      difficulty: editingProject.difficulty || "Beginner",
      description: editingProject.description || "Practical project description.",
      courseId: editingProject.courseId || selectedCourseId,
      courseName: editingProject.courseName || currentCourse?.name || "",
      moduleId: editingProject.moduleId || currentModule?.id,
      moduleTitle: editingProject.moduleTitle || currentModule?.title,
      connectedClassNumber: editingProject.connectedClassNumber || 5,
      skillsUsed: editingProject.skillsUsed || ["Skill A"],
      estimatedHours: editingProject.estimatedHours || 3,
      prerequisites: editingProject.prerequisites || [],
      deliverables: editingProject.deliverables || ["Final app code"],
      steps: editingProject.steps || [],
      starterCodeOrPlan: editingProject.starterCodeOrPlan || "// Starter template",
      testCases: editingProject.testCases || [],
      improvementPrompts: editingProject.improvementPrompts || []
    };

    const exists = projects.some((p) => p.id === projId);
    let updatedProjects: ProjectRequirement[];

    if (exists) {
      updatedProjects = projects.map((p) => (p.id === projId ? fullProject : p));
    } else {
      updatedProjects = [fullProject, ...projects];
    }

    onSaveProjects(updatedProjects);
    setIsProjectModalOpen(false);
    setEditingProject(null);
    showToast("Project saved successfully!");
  };

  const handleDeleteProject = (projId: string) => {
    if (confirm("Delete this project from Project Builder?")) {
      const updated = projects.filter((p) => p.id !== projId);
      onSaveProjects(updated);
      showToast("Project deleted.");
    }
  };

  // ==================== AI QUICK GENERATOR ====================
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiCourse = () => {
    if (!aiTopicInput.trim()) {
      showToast("Please enter a course topic first.");
      return;
    }

    setIsGeneratingAi(true);

    setTimeout(() => {
      const newCourseId = `course-ai-${Date.now()}`;
      const topicName = aiTopicInput.trim();

      const generatedModules: CourseModule[] = [
        {
          id: `mod-ai-1`,
          title: `Module 1: Fundamentals of ${topicName}`,
          level: "Beginner",
          description: `Learn foundational concepts, setup, and key syntax for ${topicName}.`,
          isProOnly: false,
          classes: [
            {
              id: `${newCourseId}-cls-1`,
              classNumber: 1,
              title: `Introduction to ${topicName}`,
              learningObjective: `Understand why ${topicName} matters and set up your workspace.`,
              duration: "15 mins",
              whatYouWillLearn: [`Why use ${topicName}`, `Environment setup`, `First execution`],
              realLifeUsage: {
                whyNeeded: `Industry standard approach for high efficiency.`,
                realWorldApplication: `Used in modern web, AI, and enterprise backends.`,
                skillImpact: `Establishes core engineering capability.`
              },
              explanationTopic: `Getting Started with ${topicName}`,
              examples: [
                {
                  title: "First Hello World Example",
                  codeOrText: `// Welcome to ${topicName}\nfunction start() {\n  console.log("Welcome to ${topicName} Course!");\n}\nstart();`,
                  explanation: "Simple execution entrypoint."
                }
              ],
              practiceTask: `Run your first ${topicName} script and inspect the output log.`,
              homework: `Modify the output text to include your own custom greeting.`,
              quiz: [
                {
                  id: `q-ai-1`,
                  question: `What is the primary objective of learning ${topicName}?`,
                  options: [
                    `To automate key tasks and build software`,
                    `To increase code complexity`,
                    `To avoid testing`,
                    `None of the above`
                  ],
                  correctOptionIndex: 0,
                  explanation: `${topicName} provides structured tools for automated software delivery.`
                }
              ],
              projectConnection: `Forms step 1 of your capstone portfolio project.`,
              isProOnly: false,
              status: "Published"
            },
            {
              id: `${newCourseId}-cls-2`,
              classNumber: 2,
              title: `Core Architecture & Data Structures in ${topicName}`,
              learningObjective: `Master variables, arrays, objects, and memory handling.`,
              duration: "25 mins",
              whatYouWillLearn: [`Data types`, `Collections`, `Optimization tips`],
              realLifeUsage: {
                whyNeeded: `Ensures memory efficiency and clean data flow.`,
                realWorldApplication: `Prevents memory leaks in large production apps.`,
                skillImpact: `Improves algorithmic thinking.`
              },
              explanationTopic: `Data Structures Deep Dive`,
              examples: [
                {
                  title: "Data Operations",
                  codeOrText: `const dataset = [10, 20, 30, 40];\nconst doubled = dataset.map(x => x * 2);\nconsole.log(doubled);`,
                  explanation: "Functional data transformations."
                }
              ],
              practiceTask: `Filter and transform an array of sample records.`,
              homework: `Write a function that calculates total and average values.`,
              quiz: [
                {
                  id: `q-ai-2`,
                  question: `Which data structure offers fast O(1) lookups by key?`,
                  options: ["Array", "Linked List", "Map / Hash Table", "Queue"],
                  correctOptionIndex: 2,
                  explanation: "Hash maps provide near instant key-based lookup."
                }
              ],
              projectConnection: `Powers data persistence in your capstone app.`,
              isProOnly: false,
              status: "Published"
            }
          ]
        },
        {
          id: `mod-ai-2`,
          title: `Module 2: Advanced Patterns & System Design`,
          level: "Intermediate",
          description: `Build scalable modules, async pipelines, and handle errors gracefully.`,
          isProOnly: true,
          classes: [
            {
              id: `${newCourseId}-cls-3`,
              classNumber: 3,
              title: `Async Logic & API Integrations`,
              learningObjective: `Connect to cloud APIs, handle promises, and manage async state.`,
              duration: "30 mins",
              whatYouWillLearn: [`Async / Await`, `Error Handling`, `API fetching`],
              realLifeUsage: {
                whyNeeded: `Crucial for real-time live data applications.`,
                realWorldApplication: `Powers microservices and dynamic frontend dashboards.`,
                skillImpact: `Enables backend/frontend integration.`
              },
              explanationTopic: `Asynchronous Execution Patterns`,
              examples: [
                {
                  title: "Async Fetcher",
                  codeOrText: `async function fetchData() {\n  try {\n    const res = await fetch('/api/data');\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}`,
                  explanation: "Resilient async wrapper pattern."
                }
              ],
              practiceTask: `Implement retry logic for failed API calls.`,
              homework: `Add a timeout handler to promise execution.`,
              quiz: [
                {
                  id: `q-ai-3`,
                  question: `What does 'await' do inside an async function?`,
                  options: [
                    `Pauses function execution until Promise resolves`,
                    `Blocks the entire thread permanently`,
                    `Cancels network requests`,
                    `Turns JS into C++`
                  ],
                  correctOptionIndex: 0,
                  explanation: "Await pauses the async function non-blockingly until the Promise fulfills."
                }
              ],
              projectConnection: `Connects your project to live backend services.`,
              isProOnly: true,
              status: "Published"
            }
          ]
        }
      ];

      const newCourse: Course = {
        id: newCourseId,
        name: `${topicName} Masterclass`,
        category: "AI Engineering",
        courseGoal: `Master ${topicName} from zero to production engineering expert.`,
        shortDescription: `Complete hands-on guide covering ${topicName} syntax, patterns, and capstone project.`,
        fullDescription: `Master ${topicName} with step-by-step interactive lessons, code examples, quizzes, and practical project deliverables.`,
        requiredLevel: "Beginner to Advanced",
        icon: "BrainCircuit",
        gradientColor: "from-violet-600 to-purple-800",
        rating: 5.0,
        enrolledCount: 1,
        estimatedHours: 25,
        totalClasses: 3,
        freeClassesCount: 2,
        modules: generatedModules
      };

      const updated = [newCourse, ...courses];
      onSaveCourses(updated);
      setSelectedCourseId(newCourseId);
      setIsGeneratingAi(false);
      setAiTopicInput("");
      setActiveAdminTab("courses");
      showToast(`AI successfully generated '${newCourse.name}' with full curriculum!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header & Toast Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/90 border border-violet-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-0.5 shadow-lg shadow-violet-600/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-violet-300">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  JOXIQ AI Admin Course Manager
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  Owner / Creator Access
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Manage courses, curriculum hierarchy, classes, quizzes, projects, free/pro access, and content status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewCourse}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>
        </div>

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Admin Horizontal Management Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveAdminTab("cms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === "cms"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400/50"
              : "bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/50"
          }`}
        >
          <Database className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>Course Content Management System (CMS)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("courses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === "courses"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Courses Catalog ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("curriculum")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === "curriculum"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Modules & Curriculum</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("classes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === "classes"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Classes & Lessons</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("quizzes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === "quizzes"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Quizzes & Questions</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === "projects"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Rocket className="w-4 h-4 shrink-0" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("aigenerator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap bg-gradient-to-r ${
            activeAdminTab === "aigenerator"
              ? "from-amber-500 to-orange-600 text-white shadow-lg"
              : "from-amber-500/10 to-orange-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>AI Course Generator</span>
        </button>
      </div>

      {/* TAB 0: CMS COURSE CONTENT MANAGEMENT SYSTEM */}
      {activeAdminTab === "cms" && (
        <CourseContentManagementSystem
          courses={courses}
          isProMember={isProMember}
        />
      )}

      {/* TAB 1: COURSES MANAGEMENT */}
      {activeAdminTab === "courses" && (
        <div className="space-y-6">
          {/* Search & Category Filter Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search course title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 shrink-0">Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 text-xs text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
              >
                <option value="All">All Categories</option>
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className={`bg-slate-950 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${
                  c.id === selectedCourseId
                    ? "border-violet-500 ring-1 ring-violet-500/50 shadow-xl"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-slate-900 border border-slate-800 text-violet-400">
                      {c.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedCourseId(c.id);
                          onNavigateToCourse(c.id);
                        }}
                        title="View Course Student Mode"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditCourse(c)}
                        title="Edit Course"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id)}
                        title="Delete Course"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white leading-snug">{c.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.shortDescription}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Level: {c.requiredLevel}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {c.modules.length} Modules
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {c.totalClasses} Classes
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      setActiveAdminTab("curriculum");
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span>Manage Syllabus ({c.totalClasses} Classes)</span>
                  </button>

                  <button
                    onClick={() => handleGenerate100ClassCurriculumForCourse(c)}
                    className="w-full py-1.5 bg-slate-950 hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3 h-3 text-emerald-400" />
                    <span>Sync 100-Class Curriculum to Firebase</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CURRICULUM & MODULE MANAGEMENT */}
      {activeAdminTab === "curriculum" && currentCourse && (
        <div className="space-y-6">
          {/* Course Selector & 100-Class Sync Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 shrink-0">Selected Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedModuleId("");
                }}
                className="bg-slate-950 text-xs font-bold text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500 max-w-md"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.totalClasses} Classes, {c.modules.length} Modules)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSaveCurriculumToFirebase(currentCourse)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save 100-Class Curriculum to Firebase</span>
              </button>

              <button
                onClick={() => handleGenerate100ClassCurriculumForCourse(currentCourse)}
                className="px-3 py-2 bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Re-build 100-Class Roadmap</span>
              </button>

              <button
                onClick={handleOpenNewModule}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          {/* Modules List for Selected Course */}
          <div className="space-y-4">
            {currentCourse.modules.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">No modules created yet for this course.</p>
                <button
                  onClick={handleOpenNewModule}
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create First Module
                </button>
              </div>
            ) : (
              currentCourse.modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className={`bg-slate-950 border rounded-2xl p-5 space-y-4 transition-all ${
                    mod.id === selectedModuleId
                      ? "border-violet-500/80 bg-violet-950/10"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900 border border-slate-800 text-violet-400">
                          {mod.level} Level
                        </span>
                        {mod.isProOnly && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> PRO ONLY
                          </span>
                        )}
                        <h4 className="text-base font-extrabold text-white">{mod.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{mod.description}</p>
                    </div>

                    {/* Actions & Reordering */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleMoveModule("up", idx)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveModule("down", idx)}
                        disabled={idx === currentCourse.modules.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingModule({ ...mod });
                          setIsModuleModalOpen(true);
                        }}
                        title="Edit Module"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        title="Delete Module"
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Class list inside Module */}
                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      {mod.classes.length} Lessons / Classes in this Module
                    </span>

                    <button
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setActiveAdminTab("classes");
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-violet-400" />
                      <span>Manage Lessons</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLASSES & LESSONS MANAGEMENT */}
      {activeAdminTab === "classes" && currentCourse && (
        <div className="space-y-6">
          {/* Course & Module Selectors */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Select Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedModuleId("");
                }}
                className="w-full bg-slate-950 text-xs font-bold text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Select Module:</label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full bg-slate-950 text-xs font-bold text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
              >
                {currentCourse.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.classes.length} classes)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Classes Table / List */}
          {currentModule ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  Classes in {currentModule.title}
                </h3>
                <button
                  onClick={handleOpenNewClass}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lesson / Class</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentModule.classes.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                    No classes added yet in this module. Click 'Add Lesson / Class' to create one.
                  </div>
                ) : (
                  currentModule.classes.map((cl, idx) => (
                    <div
                      key={cl.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-violet-400 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                          #{cl.classNumber}
                        </span>

                        <div className="min-w-0 truncate">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-white truncate">{cl.title}</h4>
                            {cl.isProOnly ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> PRO
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                FREE
                              </span>
                            )}

                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                                cl.status === "Published"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : cl.status === "Draft"
                                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {cl.status || "Published"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{cl.learningObjective}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => handleMoveClass("up", idx)}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveClass("down", idx)}
                          disabled={idx === currentModule.classes.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditClass(cl)}
                          title="Edit Class"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cl.id)}
                          title="Delete Class"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              Select a module above to view and manage its classes.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: QUIZZES MANAGEMENT */}
      {activeAdminTab === "quizzes" && currentCourse && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-950 text-xs font-bold text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Class / Lesson:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-950 text-xs font-bold text-white px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-violet-500"
              >
                {currentCourse.modules.flatMap((m) =>
                  m.classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      [{m.title}] Class #{cl.classNumber}: {cl.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {currentClass ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Quiz Manager for "{currentClass.title}"
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentClass.quiz?.length || 0} Questions configured
                  </p>
                </div>

                <button
                  onClick={() => {
                    handleOpenEditClass(currentClass);
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Quiz Questions in Lesson</span>
                </button>
              </div>

              <div className="space-y-4">
                {(!currentClass.quiz || currentClass.quiz.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No quiz questions set for this lesson yet. Click 'Edit Quiz Questions' above to add some.
                  </p>
                ) : (
                  currentClass.quiz.map((q, idx) => (
                    <div key={q.id || idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">
                          Q{idx + 1}: {q.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg border text-xs ${
                              optIdx === q.correctOptionIndex
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                            {optIdx === q.correctOptionIndex && " (Correct)"}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80 mt-2">
                          <span className="font-bold text-violet-400">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              Select a class above to inspect and edit its quiz questions.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROJECTS MANAGEMENT */}
      {activeAdminTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-extrabold text-white">JOXIQ Practical Builder Projects</h3>
              <p className="text-xs text-slate-400">Total {projects.length} capstone portfolio projects</p>
            </div>

            <button
              onClick={handleOpenNewProject}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-900 text-violet-400 border border-slate-800">
                      {p.category} • {p.difficulty}
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-1">{p.title}</h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingProject({ ...p });
                        setIsProjectModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>

                {p.courseName && (
                  <p className="text-[11px] text-violet-300 font-bold bg-violet-950/40 p-2 rounded-lg border border-violet-800/40">
                    Connected Course: {p.courseName}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {p.skillsUsed.map((sk, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AI COURSE GENERATOR */}
      {activeAdminTab === "aigenerator" && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400 tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Course Assistant
            </div>
            <h3 className="text-xl font-black text-white">Generate Full Course Curriculum with AI</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter any tech or skill topic (e.g. "Rust Systems Programming", "PyTorch Neural Networks", "Next.js 15 Fullstack"). JOXIQ AI will automatically build complete modules, beginner & intermediate classes, code examples, practice tasks, and quiz questions!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
            <input
              type="text"
              value={aiTopicInput}
              onChange={(e) => setAiTopicInput(e.target.value)}
              placeholder="e.g. Docker & Kubernetes Infrastructure"
              className="w-full bg-slate-900 text-xs font-bold text-white px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-500"
            />

            <button
              onClick={handleGenerateAiCourse}
              disabled={isGeneratingAi}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Building Course...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* COURSE EDIT MODAL */}
      {isCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <h3 className="text-base font-extrabold text-white">
                {editingCourse.id && courses.some((c) => c.id === editingCourse.id)
                  ? "Edit Course Details"
                  : "Create New Course"}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Course Name *</label>
                <input
                  type="text"
                  value={editingCourse.name || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  placeholder="e.g. React & Next.js Masterclass"
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Category *</label>
                <select
                  value={editingCourse.category || "Programming Languages"}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, category: e.target.value as CourseCategory })
                  }
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-violet-500"
                >
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Short Description *</label>
                <input
                  type="text"
                  value={editingCourse.shortDescription || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                  placeholder="One line tagline summary..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Full Overview Description</label>
                <textarea
                  rows={3}
                  value={editingCourse.fullDescription || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, fullDescription: e.target.value })}
                  placeholder="Comprehensive description of what students will master..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Course Goal</label>
                <input
                  type="text"
                  value={editingCourse.courseGoal || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, courseGoal: e.target.value })}
                  placeholder="e.g. Build production web apps"
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Required Level</label>
                <select
                  value={editingCourse.requiredLevel || "Beginner"}
                  onChange={(e) => setEditingCourse({ ...editingCourse, requiredLevel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Beginner to Advanced">Beginner to Advanced</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Estimated Hours</label>
                <input
                  type="number"
                  value={editingCourse.estimatedHours || 20}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, estimatedHours: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Free Classes Count</label>
                <input
                  type="number"
                  value={editingCourse.freeClassesCount || 5}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, freeClassesCount: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-900">
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourseForm}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/30 cursor-pointer"
              >
                Save Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE EDIT MODAL */}
      {isModuleModalOpen && editingModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-base font-extrabold text-white">Configure Module</h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Module Title *</label>
                <input
                  type="text"
                  value={editingModule.title || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  placeholder="e.g. Module 1: Foundations & Core Logic"
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Level *</label>
                <select
                  value={editingModule.level || "Beginner"}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, level: e.target.value as CourseLevel })
                  }
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Extra">Extra</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingModule.description || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  placeholder="Overview of topics in this module..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modPro"
                  checked={editingModule.isProOnly || false}
                  onChange={(e) => setEditingModule({ ...editingModule, isProOnly: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-violet-600"
                />
                <label htmlFor="modPro" className="font-bold text-slate-300 cursor-pointer">
                  Pro Locked Module (Requires Pro Subscription)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-900">
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModuleForm}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLASS / LESSON EDIT MODAL */}
      {isClassModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <h3 className="text-base font-extrabold text-white">
                Class / Lesson Form Editor (#{editingClass.classNumber})
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Class Title *</label>
                <input
                  type="text"
                  value={editingClass.title || ""}
                  onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
                  placeholder="Lesson title..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Duration</label>
                <input
                  type="text"
                  value={editingClass.duration || "20 mins"}
                  onChange={(e) => setEditingClass({ ...editingClass, duration: e.target.value })}
                  placeholder="e.g. 20 mins"
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Learning Objective *</label>
                <input
                  type="text"
                  value={editingClass.learningObjective || ""}
                  onChange={(e) => setEditingClass({ ...editingClass, learningObjective: e.target.value })}
                  placeholder="What will student achieve after this lesson..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Lesson Topic & Content Text</label>
                <textarea
                  rows={4}
                  value={editingClass.explanationTopic || ""}
                  onChange={(e) => setEditingClass({ ...editingClass, explanationTopic: e.target.value })}
                  placeholder="Detailed lesson explanation content..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Practice Task</label>
                <textarea
                  rows={2}
                  value={editingClass.practiceTask || ""}
                  onChange={(e) => setEditingClass({ ...editingClass, practiceTask: e.target.value })}
                  placeholder="Hands-on coding exercise description..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Content Status</label>
                <select
                  value={editingClass.status || "Published"}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, status: e.target.value as any })
                  }
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Updated">Updated</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="clsPro"
                  checked={editingClass.isProOnly || false}
                  onChange={(e) => setEditingClass({ ...editingClass, isProOnly: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-violet-600"
                />
                <label htmlFor="clsPro" className="font-bold text-slate-300 cursor-pointer">
                  Pro Locked Class
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-900">
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClassForm}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Save Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT EDIT MODAL */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <h3 className="text-base font-extrabold text-white">Project Details Form</h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Project Title *</label>
                <input
                  type="text"
                  value={editingProject.title || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="e.g. AI Task Automation CLI Tool"
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={editingProject.category || "Programming"}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                >
                  <option value="Programming">Programming</option>
                  <option value="AI Engineering">AI Engineering</option>
                  <option value="Web Development">Web Development</option>
                  <option value="App Development">App Development</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="What will the student build..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-300 block mb-1">Starter Code / Plan</label>
                <textarea
                  rows={4}
                  value={editingProject.starterCodeOrPlan || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, starterCodeOrPlan: e.target.value })}
                  placeholder="Sample starter template code..."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-900">
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProjectForm}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
