import React from "react";

interface JoxiqLogoProps {
  className?: string;
  alt?: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function JoxiqLogo({
  className = "w-8 h-8",
  fallbackText
}: JoxiqLogoProps) {
  if (fallbackText && fallbackText !== "JOXIQ" && fallbackText.length <= 2) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white font-black text-xs rounded-xl shadow-md select-none shrink-0 ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white rounded-xl shadow-md shadow-indigo-500/20 select-none shrink-0 overflow-hidden group ${className}`}>
      {/* Background ambient gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
      
      {/* Pure Modern Vector AI Sparkle Symbol */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3/5 h-3/5 text-white drop-shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-110"
      >
        <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" fill="currentColor" fillOpacity="0.25" />
        <circle cx="12" cy="11" r="2" fill="currentColor" />
        <path d="M5 3v3M3 5h3M19 17v3M17 19h3" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
