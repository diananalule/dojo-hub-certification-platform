import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { UserRole } from '@dojo-hub/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { ProgressService } from './progress.service';

class SavePositionDto {
  @IsInt()
  @Min(0)
  positionSeconds: number;
}

@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
@Roles(UserRole.STUDENT)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('tracks/:trackId')
  forTrack(
    @CurrentUser() user: RequestUser,
    @Param('trackId') trackId: string,
  ) {
    return this.progressService.forTrack(user.id, trackId);
  }

  @Post('topics/:topicId/position')
  savePosition(
    @CurrentUser() user: RequestUser,
    @Param('topicId') topicId: string,
    @Body() dto: SavePositionDto,
  ) {
    return this.progressService.savePosition(
      user.id,
      topicId,
      dto.positionSeconds,
    );
  }

  @Post('topics/:topicId/watched')
  markWatched(
    @CurrentUser() user: RequestUser,
    @Param('topicId') topicId: string,
  ) {
    return this.progressService.markWatched(user, topicId);
  }
}
