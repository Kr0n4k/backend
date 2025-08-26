import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  HttpCode, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll() {
    try {
      const products = await this.productService.getAll();
      return products;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    try {
      const product = await this.productService.byId(id);
      return product;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    try {
      const product = await this.productService.bySlug(slug);
      return product;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('by-category/:categorySlug')
  async getByCategory(@Param('categorySlug') categorySlug: string) {
    try {
      const products = await this.productService.byCategory(categorySlug);
      return products;
    } catch (error) {
      return { error: error.message };
    }
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('create')
  async create(@Body() dto: ProductDto) {
    try {
      const product = await this.productService.create(dto);
      return product;
    } catch (error) {
      return { error: error.message };
    }
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ProductDto) {
    try {
      const product = await this.productService.update(id, dto);
      return product;
    } catch (error) {
      return { error: error.message };
    }
  }

  @HttpCode(200)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const product = await this.productService.delete(id);
      return product;
    } catch (error) {
      return { error: error.message };
    }
  }
}