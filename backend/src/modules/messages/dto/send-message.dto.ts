import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Message body' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}
