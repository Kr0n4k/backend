// category.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { returnCategoryObject } from './return-category.object';
import { CategoryDto } from './dto/category.dto';
import { SlugGenerator } from '../utils/generate-slug';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService){}

  async getAll() {
    return this.prisma.category.findMany({
      select: returnCategoryObject
    });
  }

  async byId(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id }, 
      select: returnCategoryObject
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async bySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug }, 
      select: returnCategoryObject
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CategoryDto) {
    const slug = await SlugGenerator.generateUnique(
      dto.name || '',
      async (slug: string) => {
        const existing = await this.prisma.category.findUnique({
          where: { slug }
        });
        return !!existing;
      },
      100
    );

    return this.prisma.category.create({
      data: {
        name: dto.name || '',
        slug: slug,
        image: dto.image || ''
      }
    });
  }

  async update(id: string, dto: CategoryDto) {
    const existingCategory = await this.validateCategoryExists(id);

    const slug = await this.generateSlugForUpdate(id, dto.name, existingCategory.name, existingCategory.slug);

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: slug,
        image: dto.image
      }
    });
  }

  async delete(id: string) {
    await this.validateCategoryExists(id);

    return this.prisma.category.delete({
      where: { id }
    });
  }

  private async validateCategoryExists(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async generateSlugForUpdate(id: string, newName: string, oldName: string, currentSlug: string) {
    if (newName && newName !== oldName) {
      return await SlugGenerator.generateUnique(
        newName,
        async (testSlug: string) => {
          const existing = await this.prisma.category.findFirst({
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