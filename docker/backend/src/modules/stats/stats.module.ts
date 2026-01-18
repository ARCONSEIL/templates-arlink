import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { BoutiquesModule } from '../boutiques/boutiques.module';
import { ProductsModule } from '../products/products.module';
import { ArtisansModule } from '../artisans/artisans.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BoutiquesModule, ProductsModule, ArtisansModule, UsersModule],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
