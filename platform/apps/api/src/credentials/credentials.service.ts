import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID } from 'crypto';
import * as QRCode from 'qrcode';
import {
  AuditLogSeverity,
  CredentialStatus,
  NotificationType,
  UserRole,
} from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestUser } from '../common/types/request-user.interface';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async issue(studentId: string, levelId: string, evaluatorId: string) {
    const id = randomUUID();
    const issuedAt = new Date();
    const hash = this.computeHash(id, studentId, levelId, issuedAt);

    const credential = await this.prisma.credential.create({
      data: {
        id,
        studentId,
        levelId,
        issuedAt,
        hash,
        status: CredentialStatus.ACTIVE,
        evaluatorSignatureId: evaluatorId,
      },
      include: { level: true },
    });

    await this.notificationsService.notify({
      userId: studentId,
      type: NotificationType.CREDENTIAL_ISSUED,
      title: `Your ${credential.level.name} credential has been issued!`,
      body: 'Your new certification is now available in My Certificates, cryptographically signed and ready to verify.',
    });

    return credential;
  }

  async listForStudent(studentId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { studentId },
      include: { level: true, evaluatorSignature: true, adminSignature: true },
      orderBy: { issuedAt: 'desc' },
    });
    return Promise.all(credentials.map((c) => this.toPublicShape(c)));
  }

  async verify(id: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
      include: { level: true, evaluatorSignature: true, adminSignature: true },
    });
    if (!credential) {
      return {
        valid: false,
        reason: 'No credential found with this identifier.',
      };
    }

    const expectedHash = this.computeHash(
      credential.id,
      credential.studentId,
      credential.levelId,
      credential.issuedAt,
    );
    const integrityOk = expectedHash === credential.hash;
    const student = await this.prisma.user.findUnique({
      where: { id: credential.studentId },
    });

    return {
      valid: integrityOk && credential.status === CredentialStatus.ACTIVE,
      integrityOk,
      status: credential.status,
      credential: {
        ...(await this.toPublicShape(credential)),
        studentName: student?.name ?? 'Former student',
      },
    };
  }

  async countersign(actor: RequestUser, id: string) {
    if (actor.role !== UserRole.ADMIN) throw new ForbiddenException();
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });
    if (!credential) throw new NotFoundException('Credential not found.');

    const updated = await this.prisma.credential.update({
      where: { id },
      data: { adminSignatureId: actor.id },
      include: { level: true },
    });

    await this.auditService.log({
      actor,
      action: `Countersigned credential ${id} (${updated.level.name})`,
      entityType: 'Credential',
      entityId: id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return updated;
  }

  async revoke(actor: RequestUser, id: string, reason: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });
    if (!credential) throw new NotFoundException('Credential not found.');
    if (credential.status === CredentialStatus.REVOKED) {
      throw new BadRequestException(
        'This credential has already been revoked.',
      );
    }

    const updated = await this.prisma.credential.update({
      where: { id },
      data: { status: CredentialStatus.REVOKED },
    });

    await this.auditService.log({
      actor,
      action: `Revoked credential ${id}: ${reason}`,
      entityType: 'Credential',
      entityId: id,
      severity: AuditLogSeverity.ERROR,
    });

    return updated;
  }

  private computeHash(
    id: string,
    studentId: string,
    levelId: string,
    issuedAt: Date,
  ) {
    const secret = this.configService.get<string>('credential.hmacSecret')!;
    return createHmac('sha256', secret)
      .update(`${id}|${studentId}|${levelId}|${issuedAt.toISOString()}`)
      .digest('hex');
  }

  private async toPublicShape(credential: {
    id: string;
    studentId: string;
    levelId: string;
    level: {
      id: string;
      name: string;
      order: number;
      passingScore: number;
    };
    issuedAt: Date;
    hash: string;
    status: CredentialStatus;
    evaluatorSignature: { name: string } | null;
    adminSignature: { name: string } | null;
  }) {
    const appUrl = this.configService.get<string>('webUrl');
    const student = await this.prisma.user.findUnique({
      where: { id: credential.studentId },
    });
    return {
      id: credential.id,
      studentId: credential.studentId,
      studentName: student?.name ?? 'Former student',
      studentEmail: student?.email ?? '',
      levelId: credential.levelId,
      level: credential.level,
      issuedAt: credential.issuedAt,
      hash: credential.hash,
      verifyUrl: `${appUrl}/verify/${credential.id}`,
      status: credential.status,
      evaluatorSignatureName: credential.evaluatorSignature?.name ?? null,
      adminSignatureName: credential.adminSignature?.name ?? null,
    };
  }

  async qrCodeDataUrl(id: string) {
    const appUrl = this.configService.get<string>('webUrl');
    return QRCode.toDataURL(`${appUrl}/verify/${id}`, {
      margin: 1,
      width: 240,
    });
  }
}
