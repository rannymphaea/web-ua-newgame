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
    @Query('role') role?: string, @Query('status') status?: string,
    @Query('generation') generation?: string,
  ) {
    return this.svc.list({ page: +page, limit: +limit, search, division, role, status, generation });
  }

  @Get('export/csv')
  async exportCsv(
    @Query('division') division?: string,
    @Query('status') status?: string,
    @Query('generation') generation?: string,
  ) {
    return this.svc.exportCsv({ division, status, generation });
  }

  @Get(':uid') getOne(@Param('uid') uid: string) { return this.svc.getOne(uid); }

  @Post()
  create(@Body() dto: CreateMemberDto, @CurrentUser() u: any) { return this.svc.create(dto, u.uid); }

  @Post('import')
  import(@Body() body: { format: 'csv' | 'json'; data: string }, @CurrentUser() u: any) {
    return this.svc.import(body.format, body.data, u.uid);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() dto: UpdateMemberDto, @CurrentUser() u: any) { return this.svc.update(uid, dto, u.uid); }

  @Delete(':uid')
  remove(@Param('uid') uid: string, @CurrentUser() u: any) { return this.svc.remove(uid, u.uid); }
}
