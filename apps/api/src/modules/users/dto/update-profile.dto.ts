import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[a-z0-9_.-]*$/, { message: 'username: hanya huruf kecil, angka, _ . -' })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoURL?: string;
}
