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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArtisansService } from './artisans.service';
import { Artisan, ArtisanStatus } from './artisan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('artisans')
@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all artisans' })
  @ApiQuery({ name: 'status', required: false, enum: ArtisanStatus })
  @ApiQuery({ name: 'categorie', required: false })
  @ApiQuery({ name: 'pays', required: false })
  @ApiQuery({ name: 'ville', required: false })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  async findAll(
    @Query('status') status?: ArtisanStatus,
    @Query('categorie') categorie?: string,
    @Query('pays') pays?: string,
    @Query('ville') ville?: string,
    @Query('featured') featured?: boolean,
  ): Promise<Artisan[]> {
    return this.artisansService.findAll({
      status,
      categorie,
      pays,
      ville,
      featured,
    });
  }

  @Get('map')
  @ApiOperation({ summary: 'Get artisans for map display' })
  async getMapData() {
    return this.artisansService.getMapData();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current artisan profile' })
  async getMyProfile(@Request() req) {
    return this.artisansService.findByUserId(req.user.id);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured artisans' })
  async getFeatured(@Query('limit') limit?: number) {
    const artisans = await this.artisansService.findAll({ featured: true });
    return limit ? artisans.slice(0, limit) : artisans;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artisan by ID' })
  async findOne(@Param('id') id: string): Promise<Artisan> {
    await this.artisansService.incrementVues(id);
    return this.artisansService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create artisan profile' })
  async create(
    @Request() req,
    @Body() createData: Partial<Artisan>,
  ): Promise<Artisan> {
    return this.artisansService.create({
      ...createData,
      userId: req.user.id,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artisan' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Artisan>,
  ): Promise<Artisan> {
    return this.artisansService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artisan' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.artisansService.remove(id);
  }

  @Post(':id/credits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add credits to artisan' })
  async addCredits(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<Artisan> {
    return this.artisansService.addCredits(id, amount);
  }

  @Post(':id/visit')
  @ApiOperation({ summary: 'Record artisan visit' })
  async recordVisit(@Param('id') id: string): Promise<void> {
    return this.artisansService.incrementVisites(id);
  }
}
