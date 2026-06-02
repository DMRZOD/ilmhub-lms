import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export class ListStudentsDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Filter by one of the instructor courses' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
