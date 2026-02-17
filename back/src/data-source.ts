import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

// Import all entities
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

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arlink_v3',
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
  migrations: [
    __dirname + '/migrations/*.ts',
    __dirname + '/migrations/*.js',
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
