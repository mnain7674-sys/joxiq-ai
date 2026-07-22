import React, { useState } from "react";
import joxiqLogoAsset from "../logo.png";

interface JoxiqLogoProps {
  className?: string;
  alt?: string;
  fallbackText?: string;
}

export function JoxiqLogo({
  className = "w-full h-full object-contain rounded-full bg-white p-0.5",
  alt = "JOXIQ AI Official Logo",
  fallbackText = "JOXIQ"
}: JoxiqLogoProps) {
  const [src, setSrc] = useState<string>(joxiqLogoAsset || "/logo.png");
  const [hasError, setHasError] = useState<boolean>(false);

  if (hasError) {
    return (
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black flex items-center justify-center text-xs shadow-inner select-none">
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (src !== "/logo.png") {
          setSrc("/logo.png");
        } else {
          setHasError(true);
        }
      }}
    />
  );
}

