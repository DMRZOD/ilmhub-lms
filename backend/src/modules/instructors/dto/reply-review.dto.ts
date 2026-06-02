import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyReviewDto {
  @ApiProperty({ description: 'Instructor reply to the review' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  comment!: string;
}
