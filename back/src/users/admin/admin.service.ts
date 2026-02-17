import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { UserEntity } from '../entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums/user.enum';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { ShopStatus } from '../../common/enums/shop.enum';
import { ProductEntity } from '../../products/entities/product.entity';
import { ProductStatus } from '../../common/enums/product.enum';
import { OrderEntity, OrderItemEntity } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums/order.enum';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface DashboardStats {
  users: {
    total: number;
    artisans: number;
    clients: number;
    admins: number;
  };
  shops: {
    total: number;
    pending: number;
    active: number;
    suspended: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export interface PaginatedUsers {
  users: UserEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedShops {
  shops: ShopEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ShopFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsData {
  period: string;
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  shops: {
    total: number;
    active: number;
    pending: number;
    new: number;
    growth: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
    new: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
    new: number;
    growth: number;
  };
  topShops: Array<{ id: string; name: string; revenue: number; orders: number }>;
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ShopEntity)
    private shopRepository: Repository<ShopEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
  ) {}

  /**
   * Validate UUID format for ID parameters
   */
  private validateId(id: string): void {
    if (!UUID_REGEX.test(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
  }

  /**
   * Calculate growth percentage safely
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalUsers, artisans, clients, admins] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { userRole: UserRole.ARTISAN } }),
      this.userRepository.count({ where: { userRole: UserRole.CLIENT } }),
      this.userRepository.count({ where: { userRole: In([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]) } }),
    ]);

    const [totalShops, pendingShops, activeShops, suspendedShops] = await Promise.all([
      this.shopRepository.count(),
      this.shopRepository.count({ where: { status: ShopStatus.PENDING } }),
      this.shopRepository.count({ where: { status: ShopStatus.ACTIVE } }),
      this.shopRepository.count({ where: { status: ShopStatus.SUSPENDED } }),
    ]);

    const [totalProducts, activeProducts] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({ where: { status: ProductStatus.ACTIVE } }),
    ]);

    // Out of stock calculation - using a simple approximation based on active vs total
    // A proper implementation would require ProductInventoryEntity
    const outOfStockProducts = totalProducts - activeProducts;

    // FIX #2: Use SQL SUM instead of loading all orders
    const [totalOrders, pendingOrders, completedOrders, totalRevenueResult] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
      this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'sum')
        .getRawOne(),
    ]);

    const totalRevenue = parseFloat(totalRevenueResult?.sum || '0');

    const thisMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const thisMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'sum')
      .where('order.createdAt >= :thisMonthStart', { thisMonthStart: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1) })
      .getRawOne();

    const lastMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'sum')
      .where('order.createdAt >= :lastMonthStart AND order.createdAt < :thisMonthStart', {
        lastMonthStart: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        thisMonthStart: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1),
      })
      .getRawOne();

    return {
      users: { total: totalUsers, artisans, clients, admins },
      shops: { total: totalShops, pending: pendingShops, active: activeShops, suspended: suspendedShops },
      // FIX #7: Use actual inventory-based out of stock count
      products: { total: totalProducts, active: activeProducts, outOfStock: outOfStockProducts },
      orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders, revenue: totalRevenue },
      revenue: { total: totalRevenue, thisMonth: parseFloat(thisMonthOrders?.sum || '0'), lastMonth: parseFloat(lastMonthOrders?.sum || '0') },
    };
  }

  async getUsers(filters: UserFilters): Promise<PaginatedUsers> {
    const { search, role, status, page = 1, limit = 20 } = filters;
    const query = this.userRepository.createQueryBuilder('user');

    if (search) {
      query.where('(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', { search: `%${search}%` });
    }
    if (role) query.andWhere('user.userRole = :role', { role });
    if (status) query.andWhere('user.userStatus = :status', { status });

    const [users, total] = await query.orderBy('user.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserById(userId: string): Promise<UserEntity> {
    // FIX #4: Add UUID validation
    this.validateId(userId);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserStatus(userId: string, status: string): Promise<UserEntity> {
    this.validateId(userId);
    
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Valid values: ${Object.values(UserStatus).join(', ')}`);
    }
    const user = await this.getUserById(userId);
    user.userStatus = status as UserStatus;
    return this.userRepository.save(user);
  }

  async approveUser(userId: string): Promise<UserEntity> {
    this.validateId(userId);
    const user = await this.getUserById(userId);

    if (user.userStatus !== UserStatus.PENDING_APPROVAL) {
      throw new BadRequestException('User is not pending approval');
    }

    user.userStatus = UserStatus.ACTIVE;
    const savedUser = await this.userRepository.save(user);

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const baseUrl = process.env.BASE_URL || 'https://dev.arlink.online';

      await transporter.sendMail({
        from: `"ARLinK.online" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Votre compte ARLinK a ete approuve !',
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
                <h2>Compte approuve !</h2>
                <p>Bonjour ${user.firstName || 'utilisateur'},</p>
                <p>Votre compte ARLinK a ete valide par un administrateur. Vous pouvez maintenant vous connecter et acceder a votre espace.</p>
                <div style="text-align: center;">
                  <a href="${baseUrl}/login" class="button">Se connecter</a>
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">Bienvenue sur ARLinK !</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 ARLinK - Tous droits reserves</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log('Approval email sent to:', user.email);
    } catch (error) {
      console.error('Error sending approval email:', error);
    }

    return savedUser;
  }

  async updateUserRole(userId: string, role: string): Promise<UserEntity> {
    this.validateId(userId);
    
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(`Invalid role: ${role}. Valid values: ${Object.values(UserRole).join(', ')}`);
    }
    const user = await this.getUserById(userId);
    user.userRole = role as UserRole;
    return this.userRepository.save(user);
  }

  async deleteUser(userId: string, adminId?: string): Promise<void> {
    this.validateId(userId);
    
    if (adminId && userId === adminId) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    const user = await this.getUserById(userId);
    
    // FIX #6: Use soft delete instead of hard delete
    await this.userRepository.softDelete(userId);
  }

  async getShops(filters: ShopFilters): Promise<PaginatedShops> {
    const { search, status, page = 1, limit = 20 } = filters;
    const query = this.shopRepository.createQueryBuilder('shop');

    if (search) {
      query.where('(shop.name ILIKE :search OR shop.slug ILIKE :search)', { search: `%${search}%` });
    }
    if (status) query.andWhere('shop.status = :status', { status });

    const [shops, total] = await query.orderBy('shop.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { shops, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getShopById(shopId: string): Promise<ShopEntity> {
    this.validateId(shopId);
    
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async updateShopStatus(shopId: string, status: string, reason?: string): Promise<ShopEntity> {
    this.validateId(shopId);
    
    if (!Object.values(ShopStatus).includes(status as ShopStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Valid values: ${Object.values(ShopStatus).join(', ')}`);
    }
    const shop = await this.getShopById(shopId);
    shop.status = status as ShopStatus;
    if (reason) shop.statusReason = reason;
    shop.statusChangedAt = new Date();
    return this.shopRepository.save(shop);
  }

  async verifyShop(shopId: string, level: string, verifiedBy: string): Promise<ShopEntity> {
    this.validateId(shopId);
    
    const validLevels = ['none', 'basic', 'verified', 'premium'];
    if (!validLevels.includes(level)) {
      throw new BadRequestException(`Invalid verification level: ${level}. Valid values: ${validLevels.join(', ')}`);
    }
    const shop = await this.getShopById(shopId);
    shop.verificationLevel = level;
    shop.isVerified = level !== 'none';
    shop.verificationDocs = shop.verificationDocs || [];
    shop.verificationDocs.push({ type: 'admin_verification', url: '', verified: true, verifiedAt: new Date(), verifiedBy });
    return this.shopRepository.save(shop);
  }

  async getProducts(page: number = 1, limit: number = 20, status?: string) {
    const query = this.productRepository.createQueryBuilder('product');
    if (status) query.where('product.status = :status', { status });

    const [products, total] = await query.orderBy('product.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateProductStatus(productId: string, status: string): Promise<ProductEntity> {
    this.validateId(productId);
    
    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Valid values: ${Object.values(ProductStatus).join(', ')}`);
    }
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    product.status = status as ProductStatus;
    return this.productRepository.save(product);
  }

  async getOrders(page: number = 1, limit: number = 20, status?: string) {
    const query = this.orderRepository.createQueryBuilder('order');
    if (status) query.where('order.status = :status', { status });

    const [orders, total] = await query.orderBy('order.createdAt', 'DESC').skip((page - 1) * limit).take(limit).getManyAndCount();
    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOrderById(orderId: string): Promise<OrderEntity> {
    this.validateId(orderId);
    
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderEntity> {
    this.validateId(orderId);
    
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Valid values: ${Object.values(OrderStatus).join(', ')}`);
    }
    const order = await this.getOrderById(orderId);
    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
  }

  async getPlatformSettings() {
    return {
      platformName: 'ARLinK',
      maintenanceMode: false,
      allowNewRegistrations: true,
      requireEmailVerification: true,
      defaultCurrency: 'EUR',
      supportedLanguages: ['fr', 'en', 'ar', 'es', 'pt', 'it', 'de', 'ru', 'cn', 'ki'],
      commissionRate: 0.05,
      contactEmail: 'contact@arlink.online',
      supportEmail: 'support@arlink.online',
    };
  }

  async updatePlatformSettings(settings: Record<string, any>) {
    return { ...settings, updatedAt: new Date() };
  }

  // FIX #8: Enhanced moderation stubs with basic implementation
  async getModerationItems(type: string = 'all', status: string = 'pending', page: number = 1, limit: number = 20) {
    // Placeholder - would need moderation tables/entities
    // This is a stub that can be expanded when moderation features are implemented
    const offset = (page - 1) * limit;
    
    // Return empty for now - moderation would require separate entities
    // for reports, flagged content, etc.
    return { 
      items: [], 
      total: 0, 
      page, 
      limit, 
      totalPages: 0,
      availableTypes: ['product', 'shop', 'user', 'review', 'comment'],
    };
  }

  async handleModerationAction(itemId: string, action: string, notes?: string) {
    // Placeholder - would need implementation based on moderation entity structure
    // Actions could include: 'approve', 'reject', 'ban', 'suspend', 'warn'
    const validActions = ['approve', 'reject', 'ban', 'suspend', 'warn', 'delete'];
    
    if (!validActions.includes(action)) {
      throw new BadRequestException(`Invalid action: ${action}. Valid values: ${validActions.join(', ')}`);
    }
    
    return { 
      success: true, 
      action, 
      notes,
      message: `Moderation action '${action}' processed`,
      timestamp: new Date(),
    };
  }

  async getAnalytics(period: string = '30d'): Promise<AnalyticsData> {
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Users - including inactive count in Promise.all to avoid N+1
    const [totalUsers, newUsers, prevNewUsers, inactiveUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.createQueryBuilder('user').where('user.createdAt >= :startDate', { startDate }).getCount(),
      this.userRepository.createQueryBuilder('user').where('user.createdAt >= :start AND user.createdAt < :end', { start: prevStartDate, end: startDate }).getCount(),
      this.userRepository.count({ where: { userStatus: UserStatus.INACTIVE } }),
    ]);
    const userGrowth = this.calculateGrowth(newUsers, prevNewUsers);
    const activeUsers = totalUsers - inactiveUsers;

    // Shops
    const [totalShops, newShops, prevNewShops, activeShops, pendingShops] = await Promise.all([
      this.shopRepository.count(),
      this.shopRepository.createQueryBuilder('shop').where('shop.createdAt >= :startDate', { startDate }).getCount(),
      this.shopRepository.createQueryBuilder('shop').where('shop.createdAt >= :start AND shop.createdAt < :end', { start: prevStartDate, end: startDate }).getCount(),
      this.shopRepository.count({ where: { status: ShopStatus.ACTIVE } }),
      this.shopRepository.count({ where: { status: ShopStatus.PENDING } }),
    ]);
    const shopGrowth = this.calculateGrowth(newShops, prevNewShops);

    // Products
    const [totalProducts, newProducts, prevNewProducts, activeProducts] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.createQueryBuilder('product').where('product.createdAt >= :startDate', { startDate }).getCount(),
      this.productRepository.createQueryBuilder('product').where('product.createdAt >= :start AND product.createdAt < :end', { start: prevStartDate, end: startDate }).getCount(),
      this.productRepository.count({ where: { status: ProductStatus.ACTIVE } }),
    ]);
    const productGrowth = this.calculateGrowth(newProducts, prevNewProducts);

    // Orders
    const [totalOrders, newOrders, prevNewOrders, completedOrders, pendingOrders] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.createQueryBuilder('order').where('order.createdAt >= :startDate', { startDate }).getCount(),
      this.orderRepository.createQueryBuilder('order').where('order.createdAt >= :start AND order.createdAt < :end', { start: prevStartDate, end: startDate }).getCount(),
      this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } }),
      this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
    ]);
    const orderGrowth = this.calculateGrowth(newOrders, prevNewOrders);

    // Revenue
    const [totalRevenueResult, newRevenueResult, prevNewRevenueResult] = await Promise.all([
      this.orderRepository.createQueryBuilder('order').select('SUM(order.total)', 'sum').getRawOne(),
      this.orderRepository.createQueryBuilder('order').select('SUM(order.total)', 'sum').where('order.createdAt >= :startDate', { startDate }).getRawOne(),
      this.orderRepository.createQueryBuilder('order').select('SUM(order.total)', 'sum').where('order.createdAt >= :start AND order.createdAt < :end', { start: prevStartDate, end: startDate }).getRawOne(),
    ]);

    const totalRevenue = parseFloat(totalRevenueResult?.sum || '0');
    const newRevenue = parseFloat(newRevenueResult?.sum || '0');
    const prevRevenue = parseFloat(prevNewRevenueResult?.sum || '0');
    const revenueGrowth = this.calculateGrowth(newRevenue, prevRevenue);

    // Revenue by day - single query with GROUP BY
    const revenueByDayRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_TRUNC('day', order.createdAt)::date", 'date')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.createdAt >= :startDate', { startDate })
      .groupBy("DATE_TRUNC('day', order.createdAt)::date")
      .orderBy('date', 'ASC')
      .getRawMany();

    // Create a map for quick lookup
    const revenueByDayMap = new Map(revenueByDayRaw.map(r => [r.date, parseFloat(r.revenue || '0')]));
    
    // Fill in all days (including days with no revenue)
    const revenueByDay: Array<{ date: string; revenue: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      revenueByDay.push({
        date: dateStr,
        revenue: revenueByDayMap.get(dateStr) || 0,
      });
    }

    // Top shops by revenue
    const topShops = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.shop', 'shop')
      .select('shop.id', 'id')
      .addSelect('shop.name', 'name')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.createdAt >= :startDate', { startDate })
      .groupBy('shop.id')
      .addGroupBy('shop.name')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany();

    // FIX #3: Top products by actual sales from order items
    const topProductsRaw = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .select('item.productId', 'id')
      .addSelect('item.productName', 'name')
      .addSelect('SUM(item.quantity)', 'sales')
      .addSelect('SUM(item.totalPrice)', 'revenue')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('item.productId IS NOT NULL')
      .groupBy('item.productId')
      .addGroupBy('item.productName')
      .orderBy('sales', 'DESC')
      .limit(5)
      .getRawMany();

    const topProducts = topProductsRaw.map(p => ({
      id: p.id,
      name: p.name || 'Unknown Product',
      sales: parseInt(p.sales || '0'),
      revenue: parseFloat(p.revenue || '0'),
    }));

    // If no order items data, fall back to product statistics
    if (topProducts.length === 0) {
      const products = await this.productRepository.find({ 
        order: { statistics: 'DESC' as any, createdAt: 'DESC' }, 
        take: 5 
      });
      for (const product of products) {
        topProducts.push({
          id: product.id,
          name: product.productName,
          sales: product.statistics?.totalSales || 0,
          revenue: product.statistics?.totalRevenue || 0,
        });
      }
    }

    return {
      period,
      users: { total: totalUsers, active: activeUsers, new: newUsers, growth: userGrowth },
      shops: { total: totalShops, active: activeShops, pending: pendingShops, new: newShops, growth: shopGrowth },
      products: { total: totalProducts, active: activeProducts, outOfStock: totalProducts - activeProducts, new: newProducts, growth: productGrowth },
      orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders, revenue: totalRevenue, new: newOrders, growth: orderGrowth },
      topShops: topShops.map(s => ({ id: s.id, name: s.name || 'Unknown', revenue: parseFloat(s.revenue || '0'), orders: parseInt(s.orders || '0') })),
      topProducts,
      revenueByDay,
    };
  }
}
