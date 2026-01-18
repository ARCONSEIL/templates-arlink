import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boutique, BoutiqueStatus } from './boutique.entity';

@Injectable()
export class BoutiquesService {
  constructor(
    @InjectRepository(Boutique)
    private boutiquesRepository: Repository<Boutique>,
  ) {}

  async findAll(options?: {
    status?: BoutiqueStatus;
    categorie?: string;
    pays?: string;
    ville?: string;
    featured?: boolean;
    artisanId?: string;
  }): Promise<Boutique[]> {
    const query = this.boutiquesRepository.createQueryBuilder('boutique');

    if (options?.status) {
      query.andWhere('boutique.status = :status', { status: options.status });
    }
    if (options?.categorie) {
      query.andWhere('boutique.categorie = :categorie', { categorie: options.categorie });
    }
    if (options?.pays) {
      query.andWhere('boutique.pays = :pays', { pays: options.pays });
    }
    if (options?.ville) {
      query.andWhere('boutique.ville = :ville', { ville: options.ville });
    }
    if (options?.featured !== undefined) {
      query.andWhere('boutique.featured = :featured', { featured: options.featured });
    }
    if (options?.artisanId) {
      query.andWhere('boutique.artisanId = :artisanId', { artisanId: options.artisanId });
    }

    return query.orderBy('boutique.featuredOrder', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Boutique> {
    const boutique = await this.boutiquesRepository.findOne({
      where: { id },
      relations: ['artisan'],
    });
    if (!boutique) {
      throw new NotFoundException(`Boutique with ID ${id} not found`);
    }
    return boutique;
  }

  async findBySubDomain(subDomain: string): Promise<Boutique | null> {
    return this.boutiquesRepository.findOne({
      where: { subDomain },
      relations: ['artisan'],
    });
  }

  async findByArtisanId(artisanId: string): Promise<Boutique[]> {
    return this.boutiquesRepository.find({
      where: { artisanId },
    });
  }

  async create(data: Partial<Boutique>): Promise<Boutique> {
    const boutique = this.boutiquesRepository.create(data);
    return this.boutiquesRepository.save(boutique);
  }

  async update(id: string, data: Partial<Boutique>): Promise<Boutique> {
    const boutique = await this.findOne(id);
    Object.assign(boutique, data);
    return this.boutiquesRepository.save(boutique);
  }

  async remove(id: string): Promise<void> {
    const boutique = await this.findOne(id);
    await this.boutiquesRepository.remove(boutique);
  }

  async incrementVues(id: string): Promise<void> {
    await this.boutiquesRepository.increment({ id }, 'vues', 1);
  }

  async incrementVisites(id: string): Promise<void> {
    await this.boutiquesRepository.increment({ id }, 'visites', 1);
  }

  async getMapData(): Promise<any[]> {
    return this.boutiquesRepository
      .createQueryBuilder('boutique')
      .select([
        'boutique.id',
        'boutique.societe',
        'boutique.ville',
        'boutique.pays',
        'boutique.latitude',
        'boutique.longitude',
        'boutique.categorie',
        'boutique.logo',
        'boutique.image',
        'boutique.subDomain',
      ])
      .where('boutique.status = :status', { status: BoutiqueStatus.ACTIVE })
      .andWhere('boutique.latitude IS NOT NULL')
      .andWhere('boutique.longitude IS NOT NULL')
      .getMany();
  }

  async getFeatured(limit: number = 10): Promise<Boutique[]> {
    return this.boutiquesRepository.find({
      where: { featured: true, status: BoutiqueStatus.ACTIVE },
      order: { featuredOrder: 'DESC' },
      take: limit,
    });
  }

  async getByCategorie(categorie: string): Promise<Boutique[]> {
    return this.boutiquesRepository.find({
      where: { categorie, status: BoutiqueStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string): Promise<Boutique[]> {
    return this.boutiquesRepository
      .createQueryBuilder('boutique')
      .where('boutique.status = :status', { status: BoutiqueStatus.ACTIVE })
      .andWhere(
        '(boutique.societe ILIKE :query OR boutique.description ILIKE :query OR boutique.ville ILIKE :query)',
        { query: `%${query}%` },
      )
      .getMany();
  }
}
