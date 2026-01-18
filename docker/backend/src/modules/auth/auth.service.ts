import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserType } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        type: user.type,
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
}
