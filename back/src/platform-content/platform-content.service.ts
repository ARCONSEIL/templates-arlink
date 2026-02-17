import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformContentEntity, ContentType } from './entities/platform-content.entity';

@Injectable()
export class PlatformContentService {
  constructor(
    @InjectRepository(PlatformContentEntity)
    private readonly contentRepository: Repository<PlatformContentEntity>,
  ) {}

  async findByType(type: ContentType): Promise<PlatformContentEntity[]> {
    return this.contentRepository.find({
      where: { type, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAllByType(type: ContentType): Promise<PlatformContentEntity[]> {
    return this.contentRepository.find({
      where: { type },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PlatformContentEntity> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async create(data: Partial<PlatformContentEntity>): Promise<PlatformContentEntity> {
    const entity = this.contentRepository.create(data);
    return this.contentRepository.save(entity);
  }

  async update(id: string, data: Partial<PlatformContentEntity>): Promise<PlatformContentEntity> {
    const content = await this.findById(id);
    Object.assign(content, data);
    return this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const content = await this.findById(id);
    await this.contentRepository.remove(content);
  }

  async getCollections(): Promise<PlatformContentEntity[]> {
    return this.findByType(ContentType.COLLECTION_CARD);
  }

  async getBanners(): Promise<PlatformContentEntity[]> {
    return this.findByType(ContentType.NEWS_BANNER);
  }

  async getAdCards(): Promise<PlatformContentEntity[]> {
    return this.findByType(ContentType.AD_CARD);
  }
}
