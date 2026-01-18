import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ArtisanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

@Entity('artisans')
export class Artisan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  societe: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ nullable: true })
  pays: string;

  @Column({ nullable: true })
  codePostal: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  categorie: string;

  @Column({ nullable: true })
  sousCategorie: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  siteWeb: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  youtube: string;

  @Column({ nullable: true })
  tiktok: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  banniere: string;

  @Column({ nullable: true })
  siret: string;

  @Column({ nullable: true })
  iban: string;

  @Column({ nullable: true })
  bic: string;

  @Column({
    type: 'enum',
    enum: ArtisanStatus,
    default: ArtisanStatus.PENDING,
  })
  status: ArtisanStatus;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'text', nullable: true })
  iaHistoire: string;

  @Column({ type: 'text', nullable: true })
  iaSavoirFaire: string;

  @Column({ type: 'text', nullable: true })
  iaTemperament: string;

  @Column({ nullable: true })
  iaAvatarImage: string;

  @Column({ default: 0 })
  credits: number;

  @Column({ default: 0 })
  vues: number;

  @Column({ default: 0 })
  visites: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
