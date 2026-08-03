import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertLevelDto } from './dto/upsert-level.dto';

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.level.findMany({ orderBy: { order: 'asc' } });
  }

  async findById(id: string) {
    const level = await this.prisma.level.findUnique({ where: { id } });
    if (!level) throw new NotFoundException('Level not found.');
    return level;
  }

  async create(dto: UpsertLevelDto) {
    const clash = await this.prisma.level.findFirst({
      where: { OR: [{ name: dto.name }, { order: dto.order }] },
    });
    if (clash)
      throw new BadRequestException(
        'A level with this name or order already exists.',
      );
    return this.prisma.level.create({ data: dto });
  }

  async update(id: string, dto: Partial<UpsertLevelDto>) {
    await this.findById(id);
    return this.prisma.level.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    const [inUse, hasCredentials] = await Promise.all([
      this.prisma.studentProfile.count({ where: { currentLevelId: id } }),
      this.prisma.credential.count({ where: { levelId: id } }),
    ]);
    if (inUse > 0 || hasCredentials > 0) {
      throw new BadRequestException(
        'Cannot delete a level that students are currently on or have credentials for.',
      );
    }
    return this.prisma.level.delete({ where: { id } });
  }

  /** The next level in the ladder after `currentOrder`, or null if already at the top. */
  async getNextLevel(currentOrder: number) {
    return this.prisma.level.findFirst({
      where: { order: { gt: currentOrder } },
      orderBy: { order: 'asc' },
    });
  }
}
