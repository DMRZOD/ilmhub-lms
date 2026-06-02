import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type InstructorSort = 'popular' | 'new' | 'rating';

export class ListInstructorsDto extends PageQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ enum: ['popular', 'new', 'rating'], default: 'popular' })
  @IsOptional()
  @IsIn(['popular', 'new', 'rating'])
  sort: InstructorSort = 'popular';
}
