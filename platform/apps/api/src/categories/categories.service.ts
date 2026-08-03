import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertCategoryDto } from './dto/upsert-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: UpsertCategoryDto) {
    await this.assertNameAvailable(dto.name);
    return this.prisma.category.create({
      data: { name: dto.name.trim(), isDefault: false },
    });
  }

  async rename(id: string, dto: UpsertCategoryDto) {
    const category = await this.findById(id);
    if (dto.name.trim().toLowerCase() !== category.name.toLowerCase()) {
      await this.assertNameAvailable(dto.name);
    }
    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name.trim() },
    });
  }

  async remove(id: string) {
    const category = await this.findById(id);
    if (category.isDefault) {
      throw new BadRequestException('Default categories cannot be deleted.');
    }
    const tracksUsingIt = await this.prisma.track.count({
      where: { categoryId: id },
    });
    if (tracksUsingIt > 0) {
      throw new BadRequestException(
        'Cannot delete a category that is still assigned to tracks.',
      );
    }
    return this.prisma.category.delete({ where: { id } });
  }

  private async findById(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found.');
    return category;
  }

  private async assertNameAvailable(name: string) {
    const clash = await this.prisma.category.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
    });
    if (clash)
      throw new BadRequestException(
        'A category with this name already exists.',
      );
  }
}
