
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard Stats
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers({ search, role, status, page, limit });
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Put('users/:id/approve')
  async approveUser(@Param('id') id: string) {
    return this.adminService.approveUser(id);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user?.id;
    return this.adminService.deleteUser(id, adminId);
  }

  // Shop Management
  @Get('shops')
  async getShops(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getShops({ search, status, page, limit });
  }

  @Get('shops/:id')
  async getShopById(@Param('id') id: string) {
    return this.adminService.getShopById(id);
  }

  @Put('shops/:id/status')
  async updateShopStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.updateShopStatus(id, status, reason);
  }

  @Put('shops/:id/verification')
  async verifyShop(
    @Param('id') id: string,
    @Body('action') action: 'verify' | 'unverify',
    @Request() req: any,
  ) {
    const verifiedBy = req.user?.id || 'admin';
    const level = action === 'verify' ? 'verified' : 'none';
    return this.adminService.verifyShop(id, level, verifiedBy);
  }

  // Product Management
  @Get('products')
  async getProducts(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getProducts(page, limit, status);
  }

  @Put('products/:id/status')
  async updateProductStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateProductStatus(id, status);
  }

  // Order Management
  @Get('orders')
  async getOrders(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getOrders(page, limit, status);
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateOrderStatus(id, status);
  }

  // Moderation
  @Get('moderation')
  async getModerationItems(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getModerationItems(type, status, page, limit);
  }

  @Put('moderation/:id')
  async handleModerationAction(
    @Param('id') id: string,
    @Body('action') action: string,
    @Body('notes') notes?: string,
  ) {
    return this.adminService.handleModerationAction(id, action, notes);
  }

  // Analytics
  @Get('analytics')
  async getAnalytics(@Query('period') period?: string) {
    return this.adminService.getAnalytics(period);
  }

  // Settings
  @Get('settings')
  async getPlatformSettings() {
    return this.adminService.getPlatformSettings();
  }

  @Put('settings')
  async updatePlatformSettings(@Body() settings: Record<string, any>) {
    return this.adminService.updatePlatformSettings(settings);
  }
}

