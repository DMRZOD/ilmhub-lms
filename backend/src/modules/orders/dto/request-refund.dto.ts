import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RequestRefundDto {
  @ApiProperty({ description: 'Course to request a refund for' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ minLength: 5, maxLength: 1000 })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason!: string;
}
