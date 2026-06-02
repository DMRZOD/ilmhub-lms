import { IsEmail, MaxLength } from 'class-validator';

export class RequestEmailChangeDto {
  @IsEmail()
  @MaxLength(254)
  newEmail!: string;
}
