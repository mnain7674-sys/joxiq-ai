import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Send,
  Image as ImageIcon,
  Trash2,
  Loader2,
  StopCircle,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
  Code,
  PenTool,
  GraduationCap,
  Languages,
  BarChart3,
  Sliders,
  Globe,
  Settings,
  MessageSquare,
  Search,
  Zap,
  Compass,
  Mail,
  ChevronRight,
  ExternalLink,
  Info,
  Check,
  Copy,
  Star,
  Share2,
  Mic,
  MicOff,
  FileText,
  Sun,
  Moon,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Camera,
  Smartphone,
  Edit2,
  Briefcase,
  FolderPlus,
  Bookmark,
  LogOut,
  LogIn,
  UserPlus,
  User,
  LayoutGrid,
  Wrench,
  Crown,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  Message,
  Conversation,
  AttachedImage,
  AttachedDocument,
  SUGGESTED_STARTERS,
  AVAILABLE_MODELS,
  SYSTEM_PERSONAS,
  Project
} from "./types";
import { MarkdownMessage } from "./components/MarkdownMessage";
import { SettingsPanel } from "./components/SettingsPanel";
import { EducationalSuite } from "./components/EducationalSuite";
import { AboutPage } from "./components/AboutPage";
import { ToolsPage } from "./components/ToolsPage";
import { ProSubscriptionModal } from "./components/ProSubscriptionModal";
import { AdminDashboard } from "./components/AdminDashboard";
import joxiqEmblem from "./assets/images/joxiq_emblem_1783529116595.jpg";
import joxiqLogo from "./assets/images/joxiq_logo_black_bg_1783530406544.jpg";

