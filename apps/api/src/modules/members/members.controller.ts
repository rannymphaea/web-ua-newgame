import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { SuperadminGuard } from '../../common/guards/superadmin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
@UseGuards(FirebaseAuthGuard, SuperadminGuard)
export class MembersController {
  constructor(private readonly svc: MembersService) {}

  @Get()
  list(
    @Query('page') page = '1', @Query('limit') limit = '20',
    @Query('search') search?: string, @Query('division') division?: string,
    @Query('status') status?: string, @Query('generation') generation?: string,
  ) {
    return this.svc.list({ page: +page, limit: +limit, search, division, status, generation });
  }

  @Get('export/csv')
  exportCsv(
    @Query('division') division?: string,
    @Query('status')   status?: string,
    @Query('generation') generation?: string,
  ) {
    return this.svc.exportCsv({ division, status, generation });
  }

  @Get(':id') getOne(@Param('id') id: string) { return this.svc.getOne(id); }

  /** POST /members — admin tambah anggota baru (menghasilkan kode akses otomatis) */
  @Post()
  create(@Body() dto: CreateMemberDto, @CurrentUser() u: any) { return this.svc.create(dto, u.uid); }

  /** POST /members/:id/reset-password — generate ulang kode akses untuk anggota belum registrasi */
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @CurrentUser() u: any) { return this.svc.resetPassword(id, u.uid); }

  @Post('import')
  import(@Body() body: { format: 'csv' | 'json'; data: string }, @CurrentUser() u: any) {
    return this.svc.import(body.format, body.data, u.uid);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto, @CurrentUser() u: any) { return this.svc.update(id, dto, u.uid); }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() u: any) { return this.svc.remove(id, u.uid); }
}
