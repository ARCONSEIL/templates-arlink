import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product, ProductStatus } from './product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'statut', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'categorie', required: false })
  @ApiQuery({ name: 'boutiqueId', required: false })
  @ApiQuery({ name: 'vedette', required: false, type: Boolean })
  async findAll(
    @Query('statut') statut?: ProductStatus,
    @Query('categorie') categorie?: string,
    @Query('boutiqueId') boutiqueId?: string,
    @Query('vedette') vedette?: boolean,
  ): Promise<Product[]> {
    return this.productsService.findAll({
      statut,
      categorie,
      boutiqueId,
      vedette,
    });
  }

  @Get('vedettes')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getVedettes(@Query('limit') limit?: number) {
    return this.productsService.getVedettes(limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get('boutique/:boutiqueId')
  @ApiOperation({ summary: 'Get products by boutique' })
  async findByBoutique(@Param('boutiqueId') boutiqueId: string) {
    return this.productsService.findByBoutiqueId(boutiqueId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string): Promise<Product> {
    await this.productsService.incrementVues(id);
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() createData: Partial<Product>): Promise<Product> {
    return this.productsService.create(createData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Product>,
  ): Promise<Product> {
    return this.productsService.update(id, updateData);
  }

  @Put(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock' })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<Product> {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
