import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { BlogPostStatus } from '@prisma/client';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

const STATUS_VALUES: BlogPostStatus[] = ['DRAFT', 'PUBLISHED'];

export class ListBlogDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Search by title or excerpt' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  q?: string;

  @ApiPropertyOptional({ enum: STATUS_VALUES })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: BlogPostStatus;

  @ApiPropertyOptional({ description: 'Filter by blog category id' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
