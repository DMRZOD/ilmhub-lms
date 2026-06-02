import { IsString, Matches, MaxLength } from 'class-validator';

export class UpdateAvatarDto {
  @IsString()
  @MaxLength(3_500_000)
  @Matches(/^data:image\/(png|jpe?g|webp);base64,/, {
    message: 'avatarDataUrl must be a data URL with png/jpg/webp content',
  })
  avatarDataUrl!: string;
}
