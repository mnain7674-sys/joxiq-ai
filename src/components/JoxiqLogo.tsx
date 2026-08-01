import React from "react";
import { Sparkles, Bot } from "lucide-react";

interface JoxiqLogoProps {
  className?: string;
  alt?: string;
  fallbackText?: string;
}

export function JoxiqLogo({
  className = "w-full h-full object-contain rounded-full",
  fallbackText
}: JoxiqLogoProps) {
  if (fallbackText && fallbackText !== "JOXIQ" && fallbackText.length <= 2) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white font-black text-xs rounded-full shadow-sm select-none ${className}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white rounded-full shadow-inner select-none ${className}`}>
      <Sparkles className="w-1/2 h-1/2 text-white animate-pulse" />
    </div>
  );
}


