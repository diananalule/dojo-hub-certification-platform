import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogSeverity, TrackStatus } from '@dojo-hub/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../common/types/request-user.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { CreateTopicDto, UpdateTopicDto } from './dto/create-topic.dto';
import {
  CreateCompetencyDto,
  UpdateCompetencyDto,
} from './dto/create-competency.dto';

const FULL_TRACK_INCLUDE = {
  category: true,
  modules: {
    orderBy: { order: 'asc' as const },
    include: {
      topics: {
        orderBy: { order: 'asc' as const },
        include: { documents: true },
      },
      competencies: true,
      quiz: { include: { questions: true } },
    },
  },
  assessment: { include: { questions: true } },
} satisfies Prisma.TrackInclude;

type FullTrack = Prisma.TrackGetPayload<{ include: typeof FULL_TRACK_INCLUDE }>;

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(params: {
    categoryId?: string;
    status?: TrackStatus;
    includeAll: boolean;
  }) {
    const { categoryId, status, includeAll } = params;
    const tracks = await this.prisma.track.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(includeAll
          ? status
            ? { status }
            : {}
          : { status: TrackStatus.PUBLISHED }),
      },
      include: { category: true, modules: { include: { topics: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return tracks.map((track) => ({
      id: track.id,
      title: track.title,
      description: track.description,
      icon: track.icon,
      category: track.category,
      difficulty: track.difficulty,
      durationWeeks: track.durationWeeks,
      status: track.status,
      moduleCount: track.modules.length,
      topicCount: track.modules.reduce((sum, m) => sum + m.topics.length, 0),
    }));
  }

  async getFull(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: FULL_TRACK_INCLUDE,
    });
    if (!track) throw new NotFoundException('Track not found.');
    return this.stripAnswerKeys(track);
  }

  /** Same as getFull but keeps correctIndex on objective questions, for admin authoring views. */
  async getFullForAdmin(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: FULL_TRACK_INCLUDE,
    });
    if (!track) throw new NotFoundException('Track not found.');
    return {
      ...track,
      modules: track.modules.map((m) => ({ ...m, hasQuiz: !!m.quiz })),
    };
  }

  async create(actor: RequestUser, dto: CreateTrackDto) {
    const track = await this.prisma.track.create({
      data: { ...dto, status: TrackStatus.DRAFT },
    });

    await this.auditService.log({
      actor,
      action: `Created a new certification track: "${track.title}"`,
      entityType: 'Track',
      entityId: track.id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return track;
  }

  async update(actor: RequestUser, id: string, dto: UpdateTrackDto) {
    await this.assertTrackExists(id);
    const track = await this.prisma.track.update({ where: { id }, data: dto });

    await this.auditService.log({
      actor,
      action: `Updated certification track: "${track.title}"`,
      entityType: 'Track',
      entityId: track.id,
    });

    return track;
  }

  async remove(actor: RequestUser, id: string) {
    const track = await this.assertTrackExists(id);
    await this.prisma.track.delete({ where: { id } });

    await this.auditService.log({
      actor,
      action: `Permanently deleted certification track: "${track.title}"`,
      entityType: 'Track',
      entityId: id,
      severity: AuditLogSeverity.WARNING,
    });

    return { success: true };
  }

  async publish(actor: RequestUser, id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: { modules: { include: { topics: true } } },
    });
    if (!track) throw new NotFoundException('Track not found.');

    if (track.modules.length === 0) {
      throw new BadRequestException(
        'Cannot publish a track with zero modules.',
      );
    }

    // Modules are allowed to ship with just a title/description/tools and no
    // topics — topics are an optional deeper layer, not a publishing requirement.

    const updated = await this.prisma.track.update({
      where: { id },
      data: { status: TrackStatus.PUBLISHED },
    });

    await this.auditService.log({
      actor,
      action: `Approved & published certification track: "${track.title}"`,
      entityType: 'Track',
      entityId: id,
      severity: AuditLogSeverity.SUCCESS,
    });

    return updated;
  }

  async unpublish(actor: RequestUser, id: string) {
    const track = await this.assertTrackExists(id);
    const updated = await this.prisma.track.update({
      where: { id },
      data: { status: TrackStatus.DRAFT },
    });

    await this.auditService.log({
      actor,
      action: `Reverted certification track "${track.title}" back to draft for revision`,
      entityType: 'Track',
      entityId: id,
      severity: AuditLogSeverity.WARNING,
    });

    return updated;
  }

  // -------------------------------------------------------------------------
  // Modules
  // -------------------------------------------------------------------------

  async addModule(actor: RequestUser, trackId: string, dto: CreateModuleDto) {
    await this.assertTrackExists(trackId);
    const count = await this.prisma.module.count({ where: { trackId } });
    const module = await this.prisma.module.create({
      // description is optional on the way in, but the column is non-nullable —
      // store an empty string until the author writes one.
      data: { ...dto, description: dto.description ?? '', trackId, order: count },
    });

    await this.auditService.log({
      actor,
      action: `Added module "${module.title}" to a track`,
      entityType: 'Module',
      entityId: module.id,
    });

    return module;
  }

  async updateModule(
    actor: RequestUser,
    moduleId: string,
    dto: UpdateModuleDto,
  ) {
    const module = await this.prisma.module.update({
      where: { id: moduleId },
      data: dto,
    });
    await this.auditService.log({
      actor,
      action: `Updated module "${module.title}"`,
      entityType: 'Module',
      entityId: module.id,
    });
    return module;
  }

  async removeModule(actor: RequestUser, moduleId: string) {
    const module = await this.prisma.module.delete({ where: { id: moduleId } });
    await this.auditService.log({
      actor,
      action: `Removed module "${module.title}"`,
      entityType: 'Module',
      entityId: moduleId,
      severity: AuditLogSeverity.WARNING,
    });
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Topics
  // -------------------------------------------------------------------------

  async addTopic(actor: RequestUser, moduleId: string, dto: CreateTopicDto) {
    const count = await this.prisma.topic.count({ where: { moduleId } });
    const topic = await this.prisma.topic.create({
      data: {
        moduleId,
        order: count,
        title: dto.title,
        // Optional on the way in, but the columns are non-nullable — see CreateTopicDto.
        description: dto.description ?? '',
        durationSeconds: dto.durationSeconds,
        videoUrl: dto.videoUrl ?? '',
        referenceVideoUrl: dto.referenceVideoUrl,
        tools: dto.tools,
        subtitles: (dto.subtitles ?? [
          { timeSeconds: 0, text: `Welcome to ${dto.title}` },
          {
            timeSeconds: 5,
            text: 'Follow along with the demonstration below.',
          },
        ]) as unknown as Prisma.InputJsonValue,
      },
    });

    await this.auditService.log({
      actor,
      action: `Added lesson topic "${topic.title}"`,
      entityType: 'Topic',
      entityId: topic.id,
    });

    return topic;
  }

  async updateTopic(actor: RequestUser, topicId: string, dto: UpdateTopicDto) {
    const topic = await this.prisma.topic.update({
      where: { id: topicId },
      data: {
        ...dto,
        subtitles: dto.subtitles
          ? (dto.subtitles as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
    await this.auditService.log({
      actor,
      action: `Updated lesson topic "${topic.title}"`,
      entityType: 'Topic',
      entityId: topic.id,
    });
    return topic;
  }

  async removeTopic(actor: RequestUser, topicId: string) {
    const topic = await this.prisma.topic.delete({ where: { id: topicId } });
    await this.auditService.log({
      actor,
      action: `Removed lesson topic "${topic.title}"`,
      entityType: 'Topic',
      entityId: topicId,
      severity: AuditLogSeverity.WARNING,
    });
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Competencies (rubric configurator)
  // -------------------------------------------------------------------------

  async addCompetency(
    actor: RequestUser,
    moduleId: string,
    dto: CreateCompetencyDto,
  ) {
    const competency = await this.prisma.competency.create({
      data: { ...dto, moduleId, tools: dto.tools ?? [] },
    });
    await this.auditService.log({
      actor,
      action: `Added competency rubric "${competency.title}"`,
      entityType: 'Competency',
      entityId: competency.id,
    });
    return competency;
  }

  async updateCompetency(
    actor: RequestUser,
    competencyId: string,
    dto: UpdateCompetencyDto,
  ) {
    const competency = await this.prisma.competency.update({
      where: { id: competencyId },
      data: dto,
    });
    await this.auditService.log({
      actor,
      action: `Updated competency rubric "${competency.title}"`,
      entityType: 'Competency',
      entityId: competency.id,
    });
    return competency;
  }

  async removeCompetency(actor: RequestUser, competencyId: string) {
    await this.prisma.competency.delete({ where: { id: competencyId } });
    await this.auditService.log({
      actor,
      action: `Removed a competency rubric`,
      entityType: 'Competency',
      entityId: competencyId,
      severity: AuditLogSeverity.WARNING,
    });
    return { success: true };
  }

  private async assertTrackExists(id: string) {
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundException('Track not found.');
    return track;
  }

  /**
   * Removes answer keys before a track tree is sent to non-admin clients, and
   * collapses each module's full quiz (title/questions) down to a `hasQuiz`
   * flag — the syllabus only needs to know whether to show a "Take Chapter
   * Quiz" button; the real content is fetched on-demand via
   * GET /quizzes/modules/:moduleId when a student actually opens it.
   */
  private stripAnswerKeys(track: FullTrack) {
    const strip = <Q extends { correctIndex: number | null }>({
      correctIndex,
      ...rest
    }: Q) => rest;
    return {
      ...track,
      modules: track.modules.map((m) => {
        const { quiz, ...rest } = m;
        return { ...rest, hasQuiz: !!quiz };
      }),
      assessment: track.assessment
        ? {
            ...track.assessment,
            questions: track.assessment.questions.map(strip),
          }
        : null,
    };
  }
}
