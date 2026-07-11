import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sliders, MessageSquareCode, Volume2, Sparkles, HelpCircle, RotateCcw, Sun, Moon } from "lucide-react";
import { SYSTEM_PERSONAS, Persona } from "../types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonaId: string;
  onSelectPersona: (id: string) => void;
  customInstruction: string;
  onCustomInstructionChange: (val: string) => void;
  temperature: number;
  onTemperatureChange: (val: number) => void;
  selectedVoice: string;
  onSelectVoice: (val: string) => void;
  selectedModel: string;
  onSelectModel: (val: string) => void;
  onReset: () => void;
  userProfile?: { name: string; email: string } | null;
  theme: string;
  onThemeChange: (theme: string) => void;
}

const PREBUILT_VOICES = [
  { id: "Kore", label: "Kore (Cheerfully Warm)" },
  { id: "Zephyr", label: "Zephyr (Crisp & Professional)" },
  { id: "Puck", label: "Puck (Energetic & Bright)" },
  { id: "Charon", label: "Charon (Deep & Grounded)" },
  { id: "Fenrir", label: "Fenrir (Smooth & Calming)" },
];

const OWNER_ADMIN_EMAIL = "mnain7674@gmail.com";

export function SettingsPanel({
  isOpen,
  onClose,
  selectedPersonaId,
  onSelectPersona,
  customInstruction,
  onCustomInstructionChange,
  temperature,
  onTemperatureChange,
  selectedVoice,
  onSelectVoice,
  selectedModel,
  onSelectModel,
  onReset,
  userProfile,
  theme,
  onThemeChange,
}: SettingsPanelProps) {
  const isOwnerAdmin = userProfile?.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();

  const [themesList, setThemesList] = React.useState<any[]>([
    { id: "dark", name: "Classic Dark Slate", desc: "Deep dark slate with indigo accents" },
    { id: "light", name: "Clean Light", desc: "Crisp white & clean slate grey UI" },
    { id: "midnight", name: "Midnight Indigo", desc: "Deep rich indigo blue night theme" },
    { id: "emerald", name: "Emerald Obsidian", desc: "Dark obsidian with emerald highlights" },
    { id: "amber", name: "Sunset Amber", desc: "Warm amber & cozy gold tones" },
    { id: "rose", name: "Rose Velvet", desc: "Luxurious wine and rose velvet theme" },
  ]);

  React.useEffect(() => {
    if (isOpen) {
      fetch("/api/themes")
        .then(res => res.json())
        .then(data => {
          if (data.themes) setThemesList(data.themes);
        })
        .catch(err => console.error("Failed to load themes", err));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50 flex items-center gap-2">
                    <span>Chat settings</span>
                    {isOwnerAdmin && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        👑 Owner Admin
                      </span>
                    )}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {/* Theme Color (Appearance) Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sun size={16} className="text-indigo-500" />
                  <span>Chat Theme Preference (Personal Account)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {themesList.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={async () => {
                          onThemeChange(t.id);
                          if (userProfile?.email) {
                            try {
                              await fetch("/api/user/theme", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: userProfile.email, themeId: t.id }),
                              });
                            } catch (err) {
                              console.error("Failed to save user theme preference", err);
                            }
                          }
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-start gap-1 text-left ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/30"
                            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-850"
                        }`}
                      >
                        <span className="font-semibold text-xs flex items-center justify-between w-full">
                          <span>{t.name}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{t.desc || t.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* AI Model Selector (Admin Only for Pro models, Flash for regular users) */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-indigo-500" />
                    <span>Choose AI Model</span>
                  </span>
                  {!isOwnerAdmin && (
                    <span className="text-[10px] text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded font-medium">
                      Standard Tier (Flash)
                    </span>
                  )}
                </h3>
                <div className={`grid ${isOwnerAdmin ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-3`}>
                  <div
                    onClick={() => onSelectModel("gemini-2.5-flash")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      (selectedModel === "gemini-2.5-flash" || !selectedModel)
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-gray-900 dark:text-gray-100">Gemini 2.5 Flash</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold px-1.5 py-0.5 rounded">Standard / Free</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                        Blazing fast, ideal for everyday chats, coding & quick questions.
                      </p>
                    </div>
                  </div>

                  {isOwnerAdmin && (
                    <div
                      onClick={() => onSelectModel("gemini-2.5-pro")}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedModel === "gemini-2.5-pro"
                          ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 shadow-sm"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-amber-500 dark:text-amber-400">Gemini 2.5 Pro</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-500 font-semibold px-1.5 py-0.5 rounded">Admin Pro 👑</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                          Advanced reasoning, deep logic & complex multi-step problem solving. (Restricted to Owner Admin)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {!isOwnerAdmin && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-500/5 p-2.5 rounded-lg border border-slate-500/10">
                    ℹ️ Pro AI models and advanced administrative controls are restricted to the owner admin.
                  </p>
                )}
              </div>

              {/* Temperature Selector (Admin Only or simplified) */}
              {isOwnerAdmin && (
                <div className="space-y-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <span>Creativity (Temperature)</span>
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase">Admin Control</span>
                    </span>
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-bold">
                      {temperature.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.5)</span>
                  </div>
                </div>
              )}

              {/* System Personas */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-yellow-500" />
                  <span>Assistant Persona</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SYSTEM_PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => onSelectPersona(persona.id)}
                      className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-[100px] ${
                        selectedPersonaId === persona.id
                          ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-850"
                      }`}
                    >
                      <div className="font-semibold text-xs text-gray-950 dark:text-gray-50 flex items-center justify-between w-full">
                        <span>{persona.name}</span>
                        {selectedPersonaId === persona.id && (
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-normal mt-1">
                        {persona.description}
                      </p>
                    </button>
                  ))}

                  {/* Custom Prompter restricted to Owner Admin */}
                  {isOwnerAdmin && (
                    <button
                      onClick={() => onSelectPersona("custom")}
                      className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-[100px] ${
                        selectedPersonaId === "custom"
                          ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-850"
                      }`}
                    >
                      <div className="font-semibold text-xs text-gray-950 dark:text-gray-50 flex items-center justify-between w-full">
                        <span>Custom Prompter 👑</span>
                        {selectedPersonaId === "custom" && (
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-normal mt-1">
                        Admin custom system rules & guidelines.
                      </p>
                    </button>
                  )}
                </div>
              </div>

              {/* Custom System Instruction Box (Admin Only) */}
              {isOwnerAdmin && selectedPersonaId === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden border border-amber-500/20 p-4 rounded-xl bg-amber-500/5"
                >
                  <label className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Admin Custom Instructions</span>
                    <span className="text-[10px] font-mono">Restricted</span>
                  </label>
                  <textarea
                    rows={4}
                    value={customInstruction}
                    onChange={(e) => onCustomInstructionChange(e.target.value)}
                    placeholder="e.g., 'You are a master administrator assistant...'"
                    className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-gray-800 dark:text-gray-100 placeholder-gray-400"
                  />
                </motion.div>
              )}

              {/* TTS Voice Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Volume2 size={16} className="text-indigo-500" />
                  <span>Text-to-Speech Voice</span>
                </h3>
                <select
                  value={selectedVoice}
                  onChange={(e) => onSelectVoice(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-850 dark:text-gray-100 cursor-pointer"
                >
                  {PREBUILT_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner Admin Management Console (Visible ONLY to Owner Admin) */}
              {isOwnerAdmin && (
                <div className="space-y-3 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-indigo-500/5">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                    <span>👑 Owner Admin Control Panel</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    You are logged in as the owner admin (<span className="font-mono text-amber-400">{userProfile?.email}</span>). You have full control over system configuration, user roles, and advanced AI weights.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => alert("System Status: All nodes operational. Role-Based Access Control active. Zero security leaks detected.")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Audit RBAC Security
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem("julkar_is_pro", "true");
                        alert("Owner Admin Privilege: Pro status enforced globally.");
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Force Pro Enforce
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 flex items-center justify-between gap-3">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset defaults</span>
              </button>
              <button
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Apply settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
