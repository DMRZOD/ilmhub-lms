import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';

export class VoteAnswerDto {
  @ApiProperty({ enum: [1, -1], description: 'Upvote (1) or downvote (-1)' })
  @Type(() => Number)
  @IsInt()
  @IsIn([1, -1])
  direction!: 1 | -1;
}