function cleanErrorMessage(err: any): string {
  const message = err?.message || String(err);
  try {
    if (message.includes("{")) {
      const jsonStart = message.indexOf("{");
      const jsonStr = message.substring(jsonStart);
      const parsed = JSON.parse(jsonStr);
      if (parsed?.error?.message) {
        const innerMsg = parsed.error.message;
        if (innerMsg.includes("{")) {
          const innerParsed = JSON.parse(innerMsg);
          if (innerParsed?.error?.message) {
            return innerParsed.error.message;
          }
        }
        return innerMsg;
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }
  
  if (message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand") || message.includes("Service Unavailable")) {
    return "The Gemini AI model is currently experiencing extremely high demand. Spikes in demand are usually temporary. Please try again in a few seconds!";
  }
  
  return message;
}

export default function App() {
  // --- Active main layout view ---
  const [activeView, setActiveView] = useState<"chat" | "education" | "about" | "tools" | "admin">("chat");

  // --- Conversations and active state ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => typeof window !== "undefined" && window.innerWidth >= 768);

  const handleSidebarItemClick = (action: () => void) => {
    action();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // --- User Profile / Authentication state ---
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authNameInput, setAuthNameInput] = useState<string>("");
  const [authEmailInput, setAuthEmailInput] = useState<string>("");
  const [authPasswordInput, setAuthPasswordInput] = useState<string>("");
  const [authConfirmPasswordInput, setAuthConfirmPasswordInput] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("signup");
  const [forgotEmailInput, setForgotEmailInput] = useState<string>("");
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // --- Pro Subscription & Token Limit states ---
  const [isProUser, setIsProUser] = useState<boolean>(() => localStorage.getItem("julkar_is_pro") === "true");
  const [freeMessagesLeft, setFreeMessagesLeft] = useState<number>(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("julkar_free_messages_date");
    const saved = localStorage.getItem("julkar_free_messages_left");

    if (savedDate !== today) {
      localStorage.setItem("julkar_free_messages_date", today);
      localStorage.setItem("julkar_free_messages_left", "15");
      return 15;
    }
    return saved !== null ? parseInt(saved, 10) : 15;
  });
  const [proModalOpen, setProModalOpen] = useState<boolean>(false);

  // --- Theme Mode state ---
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // --- Input state ---
  const [inputText, setInputText] = useState<string>("");
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
  const [attachedDocument, setAttachedDocument] = useState<AttachedDocument | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // --- Voice Input state ---
  const [isListening, setIsListening] = useState<boolean>(false);

  // --- Share Modal state ---
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [savedMessageIds, setSavedMessageIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("julkar_saved_message_ids");
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const toggleSaveMessage = (msgId: string) => {
    setSavedMessageIds((prev) => {
      const next = prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId];
      localStorage.setItem("julkar_saved_message_ids", JSON.stringify(next));
      return next;
    });
  };

  const copyMessageText = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const shareMessage = async (msg: Message) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Julkar AI Response",
          text: msg.content,
        });
      } catch (err) {
        copyMessageText(msg);
      }
    } else {
      copyMessageText(msg);
    }
  };

  const deleteMessage = (msgId: string) => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== msgId),
          };
        }
        return c;
      })
    );
  };

  // --- Settings state (local session overrides, sync to active chat configuration) ---
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("general");
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");

  // --- Streaming & UI auxiliary states ---
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [currentStreamText, setCurrentStreamText] = useState<string>("");
  const [currentGrounding, setCurrentGrounding] = useState<{ chunks: any[]; queries: string[] } | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);

  // --- Attachment options (Plus Menu) & Camera States ---
  const [plusMenuOpen, setPlusMenuOpen] = useState<boolean>(false);
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputSnapshotRef = useRef<string>("");

  // Load initial settings, history, and theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gemini_conversations");
    const active = localStorage.getItem("gemini_active_conv_id");
    const savedVoice = localStorage.getItem("gemini_selected_voice");
    const savedSearch = localStorage.getItem("gemini_use_search");
    const savedTheme = localStorage.getItem("gemini_theme") as "dark" | "light" | null;
    const savedProjects = localStorage.getItem("gemini_projects");
    const savedActiveProj = localStorage.getItem("gemini_active_project_id");

    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedSearch) setUseSearch(savedSearch === "true");
    const savedProfile = localStorage.getItem("julkar_user_profile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse user profile", e);
      }
    }
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark mode but check system preferences as fallback
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    }

    if (saved) {
      try {
        const parsed: Conversation[] = JSON.parse(saved);
        const defaultPersona = SYSTEM_PERSONAS[0];
        const initialNewChat: Conversation = {
          id: Math.random().toString(36).substring(2, 11),
          title: "New Chat",
          messages: [],
          model: "gemini-2.5-flash",
          systemInstruction: defaultPersona.systemInstruction,
          temperature,
          useSearch,
          timestamp: Date.now(),
        };
        setConversations([initialNewChat, ...parsed]);
        setActiveId(initialNewChat.id);
      } catch (e) {
        console.error("Failed to restore history", e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Sync theme changes
  useEffect(() => {
    localStorage.setItem("gemini_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Sync state changes to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("gemini_conversations", JSON.stringify(conversations));
    } else {
      localStorage.removeItem("gemini_conversations");
    }
  }, [conversations]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem("gemini_active_conv_id", activeId);
      // Sync chat settings when switching chats
      const activeChat = conversations.find((c) => c.id === activeId);
      if (activeChat) {
        setTemperature(activeChat.temperature);
        setUseSearch(activeChat.useSearch);
        const persona = SYSTEM_PERSONAS.find((p) => p.systemInstruction === activeChat.systemInstruction);
        if (persona) {
          setSelectedPersonaId(persona.id);
          setCustomInstruction("");
        } else if (activeChat.systemInstruction) {
          setSelectedPersonaId("custom");
          setCustomInstruction(activeChat.systemInstruction);
        } else {
          setSelectedPersonaId("general");
          setCustomInstruction("");
        }
      }
    } else {
      localStorage.removeItem("gemini_active_conv_id");
    }
  }, [activeId]);

  useEffect(() => {
    localStorage.setItem("gemini_selected_voice", selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem("gemini_use_search", String(useSearch));
  }, [useSearch]);

  // Handle active conversation settings modification
  useEffect(() => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          let systemInstruction = "";
          if (selectedPersonaId === "custom") {
            systemInstruction = customInstruction;
          } else {
            const persona = SYSTEM_PERSONAS.find((p) => p.id === selectedPersonaId);
            systemInstruction = persona ? persona.systemInstruction : "";
          }
          return {
            ...c,
            temperature,
            useSearch,
            systemInstruction,
          };
        }
        return c;
      })
    );
  }, [selectedPersonaId, customInstruction, temperature, useSearch]);

  // Auto scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, currentStreamText, isStreaming]);

  // Get active conversation object
  const activeConversation = conversations.find(
    (c) => c.id === activeId
  );

  // Initialize a fresh new conversation
  const createNewChat = (initialPrompt?: string) => {
    const defaultPersona = SYSTEM_PERSONAS.find((p) => p.id === selectedPersonaId) || SYSTEM_PERSONAS[0];
    const newChat: Conversation = {
      id: Math.random().toString(36).substring(2, 11),
      title: initialPrompt ? (initialPrompt.length > 25 ? initialPrompt.substring(0, 25) + "..." : initialPrompt) : "New Chat",
      messages: [],
      model: "gemini-2.5-flash",
      systemInstruction: selectedPersonaId === "custom" ? customInstruction : defaultPersona.systemInstruction,
      temperature,
      useSearch,
      timestamp: Date.now(),
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    return newChat;
  };

  const startToolSession = (
    toolName: string,
    personaId: string,
    systemInstruction: string,
    initialPrompt: string,
    initialImage?: AttachedImage,
    initialDocument?: AttachedDocument
  ) => {
    setActiveView("chat");
    setSelectedPersonaId(personaId);
    
    const newChat: Conversation = {
      id: Math.random().toString(36).substring(2, 11),
      title: `${toolName}: ${initialPrompt.length > 20 ? initialPrompt.substring(0, 20) + "..." : initialPrompt}`,
      messages: [],
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      temperature: 0.7,
      useSearch: false,
      timestamp: Date.now(),
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    setInputText("");
    
    setTimeout(() => {
      handleSendMessage(initialPrompt, newChat, initialImage, initialDocument);
    }, 150);
  };

  // Delete conversation
  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Stop speaking if active speech belongs to deleted chat
    if (activeSpeechMsgId) {
      stopTts();
    }
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeId === id) {
      if (filtered.length > 0) {
        setActiveId(filtered[0].id);
      } else {
        setActiveId("");
      }
    }
  };

  // Clear all history
  const clearAllChats = () => {
    stopTts();
    setConversations([]);
    setActiveId("");
  };

  // Handle Drag & Drop / Image uploads
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage({
        data: reader.result as string,
        mimeType: file.type,
      });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // --- Camera Streaming & Capture Engine ---
  useEffect(() => {
    if (cameraModalOpen) {
      // 1. Enumerate available webcam devices
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoDevs = devices.filter((d) => d.kind === "videoinput");
          setCameraDevices(videoDevs);
          if (videoDevs.length > 0 && !selectedCameraId) {
            setSelectedCameraId(videoDevs[0].deviceId);
          }
        })
        .catch((err) => {
          console.error("Camera device list enumeration failed", err);
        });

      // 2. Request user video media stream
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
      };

      setCameraError(null);
      
      // Stop old stream if running before opening new one to avoid double binding
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera stream access failed", err);
          setCameraError(
            "Camera access blocked or not supported in this frame environment. Please allow permission or try the 'Phone Camera' option."
          );
        });
    } else {
      // Stop and release video tracks on close
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraModalOpen, selectedCameraId]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Capture active frame from video feed
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setAttachedImage({
          data: dataUrl,
          mimeType: "image/jpeg",
        });
        setCameraModalOpen(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        processImageFile(file);
      } else {
        processDocumentFile(file);
      }
    }
  };

  // --- Speech Recognition initialization ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const base = inputSnapshotRef.current.trim();
        const speech = transcript.trim();
        if (speech) {
          setInputText(base ? `${base} ${speech}` : speech);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      inputSnapshotRef.current = inputText;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // --- Document File Parser ---
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const processDocumentFile = (file: File) => {
    const isTextReadable =
      file.type.startsWith("text/") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".js") ||
      file.name.endsWith(".ts") ||
      file.name.endsWith(".tsx") ||
      file.name.endsWith(".py") ||
      file.name.endsWith(".html") ||
      file.name.endsWith(".css");

    setIsUploading(true);
    const reader = new FileReader();

    if (isTextReadable) {
      reader.onloadend = () => {
        setAttachedDocument({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type || "text/plain",
          content: reader.result as string,
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert("Failed to read document content.");
      };
      reader.readAsText(file);
    } else {
      // General file/PDF fallback
      reader.onloadend = () => {
        const rawContent = reader.result as string;
        // Strip out non-printable binary details to avoid clutter and model crashes
        const printableText = rawContent.replace(/[^\x20-\x7E\r\n\t]/g, " ").substring(0, 50000);
        
        setAttachedDocument({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type || "application/pdf",
          content: `[Extracted readable content from file: ${file.name}]\nFile Name: ${file.name}\nFile Size: ${formatFileSize(file.size)}\nFile Type: ${file.type || "unknown"}\n\nExcerpt:\n${printableText.substring(0, 15000) || "(Binary content parsed safely)"}`,
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        alert("Failed to process document.");
      };
      reader.readAsText(file);
    }
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processDocumentFile(e.target.files[0]);
    }
  };

  // --- Favorite Chat toggling ---
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  // --- Message ratings (Like/Dislike) ---
  const rateMessage = (msgId: string, rating: "like" | "dislike" | null) => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: c.messages.map((m) => (m.id === msgId ? { ...m, rating } : m)),
          };
        }
        return c;
      })
    );
  };

  // --- Clear Current Chat Messages ---
  const clearCurrentChatMessages = () => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [] } : c))
    );
  };

  // --- Local Text-to-Speech Synthesis fallback ---
  const speakLocalSpeech = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setActiveSpeechMsgId(null);
    };
    utterance.onerror = () => {
      setActiveSpeechMsgId(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Triggers sending user query to local API with streaming SSE
  const handleSendMessage = async (
    customText?: string,
    targetChat?: Conversation,
    customImage?: AttachedImage,
    customDocument?: AttachedDocument
  ) => {
    const textToSend = customText !== undefined ? customText : inputText;
    const imgToSend = customImage !== undefined ? customImage : attachedImage;
    const docToSend = customDocument !== undefined ? customDocument : attachedDocument;

    if (!textToSend.trim() && !imgToSend && !docToSend) return;

    // Check free message limit
    if (!isProUser) {
      if (freeMessagesLeft <= 0) {
        setProModalOpen(true);
        return;
      }
      const nextCount = freeMessagesLeft - 1;
      setFreeMessagesLeft(nextCount);
      localStorage.setItem("julkar_free_messages_left", String(nextCount));
    }

    setStreamError(null);
    let chat = targetChat || activeConversation;

    // Create a new chat on the fly if none is selected
    if (!chat) {
      chat = createNewChat(textToSend || (docToSend ? `Analyze ${docToSend.name}` : "New Chat"));
    }

    // Prepare User Message object
    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
      image: imgToSend || undefined,
      document: docToSend || undefined,
    };

    // Update conversation state with user message
    const updatedMessages = [...chat.messages, userMessage];

    // Auto update title if it was default
    let updatedTitle = chat.title;
    if (chat.title === "New Chat") {
      updatedTitle = textToSend
        ? (textToSend.length > 30 ? textToSend.substring(0, 30) + "..." : textToSend)
        : (docToSend ? `File: ${docToSend.name}` : "New Chat");
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === chat!.id ? { ...c, messages: updatedMessages, title: updatedTitle } : c))
    );

    // Clear user inputs
    setInputText("");
    setAttachedImage(null);
    setAttachedDocument(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Start assistant SSE streaming
    setIsStreaming(true);
    setCurrentStreamText("");
    setCurrentGrounding(null);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          model: chat.model,
          systemInstruction: chat.systemInstruction,
          temperature: chat.temperature,
          useSearch: chat.useSearch,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "An error occurred with the backend server.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Cannot initialize the stream reader.");
      }

      let done = false;
      let finalResponseText = "";
      let finalGrounding: any = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const payloadStr = trimmed.replace(/^data: /, "");
            if (payloadStr === "[DONE]") {
              done = true;
              break;
            }

            let payload: any = null;
            try {
              payload = JSON.parse(payloadStr);
            } catch (e: any) {
              // Ignore partial JSON parsing errors that might happen on boundary splits
            }

            if (payload) {
              if (payload.text) {
                finalResponseText += payload.text;
                setCurrentStreamText(finalResponseText);
              }
              if (payload.grounding) {
                finalGrounding = payload.grounding;
                setCurrentGrounding(payload.grounding);
              }
              if (payload.error) {
                throw new Error(payload.error);
              }
            }
          }
        }
      }

      // Finish streaming and persist the final assistant response
      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 11),
        role: "assistant",
        content: finalResponseText,
        timestamp: Date.now(),
        grounding: finalGrounding || undefined,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === chat!.id ? { ...c, messages: [...updatedMessages, assistantMessage] } : c
        )
      );
    } catch (err: any) {
      console.error(err);
      setStreamError(cleanErrorMessage(err));
    } finally {
      setIsStreaming(false);
      setCurrentStreamText("");
      setCurrentGrounding(null);
    }
  };

  // Multi-line Textarea growth adjustment
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Hotkey capture
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Speak assistant content out loud via Server-Sent TTS API
  const handleSpeakTts = async (msg: Message) => {
    if (activeSpeechMsgId === msg.id) {
      stopTts();
      return;
    }

    stopTts(); // stop any active audio
    setIsGeneratingTts(true);
    setActiveSpeechMsgId(msg.id);

    try {
      const cleanText = msg.content
        .replace(/`{3}[\s\S]*?`{3}/g, "") // Strip code blocks from speech
        .replace(/[*_#`\-]/g, "") // Strip markdown symbols
        .substring(0, 600); // Guard rails to speak only digestible chunks

      const response = await fetch("/api/chat/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText || "Rendering text elements...",
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error("Speech synthesis failed");
      }

      const { audio } = await response.json();
      const audioUrl = `data:audio/mp3;base64,${audio}`;

      const sound = new Audio(audioUrl);
      sound.play();
      sound.onended = () => {
        setActiveSpeechMsgId(null);
      };
      audioRef.current = sound;
    } catch (err) {
      console.warn("Backend TTS failed, falling back to local speech synthesis.", err);
      try {
        const cleanText = msg.content
          .replace(/`{3}[\s\S]*?`{3}/g, "") // Strip code blocks from speech
          .replace(/[*_#`\-]/g, "") // Strip markdown symbols
          .substring(0, 600);
        speakLocalSpeech(cleanText);
      } catch (localErr) {
        console.error(localErr);
        alert("Could not load voice synthesizer.");
        setActiveSpeechMsgId(null);
      }
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const stopTts = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSpeechMsgId(null);
    setIsGeneratingTts(false);
  };

  // Quick helper to determine active persona meta
  const currentPersona = SYSTEM_PERSONAS.find((p) => p.id === selectedPersonaId);

  const selectMode = (modeId: string) => {
    setSelectedPersonaId(modeId);
    const targetPersona = SYSTEM_PERSONAS.find((p) => p.id === modeId);
    if (targetPersona && activeId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, systemInstruction: targetPersona.systemInstruction } : c
        )
      );
    }
  };

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const getChatTranscript = () => {
    if (!activeConversation) return "";
    return activeConversation.messages
      .map((m) => `### ${m.role === "user" ? "User" : "AI Assistant"}\n\n${m.content}\n\n`)
      .join("---\n\n");
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/share/${activeId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyTranscript = () => {
    const transcript = getChatTranscript();
    navigator.clipboard.writeText(transcript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!activeConversation || isStreaming) return;

    const messages = activeConversation.messages;
    if (messages.length < 2) return;

    // Find last assistant message index
    const lastMsgIndex = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (lastMsgIndex === -1) return;

    const actualIndex = messages.length - 1 - lastMsgIndex;
    const lastUserMessage = messages.slice(0, actualIndex).reverse().find((m) => m.role === "user");
    if (!lastUserMessage) return;

    const slicedMessages = messages.slice(0, actualIndex);

    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: slicedMessages } : c))
    );

    setIsStreaming(true);
    setCurrentStreamText("");
    setCurrentGrounding(null);
    setStreamError(null);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: slicedMessages,
          model: activeConversation.model,
          systemInstruction: activeConversation.systemInstruction,
          temperature: activeConversation.temperature,
          useSearch: activeConversation.useSearch,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to stream response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No reader available");

      let done = false;
      let finalResponseText = "";
      let finalGrounding: any = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const payloadStr = trimmed.replace(/^data: /, "");
            if (payloadStr === "[DONE]") {
              done = true;
              break;
            }

            let payload: any = null;
            try {
              payload = JSON.parse(payloadStr);
            } catch (e: any) {
              // Ignore partial JSON parsing errors that might happen on boundary splits
            }

            if (payload) {
              if (payload.text) {
                finalResponseText += payload.text;
                setCurrentStreamText(finalResponseText);
              }
              if (payload.grounding) {
                finalGrounding = payload.grounding;
                setCurrentGrounding(payload.grounding);
              }
              if (payload.error) {
                throw new Error(payload.error);
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 11),
        role: "assistant",
        content: finalResponseText,
        timestamp: Date.now(),
        grounding: finalGrounding || undefined,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id ? { ...c, messages: [...slicedMessages, assistantMessage] } : c
        )
      );
    } catch (err: any) {
      console.error(err);
      setStreamError(cleanErrorMessage(err));
    } finally {
      setIsStreaming(false);
      setCurrentStreamText("");
      setCurrentGrounding(null);
    }
  };

  const favoriteChats = conversations.filter((c) => c.isFavorite);
  const regularChats = [...conversations]
    .filter((c) => !c.isFavorite)
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className={`relative w-full h-screen flex overflow-hidden font-sans transition-colors duration-300 selection:bg-indigo-500/30 ${
      theme === "dark" ? "bg-[#050b18] text-slate-200 dark" : "bg-[#f4f7fc] text-slate-800"
    }`}>
      {/* Mesh Gradient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar: Navigation & History */}
      <aside
        id="chat-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col transition-all duration-300 ease-in-out md:shrink-0 ${
          theme === "dark" 
            ? "bg-[#0b1329] border-white/10 text-slate-200" 
            : "bg-white border-slate-200 text-slate-800"
        } backdrop-blur-3xl ${
          sidebarOpen 
            ? "translate-x-0 md:translate-x-0 md:relative md:w-72 md:opacity-100 shadow-2xl md:shadow-none md:border-r" 
            : "-translate-x-full md:translate-x-0 md:relative md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0 md:pointer-events-none"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`p-6 flex items-center justify-between border-b ${
          theme === "dark" ? "border-white/5" : "border-slate-200/40"
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-12 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-white/10 bg-slate-900 p-0.5">
              <img
                src={joxiqLogo}
                alt="JOXIQ AI Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className={`font-bold text-base tracking-tight ${
              theme === "dark" ? "bg-gradient-to-r from-white to-slate-400" : "bg-gradient-to-r from-slate-900 to-indigo-950"
            } bg-clip-text text-transparent`}>
              JOXIQ AI Chat
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 cursor-pointer`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 flex flex-col gap-2">
          <button
            id="btn-new-chat"
            onClick={() => createNewChat()}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-black/5 group active:scale-[0.98] ${
              theme === "dark"
                ? "bg-white/10 hover:bg-white/15 border border-white/20 text-slate-100"
                : "bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/15 text-white shadow-indigo-500/10"
            }`}
          >
            <span className="font-semibold text-sm flex items-center gap-2">
              <Plus size={16} className={`group-hover:rotate-90 transition-transform duration-200 ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-100"
              }`} />
              New Chat
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              theme === "dark" ? "bg-white/10 text-slate-400" : "bg-indigo-750 text-indigo-200"
            }`}>
              Reset
            </span>
          </button>
        </div>

        {/* ChatGPT-style Main Menu */}
        <div className="px-4 pb-3 border-b border-slate-500/10 flex flex-col gap-1">
          <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Navigation Menu
          </div>
          
          <button
            onClick={() => handleSidebarItemClick(() => {
              setActiveView("chat");
              const emptyChat = conversations.find(c => c.messages.length === 0);
              if (emptyChat) {
                setActiveId(emptyChat.id);
              } else {
                createNewChat();
              }
            })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === "chat" && (!activeConversation || activeConversation.messages.length === 0)
                ? (theme === "dark" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border border-indigo-200")
                : (theme === "dark" ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700")
            }`}
          >
            <Compass size={16} className="text-indigo-500" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleSidebarItemClick(() => setActiveView("chat"))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === "dark" ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <MessageSquare size={16} className="text-violet-500" />
            <span className="flex-1 text-left">Chat History</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => handleSidebarItemClick(() => setSettingsOpen(true))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === "dark" ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Settings size={16} className="text-amber-500" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => handleSidebarItemClick(() => setShowAuthModal(true))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === "dark" ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <User size={16} className="text-emerald-500" />
            <span className="flex-1 text-left">Profile</span>
            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[100px]">
              {userProfile ? userProfile.name : "Guest"}
            </span>
          </button>

          <button
            onClick={() => handleSidebarItemClick(() => setProModalOpen(true))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === "dark" ? "hover:bg-amber-500/10 text-amber-300" : "hover:bg-amber-50 text-amber-700"
            }`}
          >
            <Crown size={16} className="text-amber-500" />
            <span className="flex-1 text-left">Subscription</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
              isProUser ? "bg-amber-500 text-white" : "bg-indigo-500/10 text-indigo-400"
            }`}>
              {isProUser ? "Pro" : "Free"}
            </span>
          </button>
        </div>

        {/* Workspace Mode Selection */}
        <div className="px-4 pb-4 border-b border-slate-500/10 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveView("chat")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeView === "chat"
                ? (theme === "dark" ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold")
                : "border-transparent text-slate-500 hover:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <MessageSquare size={14} className="text-indigo-500" />
            <span>JOXIQ AI Chat Hub</span>
          </button>

          <button
            onClick={() => setActiveView("tools")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeView === "tools"
                ? (theme === "dark" ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold")
                : "border-transparent text-slate-500 hover:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <LayoutGrid size={14} className="text-violet-500" />
            <span className="flex-1 text-left">Workspace Tools</span>
            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-violet-500/10 text-violet-500 px-1.5 py-0.5 rounded-md">New</span>
          </button>

          <button
            onClick={() => setActiveView("education")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeView === "education"
                ? (theme === "dark" ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold")
                : "border-transparent text-slate-500 hover:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <GraduationCap size={14} className="text-emerald-500" />
            <span className="flex-1 text-left">AI Classroom Suite</span>
            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md">Advanced</span>
          </button>

          {userProfile?.email?.toLowerCase() === "mnain7674@gmail.com" && (
            <button
              onClick={() => setActiveView("admin")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeView === "admin"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 font-extrabold"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10"
              }`}
            >
              <Crown size={14} className="text-amber-500" />
              <span className="flex-1 text-left">Admin Portal 👑</span>
              <span className="text-[9px] uppercase font-extrabold tracking-widest bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-md">Owner</span>
            </button>
          )}

          <button
            onClick={() => setActiveView("about")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeView === "about"
                ? (theme === "dark" ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold")
                : "border-transparent text-slate-500 hover:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Info size={14} className="text-amber-500" />
            <span className="flex-1 text-left">About JOXIQ AI</span>
          </button>
        </div>

        {/* History Stream / Sidebar Sections */}
        <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto overflow-x-hidden select-none">

          {/* Saved Chats (Starred) Section */}
          <div className="space-y-1.5 border-b pb-4 border-slate-500/10">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${
                theme === "dark" ? "text-amber-500" : "text-amber-600"
              }`}>
                <Bookmark size={12} className="fill-amber-500 text-amber-500" />
                <span>Saved Chats</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({favoriteChats.length})</span>
            </div>

            {favoriteChats.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-3 italic">
                No saved chats in this project
              </div>
            ) : (
              favoriteChats.map((chat) => {
                const isSelected = chat.id === activeId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveId(chat.id);
                      setActiveView("chat");
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`group relative p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/30 shadow-md"
                        : "border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5"
                    }`}
                  >
                    <Star
                      size={13}
                      onClick={(e) => toggleFavorite(chat.id, e)}
                      className="shrink-0 text-amber-500 fill-amber-500 cursor-pointer hover:scale-125 transition-transform"
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <div className={`text-xs truncate font-medium ${
                        isSelected 
                          ? (theme === "dark" ? "text-slate-100 font-bold" : "text-indigo-950 font-bold")
                          : (theme === "dark" ? "text-slate-400" : "text-slate-600")
                      }`}>
                        {chat.title}
                      </div>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150"
                      title="Delete Chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent Chats Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}>
                Recent Chats
              </span>
              <span className="text-[10px] text-slate-400 font-mono">({regularChats.length})</span>
            </div>

            {regularChats.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-6 italic">
                No recent chats in this project
              </div>
            ) : (
              regularChats.map((chat) => {
                const isSelected = chat.id === activeId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveId(chat.id);
                      setActiveView("chat");
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`group relative p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-white/10 dark:bg-white/10 border-slate-200 dark:border-white/15 shadow-md"
                        : "border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5"
                    }`}
                  >
                    <MessageSquare
                      size={13}
                      className={`shrink-0 ${isSelected ? "text-indigo-500" : "text-slate-400"}`}
                    />
                    <div className="flex-1 min-w-0 pr-12">
                      <div className={`text-xs truncate font-medium ${
                        isSelected 
                          ? (theme === "dark" ? "text-slate-100 font-bold" : "text-slate-900 font-bold")
                          : (theme === "dark" ? "text-slate-400" : "text-slate-600")
                      }`}>
                        {chat.title}
                      </div>
                    </div>

                    {/* Quick star/save button */}
                    <button
                      onClick={(e) => toggleFavorite(chat.id, e)}
                      className="absolute right-7 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Save / Star Chat"
                    >
                      <Star size={11} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-150 text-slate-500"
                      title="Delete Chat"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Sidebar Footer User Panel */}
        <div className={`p-4 border-t backdrop-blur-xl flex flex-col gap-2 ${
          theme === "dark" ? "border-white/10 bg-black/25" : "border-slate-200/60 bg-white/40"
        }`}>
          {userProfile ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 border border-white/20 flex items-center justify-center font-bold text-sm text-white select-none shadow-md">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold truncate flex items-center gap-1.5 ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                    <span>{userProfile.name}</span>
                    {userProfile.email?.toLowerCase() === "mnain7674@gmail.com" && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        Admin 👑
                      </span>
                    )}
                  </div>
                  {userProfile.email && (
                    <div className="text-[10px] text-slate-500 truncate font-mono">
                      {userProfile.email}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("julkar_user_profile");
                  setUserProfile(null);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  theme === "dark" ? "text-slate-400 hover:text-rose-400 hover:bg-white/5" : "text-slate-500 hover:text-rose-500 hover:bg-black/5"
                }`}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setAuthMode("signup");
                setAuthNameInput("");
                setAuthEmailInput("");
                setShowAuthModal(true);
              }}
              className={`flex items-center gap-3 p-2 rounded-xl border border-dashed transition-all cursor-pointer ${
                theme === "dark"
                  ? "border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 text-indigo-400 hover:text-indigo-300"
                  : "border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-indigo-600 hover:text-indigo-700"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold tracking-wide">Sign Up / Log In</div>
                <div className="text-[9px] text-slate-400 font-medium">To save workspace profile</div>
              </div>
            </div>
          )}
          {conversations.length > 0 && (
            <button
              onClick={clearAllChats}
              className="mt-2 w-full py-1.5 text-center text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
            >
              Clear all history
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area: Chat Interface */}
      <main className="relative flex-1 flex flex-col h-full overflow-hidden z-0 min-w-0 w-full">
        {/* Top Navbar */}
        <header className={`h-16 flex items-center justify-between px-3 sm:px-6 md:px-8 border-b shrink-0 z-10 ${
          theme === "dark" ? "bg-white/5 border-white/10" : "bg-white/60 border-slate-200/60"
        } backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <button
              id="btn-sidebar-toggle"
              onClick={() => setSidebarOpen(prev => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === "dark" ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Toggle Sidebar Menu"
            >
              <Menu size={18} />
            </button>

            {/* Home / Return to Home Dashboard Button */}
            <button
              id="btn-header-home"
              onClick={() => {
                const emptyChat = conversations.find(c => c.messages.length === 0);
                if (emptyChat) {
                  setActiveId(emptyChat.id);
                  setActiveView("chat");
                } else {
                  createNewChat();
                }
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === "dark" ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Return to Home Dashboard"
            >
              <Compass size={18} className="text-indigo-500" />
            </button>

            {/* Quick New Chat Button */}
            <button
              id="btn-header-new-chat"
              onClick={() => createNewChat()}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                theme === "dark" ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              }`}
              title="Start New Chat"
            >
              <Plus size={16} />
              <span className="text-xs font-bold hidden xs:inline sm:inline">New Chat</span>
            </button>

            {/* Quick Model Selector Toggle */}
            <div className={`hidden sm:flex items-center p-1 rounded-xl border ${
              theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                onClick={() => {
                  if (activeConversation) {
                    setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, model: 'gemini-2.5-flash' } : c));
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  (!activeConversation || activeConversation.model === "gemini-2.5-flash" || !activeConversation.model)
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Flash
              </button>
              <button
                onClick={() => {
                  if (!isProUser) {
                    setProModalOpen(true);
                    return;
                  }
                  if (activeConversation) {
                    setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, model: 'gemini-2.5-pro' } : c));
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  (activeConversation?.model === "gemini-2.5-pro")
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-amber-400 hover:text-amber-300"
                }`}
                title={!isProUser ? "Upgrade to Pro to unlock Gemini 2.5 Pro" : "Switch to Gemini 2.5 Pro"}
              >
                <Sparkles size={11} />
                <span>Pro</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 hidden md:inline">Mode:</span>
              <div
                onClick={() => setSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full cursor-pointer transition-all shadow-sm active:scale-95 ${
                  theme === "dark" ? "bg-white/10 border-white/20 text-indigo-400" : "bg-white border-slate-200 text-indigo-600"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {currentPersona ? currentPersona.name : "Custom AI"}
                </span>
                <ChevronRight size={12} className="text-slate-400 rotate-90" />
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                theme === "dark" ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
              title="Open AI Model & Advanced Settings"
            >
              <Wrench size={14} className="text-indigo-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Upgrade to Pro Button */}
            <button
              onClick={() => setProModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer animate-pulse"
            >
              <Crown size={14} />
              <span>{isProUser ? "Pro ⭐" : <><span className="hidden sm:inline">Upgrade Pro </span><span>({freeMessagesLeft} left)</span></>}</span>
            </button>
            {useSearch && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                <Globe size={11} className="animate-spin" />
                <span>Search Active</span>
              </div>
            )}

            {/* Clear messages of active chat */}
            {activeConversation && activeConversation.messages.length > 0 && (
              <button
                onClick={clearCurrentChatMessages}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  theme === "dark" ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
                title="Clear current messages (preserve settings)"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Favorite / Star active conversation */}
            {activeConversation && (
              <button
                onClick={(e) => toggleFavorite(activeConversation.id, e)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  activeConversation.isFavorite 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                    : (theme === "dark" ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-500")
                }`}
                title="Favorite / Star Chat"
              >
                <Star size={16} className={activeConversation.isFavorite ? "fill-amber-500" : ""} />
              </button>
            )}

            {/* Share Chat Trigger */}
            {activeConversation && activeConversation.messages.length > 0 && (
              <button
                onClick={() => setShareModalOpen(true)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  theme === "dark" ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
                title="Share Chat"
              >
                <Share2 size={16} />
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === "dark" ? "bg-white/5 border-white/10 text-yellow-400" : "bg-white border-slate-200 text-indigo-600"
              }`}
              title="Toggle light/dark mode"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              id="btn-open-settings"
              onClick={() => setSettingsOpen(true)}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                theme === "dark" ? "bg-white/5 border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-700"
              }`}
              title="Chat Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {activeView === "admin" && userProfile?.email?.toLowerCase() === "mnain7674@gmail.com" ? (
          <div className="flex-1 overflow-y-auto">
            <AdminDashboard theme={theme} userProfile={userProfile} onBackToChat={() => setActiveView("chat")} />
          </div>
        ) : activeView === "education" ? (
          <div className="flex-1 overflow-y-auto">
            <EducationalSuite theme={theme} userProfile={userProfile} />
          </div>
        ) : activeView === "about" ? (
          <div className="flex-1 overflow-y-auto">
            <AboutPage theme={theme} />
          </div>
        ) : activeView === "tools" ? (
          <div className="flex-1 overflow-y-auto">
            <ToolsPage 
              theme={theme} 
              onStartToolSession={startToolSession} 
              onNavigateToChat={() => {
                setActiveView("chat");
                setSelectedPersonaId("general");
              }}
            />
          </div>
        ) : (
          <>
            {/* Chat Modes Segmented Selection Bar (dynamic helper for ChatGPT modes) */}
        <div className={`px-4 md:px-8 py-2.5 border-b flex items-center justify-start gap-2 overflow-x-auto scrollbar-none z-10 ${
          theme === "dark" ? "bg-black/10 border-white/5" : "bg-white/20 border-slate-200/30"
        }`}>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 mr-1">Modes:</span>
          
          <button
            onClick={() => selectMode("general")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              selectedPersonaId === "general"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                : (theme === "dark" ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300" : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700")
            }`}
          >
            <Sparkles size={12} />
            <span>JOXIQ AI</span>
          </button>

          <button
            onClick={() => selectMode("socratic")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              selectedPersonaId === "socratic"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                : (theme === "dark" ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300" : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700")
            }`}
          >
            <GraduationCap size={12} />
            <span>Study Mode</span>
          </button>

          <button
            onClick={() => selectMode("coder")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              selectedPersonaId === "coder"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                : (theme === "dark" ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300" : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700")
            }`}
          >
            <Code size={12} />
            <span>Coding Mode</span>
          </button>

          <button
            onClick={() => selectMode("translator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all shrink-0 ${
              selectedPersonaId === "translator"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                : (theme === "dark" ? "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300" : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700")
            }`}
          >
            <Languages size={12} />
            <span>Translation Mode</span>
          </button>
        </div>

        {/* Message container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-24 py-8 space-y-6 overflow-x-hidden bg-gradient-to-b from-transparent to-slate-950/5">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            /* Starter welcome dashboard */
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center py-6 space-y-8">
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center mx-auto shadow-2xl bg-slate-900 p-2"
                >
                  <img
                    src={joxiqLogo}
                    alt="JOXIQ AI Logo"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mt-4 ${
                  theme === "dark" ? "text-white bg-gradient-to-r from-white via-indigo-200 to-slate-300" : "text-slate-900 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900"
                } bg-clip-text text-transparent`}>
                  How can I support you today?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                  Start a conversation below, choose a chat mode, upload a document or code file, or use real-time search grounding.
                </p>
              </div>

              {/* Chat Modes Quick Welcome Selector Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full max-w-2xl">
                <button
                  onClick={() => selectMode("general")}
                  className={`p-3.5 border rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                    selectedPersonaId === "general"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : (theme === "dark" ? "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
                  }`}
                >
                  <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-bold font-sans">JOXIQ AI</span>
                </button>

                <button
                  onClick={() => selectMode("socratic")}
                  className={`p-3.5 border rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                    selectedPersonaId === "socratic"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : (theme === "dark" ? "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
                  }`}
                >
                  <GraduationCap size={18} className="text-emerald-500 dark:text-emerald-400" />
                  <span className="text-xs font-bold font-sans">Study Mode</span>
                </button>

                <button
                  onClick={() => selectMode("coder")}
                  className={`p-3.5 border rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                    selectedPersonaId === "coder"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : (theme === "dark" ? "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
                  }`}
                >
                  <Code size={18} className="text-amber-500 dark:text-amber-400" />
                  <span className="text-xs font-bold font-sans">Coding Mode</span>
                </button>

                <button
                  onClick={() => selectMode("translator")}
                  className={`p-3.5 border rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 ${
                    selectedPersonaId === "translator"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : (theme === "dark" ? "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
                  }`}
                >
                  <Languages size={18} className="text-pink-500 dark:text-pink-400" />
                  <span className="text-xs font-bold font-sans">Translation</span>
                </button>
              </div>

              {/* Starter grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-2">
                {SUGGESTED_STARTERS.map((starter, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    onClick={() => handleSendMessage(starter.prompt)}
                    className={`p-4 border rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group text-left active:scale-[0.98] ${
                      theme === "dark"
                        ? "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300"
                        : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-700 shadow-slate-100"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm group-hover:text-indigo-500 transition-colors">
                        {starter.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {starter.subtitle}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Send size={14} className="text-indigo-500 dark:text-indigo-400" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Guide tips */}
              <div className={`flex items-center gap-2 border px-4 py-2.5 rounded-lg text-xs max-w-md text-center ${
                theme === "dark" ? "bg-indigo-500/5 border-indigo-500/10 text-slate-400" : "bg-indigo-50/50 border-indigo-100 text-slate-600"
              }`}>
                <Info size={14} className="text-indigo-500 shrink-0" />
                <span>
                  Tip: Upload code snippets, text files, or PDFs, and click the <b>Star</b> in the navbar to save your favorite sessions.
                </span>
              </div>
            </div>
          ) : (
            /* Active message timeline */
            <div className="max-w-4xl mx-auto space-y-8 pb-10">
              {activeConversation.messages.map((msg, mIdx) => {
                const isUser = msg.role === "user";
                const isLastMsg = mIdx === activeConversation.messages.length - 1;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-4 w-full ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-white/10 shadow-sm overflow-hidden mt-0.5">
                        <img
                          src={joxiqEmblem}
                          alt="JOXIQ AI Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 ${isUser ? "items-end max-w-[85%] md:max-w-[75%]" : "flex-1 min-w-0"}`}>
                      {isUser ? (
                        <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm text-sm md:text-base leading-relaxed">
                          {/* Inline attached images if present in message history */}
                          {msg.image && (
                            <div className="mb-3 max-w-sm rounded-lg overflow-hidden border border-white/20 shadow-sm bg-black/40">
                              <img
                                src={msg.image.data}
                                alt="User uploaded attachment"
                                className="max-h-56 w-auto object-contain mx-auto"
                              />
                            </div>
                          )}

                          {/* Inline attached documents info */}
                          {msg.document && (
                            <div className="mb-3 flex items-center gap-2.5 p-2 rounded-xl bg-black/20 border border-white/20 text-white max-w-md">
                              <FileText size={18} className="text-white shrink-0" />
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-semibold truncate">{msg.document.name}</div>
                                <div className="text-[10px] text-white/80 font-mono mt-0.5">Parsed Document - {msg.document.size}</div>
                              </div>
                            </div>
                          )}

                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        </div>
                      ) : (
                        <div className="text-slate-800 dark:text-slate-100 space-y-3 text-sm md:text-base leading-relaxed w-full">
                          {/* Inline attached images if present in message history */}
                          {msg.image && (
                            <div className="mb-3 max-w-sm rounded-lg overflow-hidden border border-white/10 shadow-sm bg-black/40">
                              <img
                                src={msg.image.data}
                                alt="User uploaded attachment"
                                className="max-h-56 w-auto object-contain mx-auto"
                              />
                            </div>
                          )}

                          {/* Inline attached documents info */}
                          {msg.document && (
                            <div className={`mb-3 flex items-center gap-2.5 p-2.5 border rounded-xl max-w-md ${
                              theme === "dark" ? "bg-black/20 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                            }`}>
                              <FileText size={18} className="text-indigo-500 shrink-0" />
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-xs font-semibold truncate">{msg.document.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Parsed Document - {msg.document.size}</div>
                              </div>
                            </div>
                          )}

                          {/* Rendering core content with clean markdown (no boxed card background) */}
                          <MarkdownMessage content={msg.content} />

                          {/* Grounding Citations Panel */}
                          {msg.grounding && msg.grounding.chunks && msg.grounding.chunks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                                <Globe size={13} />
                                <span>Grounding Search Sources:</span>
                              </div>
                              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                {msg.grounding.chunks.map((chunk, cidx) => {
                                  if (!chunk.web) return null;
                                  return (
                                    <a
                                      key={cidx}
                                      href={chunk.web.uri}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`flex items-start gap-2 p-2 border rounded-lg text-xs transition-colors group truncate ${
                                        theme === "dark" ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 text-slate-300" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                                      }`}
                                    >
                                      <div className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                                        {cidx + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate group-hover:text-indigo-500 transition-colors text-left">
                                          {chunk.web.title || "Web Source"}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate mt-0.5 text-left">
                                          {chunk.web.uri}
                                        </div>
                                      </div>
                                      <ExternalLink size={10} className="text-slate-500 group-hover:text-indigo-500 shrink-0 mt-0.5" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message metadata line and audio controls */}
                      <div
                        className={`flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 px-1 mt-1 ${
                          isUser ? "justify-end" : "justify-between w-full"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!isUser && (
                            <>
                              <span>&bull;</span>
                              <button
                                onClick={() => handleSpeakTts(msg)}
                                disabled={isGeneratingTts && activeSpeechMsgId !== msg.id}
                                className={`flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-pointer ${
                                  activeSpeechMsgId === msg.id ? "text-indigo-500 font-bold" : ""
                                }`}
                              >
                                {activeSpeechMsgId === msg.id ? (
                                  isGeneratingTts ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Synthesizing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <VolumeX className="w-3 h-3" />
                                      <span>Mute</span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3" />
                                    <span>Speak Aloud</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Modern ChatGPT-style Response Action Toolbar (Assistant Only) */}
                      {!isUser && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5">
                          {/* Like Button */}
                          <button
                            onClick={() => rateMessage(msg.id, msg.rating === "like" ? null : "like")}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                              msg.rating === "like"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-medium"
                                : "bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                            }`}
                            title="Like response"
                          >
                            <ThumbsUp size={13} className={msg.rating === "like" ? "fill-emerald-500" : ""} />
                            <span>Like</span>
                          </button>

                          {/* Dislike Button */}
                          <button
                            onClick={() => rateMessage(msg.id, msg.rating === "dislike" ? null : "dislike")}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                              msg.rating === "dislike"
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-500 font-medium"
                                : "bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                            }`}
                            title="Dislike response"
                          >
                            <ThumbsDown size={13} className={msg.rating === "dislike" ? "fill-rose-500" : ""} />
                            <span>Dislike</span>
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => copyMessageText(msg)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer"
                            title="Copy full response"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check size={13} className="text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Regenerate Button */}
                          {isLastMsg && (
                            <button
                              onClick={handleRegenerate}
                              disabled={isStreaming}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer ${
                                isStreaming ? "opacity-40 cursor-not-allowed" : ""
                              }`}
                              title="Regenerate response"
                            >
                              <RefreshCw size={13} className={isStreaming ? "animate-spin" : ""} />
                              <span>Regenerate</span>
                            </button>
                          )}

                          {/* Share Button */}
                          <button
                            onClick={() => shareMessage(msg)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 transition-all duration-200 cursor-pointer"
                            title="Share response"
                          >
                            <Share2 size={13} />
                            <span>Share</span>
                          </button>

                          {/* Save / Bookmark Button */}
                          <button
                            onClick={() => toggleSaveMessage(msg.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                              savedMessageIds.includes(msg.id)
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-medium"
                                : "bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                            }`}
                            title="Save to bookmarks"
                          >
                            <Bookmark size={13} className={savedMessageIds.includes(msg.id) ? "fill-amber-500" : ""} />
                            <span>{savedMessageIds.includes(msg.id) ? "Saved" : "Save"}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-all duration-200 cursor-pointer ml-auto"
                            title="Delete message"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming AI Bubble overlay */}
              {isStreaming && currentStreamText && (
                <div className="flex items-start gap-4 justify-start w-full">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-white/10 shadow-sm overflow-hidden mt-0.5">
                    <img
                      src={joxiqEmblem}
                      alt="JOXIQ AI Avatar"
                      className="w-full h-full object-cover animate-pulse"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="text-slate-800 dark:text-slate-100 space-y-3 text-sm md:text-base leading-relaxed w-full">
                      <MarkdownMessage content={currentStreamText} />

                      {/* Streaming search citation query bubble if active */}
                      {currentGrounding && currentGrounding.queries && currentGrounding.queries.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center gap-2 text-xs text-indigo-400 font-mono">
                          <Search size={12} className="animate-pulse" />
                          <span>Searching: "{currentGrounding.queries.join(", ")}"...</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                      <span>Generating response...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Glowing breathing loader if streaming started but text hasn't arrived */}
              {isStreaming && !currentStreamText && (
                <div className="flex items-start gap-4 justify-start w-full">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  </div>
                  <div className="flex items-center space-x-1.5 py-2">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Stream API error dialog info */}
              {streamError && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-3 relative group">
                  <Info size={18} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center justify-between">
                      <span>Stream Error</span>
                      <button
                        onClick={() => setStreamError(null)}
                        className="text-rose-400 hover:text-rose-200 transition-colors p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Dismiss error"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-rose-300/90">{streamError}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <button
                        onClick={() => handleSendMessage()}
                        className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                      >
                        Retry generation
                      </button>
                      <span className="text-rose-500/40 text-[10px]">•</span>
                      <button
                        onClick={() => setStreamError(null)}
                        className="text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invisible target anchor to focus scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar area */}
        <footer className={`p-4 md:p-8 pb-20 md:pb-8 flex flex-col items-center shrink-0 border-t ${
          theme === "dark" ? "border-white/5 bg-slate-950/20" : "border-slate-200/50 bg-white/40"
        }`}>
          <div className="w-full max-w-3xl relative">
            {/* Draggable/clickable visual representation container */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`backdrop-blur-3xl border rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 ring-1 ring-white/5 ${
                theme === "dark" ? "bg-white/10 border-white/20" : "bg-white border-slate-200/80"
              }`}
            >
              {/* Image attachment preview drawer */}
              {attachedImage && (
                <div className={`flex items-center gap-3 p-2 rounded-xl border max-w-sm ml-2 mt-1 ${
                  theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 relative group shrink-0">
                    <img
                      src={attachedImage.data}
                      alt="Attachment preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">Multimodal Image</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{attachedImage.mimeType}</div>
                  </div>
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="Remove attachment"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Document parsed attachment preview drawer */}
              {attachedDocument && (
                <div className={`flex items-center gap-3 p-2 rounded-xl border max-w-sm ml-2 mt-1 ${
                  theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/15">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-semibold truncate">{attachedDocument.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{attachedDocument.size} &bull; Parsed Text</div>
                  </div>
                  <button
                    onClick={() => setAttachedDocument(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="Remove document text"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Core bar */}
              <div className="flex items-end gap-2">
                {/* Integrated Attachment Options Menu button */}
                <div className="relative shrink-0 flex items-center">
                  {/* Backdrop click-away trigger */}
                  {plusMenuOpen && (
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setPlusMenuOpen(false)}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                    className={`p-3 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-500 cursor-pointer relative z-50 flex items-center justify-center ${
                      plusMenuOpen ? "bg-indigo-500/10 text-indigo-500 rotate-45" : ""
                    }`}
                    title="Add attachment or take photo"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5 transition-transform duration-250" />
                    )}
                  </button>

                  {/* Dropdown list popup container */}
                  <AnimatePresence>
                    {plusMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute bottom-14 left-0 w-60 rounded-2xl border p-2.5 shadow-2xl z-50 flex flex-col gap-1 backdrop-blur-3xl text-left ${
                          theme === "dark"
                            ? "bg-gray-950/95 border-white/10 text-slate-200"
                            : "bg-white/95 border-slate-250 text-slate-700 shadow-slate-200"
                        }`}
                      >
                        <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-500/10 mb-1">
                          Attachments
                        </div>

                        {/* Live Camera Webcam option */}
                        <button
                          type="button"
                          onClick={() => {
                            setCameraModalOpen(true);
                            setPlusMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                            theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Live Webcam</div>
                            <div className="text-[10px] text-slate-500">Capture photo with webcam</div>
                          </div>
                        </button>

                        {/* Mobile Camera option */}
                        <button
                          type="button"
                          onClick={() => {
                            mobileCameraInputRef.current?.click();
                            setPlusMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                            theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Phone Camera</div>
                            <div className="text-[10px] text-slate-500">Capture photo directly using your phone</div>
                          </div>
                        </button>

                        {/* Gallery option */}
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setPlusMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                            theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Gallery Upload</div>
                            <div className="text-[10px] text-slate-500">Choose an image from your gallery</div>
                          </div>
                        </button>

                        {/* Document option */}
                        <button
                          type="button"
                          onClick={() => {
                            docInputRef.current?.click();
                            setPlusMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                            theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-100"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">Upload Document</div>
                            <div className="text-[10px] text-slate-500">Upload PDF, text, code or other files</div>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hidden File inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={docInputRef}
                  onChange={handleDocSelect}
                  accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.py,.html,.css,.pdf"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={mobileCameraInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Voice microphone speech input button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all cursor-pointer relative shrink-0 ${
                    isListening
                      ? "bg-rose-500/10 text-rose-500 ring-2 ring-rose-500/20 animate-pulse"
                      : "text-slate-400 hover:text-indigo-500 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                  title={isListening ? "Stop listening to speech" : "Speak instead of typing"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Multiline textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening closely... Speak now..." : "Ask JOXIQ AI anything..."}
                  rows={1}
                  className={`flex-1 px-2 py-3 text-sm min-h-[44px] bg-transparent resize-none focus:outline-none max-h-[200px] ${
                    theme === "dark" ? "text-slate-100 placeholder-slate-400" : "text-slate-900 placeholder-slate-500"
                  }`}
                />

                {/* Submit trigger button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isStreaming || (!inputText.trim() && !attachedImage && !attachedDocument)}
                  className={`p-3 rounded-xl transition-all shadow-lg text-white mb-1 shrink-0 cursor-pointer ${
                    isStreaming || (!inputText.trim() && !attachedImage && !attachedDocument)
                      ? "bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:scale-105 active:scale-95"
                  }`}
                >
                  {isStreaming ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Platform powered notice */}
            <div className="mt-3 text-center text-[10px] uppercase tracking-wider text-slate-600 font-bold flex items-center justify-center gap-1 select-none">
              <span>Powered by JOXIQ AI Engine</span>
              <span>&bull;</span>
              <span>Professional Edition</span>
            </div>
          </div>
        </footer>
          </>
        )}

        {/* Mobile Bottom Navigation Bar (ChatGPT style mobile navigation) */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t flex items-center justify-around px-4 shadow-2xl ${
          theme === "dark" ? "bg-[#0b1329]/95 border-white/10 text-slate-200" : "bg-white/95 border-slate-200 text-slate-800"
        } backdrop-blur-lg`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-500 cursor-pointer p-1"
            title="Open Sidebar Menu"
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>

          <button
            onClick={() => {
              const emptyChat = conversations.find(c => c.messages.length === 0);
              if (emptyChat) {
                setActiveId(emptyChat.id);
                setActiveView("chat");
              } else {
                createNewChat();
              }
            }}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-500 cursor-pointer p-1"
            title="Return to Home Dashboard"
          >
            <Compass size={20} className="text-indigo-500" />
            <span>Home</span>
          </button>

          <button
            onClick={() => createNewChat()}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-500 cursor-pointer p-1"
            title="Start New Chat"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Plus size={18} />
            </div>
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-500 cursor-pointer p-1"
            title="Open Settings"
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </main>

      {/* Share conversation modal popup */}
      <AnimatePresence>
        {shareModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg border rounded-2xl p-6 shadow-2xl z-50 backdrop-blur-3xl ${
                theme === "dark" ? "bg-gray-900 border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
                theme === "dark" ? "border-gray-800" : "border-gray-100"
              }`}>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-base">Share Conversation</h3>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                  Share a simulated public link or copy the complete plain-text markdown transcript to your clipboard.
                </p>

                {/* Public Link Copy section */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Public Shareable Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/share/${activeId}`}
                      className={`flex-1 p-2.5 text-xs font-mono border rounded-xl focus:outline-none ${
                        theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Transcript Copy section */}
                <div className="space-y-1.5 pt-2 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Text Transcript</label>
                  <div className={`border rounded-xl p-3 max-h-36 overflow-y-auto text-xs font-mono whitespace-pre-wrap text-left ${
                    theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}>
                    {getChatTranscript() || "No messages to export yet."}
                  </div>
                  <button
                    onClick={copyTranscript}
                    disabled={!activeConversation || activeConversation.messages.length === 0}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {copiedTranscript ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedTranscript ? "Transcript copied!" : "Copy complete plain-text transcript"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Live Camera Capture Modal */}
        {cameraModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCameraModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg border rounded-2xl p-6 shadow-2xl z-50 backdrop-blur-3xl ${
                theme === "dark" ? "bg-gray-900 border-gray-800 text-gray-100" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
                theme === "dark" ? "border-gray-800" : "border-gray-100"
              }`}>
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-base">Live Camera Capture</h3>
                </div>
                <button
                  onClick={() => setCameraModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Live stream preview block */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-white/10 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!streamRef.current && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      <span>Connecting to camera stream...</span>
                    </div>
                  )}
                </div>

                {/* Device Selector */}
                {cameraDevices.length > 1 && (
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Select Device</label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className={`p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                    >
                      {cameraDevices.map((device, idx) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error status notice */}
                {cameraError && (
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs text-left">
                    {cameraError}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCameraModalOpen(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-250 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    disabled={!streamRef.current}
                    className={`px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <Camera size={14} />
                    <span>Take Photo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {showAuthModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md border rounded-2xl p-6 shadow-2xl z-50 backdrop-blur-3xl ${
                theme === "dark" ? "bg-gray-900/95 border-gray-800 text-gray-100" : "bg-white/95 border-gray-200 text-gray-900"
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
                theme === "dark" ? "border-gray-800" : "border-gray-100"
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-base leading-tight">Secure Authentication</h3>
                    <p className="text-[10px] text-slate-500 font-medium">JOXIQ AI Platform Access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Toggle Mode Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-500/5 mb-6 border border-slate-500/5 text-xs font-semibold">
                <button
                  onClick={() => { setAuthMode("signup"); setAuthError(null); setForgotMsg(null); }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === "signup" ? "bg-indigo-600 text-white shadow-sm font-bold" : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setAuthMode("login"); setAuthError(null); setForgotMsg(null); }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === "login" ? "bg-indigo-600 text-white shadow-sm font-bold" : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setAuthMode("forgot"); setAuthError(null); setForgotMsg(null); }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === "forgot" ? "bg-indigo-600 text-white shadow-sm font-bold" : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  Recovery
                </button>
              </div>

              {/* Error Notice */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left">
                  {authError}
                </div>
              )}

              {forgotMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-left">
                  {forgotMsg}
                </div>
              )}

              {/* Form Content */}
              {authMode === "forgot" ? (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mnain7674@gmail.com"
                      value={forgotEmailInput}
                      onChange={(e) => setForgotEmailInput(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                        theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-500/10">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Back to Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!forgotEmailInput.trim()) {
                          setAuthError("Please enter your registered email address.");
                          return;
                        }
                        const users = JSON.parse(localStorage.getItem("joxiq_registered_users") || "[]");
                        if (forgotEmailInput.trim().toLowerCase() === "mnain7674@gmail.com") {
                          setForgotMsg("Owner Admin password recovery security verification link dispatched to master admin email.");
                          return;
                        }
                        const found = users.find((u: any) => u.email.toLowerCase() === forgotEmailInput.trim().toLowerCase());
                        if (!found) {
                          setAuthError("No registered account found with this email address.");
                        } else {
                          setForgotMsg(`Password recovery instructions sent to ${forgotEmailInput}. (Saved password: ${found.password})`);
                        }
                      }}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setAuthError(null);
                    setForgotMsg(null);

                    if (authMode === "signup") {
                      const name = authNameInput.trim();
                      const email = authEmailInput.trim();
                      const password = authPasswordInput;
                      const confirmPassword = authConfirmPasswordInput;

                      if (!name || !email || !password) {
                        setAuthError("All fields are required.");
                        return;
                      }
                      if (password !== confirmPassword) {
                        setAuthError("Passwords do not match.");
                        return;
                      }

                      const users = JSON.parse(localStorage.getItem("joxiq_registered_users") || "[]");
                      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
                        setAuthError("An account with this email already exists. Please log in.");
                        return;
                      }

                      const newUser = { name, email, password };
                      users.push(newUser);
                      localStorage.setItem("joxiq_registered_users", JSON.stringify(users));

                      const profile = { name, email };
                      setUserProfile(profile);
                      localStorage.setItem("julkar_user_profile", JSON.stringify(profile));
                      setShowAuthModal(false);
                    } else {
                      // Log In
                      const email = authEmailInput.trim();
                      const password = authPasswordInput;

                      if (!email || !password) {
                        setAuthError("Email and password are required.");
                        return;
                      }

                      // Check if owner admin - verify via backend API securely
                      if (email.toLowerCase() === "mnain7674@gmail.com") {
                        fetch("/api/auth/admin-login", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email, password })
                        })
                          .then(async (res) => {
                            const data = await res.json();
                            if (res.ok && data.success) {
                              setUserProfile(data.profile);
                              localStorage.setItem("julkar_user_profile", JSON.stringify(data.profile));
                              setShowAuthModal(false);
                            } else {
                              setAuthError(data.error || "Invalid admin credentials.");
                            }
                          })
                          .catch((err) => {
                            console.error("Admin login network error:", err);
                            setAuthError("Failed to connect to backend verification server.");
                          });
                        return;
                      }

                      const users = JSON.parse(localStorage.getItem("joxiq_registered_users") || "[]");
                      const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

                      if (!found) {
                        setAuthError("Invalid email or password. Please verify your credentials or sign up.");
                        return;
                      }

                      const profile = { name: found.name, email: found.email };
                      setUserProfile(profile);
                      localStorage.setItem("julkar_user_profile", JSON.stringify(profile));
                      setShowAuthModal(false);
                    }
                  }}
                  className="space-y-4 text-left"
                >
                  {authMode === "signup" && (
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={authNameInput}
                        onChange={(e) => setAuthNameInput(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                          theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                        }`}
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={authEmailInput}
                      onChange={(e) => setAuthEmailInput(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                        theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPasswordInput}
                      onChange={(e) => setAuthPasswordInput(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                        theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                    />
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authConfirmPasswordInput}
                        onChange={(e) => setAuthConfirmPasswordInput(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                          theme === "dark" ? "bg-gray-950 border-gray-800 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                        }`}
                      />
                    </div>
                  )}

                  {authMode === "login" && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Forgot your credentials?</span>
                      <button
                        type="button"
                        onClick={() => { setAuthMode("forgot"); setAuthError(null); }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                      >
                        Reset Password
                      </button>
                    </div>
                  )}

                  {/* Submitting Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-500/10">
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        theme === "dark" ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {authMode === "signup" ? <UserPlus size={14} /> : <LogIn size={14} />}
                      <span>{authMode === "signup" ? "Create Account" : "Sign In"}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings configuration sidebar drawer */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={setSelectedPersonaId}
        customInstruction={customInstruction}
        onCustomInstructionChange={setCustomInstruction}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        useSearch={useSearch}
        onUseSearchChange={setUseSearch}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        userProfile={userProfile}
        selectedModel={activeConversation ? activeConversation.model : "gemini-2.5-flash"}
        onSelectModel={(model) => {
          if (activeConversation) {
            setConversations((prev) =>
              prev.map((c) => (c.id === activeConversation.id ? { ...c, model } : c))
            );
          }
        }}
        onReset={() => {
          setSelectedPersonaId("general");
          setCustomInstruction("");
          setTemperature(0.7);
          setUseSearch(false);
          setSelectedVoice("Kore");
        }}
      />

      {/* Pro Subscription & Monetization Modal */}
      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onUpgradeSuccess={() => {
          setIsProUser(true);
          localStorage.setItem("julkar_is_pro", "true");
        }}
        isDark={theme === "dark"}
        freeMessagesLeft={freeMessagesLeft}
        isProUser={isProUser}
      />
    </div>
  );
}
