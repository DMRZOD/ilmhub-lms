import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class StartConversationDto {
  @ApiProperty({ description: 'Student to start a conversation with' })
  @IsString()
  studentId!: string;

  @ApiPropertyOptional({ description: 'Optional first message' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;
}
