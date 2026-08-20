import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

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
    } else {
      console.log("[Mock MPV] Load file:", path, mode);
    }
  },

  async playPause(): Promise<void> {
    if (isTauri()) {
      await invoke("play_pause");
    } else {
      console.log("[Mock MPV] Play/Pause toggled");
    }
  },

  async seek(seconds: number, relative = false): Promise<void> {
    if (isTauri()) {
      await invoke("seek", { seconds, relative });
    } else {
      console.log("[Mock MPV] Seek:", seconds, relative ? "(relative)" : "(absolute)");
    }
  },

  async setVolume(volume: number): Promise<void> {
    if (isTauri()) {
      await invoke("set_volume", { volume });
    } else {
      console.log("[Mock MPV] Set Volume:", volume);
    }
  },

  async setMute(mute: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("set_mute", { mute });
    } else {
      console.log("[Mock MPV] Set Mute:", mute);
    }
  },

  async setSpeed(speed: number): Promise<void> {
    if (isTauri()) {
      await invoke("set_speed", { speed });
    } else {
      console.log("[Mock MPV] Set Speed:", speed);
    }
  },

  async setTrack(trackType: "sid" | "aid" | "vid", id: number | string): Promise<void> {
    if (isTauri()) {
      await invoke("set_track", { trackType, id });
    } else {
      console.log("[Mock MPV] Set Track:", trackType, id);
    }
  },

  async loadSub(path: string): Promise<void> {
    if (isTauri()) {
      await invoke("load_sub", { path });
    } else {
      console.log("[Mock MPV] Load Subtitle:", path);
    }
  },

  async loadAudio(path: string): Promise<void> {
    if (isTauri()) {
      await invoke("load_audio", { path });
    } else {
      console.log("[Mock MPV] Load Audio:", path);
    }
  },

  async setSubDelay(delaySec: number): Promise<void> {
    if (isTauri()) {
      await invoke("set_sub_delay", { delaySec });
    } else {
      console.log("[Mock MPV] Set Sub Delay:", delaySec);
    }
  },

  async setAudioDelay(delaySec: number): Promise<void> {
    if (isTauri()) {
      await invoke("set_audio_delay", { delaySec });
    } else {
      console.log("[Mock MPV] Set Audio Delay:", delaySec);
    }
  },

  async setVideoAspect(ratio: string): Promise<void> {
    if (isTauri()) {
      await invoke("set_video_aspect", { ratio });
    } else {
      console.log("[Mock MPV] Set Video Aspect:", ratio);
    }
  },

  async setVideoAdjust(prop: string, val: number): Promise<void> {
    if (isTauri()) {
      await invoke("set_video_adjust", { prop, val });
    } else {
      console.log("[Mock MPV] Set Video Adjust:", prop, val);
    }
  },

  async frameStep(forward: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("frame_step", { forward });
    } else {
      console.log("[Mock MPV] Frame Step:", forward ? "+1" : "-1");
    }
  },

  async takeScreenshot(includeSubtitles = true): Promise<string> {
    if (isTauri()) {
      return await invoke<string>("take_screenshot", { includeSubtitles });
    } else {
      console.log("[Mock MPV] Screenshot taken, include subs:", includeSubtitles);
      return "Pictures/Screenshots";
    }
  },

  async sendRawCommand(args: any[]): Promise<number | undefined> {
    if (isTauri()) {
      return await invoke<number>("mpv_command", { command: args });
    } else {
      console.log("[Mock MPV] Raw Command:", args);
      return 0;
    }
  },

  async startDragging(): Promise<void> {
    if (isTauri()) {
      await invoke("start_window_dragging");
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
      return await invoke<boolean>("toggle_window_fullscreen");
    }
    return false;
  },

  async isFullscreen(): Promise<boolean> {
    if (isTauri()) {
      return await invoke<boolean>("is_window_fullscreen");
    }
    return false;
  },

  async minimize(): Promise<void> {
    if (isTauri()) {
      await invoke("minimize_window");
    }
  },

  async close(): Promise<void> {
    if (isTauri()) {
      await invoke("close_window");
    }
  },

  async setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    if (isTauri()) {
      await invoke("set_window_always_on_top", { alwaysOnTop });
    }
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
