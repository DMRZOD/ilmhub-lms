import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInstructorApplicationDto {
  @ApiProperty({ minLength: 50, maxLength: 2000 })
  @IsString()
  @MinLength(50)
  @MaxLength(2000)
  bio!: string;

  @ApiProperty({
    type: [String],
    description: 'Expertise area names (selected from categories)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  expertise!: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Social links + portfolio / sample work URLs',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl({}, { each: true })
  links?: string[];
}
