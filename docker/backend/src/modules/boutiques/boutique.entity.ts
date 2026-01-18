import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Artisan } from '../artisans/artisan.entity';

export enum BoutiqueStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('boutiques')
export class Boutique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  artisanId: string;

  @ManyToOne(() => Artisan)
  @JoinColumn({ name: 'artisanId' })
  artisan: Artisan;

  @Column()
  societe: string;

  @Column({ unique: true, nullable: true })
  subDomain: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ nullable: true })
  pays: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  categorie: string;

  @Column({ nullable: true })
  sousCategorie: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  banniere: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 0 })
  featuredOrder: number;

  @Column({
    type: 'enum',
    enum: BoutiqueStatus,
    default: BoutiqueStatus.DRAFT,
  })
  status: BoutiqueStatus;

  @Column({ default: 0 })
  vues: number;

  @Column({ default: 0 })
  visites: number;

  @Column({ type: 'jsonb', nullable: true })
  horaires: object;

  @Column({ type: 'jsonb', nullable: true })
  reseauxSociaux: object;

  @Column({ type: 'text', nullable: true })
  avantGout: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
