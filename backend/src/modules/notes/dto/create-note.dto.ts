import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  lessonId!: string;

  @ApiProperty({ description: 'Note body as HTML produced by the rich-text editor' })
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  content!: string;

  @ApiPropertyOptional({ description: 'Video position the note is pinned to' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timestampSeconds?: number;
}
