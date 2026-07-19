import React, { useState } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Mail, 
  Globe, 
  GraduationCap, 
  Code, 
  FileUp, 
  Camera, 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen,
  ChevronRight,
  Maximize2,
  Trash2,
  RefreshCw,
  HelpCircle,
  Binary
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AttachedImage, AttachedDocument } from "../types";

const joxiqLogo = "/logo.png?v=1.0.4";

interface ToolsPageProps {
  theme: "light" | "dark";
  onStartToolSession: (
    toolName: string,
    personaId: string,
    systemInstruction: string,
    initialPrompt: string,
    initialImage?: AttachedImage,
    initialDocument?: AttachedDocument
  ) => void;
  onNavigateToChat: () => void;
}

interface ToolsAttachedImage extends AttachedImage {
  name: string;
}

type ToolId = 
  | "chat" 
  | "image-gen" 
  | "essay" 
  | "email" 
  | "translator" 
  | "study" 
  | "math" 
  | "coder" 
  | "pdf" 
  | "analyzer";

interface ToolItem {
  id: ToolId;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  color: string;
  category: "chat" | "creative" | "academic" | "utility";
}

export function ToolsPage({ theme, onStartToolSession, onNavigateToChat }: ToolsPageProps) {
  const isDark = theme === "dark";
  const [logoError, setLogoError] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<ToolId | null>(null);

  // --- Image Generator State ---
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgStyle, setImgStyle] = useState("cinematic");
  const [imgRatio, setImgRatio] = useState("16:9");
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- Essay Writer State ---
  const [essayTopic, setEssayTopic] = useState("");
  const [essayLevel, setEssayLevel] = useState("college");
  const [essayLength, setEssayLength] = useState("medium");
  const [essayTone, setEssayTone] = useState("academic");

  // --- Email Writer State ---
  const [emailPurpose, setEmailPurpose] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("Manager");
  const [emailTone, setEmailTone] = useState("professional");

  // --- Translator State ---
  const [translateText, setTranslateText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("bn");

  // --- Math Solver State ---
  const [mathProblem, setMathProblem] = useState("");
  const [mathAttachedImg, setMathAttachedImg] = useState<ToolsAttachedImage | null>(null);

  // --- Code Generator State ---
  const [codeDesc, setCodeDesc] = useState("");
  const [codeLang, setCodeLang] = useState("typescript");
  const [codeReqs, setCodeReqs] = useState("");

  // --- PDF Chat State ---
  const [pdfAttachedDoc, setPdfAttachedDoc] = useState<AttachedDocument | null>(null);
  const [pdfPrompt, setPdfPrompt] = useState("Summarize the main points of this document");

  // --- Image Analyzer State ---
  const [analyzerAttachedImg, setAnalyzerAttachedImg] = useState<ToolsAttachedImage | null>(null);
  const [analyzerPrompt, setAnalyzerPrompt] = useState("Analyze this image in detail and describe what you see.");

  const tools: ToolItem[] = [
    {
      id: "chat",
      name: "AI Chat",
      emoji: "💬",
      icon: <Sparkles className="w-5 h-5" />,
      description: "Fast, intelligent, and helpful conversational companion for general queries.",
      color: "from-blue-500 to-indigo-600 border-blue-500/20",
      category: "chat"
    },
    {
      id: "image-gen",
      name: "AI Image Generator",
      emoji: "🖼",
      icon: <ImageIcon className="w-5 h-5" />,
      description: "Convert descriptions into beautiful, high-fidelity images with custom art styles.",
      badge: "Free & Fast",
      color: "from-pink-500 via-purple-500 to-indigo-500 border-pink-500/20",
      category: "creative"
    },
    {
      id: "essay",
      name: "Essay Writer",
      emoji: "📝",
      icon: <FileText className="w-5 h-5" />,
      description: "Draft highly structured essays, assignments, and research articles with custom styles.",
      color: "from-amber-500 to-orange-600 border-amber-500/20",
      category: "academic"
    },
    {
      id: "email",
      name: "Email Writer",
      emoji: "📧",
      icon: <Mail className="w-5 h-5" />,
      description: "Generate highly polished emails, proposals, and responses adapted to any tone.",
      color: "from-teal-500 to-emerald-600 border-teal-500/20",
      category: "creative"
    },
    {
      id: "translator",
      name: "Translator",
      emoji: "🌐",
      icon: <Globe className="w-5 h-5" />,
      description: "Translate content across languages with cultural nuances and structured explanations.",
      color: "from-indigo-500 to-purple-600 border-indigo-500/20",
      category: "utility"
    },
    {
      id: "study",
      name: "Study Mode",
      emoji: "📚",
      icon: <GraduationCap className="w-5 h-5" />,
      description: "Interactive Socratic tutor that guides you step-by-step rather than giving quick answers.",
      badge: "Socratic",
      color: "from-emerald-500 to-teal-600 border-emerald-500/20",
      category: "academic"
    },
    {
      id: "math",
      name: "Math Solver",
      emoji: "🧮",
      icon: <Binary className="w-5 h-5" />,
      description: "Deconstruct algebra, calculus, and logical equations with comprehensive step-by-step proofs.",
      color: "from-red-500 to-orange-600 border-red-500/20",
      category: "academic"
    },
    {
      id: "coder",
      name: "Code Generator",
      emoji: "💻",
      icon: <Code className="w-5 h-5" />,
      description: "Create, format, and debug codes across various popular languages with inline comments.",
      badge: "Pro",
      color: "from-violet-500 to-fuchsia-600 border-violet-500/20",
      category: "utility"
    },
    {
      id: "pdf",
      name: "PDF Chat",
      emoji: "📄",
      icon: <FileUp className="w-5 h-5" />,
      description: "Upload study files or textbooks to summarize, query, and extract insights effortlessly.",
      color: "from-sky-500 to-blue-600 border-sky-500/20",
      category: "utility"
    },
    {
      id: "analyzer",
      name: "Image Analyzer",
      emoji: "📸",
      icon: <Camera className="w-5 h-5" />,
      description: "Upload screenshots, diagrams, or photos to extract text, solve math, or get critiques.",
      color: "from-rose-500 to-pink-600 border-rose-500/20",
      category: "creative"
    }
  ];

  // --- Image Generator Fetch ---
  const handleGenerateImage = () => {
    if (!imgPrompt.trim()) return;
    setIsGeneratingImg(true);
    setGeneratedImgUrl(null);
    
    // Build prompt combining details and style
    const cleanedPrompt = encodeURIComponent(`${imgPrompt}, style: ${imgStyle}, high details, 8k resolution, aspect ratio ${imgRatio}`);
    
    // Wait slightly to show elegant animation
    setTimeout(() => {
      const url = `https://image.pollinations.ai/prompt/${cleanedPrompt}?width=${
        imgRatio === "16:9" ? "1024&height=576" : imgRatio === "9:16" ? "576&height=1024" : "1024&height=1024"
      }&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
      setGeneratedImgUrl(url);
      setIsGeneratingImg(false);
    }, 1800);
  };

  // --- Copy Link Helper ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- File uploads ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "pdf" | "math" | "analyzer") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onloadend = () => {
        const attached: ToolsAttachedImage = {
          name: file.name,
          data: reader.result as string,
          mimeType: file.type
        };
        if (type === "math") setMathAttachedImg(attached);
        if (type === "analyzer") setAnalyzerAttachedImg(attached);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onloadend = () => {
        const attached: AttachedDocument = {
          name: file.name,
          content: reader.result as string,
          type: file.type,
          size: file.size ? `${(file.size / 1024).toFixed(1)} KB` : "0 KB"
        };
        if (type === "pdf") setPdfAttachedDoc(attached);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-full py-8 px-4 md:px-8 max-w-5xl mx-auto space-y-8 ${
      isDark ? "text-slate-200" : "text-slate-800"
    }`}>
      
      {/* Header */}
      <AnimatePresence mode="wait">
        {!selectedToolId ? (
          <motion.div
            key="dashboard-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 border-b border-slate-500/10 pb-6"
          >
            <div className="flex items-center gap-2">
              <span className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm bg-indigo-500 text-white font-black text-lg p-0.5">
                {logoError ? (
                  <span>J</span>
                ) : (
                  <img
                    src={joxiqLogo}
                    alt="JOXIQ AI Logo"
                    className="w-full h-full object-contain rounded-full bg-white p-0.5"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                  />
                )}
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight">JOXIQ AI Workspace Tools</h1>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Pick a specialized AI tool below to draft essays, generate code, create images, or solve complex problems.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tool-header"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-3 border-b border-slate-500/10 pb-5"
          >
            <button
              onClick={() => setSelectedToolId(null)}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isDark ? "bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {tools.find(t => t.id === selectedToolId)?.emoji}
                </span>
                <h2 className="text-lg font-black tracking-tight">
                  {tools.find(t => t.id === selectedToolId)?.name}
                </h2>
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {tools.find(t => t.id === selectedToolId)?.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Router */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {!selectedToolId ? (
            
            /* Grid View of all Tools */
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (tool.id === "chat") {
                      onNavigateToChat();
                    } else if (tool.id === "study") {
                      onStartToolSession(
                        "Study Mentor",
                        "socratic",
                        "Hi Socratic Teacher! Let's start an interactive study session. Help me learn and understand topics step-by-step.",
                        "Let's start learning"
                      );
                    } else {
                      setSelectedToolId(tool.id);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${
                    isDark 
                      ? "bg-slate-900/40 border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/70" 
                      : "bg-white border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md hover:bg-slate-50/50"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tool.color} opacity-[0.03] rounded-full blur-xl group-hover:scale-125 transition-transform`} />
                  
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl p-2.5 rounded-xl bg-slate-500/5 dark:bg-slate-400/5 group-hover:scale-110 transition-transform">
                      {tool.emoji}
                    </span>
                    {tool.badge && (
                      <span className="text-[9px] uppercase font-black tracking-widest bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/10">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                    <span>{tool.name}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {tool.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>

          ) : (
            
            /* Expanded Tool Detail Workspaces */
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-2xl border ${
                isDark ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-100 shadow-sm"
              }`}
            >
              {/* ----------------- AI IMAGE GENERATOR ----------------- */}
              {selectedToolId === "image-gen" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Describe your image prompt
                        </label>
                        <textarea
                          rows={4}
                          value={imgPrompt}
                          onChange={(e) => setImgPrompt(e.target.value)}
                          placeholder="Example: A futuristic Bangladeshi student coding in a cyber city with hologram screens, cinematic, ultra-detailed..."
                          className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                            isDark 
                              ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white" 
                              : "bg-slate-50 border-slate-200 focus:border-indigo-300 text-slate-900 focus:bg-white"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Artistic Style
                          </label>
                          <select
                            value={imgStyle}
                            onChange={(e) => setImgStyle(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <option value="cinematic">Cinematic</option>
                            <option value="photographic">Photorealistic</option>
                            <option value="anime">Anime / Manga</option>
                            <option value="digital-art">Digital Painting</option>
                            <option value="cyberpunk">Cyberpunk Neon</option>
                            <option value="3d-render">3D Render Unreal</option>
                            <option value="fantasy">Mystical Fantasy</option>
                            <option value="comic">Comic Book Illustration</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Aspect Ratio
                          </label>
                          <select
                            value={imgRatio}
                            onChange={(e) => setImgRatio(e.target.value)}
                            className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <option value="1:1">1:1 Square</option>
                            <option value="16:9">16:9 Landscape</option>
                            <option value="9:16">9:16 Portrait</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImg || !imgPrompt.trim()}
                        className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
                          !imgPrompt.trim() 
                            ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" 
                            : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
                        }`}
                      >
                        {isGeneratingImg ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating Masterpiece...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4" />
                            <span>Generate AI Image</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Live Preview Panel */}
                    <div className={`rounded-xl border flex flex-col items-center justify-center p-4 relative min-h-[300px] overflow-hidden ${
                      isDark ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-250"
                    }`}>
                      {isGeneratingImg ? (
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto animate-bounce">
                            <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">Rendering Pixels</p>
                            <p className="text-[10px] text-slate-400">Pollinations ultra-fast style matching...</p>
                          </div>
                        </div>
                      ) : generatedImgUrl ? (
                        <div className="space-y-4 w-full">
                          <div className="relative rounded-lg overflow-hidden border border-slate-500/10 bg-black">
                            <img 
                              src={generatedImgUrl} 
                              alt={imgPrompt} 
                              className="w-full object-contain max-h-[320px] mx-auto shadow"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              onClick={() => copyToClipboard(generatedImgUrl)}
                              className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
                            </button>

                            <a
                              href={generatedImgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <Download size={13} />
                              <span>Download</span>
                            </a>
                          </div>

                          <button
                            onClick={() => {
                              onStartToolSession(
                                "Image Analytics",
                                "general",
                                `Explain and analyze this generated image in detail: "${imgPrompt}". Analyze its art style, composition, lighting, and elements.`,
                                `Discuss and analyze this generated image: "${imgPrompt}"`,
                                { data: generatedImgUrl || "", mimeType: "image/png" }
                              );
                            }}
                            className="w-full py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles size={13} />
                            <span>Discuss Art Style in AI Chat</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                          <div>
                            <p className="text-xs font-semibold text-slate-400">No Image Generated Yet</p>
                            <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">Fill prompt on the left and hit Generate!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- ESSAY WRITER ----------------- */}
              {selectedToolId === "essay" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Essay Topic / Outline Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={essayTopic}
                      onChange={(e) => setEssayTopic(e.target.value)}
                      placeholder="Example: The impact of artificial intelligence on educational systems in developing nations."
                      className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                        isDark ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white" : "bg-slate-50 border-slate-200 focus:border-indigo-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Academic Level
                      </label>
                      <select
                        value={essayLevel}
                        onChange={(e) => setEssayLevel(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="high-school">High School</option>
                        <option value="college">College Undergraduate</option>
                        <option value="university">University Postgraduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Length
                      </label>
                      <select
                        value={essayLength}
                        onChange={(e) => setEssayLength(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="short">Short (~500 Words)</option>
                        <option value="medium">Medium (~1500 Words)</option>
                        <option value="long">Long (~3000 Words)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Writing Tone
                      </label>
                      <select
                        value={essayTone}
                        onChange={(e) => setEssayTone(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="academic">Academic / Formal</option>
                        <option value="persuasive">Persuasive / Arguing</option>
                        <option value="analytical">Analytical / Balanced</option>
                        <option value="narrative">Story / Narrative</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prompt = `Write a comprehensive ${essayTone} essay of ${essayLength} length at the ${essayLevel} level. 
Topic: "${essayTopic}"
Provide a clear outline, Introduction (with thesis statement), structured Body paragraphs with references, and a logical Conclusion.`;
                      onStartToolSession(
                        "Essay Writer",
                        "writer",
                        "You are an elite academic editor and researcher. Create well-structured, original essays with clear thesis statements, robust references, and sophisticated academic vocabulary.",
                        prompt
                      );
                    }}
                    disabled={!essayTopic.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !essayTopic.trim() ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Structured Essay in Chat</span>
                  </button>
                </div>
              )}

              {/* ----------------- EMAIL WRITER ----------------- */}
              {selectedToolId === "email" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Purpose / Context
                    </label>
                    <textarea
                      rows={3}
                      value={emailPurpose}
                      onChange={(e) => setEmailPurpose(e.target.value)}
                      placeholder="Example: Requesting a 3-day sick leave due to mild fever, and mentioning that I will follow up with pending issues on Slack."
                      className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                        isDark ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white" : "bg-slate-50 border-slate-200 focus:border-indigo-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Recipient (e.g. Professor, Manager, Recruiter)
                      </label>
                      <input
                        type="text"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Tone Style
                      </label>
                      <select
                        value={emailTone}
                        onChange={(e) => setEmailTone(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="professional">Professional / Polished</option>
                        <option value="casual">Casual / Friendly</option>
                        <option value="warm">Warm / Empathetic</option>
                        <option value="urgent">Urgent / Important</option>
                        <option value="apologetic">Apologetic / Polite</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prompt = `Draft a beautiful, copy-ready email addressed to: "${emailRecipient}". 
Purpose of email: "${emailPurpose}"
Tone: ${emailTone}
Ensure there is an elegant subject line, clear paragraphs, polite greetings, and professional closures.`;
                      onStartToolSession(
                        "Email Writer",
                        "writer",
                        "You are an expert corporate writer and communications expert. Draft exceptionally structured emails, business proposals, and polite requests.",
                        prompt
                      );
                    }}
                    disabled={!emailPurpose.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !emailPurpose.trim() ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Generate Email Draft in Chat</span>
                  </button>
                </div>
              )}

              {/* ----------------- TRANSLATOR ----------------- */}
              {selectedToolId === "translator" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Text to Translate
                    </label>
                    <textarea
                      rows={3}
                      value={translateText}
                      onChange={(e) => setTranslateText(e.target.value)}
                      placeholder="Type or paste the sentences here..."
                      className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                        isDark ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white" : "bg-slate-50 border-slate-200 focus:border-indigo-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Source Language
                      </label>
                      <select
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="auto">Detect Language (Auto)</option>
                        <option value="en">English</option>
                        <option value="bn">Bengali</option>
                        <option value="ar">Arabic</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Target Language
                      </label>
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="bn">Bengali</option>
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                        <option value="hi">Hindi</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const srcText = sourceLang === "auto" ? "auto-detected language" : sourceLang;
                      const prompt = `Translate the following text from ${srcText} into "${targetLang}": 
"${translateText}"
Please provide:
1. The primary translation.
2. An explanation of local idioms or vocabulary nuances (if applicable).
3. Suggestions on alternative formal and informal ways to say it.`;
                      onStartToolSession(
                        "Translator",
                        "translator",
                        "You are an expert global language translator and computational linguist. Provide accurate, culturally natural translations with explanations of grammatical nuances and idioms.",
                        prompt
                      );
                    }}
                    disabled={!translateText.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !translateText.trim() ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Translate instantly in Chat</span>
                  </button>
                </div>
              )}

              {/* ----------------- MATH SOLVER ----------------- */}
              {selectedToolId === "math" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Describe the Math Problem / Formula
                    </label>
                    <textarea
                      rows={3}
                      value={mathProblem}
                      onChange={(e) => setMathProblem(e.target.value)}
                      placeholder="Example: Find the derivative of f(x) = x^3 * cos(x) step by step..."
                      className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                        isDark ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white" : "bg-slate-50 border-slate-200 focus:border-indigo-300 text-slate-900"
                      }`}
                    />
                  </div>

                  {/* Math Image attachment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Optional: Upload handwritten math photo
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer relative hover:bg-slate-50/5 hover:border-indigo-500/50 transition-all ${
                        isDark ? "border-slate-800 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                      }`}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, "math")} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <Camera className="w-6 h-6 text-indigo-500 mx-auto" />
                          <p className="text-xs font-bold">Upload Math Image</p>
                          <p className="text-[10px] text-slate-400">Drag/drop or click to attach PNG/JPG</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      {mathAttachedImg ? (
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}>
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="text-xs font-semibold truncate">{mathAttachedImg.name}</span>
                          </div>
                          <button 
                            onClick={() => setMathAttachedImg(null)}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center">No image attached (optional)</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prompt = mathProblem.trim() 
                        ? `Please solve this math problem: "${mathProblem}"`
                        : "Please extract, solve, and analyze the math problem present in this attached image.";
                      onStartToolSession(
                        "Math Solver",
                        "data",
                        "You are an elite professor of mathematics and computational analysis. Solve equations with complete step-by-step rigorous proofs, explaining the core formulas and rules used.",
                        prompt,
                        mathAttachedImg || undefined
                      );
                    }}
                    disabled={!mathProblem.trim() && !mathAttachedImg}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      (!mathProblem.trim() && !mathAttachedImg) ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <Binary className="w-4 h-4" />
                    <span>Solve Math in Chat</span>
                  </button>
                </div>
              )}

              {/* ----------------- CODE GENERATOR ----------------- */}
              {selectedToolId === "coder" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Coding Task Description
                    </label>
                    <textarea
                      rows={3}
                      value={codeDesc}
                      onChange={(e) => setCodeDesc(e.target.value)}
                      placeholder="Example: Fetch and render weather forecast data using an API in React, styling it with responsive Tailwind classes..."
                      className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                        isDark ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white" : "bg-slate-50 border-slate-200 focus:border-indigo-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Programming Language / Framework
                      </label>
                      <select
                        value={codeLang}
                        onChange={(e) => setCodeLang(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript (ES6)</option>
                        <option value="python">Python 3</option>
                        <option value="react">React components (TSX)</option>
                        <option value="html-css">HTML + Tailwind CSS</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java SE</option>
                        <option value="rust">Rust</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Requirements (e.g. error handling, comments)
                      </label>
                      <input
                        type="text"
                        value={codeReqs}
                        onChange={(e) => setCodeReqs(e.target.value)}
                        placeholder="e.g. async/await, well-commented, robust types"
                        className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                          isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const prompt = `Write modular, clean code in "${codeLang}" for the following description: 
"${codeDesc}"
Requirements: ${codeReqs || "standard modular best practices, proper naming, inline comments."}
Provide:
1. Complete, copyable file structure.
2. In-depth comments explaining the algorithms and layout.
3. Steps on how to compile or run the code.`;
                      onStartToolSession(
                        "Code Generator",
                        "coder",
                        "You are an expert full-stack principal software engineer. Provide exceptionally clean, modern, well-typed, and modular code snippets with detailed developer explanations.",
                        prompt
                      );
                    }}
                    disabled={!codeDesc.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !codeDesc.trim() ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Generate Code in Chat</span>
                  </button>
                </div>
              )}

              {/* ----------------- PDF CHAT ----------------- */}
              {selectedToolId === "pdf" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Upload Document (.txt, .pdf, .json, .csv)
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50/5 hover:border-indigo-500/50 transition-all ${
                        isDark ? "border-slate-800 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                      }`}>
                        <input 
                          type="file" 
                          accept=".pdf,.txt,.md,.json,.csv" 
                          onChange={(e) => handleFileUpload(e, "pdf")} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2">
                          <FileUp className="w-7 h-7 text-indigo-500 mx-auto" />
                          <p className="text-xs font-bold">Select Document file</p>
                          <p className="text-[10px] text-slate-400">Supports standard text/PDF files</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      {pdfAttachedDoc ? (
                        <div className={`p-4 rounded-xl border space-y-2 ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="text-xs font-bold truncate">{pdfAttachedDoc.name}</span>
                            </div>
                            <button 
                              onClick={() => setPdfAttachedDoc(null)}
                              className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Attached successfully! Ask any questions below.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4 border border-slate-500/10 rounded-xl bg-slate-500/5">
                          <HelpCircle className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400 italic">No document selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Initial Question or Command
                    </label>
                    <input
                      type="text"
                      value={pdfPrompt}
                      onChange={(e) => setPdfPrompt(e.target.value)}
                      placeholder="e.g. Summarize the key findings or list 5 main points..."
                      className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      onStartToolSession(
                        "PDF Chat",
                        "general",
                        "You are an expert academic advisor and file analyzer. Study this attached document, summarize its contents, and accurately answer any questions based strictly on the text provided.",
                        pdfPrompt,
                        undefined,
                        pdfAttachedDoc || undefined
                      );
                    }}
                    disabled={!pdfAttachedDoc}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !pdfAttachedDoc ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Upload & Chat with Document</span>
                  </button>
                </div>
              )}

              {/* ----------------- IMAGE ANALYZER ----------------- */}
              {selectedToolId === "analyzer" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Select Image for Analysis
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer relative hover:bg-slate-50/5 hover:border-indigo-500/50 transition-all ${
                        isDark ? "border-slate-800 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                      }`}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, "analyzer")} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2">
                          <Camera className="w-7 h-7 text-indigo-500 mx-auto" />
                          <p className="text-xs font-bold">Upload Snapshot</p>
                          <p className="text-[10px] text-slate-400">Attach diagrams, diagrams, or photos</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      {analyzerAttachedImg ? (
                        <div className={`p-4 rounded-xl border space-y-2.5 ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                              <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="text-xs font-bold truncate">{analyzerAttachedImg.name}</span>
                            </div>
                            <button 
                              onClick={() => setAnalyzerAttachedImg(null)}
                              className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <img 
                            src={analyzerAttachedImg.data} 
                            alt="Analysis target" 
                            className="w-full object-contain rounded-lg max-h-[100px] bg-black border border-slate-500/10"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-4 border border-slate-500/10 rounded-xl bg-slate-500/5">
                          <ImageIcon className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400 italic">No image selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Analysis Prompt
                    </label>
                    <input
                      type="text"
                      value={analyzerPrompt}
                      onChange={(e) => setAnalyzerPrompt(e.target.value)}
                      placeholder="e.g. Describe this design, solve this written task, or extract code..."
                      className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      onStartToolSession(
                        "Image Analyzer",
                        "general",
                        "You are an expert multimodal AI vision model. Analyze the provided image meticulously, extracting technical details, textual values, or artistic nuances.",
                        analyzerPrompt,
                        analyzerAttachedImg || undefined
                      );
                    }}
                    disabled={!analyzerAttachedImg}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      !analyzerAttachedImg ? "bg-slate-400/20 text-slate-500 cursor-not-allowed border border-transparent" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Send Image to AI Analyzer</span>
                  </button>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
