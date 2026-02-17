import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Modules
import { AuthModule } from './auth/auth.module';
import { StorefrontModule } from './shops/storefront/storefront.module';
import { ShopModule } from './shops/shop.module';
import { OrderModule } from './orders/order.module';
import { PaymentModule } from './payment/payment.module';
import { MediaModule } from './media/media.module';
import { CarouselModule } from './carousel/carousel.module';
import { TenantModule } from './tenant/tenant.module';
import { CategoryModule } from './categories/category.module';
import { AdminModule } from './users/admin/admin.module';
import { ClientModule } from './users/clients/client.module';
import { SuperAdminModule } from './users/super_admin/super_admin.module';
import { StoresExhibitionModule } from './shops/stores_exhibition/stores-exhibition.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/review.module';
import { ModerationModule } from './moderation/moderation.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { MessagesModule } from './messages/messages.module';
import { ArtisanModule } from './users/artisan/artisan.module';
import { ProductModule } from './products/product.module';
import { UserModule } from './users/user.module';
import { PlatformContentModule } from './platform-content/platform-content.module';

// Middleware
import { TenantMiddleware } from './common/middlewares/tenant.middleware';

// Entities (import all for TypeORM)
import { UserEntity, ArtisanEntity, ClientEntity, AdminEntity, SuperAdminEntity, ModeratorEntity } from './users/entities/user.entity';
import { UserPreferencesEntity } from './users/entities/user-preferences.entity';
import { ShopEntity } from './shops/entities/shop.entity';
import { ShopStaffEntity } from './shops/entities/shop-staff.entity';
import { ShopAnalyticsEntity } from './shops/entities/shop-analytics.entity';
import { StoreExhibitionEntity } from './shops/entities/store-exhibition.entity';
import { ProductEntity } from './products/entities/product.entity';
import { ProductImageEntity } from './products/entities/product-image.entity';
import { ProductVariantEntity } from './products/entities/product-variant.entity';
import { OrderEntity, OrderItemEntity, OrderHistoryEntity } from './orders/entities/order.entity';
import { PaymentEntity, RefundEntity } from './payment/entities/payment.entity';
import { CategoryEntity } from './categories/entities/category.entity';
import { CommentEntity } from './comment/entities/comment.entity';
import { UserFollowersEntity } from './followers/entities/user-followers.entity';
import { LikeEntity } from './likes/entities/like.entity';
import { RatingEntity } from './ratings/entities/rating.entity';
import { ReviewEntity } from './reviews/entities/review.entity';
import { ReviewCommentEntity } from './reviews/entities/review-comment.entity';
import { NotificationEntity } from './notification/entities/notification.entity';
import { TenantEntity } from './tenant/entities/tenant.entity';
import { CartEntity } from './cart/entities/cart.entity';
import { CartItemEntity } from './cart/entities/cart-item.entity';
import { WishlistEntity } from './wishlist/entities/wishlist.entity';
import { WishlistItemEntity } from './wishlist/entities/wishlist-item.entity';
import { ModerationReportEntity } from './moderation/entities/moderation-report.entity';
import { ConversationEntity, MessageEntity } from './messages/entities/message.entity';
import { PlatformContentEntity } from './platform-content/entities/platform-content.entity';

import { ContextController } from './common/context/context.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', 5432)),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'arlink_v3'),
        entities: [
          UserEntity,
          ArtisanEntity,
          ClientEntity,
          AdminEntity,
          SuperAdminEntity,
          ModeratorEntity,
          UserPreferencesEntity,
          ShopEntity,
          ShopStaffEntity,
          ShopAnalyticsEntity,
          StoreExhibitionEntity,
          ProductEntity,
          ProductImageEntity,
          ProductVariantEntity,
          OrderEntity,
          OrderItemEntity,
          OrderHistoryEntity,
          PaymentEntity,
          RefundEntity,
          CategoryEntity,
          CommentEntity,
          UserFollowersEntity,
          LikeEntity,
          RatingEntity,
          ReviewEntity,
          ReviewCommentEntity,
          NotificationEntity,
          TenantEntity,
          CartEntity,
          CartItemEntity,
          WishlistEntity,
          WishlistItemEntity,
          ModerationReportEntity,
          ConversationEntity,
          MessageEntity,
          PlatformContentEntity,
        ],
        synchronize: false, // Disabled - using migrations instead
        logging: configService.get('NODE_ENV') === 'development',
        migrations: ['dist/migrations/*.js'],
        migrationsRun: true, // Auto-run migrations on startup
      }),
    }),

    // Cache — Redis-backed via @keyv/redis (cache-manager v7 uses ms for TTL)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          createKeyv(
            `redis://${config.get('REDIS_HOST', 'redis')}:${config.get('REDIS_PORT', 6379)}`,
          ),
        ],
        ttl: 5 * 60 * 1000, // 5 minutes default
      }),
    }),

    // Serve static media files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'media'),
      serveRoot: '/media',
    }),

    // Client static files served by nginx, not needed here

    // Core Modules
    AuthModule,
    StorefrontModule,
    ShopModule,
    OrderModule,
    PaymentModule,
    MediaModule,
    CarouselModule,
    TenantModule,
    CategoryModule,
    AdminModule,
    ClientModule,
    SuperAdminModule,
    StoresExhibitionModule,
    CartModule,
    WishlistModule,
    ReviewsModule,
    ModerationModule,
    ChatbotModule,
    MessagesModule,
    ArtisanModule,
    ProductModule,
    UserModule,
    PlatformContentModule,
  ],
  controllers: [
    AppController,
    ContextController,
  ],
  providers: [
    AppService,
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes(
        { path: 'storefront/*', method: RequestMethod.ALL },
        { path: 'store/*', method: RequestMethod.ALL },
        { path: 'store', method: RequestMethod.ALL },
      );
  }
}
