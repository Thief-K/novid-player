import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export interface MpvEventPayload {
  event?: string;
  name?: string;
  data?: any;
  request_id?: number;
  error?: string;
}

const thumbnailMemoryCache = new Map<string, string>();

export const mpvService = {
  async isAvailable(): Promise<boolean> {
    if (!isTauri()) return false;
    try {
      return await invoke<boolean>("check_mpv_status");
    } catch {
      return false;
    }
  },

  async loadFile(path: string, mode: "replace" | "append" = "replace"): Promise<void> {
    if (isTauri()) {
      await invoke("load_file", { path, mode });
    }
  },

  async setPause(pause: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: "pause", value: pause });
    }
  },

  async seek(seconds: number, relative = false): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_command", {
        command: ["seek", seconds, relative ? "relative" : "absolute"],
      });
    }
  },

  async setVolume(volume: number): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: "volume", value: volume });
    }
  },

  async setMute(mute: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: "mute", value: mute });
    }
  },

  async setSpeed(speed: number): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: "speed", value: speed });
    }
  },

  async setTrack(trackType: "sid" | "aid" | "vid", id: number | string): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: trackType, value: id });
    }
  },

  async loadSub(path: string): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_command", { command: ["sub-add", path, "select"] });
    }
  },

  async loadAudio(path: string): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_command", { command: ["audio-add", path, "select"] });
    }
  },

  async setSubDelay(delaySec: number): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: "sub-delay", value: delaySec });
    }
  },

  async setAudioDelay(delaySec: number): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: "audio-delay", value: delaySec });
    }
  },

  async setVideoAspect(ratio: string): Promise<void> {
    const aspectMap: Record<string, string> = {
      "16:9": "1.777778",
      "4:3": "1.333333",
      "21:9": "2.333333",
      "1:1": "1.0",
    };
    const aspectVal = aspectMap[ratio] || "-1";
    if (isTauri()) {
      await invoke("mpv_set_property", {
        property: "video-aspect-override",
        value: aspectVal,
      });
    }
  },

  async setVideoAdjust(prop: string, val: number): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_set_property", { property: prop, value: val });
    }
  },

  async frameStep(forward: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("mpv_command", {
        command: [forward ? "frame-step" : "frame-back-step"],
      });
    }
  },

  async takeScreenshot(includeSubtitles = true): Promise<string> {
    if (isTauri()) {
      return await invoke<string>("take_screenshot", { includeSubtitles });
    }
    return "Pictures/Screenshots";
  },

  async sendRawCommand(args: any[]): Promise<number | undefined> {
    if (isTauri()) {
      return await invoke<number>("mpv_command", { command: args });
    }
    return 0;
  },

  async startDragging(): Promise<void> {
    if (isTauri()) {
      await getCurrentWindow().startDragging();
    }
  },

  async toggleMaximize(): Promise<boolean> {
    if (isTauri()) {
      return await invoke<boolean>("toggle_window_maximize");
    }
    return false;
  },

  async toggleFullscreen(): Promise<boolean> {
    if (isTauri()) {
      const win = getCurrentWindow();
      const next = !(await win.isFullscreen());
      await win.setFullscreen(next);
      return next;
    }
    return false;
  },

  async isFullscreen(): Promise<boolean> {
    if (isTauri()) {
      return await getCurrentWindow().isFullscreen();
    }
    return false;
  },

  async minimize(): Promise<void> {
    if (isTauri()) {
      await getCurrentWindow().minimize();
    }
  },

  async close(): Promise<void> {
    if (isTauri()) {
      await getCurrentWindow().close();
    }
  },

  async setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    if (isTauri()) {
      await getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
    }
  },

  async autoFitWindow(videoWidth: number, videoHeight: number): Promise<void> {
    if (isTauri() && videoWidth > 0 && videoHeight > 0) {
      try {
        await invoke("auto_fit_window", { videoWidth, videoHeight });
      } catch (err) {
        console.warn("[Window] Failed to auto fit window:", err);
      }
    }
  },

  async getThumbnail(filePath: string, timeSec: number): Promise<string> {
    if (!isTauri() || !filePath) return "";
    const key = `${filePath}_${(Math.round(timeSec * 2) / 2).toFixed(1)}`;
    if (thumbnailMemoryCache.has(key)) {
      return thumbnailMemoryCache.get(key)!;
    }

    try {
      const dataUrl = await invoke<string>("get_video_thumbnail", {
        filePath,
        timeSec,
      });
      if (thumbnailMemoryCache.size > 150) {
        const oldest = thumbnailMemoryCache.keys().next().value;
        if (oldest) thumbnailMemoryCache.delete(oldest);
      }
      thumbnailMemoryCache.set(key, dataUrl);
      return dataUrl;
    } catch (err) {
      console.warn("[Thumbnail] Failed to extract frame:", err);
      return "";
    }
  },

  async cleanupThumbnails(): Promise<void> {
    thumbnailMemoryCache.clear();
    if (isTauri()) {
      await invoke("cleanup_thumbnails");
    }
  },

  async getStartupPaths(): Promise<string[]> {
    if (isTauri()) {
      try {
        return await invoke<string[]>("get_startup_paths");
      } catch (err) {
        console.warn("[MPV] Failed to get startup paths:", err);
        return [];
      }
    }
    return [];
  },

  listenOpenFiles(callback: (paths: string[]) => void): Promise<UnlistenFn> | (() => void) {
    if (!isTauri()) {
      return () => {};
    }
    return listen<string[]>("open-files", (event) => {
      if (event.payload && event.payload.length > 0) {
        callback(event.payload);
      }
    });
  },

  listenEvents(callback: (payload: MpvEventPayload) => void): Promise<UnlistenFn> | (() => void) {
    if (!isTauri()) {
      return () => {};
    }
    return listen<MpvEventPayload>("mpv-event", (event) => {
      callback(event.payload);
    });
  },
};
