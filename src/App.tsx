import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePlayerStore } from "./stores/playerStore";
import { mpvService, isTauri } from "./services/mpvService";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { TitleBar } from "./components/TitleBar";
import { WelcomeDropZone } from "./components/WelcomeDropZone";
import { FloatingControls } from "./components/FloatingControls";
import { PlaylistModal } from "./components/PlaylistModal";
import { SettingsModal } from "./components/SettingsModal";
import { ToastContainer } from "./components/Toast";
import { ContextMenu } from "./components/ContextMenu";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { useTranslation } from "./i18n";

export const App: React.FC = () => {
  const store = usePlayerStore();
  const { t } = useTranslation();
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Bind global keyboard shortcuts
  useKeyboardShortcuts();

  const handleDroppedPaths = useCallback(
    (paths: string[]) => {
      const videoExts = ["mp4", "mkv", "avi", "mov", "flv", "ts", "webm", "wmv", "m4v"];
      const subExts = ["srt", "ass", "ssa", "vtt", "sub"];
      const audioExts = ["mp3", "flac", "wav", "aac", "ogg", "m4a"];

      const videos: string[] = [];
      const subtitles: string[] = [];
      const audios: string[] = [];

      for (const p of paths) {
        const ext = p.split(".").pop()?.toLowerCase() || "";
        if (videoExts.includes(ext)) {
          videos.push(p);
        } else if (subExts.includes(ext)) {
          subtitles.push(p);
        } else if (audioExts.includes(ext)) {
          audios.push(p);
        }
      }

      if (videos.length > 0) {
        // Play first video and queue the rest
        store.loadAndPlay(videos[0]);
        if (videos.length > 1) {
          store.addToPlaylist(videos.slice(1).map((path) => ({ path })));
        }
      }

      if (subtitles.length > 0) {
        for (const sub of subtitles) {
          store.loadSubtitleFile(sub);
        }
      }

      if (audios.length > 0 && videos.length === 0) {
        if (store.currentPath) {
          for (const aud of audios) {
            store.loadAudioFile(aud);
          }
        } else {
          store.loadAndPlay(audios[0]);
        }
      }
    },
    [store]
  );

  // Listen to MPV IPC Events
  useEffect(() => {
    let unlisten: any = null;
    const init = async () => {
      unlisten = await mpvService.listenEvents((payload) => {
        usePlayerStore.getState().handleMpvEvent(payload);
      });

      if (await mpvService.isAvailable()) {
        const { volume, muted, hwdec, speed } = usePlayerStore.getState();
        await mpvService.setVolume(volume);
        await mpvService.setMute(muted);
        if (speed !== 1.0) {
          await mpvService.setSpeed(speed);
        }
        if (hwdec && hwdec !== "auto-safe") {
          await mpvService.sendRawCommand(["set_property", "hwdec", hwdec]);
        }
        usePlayerStore.setState({ isMpvReady: true });
      }
    };
    init();

    return () => {
      if (typeof unlisten === "function") {
        unlisten();
      }
    };
  }, []);

  // Listen to Tauri Drag & Drop files
  useEffect(() => {
    if (!isTauri()) return;
    const win = getCurrentWindow();
    let unlistenDragDrop: any = null;

    const setupDrag = async () => {
      unlistenDragDrop = await win.onDragDropEvent((event) => {
        if (event.payload.type === "enter" || event.payload.type === "over") {
          setIsDragOver(true);
        } else if (event.payload.type === "drop") {
          setIsDragOver(false);
          const paths = event.payload.paths;
          if (paths && paths.length > 0) {
            handleDroppedPaths(paths);
          }
        } else if (event.payload.type === "leave") {
          setIsDragOver(false);
        }
      });
    };
    setupDrag();

    return () => {
      if (typeof unlistenDragDrop === "function") {
        unlistenDragDrop();
      }
    };
  }, [handleDroppedPaths]);

  // Mouse activity timer to hide controls after 2s inactivity
  const handleMouseMove = useCallback(() => {
    store.setControlVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    // Only auto hide if video is loaded and not paused
    if (store.currentPath && !store.paused) {
      hideTimerRef.current = setTimeout(() => {
        if (!store.activePanel) {
          store.setControlVisible(false);
        }
      }, 2000);
    }
  }, [store]);

  // Video viewport click & double click
  const handleViewportClick = (e: React.MouseEvent) => {
    // If clicking on UI overlay elements, ignore
    if ((e.target as HTMLElement).closest("button, input, header")) {
      return;
    }

    if (clickTimerRef.current) {
      // Double click -> Toggle Fullscreen
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      mpvService.toggleFullscreen();
    } else {
      // Single click -> Toggle Play/Pause after short debounce
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        if (store.currentPath) {
          store.togglePlayPause();
        }
      }, 250);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (store.currentPath) {
      setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 w-full h-full overflow-hidden select-none bg-transparent text-slate-100"
      style={{ cursor: store.isControlVisible || !store.currentPath ? "default" : "none" }}
    >
      {/* Title Bar */}
      <TitleBar />

      {/* Main Video Viewport / Interaction Plane */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleViewportClick}
        onContextMenu={handleContextMenu}
      />

      {/* Welcome Screen when no video is loaded */}
      {!store.currentPath && <WelcomeDropZone />}

      {/* Right-click Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Global Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-sky-950/80 backdrop-blur-md border-4 border-dashed border-sky-400 pointer-events-none animate-in fade-in duration-150">
          <div className="text-center">
            <div className="text-4xl mb-2">📂</div>
            <div className="text-xl font-bold text-sky-200">{t("welcome.dropHint")}</div>
          </div>
        </div>
      )}

      {/* Floating Streaming Controls */}
      <FloatingControls />

      {/* Playlist Modal */}
      <PlaylistModal />

      {/* Settings Modal */}
      <SettingsModal />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export default App;
