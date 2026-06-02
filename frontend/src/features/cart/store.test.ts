import { beforeEach, describe, expect, it } from "vitest";

import { type CartItem, effectiveCents, useCartStore } from "./store";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "c1",
    slug: "course-1",
    title: "Course 1",
    thumbnailUrl: null,
    instructorName: "Ali",
    priceUsdCents: 5000,
    discountUsdCents: null,
    ...overrides,
  };
}

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds an item", () => {
    useCartStore.getState().add(item());
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("does not add the same course twice", () => {
    useCartStore.getState().add(item({ id: "c1" }));
    useCartStore.getState().add(item({ id: "c1" }));
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("removes an item by id", () => {
    useCartStore.getState().add(item({ id: "c1" }));
    useCartStore.getState().add(item({ id: "c2" }));
    useCartStore.getState().remove("c1");
    expect(useCartStore.getState().items.map((i) => i.id)).toEqual(["c2"]);
  });

  it("clears the cart", () => {
    useCartStore.getState().add(item({ id: "c1" }));
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe("effectiveCents", () => {
  it("uses the discount when it is lower than the price", () => {
    expect(effectiveCents({ priceUsdCents: 5000, discountUsdCents: 3000 })).toBe(3000);
  });
  it("ignores a null or non-lower discount", () => {
    expect(effectiveCents({ priceUsdCents: 5000, discountUsdCents: null })).toBe(5000);
    expect(effectiveCents({ priceUsdCents: 5000, discountUsdCents: 6000 })).toBe(5000);
  });
});
