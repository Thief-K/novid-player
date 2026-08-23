import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { VolumeControl } from "../VolumeControl";
import { usePlayerStore } from "@/stores/playerStore";

describe("VolumeControl Component", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      volume: 80,
      muted: false,
    });
  });

  it("renders mute toggle button and responds to clicks", () => {
    const toggleMuteSpy = vi.spyOn(usePlayerStore.getState(), "toggleMute");
    render(<VolumeControl />);

    const muteBtn = screen.getByRole("button");
    expect(muteBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(muteBtn);
    });
    expect(toggleMuteSpy).toHaveBeenCalledTimes(1);
  });

  it("handles slider volume adjustments up to 150%", () => {
    const setVolumeSpy = vi.spyOn(usePlayerStore.getState(), "setVolume");
    const { container } = render(<VolumeControl />);

    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("150");

    act(() => {
      fireEvent.change(slider, { target: { value: "120" } });
    });
    expect(setVolumeSpy).toHaveBeenCalledWith(120);
  });

  it("displays 0% when muted", () => {
    usePlayerStore.setState({ volume: 80, muted: true });
    render(<VolumeControl />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
