import { useEffect } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { isTauri } from "../services/mpvService";

export function useKeyboardShortcuts() {
  const store = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore key events in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Handle Ctrl+O (Open File)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        try {
          if (isTauri()) {
            const selected = await open({
              multiple: false,
              filters: [
                {
                  name: "视频与音频文件",
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
                    "mp3",
                    "flac",
                    "wav",
                    "aac",
                  ],
                },
              ],
            });
            if (selected && typeof selected === "string") {
              store.loadAndPlay(selected);
            }
          }
        } catch (err) {
          console.error("Open file dialog error:", err);
        }
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          store.togglePlayPause();
          break;

        case "ArrowLeft":
          e.preventDefault();
          store.seek(e.shiftKey ? -1 : -5, true);
          store.addToast("快退", e.shiftKey ? "1s" : "5s", "info");
          break;

        case "ArrowRight":
          e.preventDefault();
          store.seek(e.shiftKey ? 1 : 5, true);
          store.addToast("快进", e.shiftKey ? "1s" : "5s", "info");
          break;

        case "ArrowUp":
          e.preventDefault();
          store.setVolume(store.volume + 5);
          break;

        case "ArrowDown":
          e.preventDefault();
          store.setVolume(store.volume - 5);
          break;

        case "KeyM":
          e.preventDefault();
          store.toggleMute();
          break;

        case "KeyF":
          e.preventDefault();
          if (isTauri()) {
            const win = getCurrentWindow();
            const isFull = await win.isFullscreen();
            await win.setFullscreen(!isFull);
          }
          break;

        case "Escape":
          e.preventDefault();
          if (
            store.isPlaylistOpen ||
            store.isTrackPanelOpen ||
            store.isSpeedPanelOpen ||
            store.isVideoAdjustOpen ||
            store.isSettingsOpen
          ) {
            store.togglePlaylist(false);
            store.toggleTrackPanel(false);
            store.toggleSpeedPanel(false);
            store.toggleVideoAdjust(false);
            store.toggleSettings(false);
          } else if (isTauri()) {
            const win = getCurrentWindow();
            if (await win.isFullscreen()) {
              await win.setFullscreen(false);
            }
          }
          break;

        case "BracketLeft": // '[' -> speed -0.1
          e.preventDefault();
          store.setSpeed(Math.max(0.25, store.speed - 0.1));
          break;

        case "BracketRight": // ']' -> speed +0.1
          e.preventDefault();
          store.setSpeed(Math.min(4.0, store.speed + 0.1));
          break;

        case "Backspace": // Reset speed
          e.preventDefault();
          store.setSpeed(1.0);
          break;

        case "KeyS": // Screenshot
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            store.takeScreenshot(true);
          }
          break;

        case "KeyL": // Playlist
          e.preventDefault();
          store.togglePlaylist();
          break;

        case "KeyC": {
          // Cycle subtitles
          e.preventDefault();
          const subTracks = store.tracks.filter((t) => t.type === "sub");
          if (subTracks.length > 0) {
            const currentIdx = subTracks.findIndex((t) => t.id === store.selectedSubTrack);
            const nextIdx = (currentIdx + 1) % (subTracks.length + 1);
            if (nextIdx === subTracks.length) {
              store.setTrack("sid", "no");
              store.addToast("字幕", "已关闭字幕", "info");
            } else {
              const nextSub = subTracks[nextIdx];
              store.setTrack("sid", nextSub.id);
              store.addToast(
                "字幕切换",
                nextSub.title || nextSub.lang || `轨道 ${nextSub.id}`,
                "info"
              );
            }
          }
          break;
        }

        case "KeyV": {
          // Cycle audio
          e.preventDefault();
          const audioTracks = store.tracks.filter((t) => t.type === "audio");
          if (audioTracks.length > 1) {
            const currentIdx = audioTracks.findIndex((t) => t.id === store.selectedAudioTrack);
            const nextIdx = (currentIdx + 1) % audioTracks.length;
            const nextAudio = audioTracks[nextIdx];
            store.setTrack("aid", nextAudio.id);
            store.addToast(
              "音轨切换",
              nextAudio.title || nextAudio.lang || `轨道 ${nextAudio.id}`,
              "info"
            );
          }
          break;
        }

        case "Period": // '.' -> frame step forward
          e.preventDefault();
          store.frameStep(true);
          break;

        case "Comma": // ',' -> frame step backward
          e.preventDefault();
          store.frameStep(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [store]);
}
