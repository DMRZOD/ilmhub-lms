import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export type MockWebhookStatus = 'PAID' | 'FAILED';

/**
 * Mock payment-provider callback body. Replaced by real provider
 * payloads (Payme JSON-RPC, Click prepare/complete) in steps 25-27.
 */
export class MockWebhookDto {
  @ApiProperty()
  @IsString()
  orderId!: string;

  @ApiPropertyOptional({ enum: ['PAID', 'FAILED'], default: 'PAID' })
  @IsOptional()
  @IsIn(['PAID', 'FAILED'])
  status: MockWebhookStatus = 'PAID';
}
