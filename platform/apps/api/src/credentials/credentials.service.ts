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
  EnrollmentStatus,
  NotificationType,
  UserRole,
} from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestUser } from '../common/types/request-user.interface';

/*
 * The onrender.com fallback is deliberate, not a leftover. Certificates print and encode
 * their verification link at the moment they are issued, so every PDF already in a
 * student's hands points at whichever host was configured then. That address has to keep
 * resolving for those to stay verifiable, which is why the platform moved to
 * learn.dojohubug.com by *adding* a domain rather than renaming the service.
 */
const WEB = process.env.WEB_URL ?? 'https://dojo-hub-web.onrender.com';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Issues the certificate for a completed course. The student claims it themselves —
   * finish the course, press the button, get the certificate — rather than waiting on a
   * capstone review, which is how the ladder credential worked.
   *
   * The only gate is that the enrolment is actually COMPLETED, which is set when the
   * track assessment is passed. Checking it here rather than trusting the caller matters:
   * the button is just a UI affordance, and this endpoint is reachable without it.
   *
   * Deliberately unsigned by an evaluator: nobody reviewed it. A future rule ("no
   * certificate below 90%") belongs here, and would set evaluatorSignatureId when it
   * starts requiring a human.
   */
  async claimForTrack(studentId: string, trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      include: { category: true },
    });
    if (!track) throw new NotFoundException('Course not found.');

    const enrolment = await this.prisma.enrollment.findUnique({
      where: { userId_trackId: { userId: studentId, trackId } },
    });
    if (!enrolment) {
      throw new BadRequestException('You are not enrolled in this course.');
    }
    if (enrolment.status !== EnrollmentStatus.COMPLETED) {
      // The stored status is set when a lesson is watched or an assessment passed, so a
      // student who finished a course before that rule existed would be stuck with an
      // enrolment that never got flagged. Re-check the same condition here rather than
      // stranding them: for a course with no assessment, every lesson watched is
      // completion, and this repairs the status on the way through.
      const completed = await this.hasFinishedTrack(studentId, trackId);
      if (!completed) {
        throw new BadRequestException(
          'Finish the course before claiming your certificate.',
        );
      }
      await this.prisma.enrollment.update({
        where: { id: enrolment.id },
        data: { status: EnrollmentStatus.COMPLETED },
      });
    }

    // Claiming twice hands back the existing certificate rather than minting a second
    // one, so a double-tap or a re-visit cannot produce duplicates.
    const existing = await this.prisma.credential.findFirst({
      where: { studentId, trackId, status: CredentialStatus.ACTIVE },
      include: {
        level: true,
        track: { include: { category: true } },
        evaluatorSignature: true,
        adminSignature: true,
      },
    });
    if (existing) return this.toPublicShape(existing);

    const id = randomUUID();
    const issuedAt = new Date();
    const hash = this.computeHash(id, studentId, trackId, issuedAt);

    const credential = await this.prisma.credential.create({
      data: {
        id,
        studentId,
        trackId,
        issuedAt,
        hash,
        status: CredentialStatus.ACTIVE,
      },
      include: {
        level: true,
        track: { include: { category: true } },
        evaluatorSignature: true,
        adminSignature: true,
      },
    });

    await this.notificationsService.notify({
      userId: studentId,
      type: NotificationType.CREDENTIAL_ISSUED,
      title: `Your certificate for ${track.title} is ready`,
      body: 'It is available in My Certificates, and carries a QR code anyone can verify.',
      email: {
        subject: `Your certificate for ${track.title} is ready`,
        block: {
          heading: 'Congratulations — your certificate has been issued',
          intro:
            `You completed ${track.title}, and your certificate is now available. It carries a ` +
            'QR code that anyone can scan to verify it, without needing an account.',
          facts: [
            { label: 'Course', value: track.title },
            { label: 'Issued', value: issuedAt.toDateString() },
          ],
          ctaLabel: 'View and download your certificate',
          // The public verification page, not the dashboard: it opens on any phone,
          // tablet or laptop with no sign-in, which is what a link in an email needs
          // to do. It is the same page an employer reaches by scanning the QR code.
          ctaUrl: `${WEB}/verify/${id}`,
          outro:
            'The link opens on any device without signing in, and the certificate can be ' +
            'downloaded as a PDF from there.',
        },
      },
    });

    return this.toPublicShape(credential);
  }

  /**
   * Whether the student has finished the course by the same rule the progress tracker
   * applies: a course with a final assessment is finished by passing it (which sets the
   * enrolment status directly), and a course without one is finished when every lesson
   * has been watched.
   */
  private async hasFinishedTrack(studentId: string, trackId: string) {
    const assessment = await this.prisma.trackAssessment.findUnique({
      where: { trackId },
      select: { id: true },
    });
    if (assessment) return false;

    const topics = await this.prisma.topic.findMany({
      where: { module: { trackId } },
      select: { id: true },
    });
    if (topics.length === 0) return false;

    const watched = await this.prisma.topicProgress.count({
      where: {
        userId: studentId,
        watched: true,
        topicId: { in: topics.map((t) => t.id) },
      },
    });
    return watched >= topics.length;
  }

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

    const levelName = credential.level?.name ?? 'Certification';
    await this.notificationsService.notify({
      userId: studentId,
      type: NotificationType.CREDENTIAL_ISSUED,
      title: `Your ${levelName} credential has been issued!`,
      body: 'Your new certification is now available in My Certificates, cryptographically signed and ready to verify.',
      email: {
        subject: `Your ${levelName} certificate is ready`,
        block: {
          heading: 'Congratulations — your certificate has been issued',
          intro:
            `Your capstone was approved and your ${levelName} certificate is now available. ` +
            'It carries a QR code that anyone can scan to verify it, without needing an account.',
          facts: [
            { label: 'Level', value: levelName },
            { label: 'Issued', value: new Date(credential.issuedAt).toDateString() },
          ],
          ctaLabel: 'View and download your certificate',
          // Public page, same reasoning as the course certificate email above.
          ctaUrl: `${WEB}/verify/${id}`,
          outro:
            'The link opens on any device without signing in, and the certificate can be ' +
            'downloaded as a PDF from there.',
        },
      },
    });

    return credential;
  }

  async listForStudent(studentId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { studentId },
      include: {
        level: true,
        track: { include: { category: true } },
        evaluatorSignature: true,
        adminSignature: true,
      },
      orderBy: { issuedAt: 'desc' },
    });
    return Promise.all(credentials.map((c) => this.toPublicShape(c)));
  }

  async verify(id: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
      include: {
        level: true,
        track: { include: { category: true } },
        evaluatorSignature: true,
        adminSignature: true,
      },
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
      credential.levelId ?? credential.trackId ?? '',
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
      include: { level: true, track: true },
    });

    await this.auditService.log({
      actor,
      action: `Countersigned credential ${id} (${updated.track?.title ?? updated.level?.name ?? 'unknown subject'})`,
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

  /**
   * `subjectId` is the level id for ladder credentials and the track id for course
   * certificates. Keeping one function and one field order means every credential
   * already issued against a level still hashes to exactly the value stored on it,
   * so none of them stop verifying.
   */
  private computeHash(
    id: string,
    studentId: string,
    subjectId: string,
    issuedAt: Date,
  ) {
    const secret = this.configService.get<string>('credential.hmacSecret')!;
    return createHmac('sha256', secret)
      .update(`${id}|${studentId}|${subjectId}|${issuedAt.toISOString()}`)
      .digest('hex');
  }

  private async toPublicShape(credential: {
    id: string;
    studentId: string;
    levelId: string | null;
    level: {
      id: string;
      name: string;
      order: number;
      passingScore: number;
    } | null;
    trackId?: string | null;
    track?: {
      id: string;
      title: string;
      difficulty: string;
      category: { name: string };
    } | null;
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
      subjectTitle:
        credential.track?.title ?? credential.level?.name ?? 'Certificate',
      levelId: credential.levelId,
      level: credential.level,
      trackId: credential.trackId ?? null,
      track: credential.track
        ? {
            id: credential.track.id,
            title: credential.track.title,
            categoryName: credential.track.category.name,
            difficulty: credential.track.difficulty,
          }
        : null,
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
