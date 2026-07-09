import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Search, Trash2, Star, Clock, ArrowRight, X, Sparkles, Calendar, Bookmark } from "lucide-react";
import { Conversation } from "../types";

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
}: ChatHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "favorites">("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterType === "favorites") {
      return matchesSearch && c.isFavorite;
    }
    return matchesSearch;
  });

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
          <div className={`p-4 border-b flex flex-col sm:flex-row items-center gap-3 ${
            theme === "dark" ? "border-white/10 bg-slate-900/50" : "border-slate-100 bg-white"
          }`}>
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chat history, keywords, or topics..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  theme === "dark"
                    ? "bg-slate-950 border-white/10 text-slate-200 placeholder-slate-500 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === "all"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All Chats ({conversations.length})
                </button>
                <button
                  onClick={() => setFilterType("favorites")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterType === "favorites"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Star size={13} className={filterType === "favorites" ? "fill-white" : ""} />
                  <span>Starred</span>
                </button>
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
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1"
                    title="Clear all history"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No matching conversations found" : "No chat history yet"}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms or filters."
                    : "Start a new conversation with JOXIQ AI to see your history logged here."}
                </p>
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isSelected = chat.id === activeId;
                const lastMsg = chat.messages[chat.messages.length - 1];
                const dateStr = new Date(chat.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectConversation(chat.id);
                      onClose();
                    }}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? theme === "dark"
                          ? "bg-indigo-600/15 border-indigo-500/50 shadow-md"
                          : "bg-indigo-50/80 border-indigo-300 shadow-sm"
                        : theme === "dark"
                        ? "bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : theme === "dark"
                          ? "bg-white/5 text-indigo-400 border border-white/10"
                          : "bg-slate-100 text-indigo-600 border border-slate-200"
                      }`}>
                        <MessageSquare size={16} />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold truncate">
                            {chat.title || "Untitled Conversation"}
                          </h4>
                          {isSelected && (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-indigo-500 text-white shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {lastMsg ? lastMsg.content : "No messages yet"}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span>{chat.messages.length} messages</span>
                          <span>•</span>
                          <span className="capitalize">{chat.model.replace("gemini-", "")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => onToggleFavorite(chat.id, e)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          chat.isFavorite
                            ? "text-amber-500 bg-amber-500/10"
                            : theme === "dark"
                            ? "text-slate-400 hover:text-amber-400 hover:bg-white/5"
                            : "text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                        }`}
                        title={chat.isFavorite ? "Unstar chat" : "Star chat"}
                      >
                        <Star size={15} className={chat.isFavorite ? "fill-amber-500" : ""} />
                      </button>
                      <button
                        onClick={(e) => onDeleteConversation(chat.id, e)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          theme === "dark"
                            ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                        title="Delete conversation"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className={`p-2 rounded-lg ${
                        theme === "dark" ? "text-slate-400 bg-white/5" : "text-slate-600 bg-slate-100"
                      }`}>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })
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
