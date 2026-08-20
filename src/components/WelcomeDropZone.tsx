import React from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";
import { isTauri } from "../services/mpvService";
import { NovidLogo } from "./NovidLogo";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const WelcomeDropZone: React.FC = () => {
  const { loadAndPlay } = usePlayerStore();

  const handleDragMouseDown = async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input")) {
      return;
    }

    if (e.detail === 2) {
      if (isTauri()) {
        const win = getCurrentWindow();
        const isMax = await win.isMaximized();
        if (isMax) {
          await win.unmaximize();
        } else {
          await win.maximize();
        }
      }
    } else if (e.detail === 1) {
      if (isTauri()) {
        getCurrentWindow().startDragging();
      }
    }
  };

  const handleOpenFile = async () => {
    try {
      if (isTauri()) {
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: "视频与媒体文件",
              extensions: [
                "mp4",
                "mkv",
                "avi",
                "mov",
                "flv",
                "ts",
                "webm",
                "wmv",
                "m4v",
                "iso",
                "mp3",
                "flac",
                "wav",
                "aac",
                "ogg",
                "m4a",
              ],
            },
          ],
        });
        if (selected && typeof selected === "string") {
          await loadAndPlay(selected);
        }
      }
    } catch (err) {
      console.error("Open file error:", err);
    }
  };

  return (
    <div
      onMouseDown={handleDragMouseDown}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0b0e14]/90 backdrop-blur-md z-20 select-none overflow-hidden"
    >
      {/* Background subtle ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[36rem] h-[36rem] bg-sky-500/10 rounded-full blur-3xl -top-28 -left-28 animate-pulse-subtle" />
        <div className="absolute w-[36rem] h-[36rem] bg-indigo-500/10 rounded-full blur-3xl -bottom-28 -right-28 animate-pulse-subtle delay-1000" />
      </div>

      {/* Pure Iconic Center Drop & Open Action Target */}
      <div className="relative z-10 flex flex-col items-center">
        <button
          onClick={handleOpenFile}
          title="打开视频文件 (Ctrl+O) 或直接拖入"
          className="group relative flex items-center justify-center p-7 rounded-3xl border border-slate-700/40 bg-slate-900/30 hover:border-sky-500/50 hover:bg-slate-900/60 transition-all duration-300 shadow-2xl hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-95 cursor-pointer backdrop-blur-xl"
        >
          {/* Glowing NovidLogo with subtle FolderOpen badge */}
          <div className="relative transition-transform duration-300 group-hover:scale-105">
            <NovidLogo size={92} glow={true} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg border-2 border-slate-900 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
