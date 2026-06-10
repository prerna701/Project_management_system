import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createResponse } from '../common/utils/base-response';
import { ConfigureProjectRepositoryDto } from './dto/configure-project-repository.dto';
import { ConfigureUserGitIdentityDto } from './dto/configure-user-git-identity.dto';
import { CreateGitIntegrationDto } from './dto/create-git-integration.dto';
import { WorkEvidenceService } from './work-evidence.service';

@ApiTags('Work Evidence')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'work-evidence', version: '1' })
export class WorkEvidenceController {
  constructor(private readonly service: WorkEvidenceService) {}

  @Get('integrations')
  @SetMetadata('abilities', [['browse', 'integrations']])
  async integrations() {
    return createResponse(
      'Git integrations fetched successfully',
      await this.service.listIntegrations(),
    );
  }

  @Post('integrations')
  @SetMetadata('abilities', [['add', 'integrations']])
  async createIntegration(@Body() dto: CreateGitIntegrationDto) {
    return createResponse(
      'Git integration created successfully',
      await this.service.createIntegration(dto),
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
}
