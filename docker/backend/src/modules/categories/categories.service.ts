import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

const DEFAULT_CATEGORIES = [
  { nom: 'Bijoux', slug: 'bijoux', emoji: '💍', ordre: 1 },
  { nom: 'Céramique', slug: 'ceramique', emoji: '🏺', ordre: 2 },
  { nom: 'Textile', slug: 'textile', emoji: '🧵', ordre: 3 },
  { nom: 'Bois', slug: 'bois', emoji: '🪵', ordre: 4 },
  { nom: 'Cuir', slug: 'cuir', emoji: '👜', ordre: 5 },
  { nom: 'Métal', slug: 'metal', emoji: '⚒️', ordre: 6 },
  { nom: 'Verre', slug: 'verre', emoji: '🥃', ordre: 7 },
  { nom: 'Papier', slug: 'papier', emoji: '📜', ordre: 8 },
  { nom: 'Pierre', slug: 'pierre', emoji: '💎', ordre: 9 },
  { nom: 'Vannerie', slug: 'vannerie', emoji: '🧺', ordre: 10 },
  { nom: 'Poterie', slug: 'poterie', emoji: '🫖', ordre: 11 },
  { nom: 'Broderie', slug: 'broderie', emoji: '🪡', ordre: 12 },
  { nom: 'Tapisserie', slug: 'tapisserie', emoji: '🖼️', ordre: 13 },
  { nom: 'Sculpture', slug: 'sculpture', emoji: '🗿', ordre: 14 },
  { nom: 'Peinture', slug: 'peinture', emoji: '🎨', ordre: 15 },
  { nom: 'Cosmétiques', slug: 'cosmetiques', emoji: '🧴', ordre: 16 },
  { nom: 'Épices', slug: 'epices', emoji: '🌶️', ordre: 17 },
  { nom: 'Alimentation', slug: 'alimentation', emoji: '🍯', ordre: 18 },
  { nom: 'Musique', slug: 'musique', emoji: '🎸', ordre: 19 },
  { nom: 'Décoration', slug: 'decoration', emoji: '🏠', ordre: 20 },
  { nom: 'Mode', slug: 'mode', emoji: '👗', ordre: 21 },
  { nom: 'Maroquinerie', slug: 'maroquinerie', emoji: '👝', ordre: 22 },
  { nom: 'Horlogerie', slug: 'horlogerie', emoji: '⌚', ordre: 23 },
  { nom: 'Parfumerie', slug: 'parfumerie', emoji: '🌸', ordre: 24 },
  { nom: 'Savonnerie', slug: 'savonnerie', emoji: '🧼', ordre: 25 },
  { nom: 'Ferronnerie', slug: 'ferronnerie', emoji: '🔨', ordre: 26 },
  { nom: 'Ébénisterie', slug: 'ebenisterie', emoji: '🪑', ordre: 27 },
  { nom: 'Joaillerie', slug: 'joaillerie', emoji: '👑', ordre: 28 },
  { nom: 'Autre', slug: 'autre', emoji: '✨', ordre: 29 },
];

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const count = await this.categoriesRepository.count();
    if (count === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await this.categoriesRepository.save(this.categoriesRepository.create(cat));
      }
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { active: true },
      order: { ordre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({ where: { slug } });
  }

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create(data);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, data);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  async updateBoutiquesCount(slug: string, count: number): Promise<void> {
    const category = await this.findBySlug(slug);
    if (category) {
      category.boutiquesCount = count;
      await this.categoriesRepository.save(category);
    }
  }
}
