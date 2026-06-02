import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type ReviewSort = 'newest' | 'oldest' | 'highest' | 'lowest';

const SORT_VALUES: ReviewSort[] = ['newest', 'oldest', 'highest', 'lowest'];

export class ListReviewsDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Filter by one of the instructor courses' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filter by reply status (replied / not replied)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  replied?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'newest' })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort: ReviewSort = 'newest';
}
