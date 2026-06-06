import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CodingLanguage } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Only JS/TS exercises can be auto-graded, so authoring is restricted to these. */
const AUTHORABLE_LANGUAGES = [CodingLanguage.JS, CodingLanguage.TS] as const;

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
  @ApiProperty({ enum: AUTHORABLE_LANGUAGES })
  @IsIn(AUTHORABLE_LANGUAGES)
  language!: CodingLanguage;

  @ApiProperty({ description: 'Function the tests call, e.g. "add".' })
  @IsString()
  @MaxLength(120)
  entryFunction!: string;

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
