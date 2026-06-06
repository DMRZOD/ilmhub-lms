import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class LessonProgressDto {
  @ApiPropertyOptional({
    description:
      'Current playback position in seconds. Omit for a completion-only ' +
      'toggle (e.g. from the curriculum sidebar) so the saved position is kept.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  positionSeconds?: number;

  @ApiPropertyOptional({
    description:
      'Mark this lesson completed (true) or clear completion (false). ' +
      'Omit to leave completion unchanged.',
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
