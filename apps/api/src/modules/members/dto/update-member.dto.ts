import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional() @IsString() @MaxLength(80)
  name?: string;

  @IsOptional() @IsString() @MaxLength(80)
  team?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'AFK', 'RESIGN', 'GLORY', 'NPC'])
  status?: string;
}
