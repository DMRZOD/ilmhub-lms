import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizQuestionType } from '@prisma/client';
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

export class UpsertQuizDto {
  @ApiProperty({ description: 'Passing score percentage (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore!: number;

  @ApiProperty({ description: 'Attempts allowed (0 = unlimited)' })
  @IsInt()
  @Min(0)
  @Max(100)
  attemptsAllowed!: number;
}

export class QuizOptionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  id!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  text!: string;
}

export class CreateQuizQuestionDto {
  @ApiProperty({ enum: QuizQuestionType })
  @IsEnum(QuizQuestionType)
  type!: QuizQuestionType;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  text!: string;

  @ApiPropertyOptional({ type: [QuizOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options?: QuizOptionDto[];

  @ApiProperty({
    type: [String],
    description:
      'For SINGLE/MULTIPLE: option ids. For TEXT: accepted answer strings.',
  })
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  correctAnswerIds!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;
}

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({ enum: QuizQuestionType })
  @IsOptional()
  @IsEnum(QuizQuestionType)
  type?: QuizQuestionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  @ApiPropertyOptional({ type: [QuizOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options?: QuizOptionDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  correctAnswerIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;
}
