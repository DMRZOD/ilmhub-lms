import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { InstructorAppStatus } from '@prisma/client';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

const STATUS_VALUES: InstructorAppStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

export class ListInstructorApplicationsDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: STATUS_VALUES })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: InstructorAppStatus;
}
