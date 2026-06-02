"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ordersKeys } from "@/lib/query-keys";
import type { OrderDetail, PaymentProvider } from "@/types/api";

import { createOrder, fetchMyOrders, fetchOrder, simulatePayment } from "./api";

export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ordersKeys.detail(id ?? "none"),
    queryFn: () => fetchOrder(id as string),
    enabled: Boolean(id),
    staleTime: 0,
    // Poll while the order is awaiting payment confirmation.
    refetchInterval: (query) =>
      (query.state.data as OrderDetail | undefined)?.status === "PENDING"
        ? 2000
        : false,
  });
}

export function useMyOrders(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ordersKeys.list(params ?? {}),
    queryFn: () => fetchMyOrders(params),
    staleTime: 30 * 1000,
  });
}

export function useSimulatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      provider,
    }: {
      orderId: string;
      provider: PaymentProvider;
    }) => simulatePayment(orderId, provider),
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ordersKeys.detail(orderId) });
    },
  });
}
