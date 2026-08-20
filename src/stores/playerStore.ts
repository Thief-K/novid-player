import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PlayHistoryItem,
  PlaylistItem,
  ToastMessage,
  TrackInfo,
  VideoAdjustments,
} from "../types/player";
import { mpvService, MpvEventPayload } from "../services/mpvService";

const DEFAULT_VIDEO_ADJUST: VideoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  gamma: 0,
  aspectRatio: "original",
};

interface PlayerState {
  currentPath: string | null;
  mediaTitle: string;
  currentTime: number;
  duration: number;
  percentPos: number;
  paused: boolean;
  volume: number;
  muted: boolean;
  speed: number;
  hwdec: string;
  hwdecCurrent: string;
  tracks: TrackInfo[];
  selectedAudioTrack: number | string | null;
  selectedSubTrack: number | string | null;
  subDelay: number;
  audioDelay: number;
  videoAdjust: VideoAdjustments;
  bufferPercent: number;
  isMpvReady: boolean;

  // UI state
  isControlVisible: boolean;
  isPlaylistOpen: boolean;
  isTrackPanelOpen: boolean;
  isSpeedPanelOpen: boolean;
  isVideoAdjustOpen: boolean;
  isSettingsOpen: boolean;
  isPinned: boolean;
  isFullscreen: boolean;

  // Playlists and history
  playlist: PlaylistItem[];
  currentPlayingIndex: number;
  history: PlayHistoryItem[];
  toasts: ToastMessage[];

  // Actions
  setControlVisible: (visible: boolean) => void;
  togglePlaylist: (open?: boolean) => void;
  toggleTrackPanel: (open?: boolean) => void;
  toggleSpeedPanel: (open?: boolean) => void;
  toggleVideoAdjust: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;

