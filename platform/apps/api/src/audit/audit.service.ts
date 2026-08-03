import { Injectable } from '@nestjs/common';
import { AuditLogSeverity, UserRole } from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/types/request-user.interface';

interface LogParams {
  actor: RequestUser | null;
  action: string;
  entityType?: string;
  entityId?: string;
  severity?: AuditLogSeverity;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogParams) {
    const {
      actor,
      action,
      entityType,
      entityId,
      severity = AuditLogSeverity.INFO,
    } = params;

    return this.prisma.auditLog.create({
      data: {
        actorId: actor?.id ?? null,
        actorName: actor?.name ?? 'System',
        actorRole: actor?.role ?? ('GUEST' as UserRole),
        action,
        entityType,
        entityId,
        severity,
      },
    });
  }

  async list(params: {
    actorId?: string;
    severity?: AuditLogSeverity;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  }) {
    const { actorId, severity, from, to, page, pageSize } = params;

    const where = {
      ...(actorId ? { actorId } : {}),
      ...(severity ? { severity } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
