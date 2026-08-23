import React, { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Pin, PinOff, Minus, Square, Copy, X, Clock, Settings } from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";
import { isTauri, mpvService } from "../services/mpvService";
import { NovidLogo } from "./NovidLogo";
import { HistoryModal } from "./HistoryModal";
import { useTranslation } from "../i18n";

export const TitleBar: React.FC = () => {
  const { mediaTitle, currentPath, isPinned, isControlVisible, history, toggleSettings } =
    usePlayerStore();
  const { t } = useTranslation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [pinned, setPinned] = useState(isPinned);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    const win = getCurrentWindow();
    const checkMaximized = async () => {
      const isMax = await win.isMaximized();
      const isFull = await mpvService.isFullscreen();
      setIsMaximized(isMax || isFull);
    };
    checkMaximized();

    const unlistenResize = win.onResized(() => {
      checkMaximized();
    });

    return () => {
      unlistenResize.then((fn) => fn());
    };
  }, []);

  const handleMinimize = async () => {
    await mpvService.minimize();
  };

  const handleMaximize = async () => {
    const isFull = await mpvService.isFullscreen();
    if (isFull) {
      // If in fullscreen, exit fullscreen back to normal
      await mpvService.toggleFullscreen();
      setIsMaximized(false);
    } else {
      const nextMax = await mpvService.toggleMaximize();
      setIsMaximized(nextMax);
    }
  };

  const handleClose = async () => {
    await mpvService.close();
  };

  const handleTogglePin = async () => {
    const nextPin = !pinned;
    await mpvService.setAlwaysOnTop(nextPin);
    setPinned(nextPin);
    usePlayerStore.setState({ isPinned: nextPin });
  };

  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, input, a")) {
      return;
    }

    if (e.detail === 2) {
      await handleMaximize();
    } else if (e.detail === 1) {
      if (isTauri()) {
        getCurrentWindow().startDragging();
      }
    }
  };

  return (
    <>
      <header
        onMouseDown={handleMouseDown}
        className={`fixed top-0 left-0 right-0 h-10 z-50 flex items-center justify-between px-3 select-none transition-opacity duration-300 ${
          isControlVisible || !currentPath ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-xs cursor-default`}
      >
        {/* Left: App Logo & Current File Title */}
        <div className="flex items-center gap-2 max-w-[65%] overflow-hidden">
          <NovidLogo size={18} />
          <span className="text-xs font-semibold tracking-wide text-slate-300">NovidPlayer</span>
          {currentPath && (
            <>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-xs text-slate-200 truncate font-medium max-w-sm">
                {mediaTitle}
              </span>
            </>
          )}
        </div>

        {/* Right: Window Controls, History & Settings */}
        <div className="flex items-center gap-1">
          {/* Playback History Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            title={`${t("history.title")} (${history.length})`}
            className="relative p-1.5 text-slate-400 hover:text-sky-300 hover:bg-white/10 rounded-md transition-colors mr-0.5"
          >
            <Clock className="w-3.5 h-3.5" />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-sky-400 rounded-full" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => toggleSettings(true)}
            title={t("settings.title")}
            className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-white/10 rounded-md transition-colors mr-0.5"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Always-on-Top Toggle */}
          <button
            onClick={handleTogglePin}
            title={pinned ? t("titleBar.unpinTop") : t("titleBar.pinTop")}
            className={`p-1.5 rounded-md transition-colors ${
              pinned
                ? "bg-sky-500/30 text-sky-300 hover:bg-sky-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
            }`}
          >
            {pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Vertical Divider */}
          <div className="w-px h-3.5 bg-slate-700/60 mx-1 shrink-0" />

          {/* Minimize */}
          <button
            onClick={handleMinimize}
            title={t("titleBar.minimize")}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-md transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={handleMaximize}
            title={isMaximized ? t("titleBar.restore") : t("titleBar.maximize")}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-md transition-colors"
          >
            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            title={t("titleBar.close")}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500/80 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* History Modal Popup */}
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </>
  );
};
