import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@dojo-hub/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(UserRole.ADMIN)
  @Get('platform-metrics')
  platformMetrics() {
    return this.reportsService.platformMetrics();
  }

  /** Read-only: what is actually in the database, with seed data flagged. */
  @Roles(UserRole.ADMIN)
  @Get('inventory')
  inventory() {
    return this.reportsService.inventory();
  }

  @Roles(UserRole.ADMIN)
  @Get('usage-report')
  usageReport() {
    return this.reportsService.usageReportData();
  }

  @Roles(UserRole.EVALUATOR)
  @Get('my-insights')
  myInsights(@CurrentUser() actor: RequestUser) {
    return this.reportsService.evaluatorInsights(actor.id);
  }

  @Roles(UserRole.ADMIN)
  @Get('evaluator-insights')
  evaluatorInsights(@Query('evaluatorId') evaluatorId?: string) {
    return this.reportsService.evaluatorInsights(evaluatorId);
  }
}
