import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodingLanguage } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CodingTestCaseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  input!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  expectedOutput!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  weight?: number;
}

export class UpsertCodingDto {
  @ApiProperty({ enum: CodingLanguage })
  @IsEnum(CodingLanguage)
  language!: CodingLanguage;

  @ApiProperty()
  @IsString()
  @MaxLength(50000)
  starterCode!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50000)
  solutionCode!: string;

  @ApiProperty({ type: [CodingTestCaseDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CodingTestCaseDto)
  tests!: CodingTestCaseDto[];
}
