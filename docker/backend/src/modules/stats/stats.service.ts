import { Injectable } from '@nestjs/common';
import { BoutiquesService } from '../boutiques/boutiques.service';
import { ProductsService } from '../products/products.service';
import { ArtisansService } from '../artisans/artisans.service';
import { UsersService } from '../users/users.service';
import { BoutiqueStatus } from '../boutiques/boutique.entity';
import { ProductStatus } from '../products/product.entity';
import { ArtisanStatus } from '../artisans/artisan.entity';

@Injectable()
export class StatsService {
  constructor(
    private boutiquesService: BoutiquesService,
    private productsService: ProductsService,
    private artisansService: ArtisansService,
    private usersService: UsersService,
  ) {}

  async getGlobalStats() {
    const [boutiques, products, artisans, users] = await Promise.all([
      this.boutiquesService.findAll({ status: BoutiqueStatus.ACTIVE }),
      this.productsService.findAll({ statut: ProductStatus.ACTIVE }),
      this.artisansService.findAll({ status: ArtisanStatus.ACTIVE }),
      this.usersService.findAll(),
    ]);

    const totalVuesBoutiques = boutiques.reduce((sum, b) => sum + (b.vues || 0), 0);
    const totalVisitesBoutiques = boutiques.reduce((sum, b) => sum + (b.visites || 0), 0);
    const totalVuesProducts = products.reduce((sum, p) => sum + (p.vues || 0), 0);

    const categoriesCount: Record<string, number> = {};
    boutiques.forEach((b) => {
      if (b.categorie) {
        categoriesCount[b.categorie] = (categoriesCount[b.categorie] || 0) + 1;
      }
    });

    const paysCount: Record<string, number> = {};
    boutiques.forEach((b) => {
      if (b.pays) {
        paysCount[b.pays] = (paysCount[b.pays] || 0) + 1;
      }
    });

    return {
      totalBoutiques: boutiques.length,
      totalProducts: products.length,
      totalArtisans: artisans.length,
      totalUsers: users.length,
      totalVuesBoutiques,
      totalVisitesBoutiques,
      totalVuesProducts,
      categoriesCount,
      paysCount,
      topCategories: Object.entries(categoriesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      topPays: Object.entries(paysCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
    };
  }

  async getArtisanStats(artisanId: string) {
    const artisan = await this.artisansService.findOne(artisanId);
    const boutiques = await this.boutiquesService.findAll({ artisanId });
    
    let totalProducts = 0;
    let totalVuesProducts = 0;
    let totalVuesBoutiques = 0;
    let totalVisitesBoutiques = 0;

    for (const boutique of boutiques) {
      const products = await this.productsService.findByBoutiqueId(boutique.id);
      totalProducts += products.length;
      totalVuesProducts += products.reduce((sum, p) => sum + (p.vues || 0), 0);
      totalVuesBoutiques += boutique.vues || 0;
      totalVisitesBoutiques += boutique.visites || 0;
    }

    return {
      artisan: {
        id: artisan.id,
        societe: artisan.societe,
        credits: artisan.credits,
        vues: artisan.vues,
        visites: artisan.visites,
      },
      totalBoutiques: boutiques.length,
      totalProducts,
      totalVuesProducts,
      totalVuesBoutiques,
      totalVisitesBoutiques,
    };
  }

  async getBoutiqueStats(boutiqueId: string) {
    const boutique = await this.boutiquesService.findOne(boutiqueId);
    const products = await this.productsService.findByBoutiqueId(boutiqueId);

    const totalVuesProducts = products.reduce((sum, p) => sum + (p.vues || 0), 0);
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const activeProducts = products.filter((p) => p.statut === ProductStatus.ACTIVE).length;
    const outOfStockProducts = products.filter((p) => p.statut === ProductStatus.OUT_OF_STOCK).length;

    return {
      boutique: {
        id: boutique.id,
        societe: boutique.societe,
        vues: boutique.vues,
        visites: boutique.visites,
      },
      totalProducts: products.length,
      activeProducts,
      outOfStockProducts,
      totalVuesProducts,
      totalStock,
    };
  }
}
