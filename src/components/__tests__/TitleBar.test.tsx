import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { TitleBar } from "../TitleBar";
import { usePlayerStore } from "@/stores/playerStore";
import { mpvService } from "@/services/mpvService";

describe("TitleBar Component (AGENTS.md Section 5.A & 5.B)", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      mediaTitle: "Example Video.mp4",
      currentPath: "C:\\Videos\\Example Video.mp4",
      isControlVisible: true,
      isPinned: false,
    });
  });

  it("renders app title and current media title", () => {
    render(<TitleBar />);

    expect(screen.getByText("NovidPlayer")).toBeInTheDocument();
    expect(screen.getByText("Example Video.mp4")).toBeInTheDocument();
  });

  it("triggers minimize and close actions on button clicks", () => {
    const minimizeSpy = vi.spyOn(mpvService, "minimize").mockResolvedValue();
    const closeSpy = vi.spyOn(mpvService, "close").mockResolvedValue();

    render(<TitleBar />);

    const minBtn = screen.getByTitle(/最小化|Minimize/i);
    const closeBtn = screen.getByTitle(/关闭|Close/i);

    act(() => {
      fireEvent.click(minBtn);
    });
    expect(minimizeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent.click(closeBtn);
    });
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it("toggles settings panel when settings icon clicked", () => {
    const togglePanelSpy = vi.spyOn(usePlayerStore.getState(), "togglePanel");
    render(<TitleBar />);

    const settingsBtn = screen.getByTitle(/设置|Settings/i);
    act(() => {
      fireEvent.click(settingsBtn);
    });

    expect(togglePanelSpy).toHaveBeenCalledWith("settings");
  });
});