  loadAndPlay: (filePath: string, title?: string) => Promise<void>;
  addToPlaylist: (files: { path: string; title?: string }[]) => void;
  removeFromPlaylist: (id: string) => void;
  clearPlaylist: () => void;
  playIndex: (index: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;

  togglePlayPause: () => Promise<void>;
  seek: (seconds: number, relative?: boolean) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setTrack: (trackType: "sid" | "aid", id: number | string) => Promise<void>;
  loadSubtitleFile: (path: string) => Promise<void>;
  loadAudioFile: (path: string) => Promise<void>;
  adjustSubDelay: (deltaSec: number) => Promise<void>;
  adjustAudioDelay: (deltaSec: number) => Promise<void>;
  setVideoAdjust: (adjustments: Partial<VideoAdjustments>) => Promise<void>;
  resetVideoAdjust: () => Promise<void>;
  setAspectRatio: (ratio: string) => Promise<void>;
  frameStep: (forward: boolean) => Promise<void>;
  takeScreenshot: (includeSubs?: boolean) => Promise<void>;
  setHwdec: (mode: string) => Promise<void>;

  addToast: (
    title: string,
    description?: string,
    type?: "info" | "success" | "warning" | "error"
  ) => void;
  removeToast: (id: string) => void;
  clearHistory: () => void;
  handleMpvEvent: (payload: MpvEventPayload) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentPath: null,
      mediaTitle: "未播放视频",
      currentTime: 0,
      duration: 0,
      percentPos: 0,
      paused: true,
      volume: 100,
      muted: false,
      speed: 1.0,
      hwdec: "auto-safe",
      hwdecCurrent: "auto",
      tracks: [],
      selectedAudioTrack: null,
      selectedSubTrack: null,
      subDelay: 0,
      audioDelay: 0,
      videoAdjust: DEFAULT_VIDEO_ADJUST,
      bufferPercent: 0,
      isMpvReady: false,

      isControlVisible: true,
      isPlaylistOpen: false,
      isTrackPanelOpen: false,
      isSpeedPanelOpen: false,
      isVideoAdjustOpen: false,
      isSettingsOpen: false,
      isPinned: false,
      isFullscreen: false,

      playlist: [],
      currentPlayingIndex: -1,
      history: [],
      toasts: [],

      setControlVisible: (visible) => set({ isControlVisible: visible }),
      togglePlaylist: (open) =>
        set((state) => ({
          isPlaylistOpen: open !== undefined ? open : !state.isPlaylistOpen,
          isTrackPanelOpen: false,
          isSpeedPanelOpen: false,
          isVideoAdjustOpen: false,
        })),
      toggleTrackPanel: (open) =>
        set((state) => ({
          isTrackPanelOpen: open !== undefined ? open : !state.isTrackPanelOpen,
          isPlaylistOpen: false,
          isSpeedPanelOpen: false,
          isVideoAdjustOpen: false,
        })),
      toggleSpeedPanel: (open) =>
        set((state) => ({
          isSpeedPanelOpen: open !== undefined ? open : !state.isSpeedPanelOpen,
          isPlaylistOpen: false,
          isTrackPanelOpen: false,
          isVideoAdjustOpen: false,
        })),
      toggleVideoAdjust: (open) =>
        set((state) => ({
          isVideoAdjustOpen: open !== undefined ? open : !state.isVideoAdjustOpen,
          isPlaylistOpen: false,
          isTrackPanelOpen: false,
          isSpeedPanelOpen: false,
        })),
      toggleSettings: (open) =>
        set((state) => ({
          isSettingsOpen: open !== undefined ? open : !state.isSettingsOpen,
        })),

      loadAndPlay: async (filePath: string, title?: string) => {
        const cleanTitle = title || filePath.split(/[/\\]/).pop() || "未知文件";

        // Check if item exists in playlist, otherwise add it
        const currentPlaylist = get().playlist;
        let index = currentPlaylist.findIndex((item) => item.path === filePath);
        if (index === -1) {
          const newItem: PlaylistItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: cleanTitle,
            path: filePath,
            addedAt: Date.now(),
          };
          set({
            playlist: [newItem, ...currentPlaylist],
            currentPlayingIndex: 0,
            currentPath: filePath,
            mediaTitle: cleanTitle,
            paused: false,
          });
        } else {
          set({
            currentPlayingIndex: index,
            currentPath: filePath,
            mediaTitle: cleanTitle,
            paused: false,
          });
        }

        // Check history for last played position
        const historyItem = get().history.find((h) => h.path === filePath);
        await mpvService.loadFile(filePath);

        if (
          historyItem &&
          historyItem.lastPosition > 5 &&
          historyItem.lastPosition < historyItem.duration - 10
        ) {
          setTimeout(() => {
            mpvService.seek(historyItem.lastPosition);
            get().addToast(
              "已恢复播放进度",
              `已跳转至 ${formatTime(historyItem.lastPosition)}`,
              "info"
            );
          }, 300);
        }

        // Update or add to history
        const newHistory = [
          {
            id: `hist_${Date.now()}`,
            title: cleanTitle,
            path: filePath,
            lastPosition: historyItem ? historyItem.lastPosition : 0,
            duration: historyItem ? historyItem.duration : 0,
            lastPlayedAt: Date.now(),
          },
          ...get().history.filter((h) => h.path !== filePath),
        ].slice(0, 50);

        set({ history: newHistory });
      },

      addToPlaylist: (files) => {
        const currentList = get().playlist;
        const newItems: PlaylistItem[] = files
          .filter((f) => !currentList.some((existing) => existing.path === f.path))
          .map((f) => ({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            title: f.title || f.path.split(/[/\\]/).pop() || "未知文件",
            path: f.path,
            addedAt: Date.now(),
          }));

        if (newItems.length > 0) {
          const updated = [...currentList, ...newItems];
          set({ playlist: updated });
          get().addToast("已添加至播放列表", `新增 ${newItems.length} 个文件`, "success");
        }
      },

      removeFromPlaylist: (id) => {
        const { playlist, currentPlayingIndex } = get();
        const targetIndex = playlist.findIndex((item) => item.id === id);
        if (targetIndex === -1) return;

        const updated = playlist.filter((item) => item.id !== id);
        let newIndex = currentPlayingIndex;
        if (targetIndex === currentPlayingIndex) {
          newIndex = -1;
        } else if (targetIndex < currentPlayingIndex) {
          newIndex = currentPlayingIndex - 1;
        }
        set({ playlist: updated, currentPlayingIndex: newIndex });
      },

      clearPlaylist: () => {
        set({ playlist: [], currentPlayingIndex: -1 });
      },

      playIndex: async (index: number) => {
        const { playlist } = get();
        if (index >= 0 && index < playlist.length) {
          const item = playlist[index];
          await get().loadAndPlay(item.path, item.title);
        }
      },

