import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}


  @Get()
  async getAll(){
    return this.categoryService.getAll()
  }

  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    try {
      const category = await this.categoryService.byId(id);
      return category;
    } catch (error) {
      return error;
    }
  }

  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    try {
      const category = await this.categoryService.bySlug(slug);
      return category;
    } catch (error) {
      return error;
    }
  }

  @Post('create')
  @HttpCode(200)
  async create(){
    try {
      const category = await this.categoryService.create();
      return category;
    } catch (error) {
      return error;
    }
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CategoryDto) {
    try {
      const category = await this.categoryService.update(id, dto);
      return category;
    } catch (error) {
      return error;
    }
  }

  @Delete('delete/:id')
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    try {
      const category = await this.categoryService.delete(id);
      return category;
    } catch (error) {
      return error;
    }
  }
}
