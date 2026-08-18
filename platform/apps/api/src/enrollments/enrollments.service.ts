import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditLogSeverity,
  EnrollmentStatus,
  SubmissionType,
  TrackStatus,
} from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../common/types/request-user.interface';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listMine(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        track: {
          include: { category: true, modules: { include: { topics: true } } },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const topicIds = enrollments.flatMap((e) =>
      e.track.modules.flatMap((m) => m.topics.map((t) => t.id)),
    );
    const watched = await this.prisma.topicProgress.findMany({
      where: { userId, topicId: { in: topicIds }, watched: true },
      select: { topicId: true },
    });
    const watchedSet = new Set(watched.map((w) => w.topicId));

    return enrollments.map((e) => {
      const allTopicIds = e.track.modules.flatMap((m) =>
        m.topics.map((t) => t.id),
      );
      const completedTopicCount = allTopicIds.filter((id) =>
        watchedSet.has(id),
      ).length;
      return {
        id: e.id,
        userId: e.userId,
        trackId: e.trackId,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completedTopicCount,
        totalTopicCount: allTopicIds.length,
        track: {
          id: e.track.id,
          title: e.track.title,
          description: e.track.description,
          icon: e.track.icon,
          coverImageUrl: e.track.coverImageUrl,
          category: e.track.category,
          difficulty: e.track.difficulty,
          durationWeeks: e.track.durationWeeks,
          status: e.track.status,
        },
      };
    });
  }

  async enroll(actor: RequestUser, trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });
    if (!track) throw new NotFoundException('Track not found.');
    if (track.status !== TrackStatus.PUBLISHED) {
      throw new BadRequestException(
        'This track is not yet published for enrollment.',
      );
    }

    const enrollment = await this.prisma.enrollment.upsert({
      where: { userId_trackId: { userId: actor.id, trackId } },
      update: {},
      create: {
        userId: actor.id,
        trackId,
        status: EnrollmentStatus.NOT_STARTED,
      },
    });

    await this.auditService.log({
      actor,
      action: `Enrolled in "${track.title}"`,
      entityType: 'Enrollment',
      entityId: enrollment.id,
    });

    return enrollment;
  }

  async start(actor: RequestUser, trackId: string) {
    const enrollment = await this.findEnrollment(actor.id, trackId);
    if (enrollment.status === EnrollmentStatus.NOT_STARTED) {
      return this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: EnrollmentStatus.IN_PROGRESS },
      });
    }
    return enrollment;
  }

  /**
   * Unenrolling is a hard reset, not a pause: watch progress and the coursework
   * the student submitted for this track are removed so a later re-enrolment
   * starts from zero rather than resuming mid-course.
   *
   * Capstones are deliberately left alone — they hang off a certification Level
   * rather than a track, and deleting them would invalidate issued credentials.
   */
  async unenroll(actor: RequestUser, trackId: string) {
    const enrollment = await this.findEnrollment(actor.id, trackId);

    const modules = await this.prisma.module.findMany({
      where: { trackId },
      select: { id: true, topics: { select: { id: true } } },
    });
    const moduleIds = modules.map((m) => m.id);
    const topicIds = modules.flatMap((m) => m.topics.map((t) => t.id));

    await this.prisma.$transaction([
      this.prisma.topicProgress.deleteMany({
        where: { userId: actor.id, topicId: { in: topicIds } },
      }),
      this.prisma.submission.deleteMany({
        where: {
          studentId: actor.id,
          type: SubmissionType.COMPETENCY,
          OR: [
            { topicId: { in: topicIds } },
            { moduleId: { in: moduleIds } },
          ],
        },
      }),
      this.prisma.enrollment.delete({ where: { id: enrollment.id } }),
    ]);

    await this.auditService.log({
      actor,
      action: `Unenrolled from a certification track and reset all progress for it`,
      entityType: 'Enrollment',
      entityId: enrollment.id,
      severity: AuditLogSeverity.WARNING,
    });

    return { success: true };
  }

  async markCompleted(userId: string, trackId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (!enrollment) return null;
    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: EnrollmentStatus.COMPLETED },
    });
  }

  private async findEnrollment(userId: string, trackId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (!enrollment)
      throw new NotFoundException('You are not enrolled in this track.');
    return enrollment;
  }
}
