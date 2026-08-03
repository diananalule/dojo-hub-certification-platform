import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus } from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../common/types/request-user.interface';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async savePosition(userId: string, topicId: string, positionSeconds: number) {
    return this.prisma.topicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { lastPositionSeconds: positionSeconds },
      create: { userId, topicId, lastPositionSeconds: positionSeconds },
    });
  }

  async markWatched(actor: RequestUser, topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { module: true },
    });
    if (!topic) throw new NotFoundException('Topic not found.');

    const progress = await this.prisma.topicProgress.upsert({
      where: { userId_topicId: { userId: actor.id, topicId } },
      update: { watched: true, watchedAt: new Date() },
      create: {
        userId: actor.id,
        topicId,
        watched: true,
        watchedAt: new Date(),
      },
    });

    await this.prisma.enrollment.updateMany({
      where: {
        userId: actor.id,
        trackId: topic.module.trackId,
        status: EnrollmentStatus.NOT_STARTED,
      },
      data: { status: EnrollmentStatus.IN_PROGRESS },
    });

    await this.auditService.log({
      actor,
      action: `Completed watching topic "${topic.title}"`,
      entityType: 'Topic',
      entityId: topicId,
    });

    return progress;
  }

  async forTrack(userId: string, trackId: string) {
    const topics = await this.prisma.topic.findMany({
      where: { module: { trackId } },
      select: { id: true },
    });
    const progress = await this.prisma.topicProgress.findMany({
      where: { userId, topicId: { in: topics.map((t) => t.id) } },
    });
    return progress;
  }
}
