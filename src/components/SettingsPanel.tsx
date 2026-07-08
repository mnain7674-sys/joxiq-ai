import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sliders, Globe, MessageSquareCode, Volume2, Sparkles, HelpCircle, RotateCcw } from "lucide-react";
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
  useSearch: boolean;
  onUseSearchChange: (val: boolean) => void;
  selectedVoice: string;
  onSelectVoice: (val: string) => void;
  selectedModel: string;
  onSelectModel: (val: string) => void;
  onReset: () => void;
}

const PREBUILT_VOICES = [
  { id: "Kore", label: "Kore (Cheerfully Warm)" },
  { id: "Zephyr", label: "Zephyr (Crisp & Professional)" },
  { id: "Puck", label: "Puck (Energetic & Bright)" },
  { id: "Charon", label: "Charon (Deep & Grounded)" },
  { id: "Fenrir", label: "Fenrir (Smooth & Calming)" },
];

export function SettingsPanel({
  isOpen,
  onClose,
  selectedPersonaId,
  onSelectPersona,
  customInstruction,
  onCustomInstructionChange,
  temperature,
  onTemperatureChange,
  useSearch,
  onUseSearchChange,
  selectedVoice,
  onSelectVoice,
  selectedModel,
  onSelectModel,
  onReset,
}: SettingsPanelProps) {
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
                <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50">Chat settings & Models</h2>
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
              {/* AI Model Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span>Choose AI Model</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
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
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-semibold px-1.5 py-0.5 rounded">Free</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                        Blazing fast, ideal for everyday chats, coding & quick questions.
                      </p>
                    </div>
                  </div>

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
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 font-semibold px-1.5 py-0.5 rounded">Pro ⭐</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                        Advanced reasoning, deep logic & complex multi-step problem solving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Search Grounding Toggle */}
              <div className="space-y-3 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2.5">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-950 dark:text-gray-50">Google Search Grounding</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Incorporate real-time, verified Google Search results into responses. Perfect for current events, travel planning, and facts.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useSearch}
                      onChange={(e) => onUseSearchChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Temperature Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Creativity (Temperature)</span>
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
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Precise & Factual (0.0)</span>
                  <span>Creative & Imaginative (1.5)</span>
                </div>
              </div>

              {/* System Personas */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-yellow-500" />
                  <span>Assistant Persona</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
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
                  <button
                    onClick={() => onSelectPersona("custom")}
                    className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-[100px] ${
                      selectedPersonaId === "custom"
                        ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-850"
                    }`}
                  >
                    <div className="font-semibold text-xs text-gray-950 dark:text-gray-50 flex items-center justify-between w-full">
                      <span>Custom Prompter</span>
                      {selectedPersonaId === "custom" && (
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-normal mt-1">
                      Define your own custom rules, role, and guidelines for the AI.
                    </p>
                  </button>
                </div>
              </div>

              {/* Custom System Instruction Box */}
              {selectedPersonaId === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Custom Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={customInstruction}
                    onChange={(e) => onCustomInstructionChange(e.target.value)}
                    placeholder="e.g., 'You are a culinary expert. Respond using culinary terms and suggest wine pairings for all recipes...'"
                    className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-800 dark:text-gray-100 placeholder-gray-400"
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
