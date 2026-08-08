import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Search, Trash2, Star, Clock, ArrowRight, X, Sparkles, FileText, Image, Download, CheckCircle2, Edit2, Check } from "lucide-react";
import { Conversation, SavedPdfDoc } from "../types";
import { generateConversationPdf } from "../lib/pdfExporter";

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e?: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onClearAll: () => void;
  theme: "light" | "dark";
  onSavePdfToChat?: (chatId: string, pdfDoc: SavedPdfDoc) => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
}

export function ChatHistoryModal({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onDeleteConversation,
  onToggleFavorite,
  onClearAll,
  theme,
  onSavePdfToChat,
  onRenameConversation,
}: ChatHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "favorites" | "pdfs" | "images">("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [downloadedPdfChatId, setDownloadedPdfChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((c) => {
    const hasImages = c.messages.some((m) => !!m.image);
    const hasPdfs = (c.savedPdfs && c.savedPdfs.length > 0) || c.messages.some((m) => !!m.pdfExport);

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === "favorites") {
      return matchesSearch && c.isFavorite;
    }
    if (filterType === "pdfs") {
      return matchesSearch && (hasPdfs || c.messages.length > 0);
    }
    if (filterType === "images") {
      return matchesSearch && hasImages;
    }
    return matchesSearch;
  });

  // ChatGPT-style Date Grouping Helper
  const groupConversationsByDate = (convs: Conversation[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = todayStart - 6 * 86400000;
    const thirtyDaysStart = todayStart - 29 * 86400000;

    const groups: { label: string; items: Conversation[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Previous 7 Days", items: [] },
      { label: "Previous 30 Days", items: [] },
      { label: "Older", items: [] },
    ];

    convs.forEach((c) => {
      const time = c.timestamp || Date.now();
      if (time >= todayStart) {
        groups[0].items.push(c);
      } else if (time >= yesterdayStart) {
        groups[1].items.push(c);
      } else if (time >= sevenDaysStart) {
        groups[2].items.push(c);
      } else if (time >= thirtyDaysStart) {
        groups[3].items.push(c);
      } else {
        groups[4].items.push(c);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);

  const startRenaming = (chat: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveRenaming = (chatId: string, e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim() && onRenameConversation) {
      onRenameConversation(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleExportPdfClick = (chat: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { savedDoc } = generateConversationPdf(chat);
      setDownloadedPdfChatId(chat.id);
      if (onSavePdfToChat) {
        onSavePdfToChat(chat.id, savedDoc);
      }
      setTimeout(() => setDownloadedPdfChatId(null), 3000);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
            theme === "dark"
              ? "bg-slate-900 border-white/10 text-slate-100"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          {/* Header */}
          <div className={`p-5 border-b flex items-center justify-between ${
            theme === "dark" ? "border-white/10 bg-slate-950/50" : "border-slate-100 bg-slate-50/50"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Complete AI Chat History</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">
                    {conversations.length} {conversations.length === 1 ? "Session" : "Sessions"}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Browse, search, manage, and resume all your past conversations with JOXIQ AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                theme === "dark" ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls / Search & Filters */}
          <div className={`p-4 border-b flex flex-col gap-3 ${
            theme === "dark" ? "border-white/10 bg-slate-900/50" : "border-slate-100 bg-white"
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chat history, keywords, attached images, or PDFs..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                    theme === "dark"
                      ? "bg-slate-950 border-white/10 text-slate-200 placeholder-slate-500 focus:border-indigo-500"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                  }`}
                />
              </div>

              {conversations.length > 0 && (
                showClearConfirm ? (
                  <div className="flex items-center gap-1.5 animate-fadeIn">
                    <span className="text-[11px] text-rose-500 font-bold whitespace-nowrap">Clear all?</span>
                    <button
                      onClick={() => {
                        onClearAll();
                        setShowClearConfirm(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        theme === "dark" ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    title="Clear all history"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10"
                }`}
              >
                All Chats ({conversations.length})
              </button>
              <button
                onClick={() => setFilterType("favorites")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === "favorites"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10"
                }`}
              >
                <Star size={13} className={filterType === "favorites" ? "fill-white" : ""} />
                <span>Starred</span>
              </button>
              <button
                onClick={() => setFilterType("pdfs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === "pdfs"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10"
                }`}
              >
                <FileText size={13} />
                <span>📄 PDF Export</span>
              </button>
              <button
                onClick={() => setFilterType("images")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === "images"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10"
                }`}
              >
                <Image size={13} />
                <span>📷 Photos & Attachments</span>
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
            {groupedConversations.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No matching conversations found" : "No chat history found"}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search query or filter selection."
                    : "Start chatting or attach images/PDFs to see your history logged here."}
                </p>
              </div>
            ) : (
              groupedConversations.map((group) => (
                <div key={group.label} className="space-y-2">
                  {/* Date Header */}
                  <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <span>{group.label}</span>
                    <span className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>

                  {group.items.map((chat) => {
                    const isSelected = chat.id === activeId;
                    const isEditing = editingChatId === chat.id;
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    const dateStr = new Date(chat.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const firstImageMsg = chat.messages.find((m) => !!m.image);
                    const hasPdfs = (chat.savedPdfs && chat.savedPdfs.length > 0) || chat.messages.some((m) => !!m.pdfExport);

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          if (!isEditing) {
                            onSelectConversation(chat.id);
                            onClose();
                          }
                        }}
                        className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isSelected
                            ? theme === "dark"
                              ? "bg-indigo-600/15 border-indigo-500/50 shadow-md"
                              : "bg-indigo-50/80 border-indigo-300 shadow-sm"
                            : theme === "dark"
                            ? "bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                            : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isEditing ? (
                                <form
                                  onSubmit={(e) => saveRenaming(chat.id, e)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 flex-1"
                                >
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    autoFocus
                                    className={`text-xs sm:text-sm font-bold px-2 py-1 rounded border outline-none w-full ${
                                      theme === "dark"
                                        ? "bg-slate-900 border-indigo-500 text-white"
                                        : "bg-white border-indigo-500 text-slate-900"
                                    }`}
                                  />
                                  <button
                                    type="submit"
                                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                    title="Save title"
                                  >
                                    <Check size={14} />
                                  </button>
                                </form>
                              ) : (
                                <h4 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-[300px]">
                                  {chat.title || "Untitled Conversation"}
                                </h4>
                              )}

                              {isSelected && !isEditing && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-indigo-500 text-white shrink-0">
                                  Active
                                </span>
                              )}
                              {hasPdfs && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                  <FileText size={11} />
                                  <span>PDF</span>
                                </span>
                              )}
                              {firstImageMsg && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                  <Image size={11} />
                                  <span>Photo</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {lastMsg ? lastMsg.content : "No messages yet"}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {dateStr}
                              </span>
                              <span>•</span>
                              <span>{chat.messages.length} msgs</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center gap-1 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-white/5">
                          {/* Rename Button */}
                          <button
                            onClick={(e) => startRenaming(chat, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "text-slate-400 hover:text-indigo-400 hover:bg-white/5"
                                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            }`}
                            title="Rename chat"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* PDF Export Button */}
                          <button
                            onClick={(e) => handleExportPdfClick(chat, e)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              downloadedPdfChatId === chat.id
                                ? "bg-emerald-600 text-white"
                                : theme === "dark"
                                ? "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200"
                            }`}
                            title="Download/Save Chat as PDF Document"
                          >
                            {downloadedPdfChatId === chat.id ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <Download size={13} />
                            )}
                          </button>

                          <button
                            onClick={(e) => onToggleFavorite(chat.id, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              chat.isFavorite
                                ? "text-amber-500 bg-amber-500/10"
                                : theme === "dark"
                                ? "text-slate-400 hover:text-amber-400 hover:bg-white/5"
                                : "text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                            }`}
                            title={chat.isFavorite ? "Unstar chat" : "Star chat"}
                          >
                            <Star size={14} className={chat.isFavorite ? "fill-amber-500" : ""} />
                          </button>

                          <button
                            onClick={(e) => onDeleteConversation(chat.id, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                            title="Delete conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t flex items-center justify-between text-xs text-slate-500 ${
            theme === "dark" ? "border-white/10 bg-slate-950/50" : "border-slate-100 bg-slate-50/50"
          }`}>
            <span>Tip: Click any chat to instantly resume or review it.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
