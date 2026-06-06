import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class StartWithInstructorDto {
  @ApiProperty({ description: 'Instructor to start a conversation with' })
  @IsString()
  instructorId!: string;

  @ApiPropertyOptional({ description: 'Optional first message' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;
}
