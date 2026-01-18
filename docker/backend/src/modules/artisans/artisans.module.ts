import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artisan } from './artisan.entity';
import { ArtisansService } from './artisans.service';
import { ArtisansController } from './artisans.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artisan]), UsersModule],
  providers: [ArtisansService],
  controllers: [ArtisansController],
  exports: [ArtisansService],
})
export class ArtisansModule {}
