import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNewCourses?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNewLessons?: boolean;

  @IsOptional()
  @IsBoolean()
  emailQaReplies?: boolean;

  @IsOptional()
  @IsBoolean()
  emailReviewReplies?: boolean;

  @IsOptional()
  @IsBoolean()
  emailWeeklyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPromo?: boolean;
}
