import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { UserStatus, UserRole } from '../common/enums';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity, ClientEntity, ArtisanEntity } from 'src/users/entities/user.entity';
import { TenantEntity } from '../tenant/entities/tenant.entity';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(ArtisanEntity)
    private readonly artisanRepository: Repository<ArtisanEntity>,
    private readonly jwtService: JwtService,
    private readonly tenantService: TenantService,
  ) {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  generateJwt(user: Partial<UserEntity>, tenant: string): string {
    if (!tenant) {
      throw new Error('Tenant is required to generate JWT');
    }
    return this.jwtService.sign(
      {
        tenant,
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.userRole,
      },
      {
        expiresIn: '30d',
      },
    );
  }

  async createUser(dto: CreateUserDto) {
    const { email, password, username, userRole, firstName, lastName, phoneNumber, organization, subdomain, planName } = dto;
    const emailExists = await this.userRepository.findOne({ where: { email } });
    const usernameExists = await this.userRepository.findOne({ where: { username } });

    if (emailExists) {
      throw new BadRequestException('Email already been used');
    }

    if (usernameExists) {
      throw new BadRequestException('Username already in use');
    }

    // Use the correct child entity repository to set the discriminator column
    let user: UserEntity;
    const userData = {
      email,
      password: await bcrypt.hash(password, 10),
      username,
      userRole: userRole as UserRole,
      userStatus: UserStatus.PENDING_APPROVAL,
      firstName,
      lastName,
      phoneNumber,
    };

    if (userRole === UserRole.ARTISAN) {
      const artisan = Object.assign(new ArtisanEntity(), userData);
      user = await this.artisanRepository.save(artisan);
    } else {
      const client = Object.assign(new ClientEntity(), userData);
      user = await this.clientRepository.save(client);
    }

    // Create tenant for artisans
    let tenant: TenantEntity | null = null;
    if (userRole === UserRole.ARTISAN) {
      // Use provided subdomain or generate from organization name
      let tenantSubdomain = subdomain;
      if (!tenantSubdomain && organization) {
        tenantSubdomain = this.tenantService.generateSubdomain(organization);
      } else if (!tenantSubdomain) {
        // Fallback to username if no organization provided
        tenantSubdomain = this.tenantService.generateSubdomain(username);
      }

      try {
        tenant = await this.tenantService.create({
          subdomain: tenantSubdomain,
          ownerId: user.id,
          organizationName: organization || username,
          planName: planName || 'basic',
        });

        // Update user with organization name if provided
        if (organization) {
          user['organization'] = organization;
          await this.userRepository.save(user);
        }
      } catch (error) {
        console.error('Error creating tenant:', error);
        // Don't fail user creation if tenant creation fails
        // Tenant can be created manually later
      }
    }

    return {
      success: true,
      user: this.sanitizeUser(user),
      tenant: tenant ? {
        id: tenant.id,
        subdomain: tenant.subdomain,
        subdomainUrl: tenant.getSubdomainUrl(),
        status: tenant.status,
      } : null,
    };
  }

  async sendMagicLink(email: string, tenant?: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('No account found with this email. Please sign up first.');
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.magicLinkToken = token;
    user.magicLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.userRepository.save(user);

    // ORIGINAL
    //const baseUrl = process.env.BASE_URL || 'https://arlink.online';
    const baseUrl = process.env.BASE_URL || 'https://dev.arlink.online';
    const magicLink =
      `${baseUrl}/auth/verify?token=${token}` +
      (tenant ? `&tenant=${tenant}` : '');

    // Send email
    try {
      await this.transporter.sendMail({
        from: `"ARLinK.online" <${process.env.SMTP_USER}>`,
          to: email,
          subject: '🔗 Connexion à votre espace ARLinK',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #d1b06c; border-radius: 10px; }
                .header { background: linear-gradient(135deg, #c9a961 0%, #d4b270 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #c9a961 0%, #d4b270 100%); color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">ARLinK</h1>
                  <p style="margin: 5px 0 0 0;">L'ARTISANAT MONDIAL</p>
                </div>
                <div class="content">
                  <h2>Connexion à votre espace</h2>
                  <p>Bonjour,</p>
                  <p>Vous avez demandé à vous connecter à ARLinK. Cliquez sur le bouton ci-dessous pour accéder à votre espace :</p>
                  <div style="text-align: center;">
                    <a href="${magicLink}" class="button">Se connecter</a>
                  </div>
                  <p style="font-size: 14px; color: #666;">Ou copiez ce lien dans votre navigateur :</p>
                  <p style="font-size: 12px; background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">${magicLink}</p>
                  <p style="font-size: 14px; color: #999; margin-top: 20px;">⏰ Ce lien expire dans 24 heures.</p>
                  <p style="font-size: 14px; color: #999;">Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email.</p>
                </div>
                <div class="footer">
                  <p>© 2026 ARLinK - Tous droits réservés</p>
                  <p>La plateforme mondiale de l'artisanat authentique</p>
                </div>
              </div>
            </body>
            </html>
          `,
      });
      
      console.log('Magic link email sent to:', email);

    } catch (error) {
      console.error('Error sending email:', error);
      throw new UnauthorizedException('Error sending email');
    }
    return {
      success: true,
      message: 'Lien magique envoyé par email',
    };
  }

  async verifyMagicLink(token: string, tenant: string) {
    const user = await this.userRepository.findOne({
      where: { magicLinkToken: token },
    });

    if (!user || !user.magicLinkExpires) {
      throw new UnauthorizedException('Lien invalide');
    }

    if (user.magicLinkExpires < new Date()) {
      throw new UnauthorizedException('Lien expiré');
    }

    user.magicLinkToken = null;
    user.magicLinkExpires = null;
    user.isEmailVerified = true;
    await this.userRepository.save(user);

    return {
      success: true,
      token: this.generateJwt(user, tenant),
      user: this.sanitizeUser(user),
    };
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google profile invalid');
    }

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const username = email.split('@')[0] + '_' + Date.now();
      const randomPassword = crypto.randomBytes(32).toString('hex');

      user = Object.assign(new ClientEntity(), {
        email,
        username,
        password: await bcrypt.hash(randomPassword, 10),
        googleId: profile.id,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profilePicture: profile.photos?.[0]?.value,
        userRole: UserRole.CLIENT,
        userStatus: UserStatus.ACTIVE,
        isEmailVerified: true,
      });
    } else {
      if (!user.googleId) {
        user.googleId = profile.id;
      }
      if (!user.profilePicture && profile.photos?.[0]?.value) {
        user.profilePicture = profile.photos[0].value;
      }
    }

    await this.userRepository.save(user);
    return user;
  }

  async login(identifier: string, password: string, tenant?: string) {
    if (!identifier || !password) {
      throw new BadRequestException('Identifier and password are required');
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await this.userRepository.findOne({
      where: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Some legacy/OAuth-only users may not have a password hash.
    // Avoid bcrypt throwing a runtime error (500) and return a proper auth error.
    if (!user.password || typeof user.password !== 'string') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.userStatus === UserStatus.PENDING_APPROVAL) {
      throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur. Vous recevrez un email de confirmation.');
    }

    if (user.userStatus !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const tenantContext = tenant || 'public';
    return {
      success: true,
      token: this.generateJwt(user, tenantContext),
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(user: UserEntity) {
    const {
      password,
      magicLinkToken,
      magicLinkExpires,
      passwordResetToken,
      passwordResetExpires,
      emailVerificationToken,
      emailVerificationExpires,
      ...safe
    } = user;
    return safe;
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await this.userRepository.save(user);

    // ORIGINAL
    // const baseUrl = process.env.BASE_URL || 'https://arlink.online';
    const baseUrl = process.env.BASE_URL || 'https://dev.arlink.online';
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from: `"ARLinK.online" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe ARLinK',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #c9a961 0%, #d4b270 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #c9a961 0%, #d4b270 100%); color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
              .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">ARLinK</h1>
                <p style="margin: 5px 0 0 0;">L'ARTISANAT MONDIAL</p>
              </div>
              <div class="content">
                <h2>Réinitialisation de mot de passe</h2>
                <p>Bonjour,</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                <div style="text-align: center;">
                  <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
                </div>
                <p style="font-size: 14px; color: #666;">Ou copiez ce lien dans votre navigateur :</p>
                <p style="font-size: 12px; background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">${resetLink}</p>
                <div class="warning">
                  <p style="font-size: 14px; color: #856404; margin: 0;">⚠️ Ce lien expire dans 1 heure.</p>
                </div>
                <p style="font-size: 14px; color: #999;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email ou contactez le support.</p>
              </div>
              <div class="footer">
                <p>© 2026 ARLinK - Tous droits réservés</p>
                <p>La plateforme mondiale de l'artisanat authentique</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Don't expose email errors to user
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (!user.passwordResetExpires) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.lastPasswordChangeAt = new Date();
    
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Change password for logged-in user
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.lastPasswordChangeAt = new Date();
    
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password has been changed successfully.',
    };
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        message: 'Email is already verified',
      };
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hour expiry
    await this.userRepository.save(user);

    // ORIGINAL
    // const baseUrl = process.env.BASE_URL || 'https://arlink.online';
    const baseUrl = process.env.BASE_URL || 'https://dev.arlink.online';
    const verifyLink = `${baseUrl}/auth/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: `"ARLinK.online" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '✅ Vérification de votre email ARLinK',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #c9a961 0%, #d4b270 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #c9a961 0%, #d4b270 100%); color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">ARLinK</h1>
                <p style="margin: 5px 0 0 0;">L'ARTISANAT MONDIAL</p>
              </div>
              <div class="content">
                <h2>Vérification de votre email</h2>
                <p>Bonjour ${user.firstName || 'utilisateur'},</p>
                <p>Merci de vous être inscrit sur ARLinK. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                <div style="text-align: center;">
                  <a href="${verifyLink}" class="button">Vérifier mon email</a>
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">⏰ Ce lien expire dans 24 heures.</p>
              </div>
              <div class="footer">
                <p>© 2026 ARLinK - Tous droits réservés</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Verification email sent to:', user.email);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      success: true,
      message: 'Verification email has been sent',
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (!user.emailVerificationExpires) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new UnauthorizedException('Verification token has expired');
    }

    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.isEmailVerified = true;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email has been verified successfully',
    };
  }

  /**
   * Admin login - Only allows SUPER_ADMIN, ADMIN, MODERATOR roles
   */
  async adminLogin(identifier: string, password: string) {
    const normalizedIdentifier = identifier.toLowerCase().trim();

    // Find user by email or username
    const user = await this.userRepository.findOne({
      where: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password || typeof user.password !== 'string') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has admin role
    const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR];
    if (!adminRoles.includes(user.userRole)) {
      throw new ForbiddenException('Access denied. Admin credentials required.');
    }

    // Check if user is active
    if (user.userStatus !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active. Please contact support.');
    }

    // Generate admin JWT (use 'admin' as tenant for admin routes)
    const token = this.jwtService.sign(
      {
        tenant: 'admin',
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.userRole,
        isAdmin: true,
      },
      {
        expiresIn: '8h', // Shorter expiry for admin sessions
      },
    );

    return {
      success: true,
      token,
      user: this.sanitizeUser(user),
    };
  }
}
