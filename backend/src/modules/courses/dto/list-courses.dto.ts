import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLanguage, CourseLevel } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';
import { toArray } from '../../../common/transforms/to-array';

export type CourseSort =
  | 'popular'
  | 'new'
  | 'rating'
  | 'price-asc'
  | 'price-desc';

export class ListCoursesDto extends PageQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ enum: CourseLevel, isArray: true })
  @IsOptional()
  @Transform(toArray)
  @IsEnum(CourseLevel, { each: true })
  level?: CourseLevel[];

  @ApiPropertyOptional({ enum: CourseLanguage, isArray: true })
  @IsOptional()
  @Transform(toArray)
  @IsEnum(CourseLanguage, { each: true })
  language?: CourseLanguage[];

  @ApiPropertyOptional({ minimum: 0, description: 'USD cents' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'USD cents' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDuration?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDuration?: number;

  @ApiPropertyOptional({
    enum: ['popular', 'new', 'rating', 'price-asc', 'price-desc'],
    default: 'popular',
  })
  @IsOptional()
  @IsIn(['popular', 'new', 'rating', 'price-asc', 'price-desc'])
  sort: CourseSort = 'popular';
}
