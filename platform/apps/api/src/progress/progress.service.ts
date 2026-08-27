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

    await this.maybeCompleteTrack(actor.id, topic.module.trackId);

    await this.auditService.log({
      actor,
      action: `Completed watching topic "${topic.title}"`,
      entityType: 'Topic',
      entityId: topicId,
    });

    return progress;
  }

  /**
   * Marks a course complete once every lesson is watched — but only for courses that have
   * no final assessment. Where an author wrote one, passing it stays the thing that
   * completes the course (see QuizzesService), so the exam keeps its meaning.
   *
   * Without this, a course with no assessment could never be completed at all, which
   * meant nobody enrolled in it could ever claim a certificate no matter how much of it
   * they finished. Four of the seven published courses were in exactly that state.
   */
  private async maybeCompleteTrack(userId: string, trackId: string) {
    const enrolment = await this.prisma.enrollment.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (!enrolment || enrolment.status === EnrollmentStatus.COMPLETED) return;

    const assessment = await this.prisma.trackAssessment.findUnique({
      where: { trackId },
      select: { id: true },
    });
    if (assessment) return;

    const topics = await this.prisma.topic.findMany({
      where: { module: { trackId } },
      select: { id: true },
    });
    // A course with no lessons at all is project-based; finishing it is not something
    // watching can decide, so leave it to the capstone/submission flow.
    if (topics.length === 0) return;

    const watched = await this.prisma.topicProgress.count({
      where: {
        userId,
        watched: true,
        topicId: { in: topics.map((t) => t.id) },
      },
    });
    if (watched < topics.length) return;

    await this.prisma.enrollment.update({
      where: { id: enrolment.id },
      data: { status: EnrollmentStatus.COMPLETED },
    });
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
