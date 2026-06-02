import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type AdminInstructorSort = 'name' | 'students' | 'revenue';
const SORT_VALUES: AdminInstructorSort[] = ['name', 'students', 'revenue'];

export class ListAdminInstructorsDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'name' })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort: AdminInstructorSort = 'name';
}
