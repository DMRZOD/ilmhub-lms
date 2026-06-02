import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CourseCard as CourseCardType } from "@/types/api";
import { CourseCard } from "./course-card";

function makeCourse(overrides: Partial<CourseCardType> = {}): CourseCardType {
  return {
    id: "c1",
    slug: "react-asoslari",
    title: "React asoslari",
    subtitle: "Komponentlar va hooklar",
    thumbnailUrl: "https://example.com/thumb.jpg",
    level: "BEGINNER",
    language: "UZ",
    priceUsdCents: 4999,
    discountUsdCents: null,
    durationMinutes: 600,
    lessonsCount: 24,
    studentsCount: 1200,
    ratingAvg: 4.5,
    ratingCount: 320,
    publishedAt: "2026-01-01T00:00:00.000Z",
    instructor: { id: "u1", name: "Ali Valiev", avatarUrl: null },
    category: { id: "cat1", slug: "programming", name: "Dasturlash" },
    ...overrides,
  };
}

describe("CourseCard", () => {
  it("renders the core course info and links to the detail page", () => {
    render(<CourseCard course={makeCourse()} />);
    expect(screen.getByText("React asoslari")).toBeInTheDocument();
    expect(screen.getByText("Ali Valiev")).toBeInTheDocument();
    expect(screen.getByText("Dasturlash")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "React asoslari" }),
    ).toHaveAttribute("href", "/courses/react-asoslari");
  });

  it("shows the free label and CTA for free courses", () => {
    render(<CourseCard course={makeCourse({ priceUsdCents: 0 })} />);
    expect(screen.getByText("Bepul")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Bepul boshlash" }),
    ).toBeInTheDocument();
  });

  it("renders progress and a resume CTA in the enrolled variant", () => {
    render(
      <CourseCard course={makeCourse()} variant="enrolled" progressPercent={40} />,
    );
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Davom etish" }),
    ).toBeInTheDocument();
    // The price block is replaced by the lessons count in this variant.
    expect(screen.queryByText("$49.99")).not.toBeInTheDocument();
  });

  it("fires onToggleFavorite when the heart is clicked", async () => {
    const onToggleFavorite = vi.fn();
    render(
      <CourseCard course={makeCourse()} onToggleFavorite={onToggleFavorite} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Sevimlilarga qo'shish" }),
    );
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
