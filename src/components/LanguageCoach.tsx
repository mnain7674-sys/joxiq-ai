import React, { useState, useEffect, useRef } from "react";
import {
  Languages,
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  Volume2,
  RefreshCw,
  Send,
  MessageSquare,
  Bookmark,
  ChevronRight,
  Flame,
  Brain,
  FileText,
  User,
  Check,
  AlertCircle,
  Lock,
  Crown,
  Play,
  ArrowRight,
  Star,
  CheckCircle,
  XCircle,
  Compass,
  BarChart3,
  ArrowLeft,
  Clock,
  Zap,
  GraduationCap,
  Search,
  Loader2
} from "lucide-react";
import Markdown from "react-markdown";

interface LanguageCoachProps {
  theme: "dark" | "light";
  userProfile: { name: string; email: string } | null;
  onStartLanguageChat: (language: string, level: string, feature: string) => void;
  isProUser: boolean;
  onUpgrade: () => void;
}

const LANGUAGES = [
  { name: "English", native: "English", flag: "🇬🇧" },
  { name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { name: "Korean", native: "한국어", flag: "🇰🇷" },
  { name: "Chinese", native: "中文", flag: "🇨🇳" },
  { name: "French", native: "Français", flag: "🇫🇷" },
  { name: "German", native: "Deutsch", flag: "🇩🇪" },
  { name: "Spanish", native: "Español", flag: "🇪🇸" },
  { name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
];

const NATIVE_LANGUAGES = [
  { name: "English", flag: "🇬🇧" },
  { name: "Bengali", flag: "🇧🇩" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Urdu", flag: "🇵🇰" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "Chinese", flag: "🇨🇳" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Korean", flag: "🇰🇷" },
  { name: "Turkish", flag: "🇹🇷" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Russian", flag: "🇷🇺" },
  { name: "Portuguese", flag: "🇵🇹" },
];

interface LessonItem {
  id: string;
  title: string;
  desc: string;
  type: "lesson" | "quiz" | "exam";
  estimatedMinutes: number;
}

const BEGINNER_LESSONS: LessonItem[] = [
  { id: "b1", title: "Introduction & Overview", desc: "Welcome to your language journey! Learn how to study effectively.", type: "lesson", estimatedMinutes: 5 },
  { id: "b2", title: "Alphabet & Phonetics", desc: "Master the fundamental sounds and alphabet letters.", type: "lesson", estimatedMinutes: 10 },
  { id: "b3", title: "Pronunciation Basics", desc: "Key accent and pronunciation rules for clear speech.", type: "lesson", estimatedMinutes: 10 },
  { id: "b4", title: "Essential Greetings", desc: "Hello, goodbye, please, thank you, and polite expressions.", type: "lesson", estimatedMinutes: 10 },
  { id: "b5", title: "Daily Words & Objects", desc: "Common everyday items around the house and street.", type: "lesson", estimatedMinutes: 15 },
  { id: "b6", title: "Numbers (1-100)", desc: "Count confidently and tell prices and quantities.", type: "lesson", estimatedMinutes: 12 },
  { id: "b7", title: "Colors & Shapes", desc: "Describe the visual world around you.", type: "lesson", estimatedMinutes: 10 },
  { id: "b8", title: "Family & Relationships", desc: "Talk about mother, father, friends, and relatives.", type: "lesson", estimatedMinutes: 12 },
  { id: "b9", title: "Days, Months & Time", desc: "Days of the week, months, seasons, and telling time.", type: "lesson", estimatedMinutes: 15 },
  { id: "b10", title: "Basic Grammar & Verbs", desc: "Understand subject pronouns and present tense verbs.", type: "lesson", estimatedMinutes: 20 },
  { id: "b11", title: "Simple Sentence Formation", desc: "Construct basic Subject-Verb-Object sentences.", type: "lesson", estimatedMinutes: 18 },
  { id: "b12", title: "Daily Conversation", desc: "Short dialogues for shopping, ordering food, and travel.", type: "lesson", estimatedMinutes: 15 },
  { id: "b13", title: "Beginner Listening Exercise", desc: "Train your ear with audio prompts and dictation practice.", type: "lesson", estimatedMinutes: 15 },
  { id: "b14", title: "Beginner Reading Comprehension", desc: "Read short paragraphs and understand key facts.", type: "lesson", estimatedMinutes: 15 },
  { id: "b15", title: "Writing Practice & Spelling", desc: "Practice writing correct sentences and spellings.", type: "lesson", estimatedMinutes: 15 },
  { id: "b16", title: "Vocabulary Review", desc: "Comprehensive review of all beginner words learned.", type: "lesson", estimatedMinutes: 12 },
  { id: "b17", title: "Beginner Mini Quiz", desc: "Test your knowledge with 10 adaptive questions.", type: "quiz", estimatedMinutes: 10 },
  { id: "b18", title: "Unit Test: Foundations", desc: "Comprehensive evaluation of basic grammar and vocabulary.", type: "quiz", estimatedMinutes: 15 },
  { id: "b19", title: "Beginner Final Exam", desc: "Pass this exam with 80%+ to unlock Intermediate level!", type: "exam", estimatedMinutes: 20 },
];

const INTERMEDIATE_LESSONS: LessonItem[] = [
  { id: "i1", title: "Intermediate Grammar & Tenses", desc: "Master past and future tenses, modal verbs, and conditionals.", type: "lesson", estimatedMinutes: 20 },
  { id: "i2", title: "Complex Sentence Structures", desc: "Connect clauses using conjunctions and relative pronouns.", type: "lesson", estimatedMinutes: 18 },
  { id: "i3", title: "Intermediate Reading Articles", desc: "Read news excerpts, stories, and cultural essays.", type: "lesson", estimatedMinutes: 20 },
  { id: "i4", title: "Listening Practice & Dictation", desc: "Follow natural speed conversations and dialogues.", type: "lesson", estimatedMinutes: 15 },
  { id: "i5", title: "Writing Paragraphs & Essays", desc: "Express opinions and construct multi-paragraph texts.", type: "lesson", estimatedMinutes: 25 },
  { id: "i6", title: "Conversation Practice & Fluency", desc: "Discuss hobbies, work, news, and personal experiences.", type: "lesson", estimatedMinutes: 20 },
  { id: "i7", title: "Story Reading & Analysis", desc: "Explore narrative literature and contextual meanings.", type: "lesson", estimatedMinutes: 20 },
  { id: "i8", title: "Vocabulary Expansion", desc: "Learn 300+ intermediate synonyms and useful phrases.", type: "lesson", estimatedMinutes: 18 },
  { id: "i9", title: "Idioms & Common Expressions", desc: "Sound natural with everyday native idioms and sayings.", type: "lesson", estimatedMinutes: 15 },
  { id: "i10", title: "Weekly Progress Test", desc: "Intermediate milestone evaluation test.", type: "quiz", estimatedMinutes: 15 },
  { id: "i11", title: "Intermediate Final Exam", desc: "Pass this exam to unlock Advanced level mastery!", type: "exam", estimatedMinutes: 25 },
];

const ADVANCED_LESSONS: LessonItem[] = [
  { id: "a1", title: "Fluent Conversation Mastery", desc: "Master effortless flow, impromptu speech, and subtle nuances.", type: "lesson", estimatedMinutes: 25 },
  { id: "a2", title: "Native Idioms & Slang Expressions", desc: "Understand regional dialects, slang, and cultural humor.", type: "lesson", estimatedMinutes: 20 },
  { id: "a3", title: "Business Language & Terminology", desc: "Corporate vocabulary, meetings, negotiations, and presentations.", type: "lesson", estimatedMinutes: 25 },
  { id: "a4", title: "Academic Language & Formal Writing", desc: "Formal discourse, essays, research papers, and rhetoric.", type: "lesson", estimatedMinutes: 30 },
  { id: "a5", title: "Professional Writing & Emails", desc: "Draft high-level business correspondence and reports.", type: "lesson", estimatedMinutes: 20 },
  { id: "a6", title: "Formal & Informal Communication", desc: "Adapt your register effortlessly to any social situation.", type: "lesson", estimatedMinutes: 20 },
  { id: "a7", title: "Presentation Skills & Public Speaking", desc: "Deliver compelling talks and structured arguments.", type: "lesson", estimatedMinutes: 25 },
  { id: "a8", title: "Debate Practice & Argumentation", desc: "Defend viewpoints and articulate complex thoughts.", type: "lesson", estimatedMinutes: 25 },
  { id: "a9", title: "Real-life Scenarios & Roleplay", desc: "Handle high-pressure diplomatic, medical, and legal situations.", type: "lesson", estimatedMinutes: 25 },
  { id: "a10", title: "Job Interview Practice", desc: "Master professional interview questions and answers.", type: "lesson", estimatedMinutes: 20 },
  { id: "a11", title: "Advanced Vocabulary & Phrasal Verbs", desc: "Master precise adjectives, verbs, and literary devices.", type: "lesson", estimatedMinutes: 20 },
  { id: "a12", title: "Advanced Syntax & Stylistics", desc: "Analyze rhetorical devices and sophisticated sentence flow.", type: "lesson", estimatedMinutes: 25 },
  { id: "a13", title: "Final Master Test", desc: "Demonstrate elite C1-C2 mastery to earn your Language Diploma.", type: "exam", estimatedMinutes: 30 },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const LanguageCoach: React.FC<LanguageCoachProps> = ({
  theme,
  userProfile,
  onStartLanguageChat,
  isProUser,
  onUpgrade,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    return localStorage.getItem("joxiq_lang_coach_lang") || "Spanish";
  });
  const [selectedLevel, setSelectedLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(() => {
    return (localStorage.getItem("joxiq_lang_coach_level") as any) || "Beginner";
  });
  const [nativeLang, setNativeLang] = useState<string>(() => {
    return localStorage.getItem("joxiq_native_lang") || "English";
  });

  // Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("joxiq_onboarding_completed") !== "true";
  });
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [tempLearningLang, setTempLearningLang] = useState<string>("Spanish");
  const [tempNativeLang, setTempNativeLang] = useState<string>("English");
  const [searchQueryLearn, setSearchQueryLearn] = useState("");
  const [searchQueryNative, setSearchQueryNative] = useState("");

  const [showNativeModal, setShowNativeModal] = useState<boolean>(false);
  const [customNativeInput, setCustomNativeInput] = useState("");
  const [showCustomNativeModal, setShowCustomNativeModal] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard" | "roadmap" | "chats" | "teacher">("dashboard");
  const [customLangInput, setCustomLangInput] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Dedicated Learning Chat State
  const [activeLessonChat, setActiveLessonChat] = useState<LessonItem | null>(null);
  const [lessonMessages, setLessonMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lesson Completion Screen States
  const [showLessonCompletedScreen, setShowLessonCompletedScreen] = useState(false);
  const [completedLessonSummary, setCompletedLessonSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Completed lessons storage per language
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`joxiq_completed_${selectedLang}`);
      return saved ? JSON.parse(saved) : ["b1"];
    } catch {
      return ["b1"];
    }
  });

  // Last visited lesson for Resume Learning
  const [lastLesson, setLastLesson] = useState<{ level: string; lesson: LessonItem } | null>(() => {
    try {
      const saved = localStorage.getItem(`joxiq_last_lesson_${selectedLang}`);
      return saved ? JSON.parse(saved) : { level: "Beginner", lesson: BEGINNER_LESSONS[0] };
    } catch {
      return { level: "Beginner", lesson: BEGINNER_LESSONS[0] };
    }
  });

  // AI Teacher General Assistant State
  const [teacherPrompt, setTeacherPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem("joxiq_lang_coach_lang", selectedLang);
    try {
      const saved = localStorage.getItem(`joxiq_completed_${selectedLang}`);
      setCompletedLessons(saved ? JSON.parse(saved) : ["b1"]);
      
      const savedLast = localStorage.getItem(`joxiq_last_lesson_${selectedLang}`);
      if (savedLast) {
        setLastLesson(JSON.parse(savedLast));
      } else {
        setLastLesson({ level: "Beginner", lesson: BEGINNER_LESSONS[0] });
      }
    } catch {
      setCompletedLessons(["b1"]);
    }
  }, [selectedLang]);

  useEffect(() => {
    localStorage.setItem("joxiq_lang_coach_level", selectedLevel);
  }, [selectedLevel]);

  useEffect(() => {
    localStorage.setItem("joxiq_native_lang", nativeLang);
  }, [nativeLang]);

  // Load chat messages when activeLessonChat changes
  useEffect(() => {
    if (activeLessonChat) {
      const storageKey = `joxiq_lesson_chat_${selectedLang}_${activeLessonChat.id}`;
      try {
        const savedChat = localStorage.getItem(storageKey);
        if (savedChat) {
          setLessonMessages(JSON.parse(savedChat));
        } else {
          // Initialize with comprehensive professional classroom lesson
          const initialWelcome: ChatMessage = {
            role: "assistant",
            content: `👋 **Welcome to your premium ${selectedLang} Classroom Session!**\n\nI am your dedicated professional Language Teacher. Today we are diving deep into **${activeLessonChat.title}** (${activeLessonChat.desc}).\n\n### 🗣️ Teaching Setup\n* **Your Native Language**: ${nativeLang}\n* **Target Language**: ${selectedLang} (${selectedLevel})\n* **Instruction Style**: All grammar rules, explanations, and corrections will be explained in **${nativeLang}**, while vocabulary and examples will be in **${selectedLang}** with phonetic guides.\n\n### 🎓 Today's Complete Learning Flow\n1. **In-Depth Explanation**: Simple, step-by-step concepts assuming zero prior knowledge.\n2. **Real-Life Examples & Usage**: Exactly where, when, and how native speakers use these terms.\n3. **Common Mistakes & Why They Happen**: Pitfalls beginners make and how to avoid them.\n4. **Interactive Practice & Quiz**: Engaging exercises with feedback and final quiz evaluation to unlock your next lesson.\n\nLet's begin! Please read through this introduction, and whenever you are ready, reply with **"Ready to start step 1"** or ask any question you have.`
          };
          setLessonMessages([initialWelcome]);
          localStorage.setItem(storageKey, JSON.stringify([initialWelcome]));
        }
      } catch {
        setLessonMessages([]);
      }
    }
  }, [activeLessonChat, selectedLang, selectedLevel]);

  useEffect(() => {
    if (activeLessonChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lessonMessages, activeLessonChat]);

  const saveCompleted = (newCompleted: string[]) => {
    setCompletedLessons(newCompleted);
    localStorage.setItem(`joxiq_completed_${selectedLang}`, JSON.stringify(newCompleted));
  };

  const activeLangObj = LANGUAGES.find((l) => l.name === selectedLang) || { name: selectedLang, native: "", flag: "🌐" };

  const getLessonsListForLevel = (lvl: string) => {
    if (lvl === "Beginner") return BEGINNER_LESSONS;
    if (lvl === "Intermediate") return INTERMEDIATE_LESSONS;
    return ADVANCED_LESSONS;
  };

  const currentLessonsList = getLessonsListForLevel(selectedLevel);

  const completedCount = currentLessonsList.filter(l => completedLessons.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / currentLessonsList.length) * 100);

  const isIntermediateUnlocked = BEGINNER_LESSONS.every(l => completedLessons.includes(l.id)) || completedLessons.length >= 15;
  const isAdvancedUnlocked = INTERMEDIATE_LESSONS.every(l => completedLessons.includes(l.id)) || completedLessons.length >= 25;

  const handleOpenLessonChat = (lesson: LessonItem, levelName: "Beginner" | "Intermediate" | "Advanced", index: number) => {
    const list = getLessonsListForLevel(levelName);
    if (index > 0) {
      const prevLesson = list[index - 1];
      if (!completedLessons.includes(prevLesson.id)) {
        alert(`Please complete "${prevLesson.title}" first to unlock this lesson!`);
        return;
      }
    }

    if (!isProUser && index >= 3 && levelName === "Beginner") {
      setShowUpgradeModal(true);
      return;
    }

    setSelectedLevel(levelName);
    setActiveLessonChat(lesson);
    const lessonInfo = { level: levelName, lesson };
    setLastLesson(lessonInfo);
    localStorage.setItem(`joxiq_last_lesson_${selectedLang}`, JSON.stringify(lessonInfo));
  };

  const handleSendLessonChatMessage = async () => {
    if (!chatInput.trim() || !activeLessonChat) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const updatedMessages = [...lessonMessages, userMsg];
    setLessonMessages(updatedMessages);
    setChatInput("");
    setIsSendingMessage(true);

    const storageKey = `joxiq_lesson_chat_${selectedLang}_${activeLessonChat.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));

    const systemPrompt = `You are a world-class, experienced, professional AI Language Teacher (not a chatbot).
The user's native language is **${nativeLang}**.
The target language they want to learn is **${selectedLang}** at a **${selectedLevel}** level.
The current lesson is: "${activeLessonChat.title}" - ${activeLessonChat.desc}.

CRITICAL PEDAGOGICAL TEACHING RULES:
1. Never start a lesson or introduce a new topic with examples.
2. Always begin by explaining the core concept first in simple, beginner-friendly language.
3. Before giving any example, make sure the learner fully understands (written in their native language **${nativeLang}**):
   - What the topic is.
   - Why it exists.
   - Why it is important.
   - Where it is used.
   - When it is used.
   - How it works.
4. You MUST explain all explanations, grammar rules, concepts, contexts, mistake corrections, and lesson summaries in the user's native language (**${nativeLang}**). Teach vocabulary, phrases, and examples in **${selectedLang}**, accompanied by clear translations and phonetic breakdowns in **${nativeLang}**.
5. Explain everything using simple, beginner-friendly language. Never assume the learner already knows anything.
6. After (and only after) the learner understands the concept, gradually introduce examples.
7. Start with exactly one very simple example. Explain that example step-by-step or line-by-line with absolute clarity.
8. Only after the learner understands the first example, introduce more examples with increasing difficulty. Never overload the learner with many examples at once.
9. Always focus on understanding before memorization.
10. Continuously evaluate the learner's understanding through thoughtful questions and interactive checkpoints. If understanding is weak, STOP moving forward and spend more time explaining the concepts in different ways instead of rushing to complete the syllabus.
11. Never give information just to finish a lesson. Teach until the learner genuinely and deeply understands. The learner's success is far more important than completing the syllabus.
12. If the learner seems confused or makes a mistake, stop introducing new content. Instead:
    - Explain the concept again in different words.
    - Use a clear analogy or a real-life situation.
    - Ask if the learner understands before continuing.
13. Every session must feel like a real interactive classroom taught by an excellent, patient teacher. Never rush to finish lessons; the goal is deep mastery, not speed.
14. Give practice activities, quizzes, or interactive questions after every important topic. Only after the learner demonstrates understanding or successfully answers should you continue to the next section or topic.
15. If the learner gives a wrong answer, NEVER simply provide the correct answer. Explain the mistake clearly in **${nativeLang}**, show why it is incorrect, and then teach the correct answer with additional examples.
16. At the end of every lesson, provide a complete, clear lesson summary in **${nativeLang}** and a 3-question quiz.`;

    try {
      // Build history for API
      const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      
      let finalSystemInstruction = systemPrompt;
      if (completedLessons.includes(activeLessonChat.id)) {
        finalSystemInstruction += `\n\nCRITICAL FOLLOW-UP DIRECTIVE: The user has successfully completed this lesson ("${activeLessonChat.title}"). They have selected the "Ask More Questions About This Lesson" option to continue exploring this topic. You MUST answer unlimited follow-up questions related ONLY to the scope of this lesson. Be extremely encouraging, professional, and patient. At the end of EVERY answer, you MUST politely ask exactly: "Do you have any other questions about this lesson, or would you like to continue to the next lesson?"`;
      }

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemInstruction: finalSystemInstruction,
          model: "gemini-2.5-flash",
          temperature: 0.7
        }),
      });

      if (!res.ok) throw new Error("Failed to stream AI teacher response.");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available.");

      let assistantContent = "";
      const assistantMsg: ChatMessage = { role: "assistant", content: "" };
      setLessonMessages([...updatedMessages, assistantMsg]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                assistantContent += parsed.text;
                setLessonMessages([
                  ...updatedMessages,
                  { role: "assistant", content: assistantContent }
                ]);
              }
            } catch {}
          }
        }
      }

      const finalMessages = [...updatedMessages, { role: "assistant" as const, content: assistantContent }];
      localStorage.setItem(storageKey, JSON.stringify(finalMessages));
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        role: "assistant",
        content: `Great job practicing! Let's continue practicing this concept. Can you try creating a sentence using today's vocabulary?`
      };
      const finalMessages = [...updatedMessages, fallbackMsg];
      setLessonMessages(finalMessages);
      localStorage.setItem(storageKey, JSON.stringify(finalMessages));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleMarkLessonComplete = async () => {
    if (!activeLessonChat) return;
    
    // Save completion state immediately so if they return later, it is marked as completed
    if (!completedLessons.includes(activeLessonChat.id)) {
      const updated = [...completedLessons, activeLessonChat.id];
      saveCompleted(updated);
    }
    
    setShowLessonCompletedScreen(true);
    setIsGeneratingSummary(true);
    setCompletedLessonSummary("");

    try {
      const promptText = `You are a world-class language teacher. The user's native language is ${nativeLang} and they are learning ${selectedLang}. 
Please write a highly encouraging, beautifully formatted, concise 3-sentence summary in **${nativeLang}** outlining the core grammar and vocabulary they have mastered in the lesson "${activeLessonChat.title}". 
Do not use preambles; respond with the bulleted points directly.`;
      
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
          setCompletedLessonSummary(
            nativeLang === "Bangla" || nativeLang === "Bengali"
              ? `অসাধারণ কাজ! আপনি সফলভাবে "${activeLessonChat.title}" লেসনটি সম্পন্ন করেছেন। আপনি এই পাঠের মূল ব্যাকরণ নিয়মাবলী, গুরুত্বপূর্ণ শব্দভাণ্ডার এবং বাস্তব জীবনের বাক্য গঠন আয়ত্ত করেছেন।`
              : `Outstanding work! You have successfully completed the lesson "${activeLessonChat.title}". You have mastered the core grammar rules, essential vocabulary, and real-world sentence patterns in this module.`
          );
        }
      } else {
        setCompletedLessonSummary(
          nativeLang === "Bangla" || nativeLang === "Bengali"
            ? `অসাধারণ কাজ! আপনি সফলভাবে "${activeLessonChat.title}" লেসনটি সম্পন্ন করেছেন। আপনি এই পাঠের মূল ব্যাকরণ নিয়মাবলী, গুরুত্বপূর্ণ শব্দভাণ্ডার এবং বাস্তব জীবনের বাক্য গঠন আয়ত্ত করেছেন।`
            : `Outstanding work! You have successfully completed the lesson "${activeLessonChat.title}". You have mastered the core grammar rules, essential vocabulary, and real-world sentence patterns in this module.`
        );
      }
    } catch {
      setCompletedLessonSummary(
        nativeLang === "Bangla" || nativeLang === "Bengali"
          ? `অসাধারণ কাজ! আপনি সফলভাবে "${activeLessonChat.title}" লেসনটি সম্পন্ন করেছেন। আপনি এই পাঠের মূল ব্যাকরণ নিয়মাবলী, গুরুত্বপূর্ণ শব্দভাণ্ডার এবং বাস্তব জীবনের বাক্য গঠন আয়ত্ত করেছেন।`
          : `Outstanding work! You have successfully completed the lesson "${activeLessonChat.title}". You have mastered the core grammar rules, essential vocabulary, and real-world sentence patterns in this module.`
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleAskAITeacherGeneral = async () => {
    if (!isProUser) {
      setShowUpgradeModal(true);
      return;
    }
    if (!teacherPrompt.trim()) return;

    setIsGenerating(true);
    const promptText = `You are a dedicated AI Language Teacher. The user's native language is ${nativeLang}, and they are learning ${selectedLang} (${selectedLevel} level).
User asks: "${teacherPrompt}"
Please explain step by step in ${nativeLang}, give clear examples in ${selectedLang} with ${nativeLang} translations, correct any common mistakes, explain grammar rules, and give an encouraging tip.`;

    try {
      const res = await fetch("/api/education/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (!res.ok) throw new Error("Failed to connect to AI Teacher.");
      const data = await res.json();
      setAiResponse(data.result);
    } catch {
      setAiResponse(`Here is your guidance for ${selectedLang}: Practice consistently every day, focus on listening to native speakers, and master basic sentence patterns first!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // If active lesson chat is open, render the dedicated ChatGPT-style Learning Chat view
  if (activeLessonChat) {
    const currentIndex = currentLessonsList.findIndex(l => l.id === activeLessonChat.id);
    const nextLanguageLesson = currentIndex !== -1 && currentIndex < currentLessonsList.length - 1
      ? currentLessonsList[currentIndex + 1]
      : null;

    return (
      <div className={`h-[calc(100vh-5rem)] flex flex-col ${theme === "dark" ? "bg-[#0d1117] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
        {/* Chat Header */}
        <div className={`p-4 md:px-6 border-b flex items-center justify-between shadow-sm ${
          theme === "dark" ? "bg-slate-900/90 border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveLessonChat(null)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === "dark" ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                  {selectedLang} • {selectedLevel}
                </span>
                <span className="text-xs text-slate-400">⏱️ {activeLessonChat.estimatedMinutes} mins</span>
              </div>
              <h2 className="text-base md:text-lg font-extrabold tracking-tight mt-0.5">
                {activeLessonChat.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkLessonComplete}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 size={16} />
              <span>Complete Lesson</span>
            </button>
          </div>
        </div>

        {/* Chat Messages List */}
        {showLessonCompletedScreen ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
            <div className={`w-full max-w-2xl p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 animate-fadeIn ${
              theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
            }`}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl animate-bounce">
                  🎉
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Congratulations!</h2>
                  <p className="text-xs md:text-sm font-semibold text-emerald-500">
                    You have successfully completed Lesson {currentIndex + 1}
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border text-left space-y-3 ${
                theme === "dark" ? "bg-black/30 border-white/10" : "bg-slate-50 border-slate-200"
              }`}>
                <h3 className={`text-[10px] font-bold uppercase tracking-widest ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>What You Have Learned</h3>
                {isGeneratingSummary ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Tutor is writing a personalized concept summary...</span>
                  </div>
                ) : (
                  <div className={`text-xs md:text-sm leading-relaxed whitespace-pre-line prose max-w-none ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}>
                    {completedLessonSummary || "Great job completing this lesson! You've successfully completed your exercises, interactive quiz and concept drill with your language coach."}
                  </div>
                )}
              </div>

              {/* Progress Tracker */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-[10px] md:text-xs">
                  <span className={theme === "dark" ? "text-slate-400 font-semibold" : "text-slate-500 font-semibold"}>Course Progress ({selectedLevel})</span>
                  <span className="font-extrabold">{completedCount} / {currentLessonsList.length} Lessons ({progressPercent}%)</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  theme === "dark" ? "bg-slate-800" : "bg-slate-200"
                }`}>
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
                    if (nextLanguageLesson) {
                      // auto open next lesson
                      setActiveLessonChat(nextLanguageLesson);
                      setLessonMessages([
                        {
                          role: "assistant",
                          content: `👋 **Welcome to your premium ${selectedLang} Classroom Session!**\n\nI am your dedicated professional Language Teacher. Today we are diving deep into **${nextLanguageLesson.title}** (${nextLanguageLesson.desc}).\n\n### 🗣️ Teaching Setup\n* **Your Native Language**: ${nativeLang}\n* **Target Language**: ${selectedLang} (${selectedLevel})\n* **Instruction Style**: All grammar rules, explanations, and corrections will be explained in **${nativeLang}**, while vocabulary and examples will be in **${selectedLang}** with phonetic guides.\n\n### 🎓 Today's Complete Learning Flow\n1. **In-Depth Explanation**: Simple, step-by-step concepts assuming zero prior knowledge.\n2. **Real-Life Examples & Usage**: Exactly where, when, and how native speakers use these terms.\n3. **Common Mistakes & Why They Happen**: Pitfalls beginners make and how to avoid them.\n4. **Interactive Practice & Quiz**: Engaging exercises with feedback and final quiz evaluation to unlock your next lesson.\n\nLet's begin! Please read through this introduction, and whenever you are ready, reply with **"Ready to start step 1"** or ask any question you have.`
                        }
                      ]);
                    } else {
                      setActiveLessonChat(null);
                      setActiveTab("roadmap");
                    }
                    setShowLessonCompletedScreen(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm py-3.5 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current animate-pulse" />
                  <span>{nextLanguageLesson ? `Continue to Lesson ${currentIndex + 2}` : "Back to Roadmap"}</span>
                </button>

                <button
                  onClick={() => {
                    setShowLessonCompletedScreen(false);
                  }}
                  className={`w-full font-bold text-xs md:text-sm py-3.5 px-5 rounded-xl transition-all border flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                    theme === "dark" ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ask More Questions About This Lesson</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div className={`p-4 rounded-2xl border text-xs max-w-xl mx-auto text-center ${
                theme === "dark" ? "bg-indigo-950/30 border-indigo-500/20 text-indigo-200" : "bg-indigo-50 border-indigo-200 text-indigo-900"
              }`}>
                ✨ **Dedicated Learning Chat**: This chat is saved exclusively for <strong>{activeLessonChat.title}</strong>. Your chat history remains separate from the main AI assistant.
              </div>

              {lessonMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 md:gap-4 max-w-3xl mx-auto ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Brain size={18} />
                    </div>
                  )}

                  <div className={`p-4 md:p-5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none max-w-xl font-medium"
                      : theme === "dark"
                        ? "bg-slate-900 border border-white/30 text-white rounded-tl-none max-w-2xl dark-mode-text font-medium"
                        : "bg-white border border-slate-200 text-slate-900 rounded-tl-none max-w-2xl"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className={`prose prose-invert max-w-none ${theme === "dark" ? "text-white font-medium" : "text-slate-900"}`}>
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-2xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-md">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {isSendingMessage && (
                <div className="flex gap-3 max-w-3xl mx-auto justify-start">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Brain size={18} />
                  </div>
                  <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
                    theme === "dark" ? "bg-slate-900 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-500"
                  }`}>
                    <RefreshCw size={14} className="animate-spin text-indigo-500" />
                    <span>AI Teacher is thinking and preparing examples...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className={`p-4 md:p-6 border-t ${
              theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
            }`}>
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendLessonChatMessage()}
                  placeholder={`Ask a question or answer the AI teacher in ${selectedLang}...`}
                  className={`flex-1 px-4 py-3 rounded-2xl border text-xs md:text-sm outline-none transition-all ${
                    theme === "dark" ? "bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
                  }`}
                />
                <button
                  onClick={handleSendLessonChatMessage}
                  disabled={isSendingMessage || !chatInput.trim()}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-full p-4 md:p-8 flex flex-col gap-6 relative ${theme === "dark" ? "text-slate-100 bg-[#0d1117]" : "text-slate-900 bg-slate-50"}`}>
      
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden shadow-xl ${
        theme === "dark" 
          ? "bg-gradient-to-r from-indigo-950/80 via-slate-900 to-violet-950/80 border-indigo-500/20" 
          : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white border-indigo-400/20"
      }`}>
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200">
              <Languages size={14} className="text-pink-400" />
              <span>JOXIQ Language Coach AI</span>
              {!isProUser && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-indigo-950 font-extrabold text-[10px]">
                  PRO
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>{activeLangObj.flag} Master {activeLangObj.name}</span>
            </h1>
            <p className={`text-xs md:text-sm max-w-xl ${theme === "dark" ? "text-slate-300" : "text-indigo-100"}`}>
              Step-by-step interactive learning roadmap with dedicated AI Teacher lesson chats, grammar roadmaps, and quizzes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Change Language Settings Button */}
            <button
              onClick={() => {
                setTempLearningLang(selectedLang);
                setTempNativeLang(nativeLang);
                setOnboardingStep(1);
                setShowOnboarding(true);
              }}
              className={`px-4 py-3 rounded-2xl font-bold text-xs shadow-md border cursor-pointer outline-none transition-all flex items-center gap-2 ${
                theme === "dark" 
                  ? "bg-slate-900 border-white/10 text-white hover:bg-slate-800" 
                  : "bg-white border-indigo-200 text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span>⚙️ Change Language Settings</span>
            </button>

            {/* Native Language Display */}
            <div className={`px-4 py-3 rounded-2xl font-bold text-xs shadow-md border flex items-center gap-2 ${
              theme === "dark" ? "bg-slate-900/60 border-white/10 text-slate-300" : "bg-white/80 border-indigo-200 text-slate-700"
            }`}>
              <span>🗣️ Teaching in: <strong>{nativeLang}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`p-2 rounded-2xl border flex flex-wrap items-center gap-2 ${
        theme === "dark" ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "dashboard"
              ? "bg-indigo-600 text-white shadow-md"
              : theme === "dark" ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <GraduationCap size={15} />
          <span>Dashboard & Resume</span>
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "roadmap"
              ? "bg-indigo-600 text-white shadow-md"
              : theme === "dark" ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Compass size={15} />
          <span>Learning Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab("chats")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "chats"
              ? "bg-indigo-600 text-white shadow-md"
              : theme === "dark" ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <MessageSquare size={15} />
          <span>Learning Chats</span>
        </button>

        <button
          onClick={() => {
            if (!isProUser) {
              setShowUpgradeModal(true);
              return;
            }
            setActiveTab("teacher");
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "teacher"
              ? "bg-indigo-600 text-white shadow-md"
              : theme === "dark" ? "text-slate-300 hover:bg-white/5" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Brain size={15} />
          <span>AI Teacher Q&A</span>
          {!isProUser && <Lock size={12} className="opacity-70 text-amber-400" />}
        </button>
      </div>

      {/* Tab 1: Dashboard & Resume Learning */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Resume Learning Card */}
          <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden shadow-lg ${
            theme === "dark" ? "bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/30" : "bg-gradient-to-br from-indigo-50 to-white border-indigo-200"
          }`}>
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Play size={14} className="fill-indigo-400" /> Continue Learning
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold">
                  {lastLesson?.lesson?.title || "Introduction & Overview"}
                </h2>
                <p className={`text-xs md:text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                  {activeLangObj.flag} {selectedLang} • {lastLesson?.level || "Beginner"} Level
                </p>
              </div>

              <button
                onClick={() => {
                  const lvl = lastLesson?.level || "Beginner";
                  const les = lastLesson?.lesson || BEGINNER_LESSONS[0];
                  const list = getLessonsListForLevel(lvl);
                  const idx = list.findIndex(l => l.id === les.id);
                  handleOpenLessonChat(les, lvl as any, idx >= 0 ? idx : 0);
                }}
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Resume Lesson</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                <BarChart3 size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold">Overall Progress</span>
                <h3 className="text-xl font-extrabold mt-0.5">{progressPercent}%</h3>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold">Completed Lessons</span>
                <h3 className="text-xl font-extrabold mt-0.5">{completedCount} / {currentLessonsList.length}</h3>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Flame size={22} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold">Learning Streak</span>
                <h3 className="text-xl font-extrabold mt-0.5">🔥 5 Days</h3>
              </div>
            </div>
          </div>

          {/* Quick Level Selector & Roadmap Preview */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Select Level to Study
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "Beginner", label: "Beginner (A1-A2)", desc: "Alphabet, greetings & basic grammar", unlocked: true },
                { id: "Intermediate", label: "Intermediate (B1-B2)", desc: "Conversational fluency & complex sentences", unlocked: isIntermediateUnlocked },
                { id: "Advanced", label: "Advanced (C1-C2)", desc: "Business, idioms, rhetoric & native mastery", unlocked: isAdvancedUnlocked },
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => {
                    if (!lvl.unlocked) {
                      alert("Complete the previous level's lessons to unlock this level!");
                      return;
                    }
                    setSelectedLevel(lvl.id as any);
                    setActiveTab("roadmap");
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    lvl.unlocked
                      ? theme === "dark" ? "bg-white/[0.03] border-white/10 hover:border-indigo-500/50" : "bg-white border-slate-200 hover:border-indigo-400 shadow-sm"
                      : theme === "dark" ? "bg-white/[0.01] border-white/5 opacity-60 cursor-not-allowed" : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">{lvl.id}</span>
                    {!lvl.unlocked && <Lock size={14} className="text-amber-500" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{lvl.label}</h4>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>{lvl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roadmap */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          {/* Level Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "Beginner", label: "Beginner (A1-A2)", unlocked: true },
              { id: "Intermediate", label: "Intermediate (B1-B2)", unlocked: isIntermediateUnlocked },
              { id: "Advanced", label: "Advanced (C1-C2)", unlocked: isAdvancedUnlocked },
            ].map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => {
                    if (!lvl.unlocked) {
                      alert("Complete previous level lessons first!");
                      return;
                    }
                    setSelectedLevel(lvl.id as any);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-center font-extrabold text-xs md:text-sm ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg border-indigo-500"
                      : lvl.unlocked
                        ? theme === "dark" ? "bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                        : theme === "dark" ? "bg-white/[0.01] border-white/5 text-slate-600 cursor-not-allowed" : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {lvl.label}
                </div>
              );
            })}
          </div>

          {/* Lessons List Roadmap */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 px-1">
              {selectedLevel} Curriculum Roadmap ({currentLessonsList.length} Lessons)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentLessonsList.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isLocked = index > 0 && !completedLessons.includes(currentLessonsList[index - 1].id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleOpenLessonChat(lesson, selectedLevel, index)}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 group ${
                      isLocked
                        ? theme === "dark" ? "bg-white/[0.01] border-white/5 opacity-50 cursor-not-allowed" : "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"
                        : isCompleted
                          ? theme === "dark" ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer" : "bg-emerald-50/50 border-emerald-300 hover:border-emerald-400 cursor-pointer shadow-sm"
                          : theme === "dark" ? "bg-white/[0.03] border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.06] cursor-pointer" : "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs shadow-sm ${
                        isLocked
                          ? "bg-slate-800 text-slate-500"
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                      }`}>
                        {isLocked ? <Lock size={16} /> : isCompleted ? <Check size={18} /> : index + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm md:text-base group-hover:text-indigo-400 transition-colors">
                            {lesson.title}
                          </h3>
                          {lesson.type === "quiz" && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-bold">Quiz</span>
                          )}
                          {lesson.type === "exam" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">Exam</span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                          {lesson.desc}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-400">
                          <span>⏱️ {lesson.estimatedMinutes} mins</span>
                          {isCompleted && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Completed</span>}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pt-2 text-slate-400 group-hover:translate-x-1 transition-transform">
                      {isLocked ? <Lock size={16} /> : <MessageSquare size={18} className="text-indigo-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Learning Chats Hub */}
      {activeTab === "chats" && (
        <div className={`p-6 md:p-8 rounded-3xl border ${
          theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
        } space-y-6`}>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold">Learning Chats Hub ({selectedLang})</h2>
            <p className="text-xs text-slate-400 mt-1">
              All lesson chat sessions are stored securely in your browser. Reopen any lesson chat instantly to continue learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BEGINNER_LESSONS.concat(INTERMEDIATE_LESSONS, ADVANCED_LESSONS).map((lesson) => {
              const storageKey = `joxiq_lesson_chat_${selectedLang}_${lesson.id}`;
              let hasChat = false;
              let msgCount = 0;
              try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  hasChat = parsed.length > 0;
                  msgCount = parsed.length;
                }
              } catch {}

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    const isBeg = BEGINNER_LESSONS.some(l => l.id === lesson.id);
                    const isInt = INTERMEDIATE_LESSONS.some(l => l.id === lesson.id);
                    const lvl = isBeg ? "Beginner" : isInt ? "Intermediate" : "Advanced";
                    setActiveLessonChat(lesson);
                    setSelectedLevel(lvl);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    hasChat
                      ? theme === "dark" ? "bg-white/[0.04] border-indigo-500/30 hover:border-indigo-500" : "bg-indigo-50/30 border-indigo-200 hover:border-indigo-400 shadow-sm"
                      : theme === "dark" ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">
                        {BEGINNER_LESSONS.some(l => l.id === lesson.id) ? "Beginner" : INTERMEDIATE_LESSONS.some(l => l.id === lesson.id) ? "Intermediate" : "Advanced"}
                      </span>
                      {hasChat && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Active Chat</span>}
                    </div>
                    <h3 className="font-extrabold text-sm">{lesson.title}</h3>
                    <p className="text-xs text-slate-400">{msgCount} messages in chat history</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shrink-0">
                    Open Chat
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: AI Teacher Q&A */}
      {activeTab === "teacher" && (
        <div className={`p-6 md:p-8 rounded-3xl border ${
          theme === "dark" ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 shadow-md"
        } space-y-6`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold">AI Teacher Assistant</h2>
              <p className="text-xs text-slate-400">Ask any general question about {selectedLang} grammar, pronunciation, or culture.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={teacherPrompt}
              onChange={(e) => setTeacherPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAITeacherGeneral()}
              placeholder={`Ask e.g. "How do I conjugate regular verbs in ${selectedLang}?"`}
              className={`flex-1 px-4 py-3 rounded-2xl border text-xs md:text-sm outline-none transition-all ${
                theme === "dark" ? "bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
              }`}
            />
            <button
              onClick={handleAskAITeacherGeneral}
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Ask AI</span>
            </button>
          </div>

          {aiResponse && (
            <div className={`p-6 rounded-2xl border space-y-4 ${
              theme === "dark" ? "bg-black/40 border-indigo-500/30 text-slate-100" : "bg-indigo-50/40 border-indigo-200 text-slate-900"
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-indigo-500/20">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-400">
                  <Sparkles size={16} />
                  <span>AI Teacher Response</span>
                </div>
                <button
                  onClick={() => setAiResponse(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className={`prose prose-invert max-w-none text-xs md:text-sm leading-relaxed ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                <Markdown>{aiResponse}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Prompt Modal for Free Users */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden text-center ${
            theme === "dark" ? "bg-slate-900 border-amber-500/30 text-white" : "bg-white border-indigo-200 text-slate-900"
          }`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-indigo-500 to-pink-500" />
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg">
              <Crown size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Unlock JOXIQ Language Coach Pro
              </h3>
              <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                Advanced lessons, AI Teacher Assistant, and unlimited lesson chats are available with JOXIQ AI Pro. Upgrade now to master any language!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  theme === "dark" ? "bg-white/10 hover:bg-white/20 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  onUpgrade();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Crown size={16} />
                <span>Upgrade to Pro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Native Language Modal */}
      {showNativeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden ${
            theme === "dark" ? "bg-slate-900 border-indigo-500/30 text-white" : "bg-white border-indigo-200 text-slate-900"
          }`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="space-y-2 text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Step 1 of 2</span>
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Select Your Native Language
              </h3>
              <p className={`text-xs md:text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                Your AI Teacher will explain all grammar, rules, concepts, and corrections in your native language while teaching you <strong>{selectedLang}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {NATIVE_LANGUAGES.map((nl) => (
                <button
                  key={nl.name}
                  onClick={() => setNativeLang(nl.name)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    nativeLang === nl.name
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : theme === "dark" ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.08]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-base">{nl.flag}</span>
                  <span className="truncate">{nl.name}</span>
                </button>
              ))}
              <button
                onClick={() => setShowCustomNativeModal(true)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-dashed ${
                  theme === "dark" ? "border-white/20 hover:bg-white/5 text-indigo-300" : "border-indigo-300 hover:bg-indigo-50 text-indigo-700"
                }`}
              >
                <span>➕ Other Language...</span>
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem("joxiq_native_lang", nativeLang);
                  setShowNativeModal(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Confirm & Continue Learning ({selectedLang})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Native Language Modal */}
      {showCustomNativeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h3 className="font-extrabold text-base">Enter Native Language</h3>
            <p className="text-xs text-slate-400">Type your preferred native language for AI explanations:</p>
            <input
              type="text"
              value={customNativeInput}
              onChange={(e) => setCustomNativeInput(e.target.value)}
              placeholder="e.g. Persian, Vietnamese, Tamil..."
              className={`w-full px-4 py-3 rounded-xl border text-xs outline-none ${
                theme === "dark" ? "bg-black/40 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomNativeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customNativeInput.trim()) {
                    setNativeLang(customNativeInput.trim());
                    setShowCustomNativeModal(false);
                    setCustomNativeInput("");
                  }
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold"
              >
                Set Native Language
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Language Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-slate-900 border-white/20 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h3 className="font-extrabold text-base">Add Custom Language</h3>
            <p className="text-xs text-slate-400">Enter any language name you want to study with your AI Coach:</p>
            <input
              type="text"
              value={customLangInput}
              onChange={(e) => setCustomLangInput(e.target.value)}
              placeholder="e.g. Greek, Portuguese, Swahili..."
              className={`w-full px-4 py-3 rounded-xl border text-xs outline-none ${
                theme === "dark" ? "bg-black/40 border-white/10 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customLangInput.trim()) {
                    setSelectedLang(customLangInput.trim());
                    setShowCustomModal(false);
                    setCustomLangInput("");
                  }
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold"
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Onboarding Wizard Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-xl p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden ${
            theme === "dark" ? "bg-slate-900 border-indigo-500/30 text-white" : "bg-white border-indigo-200 text-slate-900"
          }`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            {onboardingStep === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Step 1 of 2</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Which language would you like to learn?
                  </h3>
                  <p className={`text-xs md:text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                    Choose from popular languages or search below to start your immersive AI lessons.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQueryLearn}
                    onChange={(e) => setSearchQueryLearn(e.target.value)}
                    placeholder="Search languages (e.g. Japanese, French, Arabic...)"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-xs md:text-sm outline-none transition-all ${
                      theme === "dark" ? "bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {LANGUAGES
                    .filter(l => l.name.toLowerCase().includes(searchQueryLearn.toLowerCase()) || l.native.toLowerCase().includes(searchQueryLearn.toLowerCase()))
                    .map((l) => (
                      <button
                        key={l.name}
                        onClick={() => setTempLearningLang(l.name)}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          tempLearningLang === l.name
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/50"
                            : theme === "dark" ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.08]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xl">{l.flag}</span>
                        <div className="text-left truncate">
                          <p className="truncate font-extrabold">{l.name}</p>
                          <p className="text-[10px] opacity-70 truncate">{l.native}</p>
                        </div>
                      </button>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs md:text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Next: Choose Teaching Language</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Step 2 of 2</span>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Which language would you like the lessons to be explained in?
                  </h3>
                  <p className={`text-xs md:text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                    Your AI teacher will explain all grammar, rules, tips, and corrections in this language while teaching <strong>{tempLearningLang}</strong>.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQueryNative}
                    onChange={(e) => setSearchQueryNative(e.target.value)}
                    placeholder="Search teaching languages (e.g. English, Bengali, Hindi...)"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-xs md:text-sm outline-none transition-all ${
                      theme === "dark" ? "bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                  {NATIVE_LANGUAGES
                    .filter(nl => nl.name.toLowerCase().includes(searchQueryNative.toLowerCase()))
                    .map((nl) => (
                      <button
                        key={nl.name}
                        onClick={() => setTempNativeLang(nl.name)}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          tempNativeLang === nl.name
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/50"
                            : theme === "dark" ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.08]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xl">{nl.flag}</span>
                        <span className="truncate font-extrabold">{nl.name}</span>
                      </button>
                    ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className={`px-5 py-4 rounded-2xl border font-extrabold text-xs md:text-sm transition-all cursor-pointer ${
                      theme === "dark" ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLang(tempLearningLang);
                      setNativeLang(tempNativeLang);
                      localStorage.setItem("joxiq_lang_coach_lang", tempLearningLang);
                      localStorage.setItem("joxiq_native_lang", tempNativeLang);
                      localStorage.setItem("joxiq_onboarding_completed", "true");
                      setShowOnboarding(false);
                      setActiveTab("dashboard");
                    }}
                    className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs md:text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Start Learning ({tempLearningLang} in {tempNativeLang})</span>
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
