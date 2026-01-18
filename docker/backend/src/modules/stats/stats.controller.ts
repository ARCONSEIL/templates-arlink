import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global platform statistics' })
  async getGlobalStats() {
    return this.statsService.getGlobalStats();
  }

  @Get('artisan/:artisanId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get artisan statistics' })
  async getArtisanStats(@Param('artisanId') artisanId: string) {
    return this.statsService.getArtisanStats(artisanId);
  }

  @Get('boutique/:boutiqueId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get boutique statistics' })
  async getBoutiqueStats(@Param('boutiqueId') boutiqueId: string) {
    return this.statsService.getBoutiqueStats(boutiqueId);
  }
}
