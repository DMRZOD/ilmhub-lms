import { describe, expect, it } from "vitest";

import { formatTimestamp, isEmptyHtml, stripHtml } from "./utils";

describe("formatTimestamp", () => {
  it("formats under an hour as m:ss", () => {
    expect(formatTimestamp(0)).toBe("0:00");
    expect(formatTimestamp(65)).toBe("1:05");
    expect(formatTimestamp(600)).toBe("10:00");
  });

  it("formats an hour or more as h:mm:ss", () => {
    expect(formatTimestamp(3600)).toBe("1:00:00");
    expect(formatTimestamp(3661)).toBe("1:01:01");
  });

  it("clamps negative input to zero", () => {
    expect(formatTimestamp(-5)).toBe("0:00");
  });
});

describe("stripHtml", () => {
  it("extracts plain text and collapses whitespace", () => {
    expect(stripHtml("<p>Hello   <b>world</b></p>")).toBe("Hello world");
  });
  it("returns an empty string for empty markup", () => {
    expect(stripHtml("<p></p>")).toBe("");
  });
});

describe("isEmptyHtml", () => {
  it("is true for markup with no text", () => {
    expect(isEmptyHtml("<p></p>")).toBe(true);
  });
  it("is false when there is real text", () => {
    expect(isEmptyHtml("<p>note</p>")).toBe(false);
  });
});
