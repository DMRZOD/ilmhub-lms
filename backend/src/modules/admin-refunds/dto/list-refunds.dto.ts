import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { RefundStatus } from '@prisma/client';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type AdminRefundStatusFilter = RefundStatus | 'ALL';

const STATUS_VALUES: AdminRefundStatusFilter[] = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'ALL',
];

export class ListRefundsDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: STATUS_VALUES, default: 'REQUESTED' })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status: AdminRefundStatusFilter = 'REQUESTED';
}
