import React from "react";

interface NovidLogoProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

export const NovidLogo: React.FC<NovidLogoProps> = ({
  size = 24,
  className = "",
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${glow ? "filter drop-shadow-[0_0_16px_rgba(56,189,248,0.6)]" : ""} ${className}`}
    >
      <defs>
        {/* Background dark metallic gradient */}
        <linearGradient id="novidBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Ultra vibrant cyan-to-purple gradient */}
        <linearGradient id="novidPlayGrad" x1="20%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Outer subtle glowing border */}
        <linearGradient id="novidBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Outer Tile */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="24"
        fill="url(#novidBg)"
        stroke="url(#novidBorderGrad)"
        strokeWidth="3.5"
      />

      {/* Ultra Smooth Rounded Play Triangle */}
      <path
        d="M41 33.5C41 31.8 42.8 30.7 44.3 31.6L69.8 46.6C71.3 47.5 71.3 49.7 69.8 50.6L44.3 65.6C42.8 66.5 41 65.4 41 63.7V33.5Z"
        fill="url(#novidPlayGrad)"
        stroke="url(#novidPlayGrad)"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Subtle Star/Sparkle Accent in Top Right */}
      <path
        d="M74 18L75.5 22L79.5 23.5L75.5 25L74 29L72.5 25L68.5 23.5L72.5 22L74 18Z"
        fill="#38bdf8"
        opacity="0.95"
      />
    </svg>
  );
};
