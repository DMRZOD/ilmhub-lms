import { describe, expect, it } from "vitest";

import {
  formatCompactCount,
  formatDurationHours,
  formatDurationLabel,
  formatMonthYear,
  formatPriceUsd,
  formatShortDate,
  formatUsd,
  initialsOf,
  isFreePrice,
  lessonMinutesFromSeconds,
} from "./format";

describe("formatPriceUsd", () => {
  it("shows the free label for zero or negative cents", () => {
    expect(formatPriceUsd(0)).toBe("Bepul");
    expect(formatPriceUsd(-100)).toBe("Bepul");
  });

  it("drops decimals for whole-dollar prices", () => {
    expect(formatPriceUsd(1000)).toBe("$10");
    expect(formatPriceUsd(100)).toBe("$1");
  });

  it("keeps two decimals for fractional prices", () => {
    expect(formatPriceUsd(1099)).toBe("$10.99");
    expect(formatPriceUsd(999)).toBe("$9.99");
  });
});

describe("isFreePrice", () => {
  it("treats zero and negative as free", () => {
    expect(isFreePrice(0)).toBe(true);
    expect(isFreePrice(-1)).toBe(true);
    expect(isFreePrice(1)).toBe(false);
  });
});

describe("formatUsd", () => {
  it("always renders a dollar amount with thousands separators", () => {
    expect(formatUsd(0)).toBe("$0");
    expect(formatUsd(1099)).toBe("$10.99");
    expect(formatUsd(150000)).toBe("$1,500");
  });
});

describe("initialsOf", () => {
  it("returns up to two uppercase initials", () => {
    expect(initialsOf("Ali Valiev")).toBe("AV");
    expect(initialsOf("Madina")).toBe("M");
    expect(initialsOf("  john   doe smith")).toBe("JD");
  });
});

describe("formatDurationHours", () => {
  it("rounds minutes to whole hours with a floor of 1", () => {
    expect(formatDurationHours(0)).toBe(1);
    expect(formatDurationHours(30)).toBe(1);
    expect(formatDurationHours(90)).toBe(2);
    expect(formatDurationHours(120)).toBe(2);
  });
});

describe("formatDurationLabel", () => {
  it("formats sub-hour durations in minutes", () => {
    expect(formatDurationLabel(45)).toBe("45 daq");
  });
  it("formats whole and mixed hours", () => {
    expect(formatDurationLabel(60)).toBe("1 soat");
    expect(formatDurationLabel(90)).toBe("1 soat 30 daq");
    expect(formatDurationLabel(125)).toBe("2 soat 5 daq");
  });
});

describe("formatCompactCount", () => {
  it("keeps counts below 1000 verbatim", () => {
    expect(formatCompactCount(0)).toBe("0");
    expect(formatCompactCount(999)).toBe("999");
  });
  it("compacts thousands and trims a trailing .0", () => {
    expect(formatCompactCount(1000)).toBe("1k");
    expect(formatCompactCount(1500)).toBe("1.5k");
    expect(formatCompactCount(2000)).toBe("2k");
  });
});

describe("date formatters", () => {
  // Local-time ISO (no trailing Z) keeps the assertion timezone-independent.
  const iso = "2026-03-15T12:00:00";
  it("formatShortDate renders day, short month and year", () => {
    expect(formatShortDate(iso)).toBe("15 mar 2026");
  });
  it("formatMonthYear renders full month and year", () => {
    expect(formatMonthYear(iso)).toBe("Mart 2026");
  });
});

describe("lessonMinutesFromSeconds", () => {
  it("rounds seconds to whole minutes with a floor of 1", () => {
    expect(lessonMinutesFromSeconds(0)).toBe(1);
    expect(lessonMinutesFromSeconds(30)).toBe(1);
    expect(lessonMinutesFromSeconds(120)).toBe(2);
  });
});
