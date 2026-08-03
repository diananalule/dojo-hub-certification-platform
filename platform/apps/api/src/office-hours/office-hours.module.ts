import { Module } from '@nestjs/common';
import { OfficeHoursService } from './office-hours.service';
import { OfficeHoursController } from './office-hours.controller';

@Module({
  controllers: [OfficeHoursController],
  providers: [OfficeHoursService],
  exports: [OfficeHoursService],
})
export class OfficeHoursModule {}
