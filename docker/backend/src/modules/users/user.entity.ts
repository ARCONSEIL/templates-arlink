import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

export enum UserType {
  CLIENT = 'client',
  ARTISAN = 'artisan',
  PRO = 'pro',
  AMBASSADEUR = 'ambassadeur',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CLIENT,
  })
  type: UserType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
