import React, { useState } from "react";

interface JoxiqLogoProps {
  className?: string;
  alt?: string;
  fallbackText?: string;
}

const basePrefix = import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/' ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
const logoPath = `${basePrefix}/logo.png`;

export function JoxiqLogo({
  className = "w-full h-full object-contain rounded-full",
  alt = "JOXIQ AI Official Logo",
  fallbackText = "JOXIQ"
}: JoxiqLogoProps) {
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string>(logoPath);

  if (hasError) {
    return (
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-inner select-none">
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (currentSrc !== "/logo.png") {
          setCurrentSrc("/logo.png");
        } else {
          setHasError(true);
        }
      }}
    />
  );
}

