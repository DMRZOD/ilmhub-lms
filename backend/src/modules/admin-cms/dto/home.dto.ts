import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class HomeHeroDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(600)
  subtitle!: string;

  @IsString()
  @MaxLength(80)
  primaryCtaLabel!: string;

  @IsString()
  @MaxLength(200)
  primaryCtaHref!: string;

  @IsString()
  @MaxLength(80)
  secondaryCtaLabel!: string;

  @IsString()
  @MaxLength(200)
  secondaryCtaHref!: string;
}

export class HomeStatDto {
  @IsInt()
  @Min(0)
  value!: number;

  @IsString()
  @MaxLength(8)
  suffix!: string;

  @IsString()
  @MaxLength(40)
  label!: string;
}

export class UpdateHomeDto {
  @ApiPropertyOptional({ type: HomeHeroDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HomeHeroDto)
  hero?: HomeHeroDto;

  @ApiPropertyOptional({ type: [HomeStatDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => HomeStatDto)
  stats?: HomeStatDto[];
}
