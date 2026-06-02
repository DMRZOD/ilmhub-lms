import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EmailUsersDto {
  @ApiProperty({ type: [String], description: 'Recipient user ids' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsString({ each: true })
  userIds!: string[];

  @ApiProperty({ minLength: 3, maxLength: 200 })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @ApiProperty({ minLength: 3, maxLength: 5000 })
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  body!: string;
}
