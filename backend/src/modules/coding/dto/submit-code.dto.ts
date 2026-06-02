import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitCodeDto {
  @ApiProperty({ maxLength: 100_000 })
  @IsString()
  @MaxLength(100_000)
  code!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  solutionViewed?: boolean;
}
