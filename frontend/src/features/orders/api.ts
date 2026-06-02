import { api } from "@/lib/api-client";
import {
  createOrderResponseSchema,
  myOrdersResponseSchema,
  orderDetailSchema,
  type CreateOrderResponse,
  type MyOrdersResponse,
  type OrderDetail,
  type PaymentProvider,
} from "@/types/api";

export async function createOrder(input: {
  courseIds: string[];
  paymentMethod: PaymentProvider;
}): Promise<CreateOrderResponse> {
  const { data } = await api.post("/orders", input);
  return createOrderResponseSchema.parse(data);
}

export async function fetchOrder(id: string): Promise<OrderDetail> {
  const { data } = await api.get(`/orders/${encodeURIComponent(id)}`);
  return orderDetailSchema.parse(data);
}

export async function fetchMyOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<MyOrdersResponse> {
  const { data } = await api.get("/me/orders", { params });
  return myOrdersResponseSchema.parse(data);
}

/**
 * Dev-only: hit the mock payment webhook that confirms an order.
 * Replaced by real provider callbacks in steps 25-27.
 */
export async function simulatePayment(
  orderId: string,
  provider: PaymentProvider,
): Promise<void> {
  await api.post(`/webhooks/payments/${provider.toLowerCase()}`, { orderId });
}
