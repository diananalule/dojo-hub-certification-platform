import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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
import { EmailService } from '../email/email.service';
import { RequestUser } from '../common/types/request-user.interface';

/** Human-readable role names, so audit entries and emails read like the UI does. */
const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Student',
  [UserRole.EVALUATOR]: 'Senior Supervisor',
  [UserRole.ADMIN]: 'Platform Admin',
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
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
      body: 'Your Dojo Hub Learning Platform account access has been suspended by a platform administrator.',
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
      body: 'Your Dojo Hub Learning Platform account access has been restored.',
    });

    return { success: true };
  }

  /**
   * Grants or changes a workspace role. This is the only way an admin account can come
   * into existence: registration is deliberately limited to students and evaluators, so
   * a new tutor signs up normally, verifies their email, and is promoted here.
   *
   * Two guards exist to keep the platform from becoming unadministrable. An admin cannot
   * change their own role, which would otherwise let someone demote themselves out of the
   * only account that can undo it; and the last remaining admin cannot be demoted by
   * anyone, which would leave nobody able to author courses or manage users.
   */
  async changeRole(actor: RequestUser, targetId: string, role: UserRole) {
    const target = await this.findOrThrow(targetId);

    if (target.id === actor.id) {
      throw new ForbiddenException(
        'You cannot change your own role. Ask another administrator to do it.',
      );
    }

    if (target.role === role) {
      throw new BadRequestException(`This account is already a ${ROLE_LABEL[role]}.`);
    }

    if (target.role === UserRole.ADMIN) {
      const admins = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, status: AccountStatus.ACTIVE },
      });
      if (admins <= 1) {
        throw new ForbiddenException(
          'This is the last administrator account. Promote another administrator first.',
        );
      }
    }

    await this.prisma.user.update({ where: { id: targetId }, data: { role } });

    // The old role is baked into the access token, so anything still holding one would
    // keep the previous permissions until it expired. Dropping the refresh tokens forces
    // a fresh sign-in and a token that reflects the new role.
    await this.prisma.refreshToken.updateMany({
      where: { userId: targetId },
      data: { revoked: true },
    });

    await this.auditService.log({
      actor,
      action: `Changed role for "${target.name}" (${target.email}) from ${ROLE_LABEL[target.role]} to ${ROLE_LABEL[role]}`,
      entityType: 'User',
      entityId: targetId,
      severity: AuditLogSeverity.WARNING,
    });

    await this.notificationsService.notify({
      userId: targetId,
      type: NotificationType.ROLE_CHANGED,
      title: `You are now a ${ROLE_LABEL[role]}`,
      body: `A platform administrator changed your role to ${ROLE_LABEL[role]}. Sign in again to use your new permissions.`,
      email: {
        subject: `Your Dojo Hub Learning Platform role changed to ${ROLE_LABEL[role]}`,
        block: {
          heading: `You are now a ${ROLE_LABEL[role]}`,
          intro: `A platform administrator changed your role on Dojo Hub Learning Platform. You will need to sign in again for the change to take effect.`,
          facts: [
            { label: 'Previous role', value: ROLE_LABEL[target.role] },
            { label: 'New role', value: ROLE_LABEL[role] },
          ],
          outro: 'If you were not expecting this, contact your platform administrator.',
        },
      },
    });

    return { success: true };
  }

  /**
   * Reassigns an account's email address.
   *
   * Exists because an address is otherwise locked to an account forever: submissions and
   * credentials deliberately outlive a deleted user (a certificate stays verifiable, with
   * the holder shown as "Former student"), so an evaluator who has graded anything cannot
   * be terminated, and their address can never be reused. Moving the account off the
   * address frees it without destroying a single record. It also fixes the more ordinary
   * case of an address mistyped at signup, which previously had no remedy at all.
   *
   * The new address is treated as unproven: verification is reset and a fresh confirmation
   * link is sent to it. Otherwise an admin could point an account at any address and have
   * it count as verified.
   */
  async changeEmail(actor: RequestUser, targetId: string, rawEmail: string) {
    const target = await this.findOrThrow(targetId);
    const email = rawEmail.trim().toLowerCase();

    if (email === target.email) {
      throw new BadRequestException(
        'This account already uses that email address.',
      );
    }

    const taken = await this.prisma.user.findUnique({ where: { email } });
    if (taken) {
      throw new ConflictException('Another account already uses that email address.');
    }

    const verificationToken = randomUUID();
    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        email,
        emailVerifiedAt: null,
        verificationToken,
        verificationSentAt: new Date(),
      },
    });

    // The email travels inside the access token, so existing sessions would keep
    // presenting the old identity until they expired.
    await this.prisma.refreshToken.updateMany({
      where: { userId: targetId },
      data: { revoked: true },
    });

    await this.auditService.log({
      actor,
      action: `Changed email for "${target.name}" from ${target.email} to ${email}`,
      entityType: 'User',
      entityId: targetId,
      severity: AuditLogSeverity.WARNING,
    });

    const web = process.env.WEB_URL ?? 'https://dojo-hub-web.onrender.com';
    await this.emailService.send({
      to: email,
      subject: 'Confirm your new email for Dojo Hub Learning Platform',
      block: {
        heading: 'Confirm your new email address',
        intro:
          `A platform administrator changed the email address on your Dojo Hub Learning Platform ` +
          `account to this one. Confirm it to activate the account — you will not be able to sign in until you do.`,
        ctaLabel: 'Confirm my email address',
        ctaUrl: `${web}/verify-email?token=${verificationToken}`,
        outro: 'If you were not expecting this, contact your platform administrator.',
      },
    });

    return { success: true, email };
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
