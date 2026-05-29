import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService, UploadMediaDto, AvatarKey } from './media.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

@Controller('media')
@UseGuards(FirebaseAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  /** POST /api/media/upload — upload base64 (authenticated) */
  @Post('upload')
  async upload(
    @CurrentUser() user: any,
    @Body() body: UploadMediaDto,
  ) {
    return this.mediaService.upload(user.uid, body);
  }

  /**
   * POST /api/media/upload-profile — upload foto profil multipart (authenticated)
   * Never throws 500. On failure returns:
   *   { "profile_upload": "failed", "error": "unknown_system_error" }
   */
  @Post('upload-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException(`Tipe file tidak diizinkan: ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfile(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File wajib diupload');
    // Service handles retry internally — never throws on upload failure
    return this.mediaService.uploadProfile(user.uid, file, 'avatar');
  }

  /** GET /api/media/avatar — daftar avatar tersedia
   *  Response: { "avatar_list": ["default","neko","chibi","yua"] }
   */
  @Get('avatar')
  getAvatarList() {
    return this.mediaService.getAvatarList();
  }

  /** POST /api/media/avatar/select — pilih avatar aktif
   *  Body: { "avatar": "yua" }
   *  Response: { status, avatar, animation, sfx, profile_upload }
   */
  @Post('avatar/select')
  async selectAvatar(
    @CurrentUser() user: any,
    @Body('avatar') avatar: AvatarKey,
  ) {
    if (!avatar) throw new BadRequestException('Field "avatar" wajib diisi');
    return this.mediaService.selectAvatar(user.uid, avatar);
  }

  /** GET /api/media — list semua media (admin only) */
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
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** PATCH /api/media/:id — update metadata (admin only) */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateMeta(
    @Param('id') id: string,
    @Body() body: { altText?: string; tags?: string[]; usage?: string },
  ) {
    return this.mediaService.updateMeta(id, body);
  }

  /** DELETE /api/media/:id — hapus media (admin only) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
