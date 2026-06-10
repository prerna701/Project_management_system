import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeLog } from '../time-logs/domain/time-log';
import { TimeEntryType } from '../time-logs/enums/time-entry-type.enum';
import {
  ActivityHeartbeatDto,
  ActivityHeartbeatState,
} from './dto/activity-heartbeat.dto';
import { CreateGitIntegrationDto } from './dto/create-git-integration.dto';
import { ConfigureProjectRepositoryDto } from './dto/configure-project-repository.dto';
import { ConfigureUserGitIdentityDto } from './dto/configure-user-git-identity.dto';
import { EvidenceConfidence } from './enums/evidence-confidence.enum';
import { EvidenceStatus } from './enums/evidence-status.enum';
import { GitCommitActivityEntity } from './infrastructure/entities/git-commit-activity.entity';
import { GitIntegrationEntity } from './infrastructure/entities/git-integration.entity';
import { ProjectRepositoryEntity } from './infrastructure/entities/project-repository.entity';
import { TimeLogEvidenceAssessmentEntity } from './infrastructure/entities/time-log-evidence-assessment.entity';
import { UserGitIdentityEntity } from './infrastructure/entities/user-git-identity.entity';
import { WorkActivityEventEntity } from './infrastructure/entities/work-activity-event.entity';
import { EvidenceProviderResultEntity } from './infrastructure/entities/evidence-provider-result.entity';
import { EvidenceProvider } from './enums/evidence-provider.enum';
import { WorkActivityEventType } from './enums/work-activity-event-type.enum';
import {
  CommitEvidenceInput,
  WorkTimeCalculatorService,
} from './work-time-calculator.service';
import { calculateCompositeEvidenceScore } from './composite-evidence-score';

@Injectable()
export class WorkEvidenceService {
  private readonly logger = new Logger(WorkEvidenceService.name);

  constructor(
    @InjectRepository(GitIntegrationEntity)
    private readonly integrations: Repository<GitIntegrationEntity>,
    @InjectRepository(ProjectRepositoryEntity)
    private readonly projectRepositories: Repository<ProjectRepositoryEntity>,
    @InjectRepository(UserGitIdentityEntity)
    private readonly identities: Repository<UserGitIdentityEntity>,
    @InjectRepository(GitCommitActivityEntity)
    private readonly activities: Repository<GitCommitActivityEntity>,
    @InjectRepository(TimeLogEvidenceAssessmentEntity)
    private readonly assessments: Repository<TimeLogEvidenceAssessmentEntity>,
    @InjectRepository(WorkActivityEventEntity)
    private readonly activityEvents: Repository<WorkActivityEventEntity>,
    @InjectRepository(EvidenceProviderResultEntity)
    private readonly providerResults: Repository<EvidenceProviderResultEntity>,
    private readonly calculator: WorkTimeCalculatorService,
  ) {}

