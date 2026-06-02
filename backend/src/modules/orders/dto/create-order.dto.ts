import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ type: [String], description: 'Course ids to purchase' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  courseIds!: string[];

  @ApiProperty({ enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  paymentMethod!: PaymentProvider;
}
