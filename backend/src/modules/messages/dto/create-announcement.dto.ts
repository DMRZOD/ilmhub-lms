import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementAudience } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Course whose students receive the announcement' })
  @IsString()
  courseId!: string;

  @ApiProperty({ enum: AnnouncementAudience })
  @IsEnum(AnnouncementAudience)
  audience!: AnnouncementAudience;

  @ApiPropertyOptional({
    type: [String],
    description: 'Recipient user ids (required for ONE / SELECTED)',
  })
  @ValidateIf((o: CreateAnnouncementDto) => o.audience !== AnnouncementAudience.ALL)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds?: string[];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}
