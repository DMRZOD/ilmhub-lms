import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateNoteDto {
  @ApiPropertyOptional({ description: 'Note body as HTML produced by the rich-text editor' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  content?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Set to a number to (re)pin to a timestamp, or null to unlink',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  timestampSeconds?: number | null;
}
