import { describe, expect, it } from "vitest";

import { type CourseFilters, mapFiltersToApi, PAGE_SIZE } from "./courses-filter";

const emptyFilters: CourseFilters = {
  q: "",
  categorySlug: null,
  level: null,
  price: [],
  rating: null,
  duration: [],
  languages: [],
};

describe("mapFiltersToApi", () => {
  it("emits only paging + sort when nothing is selected", () => {
    expect(mapFiltersToApi(emptyFilters, "popular", 1)).toEqual({
      page: 1,
      limit: PAGE_SIZE,
      sort: "popular",
    });
  });

  it("trims the search query and drops it when blank", () => {
    expect(mapFiltersToApi({ ...emptyFilters, q: "  react  " }, "new", 2).search).toBe(
      "react",
    );
    expect(
      mapFiltersToApi({ ...emptyFilters, q: "   " }, "new", 2).search,
    ).toBeUndefined();
  });

  it("wraps the single level in an array", () => {
    expect(
      mapFiltersToApi({ ...emptyFilters, level: "BEGINNER" }, "popular", 1).level,
    ).toEqual(["BEGINNER"]);
  });

  it("passes selected languages through", () => {
    expect(
      mapFiltersToApi({ ...emptyFilters, languages: ["UZ", "EN"] }, "popular", 1)
        .language,
    ).toEqual(["UZ", "EN"]);
  });

  it("maps the free price bucket to min/max 0", () => {
    const out = mapFiltersToApi({ ...emptyFilters, price: ["free"] }, "popular", 1);
    expect(out.minPrice).toBe(0);
    expect(out.maxPrice).toBe(0);
  });

  it("omits maxPrice for an open-ended price bucket", () => {
    const out = mapFiltersToApi({ ...emptyFilters, price: ["100+"] }, "popular", 1);
    expect(out.minPrice).toBe(10001);
    expect(out.maxPrice).toBeUndefined();
  });

  it("combines multiple price buckets into a min..max span", () => {
    const out = mapFiltersToApi(
      { ...emptyFilters, price: ["0-50", "50-100"] },
      "popular",
      1,
    );
    expect(out.minPrice).toBe(1);
    expect(out.maxPrice).toBe(10000);
  });

  it("maps a duration bucket to minutes", () => {
    const out = mapFiltersToApi({ ...emptyFilters, duration: ["0-5"] }, "popular", 1);
    expect(out.minDuration).toBe(0);
    expect(out.maxDuration).toBe(300);
  });

  it("forwards the rating floor", () => {
    expect(
      mapFiltersToApi({ ...emptyFilters, rating: 4 }, "popular", 1).minRating,
    ).toBe(4);
  });

  it("lets a locked category slug win over the filter value", () => {
    const out = mapFiltersToApi(
      { ...emptyFilters, categorySlug: "design" },
      "popular",
      1,
      PAGE_SIZE,
      "programming",
    );
    expect(out.categorySlug).toBe("programming");
  });
});
