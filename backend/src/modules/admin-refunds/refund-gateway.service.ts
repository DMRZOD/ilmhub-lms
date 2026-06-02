import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { PaymentProvider } from '@prisma/client';

export interface RefundParams {
  orderId: string;
  provider: PaymentProvider;
  amountUsdCents: number;
  externalPaymentId: string | null;
}

/**
 * Issues refunds through the payment provider that processed the original
 * charge. Real Payme/Click/Uzum integrations land here once steps 25–27 are
 * built; for now every provider returns a deterministic mock reference id so
 * the rest of the refund flow (enrollment revocation, notifications, audit) is
 * fully exercised. This is the single seam to wire real gateways into later.
 */
@Injectable()
export class RefundGatewayService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(RefundGatewayService.name);
  }

  async refund(params: RefundParams): Promise<{ externalRefundId: string }> {
    const externalRefundId = `mock_refund_${params.provider}_${params.orderId}`;
    this.logger.info(
      {
        orderId: params.orderId,
        provider: params.provider,
        amountUsdCents: params.amountUsdCents,
        externalRefundId,
      },
      'refund issued (mock gateway)',
    );
    return { externalRefundId };
  }
}
