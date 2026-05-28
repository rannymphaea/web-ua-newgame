import { IsString, IsEmail, IsOptional, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMemberDto {
  @IsString() @MaxLength(80)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsOptional() @IsString() @MaxLength(40)
  @Transform(({ value }) => value?.trim().toLowerCase())
  username?: string;

  @IsOptional() @IsString() @MaxLength(60)
  division?: string;

  @IsOptional() @IsIn(['member', 'moderator', 'admin'])
  role?: string;

  @IsOptional() @IsString() @MaxLength(40)
  memberId?: string;

  @IsOptional() @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional() @IsString() @MaxLength(200)
  notes?: string;
}
