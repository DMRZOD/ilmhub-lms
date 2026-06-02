import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ minLength: 4, maxLength: 240 })
  @IsString()
  @MinLength(4)
  @MaxLength(240)
  question!: string;

  @ApiProperty({ minLength: 2, maxLength: 1200 })
  @IsString()
  @MinLength(2)
  @MaxLength(1200)
  answer!: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
