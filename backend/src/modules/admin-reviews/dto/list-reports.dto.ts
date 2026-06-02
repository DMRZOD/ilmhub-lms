import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { ReviewReportStatus } from '@prisma/client';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type AdminReportStatusFilter = ReviewReportStatus | 'ALL';

const STATUS_VALUES: AdminReportStatusFilter[] = [
  'PENDING',
  'DISMISSED',
  'RESOLVED',
  'ALL',
];

export class ListReportsDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: STATUS_VALUES, default: 'PENDING' })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status: AdminReportStatusFilter = 'PENDING';
}
