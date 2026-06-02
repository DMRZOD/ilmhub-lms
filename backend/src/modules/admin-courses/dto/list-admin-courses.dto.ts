import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CourseStatus } from '@prisma/client';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

// Drafts never reach moderation, so they are not selectable; "ALL" therefore
// means every course that has entered the review pipeline (i.e. not DRAFT).
export type AdminCourseStatusFilter =
  | Exclude<CourseStatus, 'DRAFT'>
  | 'ALL';

const STATUS_VALUES: AdminCourseStatusFilter[] = [
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
  'ALL',
];

export class ListAdminCoursesDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: STATUS_VALUES, default: 'PENDING_REVIEW' })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status: AdminCourseStatusFilter = 'PENDING_REVIEW';

  @ApiPropertyOptional({ description: 'Search by course title' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