      playNext: async () => {
        const { playlist, currentPlayingIndex } = get();
        if (playlist.length === 0) return;
        const nextIndex = (currentPlayingIndex + 1) % playlist.length;
        await get().playIndex(nextIndex);
      },

      playPrev: async () => {
        const { playlist, currentPlayingIndex } = get();
        if (playlist.length === 0) return;
        const prevIndex = (currentPlayingIndex - 1 + playlist.length) % playlist.length;
        await get().playIndex(prevIndex);
      },

      togglePlayPause: async () => {
        const isPaused = !get().paused;
        set({ paused: isPaused });
        await mpvService.playPause();
      },

      seek: async (seconds: number, relative = false) => {
        if (relative) {
          const target = Math.max(0, Math.min(get().duration, get().currentTime + seconds));
          set({
            currentTime: target,
            percentPos: get().duration ? (target / get().duration) * 100 : 0,
          });
        } else {
          set({
            currentTime: seconds,
            percentPos: get().duration ? (seconds / get().duration) * 100 : 0,
          });
        }
        await mpvService.seek(seconds, relative);
      },

      setVolume: async (vol: number) => {
        const clamped = Math.max(0, Math.min(150, Math.round(vol)));
        set({ volume: clamped, muted: clamped === 0 });
        await mpvService.setVolume(clamped);
      },

      toggleMute: async () => {
        const newMuted = !get().muted;
        set({ muted: newMuted });
        await mpvService.setMute(newMuted);
      },

      setSpeed: async (speed: number) => {
        const rounded = parseFloat(speed.toFixed(2));
        set({ speed: rounded });
        await mpvService.setSpeed(rounded);
        get().addToast("播放倍速", `${rounded}x`, "info");
      },

      setTrack: async (trackType, id) => {
        await mpvService.setTrack(trackType, id);
        if (trackType === "sid") {
          set({ selectedSubTrack: id });
        } else if (trackType === "aid") {
          set({ selectedAudioTrack: id });
        }
      },

      loadSubtitleFile: async (path: string) => {
        await mpvService.loadSub(path);
        get().addToast("已加载外挂字幕", path.split(/[/\\]/).pop(), "success");
      },

      loadAudioFile: async (path: string) => {
        await mpvService.loadAudio(path);
        get().addToast("已加载外挂音轨", path.split(/[/\\]/).pop(), "success");
      },

      adjustSubDelay: async (deltaSec: number) => {
        const newDelay = Math.round((get().subDelay + deltaSec) * 10) / 10;
        set({ subDelay: newDelay });
        await mpvService.setSubDelay(newDelay);
        get().addToast("字幕延迟校准", `${newDelay > 0 ? "+" : ""}${newDelay}s`, "info");
      },

      adjustAudioDelay: async (deltaSec: number) => {
        const newDelay = Math.round((get().audioDelay + deltaSec) * 10) / 10;
        set({ audioDelay: newDelay });
        await mpvService.setAudioDelay(newDelay);
        get().addToast("音频延迟校准", `${newDelay > 0 ? "+" : ""}${newDelay}s`, "info");
      },

      setVideoAdjust: async (adjustments) => {
        const merged = { ...get().videoAdjust, ...adjustments };
        set({ videoAdjust: merged });
        for (const [key, val] of Object.entries(adjustments)) {
          if (
            ["brightness", "contrast", "saturation", "gamma"].includes(key) &&
            typeof val === "number"
          ) {
            await mpvService.setVideoAdjust(key, val);
          }
        }
      },

      resetVideoAdjust: async () => {
        set({ videoAdjust: DEFAULT_VIDEO_ADJUST });
        for (const key of ["brightness", "contrast", "saturation", "gamma"]) {
          await mpvService.setVideoAdjust(key, 0);
        }
        await mpvService.setVideoAspect("original");
        get().addToast("画面调整已重置", undefined, "info");
      },

      setAspectRatio: async (ratio: string) => {
        set((state) => ({ videoAdjust: { ...state.videoAdjust, aspectRatio: ratio } }));
        await mpvService.setVideoAspect(ratio);
        get().addToast("画面比例", ratio === "original" ? "原始比例" : ratio, "info");
      },

      frameStep: async (forward: boolean) => {
        await mpvService.frameStep(forward);
      },

