import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Boutique } from '../boutiques/boutique.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  boutiqueId: string;

  @ManyToOne(() => Boutique)
  @JoinColumn({ name: 'boutiqueId' })
  boutique: Boutique;

  @Column()
  nom: string;

  @Column({ nullable: true })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prixGros: number;

  @Column({ nullable: true })
  quantiteMinGros: number;

  @Column({ nullable: true })
  categorie: string;

  @Column({ nullable: true })
  sousCategorie: string;

  @Column({ nullable: true })
  img1: string;

  @Column({ nullable: true })
  img2: string;

  @Column({ nullable: true })
  img3: string;

  @Column({ nullable: true })
  video: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: false })
  vedette: boolean;

  @Column({ default: 0 })
  vedetteOrder: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  statut: ProductStatus;

  @Column({ default: 0 })
  vues: number;

  @Column({ type: 'jsonb', nullable: true })
  caracteristiques: object;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: object;

  @Column({ nullable: true })
  poids: number;

  @Column({ nullable: true })
  delaiLivraison: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
