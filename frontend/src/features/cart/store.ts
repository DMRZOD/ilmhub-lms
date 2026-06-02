"use client";

import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName: string | null;
  priceUsdCents: number;
  discountUsdCents: number | null;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().items.some((i) => i.id === item.id)) return;
        set({ items: [...get().items, item] });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: "ilmhub-cart" },
  ),
);

/** Price actually charged for a cart item (discount wins when lower). */
export function effectiveCents(item: {
  priceUsdCents: number;
  discountUsdCents: number | null;
}): number {
  if (
    item.discountUsdCents != null &&
    item.discountUsdCents < item.priceUsdCents
  ) {
    return item.discountUsdCents;
  }
  return item.priceUsdCents;
}

export function useCartItems(): CartItem[] {
  return useCartStore((s) => s.items);
}

export function useIsInCart(id: string): boolean {
  return useCartStore((s) => s.items.some((i) => i.id === id));
}

/**
 * Persisted state only exists on the client. During SSR and the first client
 * render the store is empty, so anything that renders a count (e.g. the header
 * badge) must wait for hydration to avoid a server/client mismatch.
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated());
    const unsub = useCartStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);
  return hydrated;
}

export function useCartCount(): number {
  const count = useCartStore((s) => s.items.length);
  const hydrated = useHasHydrated();
  return hydrated ? count : 0;
}
