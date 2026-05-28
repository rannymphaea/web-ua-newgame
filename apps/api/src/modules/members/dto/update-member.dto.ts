import { IsString, IsEmail, IsOptional, MaxLength, IsIn } from 'class-validator';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  division?: string;

  @IsOptional()
  @IsIn(['member', 'moderator', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  memberId?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
