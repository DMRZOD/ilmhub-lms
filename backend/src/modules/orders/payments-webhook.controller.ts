import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';

import { Public } from '../../common/decorators/public.decorator';
import { OrdersService } from './orders.service';
import { MockWebhookDto } from './dto/mock-webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks/payments')
export class PaymentsWebhookController {
  constructor(private readonly orders: OrdersService) {}

  @Post(':provider')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Mock payment webhook — confirms (PAID) or fails an order. Replaced by real Payme/Click/Uzum callbacks in steps 25-27.',
  })
  handle(@Param('provider') provider: string, @Body() dto: MockWebhookDto) {
    const normalized = provider.toUpperCase();
    if (!isPaymentProvider(normalized)) {
      throw new NotFoundException('unknown_provider');
    }
    return this.orders.handleWebhook(normalized, dto);
  }
}

function isPaymentProvider(value: string): value is PaymentProvider {
  return value === 'PAYME' || value === 'CLICK' || value === 'UZUM';
}
