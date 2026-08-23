import { describe, it, expect } from "vitest";
import { formatTime } from "../format";

describe("formatTime utility", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats seconds under a minute with leading zeros", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats minutes and seconds accurately", () => {
    expect(formatTime(60)).toBe("01:00");
    expect(formatTime(125)).toBe("02:05");
    expect(formatTime(3599)).toBe("59:59");
  });

  it("formats hours, minutes and seconds accurately when over 1 hour", () => {
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(3665)).toBe("01:01:05");
    expect(formatTime(86399)).toBe("23:59:59");
    expect(formatTime(360000)).toBe("100:00:00");
  });

  it("handles floating point seconds by flooring them", () => {
    expect(formatTime(65.789)).toBe("01:05");
    expect(formatTime(3600.999)).toBe("01:00:00");
  });

  it("safely handles negative numbers and NaN by returning 00:00", () => {
    expect(formatTime(-10)).toBe("00:00");
    expect(formatTime(-0.5)).toBe("00:00");
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(Infinity)).toBe("00:00"); // NaN or infinite overflow guard
  });
});
