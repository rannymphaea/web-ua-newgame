import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { NewsService, CreateNewsDto, UpdateNewsDto } from './news.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  // ── Public endpoints ─────────────────────────────────

  /** Get published posts (public) */
  @Get('published')
  async getPublished(
    @Query('category') category?: string,
    @Query('tutorialCategory') tutorialCategory?: string,
    @Query('tag') tag?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.newsService.getPublished({
      category,
      tutorialCategory,
      tag,
      featured: featured === 'true',
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  /** Get slider posts (featured, max 10) */
  @Get('slider')
  async getSliderPosts() {
    return this.newsService.getSliderPosts();
  }

  /** Get tutorials grouped by category */
  @Get('tutorials')
  async getTutorials() {
    return this.newsService.getTutorials();
  }

  /** Get single post by ID or slug */
  @Get(':idOrSlug')
  async getOne(@Param('idOrSlug') idOrSlug: string) {
    return this.newsService.getOne(idOrSlug);
  }

  // ── Admin endpoints ──────────────────────────────────

  /** Get all posts (admin - includes draft/archived) */
  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async getAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    return this.newsService.getAll({
      status,
      category,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /** Create a new post */
  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @CurrentUser() user: any,
    @Body() body: CreateNewsDto,
  ) {
    return this.newsService.create(user.uid, user.name || user.email, body);
  }

  /** Update a post */
  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateNewsDto,
  ) {
    return this.newsService.update(id, body);
  }

  /** Archive a post */
  @Patch(':id/archive')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async archive(@Param('id') id: string) {
    return this.newsService.archive(id);
  }

  /** Restore an archived post */
  @Patch(':id/restore')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async restore(@Param('id') id: string) {
    return this.newsService.restore(id);
  }

  /** Delete a post permanently */
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
