import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UserRole, UserStatus } from '@prisma/client';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

const ROLE_VALUES: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
const STATUS_VALUES: UserStatus[] = ['ACTIVE', 'SUSPENDED'];

export type UserSort = 'newest' | 'oldest' | 'name' | 'lastLogin';
const SORT_VALUES: UserSort[] = ['newest', 'oldest', 'name', 'lastLogin'];

export class ListUsersDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ enum: ROLE_VALUES })
  @IsOptional()
  @IsIn(ROLE_VALUES)
  role?: UserRole;

  @ApiPropertyOptional({ enum: STATUS_VALUES })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: SORT_VALUES, default: 'newest' })
  @IsOptional()
  @IsIn(SORT_VALUES)
  sort: UserSort = 'newest';
}
