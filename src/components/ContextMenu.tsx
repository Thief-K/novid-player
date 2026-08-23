import React, { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../stores/playerStore";
import {
  Play,
  Pause,
  Gauge,
  Monitor,
  Camera,
  ListMusic,
  Settings,
  Subtitles,
  Sliders,
  ChevronRight,
  Check,
} from "lucide-react";
import { useTranslation } from "../i18n";

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, x, y, onClose }) => {
  const {
    paused,
    speed,
    togglePlayPause,
    setSpeed,
    setAspectRatio,
    takeScreenshot,
    togglePanel,
    videoAdjust,
  } = usePlayerStore();
  const { t } = useTranslation();

  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<"speed" | "aspect" | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleGlobalClick);
      document.addEventListener("keydown", handleGlobalKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Boundary constraints
  const menuWidth = 190;
  const menuHeight = 240;
  const submenuWidth = 130;

  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

  // Submenu placement (flip left if close to right edge)
  const isSubmenuLeft = adjustedX + menuWidth + submenuWidth > window.innerWidth - 10;

  const speedOptions = [
    { label: "0.5x", val: 0.5 },
    { label: "0.75x", val: 0.75 },
    { label: `1.0x (${t("contextMenu.speedNormal")})`, val: 1.0 },
    { label: "1.25x", val: 1.25 },
    { label: "1.5x", val: 1.5 },
    { label: "2.0x", val: 2.0 },
    { label: "3.0x", val: 3.0 },
  ];

  const aspectOptions = [
    { label: t("videoAdjust.aspectAuto"), val: "original" },
    { label: "16:9", val: "16:9" },
    { label: "4:3", val: "4:3" },
    { label: "21:9", val: "21:9" },
    { label: "1:1", val: "1:1" },
  ];

  const getCurrentAspectLabel = () => {
    if (videoAdjust.aspectRatio === "original") return t("videoAdjust.aspectAuto");
    return videoAdjust.aspectRatio;
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-48 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1 backdrop-blur-xl text-slate-200 select-none text-xs animate-in fade-in zoom-in-95 duration-100 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Play / Pause */}
      <button
        onClick={() => {
          togglePlayPause();
          onClose();
        }}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{paused ? t("contextMenu.play") : t("contextMenu.pause")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Space</span>
      </button>

      <div className="h-px bg-slate-800/80 my-1" />

      {/* 2. Playback Speed with Cascading Submenu */}
      <div className="relative" onMouseEnter={() => setActiveSubmenu("speed")}>
        <button
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
            activeSubmenu === "speed"
              ? "bg-sky-500/20 text-sky-300"
              : "hover:bg-sky-500/20 hover:text-sky-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span>{t("contextMenu.speed")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">{speed.toFixed(1)}x</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </div>
        </button>

        {/* Speed Submenu */}
        {activeSubmenu === "speed" && (
          <div
            className={`absolute top-0 w-36 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1 backdrop-blur-xl text-slate-200 select-none text-xs animate-in fade-in duration-100 z-50 ${
              isSubmenuLeft ? "right-full mr-1" : "left-full ml-1"
            }`}
          >
            {speedOptions.map((opt) => {
              const isSelected = Math.abs(speed - opt.val) < 0.01;
              return (
                <button
                  key={opt.val}
                  onClick={() => {
                    setSpeed(opt.val);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-300 font-medium"
                      : "hover:bg-sky-500/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] font-mono">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Aspect Ratio with Cascading Submenu */}
      <div className="relative" onMouseEnter={() => setActiveSubmenu("aspect")}>
        <button
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
            activeSubmenu === "aspect"
              ? "bg-sky-500/20 text-sky-300"
              : "hover:bg-sky-500/20 hover:text-sky-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            <span>{t("contextMenu.aspectRatio")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 truncate max-w-[45px]">
              {getCurrentAspectLabel()}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </div>
        </button>

        {/* Aspect Ratio Submenu */}
        {activeSubmenu === "aspect" && (
          <div
            className={`absolute top-0 w-32 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1 backdrop-blur-xl text-slate-200 select-none text-xs animate-in fade-in duration-100 z-50 ${
              isSubmenuLeft ? "right-full mr-1" : "left-full ml-1"
            }`}
          >
            {aspectOptions.map((opt) => {
              const isSelected = videoAdjust.aspectRatio === opt.val;
              return (
                <button
                  key={opt.val}
                  onClick={() => {
                    setAspectRatio(opt.val);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-300 font-medium"
                      : "hover:bg-sky-500/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <span className="text-[11px]">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Tracks & Subtitles */}
      <button
        onClick={() => {
          togglePanel("track");
          onClose();
        }}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Subtitles className="w-3.5 h-3.5" />
          <span>{t("contextMenu.tracks")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">C / V</span>
      </button>

      {/* 5. Video Color Adjust */}
      <button
        onClick={() => {
          togglePanel("videoAdjust");
          onClose();
        }}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>{t("contextMenu.videoAdjust")}</span>
        </div>
      </button>

      <div className="h-px bg-slate-800/80 my-1" />

      {/* 6. Screenshot */}
      <button
        onClick={() => {
          takeScreenshot(true);
          onClose();
        }}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5" />
          <span>{t("contextMenu.screenshot")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">S</span>
      </button>

      {/* 7. Playlist */}
      <button
        onClick={() => {
          togglePanel("playlist");
          onClose();
        }}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ListMusic className="w-3.5 h-3.5" />
          <span>{t("contextMenu.playlist")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">L</span>
      </button>

      <div className="h-px bg-slate-800/80 my-1" />

      {/* 8. Settings */}
      <button
        onClick={() => {
          togglePanel("settings");
          onClose();
        }}
        onMouseEnter={() => setActiveSubmenu(null)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" />
          <span>{t("contextMenu.settings")}</span>
        </div>
      </button>
    </div>
  );
};