  async createIntegration(dto: CreateGitIntegrationDto) {
    return this.integrations.save(
      this.integrations.create({
        provider: 'GITHUB',
        name: dto.name,
        apiBaseUrl: dto.apiBaseUrl ?? null,
        tokenEnvKey: dto.tokenEnvKey ?? 'GITHUB_TOKEN',
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async listIntegrations() {
    return this.integrations.find({ order: { createdAt: 'ASC' } });
  }

  async configureProjectRepository(
    projectId: string,
    dto: ConfigureProjectRepositoryDto,
  ) {
    const existing = await this.projectRepositories.findOne({
      where: { projectId },
    });
    return this.projectRepositories.save(
      this.projectRepositories.create({
        ...existing,
        projectId,
        integrationId: dto.integrationId,
        owner: dto.owner.trim(),
        repository: dto.repository.trim(),
        defaultBranch: dto.defaultBranch?.trim() || null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async configureUserIdentity(
    userId: string,
    dto: ConfigureUserGitIdentityDto,
  ) {
    const existing = await this.identities.findOne({ where: { userId } });
    return this.identities.save(
      this.identities.create({
        ...existing,
        userId,
        provider: 'GITHUB',
        username: dto.username?.trim() || null,
        email: dto.email?.trim().toLowerCase() || null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async getAssessment(timeLogId: string) {
    const assessment = await this.assessments.findOne({ where: { timeLogId } });
    if (!assessment) return null;
    const [providers, timeline] = await Promise.all([
      this.providerResults.find({
        where: { timeLogId },
        order: { weight: 'DESC' },
      }),
      this.activityEvents.find({
        where: { timeLogId },
        order: { occurredAt: 'ASC' },
        take: 100,
      }),
    ]);
    return { ...assessment, providers, timeline };
  }

  async recordActivity(input: {
    userId: string;
    projectId: string;
    taskId?: string | null;
    timeLogId?: string | null;
    type: WorkActivityEventType;
    occurredAt?: Date;
    durationSeconds?: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.activityEvents.save(
      this.activityEvents.create({
        userId: input.userId,
        projectId: input.projectId,
        taskId: input.taskId ?? null,
        timeLogId: input.timeLogId ?? null,
        type: input.type,
        occurredAt: input.occurredAt ?? new Date(),
        durationSeconds: input.durationSeconds ?? 0,
        metadata: input.metadata ?? {},
      }),
    );
  }

  async recordHeartbeat(log: TimeLog, dto: ActivityHeartbeatDto): Promise<void> {
    await this.recordActivity({
      userId: log.userId,
      projectId: log.projectId,
      taskId: log.taskId,
      timeLogId: log.id,
      type:
        dto.state === ActivityHeartbeatState.ACTIVE
          ? WorkActivityEventType.HEARTBEAT_ACTIVE
          : WorkActivityEventType.HEARTBEAT_IDLE,
      durationSeconds: dto.observedSeconds,
    });
  }

  async captureForTimeLog(log: TimeLog): Promise<void> {
    try {
      const [git, activity, hasOverlap] = await Promise.all([
        this.collectGitEvidence(log),
        this.collectActivityEvidence(log),
        this.hasOverlappingLog(log),
      ]);
      const timerScore =
        log.entryType === TimeEntryType.TIMER
          ? this.ratioScore(activity.activeMinutes, log.durationMinutes)
          : 0;
      const taskScore =
        activity.taskActivityCount >= 3
          ? 100
          : activity.taskActivityCount === 2
            ? 70
            : activity.taskActivityCount === 1
              ? 40
              : 0;
      const manualScore =
        log.entryType === TimeEntryType.MANUAL
          ? Math.min(
              100,
              (log.manualEntryReason?.trim().length ?? 0) >= 40 ? 100 : 40,
            )
          : 100;
      const consistencyWarnings: string[] = [];
      let consistencyScore = 100;
      if (hasOverlap) {
        consistencyScore -= 60;
        consistencyWarnings.push(
          'This entry overlaps another time log for the same user.',
        );
      }
      if (log.durationMinutes > 720) {
        consistencyScore -= 30;
        consistencyWarnings.push('This work session exceeds 12 hours.');
      }
      if (activity.idleMinutes > log.durationMinutes * 0.3) {
        consistencyScore -= 25;
        consistencyWarnings.push(
          'More than 30% of the timer session was observed as idle.',
        );
      }
      consistencyScore = Math.max(0, consistencyScore);

      const providers = [
        {
          provider: EvidenceProvider.TIMER,
          score: timerScore,
          weight: 35,
          supportedMinutes: activity.activeMinutes,
          status:
            log.entryType === TimeEntryType.TIMER ? 'READY' : 'NOT_APPLICABLE',
          details: {
            activeMinutes: activity.activeMinutes,
            idleMinutes: activity.idleMinutes,
          },
          warnings:
            activity.idleMinutes > 0
              ? [`${activity.idleMinutes} minutes were observed as idle.`]
              : [],
        },
        {
          provider: EvidenceProvider.GITHUB,
          score: this.ratioScore(
            git.result.gitEstimatedMinutes,
            log.durationMinutes,
          ),
          weight: 30,
          supportedMinutes: git.result.gitEstimatedMinutes,
          status: git.status,
          details: {
            commitCount: git.result.commitCount,
            gitWindowMinutes: git.result.gitWindowMinutes,
            filesChanged: git.result.filesChanged,
            additions: git.result.additions,
            deletions: git.result.deletions,
          },
          warnings: git.result.warnings,
        },
        {
          provider: EvidenceProvider.TASK_ACTIVITY,
          score: taskScore,
          weight: 20,
          supportedMinutes: 0,
          status: 'READY',
          details: { activityCount: activity.taskActivityCount },
          warnings:
            taskScore === 0
              ? ['No task activity was recorded during the work window.']
              : [],
        },
        {
          provider: EvidenceProvider.MANUAL_ENTRY,
          score: manualScore,
          weight: 5,
          supportedMinutes: 0,
          status:
            log.entryType === TimeEntryType.MANUAL
              ? 'READY'
              : 'NOT_APPLICABLE',
          details: {
            explanationLength: log.manualEntryReason?.trim().length ?? 0,
          },
          warnings:
            log.entryType === TimeEntryType.MANUAL && manualScore < 100
              ? ['The manual-entry explanation is too short.']
              : [],
        },
        {
          provider: EvidenceProvider.CONSISTENCY,
          score: consistencyScore,
          weight: 10,
          supportedMinutes: 0,
          status: 'READY',
          details: { hasOverlap },
          warnings: consistencyWarnings,
        },
      ];
      const { overallScore, confidence, recommendation } =
        calculateCompositeEvidenceScore(providers);
      const warnings = Array.from(
        new Set(providers.flatMap((provider) => provider.warnings)),
      );

      await this.persistProviderResults(log.id, providers);
      await this.saveAssessment(log, {
        provider: 'COMPOSITE',
        status: EvidenceStatus.READY,
        ...git.result,
        confidence,
        overallScore,
        activeMinutes: activity.activeMinutes,
        idleMinutes: activity.idleMinutes,
        taskActivityCount: activity.taskActivityCount,
        hasOverlap,
        recommendation,
        warnings,
      });
    } catch (error) {
      this.logger.error(
        `Composite evidence capture failed for time log ${log.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.saveUnavailable(
        log,
        error instanceof Error
          ? `Work evidence could not be collected: ${error.message}`
          : 'Work evidence could not be collected.',
      );
    }
  }

  private async collectGitEvidence(log: TimeLog) {
    const unavailable = (warning: string) => ({
      status: 'UNAVAILABLE',
      result: this.emptyGitResult(warning),
    });
    try {
      const [mapping, identity] = await Promise.all([
        this.projectRepositories.findOne({
          where: { projectId: log.projectId, isActive: true },
        }),
        this.identities.findOne({
          where: { userId: log.userId, isActive: true },
        }),
      ]);
      if (!mapping) {
        return unavailable('No Git repository is mapped to this project.');
      }
      if (!identity?.username && !identity?.email) {
        return unavailable('No Git identity is mapped to this user.');
      }
      const integration = await this.integrations.findOne({
        where: { id: mapping.integrationId, isActive: true },
      });
      if (!integration) {
        return unavailable('The configured Git integration is inactive.');
      }
      const token = process.env[integration.tokenEnvKey];
      if (!token) {
        return unavailable(
          `Server environment variable ${integration.tokenEnvKey} is not configured.`,
        );
      }

      const octokit = new Octokit({
        auth: token,
        ...(integration.apiBaseUrl
          ? { baseUrl: integration.apiBaseUrl }
          : {}),
      });
      const listed = await octokit.repos.listCommits({
        owner: mapping.owner,
        repo: mapping.repository,
        author: identity.username ?? undefined,
        sha: mapping.defaultBranch ?? undefined,
        since: log.startedAt.toISOString(),
        until: log.endedAt?.toISOString() ?? new Date().toISOString(),
        per_page: 100,
      });
      const matching = listed.data.filter((commit) => {
        if (!identity.email) return true;
        return (
          commit.commit.author?.email?.toLowerCase() === identity.email ||
          commit.commit.committer?.email?.toLowerCase() === identity.email
        );
      });
      const details = await Promise.all(
        matching.map((commit) =>
          octokit.repos.getCommit({
            owner: mapping.owner,
            repo: mapping.repository,
            ref: commit.sha,
          }),
        ),
      );
      const commits: CommitEvidenceInput[] = details
        .map(({ data }) => ({
          sha: data.sha,
          committedAt: new Date(
            data.commit.author?.date ?? data.commit.committer?.date ?? 0,
          ),
          message: data.commit.message,
          url: data.html_url ?? null,
          filesChanged: data.files?.length ?? 0,
          additions: data.stats?.additions ?? 0,
          deletions: data.stats?.deletions ?? 0,
        }))
        .filter((commit) => !Number.isNaN(commit.committedAt.getTime()));

      await this.persistActivities(
        integration.id,
        mapping.projectId,
        log.userId,
        identity,
        commits,
      );
      const result = this.calculator.calculate(log.durationMinutes, commits);
      return { status: 'READY', result };
    } catch (error) {
      this.logger.error(
        `Git evidence capture failed for time log ${log.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      return unavailable(
        error instanceof Error
          ? `GitHub evidence could not be collected: ${error.message}`
          : 'GitHub evidence could not be collected.',
      );
    }
  }

  private async collectActivityEvidence(log: TimeLog) {
    const events = await this.activityEvents
      .createQueryBuilder('event')
      .where(
        '(event."timeLogId" = :timeLogId OR (event."taskId" = :taskId AND event."userId" = :userId))',
        { timeLogId: log.id, taskId: log.taskId, userId: log.userId },
      )
      .andWhere('event."occurredAt" BETWEEN :startedAt AND :endedAt', {
        startedAt: log.startedAt,
        endedAt: log.endedAt ?? new Date(),
      })
      .getMany();
    const activeSeconds = events
      .filter((event) => event.type === WorkActivityEventType.HEARTBEAT_ACTIVE)
      .reduce((sum, event) => sum + event.durationSeconds, 0);
    const idleSeconds = events
      .filter((event) => event.type === WorkActivityEventType.HEARTBEAT_IDLE)
      .reduce((sum, event) => sum + event.durationSeconds, 0);
    const taskTypes = new Set([
      WorkActivityEventType.TASK_CREATED,
      WorkActivityEventType.TASK_UPDATED,
      WorkActivityEventType.TASK_STATUS_CHANGED,
      WorkActivityEventType.TASK_ASSIGNED,
      WorkActivityEventType.SUBTASK_CREATED,
      WorkActivityEventType.COMMENT_ADDED,
    ]);
    return {
      activeMinutes: Math.min(
        log.durationMinutes,
        Math.round(activeSeconds / 60),
      ),
      idleMinutes: Math.min(log.durationMinutes, Math.round(idleSeconds / 60)),
      taskActivityCount: events.filter((event) => taskTypes.has(event.type))
        .length,
    };
  }

  private async hasOverlappingLog(log: TimeLog): Promise<boolean> {
    if (!log.endedAt) return false;
    const rows = await this.assessments.manager.query(
      `SELECT 1
       FROM task_time_logs other
       WHERE other."userId" = $1
         AND other.id <> $2
         AND other."deletedAt" IS NULL
         AND other."startedAt" < $4
         AND COALESCE(other."endedAt", now()) > $3
       LIMIT 1`,
      [log.userId, log.id, log.startedAt, log.endedAt],
    );
    return rows.length > 0;
  }

  private async persistProviderResults(
    timeLogId: string,
    providers: Array<{
      provider: EvidenceProvider;
      score: number;
      weight: number;
      supportedMinutes: number;
      status: string;
      details: Record<string, unknown>;
      warnings: string[];
    }>,
  ) {
    await this.providerResults.upsert(
      providers.map((provider) => ({ timeLogId, ...provider })) as any,
      ['timeLogId', 'provider'],
    );
  }

  private ratioScore(supported: number, logged: number): number {
    if (logged <= 0) return 0;
    return Math.min(100, Math.round((supported / logged) * 100));
  }

  private emptyGitResult(warning: string) {
    return {
      confidence: EvidenceConfidence.UNAVAILABLE,
      gitWindowMinutes: 0,
      gitEstimatedMinutes: 0,
      commitCount: 0,
      firstCommitAt: null,
      lastCommitAt: null,
      largestGapMinutes: 0,
      filesChanged: 0,
      additions: 0,
      deletions: 0,
      warnings: [warning],
      commits: [],
    };
  }

  private async persistActivities(
    integrationId: string,
    projectId: string,
    userId: string,
    identity: UserGitIdentityEntity,
    commits: CommitEvidenceInput[],
  ) {
    if (!commits.length) return;
    await this.activities.upsert(
      commits.map((commit) => ({
        integrationId,
        projectId,
        userId,
        sha: commit.sha,
        authorEmail: identity.email,
        authorName: identity.username,
        committedAt: commit.committedAt,
        message: commit.message,
        url: commit.url,
        filesChanged: commit.filesChanged,
        additions: commit.additions,
        deletions: commit.deletions,
        raw: null,
      })),
      ['integrationId', 'sha'],
    );
  }

  private async saveUnavailable(log: TimeLog, warning: string) {
    await this.saveAssessment(log, {
      provider: 'COMPOSITE',
      status: EvidenceStatus.UNAVAILABLE,
      ...this.emptyGitResult(warning),
      overallScore: 0,
      activeMinutes: 0,
      idleMinutes: 0,
      taskActivityCount: 0,
      hasOverlap: false,
      recommendation: 'MANUAL_REVIEW',
    });
  }

  private async saveAssessment(
    log: TimeLog,
    data: Omit<
      TimeLogEvidenceAssessmentEntity,
      'id' | 'timeLogId' | 'loggedMinutes' | 'assessedAt' | 'createdAt' | 'updatedAt'
    >,
  ) {
    await this.assessments.upsert(
      {
        timeLogId: log.id,
        loggedMinutes: log.durationMinutes,
        assessedAt: new Date(),
        ...data,
      },
      ['timeLogId'],
    );
  }
}
