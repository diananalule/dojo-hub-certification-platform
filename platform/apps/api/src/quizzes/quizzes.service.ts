import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttemptTargetType,
  AuditLogSeverity,
  NotificationType,
  QuizQuestionType,
  SubjectiveGradedBy,
  SubjectiveStatus,
} from '@dojo-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { AiGradingService } from '../ai-grading/ai-grading.service';
import { RequestUser } from '../common/types/request-user.interface';
import {
  CreateModuleQuizDto,
  CreateTrackAssessmentDto,
} from './dto/create-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { GradeAttemptDto } from './dto/grade-attempt.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly aiGradingService: AiGradingService,
  ) {}

  // -------------------------------------------------------------------------
  // Authoring (admin)
  // -------------------------------------------------------------------------

  async createModuleQuiz(
    actor: RequestUser,
    moduleId: string,
    dto: CreateModuleQuizDto,
  ) {
    const quiz = await this.prisma.moduleQuiz.create({
      data: { ...dto, moduleId },
    });
    await this.auditService.log({
      actor,
      action: `Created chapter quiz "${quiz.title}"`,
      entityType: 'ModuleQuiz',
      entityId: quiz.id,
    });
    return quiz;
  }

  async createTrackAssessment(
    actor: RequestUser,
    trackId: string,
    dto: CreateTrackAssessmentDto,
  ) {
    const assessment = await this.prisma.trackAssessment.create({
      data: { ...dto, trackId },
    });
    await this.auditService.log({
      actor,
      action: `Created final course assessment "${assessment.title}"`,
      entityType: 'TrackAssessment',
      entityId: assessment.id,
    });
    return assessment;
  }

  async addQuestion(
    actor: RequestUser,
    target: { moduleQuizId?: string; trackAssessmentId?: string },
    dto: CreateQuestionDto,
  ) {
    const count = await this.prisma.quizQuestion.count({ where: target });
    const question = await this.prisma.quizQuestion.create({
      data: {
        ...target,
        ...dto,
        order: count,
        options: dto.options ?? [],
        sampleKeywords: dto.sampleKeywords ?? [],
      },
    });
    await this.auditService.log({
      actor,
      action: 'Added a quiz question',
      entityType: 'QuizQuestion',
      entityId: question.id,
    });
    return question;
  }

  async removeQuestion(actor: RequestUser, questionId: string) {
    await this.prisma.quizQuestion.delete({ where: { id: questionId } });
    await this.auditService.log({
      actor,
      action: 'Removed a quiz question',
      entityType: 'QuizQuestion',
      entityId: questionId,
      severity: AuditLogSeverity.WARNING,
    });
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // Student-facing reads (answer keys stripped)
  // -------------------------------------------------------------------------

  async getModuleQuiz(moduleId: string) {
    const quiz = await this.prisma.moduleQuiz.findUnique({
      where: { moduleId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz)
      throw new NotFoundException('This module does not have a chapter quiz.');
    return this.toPublicQuizDto(quiz, AttemptTargetType.MODULE_QUIZ, moduleId);
  }

  async getTrackAssessment(trackId: string) {
    const assessment = await this.prisma.trackAssessment.findUnique({
      where: { trackId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!assessment)
      throw new NotFoundException(
        'This track does not have a final assessment.',
      );
    return this.toPublicQuizDto(
      assessment,
      AttemptTargetType.TRACK_ASSESSMENT,
      trackId,
    );
  }

  /**
   * Reshapes a raw quiz/assessment + its flat question list into the QuizDto
   * shape the student-facing wizard actually consumes (objectiveQuestions[]
   * plus a single optional subjectiveQuestion), with answer keys stripped.
   */
  private toPublicQuizDto<
    Q extends {
      id: string;
      type: QuizQuestionType;
      correctIndex: number | null;
    },
    T extends {
      id: string;
      title: string;
      passThreshold: number;
      questions: Q[];
    },
  >(quiz: T, targetType: AttemptTargetType, targetId: string) {
    const stripped = quiz.questions.map(({ correctIndex, ...rest }) => rest);
    return {
      id: quiz.id,
      targetType,
      targetId,
      title: quiz.title,
      passThreshold: quiz.passThreshold,
      objectiveQuestions: stripped.filter(
        (q) => q.type === QuizQuestionType.OBJECTIVE,
      ),
      subjectiveQuestion:
        stripped.find((q) => q.type === QuizQuestionType.SUBJECTIVE) ?? null,
    };
  }

  // -------------------------------------------------------------------------
  // Attempts
  // -------------------------------------------------------------------------

  async submitAttempt(
    actor: RequestUser,
    type: AttemptTargetType,
    targetId: string,
    dto: SubmitAttemptDto,
  ) {
    const questions = await this.prisma.quizQuestion.findMany({
      where:
        type === AttemptTargetType.MODULE_QUIZ
          ? { moduleQuizId: targetId }
          : { trackAssessmentId: targetId },
    });
    if (questions.length === 0) throw new NotFoundException('Quiz not found.');

    const objectiveQuestions = questions.filter(
      (q) => q.type === QuizQuestionType.OBJECTIVE,
    );
    const subjectiveQuestion = questions.find(
      (q) => q.type === QuizQuestionType.SUBJECTIVE,
    );

    let objectiveScore = 0;
    const perQuestionResults = objectiveQuestions.map((q) => {
      const selected = dto.objectiveAnswers[q.id];
      const correct = selected === q.correctIndex;
      if (correct) objectiveScore += 1;
      return { questionId: q.id, correct, explanation: q.explanation ?? '' };
    });

    if (
      subjectiveQuestion &&
      (!dto.subjectiveAnswerText || dto.subjectiveAnswerText.trim().length < 30)
    ) {
      throw new BadRequestException(
        'A subjective answer of at least 30 characters is required.',
      );
    }

    const quizMeta =
      type === AttemptTargetType.MODULE_QUIZ
        ? await this.prisma.moduleQuiz.findUniqueOrThrow({
            where: { id: targetId },
          })
        : await this.prisma.trackAssessment.findUniqueOrThrow({
            where: { id: targetId },
          });

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId: actor.id,
        type,
        moduleQuizId:
          type === AttemptTargetType.MODULE_QUIZ ? targetId : undefined,
        trackAssessmentId:
          type === AttemptTargetType.TRACK_ASSESSMENT ? targetId : undefined,
        objectiveAnswers: dto.objectiveAnswers,
        objectiveScore,
        objectiveTotal: objectiveQuestions.length,
        subjectiveAnswerText: dto.subjectiveAnswerText,
        subjectiveStatus: subjectiveQuestion
          ? SubjectiveStatus.UNGRADED
          : SubjectiveStatus.GRADED,
      },
    });

    if (!subjectiveQuestion) {
      const objectivePct = objectiveQuestions.length
        ? (objectiveScore / objectiveQuestions.length) * 100
        : 100;
      return this.finalize(
        attempt.id,
        actor,
        quizMeta,
        type,
        targetId,
        Math.round(objectivePct),
        null,
        null,
        perQuestionResults,
        undefined,
        objectiveScore,
        objectiveQuestions.length,
      );
    }

    if (dto.gradingMode === 'AI' && this.aiGradingService.isAvailable()) {
      const result = await this.aiGradingService.gradeSubjective({
        prompt: subjectiveQuestion.prompt ?? '',
        guidelines: subjectiveQuestion.guidelines ?? '',
        sampleKeywords: subjectiveQuestion.sampleKeywords,
        studentAnswer: dto.subjectiveAnswerText!,
      });

      await this.prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          subjectiveScore: result.score,
          subjectiveFeedback: result.feedback,
          subjectiveGradedBy: SubjectiveGradedBy.AI,
          subjectiveStatus: SubjectiveStatus.GRADED,
        },
      });

      const objectivePct = objectiveQuestions.length
        ? (objectiveScore / objectiveQuestions.length) * 100
        : 100;
      return this.finalize(
        attempt.id,
        actor,
        quizMeta,
        type,
        targetId,
        Math.round(objectivePct),
        result.score,
        result.feedback,
        perQuestionResults,
        undefined,
        objectiveScore,
        objectiveQuestions.length,
      );
    }

    // Manual evaluator queue path
    await this.prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: { subjectiveStatus: SubjectiveStatus.PENDING_EVALUATOR },
    });

    await this.auditService.log({
      actor,
      action: `Submitted "${quizMeta.title}" for manual evaluator grading`,
      entityType: 'QuizAttempt',
      entityId: attempt.id,
    });

    return {
      attemptId: attempt.id,
      objectiveScore,
      objectiveTotal: objectiveQuestions.length,
      objectivePercentage: objectiveQuestions.length
        ? Math.round((objectiveScore / objectiveQuestions.length) * 100)
        : 100,
      subjectiveScore: null,
      subjectiveStatus: SubjectiveStatus.PENDING_EVALUATOR,
      subjectiveFeedback: null,
      weightedScore: null,
      passed: null,
      perQuestionResults,
    };
  }

  async gradeAttemptManually(
    actor: RequestUser,
    attemptId: string,
    dto: GradeAttemptDto,
  ) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (attempt.subjectiveStatus !== SubjectiveStatus.PENDING_EVALUATOR) {
      throw new ForbiddenException(
        'This attempt is not awaiting manual grading.',
      );
    }

    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        subjectiveScore: dto.score,
        subjectiveFeedback: dto.feedback,
        subjectiveGradedBy: SubjectiveGradedBy.EVALUATOR,
        subjectiveStatus: SubjectiveStatus.GRADED,
      },
    });

    const quizMeta =
      attempt.type === AttemptTargetType.MODULE_QUIZ
        ? await this.prisma.moduleQuiz.findUniqueOrThrow({
            where: { id: attempt.moduleQuizId! },
          })
        : await this.prisma.trackAssessment.findUniqueOrThrow({
            where: { id: attempt.trackAssessmentId! },
          });

    const objectivePct = attempt.objectiveTotal
      ? Math.round((attempt.objectiveScore / attempt.objectiveTotal) * 100)
      : 100;
    const studentUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: attempt.userId },
    });

    return this.finalize(
      attemptId,
      {
        id: studentUser.id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
      },
      quizMeta,
      attempt.type,
      (attempt.moduleQuizId ?? attempt.trackAssessmentId)!,
      objectivePct,
      dto.score,
      dto.feedback,
      [],
      actor,
      attempt.objectiveScore,
      attempt.objectiveTotal,
    );
  }

  async pendingManualGrading() {
    return this.prisma.quizAttempt.findMany({
      where: { subjectiveStatus: SubjectiveStatus.PENDING_EVALUATOR },
      orderBy: { createdAt: 'asc' },
      include: {
        moduleQuiz: { include: { module: { include: { track: true } } } },
        trackAssessment: { include: { track: true } },
      },
    });
  }

  private async finalize(
    attemptId: string,
    student: RequestUser,
    quizMeta: { title: string; passThreshold: number },
    type: AttemptTargetType,
    targetId: string,
    objectivePct: number,
    subjectiveScore: number | null,
    subjectiveFeedback: string | null,
    perQuestionResults: {
      questionId: string;
      correct: boolean;
      explanation: string;
    }[],
    graderActor?: RequestUser,
    objectiveScore = 0,
    objectiveTotal = 0,
  ) {
    const weightedScore =
      subjectiveScore === null
        ? objectivePct
        : Math.round(objectivePct * 0.4 + subjectiveScore * 0.6);
    const passed = weightedScore >= quizMeta.passThreshold;

    if (passed && type === AttemptTargetType.TRACK_ASSESSMENT) {
      const assessment = await this.prisma.trackAssessment.findUnique({
        where: { id: targetId },
      });
      if (assessment)
        await this.enrollmentsService.markCompleted(
          student.id,
          assessment.trackId,
        );
    }

    await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { weightedScore, passed },
    });

    await this.notificationsService.notify({
      userId: student.id,
      type: NotificationType.SUBMISSION_GRADED,
      title: passed
        ? `You passed "${quizMeta.title}"!`
        : `"${quizMeta.title}" needs another attempt`,
      body: passed
        ? `Weighted score ${weightedScore}% — nice work. This is a self-check only, it doesn't affect your certification progress.`
        : `Weighted score ${weightedScore}% — the pass threshold is ${quizMeta.passThreshold}%. This is a self-check only; review the feedback and try again whenever you like.`,
    });

    if (graderActor) {
      await this.auditService.log({
        actor: graderActor,
        action: `Manually graded "${quizMeta.title}" for ${student.name}: ${weightedScore}% (${passed ? 'passed' : 'failed'})`,
        entityType: 'QuizAttempt',
        entityId: attemptId,
        severity: AuditLogSeverity.SUCCESS,
      });
    }

    return {
      attemptId,
      objectiveScore,
      objectiveTotal,
      objectivePercentage: objectivePct,
      subjectiveScore,
      subjectiveStatus: SubjectiveStatus.GRADED,
      subjectiveFeedback,
      weightedScore,
      passed,
      perQuestionResults,
    };
  }
}
