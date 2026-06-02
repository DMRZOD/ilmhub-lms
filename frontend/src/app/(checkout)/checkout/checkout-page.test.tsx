import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type CartItem, useCartStore } from "@/features/cart/store";

// Decouple the page from its data hooks.
const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  viewer: { current: undefined as { id: string } | undefined },
}));

vi.mock("@/features/auth/hooks", () => ({
  useAuth: () => ({ data: mocks.viewer.current }),
}));

vi.mock("@/features/orders/hooks", () => ({
  useCreateOrder: () => ({ mutate: mocks.mutate, isPending: false }),
}));

import CheckoutPage from "./page";

function seedCart(items: CartItem[]) {
  useCartStore.setState({ items });
}

const courseA: CartItem = {
  id: "c1",
  slug: "react",
  title: "React asoslari",
  thumbnailUrl: null,
  instructorName: "Ali",
  priceUsdCents: 5000,
  discountUsdCents: 3000,
};
const courseB: CartItem = {
  id: "c2",
  slug: "node",
  title: "Node.js",
  thumbnailUrl: null,
  instructorName: "Vali",
  priceUsdCents: 4000,
  discountUsdCents: null,
};

describe("CheckoutPage", () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
    mocks.viewer.current = undefined;
    useCartStore.setState({ items: [] });
  });

  it("shows the empty state when the cart is empty", () => {
    seedCart([]);
    render(<CheckoutPage />);
    expect(screen.getByText("Savatingiz bo'sh")).toBeInTheDocument();
  });

  it("lists cart items, payment methods and the discounted total", () => {
    seedCart([courseA, courseB]);
    render(<CheckoutPage />);
    expect(screen.getByText("React asoslari")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("Payme")).toBeInTheDocument();
    expect(screen.getByText("Click")).toBeInTheDocument();
    // total = effective(3000) + effective(4000) = 7000c => "$70"
    expect(screen.getAllByText("$70").length).toBeGreaterThan(0);
  });

  it("removes an item from the cart", async () => {
    seedCart([courseA, courseB]);
    render(<CheckoutPage />);
    const removeButtons = screen.getAllByRole("button", {
      name: "Savatdan olib tashlash",
    });
    await userEvent.click(removeButtons[0]);
    expect(screen.queryByText("React asoslari")).not.toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });

  it("does not create an order when the user is signed out", async () => {
    mocks.viewer.current = undefined;
    seedCart([courseA]);
    render(<CheckoutPage />);
    await userEvent.click(screen.getByRole("button", { name: "To'lash" }));
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("creates an order with the cart course ids when signed in", async () => {
    mocks.viewer.current = { id: "u1" };
    seedCart([courseA, courseB]);
    render(<CheckoutPage />);
    await userEvent.click(screen.getByRole("button", { name: "To'lash" }));
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate.mock.calls[0][0]).toEqual({
      courseIds: ["c1", "c2"],
      paymentMethod: "PAYME",
    });
  });
});
