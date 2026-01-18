import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boutique } from './boutique.entity';
import { BoutiquesService } from './boutiques.service';
import { BoutiquesController } from './boutiques.controller';
import { ArtisansModule } from '../artisans/artisans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Boutique]), ArtisansModule],
  providers: [BoutiquesService],
  controllers: [BoutiquesController],
  exports: [BoutiquesService],
})
export class BoutiquesModule {}
