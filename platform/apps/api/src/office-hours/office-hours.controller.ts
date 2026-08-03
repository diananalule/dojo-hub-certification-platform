import { Controller, Delete, Get, Param, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@dojo-hub/shared';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { OfficeHoursService } from './office-hours.service';
import { CreateSlotDto } from './dto/create-slot.dto';

@ApiTags('office-hours')
@Controller('office-hours')
export class OfficeHoursController {
  constructor(private readonly officeHoursService: OfficeHoursService) {}

  @Public()
  @Get('slots')
  listUpcoming() {
    return this.officeHoursService.listUpcoming();
  }

  @ApiBearerAuth()
  @Roles(UserRole.EVALUATOR)
  @Get('my-slots')
  mySlots(@CurrentUser() actor: RequestUser) {
    return this.officeHoursService.mySlots(actor.id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.EVALUATOR)
  @Post('slots')
  createSlot(@CurrentUser() actor: RequestUser, @Body() dto: CreateSlotDto) {
    return this.officeHoursService.createSlot(actor, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.EVALUATOR, UserRole.ADMIN)
  @Delete('slots/:slotId')
  removeSlot(
    @CurrentUser() actor: RequestUser,
    @Param('slotId') slotId: string,
  ) {
    return this.officeHoursService.removeSlot(actor, slotId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @Post('slots/:slotId/book')
  book(@CurrentUser() actor: RequestUser, @Param('slotId') slotId: string) {
    return this.officeHoursService.book(actor, slotId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @Get('my-bookings')
  myBookings(@CurrentUser() actor: RequestUser) {
    return this.officeHoursService.myBookings(actor.id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @Delete('bookings/:bookingId')
  cancelBooking(
    @CurrentUser() actor: RequestUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.officeHoursService.cancelBooking(actor, bookingId);
  }
}
