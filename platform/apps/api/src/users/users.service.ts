import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountStatus,
  AuditLogSeverity,
  NotificationType,
  UserRole,
} from '@dojo-hub/shared';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestUser } from '../common/types/request-user.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async directory(role: UserRole | undefined, search: string | undefined) {
    const users = await this.prisma.user.findMany({
      where: {
        ...(role
          ? { role }
          : { role: { in: [UserRole.STUDENT, UserRole.EVALUATOR] } }),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { studentProfile: { include: { currentLevel: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Pending submissions sit in one shared queue any evaluator (or admin) can act on —
    // there's no per-evaluator assignment, so this count is the same for every supervisor.
    const pendingPlatformWide = users.some((u) => u.role === UserRole.EVALUATOR)
      ? await this.prisma.submission.count({ where: { status: 'PENDING' } })
      : 0;

    return Promise.all(
      users.map(async (user) => {
        if (user.role === UserRole.STUDENT) {
          const [certificates, cumulativeEnrollments, activeEnrollments] =
            await Promise.all([
              this.prisma.credential.count({ where: { studentId: user.id } }),
              this.prisma.enrollment.count({ where: { userId: user.id } }),
              this.prisma.enrollment.count({
                where: { userId: user.id, status: 'IN_PROGRESS' },
              }),
            ]);
          return {
            ...user,
            passwordHash: undefined,
            stats: { certificates, cumulativeEnrollments, activeEnrollments },
          };
        }

        if (user.role === UserRole.EVALUATOR) {
          const evaluationsDone = await this.prisma.submission.count({
            where: {
              evaluatorId: user.id,
              status: { in: ['APPROVED', 'REJECTED'] },
            },
          });
          return {
            ...user,
            passwordHash: undefined,
            stats: { evaluationsDone, pendingPlatformWide },
          };
        }

        return { ...user, passwordHash: undefined, stats: {} };
      }),
    );
  }

  async findOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async suspend(actor: RequestUser, targetId: string) {
    const target = await this.findOrThrow(targetId);
    if (target.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Administrator accounts cannot be suspended.',
      );
    }

    await this.prisma.user.update({
      where: { id: targetId },
      data: { status: AccountStatus.SUSPENDED },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: targetId },
      data: { revoked: true },
    });

    await this.auditService.log({
      actor,
      action: `Suspended account access for "${target.name}" (${target.email})`,
      entityType: 'User',
      entityId: targetId,
      severity: AuditLogSeverity.WARNING,
    });

    await this.notificationsService.notify({
      userId: targetId,
      type: NotificationType.ACCOUNT_SUSPENDED,
      title: 'Account suspended',
      body: 'Your Dojo Hub account access has been suspended by a platform administrator.',
    });

    return { success: true };
  }

  async reactivate(actor: RequestUser, targetId: string) {
    const target = await this.findOrThrow(targetId);

    await this.prisma.user.update({
      where: { id: targetId },
      data: { status: AccountStatus.ACTIVE },
    });

    await this.auditService.log({
      actor,
      action: `Reactivated account access for "${target.name}" (${target.email})`,
      entityType: 'User',
      entityId: targetId,
      severity: AuditLogSeverity.SUCCESS,
    });

    await this.notificationsService.notify({
      userId: targetId,
      type: NotificationType.ACCOUNT_REACTIVATED,
      title: 'Account reactivated',
      body: 'Your Dojo Hub account access has been restored.',
    });

    return { success: true };
  }

  async terminate(actor: RequestUser, targetId: string) {
    const target = await this.findOrThrow(targetId);
    if (target.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Administrator accounts cannot be terminated.',
      );
    }

    if (target.role === UserRole.EVALUATOR) {
      const [gradingHistory, signedCredentials] = await Promise.all([
        this.prisma.submission.count({ where: { evaluatorId: targetId } }),
        this.prisma.credential.count({
          where: {
            OR: [
              { evaluatorSignatureId: targetId },
              { adminSignatureId: targetId },
            ],
          },
        }),
      ]);
      if (gradingHistory > 0 || signedCredentials > 0) {
        throw new BadRequestException(
          'This evaluator has grading history on the platform and cannot be permanently deleted. Suspend the account instead to preserve academic records.',
        );
      }
    }

    await this.prisma.user.delete({ where: { id: targetId } });

    await this.auditService.log({
      actor,
      action: `Permanently terminated account "${target.name}" (${target.email})`,
      entityType: 'User',
      entityId: targetId,
      severity: AuditLogSeverity.ERROR,
    });

    return { success: true };
  }

  /**
   * Moves a student to the next rung of the Level ladder. Called when an evaluator
   * approves a student's capstone submission for their current level — that approval
   * is the sole trigger for advancement (no scoring/threshold math involved).
   * If the student is already at the top level, this is a no-op.
   */
  async advanceToNextLevel(studentId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.studentProfile.findUniqueOrThrow({
        where: { userId: studentId },
        include: { currentLevel: true },
      });

      const next = await tx.level.findFirst({
        where: { order: { gt: profile.currentLevel.order } },
        orderBy: { order: 'asc' },
      });

      if (!next) {
        return { currentLevel: profile.currentLevel, leveledUp: false };
      }

      await tx.studentProfile.update({
        where: { userId: studentId },
        data: { currentLevelId: next.id },
      });

      return { currentLevel: next, leveledUp: true };
    });

    if (result.leveledUp) {
      await this.notificationsService.notify({
        userId: studentId,
        type: NotificationType.LEVEL_UP,
        title: `You've advanced to ${result.currentLevel.name}!`,
        body: `Congratulations — your approved capstone has unlocked the ${result.currentLevel.name} level.`,
      });
    }

    return result;
  }

  /**
   * Sets a new password on behalf of a user. There is no self-service reset yet, so
   * this is the only recovery path when someone mistypes their password at signup.
   *
   * Every existing session is revoked: a password change must invalidate anyone
   * already holding a refresh token for that account.
   */
  async adminResetPassword(actor: RequestUser, userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      }),
    ]);

    await this.auditService.log({
      actor,
      action: `Reset the password for "${user.name}" (${user.email})`,
      entityType: 'User',
      entityId: userId,
      severity: AuditLogSeverity.WARNING,
    });

    return { success: true };
  }
}
