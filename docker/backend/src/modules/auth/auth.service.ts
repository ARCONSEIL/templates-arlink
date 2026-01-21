import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ArtisansService } from '../artisans/artisans.service';
import { BoutiquesService } from '../boutiques/boutiques.service';
import { User, UserType } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private artisansService: ArtisansService,
    private boutiquesService: BoutiquesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      return user;
    }
    return null;
  }

    async login(user: User) {
      const payload = {
        email: user.email,
        sub: user.id,
        type: user.type,
      };
    
      // For artisan users, get their boutique subDomain
      let boutiqueSubDomain: string | null = null;
      if (user.type === UserType.ARTISAN) {
        try {
          const artisan = await this.artisansService.findByUserId(user.id);
          if (artisan) {
            const boutiques = await this.boutiquesService.findByArtisanId(artisan.id);
            if (boutiques && boutiques.length > 0) {
              boutiqueSubDomain = boutiques[0].subDomain;
            }
          }
        } catch (err) {
          console.error('Error fetching artisan boutique:', err);
        }
      }
    
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          type: user.type,
          boutiqueSubDomain,
        },
      };
    }

  async register(data: {
    email: string;
    password: string;
    nom?: string;
    prenom?: string;
    type?: UserType;
  }) {
    const user = await this.usersService.create({
      email: data.email,
      password: data.password,
      nom: data.nom,
      prenom: data.prenom,
      type: data.type || UserType.CLIENT,
    });

    return this.login(user);
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async loginWithGoogle(data: {
    email: string;
    nom?: string;
    prenom?: string;
    googleId: string;
  }) {
    let user = await this.usersService.findByEmail(data.email);
    
    if (!user) {
      user = await this.usersService.create({
        email: data.email,
        password: `google_${data.googleId}_${Date.now()}`,
        nom: data.nom,
        prenom: data.prenom,
        type: UserType.CLIENT,
      });
    }

    return this.login(user);
  }
}
