import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { UserRole, UserStatus } from '@prisma/client';

// Admins may only toggle a user between STUDENT and INSTRUCTOR via this endpoint;
// ADMIN can never be assigned here.
const ASSIGNABLE_ROLES: UserRole[] = ['STUDENT', 'INSTRUCTOR'];
const STATUS_VALUES: UserStatus[] = ['ACTIVE', 'SUSPENDED'];

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: ASSIGNABLE_ROLES })
  @IsOptional()
  @IsIn(ASSIGNABLE_ROLES)
  role?: UserRole;

  @ApiPropertyOptional({ enum: STATUS_VALUES })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: UserStatus;
}
