import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  OfficeHourBookingStatus,
  UserRole,
} from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestUser } from '../common/types/request-user.interface';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class OfficeHoursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createSlot(actor: RequestUser, dto: CreateSlotDto) {
    if (new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('End time must be after the start time.');
    }
    const slot = await this.prisma.officeHourSlot.create({
      data: {
        evaluatorId: actor.id,
        topic: dto.topic,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        capacity: dto.capacity,
      },
    });

    await this.auditService.log({
      actor,
      action: `Published a new office hours slot: "${dto.topic}"`,
      entityType: 'OfficeHourSlot',
      entityId: slot.id,
    });

    return slot;
  }

  async listUpcoming(currentUserId?: string) {
    const slots = await this.prisma.officeHourSlot.findMany({
      where: { startTime: { gte: new Date() } },
      include: {
        evaluator: true,
        bookings: { where: { status: OfficeHourBookingStatus.BOOKED } },
      },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((s) => ({
      id: s.id,
      evaluatorId: s.evaluatorId,
      evaluatorName: s.evaluator.name,
      topic: s.topic,
      startTime: s.startTime,
      endTime: s.endTime,
      capacity: s.capacity,
      bookedCount: s.bookings.length,
      isBookedByMe: currentUserId
        ? s.bookings.some((b) => b.studentId === currentUserId)
        : false,
    }));
  }

  async mySlots(evaluatorId: string) {
    const slots = await this.prisma.officeHourSlot.findMany({
      where: { evaluatorId },
      include: {
        bookings: {
          where: { status: OfficeHourBookingStatus.BOOKED },
          include: { student: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return slots.map((slot) => ({
      ...slot,
      bookings: slot.bookings.map((b) => ({
        id: b.id,
        student: { name: b.student.name, email: b.student.email },
      })),
    }));
  }

  async removeSlot(actor: RequestUser, slotId: string) {
    const slot = await this.prisma.officeHourSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot) throw new NotFoundException('Slot not found.');
    if (slot.evaluatorId !== actor.id && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only remove your own office hours slots.',
      );
    }
    await this.prisma.officeHourSlot.delete({ where: { id: slotId } });
    return { success: true };
  }

  async book(actor: RequestUser, slotId: string) {
    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.officeHourSlot.findUnique({
        where: { id: slotId },
        include: {
          bookings: { where: { status: OfficeHourBookingStatus.BOOKED } },
        },
      });
      if (!slot) throw new NotFoundException('Slot not found.');
      if (slot.bookings.length >= slot.capacity) {
        throw new BadRequestException(
          'This office hours slot is fully booked.',
        );
      }
      if (slot.bookings.some((b) => b.studentId === actor.id)) {
        throw new BadRequestException('You already booked this slot.');
      }

      const booking = await tx.officeHourBooking.upsert({
        where: { slotId_studentId: { slotId, studentId: actor.id } },
        update: {
          status: OfficeHourBookingStatus.BOOKED,
          bookedAt: new Date(),
        },
        create: {
          slotId,
          studentId: actor.id,
          status: OfficeHourBookingStatus.BOOKED,
        },
      });

      await this.notificationsService.notify({
        userId: slot.evaluatorId,
        type: NotificationType.OFFICE_HOUR_BOOKED,
        title: 'New office hours booking',
        body: `${actor.name} booked your "${slot.topic}" session.`,
      });

      return booking;
    });
  }

  async cancelBooking(actor: RequestUser, bookingId: string) {
    const booking = await this.prisma.officeHourBooking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });
    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.studentId !== actor.id) throw new ForbiddenException();

    await this.prisma.officeHourBooking.update({
      where: { id: bookingId },
      data: { status: OfficeHourBookingStatus.CANCELLED },
    });

    await this.notificationsService.notify({
      userId: booking.slot.evaluatorId,
      type: NotificationType.OFFICE_HOUR_CANCELLED,
      title: 'Office hours booking cancelled',
      body: `${actor.name} cancelled their "${booking.slot.topic}" booking.`,
    });

    return { success: true };
  }

  async myBookings(studentId: string) {
    const bookings = await this.prisma.officeHourBooking.findMany({
      where: { studentId, status: OfficeHourBookingStatus.BOOKED },
      include: { slot: { include: { evaluator: true } } },
      orderBy: { slot: { startTime: 'asc' } },
    });

    return bookings.map(({ slot, ...booking }) => ({
      ...booking,
      slot: {
        id: slot.id,
        evaluatorId: slot.evaluatorId,
        evaluatorName: slot.evaluator.name,
        topic: slot.topic,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
      },
    }));
  }
}
