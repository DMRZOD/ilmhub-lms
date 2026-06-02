import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { PageQueryDto } from '../../../common/dto/pagination.dto';

export type QuestionSort = 'newest' | 'popular' | 'unresolved';

const toBoolean = ({ value }: { value: unknown }): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === '1';
};

export class ListQuestionsDto extends PageQueryDto {
  @ApiPropertyOptional()
  @IsString()
  courseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional({
    enum: ['newest', 'popular', 'unresolved'],
    default: 'newest',
  })
  @IsOptional()
  @IsIn(['newest', 'popular', 'unresolved'])
  sort: QuestionSort = 'newest';

  @ApiPropertyOptional({ description: 'Only questions authored by the current user' })
  @IsOptional()
  @Transform(toBoolean)
  mine?: boolean;

  @ApiPropertyOptional({ description: 'Only questions that have an instructor answer' })
  @IsOptional()
  @Transform(toBoolean)
  instructorAnswered?: boolean;
}
