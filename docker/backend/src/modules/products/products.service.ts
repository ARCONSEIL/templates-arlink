import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(options?: {
    statut?: ProductStatus;
    categorie?: string;
    boutiqueId?: string;
    vedette?: boolean;
  }): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product');

    if (options?.statut) {
      query.andWhere('product.statut = :statut', { statut: options.statut });
    }
    if (options?.categorie) {
      query.andWhere('product.categorie = :categorie', { categorie: options.categorie });
    }
    if (options?.boutiqueId) {
      query.andWhere('product.boutiqueId = :boutiqueId', { boutiqueId: options.boutiqueId });
    }
    if (options?.vedette !== undefined) {
      query.andWhere('product.vedette = :vedette', { vedette: options.vedette });
    }

    return query.orderBy('product.vedetteOrder', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['boutique'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByBoutiqueId(boutiqueId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { boutiqueId },
      order: { vedetteOrder: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(data);
    return this.productsRepository.save(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, data);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async incrementVues(id: string): Promise<void> {
    await this.productsRepository.increment({ id }, 'vues', 1);
  }

  async getVedettes(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { vedette: true, statut: ProductStatus.ACTIVE },
      order: { vedetteOrder: 'DESC' },
      take: limit,
      relations: ['boutique'],
    });
  }

  async search(query: string): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.boutique', 'boutique')
      .where('product.statut = :statut', { statut: ProductStatus.ACTIVE })
      .andWhere(
        '(product.nom ILIKE :query OR product.description ILIKE :query OR product.titre ILIKE :query)',
        { query: `%${query}%` },
      )
      .getMany();
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = quantity;
    if (quantity <= 0) {
      product.statut = ProductStatus.OUT_OF_STOCK;
    } else if (product.statut === ProductStatus.OUT_OF_STOCK) {
      product.statut = ProductStatus.ACTIVE;
    }
    return this.productsRepository.save(product);
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = Math.max(0, product.stock - quantity);
    if (product.stock <= 0) {
      product.statut = ProductStatus.OUT_OF_STOCK;
    }
    return this.productsRepository.save(product);
  }
}
