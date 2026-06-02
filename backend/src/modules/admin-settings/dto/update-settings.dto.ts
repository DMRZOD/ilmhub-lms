import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class EmailSenderDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(180)
  address!: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    minimum: 0,
    maximum: 1,
    description: 'Platform commission as a fraction (0.1 = 10%)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ type: EmailSenderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSenderDto)
  emailSender?: EmailSenderDto;
}
