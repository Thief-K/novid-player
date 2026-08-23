import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "../useKeyboardShortcuts";
import { usePlayerStore } from "@/stores/playerStore";

describe("useKeyboardShortcuts Hook (README.md Keybindings)", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      paused: true,
      volume: 80,
      speed: 1.0,
      activePanel: null,
      tracks: [],
    });
  });

  it("handles Space key to toggle play/pause", () => {
    const toggleSpy = vi.spyOn(usePlayerStore.getState(), "togglePlayPause");
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    });

    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });

  it("handles ArrowLeft and ArrowRight for seek (5s normal, 1s with Shift)", () => {
    const seekSpy = vi.spyOn(usePlayerStore.getState(), "seek");
    renderHook(() => useKeyboardShortcuts());

    // Normal right seek -> +5s
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", shiftKey: false }));
    });
    expect(seekSpy).toHaveBeenCalledWith(5, true);

    // Shift left seek -> -1s
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft", shiftKey: true }));
    });
    expect(seekSpy).toHaveBeenCalledWith(-1, true);
  });

  it("handles ArrowUp and ArrowDown for volume adjustment", () => {
    const setVolumeSpy = vi.spyOn(usePlayerStore.getState(), "setVolume");
    renderHook(() => useKeyboardShortcuts());

    // 80 -> 85
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
    });
    expect(setVolumeSpy).toHaveBeenLastCalledWith(85);

    // 85 -> 80
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
    });
    expect(setVolumeSpy).toHaveBeenLastCalledWith(80);
  });

  it("handles M key for toggle mute", () => {
    const toggleMuteSpy = vi.spyOn(usePlayerStore.getState(), "toggleMute");
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyM" }));
    });
    expect(toggleMuteSpy).toHaveBeenCalledTimes(1);
  });

  it("handles BracketLeft, BracketRight and Backspace for speed adjustment", () => {
    const setSpeedSpy = vi.spyOn(usePlayerStore.getState(), "setSpeed");
    renderHook(() => useKeyboardShortcuts());

    // 1.0 -> 1.1
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "BracketRight" }));
    });
    expect(setSpeedSpy).toHaveBeenLastCalledWith(1.1);

    // 1.1 -> 1.0
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "BracketLeft" }));
    });
    expect(setSpeedSpy).toHaveBeenLastCalledWith(1.0);

    // Backspace -> 1.0
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Backspace" }));
    });
    expect(setSpeedSpy).toHaveBeenLastCalledWith(1.0);
  });

  it("handles KeyL to toggle playlist panel", () => {
    const togglePanelSpy = vi.spyOn(usePlayerStore.getState(), "togglePanel");
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyL" }));
    });
    expect(togglePanelSpy).toHaveBeenCalledWith("playlist");
  });

  it("handles Escape to close active panel if one is open", () => {
    usePlayerStore.setState({ activePanel: "settings" });
    const closeAllPanelsSpy = vi.spyOn(usePlayerStore.getState(), "closeAllPanels");
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    });
    expect(closeAllPanelsSpy).toHaveBeenCalledTimes(1);
  });

  it("ignores key events when typing inside an input element", () => {
    const toggleSpy = vi.spyOn(usePlayerStore.getState(), "togglePlayPause");
    renderHook(() => useKeyboardShortcuts());

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    act(() => {
      const event = new KeyboardEvent("keydown", { code: "Space", bubbles: true });
      input.dispatchEvent(event);
    });

    expect(toggleSpy).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
