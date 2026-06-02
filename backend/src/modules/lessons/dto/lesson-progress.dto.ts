import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class LessonProgressDto {
  @ApiProperty({ description: 'Current playback position in seconds' })
  @IsInt()
  @Min(0)
  positionSeconds!: number;

  @ApiPropertyOptional({
    description: 'Mark this lesson as completed (mutually idempotent)',
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
