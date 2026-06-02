import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type ReviewSort = 'helpful' | 'newest' | 'oldest' | 'highest' | 'lowest';

const SORT_VALUES: ReviewSort[] = [
  'helpful',
  'newest',
  'oldest',
  'highest',
  'lowest',
];

export class ListReviewsDto extends PageQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
    description: 'Minimum rating filter (e.g. 4 keeps 4★ and 5★)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'helpful' })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort: ReviewSort = 'helpful';
}
