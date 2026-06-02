import { describe, expect, it } from "vitest";

import { formatRelativeTime, initialsOf } from "./utils";

describe("initialsOf", () => {
  it("returns up to two uppercase initials", () => {
    expect(initialsOf("Ali Valiev")).toBe("AV");
    expect(initialsOf("madina")).toBe("M");
    expect(initialsOf("  a b c")).toBe("AB");
  });
});

describe("formatRelativeTime", () => {
  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

  it("says 'hozirgina' for under a minute", () => {
    expect(formatRelativeTime(ago(10 * 1000))).toBe("hozirgina");
  });
  it("counts minutes", () => {
    expect(formatRelativeTime(ago(5 * 60 * 1000))).toBe("5 daqiqa oldin");
  });
  it("counts hours", () => {
    expect(formatRelativeTime(ago(3 * 60 * 60 * 1000))).toBe("3 soat oldin");
  });
  it("counts days", () => {
    expect(formatRelativeTime(ago(2 * 24 * 60 * 60 * 1000))).toBe("2 kun oldin");
  });
});
