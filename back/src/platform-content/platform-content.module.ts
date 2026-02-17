import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformContentController } from './platform-content.controller';
import { PlatformContentService } from './platform-content.service';
import { PlatformContentEntity } from './entities/platform-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformContentEntity])],
  controllers: [PlatformContentController],
  providers: [PlatformContentService],
  exports: [PlatformContentService],
})
export class PlatformContentModule {}
