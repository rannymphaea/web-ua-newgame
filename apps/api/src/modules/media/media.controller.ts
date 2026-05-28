import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { MediaService, UploadMediaDto } from './media.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('media')
@UseGuards(FirebaseAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  /** Upload a new media file (base64) - authenticated users only */
  @Post('upload')
  async upload(
    @CurrentUser() user: any,
    @Body() body: UploadMediaDto,
  ) {
    return this.mediaService.upload(user.uid, body);
  }

  /** List all media - admin only */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAll(
    @Query('usage') usage?: string,
    @Query('mimeType') mimeType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mediaService.getAll({
      usage,
      mimeType,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /** Update media metadata - admin only */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateMeta(
    @Param('id') id: string,
    @Body() body: { altText?: string; tags?: string[]; usage?: string },
  ) {
    return this.mediaService.updateMeta(id, body);
  }

  /** Delete media - admin only */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
