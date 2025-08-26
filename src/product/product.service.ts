// product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { returnProductObject } from './return-product-objects';
import { SlugGenerator } from '../utils/generate-slug'
import { ProductDto } from './dto/product.dto';
import { PrismaService } from 'src/prisma.service';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService, 
    private categoryService: CategoryService
  ) {}

  async getAll() {
    return this.prisma.product.findMany({
      select: returnProductObject
    });
  }

  async byId(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: returnProductObject
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: returnProductObject
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async byCategory(categorySlug: string) {
    const category = await this.categoryService.bySlug(categorySlug);
    
    const products = await this.prisma.product.findMany({
      where: { categoryId: category.id },
      select: returnProductObject
    });
    
    return products;
  }

  async create(dto: ProductDto) {
    if (dto.categoryId) {
      await this.validateCategoryExists(dto.categoryId);
    }

    const slug = await SlugGenerator.generateUnique(
      dto.name,
      async (slug: string) => {
        const existing = await this.prisma.product.findUnique({
          where: { slug }
        });
        return !!existing;
      },
      100
    );

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image: dto.image,
        slug: slug,
        categoryId: dto.categoryId,
      }
    });
  }

  async update(id: string, dto: ProductDto) {
    const existingProduct = await this.validateProductExists(id);

    if (dto.categoryId && dto.categoryId !== existingProduct.categoryId) {
      await this.validateCategoryExists(dto.categoryId);
    }

    const slug = await this.generateSlugForUpdate(id, dto.name, existingProduct.name, existingProduct.slug);

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image: dto.image,
        slug: slug,
        categoryId: dto.categoryId,
      }
    });
  }

  async delete(id: string) {
    await this.validateProductExists(id);

    return this.prisma.product.delete({
      where: { id }
    });
  }

  private async validateProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private async validateCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async generateSlugForUpdate(id: string, newName: string, oldName: string, currentSlug: string) {
    if (newName && newName !== oldName) {
      return await SlugGenerator.generateUnique(
        newName,
        async (testSlug: string) => {
          const existing = await this.prisma.product.findFirst({
            where: { 
              slug: testSlug,
              id: { not: id }
            }
          });
          return !!existing;
        },
        100
      );
    }
    return currentSlug;
  }
}