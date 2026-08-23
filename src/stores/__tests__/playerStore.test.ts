import { describe, it, expect, beforeEach } from "vitest";
import { usePlayerStore } from "../playerStore";
import { dispatchMpvEvent, dispatchMpvProperty } from "@/test/mocks/mpvMock";

describe("playerStore - Core State Machine and Invariants", () => {
  beforeEach(() => {
    // Reset store state
    usePlayerStore.setState({
      currentPath: null,
      mediaTitle: "未播放视频",
      currentTime: 0,
      duration: 0,
      percentPos: 0,
      paused: true,
      volume: 80,
      muted: false,
      speed: 1.0,
      hwdec: "auto-safe",
      hwdecCurrent: "auto",
      tracks: [],
      selectedAudioTrack: null,
      selectedSubTrack: null,
      subDelay: 0,
      audioDelay: 0,
      isControlVisible: true,
      activePanel: null,
      isPinned: false,
      isFullscreen: false,
      language: "auto",
      autoFitWindow: true,
      shouldAutoFitOnLoad: false,
      playlist: [],
      currentPlayingIndex: -1,
      history: [],
      toasts: [],
      isMpvReady: false,
    });
  });

  describe("Panel Mutex State Machine (AGENTS.md Section 5.H)", () => {
    it("toggles active panel and enforces exclusivity", () => {
      const store = usePlayerStore.getState();

      expect(usePlayerStore.getState().activePanel).toBeNull();

      // Open track panel
      store.togglePanel("track");
      expect(usePlayerStore.getState().activePanel).toBe("track");

      // Switching to settings closes track and opens settings exclusively
      store.togglePanel("settings");
      expect(usePlayerStore.getState().activePanel).toBe("settings");

      // Toggling the same panel closes it
      store.togglePanel("settings");
      expect(usePlayerStore.getState().activePanel).toBeNull();

      // closeAllPanels closes any open panel
      store.togglePanel("playlist");
      expect(usePlayerStore.getState().activePanel).toBe("playlist");
      store.closeAllPanels();
      expect(usePlayerStore.getState().activePanel).toBeNull();
    });
  });

  describe("Volume & Mute Invariants (AGENTS.md Section 5.H & README)", () => {
    it("automatically sets muted: true when volume is set to 0", async () => {
      const store = usePlayerStore.getState();
      usePlayerStore.setState({ isMpvReady: true, muted: false, volume: 50 });

      await store.setVolume(0);
      expect(usePlayerStore.getState().volume).toBe(0);
      expect(usePlayerStore.getState().muted).toBe(true);
    });

    it("automatically un-mutes when volume is increased above 0 while muted", async () => {
      const store = usePlayerStore.getState();
      usePlayerStore.setState({ isMpvReady: true, muted: true, volume: 0 });

      await store.setVolume(60);
      expect(usePlayerStore.getState().volume).toBe(60);
      expect(usePlayerStore.getState().muted).toBe(false);
    });

    it("supports volume boost up to 150%", async () => {
      const store = usePlayerStore.getState();
      usePlayerStore.setState({ isMpvReady: true, volume: 100 });

      await store.setVolume(150);
      expect(usePlayerStore.getState().volume).toBe(150);

      // Clamp above 150
      await store.setVolume(180);
      expect(usePlayerStore.getState().volume).toBe(150);
    });

    it("toggles mute correctly", async () => {
      const store = usePlayerStore.getState();
      usePlayerStore.setState({ isMpvReady: true, muted: false });

      await store.toggleMute();
      expect(usePlayerStore.getState().muted).toBe(true);

      await store.toggleMute();
      expect(usePlayerStore.getState().muted).toBe(false);
    });
  });

  describe("MPV Handshake & Observer Factory Protection (AGENTS.md Section 5.H)", () => {
    it("does not overwrite persisted volume/mute when isMpvReady is false", () => {
      usePlayerStore.setState({ isMpvReady: false, volume: 45, muted: true });

      // MPV factory default event before handshake
      dispatchMpvProperty("volume", 100);
      dispatchMpvProperty("mute", false);

      expect(usePlayerStore.getState().volume).toBe(45);
      expect(usePlayerStore.getState().muted).toBe(true);
    });

    it("accepts volume/mute events once mpv-ready has arrived", () => {
      usePlayerStore.setState({ isMpvReady: false, volume: 45 });

      // Emit mpv-ready
      dispatchMpvEvent("mpv-ready");
      expect(usePlayerStore.getState().isMpvReady).toBe(true);

      // Now property events are accepted
      dispatchMpvProperty("volume", 75);
      expect(usePlayerStore.getState().volume).toBe(75);

      dispatchMpvProperty("mute", true);
      expect(usePlayerStore.getState().muted).toBe(true);
    });
  });

  describe("Playback Lifecycle & EOF Invariants (AGENTS.md Section 5.G)", () => {
    it("handles eof-reached by cleanly pausing and resetting history position to 0", () => {
      const testPath = "C:\\Videos\\movie.mp4";
      usePlayerStore.setState({
        currentPath: testPath,
        duration: 120,
        currentTime: 119.8,
        paused: false,
        history: [
          {
            id: "1",
            title: "movie.mp4",
            path: testPath,
            lastPosition: 119,
            duration: 120,
            lastPlayedAt: Date.now(),
          },
        ],
      });

      // Dispatch eof-reached
      dispatchMpvProperty("eof-reached", true);

      const state = usePlayerStore.getState();
      expect(state.paused).toBe(true);
      expect(state.currentTime).toBe(120);
      expect(state.percentPos).toBe(100);

      // History timestamp reset to 0 so next replay starts from 00:00
      const historyItem = state.history.find((h) => h.path === testPath);
      expect(historyItem?.lastPosition).toBe(0);
    });

    it("updates currentTime and percentPos on time-pos property change", () => {
      usePlayerStore.setState({ duration: 200, currentTime: 0, percentPos: 0 });

      dispatchMpvProperty("time-pos", 50);

      expect(usePlayerStore.getState().currentTime).toBe(50);
      expect(usePlayerStore.getState().percentPos).toBe(25);
    });
  });

  describe("Playlist Operations (README)", () => {
    it("adds unique files to playlist and ignores duplicates", () => {
      const store = usePlayerStore.getState();

      store.addToPlaylist([
        { path: "C:\\video1.mp4", title: "Video 1" },
        { path: "C:\\video2.mp4", title: "Video 2" },
      ]);

      expect(usePlayerStore.getState().playlist).toHaveLength(2);

      // Add duplicate
      store.addToPlaylist([
        { path: "C:\\video1.mp4", title: "Video 1 duplicate" },
        { path: "C:\\video3.mp4", title: "Video 3" },
      ]);

      expect(usePlayerStore.getState().playlist).toHaveLength(3);
      expect(usePlayerStore.getState().playlist.map((i) => i.path)).toEqual([
        "C:\\video1.mp4",
        "C:\\video2.mp4",
        "C:\\video3.mp4",
      ]);
    });

    it("removes items and clears playlist cleanly", () => {
      const store = usePlayerStore.getState();
      store.addToPlaylist([
        { path: "C:\\v1.mp4", title: "V1" },
        { path: "C:\\v2.mp4", title: "V2" },
      ]);

      const item1 = usePlayerStore.getState().playlist[0];
      store.removeFromPlaylist(item1.id);
      expect(usePlayerStore.getState().playlist).toHaveLength(1);

      store.clearPlaylist();
      expect(usePlayerStore.getState().playlist).toHaveLength(0);
    });
  });

  describe("Toast Notifications", () => {
    it("adds and removes toasts with auto generated IDs", () => {
      const store = usePlayerStore.getState();
      expect(usePlayerStore.getState().toasts).toHaveLength(0);

      store.addToast("Title 1", "Desc 1", "info");
      expect(usePlayerStore.getState().toasts).toHaveLength(1);

      const toastId = usePlayerStore.getState().toasts[0].id;
      expect(usePlayerStore.getState().toasts[0].title).toBe("Title 1");

      store.removeToast(toastId);
      expect(usePlayerStore.getState().toasts).toHaveLength(0);
    });
  });
});
