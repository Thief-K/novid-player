import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Camera,
  Subtitles,
  Sliders,
  ListMusic,
  Maximize,
  Minimize,
} from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { SpeedPanel } from "./SpeedPanel";
import { TrackPanel } from "./TrackPanel";
import { VideoAdjustPanel } from "./VideoAdjustPanel";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri, mpvService } from "../services/mpvService";

import { useTranslation } from "../i18n";

import { formatTime } from "../utils/format";

export const FloatingControls: React.FC = () => {
  const {
    paused,
    currentTime,
    duration,
    speed,
    currentPath,
    isControlVisible,
    activePanel,
    togglePlayPause,
    seek,
    playNext,
    playPrev,
    takeScreenshot,
    togglePanel,
  } = usePlayerStore();
  const { t } = useTranslation();

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    if (!isTauri()) return;
    const win = getCurrentWindow();
    const checkFullscreen = async () => {
      setIsFullscreen(await mpvService.isFullscreen());
    };
    checkFullscreen();

    const unlistenResize = win.onResized(() => {
      checkFullscreen();
    });

    return () => {
      unlistenResize.then((fn) => fn());
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (isTauri()) {
      await mpvService.toggleFullscreen();
    }
  };

  if (!currentPath) return null;

  return (
    <>
      {/* Floating Panel Drawers */}
      {activePanel === "track" && <TrackPanel />}
      {activePanel === "speed" && <SpeedPanel />}
      {activePanel === "videoAdjust" && <VideoAdjustPanel />}

      {/* Main Bottom Control Bar */}
      <div
        className={`fixed bottom-4 left-6 right-6 z-30 transition-all duration-300 transform select-none ${
          isControlVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-slate-900/80 hover:bg-slate-900/90 border border-slate-700/60 shadow-2xl rounded-2xl px-4 py-2.5 backdrop-blur-xl transition-all">
          {/* Top: Progress Bar */}
          <ProgressBar />

          {/* Bottom: Playback & Action Controls */}
          <div className="flex items-center justify-between mt-1">
            {/* Left Control Group */}
            <div className="flex items-center gap-1">
              {/* Previous in playlist */}
              <button
                onClick={playPrev}
                title={t("controls.prev")}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Seek -5s */}
              <button
                onClick={() => seek(-5, true)}
                title={t("controls.seekBackward")}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={togglePlayPause}
                title={paused ? t("controls.play") : t("controls.pause")}
                className="p-2.5 mx-1 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
              >
                {paused ? (
                  <Play className="w-5 h-5 fill-current" />
                ) : (
                  <Pause className="w-5 h-5 fill-current" />
                )}
              </button>

              {/* Seek +10s */}
              <button
                onClick={() => seek(10, true)}
                title={t("controls.seekForward")}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Next in playlist */}
              <button
                onClick={playNext}
                title={t("controls.next")}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="ml-1">
                <VolumeControl />
              </div>

              {/* Time Display */}
              <div className="text-xs font-mono text-slate-300 ml-3 tracking-wide select-none">
                <span className="text-white font-medium">{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1.5">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Action Group */}
            <div className="flex items-center gap-1">
              {/* Screenshot */}
              <button
                onClick={() => takeScreenshot(true)}
                title={t("settings.hotkeyScreenshot")}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Speed Toggle Pill */}
              <button
                onClick={() => togglePanel("speed")}
                title={t("controls.speed")}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-all ${
                  activePanel === "speed" || speed !== 1.0
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700/80"
                }`}
              >
                {speed.toFixed(1)}x
              </button>

              {/* Track / Subtitles */}
              <button
                onClick={() => togglePanel("track")}
                title={t("controls.tracks")}
                className={`p-2 rounded-xl transition-colors ${
                  activePanel === "track"
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {/* Video Color & Ratio Adjust */}
              <button
                onClick={() => togglePanel("videoAdjust")}
                title={t("controls.videoAdjust")}
                className={`p-2 rounded-xl transition-colors ${
                  activePanel === "videoAdjust"
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Playlist Drawer Toggle */}
              <button
                onClick={() => togglePanel("playlist")}
                title={t("controls.playlist")}
                className={`p-2 rounded-xl transition-colors ${
                  activePanel === "playlist"
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <ListMusic className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={handleToggleFullscreen}
                title={isFullscreen ? t("controls.exitFullscreen") : t("controls.fullscreen")}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
