import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformContentService } from './platform-content.service';
import { PlatformContentEntity, ContentType } from './entities/platform-content.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user.enum';

@Controller('platform-content')
export class PlatformContentController {
  constructor(private readonly contentService: PlatformContentService) {}

  @Get('collections')
  async getCollections(): Promise<PlatformContentEntity[]> {
    return this.contentService.getCollections();
  }

  @Get('banners')
  async getBanners(): Promise<PlatformContentEntity[]> {
    return this.contentService.getBanners();
  }

  @Get('ad-cards')
  async getAdCards(): Promise<PlatformContentEntity[]> {
    return this.contentService.getAdCards();
  }

  @Get('by-type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  async getAllByType(@Query('type') type: ContentType): Promise<PlatformContentEntity[]> {
    return this.contentService.findAllByType(type);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  async getById(@Param('id') id: string): Promise<PlatformContentEntity> {
    return this.contentService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() data: Partial<PlatformContentEntity>): Promise<PlatformContentEntity> {
    return this.contentService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() data: Partial<PlatformContentEntity>,
  ): Promise<PlatformContentEntity> {
    return this.contentService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.contentService.remove(id);
    return { success: true };
  }
}
