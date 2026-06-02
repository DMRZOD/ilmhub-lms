import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListNotesDto {
  @ApiPropertyOptional({ description: 'Return my notes for this lesson' })
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional({
    description: 'Return all my notes for this course, with lesson grouping info',
  })
  @IsOptional()
  @IsString()
  courseId?: string;
}
