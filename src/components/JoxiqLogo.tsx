import React, { useState, useEffect } from "react";

interface JoxiqLogoProps {
  className?: string;
  alt?: string;
  fallbackText?: string;
  theme?: string;
}

export function JoxiqLogo({
  className = "w-11 h-11",
  alt = "JOXIQ AI Logo",
  fallbackText,
  theme
}: JoxiqLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (theme === "light") return false;
    if (theme && theme !== "system") return true;
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });

  useEffect(() => {
    if (theme === "light") {
      setIsDark(false);
      return;
    }
    if (theme && theme !== "system") {
      setIsDark(true);
      return;
    }

    const updateThemeState = () => {
      const htmlHasDark = document.documentElement.classList.contains("dark");
      const systemDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(htmlHasDark || (theme === "system" && systemDark));
    };

    updateThemeState();

    const observer = new MutationObserver(() => updateThemeState());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let mediaQuery: MediaQueryList | null = null;
    if (typeof window !== "undefined" && window.matchMedia) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateThemeState);
    }

    return () => {
      observer.disconnect();
      if (mediaQuery) {
        mediaQuery.removeEventListener("change", updateThemeState);
      }
    };
  }, [theme]);

  if (fallbackText && fallbackText !== "JOXIQ" && fallbackText.length <= 2) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white font-black text-xs rounded-full shadow-md select-none shrink-0 aspect-square ${className}`}>
        {fallbackText}
      </div>
    );
  }

  if (!hasError) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none aspect-square backdrop-blur-md transition-all duration-300 ease-in-out border ${
          isDark
            ? "bg-slate-900/70 border-white/15 shadow-lg shadow-indigo-950/30"
            : "bg-white/75 border-slate-200/90 shadow-md shadow-slate-200/60"
        } ${className}`}
      >
        <img
          src="/logo.png"
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain block transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white rounded-full shadow-md shadow-indigo-500/20 select-none shrink-0 overflow-hidden group aspect-square ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
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



