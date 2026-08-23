import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ProgressBar } from "../ProgressBar";
import { usePlayerStore } from "@/stores/playerStore";

describe("ProgressBar Component", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTime: 30,
      duration: 120,
      bufferPercent: 50,
    });
  });

  it("renders progress bar with correct played progress width", () => {
    const { container } = render(<ProgressBar />);

    // Duration = 120, currentTime = 30 -> 25%
    const playedBar = container.querySelector(
      ".bg-gradient-to-r.from-sky-500.via-sky-400.to-indigo-400"
    ) as HTMLElement;
    expect(playedBar).toBeInTheDocument();
    expect(playedBar.style.width).toBe("25%");
  });

  it("renders buffer progress width accurately", () => {
    const { container } = render(<ProgressBar />);

    const bufferBar = container.querySelector(".bg-slate-600\\/40") as HTMLElement;
    expect(bufferBar).toBeInTheDocument();
    expect(bufferBar.style.width).toBe("50%");
  });

  it("calls seek on mouse down", () => {
    const seekSpy = vi.spyOn(usePlayerStore.getState(), "seek");
    const { container } = render(<ProgressBar />);

    const trackContainer = container.firstElementChild as HTMLElement;
    expect(trackContainer).toBeInTheDocument();

    // Mock getBoundingClientRect
    const barEl = container.querySelector(".rounded-full.bg-slate-800\\/80") as HTMLElement;
    vi.spyOn(barEl, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      right: 200,
      bottom: 10,
      width: 200,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseDown(trackContainer, { clientX: 100 });

    // ClientX 100 on width 200 is 50%, 50% of 120s is 60s
    expect(seekSpy).toHaveBeenCalledWith(60);
  });
});
