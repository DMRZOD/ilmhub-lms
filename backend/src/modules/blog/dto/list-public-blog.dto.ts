import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export class ListPublicBlogDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Search by title or excerpt' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by blog category slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
