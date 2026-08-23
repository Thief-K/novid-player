import React, { useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/playerStore";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  Monitor,
  Camera,
  ListMusic,
  Settings,
  Subtitles,
  Sliders,
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
    seek,
    setSpeed,
    setAspectRatio,
    takeScreenshot,
    togglePlaylist,
    toggleTrackPanel,
    toggleVideoAdjust,
    toggleSettings,
    videoAdjust,
  } = usePlayerStore();
  const { t } = useTranslation();

  const menuRef = useRef<HTMLDivElement>(null);

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
  const menuHeight = 310;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];
  const aspectOptions = [
    { label: t("videoAdjust.aspectAuto"), val: "original" },
    { label: "16:9", val: "16:9" },
    { label: "4:3", val: "4:3" },
    { label: "21:9", val: "21:9" },
  ];

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 w-48 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-1.5 backdrop-blur-xl text-slate-200 select-none text-xs animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Play / Pause */}
      <button
        onClick={() => {
          togglePlayPause();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>
            {paused ? t("controls.play").split(" ")[0] : t("controls.pause").split(" ")[0]}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Space</span>
      </button>

      {/* Seek -5s / +10s */}
      <div className="flex items-center gap-1 my-0.5">
        <button
          onClick={() => {
            seek(-5, true);
            onClose();
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/80 text-[11px] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>-5s</span>
        </button>
        <button
          onClick={() => {
            seek(10, true);
            onClose();
          }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/80 text-[11px] transition-colors"
        >
          <RotateCw className="w-3 h-3" />
          <span>+10s</span>
        </button>
      </div>

      <div className="h-px bg-slate-800/80 my-1" />

      {/* Speed Sub-selector */}
      <div className="px-2.5 py-1 text-[11px] text-slate-400 font-medium flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          <span>{t("speed.title")}</span>
        </span>
        <span className="font-mono text-sky-400">{speed.toFixed(1)}x</span>
      </div>
      <div className="grid grid-cols-5 gap-1 px-1 mb-1">
        {speedOptions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSpeed(s);
              onClose();
            }}
            className={`py-0.5 rounded text-[10px] font-mono transition-colors ${
              Math.abs(speed - s) < 0.01
                ? "bg-sky-500 text-white font-bold"
                : "bg-slate-800/60 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Aspect Ratio */}
      <div className="px-2.5 py-1 text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
        <Monitor className="w-3.5 h-3.5 text-sky-400" />
        <span>{t("videoAdjust.aspectRatio")}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 px-1 mb-1">
        {aspectOptions.map((a) => (
          <button
            key={a.val}
            onClick={() => {
              setAspectRatio(a.val);
              onClose();
            }}
            className={`py-1 px-1.5 rounded text-[10px] text-left truncate transition-colors ${
              videoAdjust.aspectRatio === a.val
                ? "bg-sky-500 text-white font-medium"
                : "bg-slate-800/60 hover:bg-slate-700 text-slate-300"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-800/80 my-1" />

      {/* Quick panel toggles */}
      <button
        onClick={() => {
          toggleTrackPanel();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Subtitles className="w-3.5 h-3.5" />
          <span>{t("tracks.subTitle")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">C / V</span>
      </button>

      <button
        onClick={() => {
          toggleVideoAdjust();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>{t("videoAdjust.title")}</span>
        </div>
      </button>

      <button
        onClick={() => {
          takeScreenshot(true);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5" />
          <span>{t("settings.hotkeyScreenshot")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">S</span>
      </button>

      <button
        onClick={() => {
          togglePlaylist();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ListMusic className="w-3.5 h-3.5" />
          <span>{t("playlist.title")}</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">L</span>
      </button>

      <div className="h-px bg-slate-800/80 my-1" />

      {/* Settings */}
      <button
        onClick={() => {
          toggleSettings(true);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" />
          <span>{t("settings.title")}</span>
        </div>
      </button>
    </div>
  );
};
