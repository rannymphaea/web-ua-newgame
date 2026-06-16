import { IsString, IsEmail, IsOptional, MaxLength, IsIn, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMemberDto {
  @IsString() @MaxLength(80)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString() @MaxLength(40)
  memberId: string;

  @IsInt() @Min(1)
  memberNo: number;

  @IsOptional()
  @IsIn(['Game Logic', 'Game Design', 'Game Sound', 'GAME_LOGIC', 'GAME_DESIGN', 'GAME_SOUND'])
  pillar?: string;

  @IsOptional()
  @IsIn(['GEN 1', 'GEN 2', 'GEN_1', 'GEN_2'])
  generation?: string;

  @IsOptional() @IsString() @MaxLength(80)
  team?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'AFK', 'RESIGN', 'GLORY', 'NPC'])
  status?: string;

  // Hanya untuk import/manual override — jika tidak diisi, di-generate otomatis
  @IsOptional() @IsString() @MaxLength(100)
  tempPassword?: string;

  // Legacy fields — tidak digunakan tapi dipertahankan untuk kompatibilitas import
  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(60)
  division?: string;
}
