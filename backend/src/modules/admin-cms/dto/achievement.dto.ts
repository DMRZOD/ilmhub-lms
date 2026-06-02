import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty({ minLength: 2, maxLength: 60, description: 'Unique code' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  code!: string;

  @ApiProperty({ minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ minLength: 2, maxLength: 280 })
  @IsString()
  @MinLength(2)
  @MaxLength(280)
  description!: string;

  @ApiPropertyOptional({ description: 'Lucide icon name' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  iconName?: string;

  @ApiPropertyOptional({ description: 'Arbitrary unlock criteria (JSON)' })
  @IsOptional()
  @IsObject()
  criteria?: Record<string, unknown>;
}

export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {}
