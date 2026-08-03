import { Injectable } from '@nestjs/common';
import {
  AccountStatus,
  EnrollmentStatus,
  SubmissionStatus,
  SubmissionType,
  UserRole,
} from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async platformMetrics() {
    const [
      totalStudents,
      totalEvaluators,
      totalAdmins,
      suspendedAccounts,
      pendingSubmissions,
      certificatesAwarded,
      certificatesPending,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.EVALUATOR } }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.user.count({ where: { status: AccountStatus.SUSPENDED } }),
      this.prisma.submission.count({
        where: { status: SubmissionStatus.PENDING },
      }),
      this.prisma.credential.count(),
      this.prisma.submission.count({
        where: {
          type: SubmissionType.CAPSTONE,
          status: SubmissionStatus.PENDING,
        },
      }),
    ]);

    const [totalEnrollments, completedEnrollments] = await Promise.all([
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({
        where: { status: EnrollmentStatus.COMPLETED },
      }),
    ]);

    const platformCompletionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 1000) / 10
        : 0;

    const tracks = await this.prisma.track.findMany({
      include: { category: true },
    });
    const perTrack = await Promise.all(
      tracks.map(async (track) => {
        const [
          enrollments,
          activeLearners,
          completed,
          submissionsTotal,
          submissionsReviewed,
        ] = await Promise.all([
          this.prisma.enrollment.count({ where: { trackId: track.id } }),
          this.prisma.enrollment.count({
            where: { trackId: track.id, status: EnrollmentStatus.IN_PROGRESS },
          }),
          this.prisma.enrollment.count({
            where: { trackId: track.id, status: EnrollmentStatus.COMPLETED },
          }),
          this.prisma.submission.count({
            where: {
              type: SubmissionType.COMPETENCY,
              topic: { module: { trackId: track.id } },
            },
          }),
          this.prisma.submission.count({
            where: {
              type: SubmissionType.COMPETENCY,
              topic: { module: { trackId: track.id } },
              status: { not: SubmissionStatus.PENDING },
            },
          }),
        ]);

        return {
          trackId: track.id,
          trackTitle: track.title,
          category: track.category.name,
          enrollments,
          activeLearners,
          submissionsTotal,
          submissionsReviewed,
          completionRate:
            enrollments > 0
              ? Math.round((completed / enrollments) * 1000) / 10
              : 0,
          certsAwarded: 0,
          certsPending: 0,
        };
      }),
    );

    return {
      totalStudents,
      totalEvaluators,
      totalAdmins,
      suspendedAccounts,
      pendingSubmissions,
      certificatesAwarded,
      certificatesPending,
      platformCompletionRate,
      perTrack,
    };
  }

  async evaluatorInsights(evaluatorId?: string) {
    const where = {
      evaluatorId: evaluatorId ?? undefined,
      status: {
        in: [
          SubmissionStatus.APPROVED,
          SubmissionStatus.REJECTED,
        ] as SubmissionStatus[],
      },
    };

    const graded = await this.prisma.submission.findMany({ where });
    const totalGraded = graded.length;

    const averageGradingScore =
      totalGraded > 0
        ? Math.round(
            (graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / totalGraded) *
              10,
          ) / 10
        : 0;

    const resolutionHours = graded
      .filter((s) => s.evaluatedAt)
      .map(
        (s) =>
          (new Date(s.evaluatedAt!).getTime() -
            new Date(s.submittedAt).getTime()) /
          3_600_000,
      );
    const averageResolutionHours =
      resolutionHours.length > 0
        ? Math.round(
            (resolutionHours.reduce((a, b) => a + b, 0) /
              resolutionHours.length) *
              10,
          ) / 10
        : 0;

    const approved = graded.filter(
      (s) => s.status === SubmissionStatus.APPROVED,
    ).length;
    const firstAttemptPassRate =
      totalGraded > 0 ? Math.round((approved / totalGraded) * 1000) / 10 : 0;

    return {
      averageGradingScore,
      averageResolutionHours,
      firstAttemptPassRate,
      totalGraded,
    };
  }

  async usageReportData() {
    const [metrics, students, auditLogCount] = await Promise.all([
      this.platformMetrics(),
      this.prisma.user.findMany({
        where: { role: UserRole.STUDENT },
        include: { studentProfile: { include: { currentLevel: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      metrics,
      auditLogCount,
      candidates: students.map((s) => ({
        name: s.name,
        email: s.email,
        level: s.studentProfile?.currentLevel.name ?? 'Unassigned',
        status: s.status,
        joinedAt: s.createdAt,
      })),
    };
  }
}
