import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artisan, ArtisanStatus } from './artisan.entity';

@Injectable()
export class ArtisansService {
  constructor(
    @InjectRepository(Artisan)
    private artisansRepository: Repository<Artisan>,
  ) {}

  async findAll(options?: {
    status?: ArtisanStatus;
    categorie?: string;
    pays?: string;
    ville?: string;
    featured?: boolean;
  }): Promise<Artisan[]> {
    const query = this.artisansRepository.createQueryBuilder('artisan');

    if (options?.status) {
      query.andWhere('artisan.status = :status', { status: options.status });
    }
    if (options?.categorie) {
      query.andWhere('artisan.categorie = :categorie', { categorie: options.categorie });
    }
    if (options?.pays) {
      query.andWhere('artisan.pays = :pays', { pays: options.pays });
    }
    if (options?.ville) {
      query.andWhere('artisan.ville = :ville', { ville: options.ville });
    }
    if (options?.featured !== undefined) {
      query.andWhere('artisan.featured = :featured', { featured: options.featured });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Artisan> {
    const artisan = await this.artisansRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!artisan) {
      throw new NotFoundException(`Artisan with ID ${id} not found`);
    }
    return artisan;
  }

  async findByUserId(userId: string): Promise<Artisan | null> {
    return this.artisansRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async create(data: Partial<Artisan>): Promise<Artisan> {
    const artisan = this.artisansRepository.create(data);
    return this.artisansRepository.save(artisan);
  }

  async update(id: string, data: Partial<Artisan>): Promise<Artisan> {
    const artisan = await this.findOne(id);
    Object.assign(artisan, data);
    return this.artisansRepository.save(artisan);
  }

  async remove(id: string): Promise<void> {
    const artisan = await this.findOne(id);
    await this.artisansRepository.remove(artisan);
  }

  async incrementVues(id: string): Promise<void> {
    await this.artisansRepository.increment({ id }, 'vues', 1);
  }

  async incrementVisites(id: string): Promise<void> {
    await this.artisansRepository.increment({ id }, 'visites', 1);
  }

  async addCredits(id: string, amount: number): Promise<Artisan> {
    const artisan = await this.findOne(id);
    artisan.credits += amount;
    return this.artisansRepository.save(artisan);
  }

  async useCredits(id: string, amount: number): Promise<Artisan> {
    const artisan = await this.findOne(id);
    if (artisan.credits < amount) {
      throw new Error('Insufficient credits');
    }
    artisan.credits -= amount;
    return this.artisansRepository.save(artisan);
  }

  async getMapData(): Promise<any[]> {
    return this.artisansRepository
      .createQueryBuilder('artisan')
      .select([
        'artisan.id',
        'artisan.societe',
        'artisan.ville',
        'artisan.pays',
        'artisan.latitude',
        'artisan.longitude',
        'artisan.categorie',
        'artisan.logo',
      ])
      .where('artisan.status = :status', { status: ArtisanStatus.ACTIVE })
      .andWhere('artisan.latitude IS NOT NULL')
      .andWhere('artisan.longitude IS NOT NULL')
      .getMany();
  }
}
