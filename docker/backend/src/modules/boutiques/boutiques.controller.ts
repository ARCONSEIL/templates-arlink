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
import { BoutiquesService } from './boutiques.service';
import { Boutique, BoutiqueStatus } from './boutique.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('boutiques')
@Controller('boutiques')
export class BoutiquesController {
  constructor(private readonly boutiquesService: BoutiquesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all boutiques' })
  @ApiQuery({ name: 'status', required: false, enum: BoutiqueStatus })
  @ApiQuery({ name: 'categorie', required: false })
  @ApiQuery({ name: 'pays', required: false })
  @ApiQuery({ name: 'ville', required: false })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  async findAll(
    @Query('status') status?: BoutiqueStatus,
    @Query('categorie') categorie?: string,
    @Query('pays') pays?: string,
    @Query('ville') ville?: string,
    @Query('featured') featured?: boolean,
  ): Promise<Boutique[]> {
    return this.boutiquesService.findAll({
      status,
      categorie,
      pays,
      ville,
      featured,
    });
  }

  @Get('map')
  @ApiOperation({ summary: 'Get boutiques for map display' })
  async getMapData() {
    return this.boutiquesService.getMapData();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured boutiques' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeatured(@Query('limit') limit?: number) {
    return this.boutiquesService.getFeatured(limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search boutiques' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.boutiquesService.search(query);
  }

  @Get('categorie/:categorie')
  @ApiOperation({ summary: 'Get boutiques by category' })
  async getByCategorie(@Param('categorie') categorie: string) {
    return this.boutiquesService.getByCategorie(categorie);
  }

  @Get('subdomain/:subDomain')
  @ApiOperation({ summary: 'Get boutique by subdomain' })
  async findBySubDomain(@Param('subDomain') subDomain: string) {
    const boutique = await this.boutiquesService.findBySubDomain(subDomain);
    if (boutique) {
      await this.boutiquesService.incrementVues(boutique.id);
    }
    return boutique;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get boutique by ID' })
  async findOne(@Param('id') id: string): Promise<Boutique> {
    await this.boutiquesService.incrementVues(id);
    return this.boutiquesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create boutique' })
  async create(@Body() createData: Partial<Boutique>): Promise<Boutique> {
    return this.boutiquesService.create(createData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update boutique' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Boutique>,
  ): Promise<Boutique> {
    return this.boutiquesService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete boutique' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.boutiquesService.remove(id);
  }

  @Post(':id/visit')
  @ApiOperation({ summary: 'Record boutique visit' })
  async recordVisit(@Param('id') id: string): Promise<void> {
    return this.boutiquesService.incrementVisites(id);
  }
}