      takeScreenshot: async (includeSubs = true) => {
        await mpvService.takeScreenshot(includeSubs);
        get().addToast("截图已保存", "已保存至 Pictures/Screenshots", "success");
      },

      setHwdec: async (mode: string) => {
        if (mode === "no") {
          set({ hwdec: "no", hwdecCurrent: "no" });
          await mpvService.sendRawCommand(["set_property", "hwdec", "no"]);
          get().addToast("解码模式", "已切换为纯 CPU 软件解码", "info");
          return;
        }

        // Apply requested hardware decode mode to MPV engine
        await mpvService.sendRawCommand(["set_property", "hwdec", mode]);

        // If a video is currently loaded, verify whether hardware decoding actually succeeded
        if (get().currentPath) {
          setTimeout(() => {
            const current = get().hwdecCurrent;
            if (current === "no") {
              // Failed to activate (e.g. non-NVIDIA GPU or unsupported codec)
              set({ hwdec: "no" });
              get().addToast(
                "硬件加速未生效",
                `设备或视频不支持 ${mode} 硬解，已自动回退为软件解码`,
                "warning"
              );
            } else {
              set({ hwdec: mode });
              get().addToast("硬件加速已启用", `已成功激活硬件解码 (${current})`, "success");
            }
          }, 300);
        } else {
          set({ hwdec: mode });
          get().addToast("硬件加速模式", `已设置为 ${mode}（将在播放时生效）`, "info");
        }
      },

      addToast: (title, description, type = "info") => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newToast: ToastMessage = { id, title, description, type, duration: 2500 };
        set((state) => ({ toasts: [...state.toasts.slice(-4), newToast] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 2500);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      handleMpvEvent: (payload: MpvEventPayload) => {
        if (!payload) return;

        if (payload.event === "property-change" && payload.name) {
          const val = payload.data;
          switch (payload.name) {
            case "time-pos":
              if (typeof val === "number") {
                const dur = get().duration;
                set({
                  currentTime: val,
                  percentPos: dur > 0 ? (val / dur) * 100 : 0,
                });
                // Update history position
                const currentPath = get().currentPath;
                if (currentPath && dur > 0) {
                  set((state) => ({
                    history: state.history.map((h) =>
                      h.path === currentPath
                        ? { ...h, lastPosition: val, duration: dur, lastPlayedAt: Date.now() }
                        : h
                    ),
                  }));
                }
              }
              break;
            case "duration":
              if (typeof val === "number") set({ duration: val });
              break;
            case "pause":
              if (typeof val === "boolean") set({ paused: val });
              break;
            case "volume":
              if (typeof val === "number") set({ volume: Math.round(val) });
              break;
            case "mute":
              if (typeof val === "boolean") set({ muted: val });
              break;
            case "speed":
              if (typeof val === "number") set({ speed: parseFloat(val.toFixed(2)) });
              break;
            case "track-list":
              if (Array.isArray(val)) {
                set({ tracks: val });
                const selectedSub = val.find((t) => t.type === "sub" && t.selected);
                const selectedAudio = val.find((t) => t.type === "audio" && t.selected);
                if (selectedSub) set({ selectedSubTrack: selectedSub.id });
                if (selectedAudio) set({ selectedAudioTrack: selectedAudio.id });
              }
              break;
            case "hwdec-current":
              if (typeof val === "string") set({ hwdecCurrent: val });
              break;
            case "sub-delay":
              if (typeof val === "number") set({ subDelay: val });
              break;
            case "audio-delay":
              if (typeof val === "number") set({ audioDelay: val });
              break;
            case "demuxer-cache-state":
              if (val && typeof val === "object" && "cache-end" in val) {
                const cacheEnd = (val as any)["cache-end"];
                const dur = get().duration;
                if (dur > 0 && typeof cacheEnd === "number") {
                  set({ bufferPercent: Math.min(100, (cacheEnd / dur) * 100) });
                }
              }
              break;
            case "eof-reached":
              if (val === true) {
                // Auto play next video in playlist
                get().playNext();
              }
              break;
            case "media-title":
              if (typeof val === "string" && val.trim()) {
                set({ mediaTitle: val });
              }
              break;
          }
        }
      },
    }),
    {
      name: "novidplayer_storage",
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        hwdec: state.hwdec,
        history: state.history,
        playlist: state.playlist,
      }),
    }
  )
);

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
