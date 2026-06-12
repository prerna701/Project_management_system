import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvidenceReportQueryDto } from './dto/evidence-report-query.dto';
import { UpdateGitIntegrationDto } from './dto/update-integration.dto';
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

  // ─── Octokit Helpers ────────────────────────────────────────────────────────

  /** Build an Octokit instance from an already-loaded integration entity. */
  private buildOctokit(integration: GitIntegrationEntity): Octokit {
    return new Octokit({
      auth: process.env[integration.tokenEnvKey],
      ...(integration.apiBaseUrl ? { baseUrl: integration.apiBaseUrl } : {}),
    });
  }

  /**
   * Load the integration by id, assert the env-var token exists,
   * and return a ready-to-use Octokit together with the entity.
   */
  private async resolveOctokit(integrationId: string) {
    const integration = await this.integrations.findOne({
      where: { id: integrationId },
    });
    if (!integration)
      throw new NotFoundException(`Integration #${integrationId} not found`);
    if (!process.env[integration.tokenEnvKey])
      throw new NotFoundException(
        `Environment variable "${integration.tokenEnvKey}" is not set on the server. ` +
          `Add it to your .env file and restart.`,
      );
    return { octokit: this.buildOctokit(integration), integration };
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

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
        branchName: git.branchName,
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
      branchName: null as string | null,
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
      if (!process.env[integration.tokenEnvKey]) {
        return unavailable(
          `Server environment variable ${integration.tokenEnvKey} is not configured.`,
        );
      }
      const octokit = this.buildOctokit(integration);
      const resolvedBranch = log.branchName ?? mapping.defaultBranch ?? undefined;
      const listed = await octokit.repos.listCommits({
        owner: mapping.owner,
        repo: mapping.repository,
        author: identity.username ?? undefined,
        sha: resolvedBranch,
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
      return { status: 'READY', result, branchName: resolvedBranch ?? null };
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
      branchName: log.branchName ?? null,
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

  // ─── Integration Management ─────────────────────────────────────────────

  async updateIntegration(id: string, dto: UpdateGitIntegrationDto) {
    const existing = await this.integrations.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Integration #${id} not found`);
    return this.integrations.save({ ...existing, ...dto });
  }

  async deleteIntegration(id: string): Promise<void> {
    const existing = await this.integrations.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Integration #${id} not found`);
    await this.integrations.remove(existing);
  }

  // ─── Self-service Identity ───────────────────────────────────────────────

  async getMyIdentity(userId: string) {
    return this.identities.findOne({ where: { userId } }) ?? null;
  }

  // ─── Project Repository Getter ───────────────────────────────────────────

  async getProjectRepository(projectId: string) {
    return this.projectRepositories.findOne({ where: { projectId } }) ?? null;
  }

  // ─── Repository / Branch Browser ─────────────────────────────────────────

  async listReposForIntegration(integrationId: string) {
    const { octokit } = await this.resolveOctokit(integrationId);
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });
    return data.map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
      private: repo.private,
      url: repo.html_url,
      updatedAt: repo.updated_at,
    }));
  }

  async listBranchesForRepo(
    integrationId: string,
    owner: string,
    repo: string,
  ) {
    const { octokit } = await this.resolveOctokit(integrationId);
    const { data } = await octokit.repos.listBranches({ owner, repo, per_page: 100 });
    return data.map((branch) => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected,
    }));
  }

  async listCommitsForRepo(
    integrationId: string,
    owner: string,
    repo: string,
    options: {
      branch?: string;
      limit?: number;
      page?: number;
      since?: string;
      until?: string;
      author?: string;
    },
  ) {
    const { octokit } = await this.resolveOctokit(integrationId);
    const perPage = Math.min(Math.max(options.limit ?? 30, 1), 100);
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: options.branch || undefined,
      since: options.since || undefined,
      until: options.until || undefined,
      author: options.author || undefined,
      per_page: perPage,
      page: options.page ?? 1,
    });
    return data.map((commit) => ({
      sha: commit.sha,
      shortSha: commit.sha.slice(0, 7),
      message: commit.commit.message.split('\n')[0],
      author: commit.commit.author?.name ?? commit.author?.login ?? 'Unknown',
      authorEmail: commit.commit.author?.email ?? null,
      authorAvatar: commit.author?.avatar_url ?? null,
      committedAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? null,
      url: commit.html_url,
    }));
  }

  // ─── PR Browser ──────────────────────────────────────────────────────────

  async listPrsForProject(projectId: string, branchName: string) {
    const mapping = await this.projectRepositories.findOne({
      where: { projectId, isActive: true },
    });
    if (!mapping) {
      throw new NotFoundException(
        `No Git repository is mapped to project ${projectId}.`,
      );
    }
    const integration = await this.integrations.findOne({
      where: { id: mapping.integrationId, isActive: true },
    });
    if (!integration) {
      throw new NotFoundException('The configured Git integration is inactive.');
    }
    if (!process.env[integration.tokenEnvKey]) {
      throw new NotFoundException(
        `Environment variable "${integration.tokenEnvKey}" is not set on the server.`,
      );
    }
    const octokit = this.buildOctokit(integration);
    const { data } = await octokit.pulls.list({
      owner: mapping.owner,
      repo: mapping.repository,
      state: 'all',
      head: `${mapping.owner}:${branchName}`,
      per_page: 10,
    });
    return data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state as 'open' | 'closed',
      merged: pr.merged_at !== null,
      mergedAt: pr.merged_at ?? null,
      createdAt: pr.created_at,
      url: pr.html_url,
      author: pr.user?.login ?? null,
      authorAvatar: pr.user?.avatar_url ?? null,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
    }));
  }

  // ─── Evidence Report ─────────────────────────────────────────────────────

  async getEvidenceReport(query: EvidenceReportQueryDto) {
    const qb = this.assessments.manager
      .createQueryBuilder()
      .select([
        'a."timeLogId"',
        'a."overallScore"',
        'a."confidence"',
        'a."recommendation"',
        'a."loggedMinutes"',
        'a."gitEstimatedMinutes"',
        'a."commitCount"',
        'a."activeMinutes"',
        'a."idleMinutes"',
        'a."hasOverlap"',
        'a."warnings"',
        'a."firstCommitAt"',
        'a."lastCommitAt"',
        'a."filesChanged"',
        'a."additions"',
        'a."deletions"',
        'a."assessedAt"',
        'tl."userId"',
        'tl."projectId"',
        'tl."taskId"',
        'tl."startedAt"',
        'tl."endedAt"',
        'tl."status"',
        'tl."entryType"',
        'u."firstName"',
        'u."lastName"',
        'u."email" AS "userEmail"',
        'p.name AS "projectName"',
        't.title AS "taskTitle"',
      ])
      .from('time_log_evidence_assessments', 'a')
      .innerJoin('task_time_logs', 'tl', 'tl.id = a."timeLogId"')
      .leftJoin('users', 'u', 'u.id = tl."userId"')
      .leftJoin('projects', 'p', 'p.id = tl."projectId"')
      .leftJoin('tasks', 't', 't.id = tl."taskId"')
      .where('tl."deletedAt" IS NULL');

    if (query.projectId) {
      qb.andWhere('tl."projectId" = :projectId', {
        projectId: query.projectId,
      });
    }
    if (query.userId) {
      qb.andWhere('tl."userId" = :userId', { userId: query.userId });
    }
    if (query.from) {
      qb.andWhere('tl."startedAt" >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('tl."startedAt" <= :to', { to: new Date(query.to) });
    }

    qb.orderBy('a."assessedAt"', 'DESC').limit(500);

    const rows = await qb.getRawMany();

    const totals = {
      totalLogs: rows.length,
      totalLoggedMinutes: rows.reduce((s, r) => s + (r.loggedMinutes ?? 0), 0),
      totalGitMinutes: rows.reduce(
        (s, r) => s + (r.gitEstimatedMinutes ?? 0),
        0,
      ),
      totalCommits: rows.reduce((s, r) => s + (r.commitCount ?? 0), 0),
      totalFilesChanged: rows.reduce((s, r) => s + (r.filesChanged ?? 0), 0),
      totalAdditions: rows.reduce((s, r) => s + (r.additions ?? 0), 0),
      totalDeletions: rows.reduce((s, r) => s + (r.deletions ?? 0), 0),
      highConfidence: rows.filter((r) => r.confidence === 'HIGH').length,
      mediumConfidence: rows.filter((r) => r.confidence === 'MEDIUM').length,
      redFlag: rows.filter((r) => r.confidence === 'LOW_RED_FLAG').length,
      unavailable: rows.filter((r) => r.confidence === 'UNAVAILABLE').length,
      averageScore:
        rows.length > 0
          ? Math.round(
              rows.reduce((s, r) => s + (r.overallScore ?? 0), 0) / rows.length,
            )
          : 0,
    };

    const byUser = this.groupBy(rows, (r) => r.userId, (group) => ({
      userId: group[0].userId,
      name: `${group[0].firstName ?? ''} ${group[0].lastName ?? ''}`.trim() || group[0].userEmail,
      logCount: group.length,
      loggedMinutes: group.reduce((s, r) => s + (r.loggedMinutes ?? 0), 0),
      gitMinutes: group.reduce((s, r) => s + (r.gitEstimatedMinutes ?? 0), 0),
      commits: group.reduce((s, r) => s + (r.commitCount ?? 0), 0),
      averageScore:
        group.length > 0
          ? Math.round(
              group.reduce((s, r) => s + (r.overallScore ?? 0), 0) /
                group.length,
            )
          : 0,
      highConfidence: group.filter((r) => r.confidence === 'HIGH').length,
      redFlag: group.filter((r) => r.confidence === 'LOW_RED_FLAG').length,
    }));

    const byProject = this.groupBy(
      rows,
      (r) => r.projectId,
      (group) => ({
        projectId: group[0].projectId,
        projectName: group[0].projectName ?? group[0].projectId,
        logCount: group.length,
        loggedMinutes: group.reduce((s, r) => s + (r.loggedMinutes ?? 0), 0),
        gitMinutes: group.reduce(
          (s, r) => s + (r.gitEstimatedMinutes ?? 0),
          0,
        ),
        commits: group.reduce((s, r) => s + (r.commitCount ?? 0), 0),
        averageScore:
          group.length > 0
            ? Math.round(
                group.reduce((s, r) => s + (r.overallScore ?? 0), 0) /
                  group.length,
              )
            : 0,
        highConfidence: group.filter((r) => r.confidence === 'HIGH').length,
        redFlag: group.filter((r) => r.confidence === 'LOW_RED_FLAG').length,
      }),
    );

    return {
      totals,
      byUser,
      byProject,
      logs: rows.map((r) => ({
        timeLogId: r.timeLogId,
        userId: r.userId,
        userName:
          `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || r.userEmail,
        projectId: r.projectId,
        projectName: r.projectName,
        taskId: r.taskId,
        taskTitle: r.taskTitle,
        startedAt: r.startedAt,
        endedAt: r.endedAt,
        status: r.status,
        entryType: r.entryType,
        loggedMinutes: r.loggedMinutes,
        gitEstimatedMinutes: r.gitEstimatedMinutes,
        commitCount: r.commitCount,
        filesChanged: r.filesChanged,
        additions: r.additions,
        deletions: r.deletions,
        activeMinutes: r.activeMinutes,
        idleMinutes: r.idleMinutes,
        overallScore: r.overallScore,
        confidence: r.confidence,
        recommendation: r.recommendation,
        hasOverlap: r.hasOverlap,
        warnings: r.warnings,
        firstCommitAt: r.firstCommitAt,
        lastCommitAt: r.lastCommitAt,
        assessedAt: r.assessedAt,
      })),
    };
  }

  private groupBy<T, K>(
    items: T[],
    keyFn: (item: T) => K,
    mapFn: (group: T[]) => unknown,
  ): unknown[] {
    const map = new Map<K, T[]>();
    for (const item of items) {
      const key = keyFn(item);
      const group = map.get(key) ?? [];
      group.push(item);
      map.set(key, group);
    }
    return Array.from(map.values()).map(mapFn);
  }
}
