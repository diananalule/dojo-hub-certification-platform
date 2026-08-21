import { Injectable } from '@nestjs/common';
import { NotificationType } from '@dojo-hub/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from '../email/email.service';
import { EmailBlock } from '../email/email.template';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  /**
   * Optional email to send alongside the in-app notification. Omitted for events
   * that only warrant a bell badge, so people aren't emailed about everything.
   */
  email?: { subject: string; block: EmailBlock };
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
    private readonly emailService: EmailService,
  ) {}

  async notify(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    this.gateway.emitToUser(params.userId, 'notification.new', notification);

    if (params.email) {
      // Deliberately not awaited: email latency must never delay the request that
      // triggered it, and a send failure must never fail the action itself.
      void this.sendEmail(params.userId, params.email);
    }

    return notification;
  }

  private async sendEmail(userId: string, email: { subject: string; block: EmailBlock }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (!user?.email) return;
      await this.emailService.send({ to: user.email, subject: email.subject, block: email.block });
    } catch {
      // EmailService already logs failures; swallow so nothing propagates.
    }
  }

  emitEvent(userId: string, event: string, payload: unknown) {
    this.gateway.emitToUser(userId, event, payload);
  }

  async list(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }
}
