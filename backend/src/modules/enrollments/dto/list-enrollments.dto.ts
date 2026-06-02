import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type EnrollmentStatusFilter =
  | 'all'
  | 'inProgress'
  | 'completed'
  | 'notStarted';

export type EnrollmentSort = 'recent' | 'enrolled' | 'progress';

const STATUS_VALUES: EnrollmentStatusFilter[] = [
  'all',
  'inProgress',
  'completed',
  'notStarted',
];

const SORT_VALUES: EnrollmentSort[] = ['recent', 'enrolled', 'progress'];

export class ListEnrollmentsDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: STATUS_VALUES, default: 'all' })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status: EnrollmentStatusFilter = 'all';

  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'recent' })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort: EnrollmentSort = 'recent';
}
