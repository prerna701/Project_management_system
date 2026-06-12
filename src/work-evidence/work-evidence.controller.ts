import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { createResponse } from '../common/utils/base-response';
import { ConfigureProjectRepositoryDto } from './dto/configure-project-repository.dto';
import { ConfigureUserGitIdentityDto } from './dto/configure-user-git-identity.dto';
import { CreateGitIntegrationDto } from './dto/create-git-integration.dto';
import { EvidenceReportQueryDto } from './dto/evidence-report-query.dto';
import { UpdateGitIntegrationDto } from './dto/update-integration.dto';
import { WorkEvidenceService } from './work-evidence.service';

@ApiTags('Work Evidence')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'work-evidence', version: '1' })
export class WorkEvidenceController {
  constructor(private readonly service: WorkEvidenceService) {}

  // ─── Git Integrations ────────────────────────────────────────────────────────

  @Get('integrations')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async listIntegrations() {
    return createResponse(
      'Git integrations fetched successfully',
      await this.service.listIntegrations(),
    );
  }

  @Post('integrations')
  @SetMetadata('abilities', [['add', 'integrations']])
  @HttpCode(HttpStatus.CREATED)
  async createIntegration(@Body() dto: CreateGitIntegrationDto) {
    return createResponse(
      'Git integration created successfully',
      await this.service.createIntegration(dto),
    );
  }

  @Patch('integrations/:id')
  @SetMetadata('abilities', [['edit', 'integrations']])
  async updateIntegration(
    @Param('id') id: string,
    @Body() dto: UpdateGitIntegrationDto,
  ) {
    return createResponse(
      'Git integration updated successfully',
      await this.service.updateIntegration(id, dto),
    );
  }

  @Delete('integrations/:id')
  @SetMetadata('abilities', [['delete', 'integrations']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIntegration(@Param('id') id: string) {
    await this.service.deleteIntegration(id);
  }

  // ─── Repository Browser (requires integration with a valid token) ─────────

  @Get('integrations/:id/repos')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async listRepos(@Param('id') id: string) {
    return createResponse(
      'Repositories fetched successfully',
      await this.service.listReposForIntegration(id),
    );
  }

  @Get('integrations/:id/repos/:owner/:repo/branches')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async listBranches(
    @Param('id') id: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return createResponse(
      'Branches fetched successfully',
      await this.service.listBranchesForRepo(id, owner, repo),
    );
  }

  @Get('integrations/:id/repos/:owner/:repo/commits')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async listCommits(
    @Param('id') id: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('author') author?: string,
    @Query('since') since?: string,
    @Query('until') until?: string,
  ) {
    return createResponse(
      'Commits fetched successfully',
      await this.service.listCommitsForRepo(id, owner, repo, {
        branch,
        limit: limit ? parseInt(limit, 10) : 30,
        page: page ? parseInt(page, 10) : 1,
        author,
        since,
        until,
      }),
    );
  }

  // ─── Project Repository Mapping ───────────────────────────────────────────

  @Get('projects/:projectId/repository')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async getProjectRepository(@Param('projectId') projectId: string) {
    return createResponse(
      'Project repository fetched successfully',
      await this.service.getProjectRepository(projectId),
    );
  }

  @Put('projects/:projectId/repository')
  @SetMetadata('abilities', [['edit', 'integrations']])
  async configureProject(
    @Param('projectId') projectId: string,
    @Body() dto: ConfigureProjectRepositoryDto,
  ) {
    return createResponse(
      'Project repository configured successfully',
      await this.service.configureProjectRepository(projectId, dto),
    );
  }

  @Get('projects/:projectId/prs')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async listPrs(
    @Param('projectId') projectId: string,
    @Query('branch') branch: string,
  ) {
    return createResponse(
      'Pull requests fetched successfully',
      await this.service.listPrsForProject(projectId, branch),
    );
  }

  // ─── User Git Identity (admin) ────────────────────────────────────────────

  @Put('users/:userId/identity')
  @SetMetadata('abilities', [['edit', 'integrations']])
  async configureIdentity(
    @Param('userId') userId: string,
    @Body() dto: ConfigureUserGitIdentityDto,
  ) {
    return createResponse(
      'Git identity configured successfully',
      await this.service.configureUserIdentity(userId, dto),
    );
  }

  // ─── User Git Identity (self-service) ────────────────────────────────────

  @Get('users/me/git-identity')
  @SetMetadata('abilities', [])
  async getMyGitIdentity(@CurrentUser() user: JwtPayloadType) {
    return createResponse(
      'Your git identity fetched successfully',
      await this.service.getMyIdentity(user.id),
    );
  }

  @Put('users/me/git-identity')
  @SetMetadata('abilities', [])
  async updateMyGitIdentity(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: ConfigureUserGitIdentityDto,
  ) {
    return createResponse(
      'Your git identity updated successfully',
      await this.service.configureUserIdentity(user.id, dto),
    );
  }

  // ─── Evidence Report ─────────────────────────────────────────────────────

  @Get('reports/evidence')
  @SetMetadata('abilities', [['reports', 'timesheets']])
  async evidenceReport(@Query() query: EvidenceReportQueryDto) {
    return createResponse(
      'Evidence report fetched successfully',
      await this.service.getEvidenceReport(query),
    );
  }
}
