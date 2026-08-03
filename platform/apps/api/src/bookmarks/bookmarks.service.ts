import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/types/request-user.interface';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { track: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(userId: string, trackId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.bookmark.create({ data: { userId, trackId } });
    return { bookmarked: true };
  }

  async listCollections(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      include: { items: { include: { track: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCollection(userId: string, name: string) {
    return this.prisma.collection.create({ data: { userId, name } });
  }

  async deleteCollection(actor: RequestUser, collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found.');
    if (collection.userId !== actor.id) throw new ForbiddenException();
    await this.prisma.collection.delete({ where: { id: collectionId } });
    return { success: true };
  }

  async addToCollection(
    actor: RequestUser,
    collectionId: string,
    trackId: string,
  ) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found.');
    if (collection.userId !== actor.id) throw new ForbiddenException();

    const existing = await this.prisma.collectionItem.findUnique({
      where: { collectionId_trackId: { collectionId, trackId } },
    });
    if (existing)
      throw new BadRequestException(
        'This course is already in the collection.',
      );

    return this.prisma.collectionItem.create({
      data: { collectionId, trackId },
    });
  }

  async removeFromCollection(
    actor: RequestUser,
    collectionId: string,
    trackId: string,
  ) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found.');
    if (collection.userId !== actor.id) throw new ForbiddenException();

    await this.prisma.collectionItem.deleteMany({
      where: { collectionId, trackId },
    });
    return { success: true };
  }
}
