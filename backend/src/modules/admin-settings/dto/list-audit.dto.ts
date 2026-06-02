import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export class ListAuditDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Filter by action, e.g. BLOG_PUBLISHED' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by target type, e.g. BLOG_POST' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  targetType?: string;
}
