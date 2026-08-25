import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TrackStatus, UserRole } from '@dojo-hub/shared';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { CreateTopicDto, UpdateTopicDto } from './dto/create-topic.dto';
import {
  CreateCompetencyDto,
  UpdateCompetencyDto,
} from './dto/create-competency.dto';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Public()
  @Get()
  list(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: TrackStatus,
  ) {
    return this.tracksService.list({ categoryId, status, includeAll: false });
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin')
  listAdmin(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: TrackStatus,
  ) {
    return this.tracksService.list({ categoryId, status, includeAll: true });
  }

  /**
   * Public syllabus for the landing page's course pages: enough to judge a course,
   * without the lesson content you enrol for. The full ':id' route below needs auth.
   */
  @Public()
  @Get(':id/preview')
  getPreview(@Param('id') id: string) {
    return this.tracksService.getPreview(id);
  }

  @ApiBearerAuth()
  @Get(':id')
  getFull(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tracksService.getFull(id, user);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get(':id/admin')
  getFullForAdmin(@Param('id') id: string) {
    return this.tracksService.getFullForAdmin(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  create(@CurrentUser() actor: RequestUser, @Body() dto: CreateTrackDto) {
    return this.tracksService.create(actor, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @CurrentUser() actor: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTrackDto,
  ) {
    return this.tracksService.update(actor, id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.tracksService.remove(actor, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/publish')
  publish(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.tracksService.publish(actor, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/unpublish')
  unpublish(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.tracksService.unpublish(actor, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post(':id/modules')
  addModule(
    @CurrentUser() actor: RequestUser,
    @Param('id') trackId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.tracksService.addModule(actor, trackId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('modules/:moduleId')
  updateModule(
    @CurrentUser() actor: RequestUser,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.tracksService.updateModule(actor, moduleId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('modules/:moduleId')
  removeModule(
    @CurrentUser() actor: RequestUser,
    @Param('moduleId') moduleId: string,
  ) {
    return this.tracksService.removeModule(actor, moduleId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('modules/:moduleId/topics')
  addTopic(
    @CurrentUser() actor: RequestUser,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateTopicDto,
  ) {
    return this.tracksService.addTopic(actor, moduleId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('topics/:topicId')
  updateTopic(
    @CurrentUser() actor: RequestUser,
    @Param('topicId') topicId: string,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.tracksService.updateTopic(actor, topicId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('topics/:topicId')
  removeTopic(
    @CurrentUser() actor: RequestUser,
    @Param('topicId') topicId: string,
  ) {
    return this.tracksService.removeTopic(actor, topicId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('modules/:moduleId/competencies')
  addCompetency(
    @CurrentUser() actor: RequestUser,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateCompetencyDto,
  ) {
    return this.tracksService.addCompetency(actor, moduleId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('competencies/:competencyId')
  updateCompetency(
    @CurrentUser() actor: RequestUser,
    @Param('competencyId') competencyId: string,
    @Body() dto: UpdateCompetencyDto,
  ) {
    return this.tracksService.updateCompetency(actor, competencyId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete('competencies/:competencyId')
  removeCompetency(
    @CurrentUser() actor: RequestUser,
    @Param('competencyId') competencyId: string,
  ) {
    return this.tracksService.removeCompetency(actor, competencyId);
  }
}
