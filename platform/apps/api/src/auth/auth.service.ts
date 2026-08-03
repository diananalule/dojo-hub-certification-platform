import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { AccountStatus, AuditLogSeverity, UserRole } from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../common/types/request-user.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException(
        'An account with this email address already exists.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase(),
          passwordHash,
          role: dto.role,
          status: AccountStatus.ACTIVE,
        },
      });

      if (dto.role === UserRole.STUDENT) {
        const beginnerLevel = await tx.level.findFirstOrThrow({
          orderBy: { order: 'asc' },
        });
        await tx.studentProfile.create({
          data: {
            userId: created.id,
            currentLevelId: beginnerLevel.id,
          },
        });
      }

      return created;
    });

    await this.auditService.log({
      actor: this.toRequestUser(user),
      action: `Created a new ${user.role.toLowerCase()} account: "${user.name}" (${user.email})`,
      entityType: 'User',
      entityId: user.id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return this.issueSession(this.toRequestUser(user));
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'This account has been suspended. Contact a platform administrator.',
      );
    }

    const requestUser = this.toRequestUser(user);

    await this.auditService.log({
      actor: requestUser,
      action: `Logged into secure session with role: ${user.role}`,
      entityType: 'User',
      entityId: user.id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return this.issueSession(requestUser);
  }

  async refresh(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Session expired, please sign in again.');
    }
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired, please sign in again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });
    if (!user || user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is not active.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueSession(this.toRequestUser(user));
  }

  async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) return;
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  async revokeAllSessionsForUser(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { studentProfile: { include: { currentLevel: true } } },
    });
    return this.omitPasswordHash(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name.trim() },
      include: { studentProfile: { include: { currentLevel: true } } },
    });

    await this.auditService.log({
      actor: this.toRequestUser(user),
      action: `Updated account profile name to "${user.name}"`,
      entityType: 'User',
      entityId: user.id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return this.omitPasswordHash(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.revokeAllSessionsForUser(userId);

    await this.auditService.log({
      actor: this.toRequestUser(user),
      action: 'Changed account password',
      entityType: 'User',
      entityId: user.id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return { success: true };
  }

  private async issueSession(user: RequestUser) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.accessTtl',
        ) as unknown as number,
      },
    );

    const rawRefreshToken = randomBytes(48).toString('hex');
    const refreshTtlMs = this.parseTtlToMs(
      this.configService.get<string>('jwt.refreshTtl')!,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    return { user, accessToken, refreshToken: rawRefreshToken, refreshTtlMs };
  }

  private omitPasswordHash<T extends { passwordHash: string }>(
    user: T,
  ): Omit<T, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toRequestUser(user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }): RequestUser {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private parseTtlToMs(ttl: string): number {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return value * multipliers[unit];
  }
}
