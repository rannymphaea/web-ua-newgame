import { Controller, Post, Get, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { SuperadminGuard } from '../../common/guards/superadmin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('import')
@UseGuards(FirebaseAuthGuard, SuperadminGuard)
export class ImportController {
  constructor(private readonly svc: ImportService) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: any,
    @Query('dryRun') dryRun: string,
    @CurrentUser() user: any,
  ) {
    if (!file) return { ok: false, error: 'No file uploaded' };
    if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'File too large (max 5MB)' };
    const rows = this.svc.parseCSV(file.buffer);
    return this.svc.importRows(rows, user.uid, dryRun === 'true');
  }

  @Get('last-summary')
  lastSummary() { return this.svc.getLastImportSummary(); }
}
